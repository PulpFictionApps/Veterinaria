'use client';

import { useInstallPWA } from '../hooks/useInstallPWA';

interface InstallButtonProps {
  showDesktopButton?: boolean;
  inline?: boolean;
}

export default function InstallButton({ showDesktopButton = false, inline = false }: InstallButtonProps) {
  const { canInstall, isInstalled, installApp } = useInstallPWA();

  if (!canInstall || isInstalled) return null;

  if (inline || showDesktopButton) {
    // Botón inline para página principal
    return (
      <button
        onClick={installApp}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium"
      >
        <span className="text-lg mr-2">📱</span>
        Descargar App
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:hidden">
      <button
        onClick={installApp}
        className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-bounce"
        title="Instalar VetConnect"
      >
        <div className="flex items-center justify-center w-12 h-12">
          <span className="text-2xl">📱</span>
        </div>
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 w-32 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 hover:opacity-100 transition-opacity">
        <div className="text-center">
          Instalar App
        </div>
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}