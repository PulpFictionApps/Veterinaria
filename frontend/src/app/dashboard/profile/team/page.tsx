"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '../../../../lib/api';
import { Notification, useNotification } from '../../../../components/Notification';

interface Tutor { id: number; name: string; email?: string; phone?: string; pets?: any[] }

export default function TeamPage() {
  const { notification, showNotification, hideNotification, NotificationComponent } = useNotification();
  
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [proList, setProList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const mockPros = [
    { id: 1, name: 'Dra. Ana López', role: 'Veterinaria', email: 'ana.lopez@example.com' },
    { id: 2, name: 'Dr. Carlos Ruiz', role: 'Cirujano', email: 'carlos.ruiz@example.com' },
    { id: 3, name: 'Dra. María Pérez', role: 'Dermatología', email: 'maria.perez@example.com' },
  ];

  useEffect(() => {
    let mounted = true;
    async function check() {
      setLoading(true);
      try {
        const s = await authFetch('/account/status');
        if (s.ok) {
          const js = await s.json();
          if (mounted) setIsPremium(!!js.isPremium);
          if (js.isPremium) {
            const p = await authFetch('/account/professionals');
            if (p.ok) {
              const list = await p.json();
              if (mounted) setProList(list || []);
            }
          }
        } else {
          if (mounted) setIsPremium(false);
        }
      } catch (err) {
        console.error('Error checking premium', err);
        if (mounted) setIsPremium(false);
      } finally { if (mounted) setLoading(false); }
    }
    check();
    return () => { mounted = false };
  }, []);

  async function activatePremium() {
    try {
      const r = await authFetch('/account/activate-premium', { method: 'POST' });
      if (r.ok) {
        setIsPremium(true);
        const p = await authFetch('/account/professionals');
        if (p.ok) setProList(await p.json());
      } else {
        showNotification('No se pudo activar premium', 'error');
      }
    } catch (err) { 
      console.error(err); 
      showNotification('Error', 'error'); 
    }
  }

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');

  async function createPro(e?: any) {
    if (e && e.preventDefault) e.preventDefault();
    if (!newName) {
      showNotification('Nombre requerido', 'error');
      return;
    }
    try {
      const r = await authFetch('/account/professionals', { method: 'POST', body: JSON.stringify({ name: newName, email: newEmail, role: newRole }), headers: { 'Content-Type': 'application/json' } });
      if (r.ok) {
        const created = await r.json();
        setProList(prev => [created, ...prev]);
        setNewName(''); setNewEmail(''); setNewRole('');
        showNotification('Profesional agregado correctamente', 'success');
      } else {
        const txt = await r.text(); 
        showNotification('Error: ' + txt, 'error');
      }
    } catch (err) { 
      console.error(err); 
      showNotification('Error al crear profesional', 'error'); 
    }
  }

  async function deletePro(id: number) {
    if (!confirm('Eliminar profesional?')) return;
    try {
      const r = await authFetch('/account/professionals/' + id, { method: 'DELETE' });
      if (r.ok) {
        setProList(prev => prev.filter(p => p.id !== id));
        showNotification('Profesional eliminado correctamente', 'success');
      } else {
        showNotification('No se pudo eliminar', 'error');
      }
    } catch (err) { 
      console.error(err); 
      showNotification('Error', 'error'); 
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-2">Equipo</h1>
        <p className="text-sm text-gray-600">Gestiona los profesionales que trabajan en tu cuenta (próximamente en premium).</p>

        {loading ? (
          <div className="text-sm text-gray-500 mt-4">Cargando...</div>
        ) : isPremium ? (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-3">Profesionales</h3>
            {proList.length === 0 ? (
              <div className="text-sm text-gray-500">No hay profesionales. Agrégalos usando el formulario.</div>
            ) : (
              <ul className="space-y-2">
                {proList.map(p => (
                  <li key={p.id} className="p-3 border rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.role} — {p.email}</div>
                    </div>
                    <div>
                      <button onClick={() => deletePro(p.id)} className="text-red-600">Eliminar</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={createPro} className="mt-4 space-y-2">
              <div className="flex gap-2">
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre" className="flex-1 p-2 border rounded" />
                <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Rol" className="w-36 p-2 border rounded" />
              </div>
              <div className="flex gap-2">
                <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email (opcional)" className="flex-1 p-2 border rounded" />
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-200/50">Agregar</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-6">
            <div className="text-sm text-gray-500">Funcionalidad disponible solo en la suscripción premium.</div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {mockPros.map(p => (
                <div key={p.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.role}</div>
                  <div className="text-xs text-gray-400 mt-2">{p.email}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button onClick={activatePremium} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-200/50">Activar premium (dev)</button>
              <a href="/dashboard/billing" className="text-sm text-gray-600">Ver planes y precios</a>
            </div>
          </div>
        )}
      </div>
      
      {/* Notification Component */}
      {NotificationComponent}
    </div>
  );
}
