"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '../../../lib/api';

interface ConsultationType {
  id: number;
  name: string;
  price: number; // in cents
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ConsultationTypesPage() {
  const [types, setTypes] = useState<ConsultationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ConsultationType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    active: true
  });

  useEffect(() => {
    loadConsultationTypes();
  }, []);

  async function loadConsultationTypes() {
    try {
      const res = await authFetch('/consultation-types');
      if (res.ok) {
        const data = await res.json();
        setTypes(data);
      }
    } catch (err) {
      console.error('Error loading consultation types:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        price: Number(formData.price) // Convert to number (backend will convert to cents)
      };

      let res;
      if (editing) {
        res = await authFetch(`/consultation-types/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await authFetch('/consultation-types', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        await loadConsultationTypes();
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || 'Error saving consultation type');
      }
    } catch (err) {
      console.error('Error saving consultation type:', err);
      alert('Error saving consultation type');
    }
  }

  async function handleDelete(type: ConsultationType) {
    if (!confirm(`¿Eliminar el tipo de consulta "${type.name}"?`)) return;

    try {
      const res = await authFetch(`/consultation-types/${type.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await loadConsultationTypes();
      } else {
        const error = await res.json();
        alert(error.error || 'Error deleting consultation type');
      }
    } catch (err) {
      console.error('Error deleting consultation type:', err);
      alert('Error deleting consultation type');
    }
  }

  function startEdit(type: ConsultationType) {
    setEditing(type);
    setFormData({
      name: type.name,
      price: (type.price / 100).toString(), // Convert cents to dollars for display
      description: type.description || '',
      active: type.active
    });
  }

  function resetForm() {
    setEditing(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      active: true
    });
  }

  function formatPrice(priceInCents: number) {
    return (priceInCents / 100).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP'
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Cargando tipos de consulta...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tipos de Consulta</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {editing ? 'Editar Tipo de Consulta' : 'Nuevo Tipo de Consulta'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ej. Consulta General, Vacunación"
              />
            </div>
            
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Precio (CLP) *
              </label>
              <input
                id="price"
                type="number"
                required
                min="0"
                step="100"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="ej. 25000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Descripción opcional del tipo de consulta"
            />
          </div>

          <div className="flex items-center">
            <input
              id="active"
              type="checkbox"
              checked={formData.active}
              onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Activo (visible para reservas públicas)
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-200/50"
            >
              {editing ? 'Actualizar' : 'Crear'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Types List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Tipos Existentes</h2>
        </div>
        
        {types.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-400 text-4xl mb-2">💊</div>
            <p className="text-gray-500">No hay tipos de consulta creados aún</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {types.map((type) => (
              <div key={type.id} className="p-6 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{type.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        type.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {type.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    
                    <p className="text-xl font-semibold text-pink-600 mb-2">
                      {formatPrice(type.price)}
                    </p>
                    
                    {type.description && (
                      <p className="text-gray-600 text-sm">{type.description}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(type)}
                      className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(type)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}