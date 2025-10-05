"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { authFetch } from '@/lib/api';
import { 
  PawPrint, 
  Heart, 
  Calendar, 
  Scale, 
  User, 
  Stethoscope,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { FadeIn, SlideIn } from '@/components/ui/Transitions';
import ThemedCard from '@/components/ui/ThemedCard';

export default function NewPetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clientId = Number(resolvedParams.id);
  
  // Estados del formulario
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [sex, setSex] = useState('');
  const [reproductiveStatus, setReproductiveStatus] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Opciones de formulario
  const petTypes = [
    'Perro', 'Gato', 'Conejo', 'Hamster', 'Cobaya', 'Pájaro', 
    'Pez', 'Tortuga', 'Iguana', 'Otro'
  ];

  const sexOptions = [
    'Macho', 'Hembra'
  ];

  const reproductiveStatusOptions = [
    'Sin intervenciones', 'Castrado', 'Esterilizada'
  ];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // Prevenir doble envío
    
    setLoading(true);
    setError('');
    
    try {
      const res = await authFetch('/pets', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          name, 
          type, 
          breed: breed || null,
          age: age ? Number(age) : null,
          weight: weight ? Number(weight) : null,
          sex: sex || null,
          reproductiveStatus: reproductiveStatus || null,
          birthDate: birthDate || null,
          tutorId: clientId 
        }) 
      });
      
      if (res.ok) {
        router.push(`/dashboard/clients/${clientId}`);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Error al crear mascota' }));
        setError(errorData.error || 'Error al crear mascota');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-full bg-gradient-to-br from-neutral-50 to-medical-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
        
        {/* Header */}
        <FadeIn>
          <ThemedCard variant="medical" className="overflow-hidden">
            <div className="bg-gradient-to-r from-medical-600 to-health-600 p-4 sm:p-8 text-white">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <PawPrint className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">Nueva Mascota</h1>
                  <p className="text-white/90 text-sm sm:text-base">Registra una nueva mascota en el sistema</p>
                </div>
              </div>
            </div>
          </ThemedCard>
        </FadeIn>

        {/* Formulario */}
        <SlideIn direction="up" delay={200}>
          <ThemedCard variant="medical" className="p-4 sm:p-8">
            <form onSubmit={submit} className="space-y-6 sm:space-y-8">
              
              {/* Información Básica */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4 sm:mb-6 flex items-center">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-medical-600" />
                  Información Básica
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* Nombre */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-semibold text-neutral-700">
                      Nombre de la Mascota *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ej: Max, Luna, Rocky"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white text-base touch-manipulation"
                      required
                    />
                  </div>

                  {/* Tipo */}
                  <div className="space-y-2">
                    <label htmlFor="type" className="block text-sm font-semibold text-neutral-700">
                      Tipo de Animal *
                    </label>
                    <select
                      id="type"
                      value={type}
                      onChange={e => setType(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white text-base touch-manipulation"
                      required
                    >
                      <option value="">Selecciona un tipo</option>
                      {petTypes.map(petType => (
                        <option key={petType} value={petType}>{petType}</option>
                      ))}
                    </select>
                  </div>

                  {/* Raza */}
                  <div className="space-y-2">
                    <label htmlFor="breed" className="block text-sm font-semibold text-neutral-700">
                      Raza
                    </label>
                    <input
                      id="breed"
                      type="text"
                      value={breed}
                      onChange={e => setBreed(e.target.value)}
                      placeholder="Ej: Golden Retriever, Persa, etc."
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white text-base touch-manipulation"
                    />
                  </div>

                  {/* Edad */}
                  <div className="space-y-2">
                    <label htmlFor="age" className="block text-sm font-semibold text-neutral-700">
                      Edad (años)
                    </label>
                    <input
                      id="age"
                      type="number"
                      min="0"
                      max="30"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      placeholder="Ej: 2"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white text-base touch-manipulation"
                    />
                  </div>

                </div>
              </div>

              {/* Características Físicas */}
              <div className="border-t border-neutral-200 pt-6 sm:pt-8">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4 sm:mb-6 flex items-center">
                  <Scale className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-health-600" />
                  Características Físicas
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* Peso */}
                  <div className="space-y-2">
                    <label htmlFor="weight" className="block text-sm font-semibold text-neutral-700">
                      Peso (kg)
                    </label>
                    <div className="relative">
                      <input
                        id="weight"
                        type="number"
                        min="0"
                        max="200"
                        step="0.1"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        placeholder="25.5"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white text-base touch-manipulation"
                      />
                      <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-neutral-500 font-medium text-sm">
                        kg
                      </div>
                    </div>
                  </div>

                  {/* Sexo */}
                  <div className="space-y-2">
                    <label htmlFor="sex" className="block text-sm font-semibold text-neutral-700">
                      Sexo
                    </label>
                    <select
                      id="sex"
                      value={sex}
                      onChange={e => setSex(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white text-base touch-manipulation"
                    >
                      <option value="">Seleccionar sexo</option>
                      {sexOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Estado Reproductivo */}
                  <div className="space-y-2">
                    <label htmlFor="reproductiveStatus" className="block text-sm font-semibold text-neutral-700">
                      Estado Reproductivo
                    </label>
                    <select
                      id="reproductiveStatus"
                      value={reproductiveStatus}
                      onChange={e => setReproductiveStatus(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white text-base touch-manipulation"
                    >
                      <option value="">Seleccionar estado</option>
                      {reproductiveStatusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  {/* Fecha de Nacimiento */}
                  <div className="space-y-2">
                    <label htmlFor="birthDate" className="block text-sm font-semibold text-neutral-700">
                      Fecha de Nacimiento
                    </label>
                    <div className="relative">
                      <input
                        id="birthDate"
                        type="date"
                        value={birthDate}
                        onChange={e => setBirthDate(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white"
                      />
                      <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-neutral-500">Fecha aproximada si no se conoce exacta</p>
                  </div>

                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-emergency-50 border border-emergency-200 text-emergency-700 px-6 py-4 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-emergency-500 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200 font-medium flex items-center justify-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                    loading
                      ? 'bg-neutral-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-health-600 to-health-700 text-white hover:from-health-700 hover:to-health-800 shadow-health hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Crear Mascota
                    </>
                  )}
                </button>
              </div>

            </form>
          </ThemedCard>
        </SlideIn>

      </div>
    </div>
  );
}
