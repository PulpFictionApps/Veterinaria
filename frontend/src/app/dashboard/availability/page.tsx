import { redirect } from 'next/navigation';

// Redirects para mantener compatibilidad con rutas antiguas
export default function AvailabilityRedirect() {
  // Redirect /dashboard/availability to /dashboard/calendar
  redirect('/dashboard/calendar');
}
