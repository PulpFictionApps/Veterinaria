"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '../../../../../lib/api';

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

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!appointment) return <p>No encontrado</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Reprogramar cita</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Seleccionar horario disponible</label>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-auto">
            {availableSlots.map(s => {
              const d = new Date(s.start);
              const label = d.toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
              return (
                <button type="button" key={s.id} onClick={() => { setSlotId(s.id); setDate(s.start); }} className={`text-left p-2 rounded border ${slotId === s.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Fecha y hora (ISO)</label>
          <input className="mt-1 block w-full" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Motivo</label>
          <input className="mt-1 block w-full" value={reason} onChange={e => setReason(e.target.value)} />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={() => router.push('/dashboard/appointments')} className="px-4 py-2 border rounded">Cancelar</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
        </div>
      </form>
    </div>
  );
}
