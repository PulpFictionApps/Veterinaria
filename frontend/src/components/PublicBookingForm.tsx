"use client";

import { useState, useEffect } from 'react';
import { API_BASE } from '../lib/api';
import { filterActiveSlots, formatChileDate, formatChileTime } from '../lib/timezone';
import { formatChileanPhone, validateChileanPhone, formatRutChile, validateRutChile } from '../lib/chilean-validation';
import { usePublicAvailability, useConsultationTypes, invalidateCache } from '../hooks/useData';
import ThemedCard from './ui/ThemedCard';
import ThemedInput from './ui/ThemedInput';
import ThemedButton from './ui/ThemedButton';

interface ConsultationType {
  id: number;
  name: string;
  price: number; // price in CLP (same unit used in /consultation-types)
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

interface ProfessionalColors {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  professionalName: string;
}

export default function PublicBookingForm({ professionalId }: { professionalId: number }) {
  // Usar hooks SWR para datos en tiempo real
  const { availability, isLoading: availabilityLoading, revalidate: revalidateAvailability } = usePublicAvailability(professionalId.toString());
  const { consultationTypes, isLoading: consultationTypesLoading } = useConsultationTypes();

  const [email, setEmail] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [existingTutor, setExistingTutor] = useState<TutorData | null>(null);
  const [colors, setColors] = useState<ProfessionalColors>({
    primaryColor: '#1f2937',
    secondaryColor: '#2563eb', 
    accentColor: '#3b82f6',
    professionalName: 'Profesional'
  });
  
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
  const [petReproductiveStatus, setPetReproductiveStatus] = useState('');
  const [petBirthDate, setPetBirthDate] = useState('');
  
  // Cita
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Array<{ id: number; start: string; end: string }>>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedConsultationType, setSelectedConsultationType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [rutError, setRutError] = useState('');

  // Funciones para manejar formateo en tiempo real
  const handlePhoneChange = (value: string) => {
    const formatted = formatChileanPhone(value);
    setPhone(formatted);
    
    // Validar en tiempo real
    const validation = validateChileanPhone(formatted);
    setPhoneError(validation.isValid ? '' : validation.message || '');
  };

  const handleRutChange = (value: string) => {
    const formatted = formatRutChile(value);
    setRut(formatted);
    
    // Validar en tiempo real solo si tiene contenido significativo
    if (formatted.length > 2) {
      const validation = validateRutChile(formatted);
      setRutError(validation.isValid ? '' : validation.message || '');
    } else {
      setRutError('');
    }
  };

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
        setPhone(formatChileanPhone(tutorData.phone || ''));
        setRut(formatRutChile(tutorData.rut || ''));
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setMessage(message || 'Error al verificar email');
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

    // Validar datos obligatorios del cliente
    if (!email || !phone || !name || !rut || !address) {
      setMessage('Todos los datos del cliente son obligatorios: email, nombre, teléfono, RUT y dirección');
      return;
    }

    // Validar formato de teléfono
    const phoneValidation = validateChileanPhone(phone);
    if (!phoneValidation.isValid) {
      setMessage(phoneValidation.message || 'Teléfono inválido');
      return;
    }

    // Validar formato de RUT
    const rutValidation = validateRutChile(rut);
    if (!rutValidation.isValid) {
      setMessage(rutValidation.message || 'RUT inválido');
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

    if (isNewPet && (!petName || !petType || !petBreed || !petAge || !petWeight || !petSex || !petReproductiveStatus || !petBirthDate)) {
      setMessage('Todos los datos de la mascota son obligatorios: nombre, tipo, raza, edad, peso, sexo, estado reproductivo y fecha de nacimiento');
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
              breed: petBreed,
              age: Number(petAge),
              weight: Number(petWeight),
              sex: petSex,
              reproductiveStatus: petReproductiveStatus,
              birthDate: petBirthDate,
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

      const body: Record<string, unknown> = {
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
        body.petBreed = petBreed;
        body.petAge = Number(petAge);
        body.petWeight = Number(petWeight);
        body.petSex = petSex;
        body.petReproductiveStatus = petReproductiveStatus;
        body.petBirthDate = petBirthDate;
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
      
      // Revalidar disponibilidad inmediatamente después de reservar
      await revalidateAvailability();
      invalidateCache.availability(professionalId);
      
      // Limpiar slots locales para forzar actualización
      setSlots([]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setMessage(message || 'Error');
    }
  }

  // Actualizar slots cuando cambien los datos de disponibilidad
  useEffect(() => {
    if (availability) {
      const activeSlots = filterActiveSlots(availability || []);
      setSlots(activeSlots);
    }
  }, [availability]);

  // Cargar colores del profesional
  useEffect(() => {
    async function loadColors() {
      try {
        const colorsRes = await fetch(`${API_BASE}/users/public/${professionalId}/colors`);
        if (colorsRes.ok) {
          const colorsData = await colorsRes.json();
          setColors(colorsData);
        }
      } catch (err) {
        console.error('Error loading professional colors:', err);
      }
    }
    loadColors();
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
    // price is stored in CLP (e.g. 25000)
    return Number(priceInCents).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP'
    });
  }

  const selectedType = consultationTypes.find((t: ConsultationType) => t.id === Number(selectedConsultationType));

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-full sm:max-w-2xl mx-auto">
      <ThemedCard className="p-6">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: colors.primaryColor || '#1f2937' }}>Reservar hora</h3>
          <div style={{ borderBottom: `2px solid ${colors.accentColor || '#3b82f6'}`, marginTop: 6 }} />
        </div>

