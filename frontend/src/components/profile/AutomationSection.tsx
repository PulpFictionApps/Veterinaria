'use client';

import { useState } from 'react';
import { authFetch } from '@/lib/api';

interface AutomationData {
  whatsappNumber?: string;
  autoEmail?: string;
  enableWhatsappReminders?: boolean;
  enableEmailReminders?: boolean;
}

interface Props {
  initialData: AutomationData;
  onUpdate?: () => void;
}

export function AutomationSection({ initialData, onUpdate }: Props) {
  const [formData, setFormData] = useState<AutomationData>(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const response = await authFetch(`/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar configuración de automatización');
      }

      setSuccess(true);
      onUpdate?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración de automatización');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AutomationData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Automatización y Recordatorios</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de WhatsApp
            </label>
            <input
              type="tel"
              value={formData.whatsappNumber || ''}
              onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="+56912345678"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email para automatización
            </label>
            <input
              type="email"
              value={formData.autoEmail || ''}
              onChange={(e) => handleInputChange('autoEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="notificaciones@tuclínica.cl"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableWhatsappReminders"
              checked={formData.enableWhatsappReminders || false}
              onChange={(e) => handleInputChange('enableWhatsappReminders', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="enableWhatsappReminders" className="text-sm text-gray-700 dark:text-gray-300">
              Enviar recordatorios por WhatsApp
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableEmailReminders"
              checked={formData.enableEmailReminders || false}
              onChange={(e) => handleInputChange('enableEmailReminders', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="enableEmailReminders" className="text-sm text-gray-700 dark:text-gray-300">
              Enviar recordatorios por Email
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded">
            Configuración de automatización actualizada correctamente
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          {saving ? 'Guardando...' : 'Actualizar Configuración'}
        </button>
      </form>
    </div>
  );
}