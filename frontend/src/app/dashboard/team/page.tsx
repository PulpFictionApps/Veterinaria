"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '../../../lib/api';

interface Tutor { id: number; name: string; email?: string; phone?: string; pets?: any[] }

export default function TeamPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await authFetch('/tutors');
        if (res.ok) {
          const data = await res.json();
          if (mounted) setTutors(data || []);
        }
      } catch (err) {
        console.error('Error loading tutors', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await authFetch('/tutors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({ error: 'Error' }));
        throw new Error(err.error || 'Error creando tutor');
      }
      const created = await res.json();
      setTutors(prev => [created, ...prev]);
      setName(''); setEmail(''); setPhone('');
    } catch (err) {
      alert((err as Error).message || 'Error');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este tutor?')) return;
    try {
      const res = await authFetch(`/tutors/${id}`, { method: 'DELETE' });
      if (res.ok) setTutors(prev => prev.filter(t => t.id !== id));
      else { const e = await res.json().catch(()=>({ error: 'Error' })); alert(e.error || 'Error'); }
    } catch (err) { console.error(err); alert('Error eliminando tutor'); }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-2">Equipo</h1>
        <p className="text-sm text-gray-600">Gestiona los miembros del equipo que pueden administrar la cuenta.</p>
        <form onSubmit={handleCreate} className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre" className="p-2 border rounded" required />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="p-2 border rounded" />
          <div className="flex gap-2">
            <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Teléfono" className="p-2 border rounded flex-1" />
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Agregar</button>
          </div>
        </form>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-3">Lista de miembros</h3>
        {loading ? (
          <div className="text-sm text-gray-500">Cargando...</div>
        ) : tutors.length === 0 ? (
          <div className="text-sm text-gray-500">No hay miembros</div>
        ) : (
          <ul className="space-y-3">
            {tutors.map(t => (
              <li key={t.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.email || t.phone || '—'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>handleDelete(t.id)} className="text-red-600">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
