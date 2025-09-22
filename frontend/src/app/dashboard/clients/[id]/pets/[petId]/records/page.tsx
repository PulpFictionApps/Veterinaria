"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/api';

export default function RecordsPage({ params }: { params: { id: string; petId: string } }) {
  const petId = Number(params.petId);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await authFetch(`/medical-records/pet/${petId}`);
      const data = await res.json();
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
