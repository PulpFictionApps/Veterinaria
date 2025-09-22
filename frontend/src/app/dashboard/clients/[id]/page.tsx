"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../../lib/api';
import { useAuthContext } from '../../../../lib/auth-context';
import Link from 'next/link';

export default function ClientDetail({ params }: { params: { id: string } }) {
  const { id } = params;
  const { userId } = useAuthContext();
  const [client, setClient] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);

  async function load() {
    const res = await authFetch(`/tutors/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setClient(data);
  const petsRes = await authFetch(`/pets?tutorId=${id}`);
    if (petsRes.ok) setPets(await petsRes.json());
  }

  useEffect(() => { load(); }, [id]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{client?.name || 'Cliente'}</h2>
        <Link href={`/dashboard/clients/${id}/pet/new`} className="bg-blue-600 text-white px-3 py-2 rounded">Agregar mascota</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pets.map(p => (
          <div key={p.id} className="p-3 bg-white rounded shadow">
            <div className="font-bold">{p.name}</div>
            <div className="text-sm">{p.type}</div>
            <div className="mt-2 flex gap-2">
              <Link href={`/dashboard/clients/${id}/pet/${p.id}`} className="text-blue-600">Ver ficha</Link>
              <Link href={`/dashboard/prescriptions/new?petId=${p.id}`} className="text-green-600">Crear receta</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
