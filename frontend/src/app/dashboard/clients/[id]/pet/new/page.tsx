"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { authFetch } from '@/lib/api';

export default function NewPetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clientId = Number(resolvedParams.id);
  const [name, setName] = useState('');
  const [type, setType] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await authFetch('/pets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type, tutorId: clientId }) });
    if (res.ok) router.push(`/dashboard/clients/${clientId}`);
  }

  return (
    <form onSubmit={submit} className="max-w-md bg-white p-4 rounded">
      <h3 className="font-bold mb-2">Nueva mascota</h3>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" className="w-full p-2 border mb-2" required />
      <input value={type} onChange={e => setType(e.target.value)} placeholder="Tipo" className="w-full p-2 border mb-2" />
      <button className="bg-green-600 text-white px-3 py-2 rounded">Crear</button>
    </form>
  );
}
