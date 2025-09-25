'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api';
import { useAuthContext } from '@/lib/auth-context';

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
              className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-200/50"
            >
              {saving ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}