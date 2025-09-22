"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/api';

interface Pet {
  id: number;
  name: string;
  type: string;
  [key: string]: any; // por si hay otras propiedades
}

export default function PetsPage({ params }: { params: { id: string } }) {
  const clientId = Number(params.id);
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => {
    (async () => {
      const res = await authFetch('/pets?tutorId=' + clientId);
      if (!res.ok) return;
      const data: Pet[] = await res.json();
      setPets(data || []);
    })();
  }, [clientId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Mascotas</h2>
        <Link
          href={`/dashboard/clients/${clientId}/pet/new`}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Nueva mascota
        </Link>
      </div>
      <ul>
        {pets.map(p => (
          <li key={p.id} className="p-2 border-b">
            <Link
              href={`/dashboard/clients/${clientId}/pets/${p.id}`}
              className="text-blue-600"
            >
              {p.name} ({p.type})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
