"use client";

import { useState } from 'react';

import { useAuthContext } from '../../../lib/auth-context';
import { 
  Calendar, 
  Clock, 
  Settings, 
  Grid3X3, 
  LayoutGrid,
  CalendarDays,
  Stethoscope,
  Heart,
  Users,
  Activity
} from 'lucide-react';
import { FadeIn, SlideIn, Stagger, AnimateOnView } from '../../../components/ui/Transitions';
import Tooltip from '../../../components/ui/Tooltip';
import PageHeader from '../../../components/ui/PageHeader';

// Usar componentes Lazy pre-creados para consistencia
import LazyDashboardCalendar from '../../../components/LazyDashboardCalendar';
import LazyAvailabilityManager from '../../../components/LazyAvailabilityManager';

type CalendarView = 'appointments' | 'availability' | 'unified';

export default function CalendarPage() {
  const [currentView, setCurrentView] = useState<CalendarView>('unified');
  const { userId } = useAuthContext();

  if (!userId) {
    return (
      <FadeIn>
        <div className="vet-page">
          <div className="vet-container flex items-center justify-center min-h-screen">
            <div className="vet-card-unified p-10">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-gray-600"></div>
                  <Stethoscope className="h-8 w-8 text-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="mt-8 text-gray-700 font-bold text-lg">🏥 Inicializando sistema médico...</p>
                <p className="mt-3 text-sm text-gray-500 font-medium">Verificando credenciales y cargando datos</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="vet-page">
      <div className="vet-container">
        {/* Medical Calendar Header */}
        <PageHeader 
          title=" Calendario Médico"
          subtitle="Centro de control para agenda y disponibilidad veterinaria"
          icon={Calendar}
          actions={
            <div className="bg-gray-100 rounded-lg p-2">
              <div className="flex gap-2">
                <Tooltip content="Vista completa con agenda y horarios">
                  <button
                    onClick={() => setCurrentView('unified')}
                    className={`group px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      currentView === 'unified'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                     Completa
                  </button>
                </Tooltip>
                
                <Tooltip content="Solo calendario de citas médicas">
                  <button
                    onClick={() => setCurrentView('appointments')}
                    className={`group px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      currentView === 'appointments'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <CalendarDays className="h-4 w-4" />
                     Citas
                  </button>
                </Tooltip>
                
                <Tooltip content="Solo gestión de horarios disponibles">
                  <button
                    onClick={() => setCurrentView('availability')}
                    className={`group px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      currentView === 'availability'
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                     Horarios
                  </button>
                </Tooltip>
              </div>
            </div>
          }
        />

        {/* Professional Calendar Content */}
        <div className="space-y-8">
          {/* Unified View - Both components with medical professional design */}
          {currentView === 'unified' && (
            <AnimateOnView>
              <div className="vet-grid-responsive">
                <div className="xl:col-span-2">
                  <div className="vet-card-unified overflow-hidden">
                    <div className="vet-section-header-unified">
                      <div className="vet-section-title-unified">
                        <CalendarDays className="h-6 w-6" />
                        Agenda de Consultas
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 font-medium mb-4">Vista mensual de citas programadas</p>
                      <LazyDashboardCalendar userId={userId!} />
                    </div>
                  </div>
                </div>
                
                <div className="xl:col-span-1">
                  <div className="vet-card-unified overflow-hidden">
                    <div className="vet-section-header-unified">
                      <div className="vet-section-title-unified">
                        <Clock className="h-6 w-6" />
                        Horarios Médicos
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 font-medium mb-4">Gestión de disponibilidad</p>
                      <LazyAvailabilityManager />
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnView>
          )}

          {/* Appointments Only View */}
          {currentView === 'appointments' && (
            <SlideIn direction="up">
              <div className="vet-card-unified overflow-hidden">
                <div className="vet-section-header-unified">
                  <div className="vet-section-title-unified">
                    <CalendarDays className="h-8 w-8" />
                    Calendario de Consultas Médicas
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 font-medium mb-6">
                    Vista detallada de todas las citas veterinarias programadas
                  </p>
                  <LazyDashboardCalendar userId={userId!} />
                </div>
              </div>
            </SlideIn>
          )}

          {/* Availability Only View */}
          {currentView === 'availability' && (
            <SlideIn direction="up">
              <div className="vet-card-unified overflow-hidden">
                <div className="vet-section-header-unified">
                  <div className="vet-section-title-unified">
                    <Settings className="h-8 w-8" />
                    Gestión de Horarios Médicos
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 font-medium mb-6">
                    Configura tus horarios de atención y disponibilidad profesional
                  </p>
                  <LazyAvailabilityManager />
                </div>
              </div>
            </SlideIn>
          )}
        </div>
      </div>
    </div>
  );
}
