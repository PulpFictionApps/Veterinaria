import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../lib/api';

export interface SubscriptionStatus {
  isActive: boolean;
  isExpired: boolean;
  isTrial: boolean;
  daysRemaining: number;
  subscription: unknown;
  needsPayment: boolean;
}

export function useSubscriptionStatus() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  async function checkSubscriptionStatus() {
    try {
      const res = await authFetch('/account/subscription');
      
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      const subscription = data.subscription;

      if (!subscription) {
        setStatus({
          isActive: false,
          isExpired: false,
          isTrial: false,
          daysRemaining: 0,
          subscription: null,
          needsPayment: true
        });
        setLoading(false);
        return;
      }

      const now = new Date();
      const expiresAt = subscription.expiresAt ? new Date(subscription.expiresAt) : null;
      const isExpired = expiresAt && expiresAt <= now;
      const daysRemaining = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      const subscriptionStatus: SubscriptionStatus = {
        isActive: subscription.status === 'active' && !isExpired,
        isExpired: isExpired || subscription.status === 'expired',
        isTrial: subscription.status === 'trial' && !isExpired,
        daysRemaining: Math.max(0, daysRemaining),
        subscription,
        needsPayment: isExpired || subscription.status === 'expired' || (subscription.status === 'trial' && daysRemaining <= 0)
      };

      setStatus(subscriptionStatus);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    } finally {
      setLoading(false);
    }
  }

  // Función para manejar errores de API relacionados con suscripción
  function handleSubscriptionError(error: unknown) {
    if (error && typeof error === 'object' && 'error' in error) {
      const e = error as { error?: string };
      if (e.error === 'SUBSCRIPTION_EXPIRED' || e.error === 'SUBSCRIPTION_REQUIRED') {
        router.push('/dashboard/billing');
        return true;
      }
    }
    return false;
  }

  // Función para refrescar el estado de la suscripción
  function refreshStatus() {
    setLoading(true);
    checkSubscriptionStatus();
  }

  return {
    status,
    loading,
    handleSubscriptionError,
    refreshStatus
  };
}

// Hook para proteger componentes que requieren suscripción activa
export function useRequireActiveSubscription() {
  const { status, loading } = useSubscriptionStatus();
  const router = useRouter();

  useEffect(() => {
    if (!loading && status?.needsPayment) {
      router.push('/dashboard/billing');
    }
  }, [status, loading, router]);

  return { 
    hasAccess: !loading && status && !status.needsPayment,
    loading,
    status 
  };
}