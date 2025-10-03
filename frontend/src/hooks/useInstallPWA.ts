'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSInstalled = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isIOSInstalled);

    // Listener para el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Listener para cuando se instala
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      // Detección mejorada para iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSChrome = isIOS && /CriOS/.test(navigator.userAgent);
      const isIOSFirefox = isIOS && /FxiOS/.test(navigator.userAgent);
      const isSafari = isIOS && !isIOSChrome && !isIOSFirefox;
      
      let message = 'Para instalar Vetrium:\n\n';
      
      if (isIOS) {
        if (!isSafari) {
          message += '📱 IMPORTANTE: En iPhone/iPad, las PWA solo se pueden instalar desde Safari\n\n';
          message += '1️⃣ Abre esta página en Safari\n';
          message += '2️⃣ Toca el botón "Compartir" (⬆️) en la parte inferior\n';
          message += '3️⃣ Selecciona "Agregar a pantalla de inicio"\n';
          message += '4️⃣ Toca "Agregar" para confirmar\n\n';
          message += '⚠️ Nota: Chrome y Firefox en iOS no pueden instalar PWA debido a restricciones de Apple';
        } else {
          // Detectar versión de iOS
          const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
          const iosVersion = match ? parseFloat(`${match[1]}.${match[2]}`) : 0;
          
          if (iosVersion < 11.3) {
            message += '❌ Tu versión de iOS es muy antigua para soportar PWA\n';
            message += `📱 iOS detectado: ${iosVersion}\n`;
            message += '✅ Necesitas iOS 11.3 o superior\n\n';
            message += '💡 Puedes seguir usando la versión web normalmente';
          } else {
            message += '📱 Para instalar en iPhone/iPad:\n\n';
            message += '1️⃣ Toca el botón "Compartir" (⬆️) en la parte inferior de Safari\n';
            message += '2️⃣ Desplázate y selecciona "Agregar a pantalla de inicio"\n';
            message += '3️⃣ Toca "Agregar" para confirmar\n\n';
            message += '✨ La app aparecerá en tu pantalla de inicio como una app nativa';
          }
        }
      } else {
        message += '🖥️ En computador: Busca el ícono de instalación en la barra de direcciones\n';
        message += '📱 En Android: El botón de instalar debería aparecer automáticamente';
      }
      
      alert(message);
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setCanInstall(false);
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  };

  return {
    canInstall: canInstall && !isInstalled,
    isInstalled,
    installApp
  };
}