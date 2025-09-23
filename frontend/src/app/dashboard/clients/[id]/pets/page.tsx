"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { authFetch } from '@/lib/api';

interface Pet {
  id: number;
  name: string;
  type: string;
  [key: string]: any; // por si hay otras propiedades
}

export default function PetsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const clientId = Number(resolvedParams.id);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await authFetch('/pets?tutorId=' + clientId);
        if (!res.ok) {
          setError('Error cargando mascotas');
          setPets([]);
          return;
        }
        const data: Pet[] = await res.json();
        setPets(data || []);
      } catch (err) {
        console.error('Error fetching pets', err);
        setError('Error de conexión');
        setPets([]);
      } finally {
        setLoading(false);
      }
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
      {loading ? (
        <div className="text-gray-500">Cargando mascotas...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : pets.length === 0 ? (
        <div className="text-center p-8 bg-white rounded shadow">
          <p className="text-gray-600 mb-4">No se encontraron mascotas para este cliente.</p>
          <Link href={`/dashboard/clients/${clientId}/pet/new`} className="bg-blue-600 text-white px-4 py-2 rounded">Agregar mascota</Link>
        </div>
      ) : (
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
      )}
    </div>
  );
}
