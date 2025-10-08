"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '../../../lib/api';
import { useAuthContext } from '../../../lib/auth-context';
import { usePets } from '../../../hooks/useData';
import SubscriptionGuard from '../../../components/SubscriptionGuard';
import { 
  Users, 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  PawPrint,
  Calendar,
  Filter,
  Grid3x3,
  List,
  UserPlus
} from 'lucide-react';
import { FadeIn, Stagger, AnimateOnView } from '../../../components/ui/Transitions';
import Tooltip from '../../../components/ui/Tooltip';
import ThemedCard from '../../../components/ui/ThemedCard';
import ThemedButton from '../../../components/ui/ThemedButton';
import ThemedInput from '../../../components/ui/ThemedInput';
import ThemedBadge from '../../../components/ui/ThemedBadge';
import PageHeader from '../../../components/ui/PageHeader';

interface Client {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  rut?: string;
  address?: string;
  pets?: Array<{
    id: number;
    name: string;
    type: string;
  }>;
  appointments?: Array<{
    id: number;
    date: string;
    status: string;
  }>;
  createdAt?: string;
  [key: string]: any;
}

export default function ClientsPage() {
  const { userId } = useAuthContext();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  async function loadClientsWithPets() {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const res = await authFetch('/tutors');
      if (!res.ok) {
        setError('Error cargando clientes');
        setClients([]);
        setFilteredClients([]);
        return;
      }
      const data: Client[] = await res.json();
      
      // Cargar las mascotas reales para cada cliente
      const enrichedData = await Promise.all(
        data.map(async (client) => {
          try {
            const petsRes = await authFetch(`/pets?tutorId=${client.id}`);
            const pets = petsRes.ok ? await petsRes.json() : [];
            
            // También podemos cargar las citas reales si es necesario
            const appointmentsRes = await authFetch(`/appointments/${userId}`);
            let appointments = [];
            if (appointmentsRes.ok) {
              const allAppointments = await appointmentsRes.json();
              // Filtrar citas de este cliente específico
              appointments = allAppointments.filter((apt: any) => apt.tutorId === client.id);
            }
            
            return {
              ...client,
              pets: pets || [],
              appointments: appointments || []
            };
          } catch (err) {
            console.error(`Error loading data for client ${client.id}:`, err);
            return {
              ...client,
              pets: [],
              appointments: []
            };
          }
        })
      );
      
      setClients(enrichedData || []);
      setFilteredClients(enrichedData || []);
    } catch (err) {
      console.error('Error fetching clients', err);
      setError('Error de conexión');
      setClients([]);
      setFilteredClients([]);
    } finally {
      setLoading(false);
    }
  }

  // Filtro de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm) ||
        client.rut?.includes(searchTerm)
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  useEffect(() => { loadClientsWithPets(); }, [userId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <SubscriptionGuard>
      <div className="vet-page">
        <div className="vet-container space-y-8">
          
          {/* Header */}
          <PageHeader 
            title="Gestión de Clientes"
            subtitle={` ${filteredClients.length} cliente${filteredClients.length !== 1 ? 's' : ''} registrado${filteredClients.length !== 1 ? 's' : ''}`}
            icon={Users}
            actions={
              <Link href="/dashboard/clients/new">
                <ThemedButton
                  variant="primary"
                  icon={Plus}
                >
                  Nuevo Cliente
                </ThemedButton>
              </Link>
            }
          />

          {/* Barra de búsqueda y filtros */}
          <AnimateOnView animation="slide">
            <div className="vet-card-unified p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                
                {/* Búsqueda */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email, teléfono o RUT..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="vet-input-unified"
                  />
                </div>

                {/* Controles de vista */}
                <div className="flex items-center justify-center sm:justify-start">
                  <div className="bg-gray-100 rounded-lg p-1 flex">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        viewMode === 'grid' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        viewMode === 'list' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden sm:inline">Lista</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </AnimateOnView>

          {/* Contenido */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-700 mx-auto mb-6"></div>
                <p className="text-lg font-bold text-gray-800">🔄 Cargando clientes</p>
                <p className="text-sm text-gray-600">Obteniendo información de la base de datos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="vet-card-unified p-8 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadClientsWithPets}
                className="vet-btn-unified vet-btn-primary-unified"
              >
                Reintentar
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="vet-card-unified p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mx-auto mb-6 shadow">
                <UserPlus className="w-12 h-12 text-gray-700" />
              </div>
              <h3 className="text-3xl font-black text-gray-800 mb-4">
                {searchTerm ? ' No se encontraron clientes' : 'No hay clientes registrados'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `No hay clientes que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`
                  : 'Comienza agregando tu primer cliente para gestionar sus mascotas y citas médicas.'
                }
              </p>
              {!searchTerm && (
                <Link href="/dashboard/clients/new">
                  <button className="vet-btn-unified vet-btn-primary-unified flex items-center gap-2 mx-auto">
                    <Plus className="w-5 h-5" />
                    Crear Primer Cliente
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8" 
              : "space-y-4 sm:space-y-6"
            }>
              <Stagger staggerDelay={100}>
                {filteredClients.map(client => (
                  <Link
                    key={client.id}
                    href={`/dashboard/clients/${client.id}`}
                    className="group block transition-transform hover:scale-105 duration-300"
                  >
                    
                    {viewMode === 'grid' ? (
                      // Vista de cards mejorada
                      <div className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group-hover:border-gray-300">
                        {/* Header con avatar y estado */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                  <User className="w-8 h-8 text-white" />
                                </div>
                                {/* Indicador de estado activo */}
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 border-2 border-white rounded-full"></div>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                                  {client.name}
                                </h3>
                                <p className="text-sm text-gray-600 font-medium">Cliente Veterinario</p>
                              </div>
                            </div>
                            
                            {/* Badges de resumen */}
                            <div className="flex flex-col gap-2">
                              {client.pets && client.pets.length > 0 && (
                                <Tooltip content={`${client.pets.length} mascota${client.pets.length !== 1 ? 's' : ''} registrada${client.pets.length !== 1 ? 's' : ''}`}>
                                  <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-lg text-xs font-semibold">
                                    <PawPrint className="w-3 h-3" />
                                    {client.pets.length}
                                  </div>
                                </Tooltip>
                              )}
                              {client.appointments && client.appointments.length > 0 && (
                                <Tooltip content={`${client.appointments.length} cita${client.appointments.length !== 1 ? 's' : ''} programada${client.appointments.length !== 1 ? 's' : ''}`}>
                                  <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-2 py-1 rounded-lg text-xs font-semibold">
                                    <Calendar className="w-3 h-3" />
                                    {client.appointments.length}
                                  </div>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contenido principal */}
                        <div className="p-6 space-y-4">
                          {/* Información de contacto */}
                          <div className="space-y-3">
                            {client.email && (
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Mail className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</p>
                                  <p className="text-sm font-semibold text-gray-800 truncate">{client.email}</p>
                                </div>
                              </div>
                            )}
                            
                            {client.phone && (
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Phone className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Teléfono</p>
                                  <p className="text-sm font-semibold text-gray-800">{client.phone}</p>
                                </div>
                              </div>
                            )}
                            
                            {client.address && (
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <MapPin className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Dirección</p>
                                  <p className="text-sm font-semibold text-gray-800 truncate">{client.address}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Sección de mascotas */}
                          {client.pets && client.pets.length > 0 && (
                            <div className="border-t border-gray-100 pt-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                  <PawPrint className="w-4 h-4 text-gray-500" />
                                  Mascotas Registradas
                                </h4>
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-semibold">
                                  {client.pets.length}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-2">
                                {client.pets.slice(0, 2).map(pet => (
                                  <div key={pet.id} className="flex items-center gap-3 p-2 bg-white border border-gray-150 rounded-lg">
                                    <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                      <PawPrint className="w-3 h-3 text-gray-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-gray-800 truncate">{pet.name}</p>
                                      <p className="text-xs text-gray-500">{pet.type}</p>
                                    </div>
                                  </div>
                                ))}
                                {client.pets.length > 2 && (
                                  <div className="text-center py-2">
                                    <span className="text-xs text-gray-500 font-medium">
                                      y {client.pets.length - 2} mascota{client.pets.length - 2 !== 1 ? 's' : ''} más...
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer con acción */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">Ver detalles completos</span>
                            <div className="w-6 h-6 bg-gray-200 group-hover:bg-gray-800 rounded-full flex items-center justify-center transition-all duration-300">
                              <svg className="w-3 h-3 text-gray-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Vista de lista mejorada
                      <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all duration-300 w-full">
                        <div className="flex items-center gap-4">
                          {/* Avatar mejorado */}
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center shadow-md">
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 border-2 border-white rounded-full"></div>
                          </div>
                          
                          {/* Información principal */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors truncate">
                              {client.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 mt-1">
                              {client.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center">
                                    <Mail className="w-3 h-3 text-gray-600" />
                                  </div>
                                  <span className="truncate font-medium max-w-48">{client.email}</span>
                                </div>
                              )}
                              {client.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <div className="w-5 h-5 bg-gray-100 rounded-md flex items-center justify-center">
                                    <Phone className="w-3 h-3 text-gray-600" />
                                  </div>
                                  <span className="font-medium">{client.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Estadísticas y badges */}
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {client.pets && client.pets.length > 0 && (
                              <Tooltip content={`${client.pets.length} mascota${client.pets.length !== 1 ? 's' : ''}`}>
                                <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg">
                                  <PawPrint className="w-4 h-4" />
                                  <span className="text-sm font-semibold">{client.pets.length}</span>
                                </div>
                              </Tooltip>
                            )}
                            {client.appointments && client.appointments.length > 0 && (
                              <Tooltip content={`${client.appointments.length} cita${client.appointments.length !== 1 ? 's' : ''}`}>
                                <div className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-sm font-semibold">{client.appointments.length}</span>
                                </div>
                              </Tooltip>
                            )}
                            
                            {/* Flecha indicadora */}
                            <div className="w-8 h-8 bg-gray-100 group-hover:bg-gray-800 rounded-lg flex items-center justify-center transition-all duration-300 ml-2">
                              <svg className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </Link>
                ))}
              </Stagger>
            </div>
          )}

        </div>
      </div>
    </SubscriptionGuard>
  );
}
