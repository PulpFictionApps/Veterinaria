"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg } from "@fullcalendar/core";
import esLocale from "@fullcalendar/core/locales/es";
import { useEffect, useRef, useState } from "react";
import { authFetch } from "../lib/api";
import { useAppointments, useAvailability, invalidateCache } from "../hooks/useData";

interface AvailabilitySlot {
  start: string;
  end: string;
}

interface Appointment {
  petName: string;
  reason: string;
  date: string;
}

interface CalendarEvent {
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Usar hooks SWR para datos en tiempo real
  const { appointments, isLoading: appointmentsLoading } = useAppointments(userId);
  const { availability, isLoading: availabilityLoading } = useAvailability(userId);

  // Actualizar eventos cuando cambien los datos
  useEffect(() => {
    const availEvents: CalendarEvent[] = (availability || []).map((slot: AvailabilitySlot) => ({
      title: "Disponible",
      start: slot.start,
      end: slot.end,
      backgroundColor: "#E0F2FE",
      borderColor: "#60A5FA",
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
        title: appointmentTitle,
        start: appt.date,
        end: endDate.toISOString(),
        backgroundColor: consultationColor,
        borderColor: borderColor,
        textColor: "white",
      };
    });

    setEvents([...availEvents, ...appointmentEvents]);
  }, [appointments, availability]);

  const isLoading = appointmentsLoading || availabilityLoading;

  const changeView = (view: "dayGridMonth" | "timeGridWeek" | "timeGridDay") => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(view);
  };

  const handleSelect = async (info: DateSelectArg) => {
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
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Calendario</h3>
        <div className="flex gap-2 w-full sm:w-auto bg-gray-100 p-1 rounded-xl">
          <button 
            className="flex-1 sm:flex-initial px-3 py-2 bg-gray-700 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg touch-manipulation" 
            onClick={() => changeView("timeGridDay")}
          >
            📅 Día
          </button>
          <button 
            className="flex-1 sm:flex-initial px-3 py-2 bg-white text-gray-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm touch-manipulation" 
            onClick={() => changeView("timeGridWeek")}
          >
            📊 Semana
          </button>
          <button 
            className="flex-1 sm:flex-initial px-3 py-2 bg-white text-gray-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm touch-manipulation" 
            onClick={() => changeView("dayGridMonth")}
          >
            🗓️ Mes
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
        {isLoading && (
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
            <div className="bg-blue-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-2">
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
          eventClassNames="touch-manipulation"
        />
        </div>
      </div>
    </div>
  );
}
