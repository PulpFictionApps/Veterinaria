import { useState } from 'react';
import { authFetch } from '../lib/api';
import { useNotification } from './Notification';

interface SubscriptionBlockedProps {
  subscription?: any;
  onRetry?: () => void;
}

export default function SubscriptionBlocked({ subscription, onRetry }: SubscriptionBlockedProps) {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  async function startPayment() {
    try {
      setLoading(true);
      const res = await authFetch('/billing/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: 'basic' })
      });

      if (!res.ok) {
        const data = await res.json();
        showNotification(data.error || 'Error al iniciar el pago', 'error');
        return;
      }

      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        showNotification('No se pudo inicializar el pago', 'error');
      }
    } catch (error) {
      showNotification('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  }

  const isExpiredTrial = subscription?.status === 'trial' || subscription?.status === 'expired';
  const title = isExpiredTrial 
    ? '¡Tu prueba gratuita ha terminado!' 
    : '¡Suscripción requerida!';
  
  const message = isExpiredTrial
    ? 'Los 7 días de prueba gratuita han expirado. Para continuar usando todas las funcionalidades de Vetrium, activa tu Plan Premium.'
    : 'Necesitas una suscripción activa para acceder a esta funcionalidad. Activa tu Plan Premium para continuar.';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">⏰</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600 leading-relaxed">{message}</p>
          </div>

          {/* Plan details */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-3">Plan Veterinario Premium</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">$15.000 CLP</div>
            <div className="text-sm text-blue-700 mb-4">por mes</div>
            
            <div className="space-y-2 text-sm text-left">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Agenda pública ilimitada</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Gestión completa de pacientes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Recetas digitales en PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Historiales médicos completos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Reportes y estadísticas</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button 
              onClick={startPayment}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-bold text-lg shadow-lg disabled:opacity-50"
            >
              {loading ? '⏳ Procesando...' : '💳 Activar Plan Premium'}
            </button>
            
            {onRetry && (
              <button 
                onClick={onRetry}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🔄 Verificar estado
              </button>
            )}
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              ¿Problemas con el pago? 
              <br />
              <a href="mailto:soporte@vetrium.cl" className="text-blue-600 hover:underline">
                Contacta con soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}