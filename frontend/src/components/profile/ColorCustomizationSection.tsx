'use client';

import { useState } from 'react';
import { authFetch } from '@/lib/api';

interface ColorCustomizationData {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

interface Props {
  initialData: ColorCustomizationData;
  onUpdate?: () => void;
}

export function ColorCustomizationSection({ initialData, onUpdate }: Props) {
  const [formData, setFormData] = useState<ColorCustomizationData>(initialData);
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
        throw new Error(errorData.error || 'Error al actualizar colores');
      }

      setSuccess(true);
      onUpdate?.();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar colores');
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (field: keyof ColorCustomizationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const colorPresets = [
    { name: 'Azul Veterinario', primary: '#1e40af', secondary: '#3b82f6', accent: '#06b6d4' },
    { name: 'Verde Natural', primary: '#16a34a', secondary: '#22c55e', accent: '#84cc16' },
    { name: 'Morado Profesional', primary: '#7c3aed', secondary: '#a855f7', accent: '#d946ef' },
    { name: 'Naranja Cálido', primary: '#ea580c', secondary: '#f97316', accent: '#fb923c' },
    { name: 'Rosa Moderno', primary: '#e11d48', secondary: '#f43f5e', accent: '#fb7185' },
  ];

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setFormData({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Personalización de Colores</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Presets de colores */}
        <div>
          <h3 className="text-lg font-medium mb-3">Combinaciones Predefinidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {colorPresets.map((preset, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applyPreset(preset)}
                className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex space-x-1">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.secondary }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="text-sm">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colores personalizados */}
        <div>
          <h3 className="text-lg font-medium mb-3">Personalización Manual</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color Primario
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.primaryColor || '#1e40af'}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor || '#1e40af'}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="#1e40af"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color Secundario
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.secondaryColor || '#3b82f6'}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor || '#3b82f6'}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color de Acento
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.accentColor || '#06b6d4'}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accentColor || '#06b6d4'}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  placeholder="#06b6d4"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vista previa */}
        <div>
          <h3 className="text-lg font-medium mb-3">Vista Previa</h3>
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 space-y-3">
            <div className="flex space-x-3">
              <button 
                type="button"
                style={{ backgroundColor: formData.primaryColor || '#1e40af' }}
                className="px-4 py-2 text-white rounded-md text-sm"
              >
                Botón Primario
              </button>
              <button 
                type="button"
                style={{ backgroundColor: formData.secondaryColor || '#3b82f6' }}
                className="px-4 py-2 text-white rounded-md text-sm"
              >
                Botón Secundario
              </button>
              <button 
                type="button"
                style={{ backgroundColor: formData.accentColor || '#06b6d4' }}
                className="px-4 py-2 text-white rounded-md text-sm"
              >
                Acento
              </button>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Esta vista previa muestra cómo se verán los elementos con los colores seleccionados.
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
            Colores actualizados correctamente. Los cambios se aplicarán la próxima vez que recargues la página.
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="text-white px-6 py-2 rounded-md transition-colors duration-200 font-medium"
          style={{ 
            backgroundColor: saving ? '#9ca3af' : (formData.primaryColor || '#1e40af'),
          }}
        >
          {saving ? 'Guardando...' : 'Actualizar Colores'}
        </button>
      </form>
    </div>
  );
}