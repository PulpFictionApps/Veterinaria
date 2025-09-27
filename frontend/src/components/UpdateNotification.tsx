'use client';

import { useEffect, useState } from 'react';

export default function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Nueva versión disponible
        setUpdateAvailable(true);
        setShowUpdate(true);
      });

      // Verificar actualizaciones periódicamente
      const checkForUpdates = () => {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
      };

      // Verificar cada 30 minutos
      const updateInterval = setInterval(checkForUpdates, 30 * 60 * 1000);

      return () => {
        clearInterval(updateInterval);
      };
    }
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          reg.waiting.addEventListener('statechange', (e) => {
            if ((e.target as ServiceWorker).state === 'activated') {
              window.location.reload();
            }
          });
        }
      });
    }
    setShowUpdate(false);
  };

  const dismissUpdate = () => {
    setShowUpdate(false);
    // Mostrar de nuevo en 1 hora
    setTimeout(() => {
      if (updateAvailable) {
        setShowUpdate(true);
      }
    }, 60 * 60 * 1000);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50 mx-auto max-w-md">
      <div className="flex items-start gap-3">
        <div className="text-xl">🔄</div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            Actualización Disponible
          </h3>
          <p className="text-xs text-blue-100 mb-3">
            Una nueva versión de VetConnect está lista. ¡Actualiza para obtener las últimas mejoras!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="bg-white text-blue-600 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
            >
              Actualizar Ahora
            </button>
            <button
              onClick={dismissUpdate}
              className="text-xs text-blue-100 hover:text-white px-3 py-1.5"
            >
              Más tarde
            </button>
          </div>
        </div>
        <button
          onClick={dismissUpdate}
          className="text-blue-200 hover:text-white text-lg font-bold"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  );
}