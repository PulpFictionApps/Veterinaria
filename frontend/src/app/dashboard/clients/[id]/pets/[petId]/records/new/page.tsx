"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api';

export default function NewRecord({ params }: { params: { id: string; petId: string } }) {
  const router = useRouter();
  const petId = Number(params.petId);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
  const res = await authFetch('/medical-records', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ petId, title, content: notes }) });
    if (res.ok) router.push(`/dashboard/clients/${params.id}/pets/${petId}/records`);
  }

  return (
    <form onSubmit={submit} className="max-w-lg bg-white p-4 rounded">
  <h3 className="font-bold mb-2">Nueva nota clínica</h3>
  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título (opcional)" className="w-full p-2 border mb-2" />
  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas" className="w-full p-2 border mb-2 h-40" />
      <button className="bg-green-600 text-white px-3 py-2 rounded">Crear</button>
    </form>
  );
}
