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
      <div className="w-full min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          
          {/* Header */}
          <FadeIn>
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 sm:p-8 text-white rounded-3xl shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                  <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto">
                    <div className="w-14 h-14 sm:w-18 sm:h-18 bg-white/20 rounded-3xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10">
                      <Users className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-sm" />
                    </div>
                    <div className="min-w-0 flex-1 sm:flex-initial">
                      <h1 className="text-2xl sm:text-4xl font-black mb-2 leading-tight tracking-tight">Gestión de Clientes</h1>
                      <p className="text-white/90 text-sm sm:text-lg font-medium">
                        👥 {filteredClients.length} cliente{filteredClients.length !== 1 && 's'} registrado{filteredClients.length !== 1 && 's'}
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/clients/new" className="w-full sm:w-auto">
                    <ThemedButton variant="secondary" icon={Plus} size="lg" className="w-full sm:w-auto touch-manipulation">
                      Nuevo Cliente
                    </ThemedButton>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Barra de búsqueda y filtros */}
          <AnimateOnView animation="slide">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                
                {/* Búsqueda */}
                <div className="flex-1">
                  <ThemedInput
                    variant="search"
                    icon={Search}
                    placeholder="Buscar por nombre, email, teléfono o RUT..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Controles de vista */}
                <div className="flex items-center justify-center sm:justify-start">
                  <div className="bg-gray-100 rounded-xl p-1 flex touch-manipulation">
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
            <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadClientsWithPets}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <UserPlus className="w-12 h-12 text-gray-700" />
              </div>
              <h3 className="text-3xl font-black text-gray-800 mb-4">
                {searchTerm ? '🔍 No se encontraron clientes' : '👥 No hay clientes registrados'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `No hay clientes que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`
                  : 'Comienza agregando tu primer cliente para gestionar sus mascotas y citas médicas.'
                }
              </p>
              {!searchTerm && (
                <Link href="/dashboard/clients/new">
                  <button className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto">
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
                    className={`group touch-manipulation ${viewMode === 'grid' 
                      ? 'bg-white rounded-3xl shadow-md border border-gray-200 p-6 sm:p-8 hover:shadow-lg hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01]'
                      : 'bg-white rounded-2xl shadow-md border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex items-center space-x-4 sm:space-x-8'
                    }`}
                  >
                    
                    {viewMode === 'grid' ? (
                      // Vista de cards
                      <>
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300 flex-shrink-0 shadow-sm">
                            <User className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700 group-hover:scale-110 transition-transform" />
                          </div>
                          <div className="flex space-x-1 sm:space-x-2">
                            {client.pets && client.pets.length > 0 && (
                              <Tooltip content={`${client.pets.length} mascota${client.pets.length !== 1 ? 's' : ''}`}>
                                <ThemedBadge variant="secondary" size="sm" icon={PawPrint} count={client.pets.length}>
                                  Mascotas
                                </ThemedBadge>
                              </Tooltip>
                            )}
                            {client.appointments && client.appointments.length > 0 && (
                              <Tooltip content="Tiene citas programadas">
                                <ThemedBadge variant="primary" size="sm" icon={Calendar} count={client.appointments.length}>
                                  Citas
                                </ThemedBadge>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="text-lg sm:text-xl font-black text-gray-800 group-hover:text-gray-900 transition-colors leading-tight mb-2">
                            👤 {client.name}
                          </h3>
                          
                          <div className="space-y-2 sm:space-y-3">
                            {client.email && (
                              <div className="flex items-center text-sm sm:text-base text-gray-700 bg-gray-50 rounded-lg p-2">
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-gray-600 flex-shrink-0" />
                                <span className="truncate font-medium">{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center text-sm sm:text-base text-gray-700 bg-gray-50 rounded-lg p-2">
                                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-gray-600 flex-shrink-0" />
                                <span className="truncate font-medium">{client.phone}</span>
                              </div>
                            )}
                            {client.address && (
                              <div className="flex items-center text-sm sm:text-base text-gray-700 bg-gray-50 rounded-lg p-2">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-3 text-gray-600 flex-shrink-0" />
                                <span className="truncate font-medium">{client.address}</span>
                              </div>
                            )}
                          </div>

                          {client.pets && client.pets.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-neutral-100">
                              <p className="text-xs text-neutral-500 mb-2">Mascotas:</p>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                {client.pets.slice(0, 3).map(pet => (
                                  <ThemedBadge key={pet.id} variant="secondary" size="xs">
                                    {pet.name}
                                  </ThemedBadge>
                                ))}
                                {client.pets.length > 3 && (
                                  <ThemedBadge variant="neutral" size="xs">
                                    +{client.pets.length - 3} más
                                  </ThemedBadge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // Vista de lista
                      <>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors truncate">
                            {client.name}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 text-xs sm:text-sm text-neutral-600 space-y-1 sm:space-y-0">
                            {client.email && (
                              <span className="flex items-center truncate">
                                <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </span>
                            )}
                            {client.phone && (
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 flex-shrink-0">
                          {client.pets && client.pets.length > 0 && (
                            <ThemedBadge variant="secondary" size="sm" icon={PawPrint} count={client.pets.length}>
                              Mascotas
                            </ThemedBadge>
                          )}
                          {client.appointments && client.appointments.length > 0 && (
                            <ThemedBadge variant="primary" size="sm" icon={Calendar} count={client.appointments.length}>
                              Citas
                            </ThemedBadge>
                          )}
                        </div>
                      </>
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
