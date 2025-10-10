# Variables de entorno y buenas prácticas (backend)

Este archivo explica las variables de entorno usadas por el backend y cómo manejarlas de forma segura.

1) No subir `.env` al repositorio
  - Mantén tu `backend/.env` fuera del control de versiones. Usa `backend/.env.example` como plantilla sin valores secretos.

2) Dónde almacenar secretos en producción
  - Vercel: Dashboard → Settings → Environment Variables
  - Railway / Render / Heroku: panel de Environment / Secrets
  - Nunca rellenes secretos directamente en el código.

3) Variables clave para Google Calendar
  - `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: creadas en Google Cloud Console (OAuth client type = Web application)
  - `GOOGLE_OAUTH_STATE_SECRET`: secreto HMAC para firmar/validar el `state` en OAuth (genera con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
  - `GOOGLE_CALENDAR_SCOPES`: por defecto `https://www.googleapis.com/auth/calendar.events`
  - `BACKEND_PUBLIC_URL`: URL pública usada para construir redirect URIs si no configuras `GOOGLE_REDIRECT_URI` explícitamente.

4) Redirect URIs que debes registrar en Google Cloud
  - http://localhost:4000/google-calendar/callback
  - https://veterinaria-gamma-virid.vercel.app/google-calendar/callback
  - https://veterinaria-p918.vercel.app/google-calendar/callback  (opcional)

5) Qué hacer tras cambiar secretos
  - Reinicia el backend para que Node lea las nuevas variables.
  - En producción, despliega o reinicia la instancia/service.

6) Revocar/renovar permisos
  - Si necesitas forzar la obtención de `refresh_token`, revoca el acceso desde la cuenta Google y reconecta (el flujo usa `prompt=consent`).
