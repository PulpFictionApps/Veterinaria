"use client";

import { useState } from 'react';
import { authFetch } from '../../../lib/api';
import { useConsultationTypes, invalidateCache } from '../../../hooks/useData';
import { 
  Pill, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign,
  Stethoscope,
  Heart,
  Shield,
  CheckCircle,
  X,
  Save,
  Activity
} from 'lucide-react';
import { FadeIn, SlideIn, Stagger, AnimateOnView } from '../../../components/ui/Transitions';
import Tooltip from '../../../components/ui/Tooltip';
import ThemedCard from '../../../components/ui/ThemedCard';
import ThemedButton from '../../../components/ui/ThemedButton';
import ThemedInput from '../../../components/ui/ThemedInput';
import PageHeader from '../../../components/ui/PageHeader';

interface ConsultationType {
  id: number;
  name: string;
  description?: string;
  duration?: number;
  price: number;
  color?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ConsultationsPage() {
  const { consultationTypes, isLoading: loading, revalidate } = useConsultationTypes();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingType, setEditingType] = useState<ConsultationType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    color: '#3B82F6',
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingType 
        ? `/consultation-types/${editingType.id}`
        : '/consultation-types';
      
      const method = editingType ? 'PATCH' : 'POST';

      const response = await authFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        resetForm();
        invalidateCache.consultationTypes();
        await revalidate();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error del servidor:', errorData);
      }
    } catch (error) {
      console.error('Error guardando tipo de consulta:', error);
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      duration: 30,
      price: 0,
      color: '#3B82F6',
      active: true,
    });
  };

  const editType = (type: ConsultationType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      duration: type.duration || 30,
      price: type.price,
      color: type.color || '#3B82F6',
      active: type.active,
    });
    setShowCreateForm(true);
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      const response = await authFetch(`/consultation-types/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (response.ok) {
        invalidateCache.consultationTypes();
        await revalidate();
      }
    } catch (error) {
      console.error('Error updating consultation type:', error);
    }
  };

  if (loading) {
    return (
      <div className="vet-page">
        <div className="vet-container">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-page">
      <div className="vet-container">
        <PageHeader
          title="Tipos de Consulta Veterinaria"
          subtitle="Configura servicios médicos, precios y duraciones de consultas"
          icon={Pill}
        actions={
          <Tooltip content="Crear nuevo tipo de consulta médica">
            <ThemedButton
              variant="primary"
              icon={Plus}
              onClick={() => setShowCreateForm(true)}
              size="lg"
            >
              Nuevo Tipo
            </ThemedButton>
          </Tooltip>
        }
      />

        <div className="vet-container space-y-8">

        {/* Create/Edit Form */}
        {showCreateForm && (
          <ThemedCard variant="medical" className="mb-8">
            <div className="px-8 py-6 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingType ? 'Editar' : 'Crear'} Tipo de Consulta
                </h2>
              </div>
              <p className="text-sm text-gray-600 ml-10">
                Configure los detalles del tipo de consulta veterinaria
              </p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <ThemedInput
                    label="Nombre del Tipo de Consulta *"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Consulta General, Vacunación, Cirugía"
                    required
                    variant="medical"
                    icon={Stethoscope}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Duración de la Consulta *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1.5 horas</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>
                
                <div>
                  <ThemedInput
                    label="Precio (CLP) *"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                    placeholder="25000"
                    required
                    variant="medical"
                    icon={DollarSign}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Color de Identificación
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
                    />
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: formData.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">{formData.color}</span>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
                    rows={4}
                    placeholder="Descripción detallada del tipo de consulta (opcional)"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-gray-300 text-gray-700 focus:ring-gray-500 mr-3"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-800">Tipo de consulta activo</span>
                      <p className="text-xs text-gray-700">Los tipos inactivos no aparecerÃ¡n en el sistema de reservas</p>
                    </div>
                  </label>
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <ThemedButton
                    variant="outline"
                    onClick={resetForm}
                    size="lg"
                  >
                    Cancelar
                  </ThemedButton>
                  <ThemedButton
                    variant="primary"
                    type="submit"
                    size="lg"
                  >
                    {editingType ? 'âœ“ Guardar Cambios' : '+ Crear Tipo'}
                  </ThemedButton>
                </div>
              </form>
            </div>
          </ThemedCard>
        )}

        <Stagger className="space-y-8">
          {/* Empty State */}
          {consultationTypes.length === 0 && (
            <AnimateOnView>
              <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-50 rounded-2xl mb-6 inline-block">
                  <Stethoscope className="h-16 w-16 text-gray-700 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  No hay tipos de consulta configurados
                </h3>
                <p className="text-gray-700 mb-8 max-w-md mx-auto">
                  Crea tu primer tipo de consulta veterinaria para comenzar a ofrecer servicios mÃ©dicos especializados
                </p>
                <Tooltip content="Crear primer tipo de consulta mÃ©dica">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-4 rounded-lg hover:from-gray-600 hover:to-gray-600 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-lg"
                  >
                    <Heart className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                    Crear Primer Tipo
                    <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </Tooltip>
              </div>
            </AnimateOnView>
          )}

          {/* Consultation Types Grid */}
          {consultationTypes.length > 0 && (
            <AnimateOnView>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {consultationTypes.map((type: ConsultationType) => (
                  <div
                    key={type.id}
                    className={`group bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
                      type.active 
                        ? 'border-gray-200 hover:border-gray-300' 
                        : 'border-gray-200 opacity-70'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="w-6 h-6 rounded-full flex-shrink-0 shadow-lg"
                            style={{ backgroundColor: type.color || '#3B82F6' }}
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-gray-700 transition-colors">
                              {type.name}
                            </h3>
                            {type.description && (
                              <p className="text-sm text-gray-700 mt-1">
                                {type.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Tooltip content={type.active ? "Desactivar consulta" : "Activar consulta"}>
                          <button
                            onClick={() => toggleActive(type.id, type.active)}
                            className={`text-xs px-3 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
                              type.active
                                ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {type.active ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Activo
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3" />
                                Inactivo
                              </>
                            )}
                          </button>
                        </Tooltip>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            DuraciÃ³n:
                          </span>
                          <span className="font-bold text-gray-800">
                            {type.duration || 30} min
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-50 rounded-lg">
                          <span className="text-gray-700 font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Precio:
                          </span>
                          <span className="font-bold text-xl text-gray-800">
                            ${type.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <Tooltip content="Editar tipo de consulta">
                        <button
                          onClick={() => editType(type)}
                          className="group/edit w-full py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-600 hover:to-gray-600 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                        >
                          <Edit className="h-4 w-4 group-hover/edit:scale-110 transition-transform duration-300" />
                          Editar Consulta
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </AnimateOnView>
          )}
        </Stagger>
        </div>
      </div>
    </div>
  );
}
