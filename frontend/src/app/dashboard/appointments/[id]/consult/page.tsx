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
  user?: {
    id: number;
    fullName?: string;
    clinicName?: string;
  };
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

interface Prescription {
  id: number;
  title: string;
  content: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  pdfUrl?: string;
  createdAt: string;
}

export default function ConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
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

  // Prescription form state
  const [prescriptionForm, setPrescriptionForm] = useState({
    title: '',
    content: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  const [savingPet, setSavingPet] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);

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
      // Fetch prescriptions for this pet
      await fetchPrescriptionsForPet(data.pet.id);
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

  const fetchPrescriptionsForPet = async (petId: number) => {
    try {
      const response = await authFetch(`/prescriptions/pet/${petId}`);
      if (response.ok) {
        const prescriptions = await response.json();
        setPrescriptions(prescriptions);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
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

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    try {
      setSavingPrescription(true);
      const prescriptionData = {
        petId: appointment.pet.id,
        tutorId: appointment.tutor.id,
        title: prescriptionForm.title,
        content: prescriptionForm.content,
        medication: prescriptionForm.medication,
        dosage: prescriptionForm.dosage,
        frequency: prescriptionForm.frequency,
        duration: prescriptionForm.duration,
        instructions: prescriptionForm.instructions || null,
      };

      const response = await authFetch('/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) throw new Error('Error al crear receta médica');
      
      // Reset form and refresh prescriptions
      setPrescriptionForm({
        title: '',
        content: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      });
      
      await fetchPrescriptionsForPet(appointment.pet.id);
      alert('Receta médica creada correctamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al crear receta médica');
    } finally {
      setSavingPrescription(false);
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

  const downloadPDF = async (prescriptionId: number, fileName: string) => {
    try {
      const response = await authFetch(`/prescriptions/download/${prescriptionId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Error al descargar el PDF');
      }

      // Get the PDF content as blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'receta_medica.pdf';
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el PDF. Intente nuevamente.');
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
    return <div>Cita no encontrada</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Consulta Veterinaria</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Volver
        </button>
      </div>

      {/* Appointment Details */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Información de la Cita</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Información de la Mascota</h3>
            <p><strong>Nombre:</strong> {appointment.pet.name}</p>
            <p><strong>Tipo:</strong> {appointment.pet.type}</p>
            {appointment.pet.breed && <p><strong>Raza:</strong> {appointment.pet.breed}</p>}
            {appointment.pet.age && <p><strong>Edad:</strong> {appointment.pet.age} años</p>}
            {appointment.pet.weight && <p><strong>Peso:</strong> {appointment.pet.weight} kg</p>}
            {appointment.pet.sex && <p><strong>Sexo:</strong> {appointment.pet.sex}</p>}
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Información del Tutor</h3>
            <p><strong>Nombre:</strong> {appointment.tutor.name}</p>
            {appointment.tutor.email && <p><strong>Email:</strong> {appointment.tutor.email}</p>}
            {appointment.tutor.phone && <p><strong>Teléfono:</strong> {appointment.tutor.phone}</p>}
            {appointment.tutor.rut && <p><strong>RUT:</strong> {appointment.tutor.rut}</p>}
          </div>
        </div>
        <div className="mt-4">
          <p><strong>Fecha de la Cita:</strong> {formatDate(appointment.date)}</p>
          <p><strong>Motivo:</strong> {appointment.reason}</p>
          {appointment.consultationType && (
            <p><strong>Tipo de Consulta:</strong> {appointment.consultationType.name} - ${appointment.consultationType.price}</p>
          )}
        </div>
      </div>

      {/* Update Pet Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Actualizar Información de la Mascota</h2>
        <form onSubmit={handleUpdatePet} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={petForm.weight}
                onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: 5.2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Edad (años)</label>
              <input
                type="number"
                value={petForm.age}
                onChange={(e) => setPetForm({ ...petForm, age: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: 3"
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
                <option value="Macho">Macho</option>
                <option value="Hembra">Hembra</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPet}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {savingPet ? 'Guardando...' : 'Actualizar Información'}
          </button>
        </form>
      </div>

      {/* Create Medical Record */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Crear Registro Médico</h2>
        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título *</label>
            <input
              type="text"
              required
              value={recordForm.title}
              onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ej: Consulta de rutina, Vacunación"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción *</label>
            <textarea
              required
              rows={4}
              value={recordForm.content}
              onChange={(e) => setRecordForm({ ...recordForm, content: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Describe los hallazgos, observaciones y procedimientos realizados"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
              <input
                type="text"
                value={recordForm.diagnosis}
                onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Diagnóstico principal"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tratamiento</label>
              <input
                type="text"
                value={recordForm.treatment}
                onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Tratamiento aplicado o recomendado"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Peso actual (kg)</label>
              <input
                type="number"
                step="0.1"
                value={recordForm.weight}
                onChange={(e) => setRecordForm({ ...recordForm, weight: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Peso registrado en esta consulta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Temperatura (°C)</label>
              <input
                type="number"
                step="0.1"
                value={recordForm.temperature}
                onChange={(e) => setRecordForm({ ...recordForm, temperature: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: 38.5"
              />
            </div>
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

      {/* Create Prescription */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Crear Receta Médica</h2>
        <form onSubmit={handleCreatePrescription} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título *</label>
              <input
                type="text"
                required
                value={prescriptionForm.title}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: Tratamiento para infección"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Medicamento *</label>
              <input
                type="text"
                required
                value={prescriptionForm.medication}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medication: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: Amoxicilina"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Dosis *</label>
              <input
                type="text"
                required
                value={prescriptionForm.dosage}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: 250mg, 1 comprimido"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Frecuencia *</label>
              <input
                type="text"
                required
                value={prescriptionForm.frequency}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: Cada 8 horas, 2 veces al día"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duración *</label>
              <input
                type="text"
                required
                value={prescriptionForm.duration}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Ej: 7 días, 2 semanas"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notas adicionales</label>
            <textarea
              rows={3}
              value={prescriptionForm.content}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, content: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Notas generales sobre la prescripción"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Instrucciones especiales</label>
            <textarea
              rows={3}
              value={prescriptionForm.instructions}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ej: Administrar con comida, no suspender antes de completar el tratamiento"
            />
          </div>

          <button
            type="submit"
            disabled={savingPrescription}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {savingPrescription ? 'Guardando...' : 'Crear Receta Médica'}
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

      {/* Prescriptions History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recetas Médicas</h2>
        
        {prescriptions.length === 0 ? (
          <p className="text-gray-500">No hay recetas médicas para esta mascota.</p>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription.id} className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-purple-800">{prescription.title}</h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-500">{formatDate(prescription.createdAt)}</span>
                    <button
                      onClick={() => {
                        const fileName = `receta_${appointment?.pet?.name || 'mascota'}_${new Date(prescription.createdAt).toISOString().split('T')[0]}.pdf`;
                        downloadPDF(prescription.id, fileName);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
                    >
                      📄 Descargar PDF
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="font-medium text-purple-700">💊 Medicamento:</span>
                    <p className="text-gray-700">{prescription.medication}</p>
                  </div>
                  <div>
                    <span className="font-medium text-purple-700">⚖️ Dosis:</span>
                    <p className="text-gray-700">{prescription.dosage}</p>
                  </div>
                  <div>
                    <span className="font-medium text-purple-700">⏰ Frecuencia:</span>
                    <p className="text-gray-700">{prescription.frequency}</p>
                  </div>
                  <div>
                    <span className="font-medium text-purple-700">📅 Duración:</span>
                    <p className="text-gray-700">{prescription.duration}</p>
                  </div>
                </div>

                {prescription.content && (
                  <div className="mb-2">
                    <span className="font-medium text-purple-700">📝 Notas:</span>
                    <p className="text-gray-700">{prescription.content}</p>
                  </div>
                )}

                {prescription.instructions && (
                  <div>
                    <span className="font-medium text-purple-700">⚠️ Instrucciones especiales:</span>
                    <p className="text-gray-700">{prescription.instructions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}