"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '../lib/auth-context';
import { authFetch } from '../lib/api';
import { filterActiveSlots, formatChileDate, formatChileTime, createLocalDateTime, getTodayString } from '../lib/timezone';
import { useAvailability, invalidateCache } from '../hooks/useData';

interface AvailabilitySlot {
  id: number;
  start: string;
  end: string;
  createdAt: string;
}

export default function AvailabilityManager() {
  const { userId } = useAuthContext();
  const { availability, isLoading: dataLoading, revalidate } = useAvailability(userId);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Form states
  const [startDate, setStartDate] = useState(() => getTodayString());
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(() => getTodayString());
  const [endTime, setEndTime] = useState('10:00');
  const [recurring, setRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<string[]>([]);

  const daysOfWeek = [
    { id: 'monday', label: 'Lunes' },
    { id: 'tuesday', label: 'Martes' },
    { id: 'wednesday', label: 'Miércoles' },
    { id: 'thursday', label: 'Jueves' },
    { id: 'friday', label: 'Viernes' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
  ];

  // Actualizar slots cuando cambien los datos de SWR
  useEffect(() => {
    if (availability) {
      // Filtrar horarios expirados usando timezone de Chile
      const activeSlots = filterActiveSlots(availability || []);
      // ensure slots are sorted
      const sorted = activeSlots.sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());
      setSlots(sorted as AvailabilitySlot[]);
    }
  }, [availability]);

  function formatDateTime(date: string, time: string) {
    // Use createLocalDateTime to avoid timezone conversion issues
    return createLocalDateTime(date, time).toISOString();
  }

  async function createSlot(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (recurring && recurringDays.length === 0) {
        setError('Selecciona al menos un día para la disponibilidad recurrente');
        setLoading(false);
        return;
      }

      if (recurring) {
        // Create recurring slots for each selected day
        const promises = recurringDays.map(async dayId => {
          const dayIndex = daysOfWeek.findIndex(d => d.id === dayId);
          if (dayIndex === -1) return Promise.resolve(null);

          // daysOfWeek starts with monday (index 0). JS getDay: 0=Sunday..6=Saturday
          const targetWeekday = (dayIndex + 1) % 7; // monday->1, sunday->0

          // Use createLocalDateTime to avoid timezone issues
          const startBase = createLocalDateTime(startDate, '00:00');
          const endBase = createLocalDateTime(endDate, '00:00');

          const daysToAdd = (targetWeekday - startBase.getDay() + 7) % 7;
          startBase.setDate(startBase.getDate() + daysToAdd);
          endBase.setDate(endBase.getDate() + daysToAdd);

          const start = formatDateTime(startBase.toISOString().split('T')[0], startTime);
          const end = formatDateTime(endBase.toISOString().split('T')[0], endTime);

          try {
            const res = await authFetch('/availability', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, start, end }),
            });
            
            if (!res.ok) {
              const errorData = await res.json().catch(() => ({ error: 'Error al crear disponibilidad recurrente' }));
              throw new Error(errorData.error || 'Error al crear disponibilidad recurrente');
            }
            
            return res.json();
          } catch (err) {
            console.error('Error creating recurring slot', err);
            throw err;
          }
        });

        const results = await Promise.all(promises);
        
        // Check if all slots were created successfully
        const hasErrors = results.some(result => result === null);
        if (hasErrors) {
          setError('Algunos horarios recurrentes no pudieron crearse');
          return;
        }
      } else {
        // Create single slot
        const start = formatDateTime(startDate, startTime);
        const end = formatDateTime(endDate, endTime);

        const res = await authFetch('/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, start, end }),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Error al crear disponibilidad' }));
          setError(errorData.error || 'Error al crear disponibilidad');
          return;
        }
      }
      
      // Reset form with default values
      setStartDate(getTodayString());
      setStartTime('09:00');
      setEndDate(getTodayString());
      setEndTime('10:00');
      setRecurring(false);
      setRecurringDays([]);
      setShowForm(false);
      
      // Force immediate reload to show new data - invalidate first then revalidate
      if (userId) {
        invalidateCache.availability(userId);
        await revalidate();
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  async function deleteSlot(id: number) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta disponibilidad?')) return;
    
    try {
      const res = await authFetch(`/availability/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Force immediate reload - invalidate first then revalidate
        if (userId) {
          invalidateCache.availability(userId);
          await revalidate();
        }
      } else {
        setError('Error al eliminar la disponibilidad');
      }
    } catch (err) {
      console.error('Error deleting slot:', err);
      setError('Error de conexión al eliminar');
    }
  }

  function toggleRecurringDay(day: string) {
    setRecurringDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  }

  // Set default times
  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setStartTime('09:00');
    setEndTime('17:00');
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Disponibilidad</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-200/50"
        >
          {showForm ? 'Cancelar' : '+ Agregar Horario'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Nueva Disponibilidad</h4>
          
          <form onSubmit={createSlot} className="space-y-4">
            {/* Recurring Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={recurring}
                onChange={e => setRecurring(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                Disponibilidad recurrente (misma hora todos los días seleccionados)
              </label>
            </div>

            {/* Date and Time Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Inicio
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Recurring Days */}
            {recurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de la Semana
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {daysOfWeek.map(day => (
                    <label key={day.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={recurringDays.includes(day.id)}
                        onChange={() => toggleRecurringDay(day.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creando...' : 'Crear Disponibilidad'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slots List */}
      <div className="space-y-2">
        {slots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">⏰</div>
            <p>No hay horarios de disponibilidad</p>
            <p className="text-sm">Agrega tu primer horario para comenzar a recibir citas</p>
          </div>
        ) : (
          slots.map(slot => (
            <div key={slot.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">
                    {formatChileDate(new Date(slot.start), {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatChileTime(new Date(slot.start))} - {formatChileTime(new Date(slot.end))}
                  </div>
                </div>
                <button
                  onClick={() => deleteSlot(slot.id)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
