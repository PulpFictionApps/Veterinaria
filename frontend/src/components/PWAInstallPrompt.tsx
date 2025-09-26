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

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar si ya está instalado
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Listener para el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Ocultar prompt después de la instalación
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
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

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  // No mostrar si ya está instalado
  if (isStandalone) return null;

  // Prompt para iOS
  if (isIOS && !isStandalone) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 lg:hidden">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              Instalar VetConnect
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Para una mejor experiencia, instala la app: toca el botón "Compartir" y luego "Agregar a pantalla de inicio"
            </p>
            <div className="flex gap-2">
              <button
                onClick={dismissPrompt}
                className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1"
              >
                Ahora no
              </button>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="text-gray-400 hover:text-gray-600"
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
                className="text-xs text-pink-100 hover:text-white px-3 py-1"
              >
                Ahora no
              </button>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="text-pink-200 hover:text-white"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return null;
}