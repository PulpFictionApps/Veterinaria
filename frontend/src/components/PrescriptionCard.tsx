"use client";

import Link from 'next/link';

interface Pet {
  name: string;
}

interface Prescription {
  title?: string;
  pet?: Pet;
  pdfUrl?: string;
  [key: string]: any; // por si hay otros campos
}

export default function PrescriptionCard({ p }: { p: Prescription }) {
  return (
    <div className="border p-2 rounded mb-2">
      <div className="flex justify-between">
        <div>
          <div className="font-bold">{p.title || 'Receta'}</div>
          <div className="text-sm text-gray-600">Para mascota: {p.pet?.name || '—'}</div>
        </div>
        <div className="flex gap-2">
          {p.pdfUrl && (
            <a href={p.pdfUrl} target="_blank" rel="noreferrer" className="text-blue-600">
              PDF
            </a>
          )}
          <Link href="#" className="text-green-600">Ver</Link>
        </div>
      </div>
    </div>
  );
}
