'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import { useAuthContext } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { COLOR_PALETTES } from '@/lib/color-palettes';
import { 
  Settings, 
  Palette, 
  Mail, 
  Building, 
  CheckCircle,
  User,
  Phone,
  FileText,
  Activity
} from 'lucide-react';
import { FadeIn, SlideIn } from '../../../components/ui/Transitions';

interface UserSettings {
  id: number;
  email: string;
  fullName?: string;
  appointmentInstructions?: string;
  contactEmail?: string;
  contactPhone?: string;
  clinicName?: string;
  clinicAddress?: string;
  professionalTitle?: string;
  professionalPhone?: string;
}

export default function SettingsPage() {
  const { userId } = useAuthContext();
  const { currentPalette, setPalette } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isChangingPalette, setIsChangingPalette] = useState(false);

  // Form states
  const [clinicData, setClinicData] = useState({
    fullName: '',
    clinicName: '',
    clinicAddress: '',
    professionalTitle: '',
    professionalPhone: '',
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

  const handlePaletteChange = async (paletteId: string) => {
    if (paletteId === currentPalette.id) return;
    
    setIsChangingPalette(true);
    try {
      setPalette(paletteId);
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error al cambiar paleta:', error);
    } finally {
      setIsChangingPalette(false);
    }
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
      await fetchSettings();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar información de clínica');
    } finally {
      setSaving(false);
    }
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
      await fetchSettings();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar personalización de emails');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <FadeIn>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="bg-gradient-primary p-6 text-white rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Configuración</h1>
                  <p className="text-white/90">Personaliza tu experiencia y sistema de emails</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-600">✅ Configuración actualizada correctamente</p>
          </div>
        )}

        {/* Sistema Automático Status */}
        <SlideIn direction="up" delay={100}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Sistema Automático Activo</h2>
                <p className="text-gray-600">Tu sistema de emails está funcionando automáticamente</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
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
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">📧 Configuración de Email</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Servidor:</strong> Gmail SMTP (myvetagenda@gmail.com)</p>
                <p><strong>Estado:</strong> <span className="text-green-600 font-semibold">✅ Operativo</span></p>
              </div>
            </div>
          </div>
        </SlideIn>

        {/* Color Palettes */}
        <SlideIn direction="up" delay={200}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Paletas de Colores</h2>
                <p className="text-gray-600">Selecciona los colores de tu aplicación</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {COLOR_PALETTES.map((palette) => {
                const isActive = currentPalette.id === palette.id;
                
                return (
                  <div
                    key={palette.id}
                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                      isActive 
                        ? 'border-blue-500 bg-blue-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => handlePaletteChange(palette.id)}
                  >
                    {isActive && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}

                    <div className="flex space-x-2 mb-4">
                      <div className="w-8 h-8 rounded-lg shadow-md bg-gradient-primary"></div>
                      <div className="w-8 h-8 rounded-lg shadow-md bg-gradient-secondary"></div>
                      <div className="w-8 h-8 rounded-lg shadow-md bg-primary"></div>
                    </div>

                    <h3 className="font-bold text-lg text-gray-800 mb-2">{palette.name}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{palette.description}</p>

                    {isChangingPalette && isActive && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </SlideIn>

        {/* Clinic Information */}
        <SlideIn direction="up" delay={300}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Información de tu Clínica</h2>
                <p className="text-gray-600">Esta información aparece en los emails enviados a tus clientes</p>
              </div>
            </div>

            <form onSubmit={handleClinicSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Tu Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={clinicData.fullName}
                    onChange={(e) => setClinicData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Dr. Juan Pérez González"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Nombre de tu Clínica
                  </label>
                  <input
                    type="text"
                    value={clinicData.clinicName}
                    onChange={(e) => setClinicData(prev => ({ ...prev, clinicName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                  onChange={(e) => setClinicData(prev => ({ ...prev, clinicAddress: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                    onChange={(e) => setClinicData(prev => ({ ...prev, professionalTitle: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Médico Veterinario"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono de la Clínica (opcional)
                  </label>
                  <input
                    type="tel"
                    value={clinicData.professionalPhone}
                    onChange={(e) => setClinicData(prev => ({ ...prev, professionalPhone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="+56 2 2345 6789"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? 'Guardando...' : 'Guardar Información de Clínica'}
                </button>
              </div>
            </form>
          </div>
        </SlideIn>

        {/* Email Customization */}
        <SlideIn direction="up" delay={400}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Personalización de Emails</h2>
                <p className="text-gray-600">Configure las instrucciones que aparecerán en los emails de confirmación</p>
              </div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Instrucciones Importantes (aparecerán en sección naranja)
                </label>
                <textarea
                  value={emailData.appointmentInstructions}
                  onChange={(e) => setEmailData(prev => ({ ...prev, appointmentInstructions: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  rows={6}
                  placeholder="Llegada: Por favor llega 10-15 minutos antes de tu cita&#10;Documentos: Trae la cartilla de vacunación de tu mascota"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separa cada instrucción con una nueva línea. Usa el formato "Título: Descripción"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email de Contacto (aparecerá en sección azul)
                  </label>
                  <input
                    type="email"
                    value={emailData.contactEmail}
                    onChange={(e) => setEmailData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="contacto@mi-clinica.cl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Teléfono de Contacto (aparecerá en sección azul)
                  </label>
                  <input
                    type="tel"
                    value={emailData.contactPhone}
                    onChange={(e) => setEmailData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="+56 9 8765 4321"
                  />
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-3">👀 Vista Previa del Email</h4>
                <div className="bg-white rounded-lg p-4 border border-gray-200 max-w-md">
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

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {saving ? 'Guardando...' : 'Guardar Personalización de Emails'}
                </button>
              </div>
            </form>
          </div>
        </SlideIn>

      </div>
    </div>
  );
}