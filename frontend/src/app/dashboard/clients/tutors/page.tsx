"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authFetch } from '../../../../lib/api';

type Tutor = { id: number; name: string; email?: string; phone?: string };

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await authFetch('/tutors');
        if (!res.ok) throw new Error('No autorizado o error en backend');
        const data = await res.json();
        if (mounted) setTutors(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
    return () => { mounted = false };
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Tutores</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tutors.map(tutor => (
          <Link key={tutor.id} href={`/dashboard/tutors/${tutor.id}`}>
            <div className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-bold">{tutor.name}</h3>
              {tutor.email && <p className="text-sm">{tutor.email}</p>}
              {tutor.phone && <p className="text-sm">{tutor.phone}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
