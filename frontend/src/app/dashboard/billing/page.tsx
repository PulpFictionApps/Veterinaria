"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '../../../lib/api';
import { useNotification } from '../../../components/Notification';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Star,
  Stethoscope,
  Heart,
  Shield,
  Zap,
  FileText,
  Award
} from 'lucide-react';
import { FadeIn, SlideIn, Stagger, AnimateOnView } from '../../../components/ui/Transitions';
import Tooltip from '../../../components/ui/Tooltip';
import PageHeader from '../../../components/ui/PageHeader';
import '../../../styles/billing-fixes.css';

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
      { text: '7 días de prueba gratuita', icon: Clock },
      { text: 'Agenda pública ilimitada', icon: Calendar },
      { text: 'Gestión de clientes y mascotas', icon: Heart },
      { text: 'Citas y disponibilidad', icon: Stethoscope },
      { text: 'Recetas médicas en PDF', icon: FileText },
      { text: 'Ficha clínica y bitácora', icon: Shield }
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
    <div className="vet-page">
      <PageHeader
        title="Suscripción y Facturación"
        subtitle="Gestiona tu plan veterinario premium y revisa tu historial de pagos"
        icon={CreditCard}
      />

      <div className="vet-container space-y-8">

        <Stagger className="space-y-8">
          {subscription ? (
            <AnimateOnView>
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="h-6 w-6 text-white" />
                      <h2 className="text-xl font-bold text-white">{PLAN_INFO.display}</h2>
                    </div>
                    {subscription.status === 'trial' && (
                      <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Prueba Gratuita
                      </span>
                    )}
                    {subscription.status === 'expired' && (
                      <span className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Expirada
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-gray-900 mb-2">{PLAN_INFO.price}</p>
                        <div className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          {subscription.status === 'trial' ? 'Prueba Gratuita Activa' : 
                           subscription.status === 'active' ? 'Suscripción Activa' : 
                           subscription.status === 'expired' ? 'Suscripción Expirada' : subscription.status}
                        </div>
                      </div>

                      {subscription.expiresAt && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
                          <div className="flex items-center gap-2 text-gray-800">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">
                              {subscription.status === 'trial' ? 'Prueba termina:' : 'Expira:'} 
                            </span>
                            <span className="font-bold text-blue-800">
                              {new Date(subscription.expiresAt).toLocaleDateString()} 
                              ({getDaysRemaining()} días restantes)
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-gray-800">
                        {PLAN_INFO.features.map((feature, idx) => {
                          const IconComponent = feature.icon;
                          return (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                              <IconComponent className="h-5 w-5 text-blue-600" />
                              <span className="text-sm font-medium text-gray-800">{feature.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      <Tooltip content="Gestionar suscripción veterinaria">
                        <button 
                          onClick={startCheckout}
                          disabled={loading}
                          className="group w-full px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-600 hover:to-gray-600 transition-all duration-300 font-bold text-lg shadow hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Zap className={`h-5 w-5 ${loading ? 'animate-spin' : 'group-hover:scale-110 transition-transform duration-300'}`} />
                          {subscription.status === 'trial' ? 'Activar Plan Premium' :
                           subscription.status === 'expired' ? 'Reactivar Suscripción' : 'Renovar Plan'}
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnView>
          ) : (
            <AnimateOnView>
              <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-white" />
                    <h2 className="text-xl font-bold text-white">Comienza tu Práctica Veterinaria Premium</h2>
                  </div>
                </div>
                
                <div className="p-8 text-center">
                  <div className="mb-6">
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg mb-4">
                      <Stethoscope className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        ¡7 Días de Prueba Gratuita!
                      </h3>
                      <p className="text-gray-800 text-lg mb-4">
                        Experimenta todas las funciones del Plan Veterinario Premium
                      </p>
                      <p className="text-gray-800 font-medium">
                        Luego solo <span className="text-blue-800 font-bold text-xl">$15.000 CLP mensuales</span>
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6 text-gray-800">
                      {PLAN_INFO.features.map((feature, idx) => {
                        const IconComponent = feature.icon;
                        return (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-left border border-blue-200">
                            <IconComponent className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-800">{feature.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Tooltip content="Iniciar prueba gratuita de 7 días">
                    <button 
                      onClick={startCheckout}
                      disabled={loading}
                      className="group px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-600 hover:to-gray-600 transition-all duration-300 font-bold text-lg shadow hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto"
                    >
                      <Heart className={`h-5 w-5 ${loading ? 'animate-pulse' : 'group-hover:scale-110 transition-transform duration-300'}`} />
                      Comenzar Prueba Gratuita
                      <Star className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </AnimateOnView>
          )}

          <AnimateOnView>
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Historial de Pagos</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-100">
                      <tr>
                        <th className="p-4 text-left font-bold text-gray-800">ID Factura</th>
                        <th className="p-4 text-left font-bold text-gray-800">Fecha</th>
                        <th className="p-4 text-left font-bold text-gray-800">Monto</th>
                        <th className="p-4 text-left font-bold text-gray-800">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {invoices.map((inv, idx) => (
                        <tr key={inv.id} className={`hover:bg-gray-50 transition-colors duration-200 ${idx < invoices.length - 1 ? 'border-b border-gray-200' : ''}`}>
                          <td className="p-4 font-mono text-sm text-gray-800 font-medium">{inv.id}</td>
                          <td className="p-4 text-gray-800">{inv.date}</td>
                          <td className="p-4 font-bold text-gray-700">{inv.amount}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 w-fit ${
                              inv.status === 'paid' 
                                ? 'bg-gray-100 text-gray-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {inv.status === 'paid' ? (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  Pagada
                                </>
                              ) : (
                                <>
                                  <Clock className="h-4 w-4" />
                                  Pendiente
                                </>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {invoices.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-700 font-medium">No hay facturas disponibles</p>
                    <p className="text-sm text-gray-700 mt-1">Los pagos aparecerán aquí cuando se procesen</p>
                  </div>
                )}
              </div>
            </div>
          </AnimateOnView>
        </Stagger>

        {NotificationComponent}
      </div>
    </div>
  );
}
