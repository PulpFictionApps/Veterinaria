
"use client";

import { useEffect, useState } from 'react';
import LazyDashboardCalendar from "../../components/LazyDashboardCalendar";
import LazyAvailabilityManager from '../../components/LazyAvailabilityManager';
import PublicLinkManager from '../../components/PublicLinkManager';
import ThemedButton from '../../components/ThemedButton';
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

export default function Dashboard() {
  const { userId: uid } = useAuthContext();
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!uid) return;
        
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

  return (
    <div className="w-full h-full">
      <div className="max-w-full mx-auto px-4 py-4 space-y-6">
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

        {/* Public Link Manager */}
        <PublicLinkManager />

        {/* Calendar */}
        <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendario de Citas</h2>
          {uid && <LazyDashboardCalendar userId={uid} />}
        </div>
      </div>
    </div>
  );
}
