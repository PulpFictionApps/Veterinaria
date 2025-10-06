import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load del componente del calendario
const DashboardCalendarComponent = dynamic(() => import('./DashboardCalendar'), {
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        <p className="text-gray-600">Cargando calendario...</p>
      </div>
    </div>
  ),
  ssr: false // El calendario no se renderiza en el servidor
});

interface DashboardCalendarProps {
  userId: number;
}

export default function LazyDashboardCalendar(props: DashboardCalendarProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          <p className="text-gray-600">Cargando calendario...</p>
        </div>
      </div>
    }>
      <DashboardCalendarComponent {...props} />
    </Suspense>
  );
}