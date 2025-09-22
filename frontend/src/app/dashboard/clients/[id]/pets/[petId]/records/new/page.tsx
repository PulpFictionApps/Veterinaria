"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { authFetch } from '@/lib/api';

export default function NewRecord({ params }: { params: Promise<{ id: string; petId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const petId = Number(resolvedParams.petId);
  const ownerId = resolvedParams.id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await authFetch('/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId,
          title: title || 'Consulta médica',
          content,
          diagnosis: diagnosis || null,
          treatment: treatment || null,
          weight: weight ? Number(weight) : null,
          temperature: temperature ? Number(temperature) : null
        })
      });

      if (res.ok) {
        router.push(`/dashboard/clients/${ownerId}/pets/${petId}/records`);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Error al crear ficha clínica' }));
        setError(errorData.error || 'Error al crear ficha clínica');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Ficha Clínica</h1>

        <form onSubmit={submit} className="space-y-6">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título de la Consulta
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Control de rutina, Vacunación, Cirugía"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg)
              </label>
              <input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="Ej: 5.2"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura (°C)
              </label>
              <input
                id="temperature"
                type="number"
                step="0.1"
                min="30"
                max="45"
                value={temperature}
                onChange={e => setTemperature(e.target.value)}
                placeholder="Ej: 38.5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Diagnóstico */}
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico
            </label>
            <textarea
              id="diagnosis"
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
              placeholder="Describe el diagnóstico o hallazgos clínicos..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tratamiento */}
          <div>
            <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-2">
              Tratamiento
            </label>
            <textarea
              id="treatment"
              value={treatment}
              onChange={e => setTreatment(e.target.value)}
              placeholder="Describe el tratamiento prescrito, medicamentos, dosis, etc..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notas Adicionales */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Observaciones adicionales, recomendaciones, próximos controles..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Ficha Clínica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


