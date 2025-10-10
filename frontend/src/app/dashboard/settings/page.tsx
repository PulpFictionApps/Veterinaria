'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authFetch } from '@/lib/api';
import { useAuthContext } from '@/lib/auth-context';
import { 
  Settings, 
  Mail, 
  Building, 
  User,
  Phone,
  FileText,
  Activity,
  CalendarDays,
  RefreshCw,
  Plug,
  PlugZap
} from 'lucide-react';
import { SlideIn } from '../../../components/ui/Transitions';
import PageHeader from '../../../components/ui/PageHeader';

interface UserSettings {
  id: number;
  email: string;
  fullName?: string;
  appointmentInstructions?: string;
  contactEmail?: string;
  contactPhone?: string;
  clinicName?: string;
  clinicAddress?: string;
  professionalTitle?: string;
  professionalPhone?: string;
}

interface GoogleCalendarStatus {
  connected: boolean;
  syncEnabled?: boolean;
  calendarId?: string;
  connectedAt?: string;
  lastSyncedAt?: string;
  upcomingSyncedCount?: number;
}

export default function SettingsPage() {
  const { userId } = useAuthContext();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarStatus | null>(null);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleActionLoading, setGoogleActionLoading] = useState(false);
  const [googleMessage, setGoogleMessage] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Form states
  const [clinicData, setClinicData] = useState({
    fullName: '',
    clinicName: '',
    clinicAddress: '',
    professionalTitle: '',
    professionalPhone: '',
  });

  const [emailData, setEmailData] = useState({
    appointmentInstructions: 'Llegada: Por favor llega 10-15 minutos antes de tu cita\nDocumentos: Trae la cartilla de vacunación de tu mascota\nAyuno: Si es necesario, te contactaremos para indicar ayuno\nCambios: Si necesitas reprogramar, contáctanos con anticipación',
    contactEmail: '',
    contactPhone: '',
  });

  const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString('es-CL', {
        dateStyle: 'short',
        timeStyle: 'short',
        timeZone: 'America/Santiago'
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return value;
    }
  };

  const fetchGoogleStatus = useCallback(async () => {
    if (!userId) return;
    try {
      setGoogleLoading(true);
      setGoogleError(null);
      const response = await authFetch(`/google-calendar/status`, { force: true });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload) {
        throw new Error(payload?.error || 'No se pudo obtener el estado de Google Calendar');
      }

      setGoogleStatus(payload as GoogleCalendarStatus);
    } catch (err) {
      setGoogleStatus(null);
      setGoogleError(err instanceof Error ? err.message : 'Error al obtener estado de Google Calendar');
    } finally {
      setGoogleLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchSettings();
    fetchGoogleStatus();
  }, [userId, fetchGoogleStatus]);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/users/${userId}`);
      if (!response.ok) throw new Error('Error al cargar configuración');

      const data = await response.json();
      setSettings(data);

      // Initialize form with existing data
      setClinicData({
        fullName: data.fullName || '',
        clinicName: data.clinicName || '',
        clinicAddress: data.clinicAddress || '',
        professionalTitle: data.professionalTitle || '',
        professionalPhone: data.professionalPhone || '',
      });

      setEmailData({
        appointmentInstructions: data.appointmentInstructions || 'Llegada: Por favor llega 10-15 minutos antes de tu cita\nDocumentos: Trae la cartilla de vacunación de tu mascota\nAyuno: Si es necesario, te contactaremos para indicar ayuno\nCambios: Si necesitas reprogramar, contáctanos con anticipación',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [userId]);


    const handleGoogleConnect = async () => {
      try {
        setGoogleActionLoading(true);
        setGoogleError(null);
        setGoogleMessage(null);
        const response = await authFetch(`/google-calendar/auth-url?redirectPath=/dashboard/settings?google=connected`, { force: true });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.url) {
          throw new Error(payload?.error || 'No se pudo generar el enlace de autorización');
        }

        window.location.href = payload.url;
      } catch (err) {
        setGoogleError(err instanceof Error ? err.message : 'No se pudo iniciar la conexión con Google Calendar');
      } finally {
        setGoogleActionLoading(false);
      }
    };

    const handleGoogleDisconnect = async () => {
      try {
        setGoogleActionLoading(true);
        setGoogleError(null);
        const response = await authFetch(`/google-calendar/disconnect`, { method: 'POST' });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.error || 'No se pudo desconectar Google Calendar');
        }

        setGoogleMessage('Integración con Google Calendar desconectada correctamente.');
        await fetchGoogleStatus();
      } catch (err) {
        setGoogleError(err instanceof Error ? err.message : 'No se pudo desconectar Google Calendar');
      } finally {
        setGoogleActionLoading(false);
      }
    };

    const handleGoogleResync = async () => {
      try {
        setGoogleActionLoading(true);
        setGoogleError(null);
        const response = await authFetch(`/google-calendar/resync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days: 30 })
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload) {
          throw new Error(payload?.error || 'No se pudo sincronizar Google Calendar');
        }

        const total = payload.total ?? 0;
        const success = payload.success ?? total;
        setGoogleMessage(`Sincronización completada (${success}/${total})`);
        await fetchGoogleStatus();
      } catch (err) {
        setGoogleError(err instanceof Error ? err.message : 'No se pudo sincronizar Google Calendar');
      } finally {
        setGoogleActionLoading(false);
      }
    };

    useEffect(() => {
      const googleParam = searchParams?.get('google');
      if (!googleParam) return;

      if (googleParam === 'connected') {
        setGoogleMessage('Google Calendar conectado correctamente.');
        fetchGoogleStatus();
      } else if (googleParam === 'error') {
        setGoogleError('No pudimos conectar con Google Calendar. Inténtalo nuevamente.');
      }

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('google');
        window.history.replaceState({}, document.title, url.toString());
      }

      const timer = window.setTimeout(() => {
        setGoogleMessage(null);
        setGoogleError(null);
      }, 6000);

      return () => window.clearTimeout(timer);
    }, [searchParams, fetchGoogleStatus]);



  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await authFetch(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clinicData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar información de clínica');
      }

      setSuccess(true);
      await fetchSettings();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar información de clínica');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await authFetch(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar personalización de emails');
      }

      setSuccess(true);
      await fetchSettings();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar personalización de emails');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="vet-page">
        <div className="vet-container">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-page">
      <div className="vet-container">
        <PageHeader
          title="Configuración"
          subtitle="Personaliza tu experiencia y sistema de emails"
          icon={Settings}
        />

        <div className="vet-container space-y-8">

        {/* Messages */}
        {error && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600">✅ Configuración actualizada correctamente</p>
          </div>
        )}

        <SlideIn direction="up" delay={200}>
          <div className="vet-card-unified">
            <div className="vet-section-header-unified">
              <div className="vet-section-title-unified">
                <CalendarDays className="w-6 h-6" />
                Integración con Google Calendar
              </div>
              {googleStatus?.connected && (
                <span className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600">
                  <PlugZap className="w-4 h-4 text-primary" />
                  Sincronización activa
                </span>
              )}
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              {googleLoading ? (
                <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
              ) : (
                <>
                  {googleError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
                      {googleError}
                    </div>
                  )}
                  {googleMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg p-4">
                      {googleMessage}
                    </div>
                  )}

                  {googleStatus?.connected ? (
                    <>
                      <p className="text-gray-600">
                        Tus citas se sincronizan automáticamente con tu Google Calendar en tiempo real.
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Calendario enlazado</p>
                          <p className="text-sm font-medium text-gray-800">
                            {googleStatus.calendarId === 'primary' ? 'Principal' : googleStatus.calendarId}
                          </p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Próximas citas sincronizadas</p>
                          <p className="text-sm font-medium text-gray-800">{googleStatus.upcomingSyncedCount ?? 0}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Conectado el</p>
                          <p className="text-sm font-medium text-gray-800">{formatDateTime(googleStatus.connectedAt)}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Última sincronización</p>
                          <p className="text-sm font-medium text-gray-800">{formatDateTime(googleStatus.lastSyncedAt)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={handleGoogleResync}
                          disabled={googleActionLoading}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <RefreshCw className="w-4 h-4" />
                          {googleActionLoading ? 'Sincronizando…' : 'Re-sincronizar ahora'}
                        </button>
                        <button
                          onClick={handleGoogleDisconnect}
                          disabled={googleActionLoading}
                          className="inline-flex items-center gap-2 px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          <Plug className="w-4 h-4" />
                          Desconectar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600">
                        Conecta Google Calendar para crear, actualizar y cancelar eventos automáticamente con cada cita.
                      </p>
                      <ul className="text-sm text-gray-700 space-y-2 bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <li>✅ Creación automática de eventos con recordatorios nativos</li>
                        <li>✅ Reprogramación sincronizada sin duplicados</li>
                        <li>✅ Eliminación automática al cancelar citas</li>
                      </ul>
                      <button
                        onClick={handleGoogleConnect}
                        disabled={googleActionLoading}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <CalendarDays className="w-5 h-5" />
                        {googleActionLoading ? 'Abriendo Google…' : 'Conectar con Google Calendar'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </SlideIn>

        {/* Sistema Automático Status */}
        <SlideIn direction="up" delay={100}>
          <div className="vet-card-unified">
            <div className="vet-section-header-unified">
              <div className="vet-section-title-unified">
                <Activity className="w-6 h-6" />
                Sistema Automático Activo
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-gray-600 mb-6">Tu sistema de emails está funcionando automáticamente</p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">🎯 Funciones Activas</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  <strong>Confirmaciones inmediatas:</strong> Se envían automáticamente al crear citas
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  <strong>Recordatorios 24h:</strong> Enviados automáticamente un día antes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  <strong>Recordatorios 1h:</strong> Enviados automáticamente una hora antes
                </li>
              </ul>
            </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">📧 Configuración de Email</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Servidor:</strong> Gmail SMTP (myvetagenda@gmail.com)</p>
                  <p><strong>Estado:</strong> <span className="text-gray-600 font-semibold">✅ Operativo</span></p>
                </div>
              </div>
            </div>
          </div>
        </SlideIn>



        {/* Clinic Information */}
        <SlideIn direction="up" delay={300}>
          <div className="vet-card-unified">
            <div className="vet-section-header-unified">
              <div className="vet-section-title-unified">
                <Building className="w-6 h-6" />
                Información de tu Clínica
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-gray-600 mb-6">Esta información aparece en los emails enviados a tus clientes</p>

            <form onSubmit={handleClinicSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Tu Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={clinicData.fullName}
                    onChange={(e) => setClinicData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Dr. Juan Pérez González"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Nombre de tu Clínica
                  </label>
                  <input
                    type="text"
                    value={clinicData.clinicName}
                    onChange={(e) => setClinicData(prev => ({ ...prev, clinicName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Veterinaria Mi Mascota"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📍 Dirección de tu Clínica
                </label>
                <input
                  type="text"
                  value={clinicData.clinicAddress}
                  onChange={(e) => setClinicData(prev => ({ ...prev, clinicAddress: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Av. Principal 123, Comuna, Ciudad"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎓 Título Profesional (opcional)
                  </label>
                  <input
                    type="text"
                    value={clinicData.professionalTitle}
                    onChange={(e) => setClinicData(prev => ({ ...prev, professionalTitle: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Médico Veterinario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono de la Clínica (opcional)
                  </label>
                  <input
                    type="tel"
                    value={clinicData.professionalPhone}
                    onChange={(e) => setClinicData(prev => ({ ...prev, professionalPhone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="+56 2 2345 6789"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? 'Guardando...' : 'Guardar Información de Clínica'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </SlideIn>

        {/* Email Customization */}
        <SlideIn direction="up" delay={400}>
          <div className="vet-card-unified">
            <div className="vet-section-header-unified">
              <div className="vet-section-title-unified">
                <Mail className="w-6 h-6" />
                Personalización de Emails
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-gray-600 mb-6">Configure las instrucciones que aparecerán en los emails de confirmación</p>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Instrucciones Importantes (aparecerán en sección naranja)
                </label>
                  <textarea
                    value={emailData.appointmentInstructions}
                    onChange={(e) => setEmailData(prev => ({ ...prev, appointmentInstructions: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    rows={6}
                    placeholder="Llegada: Por favor llega 10-15 minutos antes de tu cita\nDocumentos: Trae la cartilla de vacunaci&oacute;n de tu mascota"
                  />
                <p className="text-xs text-gray-500 mt-1">
                  Separa cada instrucción con una nueva línea. Usa el formato &quot;Título: Descripción&quot;
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email de Contacto (aparecerá en sección azul)
                  </label>
                  <input
                    type="email"
                    value={emailData.contactEmail}
                    onChange={(e) => setEmailData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="contacto@mi-clinica.cl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono de Contacto (aparecerá en sección azul)
                  </label>
                  <input
                    type="tel"
                    value={emailData.contactPhone}
                    onChange={(e) => setEmailData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="+56 9 8765 4321"
                  />
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-3">👀 Vista Previa del Email</h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200 max-w-md">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                    <h5 className="text-gray-800 font-medium text-sm mb-2">📝 Instrucciones importantes:</h5>
                    <div className="text-gray-700 text-xs space-y-1">
                      {emailData.appointmentInstructions.split('\n').map((line, index) => (
                        <div key={index}>
                          {line.includes(':') ? (
                            <><strong>{line.split(':')[0]}:</strong> {line.split(':').slice(1).join(':').trim()}</>
                          ) : (
                            line
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h5 className="text-gray-800 font-medium text-sm mb-2">📍 Información de contacto:</h5>
                    <div className="text-gray-700 text-xs space-y-1">
                      <div><strong>👨‍⚕️ Profesional:</strong> {settings?.fullName || 'Su Nombre'}</div>
                      <div><strong>📧 Email:</strong> {emailData.contactEmail || settings?.email || 'su-email@ejemplo.com'}</div>
                      {emailData.contactPhone && <div><strong>📞 Teléfono:</strong> {emailData.contactPhone}</div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? 'Guardando...' : 'Guardar Personalización de Emails'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </SlideIn>

        </div>
      </div>
    </div>
  );
}
