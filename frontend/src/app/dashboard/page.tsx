
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
  const [subscription, setSubscription] = useState<any>(null);

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

        // fetch subscription info to show trial remaining
        const subRes = await authFetch('/account/subscription');
        if (subRes.ok) {
          const d = await subRes.json();
          if (mounted) setSubscription(d.subscription || null);
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
        {subscription && subscription.expiresAt && new Date(subscription.expiresAt) > new Date() && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded flex items-center justify-between">
            <div>
              <strong className="font-semibold">Prueba activa</strong>
              <span className="ml-2 text-sm text-gray-700"> — te quedan { Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000*60*60*24)) } días</span>
            </div>
            <div>
              <a href="/dashboard/billing" className="px-3 py-2 bg-green-600 text-white rounded">Pagar ahora</a>
            </div>
          </div>
        )}

        <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Calendario de Citas</h2>
            <div className="text-right">
              <p className="text-xs text-gray-500">Enlace público de reservas</p>
              <div className="mt-1 flex items-center gap-2">
                <input 
                  readOnly 
                  value={bookingUrl} 
                  className="px-2 py-1 border rounded bg-gray-50 text-xs font-mono w-48" 
                />
                <button 
                  onClick={copyLink} 
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    copied 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-lg shadow-pink-200/50'
                  }`}
                >
                  {copied ? '✅' : '📋'}
                </button>
              </div>
            </div>
          </div>
          
          <DashboardCalendar userId={uid} />
        </div>
      </div>
    </div>
  );
}
