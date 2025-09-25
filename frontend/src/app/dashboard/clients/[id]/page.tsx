"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { authFetch } from '../../../../lib/api';

interface Client {
  id: string;
  name: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClientDetail({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const [client, setClient] = useState<Client | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);

  async function load() {
    const res = await authFetch(`/clients/${id}`);
    if (!res.ok) return;
    const data: Client = await res.json();
    setClient(data);

    const petsRes = await authFetch(`/clients/${id}/pets`);
    if (petsRes.ok) {
      const petsData: Pet[] = await petsRes.json();
      setPets(petsData);
    }
  }

  useEffect(() => { load(); }, [id]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{client?.name || 'Cliente'}</h2>
        <Link
          href={`/dashboard/clients/${id}/pet/new`}
          className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-3 py-2 rounded hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-200/50"
        >
          Agregar mascota
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pets.map(p => (
          <div key={p.id} className="p-3 bg-white rounded shadow flex flex-col">
            <div className="font-bold">{p.name}</div>
            <div className="text-sm">{p.type}</div>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <Link
                href={`/dashboard/clients/${id}/pet/${p.id}`}
                className="text-theme-primary hover:text-theme-accent transition-colors"
              >
                Ver ficha
              </Link>
              <Link
                href={`/dashboard/prescriptions/new?petId=${p.id}`}
                className="text-green-600 mt-2 sm:mt-0"
              >
                Crear receta
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
