"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../../lib/api';

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await authFetch('/tutors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, phone }) });
    if (res.ok) router.push('/dashboard/clients');
  }

  return (
    <form onSubmit={submit} className="max-w-md bg-white p-4 rounded">
      <h3 className="font-bold mb-2">Nuevo cliente</h3>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre" className="w-full p-2 border mb-2" required />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border mb-2" />
      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono" className="w-full p-2 border mb-2" />
      <button className="bg-green-600 text-white px-3 py-2 rounded">Crear</button>
    </form>
  );
}
