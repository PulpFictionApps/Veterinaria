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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-blue-100">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 shadow-lg"></div>
                <Stethoscope className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-8 text-neutral-700 font-bold text-lg">🏥 Inicializando sistema médico...</p>
              <p className="mt-3 text-sm text-neutral-500 font-medium">Verificando credenciales y cargando datos</p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Medical Calendar Header */}
        <FadeIn>
          <div className="mb-8">
            <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 sm:p-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-gradient-mixed rounded-2xl shadow-xl border border-white/20">
                    <Calendar className="h-10 w-10 text-white drop-shadow-sm" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-black bg-gradient-mixed bg-clip-text text-transparent leading-tight">
                      📅 Calendario Médico
                    </h1>
                    <p className="text-neutral-600 mt-2 font-semibold text-lg">
                      Centro de control para agenda y disponibilidad veterinaria
                    </p>
                  </div>
                </div>
                
                {/* Professional View Toggle */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-3 border border-blue-200 shadow-inner">
                  <div className="flex gap-2">
                    <Tooltip content="Vista completa con agenda y horarios">
                      <button
                        onClick={() => setCurrentView('unified')}
                        className={`group px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 ${
                          currentView === 'unified'
                            ? 'bg-gradient-primary text-white shadow-xl transform scale-105'
                            : 'text-neutral-600 hover:text-blue-600 hover:bg-white/80 hover:scale-105'
                        }`}
                      >
                        <Grid3X3 className={`h-5 w-5 ${currentView === 'unified' ? 'text-white' : 'text-blue-500'} group-hover:scale-110 transition-transform duration-300`} />
                        📋 Completa
                      </button>
                    </Tooltip>
                    
                    <Tooltip content="Solo calendario de citas médicas">
                      <button
                        onClick={() => setCurrentView('appointments')}
                        className={`group px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 ${
                          currentView === 'appointments'
                            ? 'bg-gradient-primary text-white shadow-xl transform scale-105'
                            : 'text-neutral-600 hover:text-blue-600 hover:bg-white/80 hover:scale-105'
                        }`}
                      >
                        <CalendarDays className={`h-5 w-5 ${currentView === 'appointments' ? 'text-white' : 'text-blue-500'} group-hover:scale-110 transition-transform duration-300`} />
                        📊 Citas
                      </button>
                    </Tooltip>
                    
                    <Tooltip content="Solo gestión de horarios disponibles">
                      <button
                        onClick={() => setCurrentView('availability')}
                        className={`group px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 ${
                          currentView === 'availability'
                            ? 'bg-gradient-secondary text-white shadow-xl transform scale-105'
                            : 'text-neutral-600 hover:text-green-600 hover:bg-white/80 hover:scale-105'
                        }`}
                      >
                        <Clock className={`h-5 w-5 ${currentView === 'availability' ? 'text-white' : 'text-green-500'} group-hover:scale-110 transition-transform duration-300`} />
                        ⏰ Horarios
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
                  <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
                    <div className="bg-gradient-primary px-6 py-4">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-6 w-6 text-white" />
                        <div>
                          <h2 className="text-xl font-bold text-white">Agenda de Consultas</h2>
                          <p className="text-blue-100 text-sm">Vista mensual de citas programadas</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <LazyDashboardCalendar userId={userId} />
                    </div>
                  </div>
                </div>
                
                <div className="xl:col-span-1">
                  <div className="bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
                    <div className="bg-gradient-secondary px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-6 w-6 text-white" />
                        <div>
                          <h2 className="text-xl font-bold text-white">Horarios Médicos</h2>
                          <p className="text-green-100 text-sm">Gestión de disponibilidad</p>
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
              <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
                <div className="bg-gradient-primary px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <CalendarDays className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Calendario de Consultas Médicas</h2>
                      <p className="text-blue-100 mt-1">
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
              <div className="bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
                <div className="bg-gradient-secondary px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Settings className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Gestión de Horarios Médicos</h2>
                      <p className="text-green-100 mt-1">
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