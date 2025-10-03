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
      <FadeIn>
        <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-health-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center py-20">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-medical-100">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-medical-100 border-t-medical-500"></div>
                    <Pill className="h-6 w-6 text-medical-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-6 text-neutral-600 font-medium">Cargando tipos de consulta...</p>
                  <p className="mt-2 text-sm text-neutral-400">Preparando configuración médica</p>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-medical-500 to-health-500 rounded-xl shadow-lg">
                    <Pill className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-medical-700 to-health-600 bg-clip-text text-transparent">
                      Tipos de Consulta Veterinaria
                    </h1>
                    <p className="text-neutral-600 mt-1 font-medium">
                      Configura servicios médicos, precios y duraciones de consultas
                    </p>
                  </div>
                </div>
                <Tooltip content="Crear nuevo tipo de consulta médica">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="group flex items-center gap-2 bg-gradient-to-r from-medical-500 to-health-500 text-white px-6 py-3 rounded-xl hover:from-medical-600 hover:to-health-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                  >
                    <Plus className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    Nuevo Tipo
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl shadow-card border border-medical-100 mb-8">
            <div className="px-8 py-6 border-b border-medical-100 bg-gradient-to-r from-medical-50 to-health-50">
              <h2 className="text-xl font-bold text-neutral-800">
                {editingType ? 'Editar' : 'Crear'} Tipo de Consulta
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Configure los detalles del tipo de consulta veterinaria
              </p>
            </div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-700">
                    Nombre del Tipo de Consulta *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white"
                    placeholder="Ej: Consulta General, Vacunación, Cirugía"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-700">
                    Duración de la Consulta *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1.5 horas</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-700">
                    Precio (CLP) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 font-medium">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                      className="w-full pl-8 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white"
                      placeholder="25000"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-neutral-700">
                    Color de Identificación
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-12 border-2 border-neutral-300 rounded-xl cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                    />
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: formData.color }}
                      />
                      <span className="text-sm font-medium text-neutral-600">{formData.color}</span>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-neutral-700">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white resize-none"
                    rows={4}
                    placeholder="Descripción detallada del tipo de consulta (opcional)"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center p-4 bg-health-50 border border-health-200 rounded-xl cursor-pointer hover:bg-health-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-health-300 text-health-600 focus:ring-health-500 mr-3"
                    />
                    <div>
                      <span className="text-sm font-semibold text-health-800">Tipo de consulta activo</span>
                      <p className="text-xs text-health-600">Los tipos inactivos no aparecerán en el sistema de reservas</p>
                    </div>
                  </label>
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-8 py-3 border border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-medical-600 to-medical-700 text-white rounded-xl hover:from-medical-700 hover:to-medical-800 transition-all duration-200 font-semibold shadow-medical"
                  >
                    {editingType ? '✓ Guardar Cambios' : '+ Crear Tipo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Stagger className="space-y-8">
          {/* Empty State */}
          {consultationTypes.length === 0 && (
            <AnimateOnView>
              <div className="bg-white rounded-2xl shadow-xl border border-medical-100 p-12 text-center">
                <div className="p-6 bg-gradient-to-r from-medical-50 to-health-50 rounded-2xl mb-6 inline-block">
                  <Stethoscope className="h-16 w-16 text-medical-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-medical-800 mb-3">
                  No hay tipos de consulta configurados
                </h3>
                <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                  Crea tu primer tipo de consulta veterinaria para comenzar a ofrecer servicios médicos especializados
                </p>
                <Tooltip content="Crear primer tipo de consulta médica">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="group inline-flex items-center gap-3 bg-gradient-to-r from-medical-500 to-health-500 text-white px-8 py-4 rounded-xl hover:from-medical-600 hover:to-health-600 transition-all duration-300 shadow-xl hover:shadow-2xl font-bold text-lg"
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
                        ? 'border-medical-200 hover:border-medical-300' 
                        : 'border-neutral-200 opacity-70'
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
                            <h3 className="font-bold text-medical-800 text-lg group-hover:text-medical-600 transition-colors">
                              {type.name}
                            </h3>
                            {type.description && (
                              <p className="text-sm text-neutral-600 mt-1">
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
                                ? 'bg-health-100 text-health-800 hover:bg-health-200'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-medical-50 to-health-50 rounded-lg">
                          <span className="text-medical-700 font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Duración:
                          </span>
                          <span className="font-bold text-medical-800">
                            {type.duration || 30} min
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-health-50 to-medical-50 rounded-lg">
                          <span className="text-health-700 font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Precio:
                          </span>
                          <span className="font-bold text-xl text-health-800">
                            ${type.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <Tooltip content="Editar tipo de consulta">
                        <button
                          onClick={() => editType(type)}
                          className="group/edit w-full py-3 bg-gradient-to-r from-medical-500 to-health-500 text-white hover:from-medical-600 hover:to-health-600 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
  );
}