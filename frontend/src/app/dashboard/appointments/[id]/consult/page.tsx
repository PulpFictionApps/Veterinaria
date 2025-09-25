'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api';

interface Pet {
  id: number;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  weight?: number;
  sex?: string;
  birthDate?: string;
  updatedAt: string;
}

interface Tutor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  rut?: string;
  address?: string;
}

interface ConsultationType {
  id: number;
  name: string;
  price: number;
}

interface Appointment {
  id: number;
  date: string;
  reason: string;
  pet: Pet;
  tutor: Tutor;
  consultationType?: ConsultationType;
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

export default function ConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pet form state
  const [petForm, setPetForm] = useState({
    weight: '',
    age: '',
    sex: '',
  });

  // Medical record form state
  const [recordForm, setRecordForm] = useState({
    title: '',
    content: '',
    diagnosis: '',
    treatment: '',
    weight: '',
    temperature: '',
  });

  const [savingPet, setSavingPet] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await authFetch(`/appointments/appointment/${appointmentId}`);
      if (!response.ok) throw new Error('Error al cargar la cita');
      const data = await response.json();
      setAppointment(data);
      
      // Initialize pet form with current values
      setPetForm({
        weight: data.pet.weight?.toString() || '',
        age: data.pet.age?.toString() || '',
        sex: data.pet.sex || '',
      });
      
