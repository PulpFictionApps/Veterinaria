'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api';
import { useAuthContext } from '@/lib/auth-context';
import { 
  User, 
  FileText, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  Stethoscope,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Heart,
  Shield,
  Camera,
  Upload,
  Settings
} from 'lucide-react';
import { FadeIn, SlideIn, Stagger, AnimateOnView } from '../../../components/ui/Transitions';
import Tooltip from '../../../components/ui/Tooltip';

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
}

export default function ProfessionalProfilePage() {
  const router = useRouter();
  const { userId } = useAuthContext();
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
  });

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`/users/${userId}`);
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
      
      const response = await authFetch(`/users/${userId}`, {
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
  };

  if (loading) {
    return (
      <FadeIn>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center items-center py-20">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-gray-500"></div>
                    <User className="h-6 w-6 text-gray-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-6 text-neutral-600 font-medium">Cargando perfil profesional...</p>
                  <p className="mt-2 text-sm text-neutral-400">Preparando datos médicos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Professional Header */}
        <FadeIn>
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-gray-500 to-gray-500 rounded-xl shadow-lg">
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
                      Perfil Profesional
                    </h1>
                    <p className="text-neutral-600 mt-1 font-medium">
                      Configuración de datos médicos veterinarios
                    </p>
                  </div>
                </div>
                
                <Tooltip content="Volver al dashboard">
                  <button
                    onClick={() => router.back()}
                    className="group bg-gradient-to-r from-neutral-500 to-neutral-600 text-white px-6 py-3 rounded-xl hover:from-neutral-600 hover:to-neutral-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
                  >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                    Volver
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Professional Notice */}
        <SlideIn direction="up" delay={0.1}>
          <div className="mb-8">
            <div className="bg-gradient-to-r from-medical-50 to-health-50 rounded-2xl border border-medical-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-medical-500 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 mb-2 text-lg">Configuración para Documentos Médicos</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Complete sus datos profesionales para que aparezcan automáticamente en las recetas médicas y documentos veterinarios que genere.
                    Esta información se utilizará como plantilla predeterminada en todos sus PDFs de prescripciones y certificados médicos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SlideIn>

        {/* Status Messages */}
        {error && (
          <SlideIn direction="up" delay={0.2}>
            <div className="mb-6">
              <div className="bg-gradient-to-r from-emergency-50 to-emergency-100 border border-emergency-200 text-emergency-800 px-6 py-4 rounded-2xl flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-emergency-500" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          </SlideIn>
        )}

        {success && (
          <SlideIn direction="up" delay={0.2}>
            <div className="mb-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-50 border border-gray-200 text-gray-800 px-6 py-4 rounded-2xl flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-health-500" />
                <span className="font-medium">Perfil profesional actualizado correctamente</span>
              </div>
            </div>
          </SlideIn>
        )}

        <form onSubmit={handleSubmit}>
          <Stagger className="space-y-8">
            {/* Professional Basic Data */}
            <AnimateOnView>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-500 to-gray-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <User className="h-6 w-6 text-white" />
                    <h3 className="text-xl font-bold text-white">Datos Profesionales Básicos</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-300 font-medium bg-gradient-to-r from-white to-gray-50"
                        placeholder="Dr. Juan Pérez González"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-medical-500" />
                        RUT Profesional *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.professionalRut}
                        onChange={(e) => handleInputChange('professionalRut', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-medical-100 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-300 font-medium bg-gradient-to-r from-white to-medical-50"
                        placeholder="12.345.678-9"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <Award className="h-4 w-4 text-medical-500" />
                        Título Profesional
                      </label>
                      <select
                        value={formData.professionalTitle}
                        onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-medical-100 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-300 font-medium bg-gradient-to-r from-white to-medical-50"
                      >
                        <option value="MÉDICO VETERINARIO">MÉDICO VETERINARIO</option>
                        <option value="VETERINARIO">VETERINARIO</option>
                        <option value="DRA. VETERINARIA">DRA. VETERINARIA</option>
                        <option value="DR. VETERINARIO">DR. VETERINARIO</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-medical-500" />
                        Número de Colegiatura
                      </label>
                      <input
                        type="text"
                        value={formData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-medical-100 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-300 font-medium bg-gradient-to-r from-white to-medical-50"
                        placeholder="Ej: 12345"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnView>

            {/* Professional Contact Data */}
            <AnimateOnView>
              <div className="bg-white rounded-2xl shadow-xl border border-health-100 overflow-hidden">
                <div className="bg-gradient-to-r from-health-500 to-medical-500 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-6 w-6 text-white" />
                    <h3 className="text-xl font-bold text-white">Información de Contacto Profesional</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-health-500" />
                        Teléfono Personal
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-health-100 rounded-xl focus:ring-2 focus:ring-health-500 focus:border-health-500 transition-all duration-300 font-medium bg-gradient-to-r from-white to-health-50"
                        placeholder="+56 9 1234 5678"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <Building className="h-4 w-4 text-health-500" />
                        Teléfono Profesional/Clínica
                      </label>
                      <input
                        type="tel"
                        value={formData.professionalPhone}
                        onChange={(e) => handleInputChange('professionalPhone', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-health-100 rounded-xl focus:ring-2 focus:ring-health-500 focus:border-health-500 transition-all duration-300 font-medium bg-gradient-to-r from-white to-health-50"
                        placeholder="+56 2 1234 5678"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnView>

            {/* Clinic Information */}
            <AnimateOnView>
              <div className="bg-white rounded-2xl shadow-xl border border-medical-100 overflow-hidden">
                <div className="bg-gradient-to-r from-medical-600 to-health-600 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Building className="h-6 w-6 text-white" />
                    <h3 className="text-xl font-bold text-white">Información de la Clínica Veterinaria</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-medical-500" />
                        Nombre de la Clínica
                      </label>
                      <input
                        type="text"
                        value={formData.clinicName}
                        onChange={(e) => handleInputChange('clinicName', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-medical-100 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-300 font-medium bg-gradient-to-r from-white to-medical-50"
                        placeholder="Clínica Veterinaria Los Andes"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-medical-500" />
                        Dirección de la Clínica
                      </label>
                      <textarea
                        value={formData.clinicAddress}
                        onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-medical-100 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-300 font-medium bg-gradient-to-r from-white to-medical-50 resize-none"
                        rows={3}
                        placeholder="Av. Providencia 1234, Providencia, Santiago"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnView>

            {/* Visual Resources */}
            <AnimateOnView>
              <div className="bg-white rounded-2xl shadow-xl border border-health-100 overflow-hidden">
                <div className="bg-gradient-to-r from-health-600 to-medical-600 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Camera className="h-6 w-6 text-white" />
                    <h3 className="text-xl font-bold text-white">Recursos Visuales (Opcional)</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <Upload className="h-4 w-4 text-health-500" />
                        URL de la Firma Digital
                      </label>
                      <input
                        type="url"
                        value={formData.signatureUrl}
                        onChange={(e) => handleInputChange('signatureUrl', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-health-100 rounded-xl focus:ring-2 focus:ring-health-500 focus:border-health-500 transition-all duration-300 font-medium bg-gradient-to-r from-white to-health-50"
                        placeholder="https://ejemplo.com/mi-firma.png"
                      />
                      <p className="text-xs text-neutral-500 mt-2 bg-health-50 rounded-lg p-2">
                        URL de una imagen de su firma profesional para incluir en las recetas médicas
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-health-500" />
                        URL del Logo de la Clínica
                      </label>
                      <input
                        type="url"
                        value={formData.logoUrl}
                        onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-health-100 rounded-xl focus:ring-2 focus:ring-health-500 focus:border-health-500 transition-all duration-300 font-medium bg-gradient-to-r from-white to-health-50"
                        placeholder="https://ejemplo.com/logo-clinica.png"
                      />
                      <p className="text-xs text-neutral-500 mt-2 bg-health-50 rounded-lg p-2">
                        URL del logo oficial de su clínica veterinaria para el encabezado de las recetas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnView>

            {/* Additional Settings */}
            <AnimateOnView>
              <div className="bg-gradient-to-r from-medical-50 to-health-50 rounded-2xl border border-medical-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-medical-500 rounded-xl">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-medical-800 mb-2 text-lg">Configuración Avanzada del Sistema</h3>
                    <p className="text-medical-700 leading-relaxed mb-4">
                      Para configurar automatización de recordatorios, personalización de colores, integración con sistemas externos y otras preferencias avanzadas del sistema, visite la sección de Ajustes.
                    </p>
                    <Tooltip content="Acceder a configuración avanzada">
                      <a
                        href="/dashboard/settings"
                        className="group inline-flex items-center gap-2 bg-gradient-to-r from-medical-500 to-health-500 text-white px-6 py-3 rounded-xl hover:from-medical-600 hover:to-health-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                      >
                        <Settings className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                        Ir a Ajustes Avanzados
                      </a>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </AnimateOnView>

            {/* Action Buttons */}
            <AnimateOnView>
              <div className="bg-white rounded-2xl shadow-xl border border-medical-100 p-6">
                <div className="flex gap-4">
                  <Tooltip content="Cancelar y volver">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="group flex-1 px-6 py-4 border-2 border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-300 font-medium flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
                      Cancelar Cambios
                    </button>
                  </Tooltip>
                  
                  <Tooltip content={saving ? "Guardando cambios..." : "Guardar perfil profesional"}>
                    <button
                      type="submit"
                      disabled={saving}
                      className="group flex-1 px-6 py-4 bg-gradient-to-r from-medical-500 to-health-500 text-white rounded-xl hover:from-medical-600 hover:to-health-600 disabled:from-neutral-400 disabled:to-neutral-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl font-medium flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Guardando Perfil...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                          Guardar Perfil Profesional
                        </>
                      )}
                    </button>
                  </Tooltip>
                </div>
              </div>
            </AnimateOnView>
          </Stagger>
        </form>
      </div>
    </div>
  );
}