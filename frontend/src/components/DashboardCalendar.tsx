"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg } from "@fullcalendar/core";
import esLocale from "@fullcalendar/core/locales/es";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { 
  Calendar, 
  Clock, 
  Grid3X3,
  Eye,
  Trash2,
  X,
} from 'lucide-react';
import { authFetch } from "../lib/api";
import { useAppointments, useAvailability, invalidateCache } from "../hooks/useData";

interface AvailabilitySlot {
  id: number;
  start: string;
  end: string;
}

interface Appointment {
  petName: string;
  reason: string;
  date: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps?: {
    type: 'availability' | 'appointment';
    originalData: any;
  };
}

// Función para oscurecer un color hexadecimal
function darkenColor(hex: string, percent: number): string {
  // Remover el # si está presente
  const color = hex.replace('#', '');
  
  // Convertir a RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Oscurecer cada componente
  const factor = (100 - percent) / 100;
  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);
  
  // Convertir de vuelta a hex
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

export default function DashboardCalendar({ userId }: { userId: number }) {
  const calendarRef = useRef<FullCalendar | null>(null);
  
  // Usar hooks SWR para datos en tiempo real
  const { appointments, isLoading: appointmentsLoading } = useAppointments(userId);
  const { availability, isLoading: availabilityLoading } = useAvailability(userId);
  
  // Estado para el modal de opciones
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    type: 'availability' | 'appointment';
    data: any;
    title: string;
  } | null>(null);

  // Computar eventos de manera optimizada con useMemo para evitar renders innecesarios
  const events = useMemo(() => {
    // Limitar y optimizar slots de disponibilidad para mejorar rendimiento
    const maxSlotsToShow = 50; // Límite para evitar sobrecarga visual
    const limitedAvailability = (availability || []).slice(0, maxSlotsToShow);
    
    const availEvents: CalendarEvent[] = limitedAvailability.map((slot: AvailabilitySlot) => ({
      id: `availability-${slot.id}`,
      title: "✅ Disponible",
      start: slot.start,
      end: slot.end,
      backgroundColor: "#ECFDF5", // Verde muy suave
      borderColor: "#22C55E", // Verde más intenso
      textColor: "#15803D", // Verde oscuro para el texto
      extendedProps: {
        type: 'availability' as const,
        originalData: slot
      }
    }));

    const appointmentEvents: CalendarEvent[] = (appointments || []).map((appt: any) => {
      // Usar el color del tipo de consulta si está disponible, sino color por defecto
      const consultationColor = appt.consultationType?.color || '#3B82F6';
      // Crear un color más oscuro para el borde
      const borderColor = darkenColor(consultationColor, 20);
      
      // Construir el título del evento
      let appointmentTitle = appt.pet?.name ? `${appt.pet.name}` : `${appt.tutor?.name || 'Reservado'}`;
      if (appt.consultationType?.name) {
        appointmentTitle += ` (${appt.consultationType.name})`;
      }
      if (appt.reason) {
        appointmentTitle += ` - ${appt.reason}`;
      }
      
      // Determine end time from consultationType.duration (minutes) or default to 30 minutes
      const durationMinutes = appt.consultationType?.duration || 30;
      const startDate = new Date(appt.date);
      const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

      return {
        id: `appointment-${appt.id}`,
        title: appointmentTitle,
        start: appt.date,
        end: endDate.toISOString(),
        backgroundColor: consultationColor,
        borderColor: borderColor,
        textColor: "white",
        extendedProps: {
          type: 'appointment' as const,
          originalData: appt
        }
      };
    });

    return [...availEvents, ...appointmentEvents];
  }, [appointments, availability]);
  
  // Usar useMemo para evitar repetir el warning en cada render
  const hasLimitedSlots = useMemo(() => {
    const maxSlotsToShow = 50;
    if (availability && availability.length > maxSlotsToShow) {
      console.warn(`⚠️ Mostrando solo ${maxSlotsToShow} de ${availability.length} slots de disponibilidad para mejorar el rendimiento`);
      return true;
    }
    return false;
  }, [availability?.length]);

  const isLoading = appointmentsLoading || availabilityLoading;

  const changeView = useCallback((view: "dayGridMonth" | "timeGridWeek" | "timeGridDay") => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(view);
  }, []);

  const handleSelect = useCallback(async (info: DateSelectArg) => {
    if (window.confirm(`Habilitar hora: ${info.startStr} - ${info.endStr}?`)) {
      try {
        const res = await authFetch("/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            start: info.startStr,
            end: info.endStr,
          }),
        });
        
        if (res.ok) {
          // SWR se encargará de la actualización automática
          // Pero podemos forzar una revalidación inmediata
          invalidateCache.availability(userId);
          const calendarApi = calendarRef.current?.getApi();
          calendarApi?.refetchEvents?.();
        }
      } catch (error) {
        console.error('Error creating availability:', error);
      }
    }
  }, [authFetch, userId, invalidateCache]);

  // Handler para clicks en eventos
  const handleEventClick = useCallback((clickInfo: any) => {
    const event = clickInfo.event;
    const eventData = event.extendedProps;
    
    setSelectedEvent({
      type: eventData.type,
      data: eventData.originalData,
      title: event.title
    });
    setShowEventModal(true);
  }, []);

  // Función para eliminar slot de disponibilidad
  const deleteAvailabilitySlot = useCallback(async (slot: any) => {
    try {
      const res = await authFetch(`/availability/${slot.id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        invalidateCache.availability(userId);
        setShowEventModal(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting availability slot:', error);
    }
  }, [authFetch, userId, invalidateCache]);

  // Función para eliminar cita
  const deleteAppointment = useCallback(async (appointment: any) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      try {
        const res = await authFetch(`/appointments/${appointment.id}`, {
          method: "DELETE"
        });
        
        if (res.ok) {
          invalidateCache.appointments(userId);
          setShowEventModal(false);
          setSelectedEvent(null);
        }
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  }, [authFetch, userId, invalidateCache]);

  // Función para ver detalles de cita
  const viewAppointment = useCallback((appointment: any) => {
    // Redirigir a la página de detalles de la cita
    window.open(`/dashboard/appointments/${appointment.id}`, '_blank');
  }, []);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Calendario</h3>
        <div className="flex gap-2 w-full sm:w-auto bg-gray-100 p-1 rounded-lg">
          <button 
            className="flex-1 sm:flex-initial px-3 py-2 bg-gray-700 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-all shadow touch-manipulation" 
            onClick={() => changeView("timeGridDay")}
          >
            <Grid3X3 className="h-4 w-4" />
             Día
          </button>
          <button 
            className="flex-1 sm:flex-initial px-3 py-2 bg-white text-gray-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-all shadow touch-manipulation" 
            onClick={() => changeView("timeGridWeek")}
          >
            <Calendar className="h-4 w-4" />
             Semana
          </button>
          <button 
            className="flex-1 sm:flex-initial px-3 py-2 bg-white text-gray-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-all shadow touch-manipulation" 
            onClick={() => changeView("dayGridMonth")}
          >
            <Calendar className="h-4 w-4" />
             Mes
          </button>
        </div>
      </div>

      {/* Leyenda de colores y estado */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ECFDF5", border: "2px solid #22C55E" }}></div>
            <span className="text-gray-700 font-medium">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
            <span className="text-gray-700 font-medium">Cita agendada</span>
          </div>
        </div>
        
        {hasLimitedSlots && (
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs sm:text-sm font-medium">
              Vista limitada: {availability?.length} horarios totales
            </span>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
        {isLoading && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
            <div className="bg-gray-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Actualizando...</span>
            </div>
          </div>
        )}
        <div className="w-full overflow-auto touch-auto">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          headerToolbar={{
            left: '',
            center: '',
            right: ''
          }}
          events={events}
          height={window.innerWidth < 768 ? 400 : "auto"}
          selectable={true}
          slotDuration="00:30:00"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          locale={esLocale}
          select={handleSelect}
          eventClick={handleEventClick}
          dayHeaderFormat={ window.innerWidth < 768 ? { weekday: 'short' } : { weekday: 'long' }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          selectConstraint={{
            start: '08:00',
            end: '20:00'
          }}
          snapDuration="00:30:00"
          eventMaxStack={window.innerWidth < 768 ? 2 : 4}
          eventClassNames="touch-manipulation cursor-pointer"
        />
        </div>
      </div>

      {/* Modal de opciones de evento */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedEvent.type === 'availability' ? 'Horario Disponible' : 'Cita Agendada'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Título:</p>
                <p className="font-medium text-gray-900">{selectedEvent.title}</p>
              </div>
              
              <div className="flex flex-col gap-2">
                {selectedEvent.type === 'availability' ? (
                  <button
                    onClick={() => deleteAvailabilitySlot(selectedEvent.data)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar Horario
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => viewAppointment(selectedEvent.data)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Cita
                    </button>
                    <button
                      onClick={() => deleteAppointment(selectedEvent.data)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar Cita
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowEventModal(false)}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
