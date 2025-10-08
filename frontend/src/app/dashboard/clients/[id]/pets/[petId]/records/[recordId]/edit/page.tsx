"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authFetch } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import { Edit, ArrowLeft, Save } from 'lucide-react';

type RecordShape = {
  id?: number;
  title?: string;
  diagnosis?: string;
  treatment?: string;
  weight?: number | null;
  temperature?: number | null;
  [key: string]: unknown;
};

export default function EditRecord() {
  const router = useRouter();
  const params = useParams() as { id?: string; petId?: string; recordId?: string } | null;
  const ownerId = params?.id;
  const petId = Number(params?.petId);
  const recordId = Number(params?.recordId);
  const [data, setData] = useState<RecordShape | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await authFetch(`/medical-records/${recordId}`);
        if (!res.ok) throw new Error('No encontrado');
  const json = await res.json();
  if (mounted && json && typeof json === 'object') setData(json as RecordShape);
      } catch (err) {
        setError('No se pudo cargar la ficha');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [recordId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setSaving(true);
    setError('');
    try {
      const res = await authFetch(`/medical-records/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        router.push(`/dashboard/clients/${ownerId}/pets/${petId}/records`);
      } else {
        const err = await res.json().catch(() => ({ error: 'Error al guardar' }));
        setError(err.error || 'Error al guardar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!data) return <div className="text-gray-600">No se encontró la ficha.</div>;

  return (
    <div className="vet-page">
      <PageHeader
        title="Editar Ficha Clínica"
        subtitle="Actualizar información médica"
        icon={Edit}
        actions={
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        }
      />

      <div className="vet-container">
        <div className="vet-card-unified">
          <div className="p-6">
            <form onSubmit={save} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
            <input value={(data.title as string) || ''} onChange={e => setData({ ...data, title: e.target.value })} className="w-full px-4 py-3 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diagnóstico</label>
            <textarea value={(data.diagnosis as string) || ''} onChange={e => setData({ ...data, diagnosis: e.target.value })} rows={3} className="w-full px-4 py-3 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento</label>
            <textarea value={(data.treatment as string) || ''} onChange={e => setData({ ...data, treatment: e.target.value })} rows={3} className="w-full px-4 py-3 border rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
              <input type="number" step="0.1" value={data.weight != null ? String(data.weight) : ''} onChange={e => setData({ ...data, weight: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura (°C)</label>
              <input type="number" step="0.1" value={data.temperature != null ? String(data.temperature) : ''} onChange={e => setData({ ...data, temperature: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 border rounded-lg" />
            </div>
          </div>

          {error && <div className="text-gray-600">{error}</div>}

              <div className="flex gap-4">
                <button 
                  type="button" 
                  onClick={() => router.back()} 
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="flex-1 bg-medical-600 text-white px-6 py-3 rounded-lg hover:bg-medical-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
