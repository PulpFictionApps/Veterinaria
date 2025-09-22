"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '../lib/api';
import { useAuthContext } from '../lib/auth-context';

interface AvailabilitySlot {
  id: number;
  start: string;
  end: string;
  [key: string]: any; // por si hay propiedades adicionales
}

export default function AvailabilityManager() {
  const { userId } = useAuthContext();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  async function load() {
    if (!userId) return;
    const res = await authFetch(`/availability/${userId}`);
    if (!res.ok) return;
    const data: AvailabilitySlot[] = await res.json();
    setSlots(data || []);
  }

  useEffect(() => { load(); }, [userId]);

  async function createSlot(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await authFetch('/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end }),
      });
      if (res.ok) {
        setStart('');
        setEnd('');
        load();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteSlot(id: number) {
    await authFetch(`/availability/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold mb-2">Mis disponibilidades</h3>
      <form onSubmit={createSlot} className="flex gap-2 mb-3">
        <input
          value={start}
          onChange={e => setStart(e.target.value)}
          placeholder="Start (ISO)"
          className="p-2 border"
          required
        />
        <input
          value={end}
          onChange={e => setEnd(e.target.value)}
          placeholder="End (ISO)"
          className="p-2 border"
          required
        />
        <button className="bg-green-600 text-white px-3 rounded">Agregar</button>
      </form>
      <ul className="space-y-2">
        {slots.map(s => (
          <li key={s.id} className="flex justify-between items-center p-2 border rounded">
            <div>{new Date(s.start).toLocaleString()} — {new Date(s.end).toLocaleString()}</div>
            <button onClick={() => deleteSlot(s.id)} className="text-red-600">Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
