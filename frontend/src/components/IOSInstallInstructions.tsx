'use client';

import { useState, useEffect } from 'react';

export default function IOSInstallInstructions() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({ browser: '', version: '', canInstall: false });

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!iOS) return;

    // Detectar si ya está instalado
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    if (standalone) return;

    // Detectar navegador
    const isIOSChrome = /CriOS/.test(navigator.userAgent);
    const isIOSFirefox = /FxiOS/.test(navigator.userAgent);
    const isSafari = !isIOSChrome && !isIOSFirefox;

    // Detectar versión de iOS
    const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
    const iosVersion = match ? parseFloat(`${match[1]}.${match[2]}`) : 0;

    setBrowserInfo({
      browser: isIOSChrome ? 'Chrome' : isIOSFirefox ? 'Firefox' : 'Safari',
      version: iosVersion.toString(),
      canInstall: isSafari && iosVersion >= 11.3
    });

    // Verificar si ya fue rechazado
    const dismissed = localStorage.getItem('ios-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const isDismissedRecently = Date.now() - dismissedTime < oneDayInMs;

    // Mostrar después de algunas visitas y si no fue rechazado recientemente
    const visitCount = parseInt(localStorage.getItem('ios-install-visits') || '0');
    localStorage.setItem('ios-install-visits', (visitCount + 1).toString());

    if (visitCount >= 2 && !isDismissedRecently) {
      setShowInstructions(true);
    }
  }, []);

  const dismiss = () => {
    setShowInstructions(false);
    localStorage.setItem('ios-install-dismissed', Date.now().toString());
  };

  if (!showInstructions) return null;

  const { browser, version, canInstall } = browserInfo;

  return (
    <div className="fixed top-4 left-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50 mx-auto max-w-md">
      <div className="flex items-start gap-3">
        <div className="text-2xl">📱</div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-2">
            Instalar VetConnect en iPhone/iPad
          </h3>

          {!canInstall && browser !== 'Safari' && (
            <div className="bg-red-500/20 border border-red-300/20 rounded p-3 mb-3">
              <p className="text-xs text-red-100 mb-2">
                <strong>⚠️ Navegador no compatible</strong>
              </p>
              <p className="text-xs text-red-100">
                Las PWA solo se pueden instalar desde <strong>Safari</strong> en iOS.
                Actualmente usas <strong>{browser}</strong>.
              </p>
            </div>
          )}

          {parseFloat(version) < 11.3 && (
            <div className="bg-orange-500/20 border border-orange-300/20 rounded p-3 mb-3">
              <p className="text-xs text-orange-100 mb-2">
                <strong>⚠️ iOS muy antiguo</strong>
              </p>
              <p className="text-xs text-orange-100">
                Tu iOS {version} no soporta PWA. Necesitas iOS 11.3 o superior.
              </p>
            </div>
          )}

          {canInstall && (
            <div className="bg-green-500/20 border border-green-300/20 rounded p-3 mb-3">
              <p className="text-xs font-medium text-green-100 mb-2">
                ✅ Tu dispositivo es compatible
              </p>
              <ol className="text-xs text-green-100 space-y-1">
                <li>1️⃣ Toca el botón <strong>Compartir</strong> ⬆️ abajo</li>
                <li>2️⃣ Desplázate y toca <strong>"Agregar a pantalla de inicio"</strong></li>
                <li>3️⃣ Toca <strong>"Agregar"</strong> para confirmar</li>
              </ol>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button
              onClick={dismiss}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors"
            >
              Entendido
            </button>
            {!canInstall && (
              <a
                href="https://apps.apple.com/app/safari/id1146562112"
                className="text-xs bg-white text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir en Safari
              </a>
            )}
          </div>
        </div>
        <button
          onClick={dismiss}
          className="text-blue-200 hover:text-white text-lg font-bold"
          aria-label="Cerrar"
        >
          ×
        </button>
      </div>
    </div>
  );
}