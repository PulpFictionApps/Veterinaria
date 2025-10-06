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
      <div className="w-full min-h-full bg-gradient-to-br from-neutral-50 to-medical-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
          
          {/* Header */}
          <FadeIn>
            <ThemedCard variant="medical" padding="lg" shadow="xl">
              <div className="bg-gradient-to-r from-medical-600 to-health-600 p-4 sm:p-8 text-white rounded-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="min-w-0 flex-1 sm:flex-initial">
                      <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">Gestión de Clientes</h1>
                      <p className="text-white/90 text-sm sm:text-base">
                        {filteredClients.length} cliente{filteredClients.length !== 1 && 's'} registrado{filteredClients.length !== 1 && 's'}
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
            </ThemedCard>
          </FadeIn>

          {/* Barra de búsqueda y filtros */}
          <AnimateOnView animation="slide">
            <ThemedCard variant="default" padding="lg">
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
                  <div className="bg-neutral-100 rounded-xl p-1 flex touch-manipulation">
                    <ThemedButton
                      variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                      size="sm"
                      icon={Grid3x3}
                      onClick={() => setViewMode('grid')}
                      className="text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline">Grid</span>
                    </ThemedButton>
                    <ThemedButton
                      variant={viewMode === 'list' ? 'primary' : 'ghost'}
                      size="sm"
                      icon={List}
                      onClick={() => setViewMode('list')}
                      className="text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <span className="hidden sm:inline">Lista</span>
                    </ThemedButton>
                  </div>
                </div>

              </div>
            </ThemedCard>
          </AnimateOnView>

          {/* Contenido */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-medical-200 border-t-medical-600 mx-auto mb-6"></div>
                <p className="text-lg font-semibold text-neutral-700">Cargando clientes</p>
                <p className="text-sm text-neutral-500">Obteniendo información...</p>
              </div>
            </div>
          ) : error ? (
            <ThemedCard variant="emergency" padding="lg" className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-800 mb-2">Error al cargar</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <ThemedButton
                variant="danger"
                onClick={loadClientsWithPets}
                size="lg"
              >
                Reintentar
              </ThemedButton>
            </ThemedCard>
          ) : filteredClients.length === 0 ? (
            <ThemedCard variant="medical" padding="lg" className="text-center">
              <div className="w-20 h-20 bg-medical-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-10 h-10 text-medical-600" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-800 mb-3">
                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
              </h3>
              <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `No hay clientes que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`
                  : 'Comienza agregando tu primer cliente para gestionar sus mascotas y citas médicas.'
                }
              </p>
              {!searchTerm && (
                <Link href="/dashboard/clients/new">
                  <ThemedButton
                    variant="secondary"
                    icon={Plus}
                    size="lg"
                  >
                    Crear Primer Cliente
                  </ThemedButton>
                </Link>
              )}
            </ThemedCard>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
              : "space-y-3 sm:space-y-4"
            }>
              <Stagger staggerDelay={100}>
                {filteredClients.map(client => (
                  <Link
                    key={client.id}
                    href={`/dashboard/clients/${client.id}`}
                    className={`group touch-manipulation ${viewMode === 'grid' 
                      ? 'bg-white rounded-2xl shadow-card border border-medical-100 p-4 sm:p-6 hover:shadow-card-hover transition-all duration-200 transform hover:-translate-y-1'
                      : 'bg-white rounded-xl shadow-sm border border-medical-100 p-3 sm:p-4 hover:shadow-md transition-all duration-200 flex items-center space-x-3 sm:space-x-6'
                    }`}
                  >
                    
                    {viewMode === 'grid' ? (
                      // Vista de cards
                      <>
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-medical-100 to-health-100 rounded-xl flex items-center justify-center group-hover:from-medical-200 group-hover:to-health-200 transition-colors flex-shrink-0">
                            <User className="w-5 h-5 sm:w-6 sm:h-6 text-medical-600" />
                          </div>
                          <div className="flex space-x-1 sm:space-x-2">
                            {client.pets && client.pets.length > 0 && (
                              <Tooltip content={`${client.pets.length} mascota${client.pets.length !== 1 ? 's' : ''}`}>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-health-100 rounded-lg flex items-center justify-center">
                                  <PawPrint className="w-3 h-3 sm:w-4 sm:h-4 text-health-600" />
                                </div>
                              </Tooltip>
                            )}
                            {client.appointments && client.appointments.length > 0 && (
                              <Tooltip content="Tiene citas programadas">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-medical-100 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-medical-600" />
                                </div>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <h3 className="text-base sm:text-lg font-bold text-neutral-800 group-hover:text-medical-700 transition-colors leading-tight">
                            {client.name}
                          </h3>
                          
                          <div className="space-y-1.5 sm:space-y-2">
                            {client.email && (
                              <div className="flex items-center text-xs sm:text-sm text-neutral-600">
                                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-neutral-400 flex-shrink-0" />
                                <span className="truncate">{client.email}</span>
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center text-xs sm:text-sm text-neutral-600">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-neutral-400 flex-shrink-0" />
                                <span className="truncate">{client.phone}</span>
                              </div>
                            )}
                            {client.address && (
                              <div className="flex items-center text-xs sm:text-sm text-neutral-600">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-neutral-400 flex-shrink-0" />
                                <span className="truncate">{client.address}</span>
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
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-medical-100 to-health-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-medical-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-neutral-800 group-hover:text-medical-700 transition-colors truncate">
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
