"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api';

interface Pet {
  id: number;
  name: string;
  type: string;
}

interface PageProps {
  params: { id: string; petId: string };
}

export default function PetDetail({ params }: PageProps) {
  const router = useRouter();
  const petId = Number(params.petId);

  const [pet, setPet] = useState<Pet | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    (async () => {
      const res = await authFetch('/pets/' + petId);
      if (res.ok) {
        const data: Pet = await res.json();
        setPet(data);
        setName(data.name || '');
        setType(data.type || '');
      }
    })();
  }, [petId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await authFetch('/pets/' + petId, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type }),
    });
    router.refresh();
  }

  async function del() {
    await authFetch('/pets/' + petId, { method: 'DELETE' });
    router.back();
  }

  if (!pet) return <div>Loading...</div>;

  return (
    <div className="max-w-md bg-white p-4 rounded">
      <h3 className="font-bold mb-2">{pet.name}</h3>
      <form onSubmit={save}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-2 border mb-2"
        />
        <input
          value={type}
          onChange={e => setType(e.target.value)}
          className="w-full p-2 border mb-2"
        />
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-3 py-2 rounded">Guardar</button>
          <button
            type="button"
            onClick={del}
            className="bg-red-600 text-white px-3 py-2 rounded"
          >
            Borrar
          </button>
        </div>
      </form>
    </div>
  );
}
