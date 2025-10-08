"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { authFetch } from '@/lib/api';
import ThemedCard from '../../../../../components/ui/ThemedCard';
import ThemedButton from '../../../../../components/ui/ThemedButton';
import PageHeader from '../../../../../components/ui/PageHeader';
import { Plus, PawPrint, ArrowLeft } from 'lucide-react';

interface Pet {
  id: number;
  name: string;
  type: string;
  [key: string]: unknown; // por si hay otras propiedades
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
    <div className="vet-page">
      <PageHeader
        title="Mascotas"
        subtitle="Gestión de mascotas del cliente"
        icon={PawPrint}
        actions={
          <div className="flex gap-3">
            <Link href={`/dashboard/clients/${clientId}`}>
              <button className="text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
            </Link>
            <Link href={`/dashboard/clients/${clientId}/pet/new`}>
              <ThemedButton variant="primary" icon={Plus} size="sm">
                Nueva Mascota
              </ThemedButton>
            </Link>
          </div>
        }
      />

      <div className="vet-container space-y-8">
      {loading ? (
        <div className="text-gray-500">Cargando mascotas...</div>
      ) : error ? (
        <div className="text-gray-600">{error}</div>
      ) : pets.length === 0 ? (
        <ThemedCard variant="medical" padding="lg" className="text-center">
          <div className="p-4">
            <PawPrint className="w-16 h-16 text-medical-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-6 text-lg font-medium">No se encontraron mascotas para este cliente.</p>
            <Link href={`/dashboard/clients/${clientId}/pet/new`}>
              <ThemedButton variant="primary" icon={Plus} size="lg">
                Agregar Primera Mascota
              </ThemedButton>
            </Link>
          </div>
        </ThemedCard>
      ) : (
        <ul>
          {pets.map(p => (
            <li key={p.id} className="p-2 border-b">
              <Link
                href={`/dashboard/clients/${clientId}/pets/${p.id}`}
                className="text-gray-600"
              >
                {p.name} ({p.type})
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}
