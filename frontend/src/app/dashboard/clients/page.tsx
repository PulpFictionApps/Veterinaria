"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '../../../lib/api';
import { useAuthContext } from '../../../lib/auth-context';

interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  [key: string]: any; // por si hay otras propiedades
}

export default function ClientsPage() {
  const { userId } = useAuthContext();
  const [clients, setClients] = useState<Client[]>([]);

  async function load() {
    if (!userId) return;
    const res = await authFetch('/tutors');
    if (!res.ok) return;
    const data: Client[] = await res.json();
    setClients(data || []);
  }

  useEffect(() => { load(); }, [userId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <Link
          href="/dashboard/clients/new"
          className="bg-green-600 text-white px-3 py-2 rounded"
        >
          Nuevo cliente
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {clients.map(c => (
          <Link
            key={c.id}
            href={`/dashboard/clients/${c.id}`}
            className="p-3 bg-white rounded shadow"
          >
            <div className="font-bold">{c.name}</div>
            <div className="text-sm">{c.email}</div>
            <div className="text-sm">{c.phone}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
