"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { authFetch } from '@/lib/api';

interface MedicalRecord {
  id: number;
  title: string;
  content: string;
  diagnosis?: string;
  treatment?: string;
  weight?: number;
  temperature?: number;
  createdAt: string;
  updatedAt: string;
}

export default function RecordsPage({ params }: { params: Promise<{ id: string; petId: string }> }) {
  const resolvedParams = use(params);
  const petId = Number(resolvedParams.petId);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`/medical-records/pet/${petId}`);
        if (res.ok) {
          const data: MedicalRecord[] = await res.json();
          setRecords(data || []);
        }
      } catch (error) {
        console.error('Error loading medical records:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [petId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Cargando historial clínico...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Historial Clínico</h1>
        <Link 
          href={`./new`} 
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Nueva Ficha
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay fichas clínicas</h3>
          <p className="text-gray-500 mb-4">Comienza creando la primera ficha clínica para esta mascota.</p>
          <Link 
            href={`./new`} 
            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Crear Primera Ficha
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(record.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`./${record.id}/edit`}
                    className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                  >
                    Editar
                  </Link>
                </div>
              </div>

              {/* Información básica */}
              {(record.weight || record.temperature) && (
                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {record.weight && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Peso:</span>
                      <span className="ml-2 text-sm text-gray-900">{record.weight} kg</span>
                    </div>
                  )}
                  {record.temperature && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Temperatura:</span>
                      <span className="ml-2 text-sm text-gray-900">{record.temperature}°C</span>
                    </div>
                  )}
                </div>
              )}

              {/* Diagnóstico */}
              {record.diagnosis && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">🔍 Diagnóstico</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{record.diagnosis}</p>
                </div>
              )}

              {/* Tratamiento */}
              {record.treatment && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">💊 Tratamiento</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{record.treatment}</p>
                </div>
              )}

              {/* Notas adicionales */}
              {record.content && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Notas</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{record.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
