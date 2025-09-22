"use client";

import { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';

export default function PublicBookingForm({ professionalId }: { professionalId: number }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Array<{ id: number; start: string; end: string }>>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/appointments/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tutorName: name,
          tutorEmail: email,
          tutorPhone: phone,
          petName,
          petType,
          date: selectedSlot || date,
          reason,
          professionalId,
        }),
      });
      if (!res.ok) throw new Error('Error creando la reserva');
      setMessage('Reserva creada correctamente');
    } catch (err: any) {
      setMessage(err.message || 'Error');
    }
  }

  useEffect(() => {
    let mounted = true;
    async function loadSlots() {
      try {
        const res = await fetch(`${API_BASE}/availability/public/${professionalId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setSlots(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadSlots();
    return () => { mounted = false };
  }, [professionalId]);

  return (
    <form onSubmit={handleSubmit} className="max-w-full sm:max-w-md mx-auto bg-white p-4 sm:p-6 rounded shadow">
      <h3 className="text-base sm:text-lg font-bold mb-3">Reservar hora</h3>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" className="w-full p-2 border mb-2" required />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (opcional)" className="w-full p-2 border mb-2" />
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono (opcional)" className="w-full p-2 border mb-2" />
      <input value={petName} onChange={e => setPetName(e.target.value)} placeholder="Nombre mascota" className="w-full p-2 border mb-2" required />
      <input value={petType} onChange={e => setPetType(e.target.value)} placeholder="Tipo mascota" className="w-full p-2 border mb-2" />

      {slots.length > 0 ? (
        <div className="mb-2">
          <label className="block text-sm mb-1">Selecciona un horario disponible</label>
          <select className="w-full p-2 border" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required>
            <option value="">-- elige un horario --</option>
            {slots.map(s => (
              <option key={s.id} value={s.start}>{new Date(s.start).toLocaleString()}</option>
            ))}
          </select>
        </div>
      ) : (
        <input value={date} onChange={e => setDate(e.target.value)} placeholder="Fecha y hora (ISO)" className="w-full p-2 border mb-2" required />
      )}
      <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Motivo" className="w-full p-2 border mb-2" />
  <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm">Reservar</button>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </form>
  );
}
