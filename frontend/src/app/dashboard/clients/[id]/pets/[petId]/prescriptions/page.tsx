"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import PrescriptionCard from '@/components/PrescriptionCard';

export default function PrescriptionsPage({ params }: { params: { id: string; petId: string } }) {
  const petId = Number(params.petId);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await authFetch(`/prescriptions/pet/${petId}`);
      const data = await res.json();
      setItems(data || []);
    })();
  }, [petId]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recetas</h2>
      </div>
      <div>
        {items.map(i => (
          <div key={i.id} className="mb-2">
            <PrescriptionCard p={i} />
            {i.pdfUrl && <a href={i.pdfUrl} target="_blank" rel="noreferrer" className="text-sm text-greenbrand-700">Abrir PDF</a>}
          </div>
        ))}
      </div>
    </div>
  );
}
