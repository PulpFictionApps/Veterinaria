"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { authFetch } from '@/lib/api';

export default function NewPrescription({ params }: { params: Promise<{ id: string; petId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const petId = Number(resolvedParams.petId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await authFetch('/prescriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ petId, title, content, sendWhatsApp }) });
    if (res.ok) router.push(`/dashboard/clients/${resolvedParams.id}/pets/${petId}`);
  }

  return (
    <form onSubmit={submit} className="max-w-lg bg-white p-4 rounded">
      <h3 className="font-bold mb-2">Nueva receta</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título" className="w-full p-2 border mb-2" />
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Contenido" className="w-full p-2 border mb-2 h-40" />
      <label className="flex items-center gap-2 mb-2">
        <input type="checkbox" checked={sendWhatsApp} onChange={e => setSendWhatsApp(e.target.checked)} /> Enviar por WhatsApp
      </label>
      <button className="bg-green-600 text-white px-3 py-2 rounded">Crear</button>
    </form>
  );
}
