"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { authFetch } from '../../../../lib/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  PawPrint,
  Calendar,
  Plus,
  FileText,
  Pill,
  Stethoscope,
  ArrowLeft
} from 'lucide-react';
import { FadeIn, Stagger, AnimateOnView } from '../../../../components/ui/Transitions';
import ThemedCard from '../../../../components/ui/ThemedCard';
import ThemedButton from '../../../../components/ui/ThemedButton';
import ThemedBadge from '../../../../components/ui/ThemedBadge';
import SubscriptionGuard from '../../../../components/SubscriptionGuard';

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rut?: string;
  address?: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  sex?: string;
  updatedAt: string;
}

interface MedicalRecord {
  id: number;
  title: string;
  content: string;
  diagnosis?: string;
  treatment?: string;
  createdAt: string;
}

interface Prescription {
  id: number;
  title: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  createdAt: string;
  pdfUrl?: string;
  pdfPath?: string;
}

interface Appointment {
  id: number;
  date: string;
  reason: string;
  consultationType?: {
    name: string;
    price: number;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClientDetail({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [client, setClient] = useState<Client | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await authFetch(`/tutors/${id}`);
      if (!res.ok) return;
      const data: Client = await res.json();
      setClient(data);

      const petsRes = await authFetch(`/pets?tutorId=${id}`);
      if (petsRes.ok) {
        const petsData: Pet[] = await petsRes.json();
        setPets(petsData);
        if (petsData.length > 0) {
          setSelectedPet(petsData[0]);
          await loadPetHistory(petsData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading client:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPetHistory(petId: string) {
    try {
      // Load medical records
      const recordsRes = await authFetch(`/medical-records/pet/${petId}`);
      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setMedicalRecords(recordsData);
      }

      // Load prescriptions
      const prescriptionsRes = await authFetch(`/prescriptions/pet/${petId}`);
      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        setPrescriptions(prescriptionsData);
      }

      // Load appointments for this pet
      const appointmentsRes = await authFetch(`/appointments/pet/${petId}`);
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error loading pet history:', error);
    }
  }

  useEffect(() => { load(); }, [id]);

  const handlePetSelect = async (pet: Pet) => {
    setSelectedPet(pet);
    await loadPetHistory(pet.id);
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

  if (loading) {
    return (
      <SubscriptionGuard>
        <div className="w-full min-h-full bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                <p className="text-lg font-bold text-neutral-700">🔄 Cargando información del cliente</p>
                <p className="text-sm text-neutral-500">Obteniendo datos de mascotas y historial médico...</p>
              </div>
            </div>
          </div>
        </div>
      </SubscriptionGuard>
    );
  }

  return (
    <SubscriptionGuard>
      <div className="w-full min-h-full bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          
          {/* Header */}
          <FadeIn>
            <ThemedCard variant="medical" padding="lg" shadow="xl">
              <div className="bg-gradient-mixed p-6 sm:p-8 text-white rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                  <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto">
                    <Link href="/dashboard/clients" className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10 hover:bg-white/30 transition-all group">
                      <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </Link>
                    <div className="w-14 h-14 sm:w-18 sm:h-18 bg-white/20 rounded-3xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10">
                      <User className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-sm" />
                    </div>
                    <div className="min-w-0 flex-1 sm:flex-initial">
                      <h1 className="text-2xl sm:text-4xl font-black mb-2 leading-tight tracking-tight">{client?.name || 'Cliente'}</h1>
                      <p className="text-white/90 text-sm sm:text-lg font-medium">
                        👥 Información completa y historial de mascotas
                      </p>
                    </div>
                  </div>
                  <Link href={`/dashboard/clients/${id}/pet/new`} className="w-full sm:w-auto">
                    <ThemedButton variant="secondary" icon={Plus} size="lg" className="w-full sm:w-auto touch-manipulation">
                      Nueva Mascota
                    </ThemedButton>
                  </Link>
                </div>
              </div>
            </ThemedCard>
          </FadeIn>

          {/* Client Information */}
          <AnimateOnView>
            <ThemedCard variant="default" padding="lg" shadow="xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Información del Cliente</h2>
                  <p className="text-neutral-600">Datos de contacto y personales</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-neutral-500">Nombre completo</p>
                      <p className="font-semibold text-neutral-800">{client?.name}</p>
                    </div>
                  </div>
                  {client?.email && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Mail className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-neutral-500">Correo electrónico</p>
                        <p className="font-semibold text-neutral-800">{client.email}</p>
                      </div>
                    </div>
                  )}
                  {client?.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <Phone className="w-5 h-5 text-purple-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-neutral-500">Teléfono</p>
                        <p className="font-semibold text-neutral-800">{client.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {client?.rut && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <FileText className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-neutral-500">RUT</p>
                        <p className="font-semibold text-neutral-800">{client.rut}</p>
                      </div>
                    </div>
                  )}
                  {client?.address && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-neutral-500">Dirección</p>
                        <p className="font-semibold text-neutral-800">{client.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ThemedCard>
          </AnimateOnView>

          {/* Pets Section */}
          <AnimateOnView>
            <ThemedCard variant="default" padding="lg" shadow="xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Mascotas ({pets.length})</h2>
                    <p className="text-neutral-600">Información médica y historial</p>
                  </div>
                </div>
                <Link href={`/dashboard/clients/${id}/pet/new`}>
                  <ThemedButton variant="secondary" icon={Plus} size="sm">
                    Agregar
                  </ThemedButton>
                </Link>
              </div>
              
              {pets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <PawPrint className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 mb-4">🐾 No hay mascotas registradas</h3>
                  <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                    Este cliente aún no tiene mascotas registradas. Agrega la primera mascota para comenzar a gestionar su historial médico.
                  </p>
                  <Link href={`/dashboard/clients/${id}/pet/new`}>
                    <ThemedButton variant="secondary" icon={Plus} size="lg">
                      Registrar Primera Mascota
                    </ThemedButton>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Pet List */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-neutral-800 mb-4 flex items-center gap-2">
                      <PawPrint className="w-5 h-5 text-green-600" />
                      Seleccionar Mascota:
                    </h3>
                    <Stagger>
                      {pets.map(pet => (
                        <div
                          key={pet.id}
                          onClick={() => handlePetSelect(pet)}
                          className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                            selectedPet?.id === pet.id 
                              ? 'bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 shadow-lg' 
                              : 'bg-white border border-neutral-200 hover:border-blue-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                selectedPet?.id === pet.id 
                                  ? 'bg-gradient-to-br from-blue-100 to-green-100' 
                                  : 'bg-neutral-100'
                              }`}>
                                <PawPrint className={`w-5 h-5 ${
                                  selectedPet?.id === pet.id ? 'text-blue-600' : 'text-neutral-600'
                                }`} />
                              </div>
                              <div>
                                <h4 className={`font-bold ${
                                  selectedPet?.id === pet.id ? 'text-blue-800' : 'text-neutral-800'
                                }`}>{pet.name}</h4>
                                <p className="text-sm text-neutral-600">{pet.type}</p>
                                {pet.breed && <p className="text-xs text-neutral-500">{pet.breed}</p>}
                              </div>
                            </div>
                            <div className="text-right">
                              {pet.age && (
                                <ThemedBadge variant="neutral" size="xs">
                                  {pet.age} años
                                </ThemedBadge>
                              )}
                              {pet.weight && (
                                <ThemedBadge variant="secondary" size="xs" className="mt-1">
                                  {pet.weight} kg
                                </ThemedBadge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </Stagger>
                  </div>

                  {/* Pet Details and History */}
                  {selectedPet && (
                    <div className="lg:col-span-2 space-y-6">
                      {/* Pet Information */}
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center">
                            <PawPrint className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-lg text-blue-800">📋 {selectedPet.name} - Información</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="bg-white/50 rounded-lg p-3">
                              <p className="text-xs text-neutral-500 mb-1">Tipo de animal</p>
                              <p className="font-semibold text-neutral-800">{selectedPet.type}</p>
                            </div>
                            {selectedPet.breed && (
                              <div className="bg-white/50 rounded-lg p-3">
                                <p className="text-xs text-neutral-500 mb-1">Raza</p>
                                <p className="font-semibold text-neutral-800">{selectedPet.breed}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3">
                            {selectedPet.age && (
                              <div className="bg-white/50 rounded-lg p-3">
                                <p className="text-xs text-neutral-500 mb-1">Edad</p>
                                <p className="font-semibold text-neutral-800">{selectedPet.age} años</p>
                              </div>
                            )}
                            {selectedPet.weight && (
                              <div className="bg-white/50 rounded-lg p-3">
                                <p className="text-xs text-neutral-500 mb-1">Peso</p>
                                <p className="font-semibold text-neutral-800">{selectedPet.weight} kg</p>
                              </div>
                            )}
                            {selectedPet.sex && (
                              <div className="bg-white/50 rounded-lg p-3">
                                <p className="text-xs text-neutral-500 mb-1">Sexo</p>
                                <p className="font-semibold text-neutral-800">{selectedPet.sex}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Medical History Tabs */}
                      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6">
                          <div className="flex items-center gap-3">
                            <Stethoscope className="w-6 h-6 text-white" />
                            <h3 className="font-bold text-xl text-white">🩺 Historial Médico de {selectedPet.name}</h3>
                          </div>
                        </div>

                        {/* Medical Records */}
                        <div className="p-6 border-b border-neutral-200">
                          <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-5 h-5 text-green-600" />
                            <h4 className="font-bold text-green-700">📝 Registros Médicos</h4>
                            <ThemedBadge variant="success" size="sm">{medicalRecords.length}</ThemedBadge>
                          </div>
                          {medicalRecords.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-green-600" />
                              </div>
                              <p className="text-neutral-500">No hay registros médicos</p>
                            </div>
                          ) : (
                            <div className="space-y-4 max-h-64 overflow-y-auto">
                              <Stagger>
                                {medicalRecords.map(record => (
                                  <div key={record.id} className="bg-gradient-to-r from-green-50 to-green-25 p-4 rounded-xl border-l-4 border-green-400 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                      <h5 className="font-bold text-green-800">{record.title}</h5>
                                      <ThemedBadge variant="neutral" size="xs">
                                        {formatDate(record.createdAt)}
                                      </ThemedBadge>
                                    </div>
                                    <p className="text-sm text-neutral-700 mb-3 leading-relaxed">{record.content}</p>
                                    {record.diagnosis && (
                                      <div className="mb-2">
                                        <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Diagnóstico:</span>
                                        <p className="text-sm text-green-700 mt-1">{record.diagnosis}</p>
                                      </div>
                                    )}
                                    {record.treatment && (
                                      <div>
                                        <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Tratamiento:</span>
                                        <p className="text-sm text-green-700 mt-1">{record.treatment}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </Stagger>
                            </div>
                          )}
                        </div>

                        {/* Prescriptions */}
                        <div className="p-6 border-b border-neutral-200">
                          <div className="flex items-center gap-3 mb-4">
                            <Pill className="w-5 h-5 text-purple-600" />
                            <h4 className="font-bold text-purple-700">💊 Recetas Médicas</h4>
                            <ThemedBadge variant="warning" size="sm">{prescriptions.length}</ThemedBadge>
                          </div>
                          {prescriptions.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Pill className="w-8 h-8 text-purple-600" />
                              </div>
                              <p className="text-neutral-500">No hay recetas médicas</p>
                            </div>
                          ) : (
                            <div className="space-y-4 max-h-64 overflow-y-auto">
                              <Stagger>
                                {prescriptions.map(prescription => (
                                  <div key={prescription.id} className="bg-gradient-to-r from-purple-50 to-purple-25 p-4 rounded-xl border-l-4 border-purple-400 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                      <h5 className="font-bold text-purple-800">{prescription.title}</h5>
                                      <div className="flex items-center gap-2">
                                        {prescription.pdfUrl && (
                                          <a
                                            href={prescription.pdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Descargar receta en PDF"
                                          >
                                            <ThemedButton variant="primary" size="sm">
                                              📄 PDF
                                            </ThemedButton>
                                          </a>
                                        )}
                                        <ThemedBadge variant="neutral" size="xs">
                                          {formatDate(prescription.createdAt)}
                                        </ThemedBadge>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <div>
                                          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Medicamento:</span>
                                          <p className="text-sm text-neutral-700">{prescription.medication}</p>
                                        </div>
                                        <div>
                                          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Dosis:</span>
                                          <p className="text-sm text-neutral-700">{prescription.dosage}</p>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <div>
                                          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Frecuencia:</span>
                                          <p className="text-sm text-neutral-700">{prescription.frequency}</p>
                                        </div>
                                        <div>
                                          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Duración:</span>
                                          <p className="text-sm text-neutral-700">{prescription.duration}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </Stagger>
                            </div>
                          )}
                        </div>

                        {/* Appointments History */}
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h4 className="font-bold text-blue-700">📅 Historial de Citas</h4>
                            <ThemedBadge variant="primary" size="sm">{appointments.length}</ThemedBadge>
                          </div>
                          {appointments.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-blue-600" />
                              </div>
                              <p className="text-neutral-500">No hay citas registradas</p>
                            </div>
                          ) : (
                            <div className="space-y-4 max-h-64 overflow-y-auto">
                              <Stagger>
                                {appointments.map(appointment => (
                                  <div key={appointment.id} className="bg-gradient-to-r from-blue-50 to-blue-25 p-4 rounded-xl border-l-4 border-blue-400 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1">
                                        <p className="font-bold text-blue-800 mb-1">{formatDate(appointment.date)}</p>
                                        {appointment.reason && (
                                          <p className="text-sm text-neutral-700 mb-2">{appointment.reason}</p>
                                        )}
                                        {appointment.consultationType && (
                                          <div className="flex gap-2">
                                            <ThemedBadge variant="primary" size="xs">
                                              {appointment.consultationType.name}
                                            </ThemedBadge>
                                            <ThemedBadge variant="success" size="xs">
                                              ${appointment.consultationType.price/100}
                                            </ThemedBadge>
                                          </div>
                                        )}
                                      </div>
                                      <Link href={`/dashboard/appointments/${appointment.id}/consult`}>
                                        <ThemedButton variant="primary" size="sm">
                                          Ver Consulta
                                        </ThemedButton>
                                      </Link>
                                    </div>
                                  </div>
                                ))}
                              </Stagger>
                            </div>
                          )}
                        </div>
                  </div>
                </div>
              )}
            </div>
          )}
            </ThemedCard>
          </AnimateOnView>

        </div>
      </div>
    </SubscriptionGuard>
  );
}