      // Fetch medical records for this pet
      await fetchMedicalRecordsForPet(data.pet.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const fetchMedicalRecords = async () => {
    // This will be called by fetchAppointment now
  };
  
  const fetchMedicalRecordsForPet = async (petId: number) => {
    try {
      setLoading(true);
      const response = await authFetch(`/medical-records/pet/${petId}`);
      if (response.ok) {
        const records = await response.json();
        setMedicalRecords(records);
      }
    } catch (err) {
      console.error('Error fetching medical records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    try {
      setSavingPet(true);
      const updateData = {
        weight: petForm.weight ? Number(petForm.weight) : null,
        age: petForm.age ? Number(petForm.age) : null,
        sex: petForm.sex || null,
      };

      const response = await authFetch(`/pets/${appointment.pet.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Error al actualizar mascota');
      
      // Refresh appointment data
      await fetchAppointment();
      alert('Datos de la mascota actualizados correctamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar mascota');
    } finally {
      setSavingPet(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    try {
      setSavingRecord(true);
      const recordData = {
        petId: appointment.pet.id,
        title: recordForm.title,
        content: recordForm.content,
        diagnosis: recordForm.diagnosis || null,
        treatment: recordForm.treatment || null,
        weight: recordForm.weight ? Number(recordForm.weight) : null,
        temperature: recordForm.temperature ? Number(recordForm.temperature) : null,
      };

      const response = await authFetch('/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) throw new Error('Error al crear registro médico');
      
      // Reset form and refresh records
      setRecordForm({
        title: '',
        content: '',
        diagnosis: '',
        treatment: '',
        weight: '',
        temperature: '',
      });
      
      await fetchMedicalRecordsForPet(appointment.pet.id);
      alert('Registro médico creado correctamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear registro médico');
    } finally {
      setSavingRecord(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando consulta...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center">
        <p>Error: {error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center">
        <p>Cita no encontrada</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Volver
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Consulta Médica</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Volver
        </button>
      </div>

      {/* Appointment info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="font-semibold text-lg mb-2">Información de la Cita</h2>
        <div className="grid grid-cols-2 gap-4">
          <p><span className="font-medium">Fecha:</span> {formatDate(appointment.date)}</p>
          <p><span className="font-medium">Motivo:</span> {appointment.reason}</p>
          {appointment.consultationType && (
            <>
              <p><span className="font-medium">Tipo de Consulta:</span> {appointment.consultationType.name}</p>
              <p><span className="font-medium">Precio:</span> ${(appointment.consultationType.price / 100).toLocaleString('es-CL')}</p>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Nombre:</span> {appointment.tutor.name}</p>
            {appointment.tutor.rut && (
              <p><span className="font-medium">RUT:</span> {appointment.tutor.rut}</p>
            )}
            {appointment.tutor.phone && (
              <p><span className="font-medium">Teléfono:</span> {appointment.tutor.phone}</p>
            )}
            {appointment.tutor.email && (
              <p><span className="font-medium">Email:</span> {appointment.tutor.email}</p>
            )}
            {appointment.tutor.address && (
              <p><span className="font-medium">Dirección:</span> {appointment.tutor.address}</p>
            )}
          </div>
        </div>

        {/* Pet Info & Update Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ficha Técnica de la Mascota</h2>
          
          {/* Static pet info */}
          <div className="space-y-2 mb-4">
            <p><span className="font-medium">Nombre:</span> {appointment.pet.name}</p>
            <p><span className="font-medium">Especie:</span> {appointment.pet.type}</p>
            {appointment.pet.breed && (
              <p><span className="font-medium">Raza:</span> {appointment.pet.breed}</p>
            )}
            {appointment.pet.birthDate && (
              <p><span className="font-medium">Fecha de Nacimiento:</span> {new Date(appointment.pet.birthDate).toLocaleDateString('es-CL')}</p>
            )}
          </div>

          {/* Editable form */}
          <form onSubmit={handleUpdatePet} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={petForm.weight}
                onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Edad (años)</label>
              <input
                type="number"
                value={petForm.age}
                onChange={(e) => setPetForm({ ...petForm, age: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sexo</label>
              <select
                value={petForm.sex}
                onChange={(e) => setPetForm({ ...petForm, sex: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Seleccionar</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
                <option value="castrado">Castrado</option>
                <option value="castrada">Castrada</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingPet}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {savingPet ? 'Guardando...' : 'Actualizar Datos'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t text-sm text-gray-500">
            <p>Última actualización: {formatDate(appointment.pet.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Medical Record Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Crear Registro Médico</h2>
        
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título *</label>
              <input
                type="text"
                required
                value={recordForm.title}
                onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Peso durante consulta (kg)</label>
              <input
                type="number"
                step="0.1"
                value={recordForm.weight}
                onChange={(e) => setRecordForm({ ...recordForm, weight: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Temperatura (°C)</label>
            <input
              type="number"
              step="0.1"
              value={recordForm.temperature}
              onChange={(e) => setRecordForm({ ...recordForm, temperature: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observaciones/Contenido *</label>
            <textarea
              required
              rows={4}
              value={recordForm.content}
              onChange={(e) => setRecordForm({ ...recordForm, content: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
            <textarea
              rows={3}
              value={recordForm.diagnosis}
              onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tratamiento</label>
            <textarea
              rows={3}
              value={recordForm.treatment}
              onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={savingRecord}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {savingRecord ? 'Guardando...' : 'Crear Registro Médico'}
          </button>
        </form>
      </div>

      {/* Medical Records History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Historial Médico</h2>
        
        {medicalRecords.length === 0 ? (
          <p className="text-gray-500">No hay registros médicos para esta mascota.</p>
        ) : (
          <div className="space-y-4">
            {medicalRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{record.title}</h3>
                  <span className="text-sm text-gray-500">{formatDate(record.createdAt)}</span>
                </div>
                
                <p className="text-gray-700 mb-2">{record.content}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {record.diagnosis && (
                    <div>
                      <span className="font-medium">Diagnóstico:</span>
                      <p className="text-gray-600">{record.diagnosis}</p>
                    </div>
                  )}
                  {record.treatment && (
                    <div>
                      <span className="font-medium">Tratamiento:</span>
                      <p className="text-gray-600">{record.treatment}</p>
                    </div>
                  )}
                  {record.weight && (
                    <div>
                      <span className="font-medium">Peso:</span>
                      <p className="text-gray-600">{record.weight} kg</p>
                    </div>
                  )}
                  {record.temperature && (
                    <div>
                      <span className="font-medium">Temperatura:</span>
                      <p className="text-gray-600">{record.temperature}°C</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}