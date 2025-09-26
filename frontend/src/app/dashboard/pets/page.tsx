"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '../../../lib/api';
import ThemedButton from '../../../components/ThemedButton';

interface Pet {
  id: number;
  name: string;
  type: string;
  breed: string;
  age: number;
  tutorId: number;
  tutor: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  };
  updatedAt: string;
  createdAt: string;
}

interface Tutor {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export default function PetsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pets, setPets] = useState<Pet[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTutor, setSelectedTutor] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  // Get filter from URL params
  const tutorFilter = searchParams?.get('tutor');

  useEffect(() => {
    if (tutorFilter) {
      setSelectedTutor(tutorFilter);
    }
  }, [tutorFilter]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load pets and tutors in parallel
      const [petsRes, tutorsRes] = await Promise.all([
        authFetch('/pets'),
        authFetch('/tutors')
      ]);

      if (petsRes.ok && tutorsRes.ok) {
        const [petsData, tutorsData] = await Promise.all([
          petsRes.json(),
          tutorsRes.json()
        ]);
        setPets(petsData);
        setTutors(tutorsData);
      } else {
        setError('Error al cargar los datos');
      }
    } catch (err) {
      console.error('Error loading pets:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  // Filter pets based on search criteria
  const filteredPets = pets.filter(pet => {
    const matchesSearch = searchTerm === '' || 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTutor = selectedTutor === '' || pet.tutorId.toString() === selectedTutor;
    const matchesType = selectedType === '' || pet.type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesTutor && matchesType;
  });

  // Get unique pet types for filter
  const petTypes = [...new Set(pets.map(pet => pet.type))];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTutor('');
    setSelectedType('');
    router.push('/dashboard/pets', { scroll: false });
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando mascotas...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Mascotas</h1>
              <p className="text-gray-600 mt-1">
                Gestiona todos los pacientes de tu clínica veterinaria
              </p>
            </div>
            <ThemedButton
              onClick={() => router.push('/dashboard/pets/new')}
              className="sm:w-auto w-full"
            >
              + Nueva Mascota
            </ThemedButton>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nombre de mascota, tutor o raza..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              {/* Tutor Filter */}
              <div className="lg:w-64">
                <select
                  value={selectedTutor}
                  onChange={(e) => setSelectedTutor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Todos los tutores</option>
                  {tutors.map(tutor => (
                    <option key={tutor.id} value={tutor.id.toString()}>
                      {tutor.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Type Filter */}
              <div className="lg:w-48">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Todos los tipos</option>
                  {petTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Clear Filters */}
              {(searchTerm || selectedTutor || selectedType) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 whitespace-nowrap"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
            
            {/* Results Summary */}
            <div className="mt-4 text-sm text-gray-600">
              Mostrando {filteredPets.length} de {pets.length} mascotas
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPets.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {pets.length === 0 ? 'No hay mascotas registradas' : 'No se encontraron mascotas'}
            </h3>
            <p className="text-gray-600 mb-6">
              {pets.length === 0 
                ? 'Comienza registrando la primera mascota de tu clínica'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
            {pets.length === 0 && (
              <ThemedButton onClick={() => router.push('/dashboard/pets/new')}>
                Registrar Primera Mascota
              </ThemedButton>
            )}
          </div>
        )}

        {/* Pets Grid */}
        {filteredPets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPets.map(pet => (
              <Link
                key={pet.id}
                href={`/dashboard/pets/${pet.id}`}
                className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {pet.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {pet.type} • {pet.breed} • {pet.age} años
                      </p>
                    </div>
                    <span className="text-2xl">
                      {pet.type.toLowerCase() === 'perro' ? '🐕' : 
                       pet.type.toLowerCase() === 'gato' ? '🐱' : 
                       '🐾'}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">👤</span>
                      <span className="font-medium">{pet.tutor.name}</span>
                    </div>
                    {pet.tutor.phone && (
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <span className="mr-2">📞</span>
                        <span>{pet.tutor.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}