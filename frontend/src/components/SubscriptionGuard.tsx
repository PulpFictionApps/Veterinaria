"use client";

import { useRequireActiveSubscription } from '../hooks/useSubscription';
import SubscriptionBlocked from './SubscriptionBlocked';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiresActive?: boolean;
}

export default function SubscriptionGuard({ children, requiresActive = true }: SubscriptionGuardProps) {
  const { hasAccess, loading, status } = useRequireActiveSubscription();

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Verificando suscripción...</p>
        </div>
      </div>
    );
  }

  // Si no requiere suscripción activa, mostrar contenido
  if (!requiresActive) {
    return <>{children}</>;
  }

  // Si no tiene acceso, mostrar pantalla de bloqueo
  if (!hasAccess) {
    return (
      <SubscriptionBlocked 
        subscription={status?.subscription}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Si tiene acceso, mostrar contenido
  return <>{children}</>;
}