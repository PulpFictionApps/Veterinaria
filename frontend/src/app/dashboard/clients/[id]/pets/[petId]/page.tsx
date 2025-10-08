"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { authFetch } from '@/lib/api';
import { 
  Heart, 
  Calendar, 
  Weight, 
  Activity, 
  Pill, 
  FileText, 
  Phone, 
  Edit,
  Trash2,
  Clock,
  Stethoscope,
  MapPin,
  Mail,
  User,
  PawPrint,
  Cake,
  Scale
} from 'lucide-react';
import { FadeIn, SlideIn, AnimateOnView } from '@/components/ui/Transitions';
import Tooltip from '@/components/ui/Tooltip';
import ThemedCard from '@/components/ui/ThemedCard';
import PageHeader from '@/components/ui/PageHeader';

interface Pet {
  id: number;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  sex?: string;
  reproductiveStatus?: string;
  birthDate?: string;
  createdAt: string;
  updatedAt: string;
  tutor: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    rut?: string;
    address?: string;
  };
}

interface MedicalRecord {
  id: number;
  title: string;
  content: string;
  diagnosis?: string;
  treatment?: string;
  weight?: number;
  temperature?: number;
  createdAt: string;
}

interface Prescription {
  id: number;
  title: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  createdAt: string;
}

interface Appointment {
  id: number;
  date: string;
  reason: string;
  status: string;
  consultationType?: {
    name: string;
    color?: string;
  };
}

interface PageProps {
  params: Promise<{ id: string; petId: string }>;
}

