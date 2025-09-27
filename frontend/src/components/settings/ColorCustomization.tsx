'use client';

import { useState } from 'react';
import { authFetch } from '@/lib/api';
import { useAuthContext } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { colorSchemes } from '@/lib/constants';

interface ColorCustomizationProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  onUpdate?: () => void;
}

export default function ColorCustomization({
  primaryColor = '#EC4899',
  secondaryColor = '#F9A8D4',
  accentColor = '#BE185D',
  onUpdate
}: ColorCustomizationProps) {
  const { userId } = useAuthContext();
  const { colors, updateColors, resetToDefault } = useTheme();
  const [formData, setFormData] = useState({
    primaryColor,
    secondaryColor,
    accentColor,
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

  const handleColorChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Update theme in real time for preview
    updateColors(
      newFormData.primaryColor,
      newFormData.secondaryColor,
      newFormData.accentColor
    ).catch(console.error);
  };

  const applyColorScheme = async (scheme: any) => {
    const newColors = {
      primaryColor: scheme.primaryColor,
      secondaryColor: scheme.secondaryColor,
      accentColor: scheme.accentColor,
    };
    
    setFormData(newColors);
    await updateColors(newColors.primaryColor, newColors.secondaryColor, newColors.accentColor);
  };

  const resetColors = async () => {
    try {
      await resetToDefault();
      const defaultColors = {
        primaryColor: '#EC4899',
        secondaryColor: '#F9A8D4',
        accentColor: '#BE185D',
      };
      setFormData(defaultColors);
    } catch (err) {
      console.error('Error resetting colors:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          🎨 Personalización de Colores
        </h2>
        <p className="text-sm text-gray-600">
          Personalice los colores de su interfaz de trabajo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Color Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Primario
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                placeholder="#EC4899"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Secundario
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.secondaryColor}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                placeholder="#F9A8D4"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de Acento
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={formData.accentColor}
                onChange={(e) => handleColorChange('accentColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
                placeholder="#BE185D"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Vista Previa</h3>
          <div className="flex items-center space-x-4">
            <div 
              className="w-20 h-8 rounded-md shadow-sm"
              style={{ backgroundColor: formData.primaryColor }}
            />
            <div 
              className="w-20 h-8 rounded-md shadow-sm"
              style={{ backgroundColor: formData.secondaryColor }}
            />
            <div 
              className="w-20 h-8 rounded-md shadow-sm"
              style={{ backgroundColor: formData.accentColor }}
            />
            <div 
              className="px-4 py-2 text-sm text-white rounded-lg shadow-sm"
              style={{ 
                background: `linear-gradient(45deg, ${formData.primaryColor}, ${formData.accentColor})` 
              }}
            >
              Botón de ejemplo
            </div>
          </div>
        </div>

        {/* Predefined Color Schemes */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Esquemas Predefinidos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {colorSchemes.map((scheme, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applyColorScheme(scheme)}
                className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <div className="flex space-x-1 mb-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: scheme.primaryColor }}
                  />
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: scheme.secondaryColor }}
                  />
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: scheme.accentColor }}
                  />
                </div>
                <p className="text-xs text-gray-600 text-center">{scheme.name}</p>
              </button>
            ))}
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
            <p className="text-sm text-green-600">✅ Colores actualizados correctamente</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={resetColors}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            Restablecer por defecto
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {saving ? 'Guardando...' : 'Guardar Colores'}
          </button>
        </div>
      </form>
    </div>
  );
}