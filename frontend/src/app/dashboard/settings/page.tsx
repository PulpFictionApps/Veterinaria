'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/theme-context';
import { COLOR_PALETTES } from '@/lib/color-palettes';
import { Settings, Palette, CheckCircle } from 'lucide-react';
import { FadeIn, SlideIn } from '../../../components/ui/Transitions';

export default function SettingsPage() {
  const { currentPalette, setPalette } = useTheme();
  const [isChanging, setIsChanging] = useState(false);

  const handlePaletteChange = async (paletteId: string) => {
    if (paletteId === currentPalette.id) return;
    
    setIsChanging(true);
    try {
      setPalette(paletteId);
      // Pequeña pausa para mostrar el cambio
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error al cambiar paleta:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <FadeIn>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="bg-gradient-primary p-6 text-white rounded-xl mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Configuración</h1>
                  <p className="text-white/90">Personaliza tu experiencia</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

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
                    {/* Indicador de selección */}
                    {isActive && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Preview de colores */}
                    <div className="flex space-x-2 mb-4">
                      <div 
                        className="w-8 h-8 rounded-lg shadow-md"
                        style={{ backgroundColor: '#ec4899' }} // Siempre mostrar rosa médico como preview
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-lg shadow-md"
                        style={{ backgroundColor: '#10b981' }} // Verde salud
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-lg shadow-md"
                        style={{ backgroundColor: '#3b82f6' }} // Azul
                      ></div>
                    </div>

                    {/* Información */}
                    <h3 className="font-bold text-lg text-gray-800 mb-2">
                      {palette.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {palette.description}
                    </p>

                    {/* Indicador de carga */}
                    {isChanging && isActive && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Información adicional */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 text-blue-600 mt-0.5">
                  <CheckCircle className="w-full h-full" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-1">
                    Cambios Instantáneos
                  </h4>
                  <p className="text-blue-700 text-sm">
                    Los colores se aplicarán inmediatamente a toda la aplicación, incluyendo menús, botones y componentes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SlideIn>

        {/* Paleta actual */}
        <SlideIn direction="up" delay={400}>
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Paleta Actual: {currentPalette.name}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentPalette.description}
            </p>
            
            {/* Preview completo */}
            <div className="p-6 bg-gradient-primary rounded-xl text-white">
              <h4 className="text-lg font-bold mb-2">Vista Previa</h4>
              <p className="text-white/90 mb-4">Así se ven los elementos con tu paleta actual</p>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  Botón Ejemplo
                </button>
                <button className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
                  Botón Secundario
                </button>
              </div>
            </div>
          </div>
        </SlideIn>

      </div>
    </div>
  );
}