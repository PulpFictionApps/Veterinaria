"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuthContext } from '../../../lib/auth-context';

// Lazy load components for better performance
const LazyDashboardCalendar = dynamic(() => import('../../../components/DashboardCalendar'), {
  loading: () => (
    <div className="animate-pulse bg-gray-100 rounded-lg h-96 flex items-center justify-center">
      <span className="text-gray-500">Cargando calendario...</span>
    </div>
  ),
  ssr: false
});

const LazyAvailabilityManager = dynamic(() => import('../../../components/AvailabilityManager'), {
  loading: () => (
    <div className="animate-pulse bg-gray-100 rounded-lg h-64 flex items-center justify-center">
      <span className="text-gray-500">Cargando disponibilidad...</span>
    </div>
  ),
  ssr: false
});

type CalendarView = 'appointments' | 'availability' | 'unified';

export default function CalendarPage() {
  const [currentView, setCurrentView] = useState<CalendarView>('unified');
  const { userId } = useAuthContext();

  if (!userId) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
              <p className="text-gray-600 mt-1">
                Gestiona tus citas y disponibilidad en un solo lugar
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('unified')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'unified'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📅 Vista Unificada
              </button>
              <button
                onClick={() => setCurrentView('appointments')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'appointments'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🗓️ Solo Citas
              </button>
              <button
                onClick={() => setCurrentView('availability')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'availability'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ⏰ Solo Disponibilidad
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="space-y-6">
          {/* Unified View - Both components side by side on desktop */}
          {currentView === 'unified' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Calendario de Citas</h2>
                  </div>
                  <div className="p-6">
                    <LazyDashboardCalendar userId={userId} />
                  </div>
                </div>
              </div>
              
              <div className="xl:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Gestión de Horarios</h2>
                  </div>
                  <div className="p-6">
                    <LazyAvailabilityManager />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Only View */}
          {currentView === 'appointments' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Calendario de Citas</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Vista detallada de todas tus citas programadas
                </p>
              </div>
              <div className="p-6">
                <LazyDashboardCalendar userId={userId} />
              </div>
            </div>
          )}

          {/* Availability Only View */}
          {currentView === 'availability' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Gestión de Disponibilidad</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configura tus horarios de atención y disponibilidad
                </p>
              </div>
              <div className="p-6">
                <LazyAvailabilityManager />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}