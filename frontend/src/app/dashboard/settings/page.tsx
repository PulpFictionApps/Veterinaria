'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/api';
import { useAuthContext } from '@/lib/auth-context';
import { 
  Settings, 
  Palette, 
  Mail, 
  Building, 
  Bell,
  Shield,
  User,
  Phone,
  FileText,
  Heart,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Monitor,
  Globe,
  Activity,
  Zap,
  Database
} from 'lucide-react';
import { FadeIn, SlideIn, Stagger, AnimateOnView } from '../../../components/ui/Transitions';
import Tooltip from '../../../components/ui/Tooltip';

interface UserSettings {
  id: number;
  email: string;
  fullName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (colorType: 'primaryColor' | 'secondaryColor' | 'accentColor', value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [colorType]: value
    });
  };

  const resetColorsToDefault = () => {
    if (!settings) return;
    setSettings({
      ...settings,
      primaryColor: '#2563EB',
      secondaryColor: '#059669',
      accentColor: '#DC2626'
    });
  };

  const saveColorChanges = async () => {
    if (!settings || !userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await authFetch(`/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          primaryColor: settings.primaryColor,
          secondaryColor: settings.secondaryColor,
          accentColor: settings.accentColor
        })
      });

      if (!response.ok) throw new Error('Error al guardar colores');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Recargar la página para aplicar los nuevos colores
      window.location.reload();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar cambios');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <FadeIn>
        <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-health-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center py-20">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-medical-100">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-medical-100 border-t-medical-500"></div>
                    <Settings className="h-6 w-6 text-medical-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-6 text-neutral-600 font-medium">Cargando configuración...</p>
                  <p className="mt-2 text-sm text-neutral-400">Preparando ajustes del sistema</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-health-50">
      <div className="max-w-6xl mx-auto p-6">
        <FadeIn>
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-medical-100 p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-medical-500 to-health-500 rounded-xl shadow-lg">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-medical-700 to-health-600 bg-clip-text text-transparent">
                    Configuración del Sistema
                  </h1>
                  <p className="text-neutral-600 mt-1 font-medium">
                    Personalización avanzada y automatización para su práctica veterinaria
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {error && (
          <SlideIn direction="up" delay={0.1}>
            <div className="mb-6">
              <div className="bg-gradient-to-r from-emergency-50 to-emergency-100 border border-emergency-200 text-emergency-800 px-6 py-4 rounded-2xl flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-emergency-500" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          </SlideIn>
        )}

        {success && (
          <SlideIn direction="up" delay={0.1}>
            <div className="mb-6">
              <div className="bg-gradient-to-r from-health-50 to-medical-50 border border-health-200 text-health-800 px-6 py-4 rounded-2xl flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-health-500" />
                <span className="font-medium">Configuración actualizada correctamente</span>
              </div>
            </div>
          </SlideIn>
        )}

        <Stagger className="space-y-8">
          <AnimateOnView>
            <div className="bg-white rounded-2xl shadow-xl border border-health-100 overflow-hidden">
              <div className="bg-gradient-to-r from-health-500 to-medical-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Estado del Sistema Veterinario</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-health-50 to-health-100 rounded-xl p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-health-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-health-800 mb-1">Sistema Activo</h3>
                    <p className="text-sm text-health-600">Operativo</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-medical-50 to-medical-100 rounded-xl p-4 text-center">
                    <Bell className="h-8 w-8 text-medical-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-medical-800 mb-1">Recordatorios</h3>
                    <p className="text-sm text-medical-600">Automatizados</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-neutral-50 to-medical-50 rounded-xl p-4 text-center">
                    <Shield className="h-8 w-8 text-neutral-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-neutral-800 mb-1">Seguridad</h3>
                    <p className="text-sm text-neutral-600">Protegido</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-health-50 to-neutral-50 rounded-xl p-4 text-center">
                    <Database className="h-8 w-8 text-health-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-health-800 mb-1">Datos</h3>
                    <p className="text-sm text-health-600">Sincronizados</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-health-50 to-medical-50 border border-health-200 rounded-xl p-4">
                  <h4 className="font-bold text-health-800 mb-3 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Funciones Médicas Automatizadas
                  </h4>
                  <ul className="text-sm text-health-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-health-500 rounded-full"></div>
                      <strong>Confirmaciones inmediatas:</strong> Se envían automáticamente al crear citas
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-health-500 rounded-full"></div>
                      <strong>Recordatorios inteligentes:</strong> 24h antes de cada consulta
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-health-500 rounded-full"></div>
                      <strong>Seguimiento post-consulta:</strong> Cuidados posteriores automatizados
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-health-500 rounded-full"></div>
                      <strong>Personalización dinámica:</strong> Usa información profesional del perfil
                    </li>
                  </ul>
                </div>
                
                <div className="mt-4 bg-gradient-to-r from-medical-50 to-health-50 rounded-xl p-4 border border-medical-100">
                  <p className="text-sm text-neutral-700 text-center">
                    <strong>Sistema Veterinario Profesional</strong> - Versión 2.0 - Última actualización: Octubre 2025
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnView>

          <AnimateOnView>
            <div className="bg-white rounded-2xl shadow-xl border border-medical-100 overflow-hidden">
              <div className="bg-gradient-to-r from-medical-500 to-health-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Palette className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Tema Profesional Médico</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-medical-50 to-medical-100 rounded-xl p-4 border border-medical-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-4 h-4 bg-medical-500 rounded-full"></div>
                      <span className="font-semibold text-medical-800">Médico Principal</span>
                    </div>
                    <p className="text-sm text-medical-600">Paleta profesional hospitalaria</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-health-50 to-health-100 rounded-xl p-4 border border-health-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-4 h-4 bg-health-500 rounded-full"></div>
                      <span className="font-semibold text-health-800">Salud Bienestar</span>
                    </div>
                    <p className="text-sm text-health-600">Colores de confianza y cuidado</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-emergency-50 to-emergency-100 rounded-xl p-4 border border-emergency-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-4 h-4 bg-emergency-500 rounded-full"></div>
                      <span className="font-semibold text-emergency-800">Emergencias</span>
                    </div>
                    <p className="text-sm text-emergency-600">Alertas y situaciones críticas</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-medical-50 to-health-50 rounded-xl p-4 border border-medical-100">
                  <p className="text-sm text-neutral-700 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-medical-500" />
                    <strong>Tema Optimizado:</strong> Diseño médico profesional activado para máxima confianza del cliente
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnView>

          <AnimateOnView>
            <div className="bg-white rounded-2xl shadow-xl border border-health-100 overflow-hidden">
              <div className="bg-gradient-to-r from-health-600 to-medical-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <User className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Información Profesional Actual</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-medical-50 to-health-50 rounded-xl p-4">
                      <h4 className="font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-medical-500" />
                        Datos Médicos
                      </h4>
                      <p className="text-sm text-neutral-600 mb-1">
                        <strong>Profesional:</strong> {settings?.fullName || 'No configurado'}
                      </p>
                      <p className="text-sm text-neutral-600">
                        <strong>Título:</strong> {settings?.professionalTitle || 'No configurado'}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-health-50 to-medical-50 rounded-xl p-4">
                      <h4 className="font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                        <Building className="h-4 w-4 text-health-500" />
                        Clínica
                      </h4>
                      <p className="text-sm text-neutral-600 mb-1">
                        <strong>Nombre:</strong> {settings?.clinicName || 'No configurado'}
                      </p>
                      <p className="text-sm text-neutral-600">
                        <strong>Dirección:</strong> {settings?.clinicAddress || 'No configurado'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-neutral-50 to-medical-50 rounded-xl p-4">
                      <h4 className="font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-neutral-500" />
                        Contacto
                      </h4>
                      <p className="text-sm text-neutral-600 mb-1">
                        <strong>Personal:</strong> {settings?.contactPhone || 'No configurado'}
                      </p>
                      <p className="text-sm text-neutral-600">
                        <strong>Profesional:</strong> {settings?.professionalPhone || 'No configurado'}
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-medical-50 to-health-50 rounded-xl p-4">
                      <h4 className="font-semibold text-neutral-700 mb-2 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-medical-500" />
                        Email Sistema
                      </h4>
                      <p className="text-sm text-neutral-600">
                        <strong>Cuenta:</strong> {settings?.email || 'No configurado'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-medical-100">
                  <div className="flex flex-wrap gap-4">
                    <Tooltip content="Editar información profesional completa">
                      <a
                        href="/dashboard/profile"
                        className="group inline-flex items-center gap-2 bg-gradient-to-r from-medical-500 to-health-500 text-white px-6 py-3 rounded-xl hover:from-medical-600 hover:to-health-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                      >
                        <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        Editar Perfil Profesional
                      </a>
                    </Tooltip>
                    
                    <Tooltip content="Ver documentación del sistema">
                      <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-health-500 to-medical-500 text-white px-6 py-3 rounded-xl hover:from-health-600 hover:to-medical-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                        <FileText className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        Documentación
                      </button>
                    </Tooltip>
                    
                    <Tooltip content="Acceder a métricas del sistema">
                      <button className="group inline-flex items-center gap-2 bg-gradient-to-r from-neutral-500 to-medical-500 text-white px-6 py-3 rounded-xl hover:from-neutral-600 hover:to-medical-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                        <Monitor className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                        Métricas
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnView>

          <AnimateOnView>
            <div className="bg-white rounded-2xl shadow-xl border border-medical-100 overflow-hidden">
              <div className="bg-gradient-to-r from-medical-600 to-health-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Sistema de Comunicación Automatizada</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-health-50 to-medical-50 rounded-xl p-4 border border-health-200">
                    <h4 className="font-semibold text-health-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Email Confirmaciones
                    </h4>
                    <ul className="text-sm text-health-700 space-y-1">
                      <li>• Envío automático al crear citas</li>
                      <li>• Personalización con datos profesionales</li>
                      <li>• Formato médico profesional</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-r from-medical-50 to-health-50 rounded-xl p-4 border border-medical-200">
                    <h4 className="font-semibold text-medical-800 mb-3 flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Recordatorios Inteligentes
                    </h4>
                    <ul className="text-sm text-medical-700 space-y-1">
                      <li>• 24 horas antes de la cita</li>
                      <li>• 1 hora antes (opcional)</li>
                      <li>• Seguimiento post-consulta</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 bg-gradient-to-r from-medical-50 to-health-50 rounded-xl p-4 border border-medical-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-medical-800 mb-1">Estado del Servidor Email</h4>
                      <p className="text-sm text-medical-700">Gmail SMTP - Completamente operativo</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-health-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-health-700">Activo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnView>

          <AnimateOnView>
            <div className="bg-white rounded-2xl shadow-xl border border-health-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Palette className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Personalización de Colores</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-neutral-600 mb-4">
                    Personaliza los colores de tu aplicación para que coincidan con la identidad de tu clínica veterinaria.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Color Primario */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-neutral-700">
                        Color Primario
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings?.primaryColor || '#2563EB'}
                          onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                          className="w-12 h-12 rounded-lg border-2 border-neutral-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings?.primaryColor || '#2563EB'}
                          onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="#2563EB"
                        />
                      </div>
                      <p className="text-xs text-neutral-500">Botones principales y navegación</p>
                    </div>

                    {/* Color Secundario */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-neutral-700">
                        Color Secundario
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings?.secondaryColor || '#059669'}
                          onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                          className="w-12 h-12 rounded-lg border-2 border-neutral-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings?.secondaryColor || '#059669'}
                          onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="#059669"
                        />
                      </div>
                      <p className="text-xs text-neutral-500">Elementos de salud y bienestar</p>
                    </div>

                    {/* Color de Acento */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-neutral-700">
                        Color de Acento
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={settings?.accentColor || '#DC2626'}
                          onChange={(e) => handleColorChange('accentColor', e.target.value)}
                          className="w-12 h-12 rounded-lg border-2 border-neutral-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settings?.accentColor || '#DC2626'}
                          onChange={(e) => handleColorChange('accentColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="#DC2626"
                        />
                      </div>
                      <p className="text-xs text-neutral-500">Alertas y elementos de atención</p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-200">
                    <button
                      onClick={resetColorsToDefault}
                      className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Restablecer por Defecto
                    </button>
                    <button
                      onClick={saveColorChanges}
                      disabled={loading}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>

                  {/* Vista previa */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-xl border border-neutral-200">
                    <h4 className="font-semibold text-neutral-800 mb-3">Vista previa</h4>
                    <div className="flex gap-3">
                      <button 
                        className="px-4 py-2 text-white rounded-lg transition-all"
                        style={{ backgroundColor: settings?.primaryColor || '#2563EB' }}
                      >
                        Botón Primario
                      </button>
                      <button 
                        className="px-4 py-2 text-white rounded-lg transition-all"
                        style={{ backgroundColor: settings?.secondaryColor || '#059669' }}
                      >
                        Botón Secundario
                      </button>
                      <button 
                        className="px-4 py-2 text-white rounded-lg transition-all"
                        style={{ backgroundColor: settings?.accentColor || '#DC2626' }}
                      >
                        Botón de Acento
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnView>

          <AnimateOnView>
            <div className="bg-white rounded-2xl shadow-xl border border-health-100 overflow-hidden">
              <div className="bg-gradient-to-r from-health-500 to-medical-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Rendimiento y Conectividad</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-health-50 to-health-100 rounded-xl p-4 text-center border border-health-200">
                    <Globe className="h-8 w-8 text-health-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-health-800 mb-1">Conectividad</h3>
                    <p className="text-sm text-health-600">Estable</p>
                    <div className="mt-2 w-full bg-health-200 rounded-full h-2">
                      <div className="bg-health-500 h-2 rounded-full" style={{width: '98%'}}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-medical-50 to-medical-100 rounded-xl p-4 text-center border border-medical-200">
                    <Activity className="h-8 w-8 text-medical-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-medical-800 mb-1">Rendimiento</h3>
                    <p className="text-sm text-medical-600">Óptimo</p>
                    <div className="mt-2 w-full bg-medical-200 rounded-full h-2">
                      <div className="bg-medical-500 h-2 rounded-full" style={{width: '95%'}}></div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-neutral-50 to-health-50 rounded-xl p-4 text-center border border-neutral-200">
                    <Shield className="h-8 w-8 text-neutral-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-neutral-800 mb-1">Seguridad</h3>
                    <p className="text-sm text-neutral-600">Máxima</p>
                    <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-health-500 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-medical-50 to-health-50 rounded-xl p-4 border border-medical-100">
                  <p className="text-sm text-neutral-700 text-center">
                    <strong>Tiempo de actividad:</strong> 99.9% • 
                    <strong>Última verificación:</strong> Hace 2 minutos • 
                    <strong>Próxima actualización:</strong> Automática
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnView>
        </Stagger>
      </div>
    </div>
  );
}