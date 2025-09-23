"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../../lib/auth-context';
import { authFetch } from '../../lib/api';

export default function PlansPage() {
  const { token } = useAuthContext();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    // Load Mercado Pago render script for subscription buttons (client-only)
    if (typeof window === 'undefined') return;
    if ((window as any).$MPC_loaded) return;
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = (document.location.protocol === 'https:' ? 'https:' : 'http:') + '//secure.mlstatic.com/mptools/render.js';
    s.onload = () => { (window as any).$MPC_loaded = true; };
    const x = document.getElementsByTagName('script')[0];
    x.parentNode?.insertBefore(s, x);
  }, []);
  const tiers = [
    {
      id: 'basic',
      // Mercado Pago preapproval plan id (sandbox / production as configured in env)
      preapproval_plan_id: '9642d780aa0849d9b2c52d4a158443df',
      name: 'Básico',
      price: '15.000',
      currency: 'CLP',
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
  price: '29.000',
  currency: 'CLP',
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
  price: '49.000',
  currency: 'CLP',
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
                  <span className="text-3xl font-extrabold">{tier.currency ? `${tier.price} ${tier.currency}` : `$${tier.price}`}</span>
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
                          body: JSON.stringify({ preapproval_plan_id: tier.preapproval_plan_id || tier.id })
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
                  // If not logged, send them to register with the plan query param
                  <Link href={`${tier.cta.href}?plan=${tier.preapproval_plan_id || tier.id}`} className={`block w-full text-center py-3 rounded-lg font-medium ${tier.popular ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-50 border border-gray-200 text-gray-800 hover:bg-gray-100'}`}>
                    {tier.cta.label}
                  </Link>
                )}

                {/* Mercado Pago subscribe button for the basic plan (client-side only) */}
                {tier.id === 'basic' && (
                  <div className="mt-4 text-center">
                    <a
                      id="mp-subscribe-basic"
                      href={`https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=${tier.preapproval_plan_id}&external_reference=1:manual_test`}
                      className="blue-button"
                      data-preapproval-id={tier.preapproval_plan_id}
                    >
                      Suscribirme
                    </a>
                    <style>{`.blue-button{background-color:#3483FA;color:white;padding:10px 24px;text-decoration:none;border-radius:5px;display:inline-block;font-size:16px;transition:background-color .3s;font-family:Arial,sans-serif}.blue-button:hover{background-color:#2a68c8}`}</style>
                  </div>
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
