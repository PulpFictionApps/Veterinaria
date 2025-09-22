# Instrucciones rápidas para agentes (Copilot)

Este repo contiene una app de agendamiento veterinario con frontend Next.js y backend Express + Prisma.

Objetivo: dar al agente la información mínima para ser productivo editando creación de mascotas y agendamiento.

Arquitectura (rápido)
- Frontend: `frontend/` (Next.js app router). API base en `frontend/src/lib/api.ts` (API_BASE = NEXT_PUBLIC_API_BASE o http://localhost:4000). Usar `authFetch(path, opts)` para llamadas autenticadas.
- Backend: `backend/` (Express). Rutas públicas y privadas en `backend/src/routes/*.js`. Prisma en `backend/prisma/schema.prisma` y cliente en `backend/src/lib/prisma.js`.

Rutas y archivos clave
- Mascotas
  - Backend: `backend/src/routes/pets.js` (POST `/pets`, GET `/pets?tutorId=...`, GET `/pets/:id`, PATCH, DELETE). Requiere `verifyToken`.
  - Frontend: `frontend/src/app/dashboard/clients/[id]/pet/new/page.tsx` — envía POST `/pets` con {name,type,breed,age,tutorId} usando `authFetch`.
- Disponibilidad
  - Backend: `backend/src/routes/availability.js` (`/availability`, `/availability/public/:userId`).
  - Frontend: `frontend/src/components/AvailabilityManager.tsx` y `frontend/src/components/DashboardCalendar.tsx`.
- Citas (agendas)
  - Backend: `backend/src/routes/appointments.js` — POST `/appointments` (auth), POST `/appointments/public` (sin token), GET `/appointments/:userId`.
  - Frontend (público): `frontend/src/components/PublicBookingForm.tsx` (usa `/availability/public/:professionalId` y POST `/appointments/public`).

Patrones y problemas frecuentes (concretos)
- Fechas/zonas: el backend crea fechas con `new Date(date)` y la disponibilidad se valida con start <= date < end. Asegúrate que el frontend envíe ISO (ej. `slot.start` que ya es ISO) y que no haya desfases de zona horaria.
- Duplicados: la API pública evita reservas exactas comparando igualdad de fecha (`findFirst` por userId y date). Diferencias en ms o offsets producen falsas no-colisiones o rechazo.
- IDs: el backend hace `Number(...)` en ids. Asegurar que el frontend envíe strings numéricos o números.
- Auth: rutas que usan `verifyToken` necesitan header `Authorization: Bearer <token>` (usar `authFetch`). Endpoints públicos: `/appointments/public`, `/availability/public/:userId`.

Comandos útiles para desarrolladores
- Backend: cd backend; npm install; npm run dev  (usa nodemon, escucha en http://localhost:4000)
- Frontend: cd frontend; npm install; npm run dev  (Next en http://localhost:3000)

Ejemplos rápidos de inspección
- Si falla crear mascota: revisar request en Network desde `pet/new/page.tsx`, confirmar tutorId existe; revisar logs de `backend/src/routes/pets.js` para errores de Prisma.
- Si falla reserva pública: comprobar que `PublicBookingForm.tsx` envía `date` como ISO (usa `selectedSlot` que toma `slot.start`), y comparar `/availability/public/:professionalId` con el `date` enviado.

Si quieres, genero ejemplos curl para endpoints problemáticos (payloads exactos), o escribo tests/smoke scripts para reproducir los fallos que mencionaste (mascotas / agendamiento). Indica qué prefieres.