        {/* Diseño en dos columnas: formulario + resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

        {/* Email verificación */}
        <div className="mb-4 sm:mb-6">
          <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-2 sm:mb-3">Verificación de Cliente</h4>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <ThemedInput
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailChecked(false); setExistingTutor(null); }}
              placeholder="Email del cliente"
              type="email"
              required
              className="flex-1"
            />
            <ThemedButton onClick={checkEmailExists} className="w-full sm:w-auto" style={{ backgroundColor: colors.primaryColor }}>
              Verificar
            </ThemedButton>
          </div>
          {existingTutor && (
          <div 
            className="mt-2 p-2 border rounded text-sm"
            style={{
              backgroundColor: colors.accentColor ? `${colors.accentColor}15` : '#f0f9ff',
              borderColor: colors.accentColor || '#bfdbfe',
              color: '#065f46'
            }}
          >
            ✓ Cliente encontrado: <strong>{existingTutor.name}</strong>
            {existingTutor.pets.length > 0 && ` (${existingTutor.pets.length} mascota${existingTutor.pets.length > 1 ? 's' : ''})`}
          </div>
        )}
      </div>

      {emailChecked && (
        <>
          {/* Datos del Cliente */}
          <div className="mb-4">
            <h4 
              className="text-sm font-semibold mb-2"
              style={{ color: colors.primaryColor || '#374151' }}
            >
              Datos del Cliente
            </h4>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Nombre completo" 
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-base touch-manipulation" 
                required 
                disabled={!!existingTutor}
              />
              <div>
                <input 
                  value={rut} 
                  onChange={e => handleRutChange(e.target.value)} 
                  placeholder="RUT * (ej: 12.345.678-9)" 
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-gray-500 text-base touch-manipulation ${rutError ? 'border-gray-500 focus:border-gray-500 focus:ring-gray-500' : 'border-gray-300 focus:border-gray-500'}`}
                  required
                  disabled={!!existingTutor}
                />
                {rutError && <p className="text-gray-500 text-xs mt-1">{rutError}</p>}
              </div>
              <div>
                <input 
                  value={phone} 
                  onChange={e => handlePhoneChange(e.target.value)} 
                  placeholder="Teléfono * (ej: +56 9 1234 5678)" 
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 text-base touch-manipulation ${phoneError ? 'border-gray-500 focus:border-gray-500 focus:ring-gray-500' : 'border-gray-300 focus:border-gray-500 focus:ring-gray-500'}`}
                  required 
                  disabled={!!existingTutor}
                />
                {phoneError && <p className="text-gray-500 text-xs mt-1">{phoneError}</p>}
              </div>
            </div>
            <textarea 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder="Dirección *" 
              className="w-full p-2 border rounded mt-2" 
              rows={2} 
              required
              // permitir editar la dirección si el tutor existe pero no tiene dirección registrada
              disabled={!!existingTutor && !!existingTutor.address}
            />
            {existingTutor && !existingTutor.address && (
              <p className="text-sm text-yellow-600 mt-2">El cliente no tiene dirección registrada. Por favor completa la dirección para poder reservar la cita.</p>
            )}
          </div>

          {/* Selección de Mascota */}
          <div className="mb-4">
            <h4 
              className="text-sm font-semibold mb-2"
              style={{ color: colors.primaryColor || '#374151' }}
            >
              Selección de Mascota
            </h4>
            
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
                <h5 
                  className="text-sm font-medium mb-2"
                  style={{ color: colors.primaryColor || '#6b7280' }}
                >
                  Datos de la Nueva Mascota
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  <input 
                    value={petName} 
                    onChange={e => setPetName(e.target.value)} 
                    placeholder="Nombre de la mascota *" 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-base touch-manipulation" 
                    required={isNewPet}
                  />
                  <select 
                    value={petType} 
                    onChange={e => setPetType(e.target.value)} 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-base touch-manipulation" 
                    required={isNewPet}
                  >
                    <option value="">Seleccionar especie *</option>
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
                    placeholder="Raza *" 
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-base touch-manipulation" 
                    required={isNewPet}
                  />
                  <input 
                    value={petAge} 
                    onChange={e => setPetAge(e.target.value)} 
                    placeholder="Edad en años *" 
                    type="number" 
                    min="0" 
                    max="30" 
                    className="w-full p-2 border rounded" 
                    required={isNewPet}
                  />
                  <input 
                    value={petWeight} 
                    onChange={e => setPetWeight(e.target.value)} 
                    placeholder="Peso en kg *" 
                    type="number" 
                    min="0" 
                    max="200" 
                    step="0.1" 
                    className="w-full p-2 border rounded" 
                    required={isNewPet}
                  />
                  <select 
                    value={petSex} 
                    onChange={e => setPetSex(e.target.value)} 
                    className="w-full p-2 border rounded"
                    required={isNewPet}
                  >
                    <option value="">Seleccionar sexo *</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                  <select 
                    value={petReproductiveStatus} 
                    onChange={e => setPetReproductiveStatus(e.target.value)} 
                    className="w-full p-2 border rounded"
                    required={isNewPet}
                  >
                    <option value="">Estado reproductivo *</option>
                    <option value="Sin intervenciones">Sin intervenciones</option>
                    <option value="Castrado">Castrado</option>
                    <option value="Esterilizada">Esterilizada</option>
                  </select>
                </div>
                
                {/* Campo de fecha de nacimiento mejorado */}
                <div className="mt-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-500 text-lg">📅</span>
                      <div>
                        <h6 className="text-sm font-medium text-gray-800 mb-1">
                          Fecha de nacimiento *
                        </h6>
                        <p className="text-xs text-gray-600">
                          Si no conoce la fecha exacta, puede ingresar una fecha aproximada. 
                          Esta información nos ayuda a brindar un mejor cuidado a su mascota.
                        </p>
                      </div>
                    </div>
                  </div>
                  <input 
                    value={petBirthDate} 
                    onChange={e => setPetBirthDate(e.target.value)} 
                    type="date" 
                    className="w-full p-2 border rounded focus:border-gray-400 focus:ring-1 focus:ring-gray-400" 
                    max={new Date().toISOString().split('T')[0]}
                    required={isNewPet}
                  />
                </div>
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
            {consultationTypes.map((type: ConsultationType) => (
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
              <p 
                className="text-sm font-semibold"
                style={{ color: colors.primaryColor || '#ec4899' }}
              >
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
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm sm:text-base font-medium mb-2 sm:mb-3">Selecciona un horario disponible</label>
          <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-base touch-manipulation" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required>
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
          
          {/* El botón de enviar principal se muestra en el resumen lateral */}
        </>
      )}

      {!emailChecked && (
        <div className="text-center text-gray-500 text-sm">
          Primero verifica tu correo electrónico para continuar
        </div>
      )}


          </div>

          {/* Resumen lateral */}
          <aside className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <ThemedCard className="p-4">
                <h4 className="text-sm font-semibold mb-2">Resumen de la reserva</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Profesional</div>
                    <div className="font-medium">{colors.professionalName || 'Profesional'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Tipo de consulta</div>
                    <div className="font-medium">{selectedType?.name || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Precio</div>
                    <div className="font-medium">{selectedType ? formatPrice(selectedType.price) : '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Duración</div>
                    <div className="font-medium">{selectedType?.duration || 30} minutos</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Horario</div>
                    <div className="font-medium">
                      {selectedSlot ? (slots.find(s => String(s.id) === selectedSlot) ? formatOptionLabel(slots.find(s => String(s.id) === selectedSlot)!) : selectedSlot) : (date ? date : '—')}
                    </div>
                  </div>
                </div>
              </ThemedCard>

              <div>
                <ThemedButton type="submit" variant="primary" size="md" className="w-full">
                  Reservar
                </ThemedButton>
              </div>
            </div>
          </aside>

        </div>
      </ThemedCard>

  {message && (
        <p className={`mt-3 text-sm ${message.includes('correctamente') ? 'text-gray-600' : message.includes('encontrado') ? 'text-gray-600' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
