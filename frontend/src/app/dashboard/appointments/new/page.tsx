"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '../../../../lib/api';
import { useAuthContext } from '../../../../lib/auth-context';
import { useConsultationTypes } from '../../../../hooks/useData';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tutor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  pets: Pet[];
}

interface Pet {
  id: number;
  name: string;
  type: string;
  breed?: string;
}

interface ConsultationType {
  id: number;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

interface AvailabilitySlot {
  id: number;
  start: string;
  end: string;
}

export default function NewAppointmentPage() {
  const { userId } = useAuthContext();
  const router = useRouter();
  const { consultationTypes, isLoading: typesLoading } = useConsultationTypes();
  
  // Estados del formulario
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [selectedTutorId, setSelectedTutorId] = useState<string>('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [selectedConsultationTypeId, setSelectedConsultationTypeId] = useState<string>('');
  const [reason, setReason] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  // Estados de carga y datos
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    async function loadInitialData() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const [tutorsRes, slotsRes] = await Promise.all([
          authFetch('/tutors'),
          authFetch(`/availability/${userId}`)
        ]);

        if (tutorsRes.ok) {
          const tutorsData = await tutorsRes.json();
          setTutors(tutorsData);
        }

        if (slotsRes.ok) {
          const slotsData = await slotsRes.json();
          setAvailableSlots(slotsData);
        }

      } catch (err) {
        console.error('Error loading data:', err);
        setError('Error cargando los datos');
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [userId]);

  // Obtener tutor seleccionado
  const selectedTutor = tutors.find(t => t.id === Number(selectedTutorId));

  // Filtrar slots por fecha seleccionada
  const slotsForSelectedDate = availableSlots.filter(slot => {
    if (!selectedDate) return false;
    const slotDate = new Date(slot.start).toISOString().split('T')[0];
    return slotDate === selectedDate;
  });

  // Filtrar slots disponibles según la duración del tipo de consulta seleccionado
  const filteredAvailableSlots = (() => {
    if (!selectedConsultationTypeId) return availableSlots;
    const selectedType = consultationTypes.find((t: ConsultationType) => t.id === Number(selectedConsultationTypeId));
    const durationMinutes = selectedType?.duration || 30;
    const slotsNeeded = Math.ceil(durationMinutes / 30);

    // Build a set of available slot start timestamps for quick lookup
    const slotStarts = new Set(availableSlots.map(s => new Date(s.start).getTime()));

    return availableSlots.filter(slot => {
      const startMs = new Date(slot.start).getTime();
      for (let i = 0; i < slotsNeeded; i++) {
        const neededStart = startMs + i * 30 * 60 * 1000;
        if (!slotStarts.has(neededStart)) return false;
      }
      return true;
    });
  })();

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTutorId || !selectedPetId || !selectedConsultationTypeId || !reason) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (!selectedSlotId && (!selectedDate || !selectedTime)) {
      setError('Debes seleccionar un horario disponible o especificar fecha y hora');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const body: any = {
        tutorId: Number(selectedTutorId),
        petId: Number(selectedPetId),
        reason,
        consultationTypeId: Number(selectedConsultationTypeId)
      };

      if (selectedSlotId) {
        body.slotId = Number(selectedSlotId);
      } else {
        // Combinar fecha y hora
        const dateTime = new Date(`${selectedDate}T${selectedTime}`);
        body.date = dateTime.toISOString();
      }

      const response = await authFetch('/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creando la cita');
      }

      setSuccess('Cita creada exitosamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/appointments');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Error creando la cita');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || typesLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Cita</h1>
          <p className="text-gray-600 mt-1">Crear una nueva cita para un cliente</p>
        </div>
        <Link
          href="/dashboard/appointments"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Volver a Citas
        </Link>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select
              value={selectedTutorId}
              onChange={(e) => {
                setSelectedTutorId(e.target.value);
                setSelectedPetId(''); // Reset pet selection
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar cliente...</option>
              {tutors.map(tutor => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.name} {tutor.email && `(${tutor.email})`}
                </option>
              ))}
            </select>
          </div>

          {/* Mascota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mascota *
            </label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={!selectedTutorId}
            >
              <option value="">Seleccionar mascota...</option>
              {selectedTutor?.pets.map(pet => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.type}{pet.breed ? `, ${pet.breed}` : ''})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Consulta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Consulta *
            </label>
            <select
                value={selectedConsultationTypeId}
                onChange={(e) => {
                  // When changing consultation type, clear any previously selected slot
                  setSelectedConsultationTypeId(e.target.value);
                  setSelectedSlotId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
              <option value="">Seleccionar tipo...</option>
              {consultationTypes.map((type: ConsultationType) => (
                <option key={type.id} value={type.id}>
                  {type.name} - ${(type.price / 100).toLocaleString('es-CL')} ({type.duration || 30} min)
                </option>
              ))}
            </select>
          </div>

          {/* Horario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horario *
            </label>
            <div className="space-y-2">
              {/* Opción 1: Seleccionar de slots disponibles */}
              <div>
                <label className="text-sm text-gray-600">Seleccionar de horarios disponibles:</label>
                <select
                  value={selectedSlotId}
                  onChange={(e) => {
                    setSelectedSlotId(e.target.value);
                    if (e.target.value) {
                      setSelectedDate('');
                      setSelectedTime('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar horario disponible...</option>
                  {filteredAvailableSlots.map(slot => {
                    const start = new Date(slot.start);
                    const end = new Date(slot.end);
                    return (
                      <option key={slot.id} value={slot.id}>
                        {start.toLocaleDateString('es-CL')} - {start.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })} a {end.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Divisor */}
              <div className="text-center text-gray-500 text-sm">o</div>

              {/* Opción 2: Especificar fecha y hora manual */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (e.target.value) {
                        setSelectedSlotId('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => {
                      setSelectedTime(e.target.value);
                      if (e.target.value) {
                        setSelectedSlotId('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivo de la consulta */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de la Consulta *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe el motivo de la consulta..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 mt-8">
          <Link
            href="/dashboard/appointments"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Creando...' : 'Crear Cita'}
          </button>
        </div>
      </form>
    </div>
  );
}