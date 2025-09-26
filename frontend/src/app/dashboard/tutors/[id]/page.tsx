"use client";

import PetCard from '../../../../components/PetCard';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '../../../../lib/api';
import Link from 'next/link';

type Pet = { id: number; name: string; type: string };

export default function TutorDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await authFetch(`/tutors/${id}`);
        if (!res.ok) throw new Error('Error cargando tutor');
        const data = await res.json();
        if (mounted) setTutor(data);
      } catch (err: any) {
        setError(err.message || 'Error');
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false };
  }, [id]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!tutor) return <p>No encontrado</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{tutor.name}</h2>
          {tutor.email && <p>Email: {tutor.email}</p>}
          {tutor.phone && <p>Teléfono: {tutor.phone}</p>}
        </div>
        <div>
          <Link href={`/dashboard/tutors/${id}/edit`} className="bg-blue-600 text-white px-3 py-2 rounded">Editar tutor</Link>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-4 mb-2">Mascotas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tutor.pets?.map((pet: Pet) => (
          <PetCard key={pet.id} {...pet} id={pet.id} />
        ))}
      </div>
    </div>
  );
}
