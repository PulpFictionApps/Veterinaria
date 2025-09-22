"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '../../../lib/api';
import { useAuthContext } from '../../../lib/auth-context';
import Link from 'next/link';

interface Appointment {
  id: number;
  date: string;
  reason: string;
  pet: {
    id: number;
    name: string;
    type: string;
    breed?: string;
  };
  tutor: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  };
  createdAt: string;
}

export default function AppointmentsPage() {
  const { userId } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadAppointments() {
      if (!userId) return;
      
      setLoading(true);
      try {
        const res = await authFetch(`/appointments/${userId}`);
        if (res.ok) {
          const data: Appointment[] = await res.json();
          setAppointments(data || []);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, [userId]);

  function filterAppointments(appointments: Appointment[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      
      // Search filter
      if (searchTerm && !appointment.pet.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !appointment.tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !appointment.reason.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Date filter
      switch (filter) {
        case 'today':
          return appointmentDate.toDateString() === today.toDateString();
        case 'upcoming':
          return appointmentDate >= today;
        case 'past':
          return appointmentDate < today;
        default:
          return true;
      }
    });
  }

  function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  }

  function getAppointmentStatus(dateString: string) {
    const appointmentDate = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (appointmentDate < today) {
      return { status: 'past', color: 'text-gray-500', bg: 'bg-gray-100' };
    } else if (appointmentDate.toDateString() === today.toDateString()) {
      return { status: 'today', color: 'text-blue-600', bg: 'bg-blue-50' };
    } else {
      return { status: 'upcoming', color: 'text-green-600', bg: 'bg-green-50' };
    }
  }

  const filteredAppointments = filterAppointments(appointments);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Cargando citas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Citas</h1>
        <Link
          href="/dashboard/appointments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nueva Cita
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por mascota, tutor o motivo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'today', label: 'Hoy' },
              { key: 'upcoming', label: 'Próximas' },
              { key: 'past', label: 'Pasadas' }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron citas' : 'No hay citas'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza creando tu primera cita o configura tu disponibilidad'
            }
          </p>
          {!searchTerm && (
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard/appointments/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Cita
              </Link>
              <Link
                href="/dashboard/availability"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Configurar Disponibilidad
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map(appointment => {
            const { date, time } = formatDateTime(appointment.date);
            const status = getAppointmentStatus(appointment.date);
            
            return (
              <div key={appointment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{appointment.pet.name}</h3>
                    <p className="text-sm text-gray-600">
                      {appointment.pet.type} {appointment.pet.breed && `• ${appointment.pet.breed}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                      {status.status === 'today' ? 'Hoy' : 
                       status.status === 'upcoming' ? 'Próxima' : 'Pasada'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600">
                      ⋮
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">📅 Fecha y Hora</h4>
                    <p className="text-sm text-gray-900">{date}</p>
                    <p className="text-sm text-gray-600">{time}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">👤 Tutor</h4>
                    <p className="text-sm text-gray-900">{appointment.tutor.name}</p>
                    {appointment.tutor.phone && (
                      <p className="text-sm text-gray-600">{appointment.tutor.phone}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">📝 Motivo</h4>
                  <p className="text-sm text-gray-900">{appointment.reason}</p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/clients/${appointment.tutor.id}/pets/${appointment.pet.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver Ficha de la Mascota
                  </Link>
                  <Link
                    href={`/dashboard/clients/${appointment.tutor.id}`}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Ver Cliente
                  </Link>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Cancelar Cita
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
