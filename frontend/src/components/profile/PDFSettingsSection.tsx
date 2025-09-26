'use client';

import { useState } from 'react';
import { authFetch } from '@/lib/api';

interface PDFData {
  prescriptionHeader?: string;
  clinicName?: string;
  prescriptionFooter?: string;
}

interface Props {
  initialData: PDFData;
  onUpdate?: () => void;
}

export function PDFSettingsSection({ initialData, onUpdate }: Props) {
  const [formData, setFormData] = useState<PDFData>(initialData);
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
        throw new Error(errorData.error || 'Error al actualizar configuración de PDF');
      }

      setSuccess(true);
      onUpdate?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración de PDF');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof PDFData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Configuración de PDF y Recetas</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre de la Clínica
          </label>
          <input
            type="text"
            value={formData.clinicName || ''}
            onChange={(e) => handleInputChange('clinicName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Clínica Veterinaria Los Andes"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Encabezado de Recetas
          </label>
          <textarea
            value={formData.prescriptionHeader || ''}
            onChange={(e) => handleInputChange('prescriptionHeader', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Información que aparecerá en la parte superior de las recetas (dirección, teléfono, etc.)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pie de Página de Recetas
          </label>
          <textarea
            value={formData.prescriptionFooter || ''}
            onChange={(e) => handleInputChange('prescriptionFooter', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Información que aparecerá en la parte inferior de las recetas (registro, sitio web, etc.)"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Vista Previa</h3>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
            <div className="border-t border-gray-300 pt-2">
              <strong>Encabezado:</strong>
              <div className="whitespace-pre-line">{formData.prescriptionHeader || 'No configurado'}</div>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <strong>Clínica:</strong> {formData.clinicName || 'No configurado'}
            </div>
            <div className="border-t border-gray-300 pt-2">
              <strong>Pie de página:</strong>
              <div className="whitespace-pre-line">{formData.prescriptionFooter || 'No configurado'}</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded">
            Configuración de PDF actualizada correctamente
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md transition-colors duration-200"
        >
          {saving ? 'Guardando...' : 'Actualizar Configuración PDF'}
        </button>
      </form>
    </div>
  );
}