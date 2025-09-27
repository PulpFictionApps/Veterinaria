"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { authFetch } from '../../../../lib/api';

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
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando información del cliente...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{client?.name || 'Cliente'}</h1>
          <p className="text-gray-600">Información completa del cliente y sus mascotas</p>
        </div>
        <Link
          href={`/dashboard/clients/${id}/pet/new`}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Nueva Mascota
        </Link>
      </div>

      {/* Client Information */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Nombre:</strong> {client?.name}</p>
            {client?.email && <p><strong>Email:</strong> {client.email}</p>}
            {client?.phone && <p><strong>Teléfono:</strong> {client.phone}</p>}
          </div>
          <div>
            {client?.rut && <p><strong>RUT:</strong> {client.rut}</p>}
            {client?.address && <p><strong>Dirección:</strong> {client.address}</p>}
          </div>
        </div>
      </div>

      {/* Pets Section */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h2 className="text-xl font-semibold mb-4">Mascotas ({pets.length})</h2>
        
        {pets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Este cliente no tiene mascotas registradas</p>
            <Link
              href={`/dashboard/clients/${id}/pet/new`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Registrar Primera Mascota
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pet List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700 mb-3">Seleccionar Mascota:</h3>
              {pets.map(pet => (
                <div
                  key={pet.id}
                  onClick={() => handlePetSelect(pet)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPet?.id === pet.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{pet.name}</h4>
                      <p className="text-sm text-gray-600">{pet.type}</p>
                      {pet.breed && <p className="text-sm text-gray-500">{pet.breed}</p>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {pet.age && <span>{pet.age} años</span>}
                      {pet.weight && <span className="block">{pet.weight} kg</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pet Details and History */}
            {selectedPet && (
              <div className="lg:col-span-2 space-y-6">
                {/* Pet Information */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg mb-3">📋 {selectedPet.name} - Información</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Tipo:</strong> {selectedPet.type}</p>
                      {selectedPet.breed && <p><strong>Raza:</strong> {selectedPet.breed}</p>}
                    </div>
                    <div>
                      {selectedPet.age && <p><strong>Edad:</strong> {selectedPet.age} años</p>}
                      {selectedPet.weight && <p><strong>Peso:</strong> {selectedPet.weight} kg</p>}
                      {selectedPet.sex && <p><strong>Sexo:</strong> {selectedPet.sex}</p>}
                    </div>
                  </div>
                </div>

                {/* Medical History Tabs */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 p-4">
                    <h3 className="font-semibold text-lg">🩺 Historial Médico de {selectedPet.name}</h3>
                  </div>

                  {/* Medical Records */}
                  <div className="p-4 border-b">
                    <h4 className="font-semibold text-green-700 mb-3">📝 Registros Médicos ({medicalRecords.length})</h4>
                    {medicalRecords.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay registros médicos</p>
                    ) : (
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {medicalRecords.map(record => (
                          <div key={record.id} className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-green-800">{record.title}</h5>
                              <span className="text-xs text-gray-500">{formatDate(record.createdAt)}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{record.content}</p>
                            {record.diagnosis && (
                              <p className="text-sm text-green-700"><strong>Diagnóstico:</strong> {record.diagnosis}</p>
                            )}
                            {record.treatment && (
                              <p className="text-sm text-green-700"><strong>Tratamiento:</strong> {record.treatment}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prescriptions */}
                  <div className="p-4 border-b">
                    <h4 className="font-semibold text-purple-700 mb-3">💊 Recetas Médicas ({prescriptions.length})</h4>
                    {prescriptions.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay recetas médicas</p>
                    ) : (
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {prescriptions.map(prescription => (
                          <div key={prescription.id} className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-purple-800">{prescription.title}</h5>
                              <span className="text-xs text-gray-500">{formatDate(prescription.createdAt)}</span>
                            </div>
                            <div className="text-sm text-gray-700 grid grid-cols-2 gap-2">
                              <p><strong>Medicamento:</strong> {prescription.medication}</p>
                              <p><strong>Dosis:</strong> {prescription.dosage}</p>
                              <p><strong>Frecuencia:</strong> {prescription.frequency}</p>
                              <p><strong>Duración:</strong> {prescription.duration}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Appointments History */}
                  <div className="p-4">
                    <h4 className="font-semibold text-blue-700 mb-3">📅 Historial de Citas ({appointments.length})</h4>
                    {appointments.length === 0 ? (
                      <p className="text-gray-500 text-sm">No hay citas registradas</p>
                    ) : (
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {appointments.map(appointment => (
                          <div key={appointment.id} className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium text-blue-800">{formatDate(appointment.date)}</p>
                                {appointment.reason && (
                                  <p className="text-sm text-gray-700">{appointment.reason}</p>
                                )}
                              </div>
                              <div className="text-right">
                                {appointment.consultationType && (
                                  <div className="text-xs text-blue-600">
                                    <p>{appointment.consultationType.name}</p>
                                    <p>${appointment.consultationType.price/100}</p>
                                  </div>
                                )}
                                <Link
                                  href={`/dashboard/appointments/${appointment.id}/consult`}
                                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded mt-1 inline-block hover:bg-blue-700"
                                >
                                  Ver Consulta
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
