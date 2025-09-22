"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/PageShell';

export default function PublicPage() {
  const [id, setId] = useState('');
  const router = useRouter();

  function goToBooking(e?: React.FormEvent) {
    e?.preventDefault();
    const n = Number(id);
    if (!n || isNaN(n)) return alert('Ingresa el ID del profesional (número)');
    router.push(`/book/${n}`);
  }

  return (
    <PageShell>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <h2 className="text-2xl font-semibold">Reservas públicas</h2>
        <p className="text-sm text-gray-600 mt-2">Reserva una hora con un profesional sin iniciar sesión. Ingresa el ID del profesional o usa un enlace público.</p>

        <form onSubmit={goToBooking} className="mt-6 flex items-center justify-center gap-3">
          <input
            inputMode="numeric"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="ID profesional (ej. 1)"
            className="px-3 py-2 border rounded w-40"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Buscar / Reservar</button>
        </form>

        <div className="mt-6 text-sm text-gray-500">
          <p>Si tienes un enlace público directo, pégalo en tu navegador. Ejemplo: <span className="font-mono">/book/1</span></p>
        </div>
      </div>
    </PageShell>
  );
}

