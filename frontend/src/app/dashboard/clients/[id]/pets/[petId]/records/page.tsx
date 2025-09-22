"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { authFetch } from '@/lib/api';

interface MedicalRecord {
  id: number;
  createdAt: string;
  content: string;
  [key: string]: any; // por si hay otras propiedades que se necesiten
}

export default function RecordsPage({ params }: { params: Promise<{ id: string; petId: string }> }) {
  const resolvedParams = use(params);
  const petId = Number(resolvedParams.petId);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    (async () => {
      const res = await authFetch(`/medical-records/pet/${petId}`);
      if (!res.ok) return;
      const data: MedicalRecord[] = await res.json();
      setRecords(data || []);
    })();
  }, [petId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Historial clínico</h2>
        <Link href={`./new`} className="bg-blue-600 text-white px-3 py-1 rounded">Nueva nota</Link>
      </div>
      <ul>
        {records.map(r => (
          <li key={r.id} className="p-2 border-b">
            <div className="font-bold">{new Date(r.createdAt).toLocaleString()}</div>
            <div className="text-sm">{r.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
