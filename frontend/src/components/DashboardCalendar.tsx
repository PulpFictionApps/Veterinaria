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
          setEvents(prev => [...prev, ...availEvents]);
        }

        if (appointmentsRes.ok) {
          const appointments = await appointmentsRes.json();
          const appointmentEvents: CalendarEvent[] = appointments.map((appt: Appointment) => ({
            title: `${appt.petName} - ${appt.reason}`,
            start: appt.date,
            backgroundColor: "#3B82F6",
            borderColor: "#1E40AF",
            textColor: "white",
          }));
          setEvents(prev => [...prev, ...appointmentEvents]);
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
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors" 
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
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridDay"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
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
  );
}
