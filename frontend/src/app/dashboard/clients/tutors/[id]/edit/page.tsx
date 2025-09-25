"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authFetch } from '../../../../../lib/api';

export default function EditTutorPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      try {
        const res = await authFetch(`/tutors/${id}`);
        if (!res.ok) throw new Error('No autorizado o error');
        const data = await res.json();
        if (mounted) setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
      } catch (err: any) {
        setError(err.message || 'Error');
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false };
  }, [id]);

  async function handleSubmit(e: any) {
    e.preventDefault();
    try {
      const res = await authFetch(`/tutors/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Error saving');
      router.push('/dashboard/tutors');
    } catch (err: any) {
      setError(err.message || 'Error');
    }
  }

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Editar tutor</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input className="mt-1 block w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="mt-1 block w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input className="mt-1 block w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button type="button" className="px-4 py-2" onClick={() => router.push('/dashboard/tutors')}>Cancelar</button>
          <button type="submit" className="bg-theme-primary text-white px-4 py-2 rounded hover:bg-theme-primary/90 transition-colors">Guardar</button>
        </div>
      </form>
    </div>
  );
}
