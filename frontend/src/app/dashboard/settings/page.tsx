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
  // Color customization fields
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  // Email customization fields
  appointmentInstructions?: string;
  contactEmail?: string;
  contactPhone?: string;
  // Clinic information fields
  clinicName?: string;
  clinicAddress?: string;
  professionalTitle?: string;
  professionalPhone?: string;
}

export default function SettingsPage() {
  const { userId } = useAuthContext();
  const { colors, updateColors, resetToDefault } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state para configuraciones que realmente se usan
  const [clinicData, setClinicData] = useState({
    fullName: '',
    clinicName: '',
    clinicAddress: '',
    professionalTitle: '',
    professionalPhone: '',
  });

  const [colorData, setColorData] = useState({
    primaryColor: '#EC4899',
    secondaryColor: '#F9A8D4',
    accentColor: '#BE185D',
  });

  const [emailData, setEmailData] = useState({
    appointmentInstructions: 'Llegada: Por favor llega 10-15 minutos antes de tu cita\nDocumentos: Trae la cartilla de vacunación de tu mascota\nAyuno: Si es necesario, te contactaremos para indicar ayuno\nCambios: Si necesitas reprogramar, contáctanos con anticipación',
    contactEmail: '',
    contactPhone: '',
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
      setClinicData({
        fullName: data.fullName || '',
        clinicName: data.clinicName || '',
        clinicAddress: data.clinicAddress || '',
        professionalTitle: data.professionalTitle || '',
        professionalPhone: data.professionalPhone || '',
      });

      setColorData({
        primaryColor: data.primaryColor || '#EC4899',
        secondaryColor: data.secondaryColor || '#F9A8D4',
        accentColor: data.accentColor || '#BE185D',
      });

      setEmailData({
        appointmentInstructions: data.appointmentInstructions || 'Llegada: Por favor llega 10-15 minutos antes de tu cita\nDocumentos: Trae la cartilla de vacunación de tu mascota\nAyuno: Si es necesario, te contactaremos para indicar ayuno\nCambios: Si necesitas reprogramar, contáctanos con anticipación',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
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



  const handleClinicChange = (field: string, value: string) => {
    setClinicData(prev => ({ ...prev, [field]: value }));
  };

  const handleClinicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const response = await authFetch(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clinicData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar información de clínica');
      }

      setSuccess(true);
      await fetchSettings(); // Refresh data
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar información de clínica');
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChange = (field: string, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const response = await authFetch(`/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar personalización de emails');
      }

      setSuccess(true);
      await fetchSettings(); // Refresh data
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar personalización de emails');
    } finally {
      setSaving(false);
    }
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

      {/* Sistema Automático Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ✅ Sistema Automático Activo
          </h2>
          <p className="text-sm text-gray-600">
            Tu sistema de emails está funcionando automáticamente
          </p>
        </div>

        {/* Status Display */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">🎯 Funciones Activas</h4>
          <ul className="text-sm text-green-700 space-y-2">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <strong>Confirmaciones inmediatas:</strong> Se envían automáticamente al crear citas
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <strong>Recordatorios 24h:</strong> Enviados automáticamente un día antes
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <strong>Recordatorios 1h:</strong> Enviados automáticamente una hora antes
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <strong>Personalización dinámica:</strong> Usa tu información de la base de datos
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-blue-800 mb-2">📧 Configuración de Email</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Servidor:</strong> Gmail SMTP (myvetagenda@gmail.com)</p>
            <p><strong>Verificaciones:</strong> Cada 10 minutos automáticamente</p>
            <p><strong>Estado:</strong> <span className="text-green-600 font-semibold">✅ Operativo</span></p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-600 text-center">
            <strong>💡 Tip:</strong> Para personalizar los emails, usa las secciones de abajo
          </p>
        </div>
      </div>

      {/* Clinic Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            🏥 Información de tu Clínica
          </h2>
          <p className="text-sm text-gray-600">
            Esta información aparece en los emails enviados a tus clientes
          </p>
        </div>

        <form onSubmit={handleClinicSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👨‍⚕️ Tu Nombre Completo
              </label>
              <input
                type="text"
                value={clinicData.fullName}
                onChange={(e) => handleClinicChange('fullName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Dr. Juan Pérez González"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏥 Nombre de tu Clínica
              </label>
              <input
                type="text"
                value={clinicData.clinicName}
                onChange={(e) => handleClinicChange('clinicName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Veterinaria Mi Mascota"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Dirección de tu Clínica
            </label>
            <input
              type="text"
              value={clinicData.clinicAddress}
              onChange={(e) => handleClinicChange('clinicAddress', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Av. Principal 123, Comuna, Ciudad"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎓 Título Profesional (opcional)
              </label>
              <input
                type="text"
                value={clinicData.professionalTitle}
                onChange={(e) => handleClinicChange('professionalTitle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Médico Veterinario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📞 Teléfono de la Clínica (opcional)
              </label>
              <input
                type="tel"
                value={clinicData.professionalPhone}
                onChange={(e) => handleClinicChange('professionalPhone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="+56 2 2345 6789"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">👀 Vista Previa</h4>
            <p className="text-sm text-blue-700">
              En los emails aparecerá: <strong>"{clinicData.clinicName || clinicData.fullName || 'Tu Clínica'}"</strong>
            </p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving ? 'Guardando...' : 'Guardar Información de Clínica'}
            </button>
          </div>
        </form>
      </div>

      {/* Email Customization Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            📧 Personalización de Emails de Confirmación
          </h2>
          <p className="text-sm text-gray-600">
            Configure las instrucciones importantes y datos de contacto que aparecerán en los emails de confirmación de citas
          </p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-6">
          {/* Instrucciones Importantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📝 Instrucciones Importantes (aparecerán en sección naranja)
            </label>
            <textarea
              value={emailData.appointmentInstructions}
              onChange={(e) => handleEmailChange('appointmentInstructions', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              rows={6}
              placeholder="Llegada: Por favor llega 10-15 minutos antes de tu cita&#10;Documentos: Trae la cartilla de vacunación de tu mascota&#10;Ayuno: Si es necesario, te contactaremos para indicar ayuno&#10;Cambios: Si necesitas reprogramar, contáctanos con anticipación"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separa cada instrucción con una nueva línea. Usa el formato "Título: Descripción" para mejor presentación.
            </p>
          </div>

          {/* Información de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📧 Email de Contacto (aparecerá en sección azul)
              </label>
              <input
                type="email"
                value={emailData.contactEmail}
                onChange={(e) => handleEmailChange('contactEmail', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="contacto@mi-clinica.cl"
              />
              <p className="text-xs text-gray-500 mt-1">
                Si se deja vacío, se usará su email principal
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📞 Teléfono de Contacto (aparecerá en sección azul)
              </label>
              <input
                type="tel"
                value={emailData.contactPhone}
                onChange={(e) => handleEmailChange('contactPhone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="+56 9 8765 4321"
              />
              <p className="text-xs text-gray-500 mt-1">
                Teléfono para que los clientes puedan contactarte
              </p>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3">👀 Vista Previa del Email</h4>
            <div className="bg-white rounded-lg p-4 border border-gray-200 max-w-md">
              {/* Naranja - Instrucciones */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                <h5 className="text-orange-800 font-medium text-sm mb-2">📝 Instrucciones importantes:</h5>
                <div className="text-orange-700 text-xs space-y-1">
                  {emailData.appointmentInstructions.split('\n').map((line, index) => (
                    <div key={index}>
                      {line.includes(':') ? (
                        <><strong>{line.split(':')[0]}:</strong> {line.split(':').slice(1).join(':').trim()}</>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Azul - Información de contacto */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="text-blue-800 font-medium text-sm mb-2">📍 Información de contacto:</h5>
                <div className="text-blue-700 text-xs space-y-1">
                  <div><strong>👨‍⚕️ Profesional:</strong> {settings?.fullName || 'Su Nombre'}</div>
                  <div><strong>📧 Email:</strong> {emailData.contactEmail || settings?.email || 'su-email@ejemplo.com'}</div>
                  {emailData.contactPhone && <div><strong>📞 Teléfono:</strong> {emailData.contactPhone}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {saving ? 'Guardando...' : 'Guardar Personalización de Emails'}
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
