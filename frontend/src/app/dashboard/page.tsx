
"use client";

import DashboardCalendar from "../../components/DashboardCalendar";
import AvailabilityManager from '../../components/AvailabilityManager';
import { useAuthContext } from '../../lib/auth-context';
import { useState } from "react";

export default function DashboardPage() {
  const { userId } = useAuthContext();
  const [copied, setCopied] = useState(false);
  const uid = userId ?? 1;

  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${uid}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('No se pudo copiar', err);
    }
  }

  return (
    <main className="p-4 min-h-screen bg-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Tu enlace público de agendamiento</h2>
          <p className="text-sm text-gray-600">Comparte este link para que tus clientes reserven horas según tus disponibilidades.</p>
        </div>
        <div className="flex items-center gap-2">
          <input readOnly value={bookingUrl} className="p-2 border rounded w-80 bg-white text-sm" />
          <button onClick={copyLink} className="bg-blue-600 text-white px-3 py-2 rounded">
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1"><AvailabilityManager /></div>
        <div className="md:col-span-2"><DashboardCalendar userId={uid} /></div>
      </div>
    </main>
  );
}
