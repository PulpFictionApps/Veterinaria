"use client";

import { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';
import { filterActiveSlots, formatChileDate, formatChileTime } from '../lib/timezone';

interface ConsultationType {
  id: number;
  name: string;
  price: number; // in cents
  description?: string;
}

export default function PublicBookingForm({ professionalId }: { professionalId: number }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rut, setRut] = useState('');
  const [address, setAddress] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petSex, setPetSex] = useState('');
  const [petBirthDate, setPetBirthDate] = useState('');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Array<{ id: number; start: string; end: string }>>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
  const [selectedConsultationType, setSelectedConsultationType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    // Require contact info
    if (!email || !phone) {
      setMessage('Email y teléfono son requeridos');
      return;
    }

    if (!selectedConsultationType) {
      setMessage('Selecciona un tipo de consulta');
      return;
    }

    try {
      const body: any = {
        tutorName: name,
        tutorEmail: email,
        tutorPhone: phone,
        tutorRut: rut || null,
        tutorAddress: address || null,
        petName,
        petType,
        petBreed: petBreed || null,
        petAge: petAge ? Number(petAge) : null,
        petWeight: petWeight ? Number(petWeight) : null,
        petSex: petSex || null,
        petBirthDate: petBirthDate || null,
        reason,
        professionalId,
        consultationTypeId: Number(selectedConsultationType)
      };

      if (selectedSlot) body.slotId = Number(selectedSlot);
      else body.date = date;

      const res = await fetch(`${API_BASE}/appointments/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Error creando la reserva' }));
        throw new Error(errData.error || errData.message || 'Error creando la reserva');
      }
      setMessage('Reserva creada correctamente');
      // reload available slots después de reservar
      const slotsRes = await fetch(`${API_BASE}/availability/public/${professionalId}`);
      if (slotsRes.ok) {
        const data = await slotsRes.json();
        // Filtrar horarios expirados usando timezone de Chile
        const activeSlots = filterActiveSlots(data || []);
        setSlots(activeSlots);
      }
    } catch (err: any) {
      setMessage(err.message || 'Error');
    }
  }

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        // Load slots and consultation types in parallel
        const [slotsRes, typesRes] = await Promise.all([
          fetch(`${API_BASE}/availability/public/${professionalId}`),
          fetch(`${API_BASE}/consultation-types/public/${professionalId}`)
        ]);

        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          // Filtrar horarios expirados usando timezone de Chile
          const activeSlots = filterActiveSlots(slotsData || []);
          if (mounted) setSlots(activeSlots);
        }

        if (typesRes.ok) {
          const typesData = await typesRes.json();
          if (mounted) setConsultationTypes(typesData || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
    return () => { mounted = false };
  }, [professionalId]);

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

  function formatOptionLabel(s: { start: string; end: string }) {
    const start = new Date(s.start);
    const end = new Date(s.end);
    
    // Usar timezone de Chile para formatear
    const weekday = formatChileDate(start, { weekday: 'long' });
    const day = formatChileDate(start, { day: '2-digit', month: '2-digit' });
    const startTime = formatChileTime(start);
    const endTime = formatChileTime(end);
    
    return `${weekday} ${day} - ${startTime} - ${endTime}`;
  }

  function formatPrice(priceInCents: number) {
    return (priceInCents / 100).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP'
    });
  }

  const selectedType = consultationTypes.find(t => t.id === Number(selectedConsultationType));

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full sm:max-w-2xl mx-auto bg-white p-4 sm:p-6 rounded shadow">
      <h3 className="text-base sm:text-lg font-bold mb-4">Reservar hora</h3>
      
      {/* Datos del Cliente */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Datos del Cliente</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" className="w-full p-2 border rounded" required />
          <input value={rut} onChange={e => setRut(e.target.value)} placeholder="RUT (opcional)" className="w-full p-2 border rounded" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full p-2 border rounded" required />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono" className="w-full p-2 border rounded" required />
        </div>
        <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="Dirección (opcional)" className="w-full p-2 border rounded mt-2" rows={2} />
      </div>

      {/* Datos de la Mascota */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Datos de la Mascota</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input value={petName} onChange={e => setPetName(e.target.value)} placeholder="Nombre de la mascota" className="w-full p-2 border rounded" required />
          <select value={petType} onChange={e => setPetType(e.target.value)} className="w-full p-2 border rounded" required>
            <option value="">Seleccionar especie</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Conejo">Conejo</option>
            <option value="Hamster">Hamster</option>
            <option value="Cobaya">Cobaya</option>
            <option value="Pájaro">Pájaro</option>
            <option value="Pez">Pez</option>
            <option value="Tortuga">Tortuga</option>
            <option value="Iguana">Iguana</option>
            <option value="Otro">Otro</option>
          </select>
          <input value={petBreed} onChange={e => setPetBreed(e.target.value)} placeholder="Raza (opcional)" className="w-full p-2 border rounded" />
          <input value={petAge} onChange={e => setPetAge(e.target.value)} placeholder="Edad en años (opcional)" type="number" min="0" max="30" className="w-full p-2 border rounded" />
          <input value={petWeight} onChange={e => setPetWeight(e.target.value)} placeholder="Peso en kg (opcional)" type="number" min="0" max="200" step="0.1" className="w-full p-2 border rounded" />
          <select value={petSex} onChange={e => setPetSex(e.target.value)} className="w-full p-2 border rounded">
            <option value="">Seleccionar sexo (opcional)</option>
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
            <option value="castrado">Castrado</option>
            <option value="castrada">Castrada</option>
          </select>
        </div>
        <input value={petBirthDate} onChange={e => setPetBirthDate(e.target.value)} placeholder="Fecha de nacimiento (opcional)" type="date" className="w-full p-2 border rounded mt-2" />
      </div>

      {/* Consultation Type Selection */}
      {consultationTypes.length > 0 && (
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Tipo de consulta *</label>
          <select 
            className="w-full p-2 border rounded" 
            value={selectedConsultationType} 
            onChange={e => setSelectedConsultationType(e.target.value)} 
            required
          >
            <option value="">-- Selecciona tipo de consulta --</option>
            {consultationTypes.map(type => (
              <option key={type.id} value={String(type.id)}>
                {type.name} - {formatPrice(type.price)}
              </option>
            ))}
          </select>
          {selectedType && selectedType.description && (
            <p className="text-sm text-gray-600 mt-1">{selectedType.description}</p>
          )}
          {selectedType && (
            <p className="text-sm font-semibold text-pink-600 mt-1">
              Precio: {formatPrice(selectedType.price)}
            </p>
          )}
        </div>
      )}

      {slots.length > 0 ? (
        <div className="mb-2">
          <label className="block text-sm mb-1">Selecciona un horario disponible</label>
          <select className="w-full p-2 border rounded" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required>
            <option value="">-- elige un horario --</option>
            {groupSlotsByDay(slots).map(([day, daySlots]) => {
              // Parse the day key (YYYY-MM-DD) to avoid timezone issues
              const [year, month, dayNum] = day.split('-').map(Number);
              const localDate = new Date(year, month - 1, dayNum); // month is 0-indexed
              const dayLabel = localDate.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: '2-digit' });
              
              return (
                <optgroup key={day} label={dayLabel}>
                  {daySlots.map(s => (
                    <option key={s.id} value={String(s.id)}>{formatOptionLabel(s)}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>
      ) : (
        <input value={date} onChange={e => setDate(e.target.value)} placeholder="Fecha y hora (ISO)" className="w-full p-2 border mb-2" required />
      )}
    <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Motivo" className="w-full p-2 border mb-2 rounded" />
  <button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white w-full sm:w-auto px-3 py-2 rounded text-sm hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-200/50">Reservar</button>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </form>
  );
}
