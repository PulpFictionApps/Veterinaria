
"use client";

import { useEffect, useState } from 'react';
import DashboardCalendar from "../../components/DashboardCalendar";
import AvailabilityManager from '../../components/AvailabilityManager';
import { useAuthContext } from '../../lib/auth-context';
import { authFetch } from '../../lib/api';

interface AppointmentSummary {
  id: number;
  date: string;
  pet: { id: number; name: string };
  tutor: { id: number; name: string };
  reason: string;
}

interface ClientSummary {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export default function DashboardPage() {
  const { userId } = useAuthContext();
  const uid = userId ?? 1;
  const [copied, setCopied] = useState(false);
  const [upcoming, setUpcoming] = useState<AppointmentSummary[]>([]);
  const [clients, setClients] = useState<ClientSummary[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!uid) return;
        const apptsRes = await authFetch(`/appointments/${uid}`);
        if (apptsRes.ok) {
          const appts: AppointmentSummary[] = await apptsRes.json();
          // keep only next 6 upcoming
          const next = appts
            .map(a => ({ ...a }))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0,6);
          if (mounted) setUpcoming(next);
        }

        // try to fetch tutors/clients
        const clientsRes = await authFetch(`/tutors`);
        if (clientsRes.ok) {
          const data: ClientSummary[] = await clientsRes.json();
          if (mounted) setClients(data.slice(0,8));
        }
      } catch (err) {
        console.error('Error loading dashboard data', err);
      }
    }
    load();
    return () => { mounted = false };
  }, [uid]);

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
    <div className="w-full h-full">
      <div className="max-w-full mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div />
          <div className="text-right">
            <p className="text-sm text-gray-500">Enlace público</p>
            <div className="mt-2 flex items-center gap-2 justify-end">
              <input readOnly value={bookingUrl} className="px-3 py-2 border rounded bg-gray-50 text-sm font-mono" />
              <button onClick={copyLink} className={`px-4 py-2 rounded ${copied ? 'bg-brand-600 text-white' : 'bg-brand-500 text-white hover:bg-brand-600'}`}>
                {copied ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <DashboardCalendar userId={uid} />
        </div>
      </div>
    </div>
  );
}
