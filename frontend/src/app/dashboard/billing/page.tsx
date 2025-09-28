"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '../../../lib/api';
import { useNotification } from '../../../components/Notification';

export default function BillingPage() {
  const { showNotification, NotificationComponent } = useNotification();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any | null>(null);

  const invoices = [
    { id: 'INV-1001', date: '2025-09-01', amount: '$15.000', status: 'paid' },
    { id: 'INV-1002', date: '2025-08-15', amount: '$15.000', status: 'paid' },
    { id: 'INV-1003', date: '2025-07-21', amount: '$15.000', status: 'pending' },
  ];

  const PLAN_INFO = {
    display: 'Plan Veterinario Premium',
    price: '$15.000 CLP / mes',
    features: [
      '7 dias de prueba gratuita',
      'Agenda publica ilimitada', 
      'Gestion de clientes y mascotas',
      'Citas y disponibilidad',
      'Recetas en PDF',
      'Ficha clinica y bitacora'
    ]
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  async function loadSubscription() {
    try {
      const res = await authFetch('/account/subscription');
      if (res.ok) {
        const data = await res.json();
        setSubscription(data.subscription || null);
      }
    } catch (err) {
      console.error('Error loading subscription', err);
    }
  }

  async function startCheckout() {
    try {
      setLoading(true);
      const res = await authFetch('/billing/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'basic' })
      });
      
      if (!res.ok) {
        const data = await res.json();
        console.error('Server error:', data);
        showNotification(data.error || 'Error al crear la preferencia de pago', 'error');
        return;
      }

      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        showNotification('No se pudo inicializar el pago', 'error');
      }
    } catch (err) {
      console.error('Request failed:', err);
      showNotification('Error de conexion', 'error');
    } finally {
      setLoading(false);
    }
  }

  function getDaysRemaining() {
    if (!subscription?.expiresAt) return 0;
    return Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000*60*60*24));
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Suscripcion y Facturacion</h1>
        <p className="text-gray-600">Gestiona tu plan premium y revisa tu historial de pagos.</p>
      </div>

      {subscription ? (
        <div className="p-6 rounded-xl border-2 mb-6 bg-blue-50 border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{PLAN_INFO.display}</h3>
                {subscription.status === 'trial' && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Prueba Gratuita
                  </span>
                )}
                {subscription.status === 'expired' && (
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Expirada
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{PLAN_INFO.price}</p>
              
              <div className="font-semibold mb-3 text-blue-600">
                {subscription.status === 'trial' ? 'Prueba Gratuita Activa' : 
                 subscription.status === 'active' ? 'Suscripcion Activa' : 
                 subscription.status === 'expired' ? 'Suscripcion Expirada' : subscription.status}
              </div>

              {subscription.expiresAt && (
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">
                    {subscription.status === 'trial' ? 'Prueba termina:' : 'Expira:'} 
                  </span> {new Date(subscription.expiresAt).toLocaleDateString()} 
                  ({getDaysRemaining()} dias restantes)
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm">
                {PLAN_INFO.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ml-6">
              <button 
                onClick={startCheckout}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium shadow-lg"
              >
                {subscription.status === 'trial' ? 'Activar Plan Premium' :
                 subscription.status === 'expired' ? 'Reactivar Suscripcion' : 'Renovar Plan'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-center mb-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-3">
            Comienza tu prueba gratuita!
          </h3>
          <p className="text-blue-800 mb-6">
            7 dias gratis del Plan Veterinario Premium, luego $15.000 CLP mensuales.
          </p>
          
          <button 
            onClick={startCheckout}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-bold text-lg shadow-xl"
          >
            Comenzar Prueba Gratuita
          </button>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-4">Historial de Pagos</h3>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Monto</th>
                <th className="p-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {invoices.map((inv, idx) => (
                <tr key={inv.id} className={idx < invoices.length - 1 ? 'border-b' : ''}>
                  <td className="p-3 font-mono text-sm">{inv.id}</td>
                  <td className="p-3">{inv.date}</td>
                  <td className="p-3 font-semibold">{inv.amount}</td>
                  <td className="p-3">
                    <span className={inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {inv.status === 'paid' ? 'Pagada' : 'Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {NotificationComponent}
    </div>
  );
}
