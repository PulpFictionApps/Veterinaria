'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api';
import { useAuthContext } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { colorSchemes } from '@/lib/theme';

interface ProfessionalProfile {
  id: number;
  email: string;
  fullName?: string;
  phone?: string;
  clinicName?: string;
  professionalRut?: string;
  professionalTitle?: string;
  clinicAddress?: string;
  professionalPhone?: string;
  licenseNumber?: string;
  signatureUrl?: string;
  logoUrl?: string;
  // New fields for automation
  whatsappNumber?: string;
  autoEmail?: string;
  enableWhatsappReminders?: boolean;
  enableEmailReminders?: boolean;
  // New fields for color customization
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export default function ProfessionalProfilePage() {
  const router = useRouter();
  const { userId } = useAuthContext();
  const { colors, updateColors, resetToDefault } = useTheme();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    clinicName: '',
    professionalRut: '',
    professionalTitle: 'MÉDICO VETERINARIO',
    clinicAddress: '',
    professionalPhone: '',
    licenseNumber: '',
    signatureUrl: '',
    logoUrl: '',
    // New automation fields
    whatsappNumber: '',
    autoEmail: '',
    enableWhatsappReminders: false,
    enableEmailReminders: false,
    // New color customization fields
    primaryColor: '#EC4899',
    secondaryColor: '#F9A8D4',
    accentColor: '#BE185D',
  });

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/profile`);
      if (!response.ok) throw new Error('Error al cargar perfil');
      
      const data = await response.json();
      setProfile(data);
      
      // Initialize form with existing data
      setFormData({
        fullName: data.fullName || '',
        phone: data.phone || '',
        clinicName: data.clinicName || '',
        professionalRut: data.professionalRut || '',
        professionalTitle: data.professionalTitle || 'MÉDICO VETERINARIO',
        clinicAddress: data.clinicAddress || '',
        professionalPhone: data.professionalPhone || '',
        licenseNumber: data.licenseNumber || '',
        signatureUrl: data.signatureUrl || '',
        logoUrl: data.logoUrl || '',
        // New automation fields
        whatsappNumber: data.whatsappNumber || '',
        autoEmail: data.autoEmail || '',
        enableWhatsappReminders: data.enableWhatsappReminders || false,
        enableEmailReminders: data.enableEmailReminders || false,
        // New color customization fields
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
        throw new Error(errorData.error || 'Error al actualizar perfil');
      }

      setSuccess(true);
      await fetchProfile(); // Refresh data
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If it's a color field, update theme in real time for preview
    if (field === 'primaryColor' || field === 'secondaryColor' || field === 'accentColor') {
      const newFormData = { ...formData, [field]: value };
      updateColors(
        newFormData.primaryColor,
        newFormData.secondaryColor,
        newFormData.accentColor
      ).catch(console.error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando perfil...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Perfil Profesional</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Volver
          </button>
        </div>

        <div className="bg-pink-50 p-4 rounded-lg mb-6">
          <h2 className="font-semibold text-pink-800 mb-2">📋 Configuración para Recetas Médicas</h2>
          <p className="text-sm text-pink-700">
            Complete sus datos profesionales para que aparezcan automáticamente en las recetas médicas que genere.
            Estos datos se utilizarán como plantilla predeterminada en todos sus PDFs de prescripciones.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            ✅ Perfil actualizado correctamente
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos Básicos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Datos Básicos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dr. Juan Pérez González"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RUT Profesional *
                </label>
                <input
                  type="text"
                  required
                  value={formData.professionalRut}
                  onChange={(e) => handleInputChange('professionalRut', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12.345.678-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título Profesional
                </label>
                <select
                  value={formData.professionalTitle}
                  onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MÉDICO VETERINARIO">MÉDICO VETERINARIO</option>
                  <option value="VETERINARIO">VETERINARIO</option>
                  <option value="DRA. VETERINARIA">DRA. VETERINARIA</option>
                  <option value="DR. VETERINARIO">DR. VETERINARIO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Colegiatura
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: 12345"
                />
              </div>
            </div>
          </div>

          {/* Datos de Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📞 Contacto Profesional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono Personal
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono Profesional/Clínica
                </label>
                <input
                  type="tel"
                  value={formData.professionalPhone}
                  onChange={(e) => handleInputChange('professionalPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+56 2 1234 5678"
                />
              </div>
            </div>
          </div>

          {/* Datos de la Clínica */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🏥 Datos de la Clínica</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Clínica
                </label>
                <input
                  type="text"
                  value={formData.clinicName}
                  onChange={(e) => handleInputChange('clinicName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Clínica Veterinaria Los Andes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección de la Clínica
                </label>
                <textarea
                  value={formData.clinicAddress}
                  onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Av. Providencia 1234, Providencia, Santiago"
                />
              </div>
            </div>
          </div>

          {/* URLs de recursos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🖼️ Recursos Visuales (Opcional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la Firma Digital
                </label>
                <input
                  type="url"
                  value={formData.signatureUrl}
                  onChange={(e) => handleInputChange('signatureUrl', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/mi-firma.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL de una imagen de su firma para incluir en las recetas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL del Logo de la Clínica
                </label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://ejemplo.com/logo-clinica.png"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL del logo de su clínica para el encabezado de las recetas
                </p>
              </div>
            </div>
          </div>

          {/* Automatización y Comunicaciones */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🤖 Automatización y Comunicaciones</h3>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">📱 Configuración de Comunicaciones</h4>
              <p className="text-sm text-blue-700">
                Configure sus datos de contacto para automatizar el envío de recordatorios de citas y PDFs de recetas médicas a sus clientes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Profesional
                </label>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="+56912345678"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número de WhatsApp para envío automático de PDFs y recordatorios
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email para Automatización
                </label>
                <input
                  type="email"
                  value={formData.autoEmail}
                  onChange={(e) => handleInputChange('autoEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="comunicaciones@clinica.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email desde el cual se enviarán los recordatorios automáticos
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="enableWhatsappReminders"
                  type="checkbox"
                  checked={formData.enableWhatsappReminders}
                  onChange={(e) => handleInputChange('enableWhatsappReminders', e.target.checked)}
                  className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-gray-300 rounded"
                />
                <label htmlFor="enableWhatsappReminders" className="ml-2 block text-sm text-gray-700">
                  <span className="font-medium">Habilitar recordatorios por WhatsApp</span>
                  <p className="text-xs text-gray-500">Enviar recordatorios de citas automáticamente por WhatsApp</p>
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="enableEmailReminders"
                  type="checkbox"
                  checked={formData.enableEmailReminders}
                  onChange={(e) => handleInputChange('enableEmailReminders', e.target.checked)}
                  className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-gray-300 rounded"
                />
                <label htmlFor="enableEmailReminders" className="ml-2 block text-sm text-gray-700">
                  <span className="font-medium">Habilitar recordatorios por Email</span>
                  <p className="text-xs text-gray-500">Enviar recordatorios de citas automáticamente por correo electrónico</p>
                </label>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-semibold text-yellow-800 mb-2">⚡ Funcionalidades Automáticas</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Recordatorios de citas 24 horas antes</li>
                <li>• Envío automático de PDFs de recetas por WhatsApp</li>
                <li>• Notificaciones de confirmación de citas</li>
                <li>• Seguimiento post-consulta automático</li>
              </ul>
            </div>
          </div>

          {/* Personalización de Colores */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Personalización de Colores</h3>
            <p className="text-sm text-gray-600 mb-6">
              Personaliza los colores de tu aplicación para que coincidan con la identidad de tu clínica
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Color Primario */}
              <div className="space-y-2">
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                  Color Primario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#EC4899"
                  />
                </div>
                <p className="text-xs text-gray-500">Color principal de botones y elementos activos</p>
              </div>

              {/* Color Secundario */}
              <div className="space-y-2">
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                  Color Secundario
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#F9A8D4"
                  />
                </div>
                <p className="text-xs text-gray-500">Color para fondos suaves y elementos secundarios</p>
              </div>

              {/* Color de Acento */}
              <div className="space-y-2">
                <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700">
                  Color de Acento
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="accentColor"
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#BE185D"
                  />
                </div>
                <p className="text-xs text-gray-500">Color para highlights y elementos de énfasis</p>
              </div>
            </div>

            {/* Vista Previa de Colores */}
            <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
              <h5 className="font-semibold text-gray-800 mb-3">Vista Previa</h5>
              <div className="flex gap-4 items-center">
                <div 
                  className="w-16 h-16 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: formData.primaryColor }}
                >
                  P
                </div>
                <div 
                  className="w-16 h-16 rounded-lg shadow-md flex items-center justify-center text-gray-700 font-semibold"
                  style={{ backgroundColor: formData.secondaryColor }}
                >
                  S
                </div>
                <div 
                  className="w-16 h-16 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: formData.accentColor }}
                >
                  A
                </div>
                <div className="flex-1">
                  <div 
                    className="h-8 rounded-lg mb-2"
                    style={{ 
                      background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.accentColor})`
                    }}
                  ></div>
                  <div 
                    className="h-4 rounded"
                    style={{ 
                      background: `linear-gradient(135deg, ${formData.secondaryColor}, ${formData.primaryColor})`
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Botones de Acción de Color */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              {Object.entries(colorSchemes).map(([key, scheme]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      primaryColor: scheme.primary,
                      secondaryColor: scheme.secondary,
                      accentColor: scheme.accent
                    }));
                  }}
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

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-theme-primary px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                background: saving ? '#9CA3AF' : `var(--gradient-primary)`,
                boxShadow: saving ? 'none' : `var(--shadow-primary)`
              }}
            >
              {saving ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
