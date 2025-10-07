'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/lib/auth-context';
import { authFetch } from '@/lib/api';

interface ConsultationSummary {
  id: number;
  date: string;
  pet: {
    id: number;
    name: string;
    type: string;
  };
  tutor: {
    id: number;
    name: string;
  };
  reason?: string;
  consultationType?: {
    name: string;
    price: number;
  };
}

export default function ConsultationsPanel() {
  const { userId } = useAuthContext();
  const [consultations, setConsultations] = useState<ConsultationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadConsultations();
    }
  }, [userId]);

  const loadConsultations = async () => {
    try {
      const res = await authFetch(`/appointments/${userId}`);
      if (res.ok) {
        const appointments = await res.json();
        // Filter to show only past appointments (consultations that happened)
        const now = new Date();
        const pastAppointments = appointments
          .filter((apt: ConsultationSummary) => new Date(apt.date) <= now)
          .sort((a: ConsultationSummary, b: ConsultationSummary) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 8); // Show last 8 consultations
        
        setConsultations(pastAppointments);
      }
    } catch (error) {
      console.error('Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          🩺 Consultas Realizadas
        </h3>
        <Link 
          href="/dashboard/appointments"
          className="text-sm text-gray-600 hover:text-gray-700 font-medium"
        >
          Ver todas →
        </Link>
      </div>

      {consultations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-3">🩺</div>
          <p className="text-gray-600 mb-4">No hay consultas realizadas aún</p>
          <Link 
            href="/dashboard/appointments"
            className="inline-block bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Ver Citas Programadas
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {consultations.map(consultation => (
            <div key={consultation.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-sm">
                      {consultation.pet.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {consultation.pet.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {consultation.pet.type} - {consultation.tutor.name}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/appointments/${consultation.id}/consult`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium transition-colors"
                >
                  Ver Consulta
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">📅 Fecha:</span>
                  <span className="ml-1 text-gray-700">{formatDate(consultation.date)}</span>
                </div>
                <div>
                  <span className="text-gray-500">⏰ Hora:</span>
                  <span className="ml-1 text-gray-700">{formatTime(consultation.date)}</span>
                </div>
              </div>

              {consultation.reason && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">📝 Motivo:</span>
                  <span className="ml-1 text-gray-700">{consultation.reason}</span>
                </div>
              )}

              {consultation.consultationType && (
                <div className="mt-2 text-sm">
                  <span className="text-gray-500">💊 Tipo:</span>
                  <span className="ml-1 text-gray-700">{consultation.consultationType.name}</span>
                  <span className="ml-2 text-gray-600 font-medium">
                    ${(consultation.consultationType.price / 100).toLocaleString('es-CL')}
                  </span>
                </div>
              )}
            </div>
          ))}

          {consultations.length >= 8 && (
            <div className="text-center pt-4">
              <Link 
                href="/dashboard/appointments"
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Ver todas las consultas →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
