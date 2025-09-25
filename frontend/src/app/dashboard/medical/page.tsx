"use client";

import { useState, useEffect } from 'react';
import { useAuthContext } from '../../../lib/auth-context';
import { authFetch } from '../../../lib/api';
import Link from 'next/link';
import { useTheme } from '../../../lib/theme-context';

interface MedicalRecord {
  id: number;
  date: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  weight?: number;
  temperature?: number;
  pet: {
    id: number;
    name: string;
    type: string;
    tutor: {
      id: number;
      name: string;
    };
  };
}

interface Prescription {
  id: number;
  createdAt: string;
  diagnosis?: string;
  instructions?: string;
  medications: string;
  pet: {
    id: number;
    name: string;
    type: string;
    tutor: {
      id: number;
      name: string;
    };
  };
}

export default function MedicalPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'records' | 'prescriptions'>('records');
  const { userId } = useAuthContext();
  const { colors } = useTheme();

  useEffect(() => {
    if (userId) {
      loadMedicalData();
    }
  }, [userId]);

  const loadMedicalData = async () => {
    setLoading(true);
    try {
      const [recordsRes, prescriptionsRes] = await Promise.all([
        authFetch('/medical/records'),
        authFetch('/medical/prescriptions')
      ]);

      if (recordsRes.ok) {
        const recordsData = await recordsRes.json();
        setRecords(recordsData);
      }

      if (prescriptionsRes.ok) {
        const prescriptionsData = await prescriptionsRes.json();
        setPrescriptions(prescriptionsData);
      }
    } catch (error) {
      console.error('Error loading medical data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Historia Médica</h1>
        <p className="text-gray-600">Gestiona los registros médicos y prescripciones de tus pacientes</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('records')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'records'
                  ? 'border-theme-primary text-theme-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Registros Médicos ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prescriptions'
                  ? 'border-theme-primary text-theme-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Prescripciones ({prescriptions.length})
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
        </div>
      ) : (
        <>
          {/* Medical Records Tab */}
          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Registros Médicos</h2>
                <Link
                  href="/dashboard/medical/records/new"
                  className="bg-theme-primary text-white px-4 py-2 rounded-lg hover:bg-theme-primary/90 transition-colors"
                >
                  + Nuevo Registro
                </Link>
              </div>

              {records.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin registros médicos</h3>
                  <p className="text-gray-500 mb-4">Aún no has creado ningún registro médico.</p>
                  <Link
                    href="/dashboard/medical/records/new"
                    className="bg-theme-primary text-white px-4 py-2 rounded-lg hover:bg-theme-primary/90 transition-colors inline-block"
                  >
                    Crear primer registro
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {records.map((record) => (
                    <div key={record.id} className="bg-white p-6 rounded-lg shadow border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{record.pet.name} ({record.pet.type})</h3>
                          <p className="text-gray-600">Cliente: {record.pet.tutor.name}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(record.date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <Link
                          href={`/dashboard/medical/records/${record.id}`}
                          className="text-theme-primary hover:text-theme-accent"
                        >
                          Ver detalles →
                        </Link>
                      </div>

                      {record.diagnosis && (
                        <div className="mb-2">
                          <span className="font-medium">Diagnóstico:</span> {record.diagnosis}
                        </div>
                      )}

                      {record.treatment && (
                        <div className="mb-2">
                          <span className="font-medium">Tratamiento:</span> {record.treatment}
                        </div>
                      )}

                      <div className="flex gap-4 text-sm text-gray-600">
                        {record.weight && <span>Peso: {record.weight}kg</span>}
                        {record.temperature && <span>Temperatura: {record.temperature}°C</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Prescripciones</h2>
                <Link
                  href="/dashboard/medical/prescriptions/new"
                  className="bg-theme-primary text-white px-4 py-2 rounded-lg hover:bg-theme-primary/90 transition-colors"
                >
                  + Nueva Prescripción
                </Link>
              </div>

              {prescriptions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-gray-400 text-4xl mb-4">💊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sin prescripciones</h3>
                  <p className="text-gray-500 mb-4">Aún no has creado ninguna prescripción.</p>
                  <Link
                    href="/dashboard/medical/prescriptions/new"
                    className="bg-theme-primary text-white px-4 py-2 rounded-lg hover:bg-theme-primary/90 transition-colors inline-block"
                  >
                    Crear primera prescripción
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {prescriptions.map((prescription) => {
                    const medications = JSON.parse(prescription.medications);
                    return (
                      <div key={prescription.id} className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{prescription.pet.name} ({prescription.pet.type})</h3>
                            <p className="text-gray-600">Cliente: {prescription.pet.tutor.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(prescription.createdAt).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              href={`/dashboard/medical/prescriptions/${prescription.id}/pdf`}
                              className="text-green-500 hover:text-green-600 text-sm"
                            >
                              📄 PDF
                            </Link>
                            <Link
                              href={`/dashboard/medical/prescriptions/${prescription.id}`}
                              className="text-theme-primary hover:text-theme-accent"
                            >
                              Ver →
                            </Link>
                          </div>
                        </div>

                        {prescription.diagnosis && (
                          <div className="mb-2">
                            <span className="font-medium">Diagnóstico:</span> {prescription.diagnosis}
                          </div>
                        )}

                        <div className="mb-2">
                          <span className="font-medium">Medicamentos:</span>
                          <ul className="ml-4 list-disc">
                            {medications.map((med: any, index: number) => (
                              <li key={index}>{med.name} - {med.dosage}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
