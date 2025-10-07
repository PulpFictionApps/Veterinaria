"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '../../../lib/api';
import { useAuthContext } from '../../../lib/auth-context';
import Link from 'next/link';
import { 
  CalendarDays, 
  Search, 
  Clock, 
  User, 
  Stethoscope, 
  PlusCircle,
  FileText,
  Phone,
  Calendar,
  Settings,
  Heart,
  AlertCircle,
  ChevronRight,
  Filter,
  Eye,
  Edit3,
  Trash2,
  ArrowRight,
  DollarSign,
  MapPin
} from 'lucide-react';
import { FadeIn, SlideIn, Stagger, AnimateOnView } from '../../../components/ui/Transitions';
import Tooltip from '../../../components/ui/Tooltip';
import ThemedCard from '../../../components/ui/ThemedCard';
import ThemedButton from '../../../components/ui/ThemedButton';
import ThemedInput from '../../../components/ui/ThemedInput';
import PageHeader from '../../../components/ui/PageHeader';

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
  consultationType?: {
    id: number;
    name: string;
    price: number;
    description?: string;
  };
  createdAt: string;
  status?: string;
}

export default function AppointmentsPage() {
  const { userId } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<null | Appointment>(null);
  const [editDate, setEditDate] = useState('');
  const [editSlotId, setEditSlotId] = useState<number | ''>('');
  const [availableSlots, setAvailableSlots] = useState<Array<{ id: number; start: string; end: string }>>([]);
  const [editReason, setEditReason] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
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

    async function deleteAppointment(id: number) {
      if (!confirm('¿Eliminar esta cita?')) return;
      try {
        const res = await authFetch(`/appointments/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setAppointments(prev => prev.filter(a => a.id !== id));
        } else {
          const err = await res.json().catch(() => ({ error: 'Error' }));
          alert(err.error || 'Error eliminando cita');
        }
      } catch (err) {
        console.error('Error deleting appointment:', err);
        alert('Error eliminando cita');
      }
    }

    function openEdit(appointment: Appointment) {
      setEditing(appointment);
      setEditDate(appointment.date);
      setEditSlotId('');
      setEditReason(appointment.reason || '');
      // Load available slots for this professional
      (async () => {
        try {
          const res = await authFetch(`/availability/${appointment.tutor.id}`);
          if (res.ok) {
            const slots = await res.json();
            setAvailableSlots(slots || []);
          }
        } catch (err) {
          console.error('Error loading available slots', err);
          setAvailableSlots([]);
        }
      })();
    }

    async function submitEdit() {
      if (!editing) return;
      try {
        const payload: any = { reason: editReason };
        // prefer slotId when provided to avoid timezone/precision issues
        if (editSlotId) payload.slotId = Number(editSlotId);
        else payload.date = editDate;

        const res = await authFetch(`/appointments/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Error' }));
          alert(err.error || 'Error actualizando cita');
          return;
        }
        const updated = await res.json();
        setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
        setEditing(null);
      } catch (err) {
        console.error('Error updating appointment:', err);
        alert('Error actualizando cita');
      }
    }

  function filterAppointments(appointments: Appointment[]) {
    const now = new Date();
    
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
        case 'upcoming':
          return appointmentDate >= now;
        case 'past':
          return appointmentDate < now;
        default:
          return true;
      }
    });
  }

  function formatPrice(priceInCents: number) {
    return (priceInCents / 100).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP'
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
    
    if (appointmentDate < now) {
      return { status: 'past', color: 'text-gray-500', bg: 'bg-gray-100' };
    } else {
      return { status: 'upcoming', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  }

  const filteredAppointments = filterAppointments(appointments);

  if (loading) {
    return (
      <FadeIn>
        <div className="vet-page">
          <div className="vet-container">
            <div className="flex justify-center items-center py-20">
              <div className="vet-card-unified p-8">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-600"></div>
                    <Stethoscope className="h-6 w-6 text-gray-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-6 text-gray-600 font-medium">Cargando agenda médica...</p>
                  <p className="mt-2 text-sm text-gray-400">Preparando vista de citas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="vet-page">
      <div className="vet-container">
        {/* Medical Header */}
        <PageHeader 
          title="Agenda de Citas Médicas"
          subtitle="Gestiona las consultas veterinarias programadas"
          icon={CalendarDays}
          actions={
            <div className="flex gap-3">
              <Tooltip content="Configurar disponibilidad">
                <Link href="/dashboard/calendar">
                  <ThemedButton
                    variant="outline"
                    icon={Settings}
                    className="group"
                  >
                    Disponibilidad
                  </ThemedButton>
                </Link>
              </Tooltip>
              
              <Tooltip content="Nueva cita médica">
                <Link href="/dashboard/appointments/new">
                  <ThemedButton
                    variant="primary"
                    icon={PlusCircle}
                    className="group"
                  >
                    Nueva Cita
                  </ThemedButton>
                </Link>
              </Tooltip>
            </div>
          }
        />

        {/* Advanced Search and Filters */}
        <SlideIn direction="up" delay={0.1}>
          <div className="mb-8">
            <div className="vet-card-unified p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search Bar */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por mascota, tutor o motivo de consulta..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="vet-input-unified pl-12"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" style={{position: 'absolute'}} />
                </div>
                
                {/* Filter Buttons */}
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'Todas', icon: CalendarDays },
                    { key: 'upcoming', label: 'Próximas', icon: Clock },
                    { key: 'past', label: 'Completadas', icon: FileText }
                  ].map((filterOption) => {
                    const Icon = filterOption.icon;
                    return (
                      <Tooltip key={filterOption.key} content={`Ver citas ${filterOption.label.toLowerCase()}`}>
                        <button
                          onClick={() => setFilter(filterOption.key as any)}
                          className={`group px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                            filter === filterOption.key
                              ? 'bg-gray-700 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${filter === filterOption.key ? 'text-white' : 'text-gray-500'} group-hover:scale-110 transition-transform duration-300`} />
                          {filterOption.label}
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </SlideIn>

        {/* Appointments Display */}
        {filteredAppointments.length === 0 ? (
          <AnimateOnView>
            <div className="vet-card-unified p-12 text-center">
              <div className="p-6 bg-gray-100 rounded-lg inline-block mb-6">
                <CalendarDays className="h-16 w-16 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {searchTerm ? 'No se encontraron citas' : 'Agenda sin citas'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda para encontrar las citas que buscas'
                  : 'Comienza programando tu primera consulta veterinaria o configura tu disponibilidad'
                }
              </p>
              {!searchTerm && (
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/dashboard/appointments/new"
                    className="vet-btn-unified vet-btn-primary-unified group"
                  >
                    <PlusCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Programar Primera Cita
                  </Link>
                  <Link
                    href="/dashboard/calendar"
                    className="vet-btn-unified vet-btn-outline-unified group"
                  >
                    <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    Configurar Disponibilidad
                  </Link>
                </div>
              )}
            </div>
          </AnimateOnView>
        ) : (
          <Stagger className="space-y-6">
            {filteredAppointments.map(appointment => {
              const { date, time } = formatDateTime(appointment.date);
              const status = getAppointmentStatus(appointment.date);
              const isPast = status.status === 'past';
              
              return (
                <div key={appointment.id} className="vet-card-unified p-6 group">
                  {/* Appointment Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${isPast ? 'bg-gray-100' : 'bg-gray-100'}`}>
                        <Heart className={`h-6 w-6 ${isPast ? 'text-gray-400' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{appointment.pet.name}</h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {appointment.pet.type} {appointment.pet.breed && `• ${appointment.pet.breed}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        isPast 
                          ? 'bg-gray-100 text-gray-600' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isPast ? 'Completada' : 'Programada'}
                      </span>
                      
                      {!isPast && (
                        <Tooltip content="Iniciar consulta médica">
                          <Link 
                            href={`/dashboard/appointments/${appointment.id}/consult`} 
                            className="vet-btn-unified vet-btn-primary-unified text-sm group"
                          >
                            <Stethoscope className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                            Consultar
                          </Link>
                        </Tooltip>
                      )}
                      
                      <Tooltip content="Editar cita">
                        <Link 
                          href={`/dashboard/appointments/${appointment.id}/edit`} 
                          className="group p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-300"
                        >
                          <Edit3 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        </Link>
                      </Tooltip>
                      
                      <Tooltip content="Eliminar cita">
                        <button 
                          onClick={() => deleteAppointment(appointment.id)} 
                          className="group p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Appointment Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-700">Fecha y Hora</h4>
                      </div>
                      <p className="text-gray-800 font-medium mb-1">{date}</p>
                      <p className="text-gray-600 text-sm font-medium">{time}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-700">Tutor</h4>
                      </div>
                      <p className="text-gray-800 font-medium mb-1">{appointment.tutor.name}</p>
                      {appointment.tutor.phone && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Phone className="h-3 w-3" />
                          {appointment.tutor.phone}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <h4 className="font-semibold text-gray-700">Motivo</h4>
                      </div>
                      <p className="text-gray-800 font-medium text-sm leading-relaxed">{appointment.reason}</p>
                    </div>
                  </div>

                  {/* Consultation Type */}
                  {appointment.consultationType && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Stethoscope className="h-5 w-5 text-gray-500" />
                          <div>
                            <h4 className="font-semibold text-gray-700">Tipo de Consulta</h4>
                            <p className="text-gray-800 font-medium">{appointment.consultationType.name}</p>
                            {appointment.consultationType.description && (
                              <p className="text-sm text-gray-600 mt-1">{appointment.consultationType.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 font-bold">
                            {formatPrice(appointment.consultationType.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="pt-4 border-t border-gray-100">
                    <Link
                      href={`/dashboard/clients/${appointment.tutor.id}/pets/${appointment.pet.id}`}
                      className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 font-medium transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                      Ver Ficha Médica Completa
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </Stagger>
        )}
      </div>
    </div>
  );
}
