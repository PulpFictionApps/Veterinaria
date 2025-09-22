
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
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel</h1>
                <p className="text-sm text-gray-500">Visión general rápida de tus citas y clientes</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Enlace público</p>
                <div className="mt-2 flex items-center gap-2">
                  <input readOnly value={bookingUrl} className="px-3 py-2 border rounded bg-gray-50 text-sm font-mono" />
                  <button onClick={copyLink} className={`px-4 py-2 rounded ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {copied ? '✅ Copiado' : '📋 Copiar'}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Citas hoy</p>
                <p className="text-xl font-bold">{upcoming.filter(a=> new Date(a.date).toDateString() === new Date().toDateString()).length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Clientes</p>
                <p className="text-xl font-bold">{clients.length}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Horarios</p>
                <p className="text-xl font-bold">—</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Ingresos</p>
                <p className="text-xl font-bold">$0</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <a className="px-4 py-2 bg-blue-600 text-white rounded">Crear cita</a>
              <a className="px-4 py-2 bg-green-600 text-white rounded">Configurar disponibilidad</a>
              <a className="px-4 py-2 border rounded">Exportar</a>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Próximas citas</h3>
            {upcoming.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-6">No hay próximas citas</div>
            ) : (
              <ul className="space-y-3">
                {upcoming.map(a => (
                  <li key={a.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{a.pet?.name || 'Mascota'}</div>
                      <div className="text-sm text-gray-500">{new Date(a.date).toLocaleString('es-ES')}</div>
                    </div>
                    <div className="text-sm text-gray-600">{a.tutor?.name}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Clientes recientes</h3>
            {clients.length === 0 ? (
              <div className="text-sm text-gray-500">No hay clientes</div>
            ) : (
              <ul className="space-y-2">
                {clients.map(c => (
                  <li key={c.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-gray-500">{c.email || c.phone || '—'}</div>
                    </div>
                    <div>
                      <a className="text-blue-600 text-sm">Ver</a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Calendario</h3>
            <DashboardCalendar userId={uid} />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Disponibilidad</h3>
            <AvailabilityManager />
          </div>
        </div>
      </div>
    </div>
  );
}
