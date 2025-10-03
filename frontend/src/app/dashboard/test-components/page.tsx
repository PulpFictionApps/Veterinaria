'use client';

import { useState } from 'react';
import ThemedCard from '../../../components/ui/ThemedCard';
import ThemedButton from '../../../components/ui/ThemedButton';
import ThemedInput from '../../../components/ui/ThemedInput';
import { 
  Stethoscope, 
  Heart, 
  AlertTriangle, 
  Save, 
  Search,
  User,
  Calendar,
  Settings
} from 'lucide-react';

export default function ComponentsTestPage() {
  const [inputValue, setInputValue] = useState('');
  const [errorInput, setErrorInput] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50/30 via-white to-health-50/30 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black bg-gradient-to-r from-medical-700 to-health-600 bg-clip-text text-transparent mb-4">
            Componentes Temáticos Vetrium
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Prueba de los nuevos componentes profesionales quirúrgicamente perfectos
          </p>
        </div>

        {/* Cards Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ThemedCard Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <ThemedCard variant="default" padding="lg">
              <div className="text-center">
                <Settings className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Default Card</h3>
                <p className="text-sm text-gray-600">Estilo por defecto con tema dinámico</p>
              </div>
            </ThemedCard>

            <ThemedCard variant="medical" padding="lg">
              <div className="text-center">
                <Stethoscope className="w-8 h-8 text-medical-600 mx-auto mb-3" />
                <h3 className="font-bold text-medical-800 mb-2">Medical Card</h3>
                <p className="text-sm text-medical-600">Diseño médico profesional</p>
              </div>
            </ThemedCard>

            <ThemedCard variant="health" padding="lg">
              <div className="text-center">
                <Heart className="w-8 h-8 text-health-600 mx-auto mb-3" />
                <h3 className="font-bold text-health-800 mb-2">Health Card</h3>
                <p className="text-sm text-health-600">Enfoque en bienestar</p>
              </div>
            </ThemedCard>

            <ThemedCard variant="emergency" padding="lg">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-emergency-600 mx-auto mb-3" />
                <h3 className="font-bold text-emergency-800 mb-2">Emergency Card</h3>
                <p className="text-sm text-emergency-600">Para situaciones críticas</p>
              </div>
            </ThemedCard>

          </div>
        </section>

        {/* Buttons Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ThemedButton Variants</h2>
          <ThemedCard padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Primary & Secondary</h4>
                <ThemedButton variant="primary" icon={Save} fullWidth>
                  Primary Button
                </ThemedButton>
                <ThemedButton variant="secondary" icon={Search} fullWidth>
                  Secondary Button
                </ThemedButton>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Medical Styles</h4>
                <ThemedButton variant="medical" icon={Stethoscope} fullWidth>
                  Medical Action
                </ThemedButton>
                <ThemedButton variant="health" icon={Heart} fullWidth>
                  Health Action
                </ThemedButton>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Emergency & Outline</h4>
                <ThemedButton variant="emergency" icon={AlertTriangle} fullWidth>
                  Emergency
                </ThemedButton>
                <ThemedButton variant="outline" icon={User} fullWidth>
                  Outline Button
                </ThemedButton>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Sizes & States</h4>
                <ThemedButton variant="primary" size="sm" fullWidth>
                  Small
                </ThemedButton>
                <ThemedButton variant="primary" size="lg" fullWidth>
                  Large
                </ThemedButton>
                <ThemedButton variant="primary" loading fullWidth>
                  Loading...
                </ThemedButton>
              </div>

            </div>
          </ThemedCard>
        </section>

        {/* Inputs Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">ThemedInput Variants</h2>
          <ThemedCard padding="lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <ThemedInput
                  label="Input por Defecto"
                  placeholder="Escribe algo aquí..."
                  value={inputValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                  helpText="Texto de ayuda opcional"
                />

                <ThemedInput
                  label="Input Médico"
                  variant="medical"
                  icon={Stethoscope}
                  placeholder="Diagnóstico médico..."
                  helpText="Estilo optimizado para formularios médicos"
                />

                <ThemedInput
                  label="Búsqueda"
                  variant="search"
                  icon={Search}
                  placeholder="Buscar pacientes..."
                />
              </div>

              <div className="space-y-6">
                <ThemedInput
                  label="Input con Icono Derecho"
                  icon={User}
                  iconPosition="right"
                  placeholder="Nombre del veterinario..."
                />

                <ThemedInput
                  label="Campo Obligatorio con Error"
                  required
                  error="Este campo es obligatorio"
                  value={errorInput}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setErrorInput(e.target.value)}
                  placeholder="Campo con validación..."
                />

                <ThemedInput
                  label="Campo Deshabilitado"
                  disabled
                  value="No se puede editar"
                  placeholder="Campo deshabilitado..."
                />
              </div>

            </div>
          </ThemedCard>
        </section>

        {/* Combined Example */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Ejemplo Combinado</h2>
          <ThemedCard variant="medical" padding="lg">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-medical-600 to-medical-700 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-medical-800">Agendar Nueva Cita</h3>
                  <p className="text-sm text-medical-600 font-medium">Formulario de ejemplo con componentes temáticos</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemedInput
                label="Nombre del Paciente"
                required
                icon={User}
                placeholder="Ej: Max, Luna, Rocky..."
                variant="medical"
              />
              <ThemedInput
                label="Tipo de Consulta"
                icon={Stethoscope}
                placeholder="Consulta general, vacunación..."
                variant="medical"
              />
            </div>

            <div className="flex gap-4 mt-8">
              <ThemedButton variant="medical" icon={Save} size="lg">
                Guardar Cita
              </ThemedButton>
              <ThemedButton variant="outline" size="lg">
                Cancelar
              </ThemedButton>
            </div>
          </ThemedCard>
        </section>

        {/* Back to Dashboard */}
        <div className="text-center pt-8">
          <ThemedButton 
            variant="primary" 
            size="lg"
            onClick={() => window.location.href = '/dashboard'}
          >
            Volver al Dashboard
          </ThemedButton>
        </div>

      </div>
    </div>
  );
}