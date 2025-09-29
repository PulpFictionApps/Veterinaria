"use client";

import { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';
import { filterActiveSlots, formatChileDate, formatChileTime } from '../lib/timezone';

interface ConsultationType {
  id: number;
  name: string;
  price: number; // in cents
  description?: string;
  duration?: number; // in minutes
  color?: string; // hex color code
}

interface Pet {
  id: number;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  sex?: string;
  birthDate?: string;
}

interface TutorData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  rut?: string;
  address?: string;
  pets: Pet[];
}

export default function PublicBookingForm({ professionalId }: { professionalId: number }) {
  const [email, setEmail] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [existingTutor, setExistingTutor] = useState<TutorData | null>(null);
  
  // Datos del cliente
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rut, setRut] = useState('');
  const [address, setAddress] = useState('');
  
  // Datos de la mascota
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [isNewPet, setIsNewPet] = useState(false);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [petSex, setPetSex] = useState('');
  const [petBirthDate, setPetBirthDate] = useState('');
  
  // Cita
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Array<{ id: number; start: string; end: string }>>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
  const [selectedConsultationType, setSelectedConsultationType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  async function checkEmailExists() {
    if (!email || !email.includes('@')) {
      setMessage('Ingresa un email válido');
      return;
    }
    
    setMessage('');
    try {
      const response = await fetch(`${API_BASE}/tutors/public/${professionalId}/by-email/${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const tutorData = await response.json();
        setExistingTutor(tutorData);
        
        // Autocompletar datos del cliente
        setName(tutorData.name);
        setPhone(tutorData.phone || '');
        setRut(tutorData.rut || '');
        setAddress(tutorData.address || '');
        
        // Si tiene mascotas, seleccionar la primera por defecto
        if (tutorData.pets && tutorData.pets.length > 0) {
          setSelectedPetId(String(tutorData.pets[0].id));
          setIsNewPet(false);
        } else {
          setIsNewPet(true);
        }
        
        setMessage(`Cliente encontrado: ${tutorData.name}. Se han llenado automáticamente los datos.`);
      } else if (response.status === 404) {
        setExistingTutor(null);
        setName('');
        setPhone('');
        setRut('');
        setAddress('');
        setSelectedPetId('');
        setIsNewPet(true);
        setMessage('Cliente nuevo. Completa todos los datos.');
      } else {
        throw new Error('Error al buscar cliente');
      }
      
      setEmailChecked(true);
    } catch (err: any) {
      setMessage(err.message || 'Error al verificar email');
      setEmailChecked(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    if (!emailChecked) {
      setMessage('Primero verifica el correo electrónico');
      return;
    }

    // Require contact info
    if (!email || !phone || !name) {
      setMessage('Email, nombre y teléfono son requeridos');
      return;
    }

    if (!selectedConsultationType) {
      setMessage('Selecciona un tipo de consulta');
      return;
    }

    // Validar mascota
    if (!isNewPet && !selectedPetId) {
      setMessage('Selecciona una mascota o marca "Nueva mascota"');
      return;
    }

    if (isNewPet && (!petName || !petType)) {
      setMessage('Nombre y tipo de mascota son requeridos para nueva mascota');
      return;
    }

    try {
      let petId = selectedPetId;
      
      // Si es mascota nueva, crearla primero
      if (isNewPet) {
        // Si es cliente existente, usar su ID, sino se creará en el backend
        const tutorIdForPet = existingTutor?.id;
        
        if (tutorIdForPet) {
          const petResponse = await fetch(`${API_BASE}/pets/public/${professionalId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: petName,
              type: petType,
              breed: petBreed || null,
              age: petAge ? Number(petAge) : null,
              weight: petWeight ? Number(petWeight) : null,
              sex: petSex || null,
              birthDate: petBirthDate || null,
              tutorId: tutorIdForPet
            }),
          });
          
          if (petResponse.ok) {
            const newPet = await petResponse.json();
            petId = String(newPet.id);
          } else {
            throw new Error('Error creando la mascota');
          }
        }
      }

      const body: any = {
        tutorName: name,
        tutorEmail: email,
        tutorPhone: phone,
        tutorRut: rut || null,
        tutorAddress: address || null,
        reason,
        professionalId,
        consultationTypeId: Number(selectedConsultationType)
      };

      // Si tenemos petId (mascota existente o recién creada), usar esa mascota
      if (petId && existingTutor) {
        body.existingPetId = Number(petId);
      } else {
        // Cliente nuevo con mascota nueva - enviar datos de mascota
        body.petName = petName;
        body.petType = petType;
        body.petBreed = petBreed || null;
        body.petAge = petAge ? Number(petAge) : null;
        body.petWeight = petWeight ? Number(petWeight) : null;
        body.petSex = petSex || null;
        body.petBirthDate = petBirthDate || null;
      }

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
      
      {/* Email verificación */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Verificación de Cliente</h4>
        <div className="flex gap-2">
          <input 
            value={email} 
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailChecked(false);
              setExistingTutor(null);
            }} 
            placeholder="Email del cliente" 
            type="email" 
            className="flex-1 p-2 border rounded" 
            required 
          />
          <button 
            type="button" 
            onClick={checkEmailExists}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            Verificar
          </button>
        </div>
        {existingTutor && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
            ✓ Cliente encontrado: <strong>{existingTutor.name}</strong>
            {existingTutor.pets.length > 0 && ` (${existingTutor.pets.length} mascota${existingTutor.pets.length > 1 ? 's' : ''})`}
          </div>
        )}
      </div>

      {emailChecked && (
        <>
          {/* Datos del Cliente */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Datos del Cliente</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Nombre completo" 
                className="w-full p-2 border rounded" 
                required 
                disabled={!!existingTutor}
              />
              <input 
                value={rut} 
                onChange={e => setRut(e.target.value)} 
                placeholder="RUT (opcional)" 
                className="w-full p-2 border rounded" 
                disabled={!!existingTutor}
              />
              <input 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Teléfono" 
                className="w-full p-2 border rounded" 
                required 
                disabled={!!existingTutor}
              />
              <div></div> {/* Spacer */}
            </div>
            <textarea 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder="Dirección (opcional)" 
              className="w-full p-2 border rounded mt-2" 
              rows={2} 
              disabled={!!existingTutor}
            />
          </div>

          {/* Selección de Mascota */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Selección de Mascota</h4>
            
            {existingTutor && existingTutor.pets.length > 0 && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Mascotas existentes</label>
                <select 
                  value={selectedPetId} 
                  onChange={(e) => {
                    setSelectedPetId(e.target.value);
                    setIsNewPet(false);
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="">-- Selecciona una mascota --</option>
                  {existingTutor.pets.map(pet => (
                    <option key={pet.id} value={String(pet.id)}>
                      {pet.name} ({pet.type}{pet.breed ? `, ${pet.breed}` : ''})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <input 
                type="checkbox" 
                id="newPet"
                checked={isNewPet}
                onChange={(e) => {
                  setIsNewPet(e.target.checked);
                  if (e.target.checked) {
                    setSelectedPetId('');
                  }
                }}
              />
              <label htmlFor="newPet" className="text-sm">Nueva mascota</label>
            </div>

            {isNewPet && (
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-2">Datos de la Nueva Mascota</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input 
                    value={petName} 
                    onChange={e => setPetName(e.target.value)} 
                    placeholder="Nombre de la mascota" 
                    className="w-full p-2 border rounded" 
                    required={isNewPet}
                  />
                  <select 
                    value={petType} 
                    onChange={e => setPetType(e.target.value)} 
                    className="w-full p-2 border rounded" 
                    required={isNewPet}
                  >
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
                  <input 
                    value={petBreed} 
                    onChange={e => setPetBreed(e.target.value)} 
                    placeholder="Raza (opcional)" 
                    className="w-full p-2 border rounded" 
                  />
                  <input 
                    value={petAge} 
                    onChange={e => setPetAge(e.target.value)} 
                    placeholder="Edad en años (opcional)" 
                    type="number" 
                    min="0" 
                    max="30" 
                    className="w-full p-2 border rounded" 
                  />
                  <input 
                    value={petWeight} 
                    onChange={e => setPetWeight(e.target.value)} 
                    placeholder="Peso en kg (opcional)" 
                    type="number" 
                    min="0" 
                    max="200" 
                    step="0.1" 
                    className="w-full p-2 border rounded" 
                  />
                  <select 
                    value={petSex} 
                    onChange={e => setPetSex(e.target.value)} 
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Seleccionar sexo (opcional)</option>
                    <option value="macho">Macho</option>
                    <option value="hembra">Hembra</option>
                    <option value="castrado">Castrado</option>
                    <option value="castrada">Castrada</option>
                  </select>
                </div>
                <input 
                  value={petBirthDate} 
                  onChange={e => setPetBirthDate(e.target.value)} 
                  placeholder="Fecha de nacimiento (opcional)" 
                  type="date" 
                  className="w-full p-2 border rounded mt-2" 
                />
              </div>
            )}
          </div>
        </>
      )}

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
                {type.name} ({type.duration || 30} min) - {formatPrice(type.price)}
              </option>
            ))}
          </select>
          {selectedType && selectedType.description && (
            <p className="text-sm text-gray-600 mt-1">{selectedType.description}</p>
          )}
          {selectedType && (
            <div className="space-y-1 mt-1">
              <p className="text-sm font-semibold text-pink-600">
                Precio: {formatPrice(selectedType.price)}
              </p>
              <p className="text-sm text-gray-600">
                Duración estimada: {selectedType.duration || 30} minutos
              </p>
            </div>
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

      {emailChecked && (
        <>
          <textarea 
            value={reason} 
            onChange={e => setReason(e.target.value)} 
            placeholder="Motivo de la consulta" 
            className="w-full p-2 border mb-2 rounded" 
          />
          
          <button 
            type="submit"
            className="bg-gradient-to-r from-pink-500 to-pink-600 text-white w-full sm:w-auto px-3 py-2 rounded text-sm hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-200/50"
            disabled={!emailChecked}
          >
            Reservar
          </button>
        </>
      )}

      {!emailChecked && (
        <div className="text-center text-gray-500 text-sm">
          Primero verifica tu correo electrónico para continuar
        </div>
      )}

      {message && (
        <p className={`mt-3 text-sm ${message.includes('correctamente') ? 'text-green-600' : message.includes('encontrado') ? 'text-blue-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
