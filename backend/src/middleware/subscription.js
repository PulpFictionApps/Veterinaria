import prisma from '../../lib/prisma.js';

// Middleware para verificar que la suscripción esté activa y no haya expirado
export async function verifyActiveSubscription(req, res, next) {
  try {
    const userId = Number(req.user.id);
    
    // Buscar la suscripción del usuario
    const subscription = await prisma.subscription.findFirst({
      where: { userId }
    });

    // Si no hay suscripción, bloquear acceso
    if (!subscription) {
      return res.status(403).json({ 
        error: 'SUBSCRIPTION_REQUIRED',
        message: 'Se requiere una suscripción activa para acceder a esta funcionalidad',
        redirectTo: '/dashboard/billing'
      });
    }

    // Verificar si la suscripción ha expirado
    const now = new Date();
    const isExpired = subscription.expiresAt && new Date(subscription.expiresAt) <= now;

    if (isExpired) {
      // Actualizar estado a expirado
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' }
      });

      // Desactivar premium del usuario
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: false }
      });

      return res.status(403).json({
        error: 'SUBSCRIPTION_EXPIRED',
        message: 'Tu suscripción ha expirado. Renueva tu plan para continuar usando la aplicación.',
        redirectTo: '/dashboard/billing',
        subscription: {
          ...subscription,
          status: 'expired'
        }
      });
    }

    // Si la suscripción está cancelada o en otro estado no activo, bloquear
    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      return res.status(403).json({
        error: 'SUBSCRIPTION_INACTIVE',
        message: 'Tu suscripción no está activa. Reactiva tu plan para continuar.',
        redirectTo: '/dashboard/billing',
        subscription
      });
    }

    // Agregar información de suscripción al request para uso posterior
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Error verificando suscripción:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor al verificar suscripción' 
    });
  }
}

// Middleware más permisivo que solo verifica pero no bloquea (para endpoints de lectura)
export async function checkSubscriptionStatus(req, res, next) {
  try {
    const userId = Number(req.user.id);
    
    const subscription = await prisma.subscription.findFirst({
      where: { userId }
    });

    // Solo agregar información sin bloquear
    req.subscription = subscription;
    
    // Marcar como expirada si es necesario (sin bloquear)
    if (subscription?.expiresAt && new Date(subscription.expiresAt) <= new Date()) {
      const updatedSub = await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' }
      });
      req.subscription = updatedSub;
    }
    
    next();
  } catch (error) {
    console.error('Error checking subscription:', error);
    // Continuar sin bloquear en caso de error
    next();
  }
}