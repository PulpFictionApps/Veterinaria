"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function DashboardCalendar({ userId }: { userId: number }) {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  // Cargar disponibilidad y citas desde backend
  useEffect(() => {
    async function loadEvents() {
      const { data: availability } = await axios.get(`/api/availability/${userId}`);
      const { data: appointments } = await axios.get(`/api/appointments/${userId}`);

      const availEvents = availability.map((slot: any) => ({
        title: "Disponible",
        start: slot.start,
        end: slot.end,
        backgroundColor: "#E0F2FE",
        borderColor: "#60A5FA",
      }));

      const appointmentEvents = appointments.map((appt: any) => ({
        title: `${appt.petName} - ${appt.reason}`,
        start: appt.date,
        backgroundColor: "#3B82F6",
        borderColor: "#1E40AF",
        textColor: "white",
      }));

      setEvents([...availEvents, ...appointmentEvents]);
    }
    loadEvents();
  }, [userId]);

  const changeView = (view: "dayGridMonth" | "timeGridWeek" | "timeGridDay") => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.changeView(view);
  };

  const handleSelect = async (info: any) => {
    if (window.confirm(`Habilitar hora: ${info.startStr} - ${info.endStr}?`)) {
      await axios.post("/api/availability", {
        userId,
        start: info.startStr,
        end: info.endStr,
      });
      // Recargar eventos
      const calendarApi = calendarRef.current?.getApi();
      calendarApi?.refetchEvents?.(); // solo funciona con eventos cargados por función de fetch
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="flex justify-end gap-2 mb-2">
        <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => changeView("timeGridDay")}>Día</button>
        <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => changeView("timeGridWeek")}>Semana</button>
        <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => changeView("dayGridMonth")}>Mes</button>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={false}
        events={events}
        height="auto"
        selectable={true}
        slotDuration="01:00:00"
        allDaySlot={false}
        locale={esLocale}
        select={handleSelect}
      />
    </div>
  );
}
