Fixes and rollout instructions

This file lists the safe steps to fix the production issue with Pet.updatedAt and how to enable booking-by-slotId.

1) Back up your production DB
   - Always take a full logical backup (pg_dump) or snapshot before applying schema/data changes.

2) Dry-run backfill (safe)
   - From repo root:
     cd backend; npm run backfill-pet-updatedAt:dry
   - This will print pets that would be updated. No writes performed.

3) Apply backfill (after backup)
   - cd backend; npm run backfill-pet-updatedAt:apply
   - Verifies and updates null updatedAt values.

4) Apply SQL to set DEFAULT for updatedAt (optional but recommended)
   - Review `backend/scripts/fix-pet-updatedAt.sql`.
   - After backup, run the SQL against your DB (psql -f fix-pet-updatedAt.sql) or via your migration tooling.
   - This will backfill any remaining NULLs and set a DEFAULT now() for new rows.

5) Booking-by-slotId
   - Backend endpoints have been updated to accept `slotId` (availability.id) for protected and public bookings and for PATCH reschedules.
   - Frontend public booking form now sends `slotId` when selecting an available slot.
   - Recommended: update any other client that used to POST raw ISO dates to send `slotId` instead.

6) DB-clean script
   - A `scripts/clean-db.js` script exists to normalize availability ranges into 1-hour slots. It defaults to dry-run; use `npm run clean-db:apply` after backup to apply.

7) Testing
   - After applying backfills/migrations, run the backend and frontend locally and exercise: create pet, public booking via the public page, and admin booking via the dashboard (if applicable).

If you want, I can:
- Create a Prisma migration file to alter the DB to set DEFAULT now() on Pet.updatedAt (requires prisma migrate workflow).
- Update admin appointment creation UI to prefer slotId as well (if you want full consistency).

8) Google Calendar integration
    - Generate OAuth 2.0 client credentials (tipo "Aplicación web") en Google Cloud Console. Configura redirect URI a `https://tu-backend.com/google-calendar/callback` y `http://localhost:4000/google-calendar/callback` para desarrollo.
    - En `backend/.env` añade las variables:
       - `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
       - `GOOGLE_OAUTH_STATE_SECRET` (opcional, usa `JWT_SECRET` si ya existe)
       - `GOOGLE_REDIRECT_URI` si necesitas sobreescribir la URL detectada automáticamente
       - `GOOGLE_CALENDAR_SCOPES` (por defecto `https://www.googleapis.com/auth/calendar.events`)
    - Instala dependencias nuevas: `cd backend && npm install`. Esto añade el paquete `googleapis`.
    - Aplica la migración de Prisma para crear el modelo `GoogleCalendarCredential` y el campo `googleCalendarEventId` en `Appointment`:
       ```bash
       cd backend
       npx prisma migrate dev --name add-google-calendar-integration
       npx prisma generate
       ```
    - Reinicia el backend y visita `Configuración > Google Calendar` en el dashboard para vincular la cuenta del profesional.
    - Al crear, reprogramar o eliminar citas (privadas o públicas) se insertan/actualizan/eliminan eventos en Google Calendar automáticamente. Usa el botón "Re-sincronizar" en la UI para forzar un re-sync manual si hace falta.
