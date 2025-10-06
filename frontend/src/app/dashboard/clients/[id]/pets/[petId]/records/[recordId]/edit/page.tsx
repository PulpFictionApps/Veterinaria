"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api';

export default function EditRecord(props: any) {
  const { params } = props;
  const router = useRouter();
  const ownerId = params?.id;
  const petId = Number(params?.petId);
  const recordId = Number(params?.recordId);

  const [data, setData] = useState<any>(null);
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
        if (mounted) setData(json);
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
  if (!data) return <div className="text-red-600">No se encontró la ficha.</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Ficha Clínica</h1>

        <form onSubmit={save} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
            <input value={data.title || ''} onChange={e => setData({ ...data, title: e.target.value })} className="w-full px-4 py-3 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Diagnóstico</label>
            <textarea value={data.diagnosis || ''} onChange={e => setData({ ...data, diagnosis: e.target.value })} rows={3} className="w-full px-4 py-3 border rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento</label>
            <textarea value={data.treatment || ''} onChange={e => setData({ ...data, treatment: e.target.value })} rows={3} className="w-full px-4 py-3 border rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
              <input type="number" step="0.1" value={data.weight ?? ''} onChange={e => setData({ ...data, weight: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura (°C)</label>
              <input type="number" step="0.1" value={data.temperature ?? ''} onChange={e => setData({ ...data, temperature: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 border rounded-lg" />
            </div>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <div className="flex gap-4">
            <button type="button" onClick={() => router.back()} className="flex-1 px-6 py-3 border rounded-lg">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800">{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
