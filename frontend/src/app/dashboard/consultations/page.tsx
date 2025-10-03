"use client";

import { useState } from 'react';
import { authFetch } from '../../../lib/api';
import { useConsultationTypes, invalidateCache } from '../../../hooks/useData';
import ThemedButton from '../../../components/ThemedButton';

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
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tipos de consulta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tipos de Consulta</h1>
              <p className="text-gray-600 mt-1">
                Configura los tipos de consulta, precios y duraciones
              </p>
            </div>
            <ThemedButton
              onClick={() => setShowCreateForm(true)}
              className="sm:w-auto w-full"
            >
              + Nuevo Tipo
            </ThemedButton>
          </div>
        </div>

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

        {/* Empty State */}
        {consultationTypes.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4">💊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay tipos de consulta configurados
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer tipo de consulta para comenzar a agendar citas
            </p>
            <ThemedButton onClick={() => setShowCreateForm(true)}>
              Crear Primer Tipo
            </ThemedButton>
          </div>
        )}

        {/* Consultation Types Grid */}
        {consultationTypes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultationTypes.map((type: ConsultationType) => (
              <div
                key={type.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                  type.active 
                    ? 'border-gray-200 hover:shadow-md' 
                    : 'border-gray-100 opacity-60'
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: type.color || '#3B82F6' }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {type.name}
                        </h3>
                        {type.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {type.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleActive(type.id, type.active)}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        type.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {type.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        ⏱️ Duración:
                      </span>
                      <span className="font-medium">
                        {type.duration || 30} minutos
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        💰 Precio:
                      </span>
                      <span className="font-semibold text-lg text-gray-900">
                        ${type.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => editType(type)}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    ✏️ Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}