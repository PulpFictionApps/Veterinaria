"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '../../../../../lib/api';
import { formatChileDate, formatChileTime } from '../../../../../lib/timezone';

export default function EditAppointmentPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [slotId, setSlotId] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await authFetch(`/appointments/${id}`);
        if (!res.ok) throw new Error('No encontrado');
        const data = await res.json();
        if (!mounted) return;
        setAppointment(data);
        setDate(data.date);
        setReason(data.reason || '');

        // load professional slots
        const profId = data.userId || data.user?.id || data.tutor?.id;
        if (profId) {
          const sres = await authFetch(`/availability/${profId}`);
          if (sres.ok) {
            const slots = await sres.json();
            setAvailableSlots(slots || []);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error');
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false };
  }, [id]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      const payload: any = { reason };
      if (slotId) payload.slotId = Number(slotId);
      else payload.date = date;

      const res = await authFetch(`/appointments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error' }));
        throw new Error(err.error || 'Error updating');
      }
      router.push('/dashboard/appointments');
    } catch (err: any) {
      setError(err.message || 'Error');
    }
  }

  // Función para agrupar slots por día (igual que en PublicBookingForm)
  function groupSlotsByDay(slots: Array<{ id: number; start: string; end: string }>) {
    const map = new Map<string, Array<{ id: number; start: string; end: string }>>();
    for (const s of slots) {
      const d = new Date(s.start);
      // use local date parts to avoid timezone shifts
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dayKey = `${y}-${m}-${dd}`;
      if (!map.has(dayKey)) map.set(dayKey, []);
      map.get(dayKey)!.push(s);
    }
    // sort days and slots
    const ordered: Array<[string, Array<{ id: number; start: string; end: string }>]> = Array.from(map.entries())
      .sort((a,b) => a[0].localeCompare(b[0]))
      .map(([k, arr]) => [k, arr.sort((x,y) => new Date(x.start).getTime() - new Date(y.start).getTime())]);
    return ordered;
  }

  // Función para formatear la opción (igual que en PublicBookingForm)
  function formatOptionLabel(s: { start: string; end: string }) {
    const start = new Date(s.start);
    const end = new Date(s.end);
    
    // Usar timezone de Chile para formatear
    const startTime = formatChileTime(start);
    const endTime = formatChileTime(end);
    
    return `${startTime} - ${endTime}`;
  }

  if (loading) return <div className="flex justify-center items-center h-32"><div className="text-gray-500">Cargando...</div></div>;
  if (error) return <div className="max-w-lg mx-auto bg-white p-6 rounded shadow"><p className="text-gray-600">{error}</p></div>;
  if (!appointment) return <div className="max-w-lg mx-auto bg-white p-6 rounded shadow"><p>No encontrado</p></div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Reprogramar Cita</h2>
        <p className="text-sm text-gray-600 mt-1">
          Cita actual: {appointment.pet.name} - {new Date(appointment.date).toLocaleString('es-CL')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Información de la cita actual */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Información de la Cita</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Mascota:</span> {appointment.pet.name} ({appointment.pet.type})
            </div>
            <div>
              <span className="font-medium">Tutor:</span> {appointment.tutor.name}
            </div>
            {appointment.tutor.phone && (
              <div>
                <span className="font-medium">Teléfono:</span> {appointment.tutor.phone}
              </div>
            )}
            {appointment.consultationType && (
              <div>
                <span className="font-medium">Tipo:</span> {appointment.consultationType.name}
              </div>
            )}
          </div>
        </div>

        {/* Selector de horario disponible */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar horario disponible
          </label>
          {availableSlots.length > 0 ? (
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent" 
              value={slotId} 
              onChange={e => {
                const selectedId = e.target.value;
                setSlotId(selectedId === '' ? '' : Number(selectedId));
                if (selectedId) {
                  const selectedSlot = availableSlots.find(s => s.id === Number(selectedId));
                  if (selectedSlot) {
                    setDate(selectedSlot.start);
                  }
                }
              }}
              required
            >
              <option value="">-- Elige un horario --</option>
              {groupSlotsByDay(availableSlots).map(([day, daySlots]) => {
                // Parse the day key (YYYY-MM-DD) to avoid timezone issues
                const [year, month, dayNum] = day.split('-').map(Number);
                const localDate = new Date(year, month - 1, dayNum); // month is 0-indexed
                const dayLabel = formatChileDate(localDate, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
                
                return (
                  <optgroup key={day} label={dayLabel}>
                    {daySlots.map(s => (
                      <option key={s.id} value={String(s.id)}>
                        {formatOptionLabel(s)}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          ) : (
            <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
              <div className="text-4xl mb-2">📅</div>
              <p className="font-medium">No hay horarios disponibles</p>
              <p className="text-sm">El profesional no tiene horarios disponibles en este momento</p>
            </div>
          )}
        </div>

        {/* Campo de fecha manual (opcional para debugging) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha y hora (ISO)
          </label>
          <input 
            type="datetime-local"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent bg-gray-50" 
            value={date ? new Date(date).toISOString().slice(0, 16) : ''} 
            onChange={e => {
              if (e.target.value) {
                setDate(new Date(e.target.value).toISOString());
              } else {
                setDate('');
              }
            }}
            disabled={!!slotId}
          />
          <p className="text-xs text-gray-500 mt-1">
            {slotId ? 'Automático basado en horario seleccionado' : 'Solo usar si no hay horarios disponibles'}
          </p>
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de la consulta
          </label>
          <textarea 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent" 
            value={reason} 
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Describe el motivo de la consulta veterinaria..."
          />
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button 
            type="button" 
            onClick={() => router.push('/dashboard/appointments')} 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="bg-gradient-to-r from-medical-500 to-health-500 text-white px-6 py-2 rounded-lg hover:from-medical-600 hover:to-health-600 transition-all shadow-lg shadow-medical-200/50"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
