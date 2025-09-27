'use client';

import { useState } from 'react';
import { authFetch } from '@/lib/api';
import { useAuthContext } from '@/lib/auth-context';

interface AutomationSettingsProps {
  whatsappNumber?: string;
  autoEmail?: string;
  enableWhatsappReminders?: boolean;
  enableEmailReminders?: boolean;
  onUpdate?: () => void;
}

export default function AutomationSettings({
  whatsappNumber = '',
  autoEmail = '',
  enableWhatsappReminders = false,
  enableEmailReminders = false,
  onUpdate
}: AutomationSettingsProps) {
  const { userId } = useAuthContext();
  const [formData, setFormData] = useState({
    whatsappNumber,
    autoEmail,
    enableWhatsappReminders,
    enableEmailReminders,
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const response = await authFetch(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar configuración');
      }

      setSuccess(true);
      onUpdate?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          🤖 Automatización de Recordatorios
        </h2>
        <p className="text-sm text-gray-600">
          Configure los recordatorios automáticos para sus pacientes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* WhatsApp Configuration */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            📱 WhatsApp
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de WhatsApp (con código de país)
              </label>
              <input
                type="tel"
                value={formData.whatsappNumber}
                onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                placeholder="+56912345678"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ejemplo: +56912345678 (Chile)
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableWhatsappReminders"
                checked={formData.enableWhatsappReminders}
                onChange={(e) => handleInputChange('enableWhatsappReminders', e.target.checked)}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="enableWhatsappReminders" className="text-sm text-gray-700">
                Activar recordatorios por WhatsApp
              </label>
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            📧 Email
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email para envío automático
              </label>
              <input
                type="email"
                value={formData.autoEmail}
                onChange={(e) => handleInputChange('autoEmail', e.target.value)}
                placeholder="clinica@ejemplo.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Este email aparecerá como remitente de los recordatorios
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableEmailReminders"
                checked={formData.enableEmailReminders}
                onChange={(e) => handleInputChange('enableEmailReminders', e.target.checked)}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <label htmlFor="enableEmailReminders" className="text-sm text-gray-700">
                Activar recordatorios por email
              </label>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-600">✅ Configuración actualizada correctamente</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {saving ? 'Guardando...' : 'Guardar Automatización'}
          </button>
        </div>
      </form>
    </div>
  );
}