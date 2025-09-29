"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg } from "@fullcalendar/core";
import esLocale from "@fullcalendar/core/locales/es";
import { useEffect, useRef, useState } from "react";
import { authFetch } from "../lib/api";

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

  useEffect(() => {
    async function loadEvents() {
      try {
        const availabilityRes = await authFetch(`/availability/${userId}`);
        const appointmentsRes = await authFetch(`/appointments/${userId}`);

        if (availabilityRes.ok) {
          const availability = await availabilityRes.json();
          const availEvents: CalendarEvent[] = availability.map((slot: AvailabilitySlot) => ({
            title: "Disponible",
            start: slot.start,
            end: slot.end,
            backgroundColor: "#E0F2FE",
            borderColor: "#60A5FA",
          }));
          setEvents(prev => [...(prev.filter(e => e.title !== 'Disponible')), ...availEvents]);
        }

        if (appointmentsRes.ok) {
          const appointments = await appointmentsRes.json();
          // appointments response may include pet, tutor and consultationType objects
          const appointmentEvents: CalendarEvent[] = appointments.map((appt: any) => {
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
            
            return {
              title: appointmentTitle,
              start: appt.date,
              backgroundColor: consultationColor,
              borderColor: borderColor,
              textColor: "white",
            };
          });
          setEvents(prev => [...(prev.filter(e => e.title === 'Disponible')), ...appointmentEvents]);
        }
      } catch (error) {
        console.error('Error loading calendar events:', error);
      }
    }
    loadEvents();
  }, [userId]);

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
          const calendarApi = calendarRef.current?.getApi();
          calendarApi?.refetchEvents?.();
        }
      } catch (error) {
        console.error('Error creating availability:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Calendario</h3>
        <div className="flex gap-2">
          <button 
            className="px-3 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-200/50" 
            onClick={() => changeView("timeGridDay")}
          >
            Día
          </button>
          <button 
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors" 
            onClick={() => changeView("timeGridWeek")}
          >
            Semana
          </button>
          <button 
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors" 
            onClick={() => changeView("dayGridMonth")}
          >
            Mes
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="w-full overflow-auto">
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
          height="auto"
          selectable={true}
          slotDuration="00:30:00"
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          locale={esLocale}
          select={handleSelect}
          dayHeaderFormat={{ weekday: 'long' }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
        />
        </div>
      </div>
    </div>
  );
}
