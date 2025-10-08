"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { authFetch } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import { Clock, ArrowLeft } from 'lucide-react';

type TimelineItem = {
  type: 'appointment' | 'record' | 'prescription';
  date: string | null;
  data: Record<string, unknown>;
};

export default function PetTimeline() {
  const params = useParams() as { id?: string; petId?: string } | null;
  const ownerId = params?.id;
  const petId = Number(params?.petId);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // Fetch appointments, records and prescriptions in parallel
        const [aRes, rRes, pRes] = await Promise.all([
          authFetch(`/appointments/${petId}?byPet=true`).catch(() => ({ ok: false })),
          authFetch(`/medical-records?petId=${petId}`).catch(() => ({ ok: false })),
          authFetch(`/prescriptions?petId=${petId}`).catch(() => ({ ok: false }))
        ]);

        const safeJson = async (res: Response | { ok?: boolean } | undefined): Promise<unknown[]> => {
          if (!res || !(res as Response).ok) return [];
          try {
            const parsed = await (res as Response).json();
            return Array.isArray(parsed) ? parsed : [];
          } catch (err) {
            return [];
          }
        };

        const [aJson, rJson, pJson] = await Promise.all([
          safeJson(aRes),
          safeJson(rRes),
          safeJson(pRes)
        ]);

        if (!mounted) return;

        const normalized: TimelineItem[] = [];

        (aJson || []).forEach((a) => {
          if (a && typeof a === 'object') {
            const record = a as Record<string, unknown>;
            normalized.push({ type: 'appointment', date: (record.date as string) || null, data: record });
          }
        });
        (rJson || []).forEach((r) => {
          if (r && typeof r === 'object') {
            const record = r as Record<string, unknown>;
            normalized.push({ type: 'record', date: (record.createdAt as string) || (record.date as string) || null, data: record });
          }
        });
        (pJson || []).forEach((p) => {
          if (p && typeof p === 'object') {
            const record = p as Record<string, unknown>;
            normalized.push({ type: 'prescription', date: (record.createdAt as string) || null, data: record });
          }
        });

        normalized.sort((x, y) => {
          const yd = y.date ? new Date(y.date).getTime() : 0;
          const xd = x.date ? new Date(x.date).getTime() : 0;
          return yd - xd;
        });

        setItems(normalized);
      } catch (err) {
        setError('No se pudo cargar la bitácora');
      } finally {
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [petId]);

  if (loading) return <div>Cargando bitácora...</div>;
  if (error) return <div className="text-gray-600">{error}</div>;

  return (
    <div className="vet-page">
      <PageHeader
        title="Bitácora de la Mascota"
        subtitle="Cronología de eventos y actividad médica"
        icon={Clock}
        actions={
          <Link href={`/dashboard/clients/${ownerId}/pets/${petId}`}>
            <button className="text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
          </Link>
        }
      />

      <div className="vet-container">
      <div className="space-y-4">
        {items.length === 0 && <div className="text-gray-600">No hay eventos registrados para esta mascota.</div>}
        {items.map((it, idx) => (
          <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500">{it.date ? new Date(it.date).toLocaleString() : ''}</div>
                <div className="font-medium mt-1">
                  {it.type === 'appointment' && `Cita - ${((it.data as Record<string, unknown>).service as string) || ((it.data as Record<string, unknown>).type as string) || ''}`}
                  {it.type === 'record' && `Ficha clínica - ${((it.data as Record<string, unknown>).title as string) || ''}`}
                  {it.type === 'prescription' && `Receta - ${((it.data as Record<string, unknown>).title as string) || ''}`}
                </div>
                <div className="text-sm text-gray-700 mt-2">
                  {it.type === 'appointment' && ((it.data as Record<string, unknown>).notes as string)}
                  {it.type === 'record' && ((it.data as Record<string, unknown>).diagnosis as string)}
                  {it.type === 'prescription' && Array.isArray((it.data as Record<string, unknown>).medicines) && ((it.data as Record<string, unknown>).medicines as string[]).join(', ')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
