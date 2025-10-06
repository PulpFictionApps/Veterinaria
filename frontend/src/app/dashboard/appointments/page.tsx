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
      return { status: 'upcoming', color: 'text-green-600', bg: 'bg-green-50' };
    }
  }

  const filteredAppointments = filterAppointments(appointments);

  if (loading) {
    return (
      <FadeIn>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center py-20">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-primary"></div>
                    <Stethoscope className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-6 text-neutral-600 font-medium">Cargando agenda médica...</p>
                  <p className="mt-2 text-sm text-neutral-400">Preparando vista de citas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Medical Header */}
        <FadeIn>
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-mixed rounded-xl shadow-lg">
                    <CalendarDays className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-mixed bg-clip-text text-transparent">
                      Agenda Médica
                    </h1>
                    <p className="text-neutral-600 mt-1 font-medium">
                      Gestiona las consultas veterinarias programadas
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Tooltip content="Configurar disponibilidad">
                    <Link
                      href="/dashboard/calendar"
                      className="group bg-gradient-mixed text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
                    >
                      <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                      Disponibilidad
                    </Link>
                  </Tooltip>
                  
                  <Link
                    href="/dashboard/appointments/new"
                    className="group bg-gradient-mixed text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
                  >
                    <PlusCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Nueva Cita
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Advanced Search and Filters */}
        <SlideIn direction="up" delay={0.1}>
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-medical-100 p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Buscar por mascota, tutor o motivo de consulta..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-medical-100 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-300 font-medium placeholder-neutral-400"
                    />
                  </div>
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
                          className={`group px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                            filter === filterOption.key
                              ? 'bg-gray-600 text-white shadow-lg border-l-4 border-white'  // PLOMO CONSISTENTE
                              : 'bg-medical-50 text-medical-600 hover:bg-medical-100 border border-medical-100'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${filter === filterOption.key ? 'text-white' : 'text-medical-500'} group-hover:scale-110 transition-transform duration-300`} />
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
            <div className="bg-white rounded-2xl shadow-lg border border-medical-100 p-12 text-center">
              <div className="p-6 bg-gradient-to-r from-medical-50 to-health-50 rounded-2xl inline-block mb-6">
                <CalendarDays className="h-16 w-16 text-medical-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-800 mb-3">
                {searchTerm ? 'No se encontraron citas' : 'Agenda sin citas'}
              </h3>
              <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda para encontrar las citas que buscas'
                  : 'Comienza programando tu primera consulta veterinaria o configura tu disponibilidad'
                }
              </p>
              {!searchTerm && (
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/dashboard/appointments/new"
                    className="group bg-gradient-to-r from-medical-500 to-health-500 text-white px-8 py-4 rounded-xl hover:from-medical-600 hover:to-health-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-3"
                  >
                    <PlusCircle className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Programar Primera Cita
                  </Link>
                  <Link
                    href="/dashboard/calendar"
                    className="group bg-gradient-to-r from-health-500 to-medical-500 text-white px-8 py-4 rounded-xl hover:from-health-600 hover:to-medical-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-3"
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
                <div key={appointment.id} className="bg-white rounded-2xl shadow-lg border border-medical-100 p-6 hover:shadow-xl transition-all duration-300 group">
                  {/* Appointment Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${isPast ? 'bg-neutral-100' : 'bg-gradient-to-r from-medical-100 to-health-100'}`}>
                        <Heart className={`h-6 w-6 ${isPast ? 'text-neutral-400' : 'text-medical-500'}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-neutral-800 mb-1">{appointment.pet.name}</h3>
                        <p className="text-sm text-neutral-600 font-medium">
                          {appointment.pet.type} {appointment.pet.breed && `• ${appointment.pet.breed}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        isPast 
                          ? 'bg-neutral-100 text-neutral-600' 
                          : 'bg-gradient-to-r from-health-100 to-medical-100 text-health-700'
                      }`}>
                        {isPast ? 'Completada' : 'Programada'}
                      </span>
                      
                      {!isPast && (
                        <Tooltip content="Iniciar consulta médica">
                          <Link 
                            href={`/dashboard/appointments/${appointment.id}/consult`} 
                            className="group bg-gradient-to-r from-health-500 to-medical-500 hover:from-health-600 hover:to-medical-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                          >
                            <Stethoscope className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                            Consultar
                          </Link>
                        </Tooltip>
                      )}
                      
                      <Tooltip content="Editar cita">
                        <Link 
                          href={`/dashboard/appointments/${appointment.id}/edit`} 
                          className="group p-2 text-neutral-600 hover:text-medical-600 hover:bg-medical-50 rounded-xl transition-all duration-300"
                        >
                          <Edit3 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        </Link>
                      </Tooltip>
                      
                      <Tooltip content="Eliminar cita">
                        <button 
                          onClick={() => deleteAppointment(appointment.id)} 
                          className="group p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Appointment Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-medical-50 to-health-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-medical-500" />
                        <h4 className="font-semibold text-neutral-700">Fecha y Hora</h4>
                      </div>
                      <p className="text-neutral-800 font-medium mb-1">{date}</p>
                      <p className="text-neutral-600 text-sm font-medium">{time}</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-health-50 to-medical-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-health-500" />
                        <h4 className="font-semibold text-neutral-700">Tutor</h4>
                      </div>
                      <p className="text-neutral-800 font-medium mb-1">{appointment.tutor.name}</p>
                      {appointment.tutor.phone && (
                        <div className="flex items-center gap-2 text-neutral-600 text-sm">
                          <Phone className="h-3 w-3" />
                          {appointment.tutor.phone}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-r from-neutral-50 to-medical-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="h-5 w-5 text-neutral-500" />
                        <h4 className="font-semibold text-neutral-700">Motivo</h4>
                      </div>
                      <p className="text-neutral-800 font-medium text-sm leading-relaxed">{appointment.reason}</p>
                    </div>
                  </div>

                  {/* Consultation Type */}
                  {appointment.consultationType && (
                    <div className="bg-gradient-to-r from-medical-50 to-health-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Stethoscope className="h-5 w-5 text-medical-500" />
                          <div>
                            <h4 className="font-semibold text-neutral-700">Tipo de Consulta</h4>
                            <p className="text-neutral-800 font-medium">{appointment.consultationType.name}</p>
                            {appointment.consultationType.description && (
                              <p className="text-sm text-neutral-600 mt-1">{appointment.consultationType.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                          <DollarSign className="h-4 w-4 text-health-500" />
                          <span className="text-health-600 font-bold">
                            {formatPrice(appointment.consultationType.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div className="pt-4 border-t border-medical-100">
                    <Link
                      href={`/dashboard/clients/${appointment.tutor.id}/pets/${appointment.pet.id}`}
                      className="group inline-flex items-center gap-2 text-medical-600 hover:text-medical-700 font-medium transition-all duration-300"
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
