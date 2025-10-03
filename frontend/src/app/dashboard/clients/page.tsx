"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '../../../lib/api';
import { useAuthContext } from '../../../lib/auth-context';
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

  async function load() {
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
      
      // Agregar datos simulados para las mascotas y citas
      const enrichedData = data.map(client => ({
        ...client,
        pets: [
          { id: 1, name: 'Max', type: 'Perro' },
          { id: 2, name: 'Luna', type: 'Gato' }
        ], // Datos simulados
        appointments: [
          { id: 1, date: '2024-10-15', status: 'scheduled' }
        ] // Datos simulados
      }));
      
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

  useEffect(() => { load(); }, [userId]);

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
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
          
          {/* Header */}
          <FadeIn>
            <div className="bg-white rounded-2xl shadow-card border border-medical-100 overflow-hidden">
              <div className="bg-gradient-to-r from-medical-600 to-health-600 p-8 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold mb-2">Gestión de Clientes</h1>
                      <p className="text-white/90">
                        {filteredClients.length} cliente{filteredClients.length !== 1 && 's'} registrado{filteredClients.length !== 1 && 's'}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/clients/new"
                    className="flex items-center px-6 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Cliente
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Barra de búsqueda y filtros */}
          <AnimateOnView animation="slide">
            <div className="bg-white rounded-2xl shadow-card border border-medical-100 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                
                {/* Búsqueda */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email, teléfono o RUT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-all duration-200 bg-neutral-50 focus:bg-white"
                  />
                </div>

                {/* Controles de vista */}
                <div className="flex items-center space-x-2">
                  <div className="bg-neutral-100 rounded-xl p-1 flex">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-medical-600 text-white'
                          : 'text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list'
                          ? 'bg-medical-600 text-white'
                          : 'text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      <List className="w-4 h-4" />
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
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-medical-200 border-t-medical-600 mx-auto mb-6"></div>
                <p className="text-lg font-semibold text-neutral-700">Cargando clientes</p>
                <p className="text-sm text-neutral-500">Obteniendo información...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-card border border-emergency-200 p-8 text-center">
              <div className="w-16 h-16 bg-emergency-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-emergency-600" />
              </div>
              <h3 className="text-xl font-bold text-emergency-800 mb-2">Error al cargar</h3>
              <p className="text-emergency-600 mb-4">{error}</p>
              <button
                onClick={load}
                className="px-6 py-3 bg-emergency-600 text-white rounded-xl hover:bg-emergency-700 transition-colors font-semibold"
              >
                Reintentar
              </button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card border border-medical-100 p-12 text-center">
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
                <Link 
                  href="/dashboard/clients/new" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-health-600 to-health-700 text-white rounded-xl hover:from-health-700 hover:to-health-800 transition-all duration-200 font-semibold shadow-health"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Primer Cliente
                </Link>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              <Stagger staggerDelay={100}>
                {filteredClients.map(client => (
                  <Link
                    key={client.id}
                    href={`/dashboard/clients/${client.id}`}
                    className={`group ${viewMode === 'grid' 
                      ? 'bg-white rounded-2xl shadow-card border border-medical-100 p-6 hover:shadow-card-hover transition-all duration-200 transform hover:-translate-y-1'
                      : 'bg-white rounded-xl shadow-sm border border-medical-100 p-4 hover:shadow-md transition-all duration-200 flex items-center space-x-6'
                    }`}
                  >
                    
                    {viewMode === 'grid' ? (
                      // Vista de cards
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-medical-100 to-health-100 rounded-xl flex items-center justify-center group-hover:from-medical-200 group-hover:to-health-200 transition-colors">
                            <User className="w-6 h-6 text-medical-600" />
                          </div>
                          <div className="flex space-x-2">
                            {client.pets && client.pets.length > 0 && (
                              <Tooltip content={`${client.pets.length} mascota${client.pets.length !== 1 ? 's' : ''}`}>
                                <div className="w-8 h-8 bg-health-100 rounded-lg flex items-center justify-center">
                                  <PawPrint className="w-4 h-4 text-health-600" />
                                </div>
                              </Tooltip>
                            )}
                            {client.appointments && client.appointments.length > 0 && (
                              <Tooltip content="Tiene citas programadas">
                                <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-medical-600" />
                                </div>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h3 className="text-lg font-bold text-neutral-800 group-hover:text-medical-700 transition-colors">
                            {client.name}
                          </h3>
                          
                          <div className="space-y-2">
                            {client.email && (
                              <div className="flex items-center text-sm text-neutral-600">
                                <Mail className="w-4 h-4 mr-2 text-neutral-400" />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center text-sm text-neutral-600">
                                <Phone className="w-4 h-4 mr-2 text-neutral-400" />
                                {client.phone}
                              </div>
                            )}
                            {client.address && (
                              <div className="flex items-center text-sm text-neutral-600">
                                <MapPin className="w-4 h-4 mr-2 text-neutral-400" />
                                {client.address}
                              </div>
                            )}
                          </div>

                          {client.pets && client.pets.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-neutral-100">
                              <p className="text-xs text-neutral-500 mb-2">Mascotas:</p>
                              <div className="flex flex-wrap gap-1">
                                {client.pets.slice(0, 3).map(pet => (
                                  <span key={pet.id} className="px-2 py-1 bg-health-50 text-health-700 rounded-lg text-xs font-medium">
                                    {pet.name}
                                  </span>
                                ))}
                                {client.pets.length > 3 && (
                                  <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-lg text-xs">
                                    +{client.pets.length - 3} más
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // Vista de lista
                      <>
                        <div className="w-12 h-12 bg-gradient-to-br from-medical-100 to-health-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-medical-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-neutral-800 group-hover:text-medical-700 transition-colors truncate">
                            {client.name}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-neutral-600">
                            {client.email && (
                              <span className="flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {client.email}
                              </span>
                            )}
                            {client.phone && (
                              <span className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {client.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 flex-shrink-0">
                          {client.pets && client.pets.length > 0 && (
                            <div className="flex items-center px-3 py-1 bg-health-50 rounded-lg">
                              <PawPrint className="w-4 h-4 mr-1 text-health-600" />
                              <span className="text-sm font-medium text-health-700">{client.pets.length}</span>
                            </div>
                          )}
                          {client.appointments && client.appointments.length > 0 && (
                            <div className="flex items-center px-3 py-1 bg-medical-50 rounded-lg">
                              <Calendar className="w-4 h-4 mr-1 text-medical-600" />
                              <span className="text-sm font-medium text-medical-700">{client.appointments.length}</span>
                            </div>
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
