'use client';

import { useState } from 'react';
import { useAuthContext } from '@/lib/auth-context';
import ThemedButton from './ThemedButton';

export default function PublicLinkManager() {
  const { userId } = useAuthContext();
  const [copied, setCopied] = useState(false);
  const [shareMethods, setShareMethods] = useState({
    whatsapp: false,
    email: false,
    sms: false
  });

  const bookingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/book/${userId}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('No se pudo copiar', err);
    }
  }

  function shareViaWhatsApp() {
    const message = encodeURIComponent(
      `¡Hola! Puedes agendar tu cita veterinaria directamente desde este enlace: ${bookingUrl}\n\n¡Es muy fácil y rápido!`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  }

  function shareViaEmail() {
    const subject = encodeURIComponent('Agendar Cita Veterinaria');
    const body = encodeURIComponent(
      `Hola,\n\nPuedes agendar tu cita veterinaria directamente desde este enlace:\n${bookingUrl}\n\n¡Solo selecciona el horario que mejor te convenga y llena los datos de tu mascota!\n\nSaludos`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  function shareViaSMS() {
    const message = encodeURIComponent(
      `¡Hola! Agenda tu cita veterinaria aquí: ${bookingUrl}`
    );
    window.open(`sms:?body=${message}`);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Enlace Público de Reservas
        </h3>
        <p className="text-sm text-gray-600">
          Comparte este enlace con tus clientes para que puedan agendar citas directamente
        </p>
      </div>

      <div className="space-y-4">
        {/* URL Display & Copy */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <input 
            readOnly 
            value={bookingUrl} 
            className="flex-1 px-3 py-2 border border-gray-300 rounded bg-white text-sm font-mono" 
          />
          <ThemedButton
            onClick={copyLink} 
            size="sm"
            disabled={copied}
            className="whitespace-nowrap"
          >
            {copied ? '✅ Copiado' : '📋 Copiar'}
          </ThemedButton>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ThemedButton
            onClick={shareViaWhatsApp}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <span className="text-green-600">💬</span>
            WhatsApp
          </ThemedButton>
          
          <ThemedButton
            onClick={shareViaEmail}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <span className="text-blue-600">📧</span>
            Email
          </ThemedButton>
          
          <ThemedButton
            onClick={shareViaSMS}
            variant="outline"
            size="sm" 
            className="flex items-center gap-2"
          >
            <span className="text-purple-600">📱</span>
            SMS
          </ThemedButton>
        </div>

        {/* Preview Link */}
        <div className="pt-3 border-t">
          <p className="text-xs text-gray-500 mb-2">Vista previa del formulario:</p>
          <a 
            href={bookingUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-pink-600 hover:text-pink-700 underline"
          >
            Ver formulario público →
          </a>
        </div>
      </div>
    </div>
  );
}