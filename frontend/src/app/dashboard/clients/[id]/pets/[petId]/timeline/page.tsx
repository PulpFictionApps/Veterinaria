"use client";

import React, { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';

export default function PetTimeline(props: any) {
  const params = props?.params;
  const ownerId = params?.id;
  const petId = Number(params?.petId);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
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

        const safeJson = async (res: any) => {
          if (!res || !res.ok) return [];
          try {
            return await res.json();
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

        const normalized: any[] = [];

        (aJson || []).forEach((a: any) => normalized.push({ type: 'appointment', date: a.date, data: a }));
        (rJson || []).forEach((r: any) => normalized.push({ type: 'record', date: r.createdAt || r.date || null, data: r }));
        (pJson || []).forEach((p: any) => normalized.push({ type: 'prescription', date: p.createdAt || null, data: p }));

        normalized.sort((x, y) => new Date(y.date).getTime() - new Date(x.date).getTime());

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
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Bitácora de la mascota</h2>
      <div className="space-y-4">
        {items.length === 0 && <div className="text-gray-600">No hay eventos registrados para esta mascota.</div>}
        {items.map((it, idx) => (
          <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500">{new Date(it.date).toLocaleString()}</div>
                <div className="font-medium mt-1">
                  {it.type === 'appointment' && `Cita - ${it.data.service || it.data.type || ''}`}
                  {it.type === 'record' && `Ficha clínica - ${it.data.title || ''}`}
                  {it.type === 'prescription' && `Receta - ${it.data.title || ''}`}
                </div>
                <div className="text-sm text-gray-700 mt-2">
                  {it.type === 'appointment' && it.data.notes}
                  {it.type === 'record' && it.data.diagnosis}
                  {it.type === 'prescription' && it.data.medicines && it.data.medicines.join(', ')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
