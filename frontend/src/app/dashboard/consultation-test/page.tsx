'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/lib/auth-context';
import { authFetch } from '@/lib/api';

interface Appointment {
  id: number;
  date: string;
  reason: string;
  pet: {
    id: number;
    name: string;
    type: string;
  };
  tutor: {
    id: number;
    name: string;
  };
}

export default function ConsultationTestPage() {
  const { userId } = useAuthContext();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadAppointments();
    }
  }, [userId]);

  const loadAppointments = async () => {
    try {
      const res = await authFetch(`/appointments/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🧪 Test de Enlaces de Consulta
        </h1>
        <p className="text-gray-600">
          Verificando que todos los enlaces "Iniciar Consulta" funcionen correctamente.
        </p>
      </div>

      <div className="space-y-4">
        {appointments.map(appointment => {
          const consultUrl = `/dashboard/appointments/${appointment.id}/consult`;
          const appointmentDate = new Date(appointment.date);
          const formattedDate = appointmentDate.toLocaleDateString('es-CL');
          const formattedTime = appointmentDate.toLocaleTimeString('es-CL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });

          return (
            <div key={appointment.id} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    Cita #{appointment.id}
                  </h3>
                  <p className="text-gray-600">
                    {appointment.pet.name} ({appointment.pet.type}) - {appointment.tutor.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    📅 {formattedDate} a las {formattedTime}
                  </p>
                  {appointment.reason && (
                    <p className="text-sm text-gray-600 mt-1">
                      📝 {appointment.reason}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={consultUrl}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
                  >
                    🩺 Iniciar Consulta
                  </Link>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-mono text-gray-700">
                  <strong>URL:</strong> {consultUrl}
                </p>
                <div className="mt-2 flex gap-2">
                  <Link
                    href={consultUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs"
                  >
                    🔗 Abrir en nueva pestaña
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${consultUrl}`);
                      alert('URL copiada al portapapeles');
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs"
                  >
                    📋 Copiar URL completa
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {appointments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay citas para probar.</p>
            <Link 
              href="/dashboard/appointments"
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ir a Citas
            </Link>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">📋 Checklist de Prueba:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>1. Hacer clic en "Iniciar Consulta" debe abrir la página de consulta</li>
          <li>2. La página debe mostrar toda la información de la cita</li>
          <li>3. Debe poder actualizar información de la mascota</li>
          <li>4. Debe poder crear registros médicos</li>
          <li>5. Debe poder crear recetas médicas</li>
          <li>6. Los registros y recetas previos deben mostrarse</li>
        </ul>
      </div>
    </div>
  );
}