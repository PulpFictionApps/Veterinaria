"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { authFetch } from '@/lib/api';

export default function NewPetPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const clientId = Number(resolvedParams.id);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const petTypes = [
    'Perro', 'Gato', 'Conejo', 'Hamster', 'Cobaya', 'Pájaro', 
    'Pez', 'Tortuga', 'Iguana', 'Otro'
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Mascota</h1>
        
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Mascota *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Max, Luna, Rocky"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Animal *
            </label>
            <select
              id="type"
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecciona un tipo</option>
              {petTypes.map(petType => (
                <option key={petType} value={petType}>{petType}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
              Raza
            </label>
            <input
              id="breed"
              type="text"
              value={breed}
              onChange={e => setBreed(e.target.value)}
              placeholder="Ej: Golden Retriever, Persa, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando...' : 'Crear Mascota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
