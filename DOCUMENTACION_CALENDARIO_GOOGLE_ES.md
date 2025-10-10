# Guía rápida: Calendario interno + Google Calendar

Esta guía resume cómo funciona la visualización del calendario dentro del dashboard y la sincronización automática con Google Calendar para profesionales y clientes.

## 1. Calendario visible en la plataforma

- El componente `DashboardCalendar` sigue mostrando toda la disponibilidad y las citas internas usando FullCalendar en zona horaria `America/Santiago`.
- Puedes alternar entre vista diaria, semanal y mensual sin perder sincronización.
- Al seleccionar un bloque vacío desde el calendario se crea disponibilidad (`/availability`) y, al confirmar una cita, se dispara la lógica habitual de creación, emails de confirmación y sincronización externa.

## 2. Conexión con Google Calendar

1. Ve a **Dashboard → Configuración → Google Calendar** y presiona **Conectar cuenta**.
2. Acepta los permisos solicitados (scope `calendar.events`). Se guardan tokens seguros en la tabla `GoogleCalendarCredential`.
3. Desde ese momento, cada cita creada, reprogramada o eliminada se sincroniza con Google de forma automática.
4. Si necesitas un refresco manual, usa el botón **Re-sincronizar** en Configuración.

### Indicadores dentro del calendario

- Si todavía no conectaste Google Calendar, verás un aviso en la parte superior para completar el proceso.
- Cuando la sincronización está activa se muestra un banner verde con el conteo de citas sincronizadas y el último `lastSyncedAt`.

## 3. Invitaciones para profesionales y clientes

- El profesional siempre ve las citas en el calendario interno; al conectar Google también las verá en su calendario principal (o el definido en la integración).
- Cada invitación incluye los datos de la mascota, tutor, motivo y duración calculada con el tipo de consulta.
- Si el tutor/cliente ingresa su email en la reserva pública, se añade como invitado del evento de Google. Recibirá:
  - El email de confirmación habitual.
  - Una invitación de Google Calendar para aceptarla y recibir recordatorios nativos.

## 4. Requisitos técnicos

- Variables de entorno necesarias en `backend/.env`:
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
  - `GOOGLE_OAUTH_STATE_SECRET` (opcional, usa `JWT_SECRET` si ya existe).
  - `GOOGLE_CALENDAR_SCOPES` si necesitas scopes adicionales.
  - `FRONTEND_URL` y `BACKEND_PUBLIC_URL` cuando desplegues en producción.
- Migración ejecutada: `npx prisma migrate deploy` con el cambio `add-google-calendar-integration`.
- Paquetes instalados: `googleapis`, `jsonwebtoken` (ya incluidos en `backend/package.json`).

## 5. Flujo de reserva pública

1. El cliente selecciona un horario libre en `PublicBookingForm`.
2. El backend (`POST /appointments/public`) crea o reutiliza tutor/mascota, verifica disponibilidad y genera la cita.
3. Se envían correos de confirmación y se programa la sincronización con Google mediante `queueMicrotask`.
4. El evento en Google agrega al tutor como invitado, por lo que el cliente puede aceptar o rechazar desde su correo.

## 6. Resolución de problemas

- **La invitación de Google no aparece:** revisa que el profesional esté conectado y que el tutor tenga un email válido. Puedes forzar un resync desde Configuración.
- **Tokens expirados:** el servicio renueva automáticamente los tokens al detectar que faltan <60 segundos para expirar. Si falla, desconecta y vuelve a conectar desde Configuración.
- **Diferencia horaria:** toda la capa de fechas usa la zona `America/Santiago` gracias a `parseChileanDateTime` y a la configuración explícita del calendar.

Con esto, el calendario interno se mantiene visible en la aplicación y las citas se reflejan simultáneamente en Google Calendar para profesionales y clientes.
