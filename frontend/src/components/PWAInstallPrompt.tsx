"use client";

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar si ya está instalado
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Verificar si el usuario ya ha rechazado la instalación
    const dismissed = localStorage.getItem('pwa-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const isDismissedRecently = Date.now() - dismissedTime < oneDayInMs;
    setIsDismissed(isDismissedRecently);

    // Para iOS, mostrar el prompt después de varias visitas
    if (iOS && !standalone && !isDismissedRecently) {
      const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0');
      localStorage.setItem('pwa-visit-count', (visitCount + 1).toString());
      
      // Mostrar después de 3 visitas
      if (visitCount >= 2) {
        setShowInstallPrompt(true);
      }
    }

    // Listener para el evento beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Solo mostrar si no ha sido rechazado recientemente
      if (!isDismissedRecently && !standalone) {
        setShowInstallPrompt(true);
      }
    };

    // Ocultar prompt después de la instalación
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-dismissed'); // Limpiar el rechazo ya que se instaló
      localStorage.removeItem('pwa-visit-count'); // Limpiar contador de visitas
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        localStorage.removeItem('pwa-dismissed'); // Limpiar el rechazo ya que se instaló
      } else {
        // Usuario rechazó la instalación
        dismissPrompt();
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
    
    setDeferredPrompt(null);
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  // No mostrar si ya está instalado o fue rechazado recientemente
  if (isStandalone || isDismissed) return null;

  // Prompt para iOS
  if (isIOS && !isStandalone && showInstallPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 lg:hidden">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              Instalar VetConnect
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Para una mejor experiencia, instala la app: toca el botón "Compartir" 
              <span className="inline-block mx-1">📤</span> 
              y luego "Agregar a pantalla de inicio"
            </p>
            <div className="flex gap-2">
              <button
                onClick={dismissPrompt}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 bg-gray-100 rounded-md transition-colors"
              >
                No mostrar más
              </button>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold w-6 h-6 flex items-center justify-center"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // Prompt para Android/Desktop
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg shadow-lg p-4 z-50 lg:hidden">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm mb-1">
              Instalar VetConnect
            </h3>
            <p className="text-xs text-pink-100 mb-3">
              Instala la app para acceso rápido y funciones offline
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-pink-600 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-pink-50 transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={dismissPrompt}
                className="text-xs text-pink-100 hover:text-white px-3 py-1.5 bg-pink-600/50 rounded-md transition-colors"
              >
                No mostrar más
              </button>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="text-pink-200 hover:text-white text-xl font-bold w-6 h-6 flex items-center justify-center"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return null;
}