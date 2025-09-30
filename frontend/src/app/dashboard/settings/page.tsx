'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import { useAuthContext } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { colorSchemes } from '@/lib/constants';

interface UserSettings {
  id: number;
  email: string;
  fullName?: string;
  // Automation fields
  autoEmail?: string;
  enableEmailReminders?: boolean;
  // Color customization fields
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export default function SettingsPage() {
  const { userId } = useAuthContext();
  const { colors, updateColors, resetToDefault } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [automationData, setAutomationData] = useState({
    autoEmail: '',
    enableEmailReminders: false,
  });

  const [colorData, setColorData] = useState({
    primaryColor: '#EC4899',
    secondaryColor: '#F9A8D4',
    accentColor: '#BE185D',
  });

  useEffect(() => {
    if (!userId) return;
    fetchSettings();
  }, [userId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/users/${userId}`);
      if (!response.ok) throw new Error('Error al cargar configuración');
      
      const data = await response.json();
      setSettings(data);
      
      // Initialize form with existing data
      setAutomationData({
        autoEmail: data.autoEmail || '',
        enableEmailReminders: data.enableEmailReminders || false,
      });

      setColorData({
        primaryColor: data.primaryColor || '#EC4899',
        secondaryColor: data.secondaryColor || '#F9A8D4',
        accentColor: data.accentColor || '#BE185D',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAutomationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const response = await authFetch(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(automationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar configuración');
      }

      setSuccess(true);
      await fetchSettings(); // Refresh data
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const response = await authFetch(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar colores');
      }

      setSuccess(true);
      await fetchSettings(); // Refresh data
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar colores');
    } finally {
      setSaving(false);
    }
  };

  const handleAutomationChange = (field: string, value: string | boolean) => {
    setAutomationData(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (field: string, value: string) => {
    const newColorData = { ...colorData, [field]: value };
    setColorData(newColorData);
    
    // Update theme in real time for preview
    updateColors(
      newColorData.primaryColor,
      newColorData.secondaryColor,
      newColorData.accentColor
    ).catch(console.error);
  };

  const applyColorScheme = async (scheme: any) => {
    const newColors = {
      primaryColor: scheme.primary,
      secondaryColor: scheme.secondary,
      accentColor: scheme.accent,
    };
    
    setColorData(newColors);
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
      setColorData(defaultColors);
    } catch (err) {
      console.error('Error resetting colors:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">⚙️ Ajustes</h1>
        <p className="text-sm text-gray-600">
          Configure automatización, personalización y preferencias del sistema
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">✅ Configuración actualizada correctamente</p>
        </div>
      )}

      {/* Automatización Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🤖 Automatización de Recordatorios
          </h2>
          <p className="text-sm text-gray-600">
            Configure los recordatorios automáticos para sus pacientes
          </p>
        </div>

        <form onSubmit={handleAutomationSubmit} className="space-y-6">
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
                  value={automationData.autoEmail}
                  onChange={(e) => handleAutomationChange('autoEmail', e.target.value)}
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
                  checked={automationData.enableEmailReminders}
                  onChange={(e) => handleAutomationChange('enableEmailReminders', e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="enableEmailReminders" className="text-sm text-gray-700">
                  Activar recordatorios por email
                </label>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">⚡ Funcionalidades Automáticas</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Recordatorios de citas 24 horas antes</li>
              <li>• Envío automático de PDFs de recetas por WhatsApp</li>
              <li>• Notificaciones de confirmación de citas</li>
              <li>• Seguimiento post-consulta automático</li>
            </ul>
          </div>

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

      {/* Color Customization Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🎨 Personalización de Colores
          </h2>
          <p className="text-sm text-gray-600">
            Personalice los colores de su interfaz de trabajo
          </p>
        </div>

        <form onSubmit={handleColorSubmit} className="space-y-6">
          {/* Color Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Primario
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={colorData.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorData.primaryColor}
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
                  value={colorData.secondaryColor}
                  onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorData.secondaryColor}
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
                  value={colorData.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={colorData.accentColor}
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
                style={{ backgroundColor: colorData.primaryColor }}
              />
              <div 
                className="w-20 h-8 rounded-md shadow-sm"
                style={{ backgroundColor: colorData.secondaryColor }}
              />
              <div 
                className="w-20 h-8 rounded-md shadow-sm"
                style={{ backgroundColor: colorData.accentColor }}
              />
              <div 
                className="px-4 py-2 text-sm text-white rounded-lg shadow-sm"
                style={{ 
                  background: `linear-gradient(45deg, ${colorData.primaryColor}, ${colorData.accentColor})` 
                }}
              >
                Botón de ejemplo
              </div>
            </div>
          </div>

          {/* Predefined Color Schemes */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Esquemas Predefinidos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(colorSchemes).map(([key, scheme]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyColorScheme(scheme)}
                  className="px-4 py-2 rounded-lg hover:scale-105 transition-all text-sm font-medium text-white shadow-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${scheme.primary}, ${scheme.accent})`,
                  }}
                >
                  {scheme.name}
                </button>
              ))}
            </div>
          </div>

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
    </div>
  );
}
