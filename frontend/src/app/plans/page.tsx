"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useAuthContext } from '../../lib/auth-context';
import { authFetch } from '../../lib/api';

export default function PlansPage() {
  const { token } = useAuthContext();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const tiers = [
    {
      id: 'basic',
      name: 'Básico',
      price: '15',
      frequency: '/mes',
      description: 'Plan por defecto después de la prueba de 30 días',
      features: [
        'Agenda pública y privada',
        'Gestión de clientes',
        'Gestión de mascotas',
        'Reservas y citas',
        'Gestionar disponibilidad',
        'Creación de recetas en PDF',
        'Bitácora de la mascota',
        'Ficha clínica completa',
      ],
      cta: { label: 'Comenzar prueba 30 días', href: '/register' },
      popular: true,
      accent: 'border-green-500',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '29',
      frequency: '/mes',
      description: 'Funciones avanzadas para clínicas con más demanda',
      features: ['Disponibilidad avanzada', 'Citas recurrentes', 'Historiales médicos avanzados', 'Soporte prioritario'],
      cta: { label: 'Probar Pro', href: '/register' },
      popular: false,
      accent: 'border-green-500',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '49',
      frequency: '/mes',
      description: 'Todo lo necesario para clínicas medianas y grandes',
      features: ['Multisede', 'Exportaciones', 'Integraciones', 'Asignación de equipo'],
      cta: { label: 'Contactar ventas', href: '/contact' },
      popular: false,
      accent: 'border-blue-500',
    },
  ];

  return (
    <div className="flex-1 min-h-0 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold">Planes y precios</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">Elige el plan que mejor se adapte a tu clínica. Cambia de plan cuando quieras.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div key={tier.id} className={`bg-white rounded-2xl shadow p-6 border ${tier.accent} ${tier.popular ? 'transform scale-105' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{tier.description}</p>
                </div>
                {tier.popular && (
                  <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">Más popular</div>
                )}
              </div>

              <div className="mt-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">${tier.price}</span>
                  <span className="text-sm text-gray-600">{tier.frequency}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Pago mensual. Facturación anual disponible por contrato.</p>
              </div>

              <ul className="mt-6 space-y-3 text-gray-700">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {token ? (
                  <button
                    onClick={async () => {
                      if (loadingPlan) return;
                      try {
                        setLoadingPlan(tier.id);
                        const res = await authFetch('/billing/create-subscription', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ preapproval_plan_id: tier.id })
                        });
                        const data = await res.json();
                        if (!res.ok) return alert(data.error || 'Error creando suscripción');
                        if (data.checkoutUrl) window.location.href = data.checkoutUrl;
                        else alert('No se recibió checkoutUrl');
                      } catch (err: any) {
                        alert('Error de conexión');
                      } finally { setLoadingPlan(null); }
                    }}
                    className={`block w-full text-center py-3 rounded-lg font-medium ${tier.popular ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-50 border border-gray-200 text-gray-800 hover:bg-gray-100'}`}
                    disabled={Boolean(loadingPlan)}
                  >
                    {loadingPlan === tier.id ? 'Redirigiendo...' : 'Contratar'}
                  </button>
                ) : (
                  <Link href={`${tier.cta.href}?plan=${tier.id}`} className={`block w-full text-center py-3 rounded-lg font-medium ${tier.popular ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-50 border border-gray-200 text-gray-800 hover:bg-gray-100'}`}>
                    {tier.cta.label}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>¿No encuentras lo que necesitas? <Link href="/contact" className="text-blue-600 underline">Contáctanos</Link> para un plan a medida.</p>
        </div>
      </div>
    </div>
  );
}
