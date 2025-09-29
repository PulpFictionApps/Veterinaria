"use client";

import { useState, useEffect } from 'react';
import { authFetch } from '../../../lib/api';
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
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadConsultationTypes();
  }, []);

  const loadConsultationTypes = async () => {
    setLoading(true);
    try {
      const response = await authFetch('/consultation-types');
      if (response.ok) {
        const data = await response.json();
        setConsultationTypes(data);
      } else {
        console.error('Error cargando tipos de consulta - Status:', response.status);
      }
    } catch (error) {
      console.error('Error cargando tipos de consulta:', error);
    } finally {
      setLoading(false);
    }
  };

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
        loadConsultationTypes();
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
        loadConsultationTypes();
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingType ? 'Editar' : 'Crear'} Tipo de Consulta
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Ej: Consulta General"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración (minutos) *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio (CLP) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="25000"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color de identificación
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{formData.color}</span>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Descripción opcional del tipo de consulta"
                  />
                </div>
                
                <div className="md:col-span-2 flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Tipo activo</span>
                  </label>
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <ThemedButton type="submit">
                    {editingType ? 'Guardar Cambios' : 'Crear Tipo'}
                  </ThemedButton>
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
            {consultationTypes.map((type) => (
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