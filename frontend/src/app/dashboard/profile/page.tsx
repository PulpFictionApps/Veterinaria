'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api';
import { useAuthContext } from '@/lib/auth-context';
import { BasicInfoSection } from '@/components/profile/BasicInfoSection';
import { PDFSettingsSection } from '@/components/profile/PDFSettingsSection';
import { AutomationSection } from '@/components/profile/AutomationSection';
import { ColorCustomizationSection } from '@/components/profile/ColorCustomizationSection';

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
  // PDF settings
  prescriptionHeader?: string;
  prescriptionFooter?: string;
}

export default function ProfessionalProfilePage() {
  const router = useRouter();
  const { userId } = useAuthContext();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authFetch(`/profile`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionUpdate = () => {
    // Refetch profile data when any section is updated
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-lg">Cargando perfil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error al cargar el perfil</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <button
                  onClick={() => fetchProfile()}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Intentar nuevamente
                </button>
                <button
                  onClick={() => router.back()}
                  className="ml-3 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-yellow-800">No se encontró información del perfil</div>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-md text-sm font-medium"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración de Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestiona tu información profesional por secciones independientes
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
        >
          ← Volver
        </button>
      </div>

      {/* Sections Grid */}
      <div className="space-y-8">
        {/* Basic Information Section */}
        <BasicInfoSection 
          initialData={{
            fullName: profile.fullName,
            phone: profile.phone,
            professionalRut: profile.professionalRut,
            professionalTitle: profile.professionalTitle,
            professionalPhone: profile.professionalPhone,
            licenseNumber: profile.licenseNumber
          }}
          onUpdate={handleSectionUpdate}
        />

        {/* PDF Settings Section */}
        <PDFSettingsSection
          initialData={{
            clinicName: profile.clinicName,
            prescriptionHeader: profile.prescriptionHeader,
            prescriptionFooter: profile.prescriptionFooter
          }}
          onUpdate={handleSectionUpdate}
        />

        {/* Automation Section */}
        <AutomationSection
          initialData={{
            whatsappNumber: profile.whatsappNumber,
            autoEmail: profile.autoEmail,
            enableWhatsappReminders: profile.enableWhatsappReminders,
            enableEmailReminders: profile.enableEmailReminders
          }}
          onUpdate={handleSectionUpdate}
        />

        {/* Color Customization Section */}
        <ColorCustomizationSection
          initialData={{
            primaryColor: profile.primaryColor,
            secondaryColor: profile.secondaryColor,
            accentColor: profile.accentColor
          }}
          onUpdate={handleSectionUpdate}
        />
      </div>

      {/* Info Footer */}
      <div className="mt-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ✨ Configuración Modular
        </h3>
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          Ahora puedes actualizar cada sección de forma independiente. Cada cambio se guarda por separado 
          sin afectar las otras configuraciones. Esto te permite, por ejemplo, cambiar solo los colores 
          sin tener que rellenar toda tu información básica.
        </p>
      </div>
    </div>
  );
}