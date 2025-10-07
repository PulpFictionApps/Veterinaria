'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import { useAuthContext } from '@/lib/auth-context';
import { 
  Settings, 
  Mail, 
  Building, 
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
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      <div className="vet-page">
        <div className="vet-container">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-page">
      <div className="vet-container space-y-8">
        
        {/* Header */}
        <FadeIn>
          <div className="vet-card-unified overflow-hidden">
            <div className="vet-section-header-unified">
              <div className="vet-section-title-unified">
                <Settings className="w-8 h-8" />
                Configuración
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-gray-600 font-medium">Personaliza tu experiencia y sistema de emails</p>
            </div>
          </div>
        </FadeIn>

        {/* Messages */}
        {error && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-sm text-gray-600">✅ Configuración actualizada correctamente</p>
          </div>
        )}

        {/* Sistema Automático Status */}
        <SlideIn direction="up" delay={100}>
          <div className="vet-card-unified">
            <div className="vet-section-header-unified">
              <div className="vet-section-title-unified">
                <Activity className="w-6 h-6" />
                Sistema Automático Activo
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-gray-600 mb-6">Tu sistema de emails está funcionando automáticamente</p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">🎯 Funciones Activas</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  <strong>Confirmaciones inmediatas:</strong> Se envían automáticamente al crear citas
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  <strong>Recordatorios 24h:</strong> Enviados automáticamente un día antes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  <strong>Recordatorios 1h:</strong> Enviados automáticamente una hora antes
                </li>
              </ul>
            </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-800 mb-2">📧 Configuración de Email</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Servidor:</strong> Gmail SMTP (myvetagenda@gmail.com)</p>
                  <p><strong>Estado:</strong> <span className="text-gray-600 font-semibold">✅ Operativo</span></p>
                </div>
              </div>
            </div>
          </div>
        </SlideIn>



        {/* Clinic Information */}
        <SlideIn direction="up" delay={300}>
          <div className="vet-card-unified">
            <div className="vet-section-header-unified">
              <div className="vet-section-title-unified">
                <Building className="w-6 h-6" />
                Información de tu Clínica
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-gray-600 mb-6">Esta información aparece en los emails enviados a tus clientes</p>

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
          </div>
        </SlideIn>

        {/* Email Customization */}
        <SlideIn direction="up" delay={400}>
          <div className="vet-card-unified">
            <div className="vet-section-header-unified">
              <div className="vet-section-title-unified">
                <Mail className="w-6 h-6" />
                Personalización de Emails
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-gray-600 mb-6">Configure las instrucciones que aparecerán en los emails de confirmación</p>

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
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                    <h5 className="text-gray-800 font-medium text-sm mb-2">📝 Instrucciones importantes:</h5>
                    <div className="text-gray-700 text-xs space-y-1">
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

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h5 className="text-gray-800 font-medium text-sm mb-2">📍 Información de contacto:</h5>
                    <div className="text-gray-700 text-xs space-y-1">
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
          </div>
        </SlideIn>

      </div>
    </div>
  );
}
