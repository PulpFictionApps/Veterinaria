import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prisma.js';

const DEFAULT_SCOPES = process.env.GOOGLE_CALENDAR_SCOPES?.split(/[\s,]+/).filter(Boolean) ?? [
  'https://www.googleapis.com/auth/calendar.events'
];
const DEFAULT_TIMEZONE = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Santiago';
const FRONTEND_URL = (process.env.FRONTEND_URL || process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
const PUBLIC_BACKEND_URL = (process.env.API_BASE_URL || process.env.BACKEND_PUBLIC_URL || process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${PUBLIC_BACKEND_URL}/google-calendar/callback`;
const STATE_SECRET = process.env.GOOGLE_OAUTH_STATE_SECRET || process.env.JWT_SECRET || 'calendar-state-secret';
const TOKEN_REFRESH_THRESHOLD_MS = 60_000; // 1 minuto antes de expirar

function assertGoogleCredentials() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google Calendar credentials missing. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars.');
  }
}

function createOAuthClient() {
  assertGoogleCredentials();
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

function signState(payload) {
  return jwt.sign(payload, STATE_SECRET, { expiresIn: '10m' });
}

function verifyState(token) {
  return jwt.verify(token, STATE_SECRET);
}

export function generateGoogleAuthUrl(userId, redirectPath) {
  const client = createOAuthClient();
  const stateToken = signState({ userId, redirectPath });
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: DEFAULT_SCOPES,
    state: stateToken
  });
}

export async function handleOAuthCallback({ code, state }) {
  if (!code) throw new Error('Missing authorization code');
  if (!state) throw new Error('Missing OAuth state');

  const decoded = verifyState(state);
  const { userId, redirectPath } = decoded;
  const client = createOAuthClient();

  const existingCredential = await getCredential(userId).catch(() => null);
  const { tokens } = await client.getToken(code);
  const { isNewConnection } = await storeTokensForUser(userId, tokens, existingCredential || undefined);

  if (isNewConnection || !existingCredential?.lastSyncedAt) {
    queueMicrotask(() => {
      resyncGoogleCalendar(userId, { days: 60 }).catch((err) => {
        console.error(`❌ Failed to run initial Google Calendar sync for user ${userId}:`, err?.message || err);
      });
    });
  }

  return {
    userId,
    redirectPath: redirectPath || '/dashboard/settings?google=connected'
  };
}

async function storeTokensForUser(userId, tokens, existingCredential) {
  if (!tokens.access_token) {
    throw new Error('Google OAuth did not return an access token');
  }

  const existing = existingCredential ?? await getCredential(userId);

  const data = {
    accessToken: tokens.access_token,
    scope: tokens.scope || DEFAULT_SCOPES.join(' '),
    tokenType: tokens.token_type || 'Bearer',
    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null
  };

  if (tokens.refresh_token) {
    data.refreshToken = tokens.refresh_token;
  } else if (existing?.refreshToken) {
    data.refreshToken = existing.refreshToken;
  }

  if (!data.refreshToken) {
    throw new Error('Google OAuth did not return a refresh token. Ensure the Google consent screen was granted with offline access.');
  }

  await prisma.googleCalendarCredential.upsert({
    where: { userId },
    update: {
      ...data,
      syncEnabled: true
    },
    create: {
      userId,
      refreshToken: data.refreshToken,
      ...data
    }
  });

  return { isNewConnection: !existing };
}

async function getCredential(userId) {
  return prisma.googleCalendarCredential.findUnique({ where: { userId } });
}

async function ensureAuthorizedClient(userId) {
  const credential = await getCredential(userId);
  if (!credential || !credential.syncEnabled) {
    return { client: null, credential: null };
  }

  const client = createOAuthClient();
  client.setCredentials({
    access_token: credential.accessToken,
    refresh_token: credential.refreshToken,
    scope: credential.scope,
    token_type: credential.tokenType,
    expiry_date: credential.expiryDate ? credential.expiryDate.getTime() : undefined
  });

  const needsRefresh = !credential.expiryDate || credential.expiryDate.getTime() <= Date.now() + TOKEN_REFRESH_THRESHOLD_MS || !credential.accessToken;
  if (needsRefresh) {
    try {
      const { credentials: refreshed } = await client.refreshAccessToken();
      await storeTokensForUser(userId, refreshed, credential);
      client.setCredentials({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token || credential.refreshToken,
        scope: refreshed.scope || credential.scope,
        token_type: refreshed.token_type || credential.tokenType,
        expiry_date: refreshed.expiry_date
      });
    } catch (err) {
      console.error('❌ Failed to refresh Google token:', err.message);
    }
  }

  return { client, credential }; 
}

function buildEventPayload(appointment, options = {}) {
  const { calendarTimeZone = DEFAULT_TIMEZONE } = options;
  const { pet, tutor, consultationType, user } = appointment;

  const startDate = new Date(appointment.date);
  const durationMinutes = consultationType?.duration || 15;
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  const professionalName = user?.fullName || user?.clinicName || 'Profesional veterinario';
  const professionalLabel = user?.professionalTitle
    ? `${user.professionalTitle} ${professionalName}`
    : professionalName;
  const location = user?.clinicAddress || user?.clinicName || undefined;
  const summary = consultationType?.name
    ? `${consultationType.name} - ${pet?.name || 'Mascota'}`
    : `Cita veterinaria - ${pet?.name || 'Mascota'}`;

  const descriptionLines = [
    `Profesional: ${professionalLabel}`,
    location ? `Ubicación: ${location}` : null,
    appointment.reason ? `Motivo: ${appointment.reason}` : null,
    pet?.type ? `Mascota: ${pet.type}${pet.breed ? ` (${pet.breed})` : ''}` : null,
    tutor?.name ? `Tutor: ${tutor.name}` : null,
    tutor?.phone ? `Teléfono: ${tutor.phone}` : null,
    tutor?.email ? `Email: ${tutor.email}` : null,
    user?.contactPhone || user?.phone ? `Contacto clínica: ${user.contactPhone || user.phone}` : null,
    user?.contactEmail ? `Email clínica: ${user.contactEmail}` : null
  ].filter(Boolean);

  const attendees = [];
  if (tutor?.email) {
    attendees.push({
      email: tutor.email,
      displayName: tutor.name || tutor.email,
      responseStatus: 'needsAction'
    });
  }

  const privateExtendedProps = {
    appointmentId: String(appointment.id),
    userId: appointment.userId ? String(appointment.userId) : undefined,
    petId: appointment.petId ? String(appointment.petId) : undefined,
    tutorId: appointment.tutorId ? String(appointment.tutorId) : undefined,
    consultationTypeId: appointment.consultationTypeId ? String(appointment.consultationTypeId) : undefined
  };

  Object.keys(privateExtendedProps).forEach((key) => {
    if (privateExtendedProps[key] === undefined) {
      delete privateExtendedProps[key];
    }
  });

  const appointmentUrl = `${FRONTEND_URL}/dashboard/appointments/${appointment.id}`;

  const payload = {
    summary,
    description: descriptionLines.join('\n'),
    location,
    start: {
      dateTime: startDate.toISOString(),
      timeZone: calendarTimeZone
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone: calendarTimeZone
    },
    status: appointment.status === 'cancelled' ? 'cancelled' : 'confirmed',
    attendees: attendees.length ? attendees : undefined,
    reminders: {
      useDefault: true
    },
    guestsCanInviteOthers: false,
    guestsCanModify: false,
    guestsCanSeeOtherGuests: true,
    source: {
      title: 'MyVetAgenda',
      url: appointmentUrl
    },
    transparency: 'opaque'
  };

  if (!location) {
    delete payload.location;
  }

  if (!attendees.length) {
    delete payload.attendees;
  }

  if (Object.keys(privateExtendedProps).length > 0) {
    payload.extendedProperties = {
      private: privateExtendedProps
    };
  }

  return payload;
}

async function fetchAppointmentWithRelations(appointmentId) {
  return prisma.appointment.findUnique({
    where: { id: Number(appointmentId) },
    include: {
      pet: true,
      tutor: true,
      consultationType: true,
      user: {
        select: {
          id: true,
          fullName: true,
          clinicName: true,
          clinicAddress: true,
          contactEmail: true,
          contactPhone: true,
          email: true,
          phone: true,
          professionalTitle: true,
          googleCalendarCredential: true
        }
      }
    }
  });
}

export async function syncAppointmentToGoogle(appointmentId) {
  try {
    const appointment = await fetchAppointmentWithRelations(appointmentId);
    if (!appointment) return { status: 'not_found' };

    const { client, credential } = await ensureAuthorizedClient(appointment.userId);
    if (!client || !credential) {
      return { status: 'skipped', reason: 'not_connected' };
    }

    const calendar = google.calendar({ version: 'v3', auth: client });
    const calendarId = credential.calendarId || 'primary';
    const payload = buildEventPayload(appointment);

    try {
      if (appointment.googleCalendarEventId) {
        await calendar.events.patch({
          calendarId,
          eventId: appointment.googleCalendarEventId,
          requestBody: payload,
          sendUpdates: 'all'
        });
      } else {
        const { data } = await calendar.events.insert({
          calendarId,
          requestBody: payload,
          sendUpdates: 'all'
        });
        if (data?.id) {
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { googleCalendarEventId: data.id }
          });
        }
      }
    } catch (err) {
      if (appointment.googleCalendarEventId && (err?.code === 404 || err?.code === 410)) {
        const { data } = await calendar.events.insert({
          calendarId,
          requestBody: payload,
          sendUpdates: 'all'
        });
        if (data?.id) {
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { googleCalendarEventId: data.id }
          });
        }
      } else {
        throw err;
      }
    }

    await prisma.googleCalendarCredential.update({
      where: { userId: appointment.userId },
      data: { lastSyncedAt: new Date() }
    });

    return { status: 'synced' };
  } catch (error) {
    console.error('❌ Google Calendar sync failed:', error.message);
    return { status: 'error', error: error.message };
  }
}

export async function deleteGoogleEventForAppointment({ userId, googleCalendarEventId }) {
  if (!googleCalendarEventId) return { status: 'skipped', reason: 'no_event' };
  try {
    const { client, credential } = await ensureAuthorizedClient(userId);
    if (!client || !credential) return { status: 'skipped', reason: 'not_connected' };

    const calendar = google.calendar({ version: 'v3', auth: client });
    await calendar.events.delete({
      calendarId: credential.calendarId || 'primary',
      eventId: googleCalendarEventId,
      sendUpdates: 'all'
    });

    await prisma.googleCalendarCredential.update({
      where: { userId },
      data: { lastSyncedAt: new Date() }
    });

    return { status: 'deleted' };
  } catch (error) {
    if (error?.code === 404 || error?.code === 410) {
      return { status: 'not_found' };
    }
    console.error('❌ Failed to delete Google Calendar event:', error.message);
    return { status: 'error', error: error.message };
  }
}

export async function getGoogleCalendarStatus(userId) {
  const credential = await getCredential(userId);
  if (!credential) {
    return { connected: false };
  }

  const syncedCount = await prisma.appointment.count({
    where: {
      userId,
      googleCalendarEventId: { not: null },
      date: { gte: new Date() }
    }
  });

  return {
    connected: true,
    syncEnabled: credential.syncEnabled,
    calendarId: credential.calendarId || 'primary',
    connectedAt: credential.connectedAt,
    lastSyncedAt: credential.lastSyncedAt,
    upcomingSyncedCount: syncedCount
  };
}

export async function disconnectGoogleCalendar(userId) {
  await prisma.googleCalendarCredential.delete({ where: { userId } }).catch(() => {});
  await prisma.appointment.updateMany({
    where: { userId },
    data: { googleCalendarEventId: null }
  });
  return { status: 'disconnected' };
}

export async function resyncGoogleCalendar(userId, { days = 30 } = {}) {
  const horizon = new Date();
  const limit = new Date(horizon.getTime() + days * 24 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      userId,
      date: {
        gte: horizon,
        lte: limit
      }
    }
  });

  let success = 0;
  for (const appointment of appointments) {
    const result = await syncAppointmentToGoogle(appointment.id);
    if (result.status === 'synced') success += 1;
  }

  if (success > 0 || appointments.length === 0) {
    await prisma.googleCalendarCredential.update({
      where: { userId },
      data: { lastSyncedAt: new Date() }
    }).catch(() => {});
  }

  return { status: 'synced', total: appointments.length, success };
}

export function getGoogleOAuthRedirectUrl(path) {
  const safePath = path?.startsWith('/') ? path : `/${path || ''}`;
  return `${FRONTEND_URL}${safePath}`;
}
