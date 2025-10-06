import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load del componente de gestión de disponibilidad
const AvailabilityManagerComponent = dynamic(() => import('./AvailabilityManager'), {
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        <p className="text-gray-600">Cargando disponibilidad...</p>
      </div>
    </div>
  ),
  ssr: false
});

interface AvailabilityManagerProps {
  // Sin props por ahora
}

export default function LazyAvailabilityManager(props: AvailabilityManagerProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <p className="text-gray-600">Cargando disponibilidad...</p>
        </div>
      </div>
    }>
      <AvailabilityManagerComponent />
    </Suspense>
  );
}