export default function PetDetail({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const petId = Number(resolvedParams.petId);
  const tutorId = Number(resolvedParams.id);

  const [pet, setPet] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'prescriptions' | 'appointments'>('overview');

  useEffect(() => {
    loadPetData();
  }, [petId]);

  const loadPetData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de la mascota
      const petRes = await authFetch(`/pets/${petId}`);
      if (petRes.ok) {
        const petData = await petRes.json();
        setPet(petData);
      }

      // Cargar registros médicos reales
      try {
        const medicalRes = await authFetch(`/medical-records/pet/${petId}`);
        if (medicalRes.ok) {
          const medicalData = await medicalRes.json();
          setMedicalRecords(medicalData || []);
        } else {
          setMedicalRecords([]);
        }
      } catch (error) {
        console.error('Error loading medical records:', error);
        setMedicalRecords([]);
      }

      // Cargar prescripciones reales
      try {
        const prescRes = await authFetch(`/prescriptions/pet/${petId}`);
        if (prescRes.ok) {
          const prescData = await prescRes.json();
          setPrescriptions(prescData || []);
        } else {
          setPrescriptions([]);
        }
      } catch (error) {
        console.error('Error loading prescriptions:', error);
        setPrescriptions([]);
      }

      // Cargar citas reales de esta mascota
      try {
        const appointRes = await authFetch(`/appointments/pet/${petId}`);
        if (appointRes.ok) {
          const appointData = await appointRes.json();
          setAppointments(appointData || []);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointments([]);
      }

    } catch (error) {
      console.error('Error loading pet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar esta mascota? Esta acción no se puede deshacer.')) {
      await authFetch(`/pets/${petId}`, { method: 'DELETE' });
      router.push(`/dashboard/clients/${tutorId}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInYears = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return ageInYears - 1;
    }
    return ageInYears;
  };

  if (loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-medical-50 to-health-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-medical-200 border-t-medical-600 mx-auto mb-6"></div>
          <p className="text-lg font-semibold text-neutral-700">Cargando información de la mascota</p>
          <p className="text-sm text-neutral-500">Obteniendo datos médicos...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <PawPrint className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-700 mb-2">Mascota no encontrada</h2>
          <p className="text-neutral-500">No se pudo cargar la información de esta mascota.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-container">
      {/* Header unificado */}
      <PageHeader
        title={pet.name}
        subtitle={`${pet.type} ${pet.breed ? `• ${pet.breed}` : ''}`}
        icon={PawPrint}
        actions={
          <>
            <Tooltip content="Editar mascota">
              <button 
                onClick={() => router.push(`/dashboard/clients/${tutorId}/pets/${petId}/edit`)}
                className="p-2 text-neutral-600 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
            </Tooltip>
            <Tooltip content="Eliminar mascota">
              <button 
                onClick={handleDelete}
                className="p-2 text-neutral-600 hover:text-emergency-600 hover:bg-emergency-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </Tooltip>
          </>
        }
      />

      <div className="space-y-8">
        
        {/* Información básica de la mascota */}
        <FadeIn>
          <ThemedCard variant="medical" className="overflow-hidden">
            <div className="bg-gradient-to-r from-medical-600 to-health-600 p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <PawPrint className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-6 text-white/90">
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-2" />
                      {pet.type} {pet.breed && `• ${pet.breed}`}
                    </span>
                    {pet.age && (
                      <span className="flex items-center">
                        <Cake className="w-4 h-4 mr-2" />
                        {pet.age} años
                      </span>
                    )}
                    {pet.weight && (
                      <span className="flex items-center">
                        <Scale className="w-4 h-4 mr-2" />
                        {pet.weight} kg
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Información del tutor */}
            {pet.tutor ? (
              <div className="p-6 bg-neutral-50 border-t border-medical-100">
                <h3 className="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wide">Tutor Responsable</h3>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-neutral-500 mr-2" />
                    <span className="font-medium text-neutral-800">{pet.tutor.name}</span>
                  </div>
                  {pet.tutor.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-neutral-500 mr-2" />
                      <span className="text-neutral-600">{pet.tutor.phone}</span>
                    </div>
                  )}
                  {pet.tutor.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-neutral-500 mr-2" />
                      <span className="text-neutral-600">{pet.tutor.email}</span>
                    </div>
                  )}
                  {pet.tutor.address && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-neutral-500 mr-2" />
                      <span className="text-neutral-600">{pet.tutor.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-neutral-50 border-t border-medical-100">
                <h3 className="text-sm font-semibold text-neutral-600 mb-3 uppercase tracking-wide">Tutor Responsable</h3>
                <div className="text-neutral-500">No hay información del tutor disponible.</div>
              </div>
            )}
          </ThemedCard>
        </FadeIn>

        {/* Tabs de navegación */}
        <SlideIn direction="up" delay={200}>
          <ThemedCard variant="medical" className="p-2">
            <div className="flex space-x-2">
              {[
                { id: 'overview', label: 'Información General', icon: FileText },
                { id: 'medical', label: 'Historial Médico', icon: Stethoscope },
                { id: 'prescriptions', label: 'Prescripciones', icon: Pill },
                { id: 'appointments', label: 'Citas', icon: Calendar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gray-600 text-white shadow-lg border-l-4 border-white'  // PLOMO COMO EL SIDEBAR
                      : 'text-neutral-600 hover:bg-medical-50 hover:text-medical-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </ThemedCard>
        </SlideIn>

        {/* Contenido de tabs */}
        <AnimateOnView animation="slide">
          <div className="space-y-6">
            
            {/* Tab: Información General */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Datos básicos */}
                <ThemedCard variant="medical">
                  <h3 className="text-xl font-bold text-neutral-800 mb-6 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-medical-600" />
                    Datos Básicos
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                      <span className="text-neutral-600">Especie</span>
                      <span className="font-semibold text-neutral-800">{pet.type}</span>
                    </div>
                    {pet.breed && (
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                        <span className="text-neutral-600">Raza</span>
                        <span className="font-semibold text-neutral-800">{pet.breed}</span>
                      </div>
                    )}
                    {pet.sex && (
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                        <span className="text-neutral-600">Sexo</span>
                        <span className="font-semibold text-neutral-800">{pet.sex}</span>
                      </div>
                    )}
                    {pet.reproductiveStatus && (
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                        <span className="text-neutral-600">Estado Reproductivo</span>
                        <span className="font-semibold text-neutral-800">{pet.reproductiveStatus}</span>
                      </div>
                    )}
                    {pet.birthDate && (
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                        <span className="text-neutral-600">Fecha de Nacimiento</span>
                        <span className="font-semibold text-neutral-800">{formatDate(pet.birthDate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-3">
                      <span className="text-neutral-600">Registrado</span>
                      <span className="font-semibold text-neutral-800">{formatDate(pet.createdAt)}</span>
                    </div>
                  </div>
                </ThemedCard>

                {/* Estadísticas rápidas */}
                <div className="space-y-6">
                  <ThemedCard variant="medical">
                    <h3 className="text-xl font-bold text-neutral-800 mb-6">Estadísticas</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-health-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-health-700">{medicalRecords.length}</div>
                        <div className="text-sm text-health-600">Registros Médicos</div>
                      </div>
                      <div className="bg-medical-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-medical-700">{prescriptions.length}</div>
                        <div className="text-sm text-medical-600">Prescripciones</div>
                      </div>
                      <div className="bg-neutral-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-neutral-700">{appointments.length}</div>
                        <div className="text-sm text-neutral-600">Citas Totales</div>
                      </div>
                      <div className="bg-emergency-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-emergency-700">
                          {appointments.filter(a => a.status === 'scheduled').length}
                        </div>
                        <div className="text-sm text-emergency-600">Citas Pendientes</div>
                      </div>
                    </div>
                  </ThemedCard>
                </div>
              </div>
            )}

            {/* Tab: Historial Médico */}
            {activeTab === 'medical' && (
              <div className="space-y-6">
                {medicalRecords.length === 0 ? (
                  <ThemedCard variant="medical" className="p-12 text-center">
                    <Stethoscope className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-neutral-700 mb-2">Sin registros médicos</h3>
                    <p className="text-neutral-500">Aún no hay registros médicos para esta mascota.</p>
                  </ThemedCard>
                ) : (
                  medicalRecords.map((record) => (
                    <ThemedCard key={record.id} variant="medical">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-neutral-800">{record.title}</h3>
                        <span className="text-sm text-neutral-500">{formatDate(record.createdAt)}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-neutral-700 mb-2">Observaciones</h4>
                          <p className="text-neutral-600">{record.content}</p>
                          {record.diagnosis && (
                            <>
                              <h4 className="font-semibold text-neutral-700 mb-2 mt-4">Diagnóstico</h4>
                              <p className="text-neutral-600">{record.diagnosis}</p>
                            </>
                          )}
                          {record.treatment && (
                            <>
                              <h4 className="font-semibold text-neutral-700 mb-2 mt-4">Tratamiento</h4>
                              <p className="text-neutral-600">{record.treatment}</p>
                            </>
                          )}
                        </div>
                        <div className="space-y-4">
                          {record.weight && (
                            <div className="bg-health-50 rounded-xl p-4">
                              <div className="flex items-center">
                                <Weight className="w-5 h-5 text-health-600 mr-2" />
                                <span className="font-semibold text-health-800">Peso: {record.weight} kg</span>
                              </div>
                            </div>
                          )}
                          {record.temperature && (
                            <div className="bg-medical-50 rounded-xl p-4">
                              <div className="flex items-center">
                                <Activity className="w-5 h-5 text-medical-600 mr-2" />
                                <span className="font-semibold text-medical-800">Temperatura: {record.temperature}°C</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </ThemedCard>
                  ))
                )}
              </div>
            )}

            {/* Tab: Prescripciones */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-6">
                {prescriptions.length === 0 ? (
                  <ThemedCard variant="medical" className="p-12 text-center">
                    <Pill className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-neutral-700 mb-2">Sin prescripciones</h3>
                    <p className="text-neutral-500">Aún no hay prescripciones registradas para esta mascota.</p>
                  </ThemedCard>
                ) : (
                  prescriptions.map((prescription) => (
                    <ThemedCard key={prescription.id} variant="medical">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-neutral-800">{prescription.title}</h3>
                        <span className="text-sm text-neutral-500">{formatDate(prescription.createdAt)}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-health-50 rounded-xl p-4">
                            <h4 className="font-semibold text-health-800 mb-2">Medicamento</h4>
                            <p className="text-health-700 text-lg">{prescription.medication}</p>
                          </div>
                          <div className="bg-medical-50 rounded-xl p-4">
                            <h4 className="font-semibold text-medical-800 mb-2">Dosis</h4>
                            <p className="text-medical-700">{prescription.dosage}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-neutral-50 rounded-xl p-4">
                            <h4 className="font-semibold text-neutral-800 mb-2">Frecuencia</h4>
                            <p className="text-neutral-700">{prescription.frequency}</p>
                          </div>
                          <div className="bg-neutral-50 rounded-xl p-4">
                            <h4 className="font-semibold text-neutral-800 mb-2">Duración</h4>
                            <p className="text-neutral-700">{prescription.duration}</p>
                          </div>
                        </div>
                      </div>
                      {prescription.instructions && (
                        <div className="mt-4 bg-emergency-50 border border-emergency-200 rounded-xl p-4">
                          <h4 className="font-semibold text-emergency-800 mb-2">Instrucciones Especiales</h4>
                          <p className="text-emergency-700">{prescription.instructions}</p>
                        </div>
                      )}
                    </ThemedCard>
                  ))
                )}
              </div>
            )}

            {/* Tab: Citas */}
            {activeTab === 'appointments' && (
              <div className="space-y-6">
                {appointments.length === 0 ? (
                  <ThemedCard variant="medical" className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-neutral-700 mb-2">Sin citas registradas</h3>
                    <p className="text-neutral-500">Aún no hay citas registradas para esta mascota.</p>
                  </ThemedCard>
                ) : (
                  appointments.map((appointment) => (
                    <ThemedCard key={appointment.id} variant="medical">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: appointment.consultationType?.color || '#3B82F6' }}
                          />
                          <h3 className="text-xl font-bold text-neutral-800">
                            {appointment.consultationType?.name || 'Consulta'}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            appointment.status === 'completed' 
                              ? 'bg-health-100 text-health-800'
                              : appointment.status === 'scheduled'
                              ? 'bg-medical-100 text-medical-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}>
                            {appointment.status === 'completed' ? 'Completada' : 
                             appointment.status === 'scheduled' ? 'Programada' : 'Cancelada'}
                          </span>
                          <span className="text-sm text-neutral-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(appointment.date)}
                          </span>
                        </div>
                      </div>
                      <p className="text-neutral-600">{appointment.reason}</p>
                    </ThemedCard>
                  ))
                )}
              </div>
            )}

          </div>
        </AnimateOnView>

        {/* Botones de acción flotantes */}
        <div className="fixed bottom-8 right-8 flex flex-col space-y-3">
          <Tooltip content="Nueva cita médica" position="left">
            <button 
              onClick={() => router.push(`/dashboard/appointments/new?petId=${petId}`)}
              className="w-14 h-14 bg-gradient-to-r from-health-600 to-health-700 text-white rounded-2xl shadow-health hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              <Calendar className="w-6 h-6" />
            </button>
          </Tooltip>
          <Tooltip content="Nuevo registro médico" position="left">
            <button 
              onClick={() => router.push(`/dashboard/clients/${tutorId}/pets/${petId}/records/new`)}
              className="w-14 h-14 bg-gradient-to-r from-medical-600 to-medical-700 text-white rounded-2xl shadow-medical hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              <Stethoscope className="w-6 h-6" />
            </button>
          </Tooltip>
        </div>

      </div>
    </div>
  );
}
