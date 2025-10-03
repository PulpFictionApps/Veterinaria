"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
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

// Lazy load components for better performance with medical loading states
const LazyDashboardCalendar = dynamic(() => import('../../../components/DashboardCalendar'), {
  loading: () => (
    <FadeIn>
      <div className="bg-gradient-to-r from-medical-50 to-health-50 rounded-2xl h-96 flex items-center justify-center border border-medical-100">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-medical-100 border-t-medical-500"></div>
            <Calendar className="h-5 w-5 text-medical-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-neutral-600 font-medium">Cargando calendario médico...</p>
        </div>
      </div>
    </FadeIn>
  ),
  ssr: false
});

const LazyAvailabilityManager = dynamic(() => import('../../../components/AvailabilityManager'), {
  loading: () => (
    <FadeIn>
      <div className="bg-gradient-to-r from-health-50 to-medical-50 rounded-2xl h-64 flex items-center justify-center border border-health-100">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-health-100 border-t-health-500"></div>
            <Clock className="h-5 w-5 text-health-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-neutral-600 font-medium">Cargando horarios disponibles...</p>
        </div>
      </div>
    </FadeIn>
  ),
  ssr: false
});

type CalendarView = 'appointments' | 'availability' | 'unified';

export default function CalendarPage() {
  const [currentView, setCurrentView] = useState<CalendarView>('unified');
  const { userId } = useAuthContext();

  if (!userId) {
    return (
      <FadeIn>
        <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-health-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-medical-100">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-medical-100 border-t-medical-500"></div>
                <Stethoscope className="h-6 w-6 text-medical-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-6 text-neutral-600 font-medium">Inicializando sistema médico...</p>
              <p className="mt-2 text-sm text-neutral-400">Verificando credenciales</p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-health-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Medical Calendar Header */}
        <FadeIn>
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-medical-100 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-medical-500 to-health-500 rounded-xl shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-medical-700 to-health-600 bg-clip-text text-transparent">
                      Calendario Médico
                    </h1>
                    <p className="text-neutral-600 mt-1 font-medium">
                      Centro de control para agenda y disponibilidad veterinaria
                    </p>
                  </div>
                </div>
                
                {/* Professional View Toggle */}
                <div className="bg-gradient-to-r from-medical-50 to-health-50 rounded-xl p-2 border border-medical-100">
                  <div className="flex gap-1">
                    <Tooltip content="Vista completa con agenda y horarios">
                      <button
                        onClick={() => setCurrentView('unified')}
                        className={`group px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                          currentView === 'unified'
                            ? 'bg-gradient-to-r from-medical-500 to-health-500 text-white shadow-lg'
                            : 'text-neutral-600 hover:text-medical-600 hover:bg-white'
                        }`}
                      >
                        <Grid3X3 className={`h-4 w-4 ${currentView === 'unified' ? 'text-white' : 'text-medical-500'} group-hover:scale-110 transition-transform duration-300`} />
                        Completa
                      </button>
                    </Tooltip>
                    
                    <Tooltip content="Solo calendario de citas médicas">
                      <button
                        onClick={() => setCurrentView('appointments')}
                        className={`group px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                          currentView === 'appointments'
                            ? 'bg-gradient-to-r from-medical-500 to-health-500 text-white shadow-lg'
                            : 'text-neutral-600 hover:text-medical-600 hover:bg-white'
                        }`}
                      >
                        <CalendarDays className={`h-4 w-4 ${currentView === 'appointments' ? 'text-white' : 'text-medical-500'} group-hover:scale-110 transition-transform duration-300`} />
                        Citas
                      </button>
                    </Tooltip>
                    
                    <Tooltip content="Solo gestión de horarios disponibles">
                      <button
                        onClick={() => setCurrentView('availability')}
                        className={`group px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                          currentView === 'availability'
                            ? 'bg-gradient-to-r from-medical-500 to-health-500 text-white shadow-lg'
                            : 'text-neutral-600 hover:text-medical-600 hover:bg-white'
                        }`}
                      >
                        <Clock className={`h-4 w-4 ${currentView === 'availability' ? 'text-white' : 'text-medical-500'} group-hover:scale-110 transition-transform duration-300`} />
                        Horarios
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Professional Calendar Content */}
        <div className="space-y-8">
          {/* Unified View - Both components with medical professional design */}
          {currentView === 'unified' && (
            <AnimateOnView>
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                  <div className="bg-white rounded-2xl shadow-xl border border-medical-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-medical-500 to-health-500 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-6 w-6 text-white" />
                        <div>
                          <h2 className="text-xl font-bold text-white">Agenda de Consultas</h2>
                          <p className="text-medical-100 text-sm">Vista mensual de citas programadas</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <LazyDashboardCalendar userId={userId} />
                    </div>
                  </div>
                </div>
                
                <div className="xl:col-span-1">
                  <div className="bg-white rounded-2xl shadow-xl border border-health-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-health-500 to-medical-500 px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-6 w-6 text-white" />
                        <div>
                          <h2 className="text-xl font-bold text-white">Horarios Médicos</h2>
                          <p className="text-health-100 text-sm">Gestión de disponibilidad</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
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
              <div className="bg-white rounded-2xl shadow-xl border border-medical-100 overflow-hidden">
                <div className="bg-gradient-to-r from-medical-500 to-health-500 px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <CalendarDays className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Calendario de Consultas Médicas</h2>
                      <p className="text-medical-100 mt-1">
                        Vista detallada de todas las citas veterinarias programadas
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <LazyDashboardCalendar userId={userId} />
                </div>
              </div>
            </SlideIn>
          )}

          {/* Availability Only View */}
          {currentView === 'availability' && (
            <SlideIn direction="up">
              <div className="bg-white rounded-2xl shadow-xl border border-health-100 overflow-hidden">
                <div className="bg-gradient-to-r from-health-500 to-medical-500 px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Settings className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Gestión de Horarios Médicos</h2>
                      <p className="text-health-100 mt-1">
                        Configura tus horarios de atención y disponibilidad profesional
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
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