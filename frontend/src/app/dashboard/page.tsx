
"use client";

import { useEffect, useState } from 'react';
import LazyDashboardCalendar from "../../components/LazyDashboardCalendar";
import LazyAvailabilityManager from '../../components/LazyAvailabilityManager';
import PublicLinkManager from '../../components/PublicLinkManager';
import ConsultationsPanel from '../../components/ConsultationsPanel';
import { useAuthContext } from '../../lib/auth-context';
import { authFetch } from '../../lib/api';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  Stethoscope,
  DollarSign,
  Activity,
  AlertTriangle 
} from 'lucide-react';
import { FadeIn, SlideIn, Stagger, AnimateOnView } from '../../components/ui/Transitions';
import ThemedCard from '../../components/ui/ThemedCard';
import ThemedButton from '../../components/ui/ThemedButton';

interface AppointmentSummary {
  id: number;
  date: string;
  pet: { id: number; name: string };
  tutor: { id: number; name: string };
  reason: string;
}

interface ClientSummary {
  id: number;
  name: string;
  phone?: string;
  email?: string;
}

export default function Dashboard() {
  const { userId: uid } = useAuthContext();
  const [subscription, setSubscription] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    todayAppointments: 0,
    totalClients: 0,
    weeklyRevenue: 0,
    completedAppointments: 0,
    availableSlots: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadDashboardData() {
      try {
        if (!uid) return;
        setLoading(true);
        
        // Cargar datos en paralelo
        const [subRes, appointmentsRes, clientsRes, availabilityRes] = await Promise.all([
          authFetch('/account/subscription'),
          authFetch(`/appointments/${uid}`),
          authFetch('/tutors'),
          authFetch(`/availability/${uid}`)
        ]);

        if (subRes.ok) {
          const d = await subRes.json();
          if (mounted) setSubscription(d.subscription || null);
        }

        // Calcular métricas
        const newMetrics = { ...metrics };

        if (appointmentsRes.ok) {
          const appointments = await appointmentsRes.json();
          const today = new Date().toDateString();
          newMetrics.todayAppointments = appointments.filter((apt: any) => 
            new Date(apt.date).toDateString() === today
          ).length;
          newMetrics.completedAppointments = appointments.filter((apt: any) => 
            apt.status === 'completed' || new Date(apt.date) < new Date()
          ).length;
        }

        if (clientsRes.ok) {
          const clients = await clientsRes.json();
          newMetrics.totalClients = clients.length;
        }

        if (availabilityRes.ok) {
          const slots = await availabilityRes.json();
          newMetrics.availableSlots = slots.filter((slot: any) => 
            new Date(slot.end) > new Date()
          ).length;
        }

        // Calcular ingresos reales de citas completadas (si hay datos disponibles)
        if (appointmentsRes.ok) {
          const appointments = await appointmentsRes.json();
          // Solo contar citas con precio real de consulta
          const completedWithPrice = appointments.filter((apt: any) => 
            apt.status === 'completed' && apt.consultationType?.price
          );
          newMetrics.weeklyRevenue = completedWithPrice.reduce((sum: number, apt: any) => 
            sum + (apt.consultationType.price || 0), 0
          );
        }
        
        // Tareas pendientes reales basadas en citas próximas sin confirmar
        if (appointmentsRes.ok) {
          const appointments = await appointmentsRes.json();
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          newMetrics.pendingTasks = appointments.filter((apt: any) => 
            new Date(apt.date) <= tomorrow && !apt.confirmed
          ).length;
        }

        if (mounted) {
          setMetrics(newMetrics);
          setLoading(false);
        }

      } catch (err) {
        console.error('Error loading dashboard data', err);
        if (mounted) setLoading(false);
      }
    }
    
    loadDashboardData();
    return () => { mounted = false };
  }, [uid]);

  // Componente de tarjeta de métrica
  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType = 'positive',
    format = 'number' 
  }: {
    title: string;
    value: number;
    icon: any;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    format?: 'number' | 'currency';
  }) => {
    const formatValue = (val: number) => {
      if (format === 'currency') {
        return new Intl.NumberFormat('es-CL', {
          style: 'currency',
          currency: 'CLP',
          minimumFractionDigits: 0
        }).format(val);
      }
      return val.toLocaleString('es-CL');
    };

    const changeColor = {
      positive: 'text-gray-600',
      negative: 'text-gray-600',
      neutral: 'text-gray-600'
    }[changeType];

    return (
      <div className="vet-card-unified p-4 sm:p-6 group cursor-pointer">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide truncate">{title}</p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 transition-colors group-hover:text-gray-700 mb-1 leading-tight">{formatValue(value)}</p>
            {change && (
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  changeType === 'positive' ? 'bg-gray-500' : 
                  changeType === 'negative' ? 'bg-gray-600' : 'bg-gray-400'
                }`} />
                <p className={`text-xs font-semibold ${changeColor} truncate`}>{change}</p>
              </div>
            )}
          </div>
          <div className="p-3 sm:p-4 bg-gray-100 rounded-lg transition-all duration-300 flex-shrink-0">
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 transition-transform duration-300" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="vet-page">
        <div className="vet-container">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                {/* Spinner principal */}
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-600 mx-auto mb-6"></div>
                {/* Puntos animados alrededor */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-700">Cargando panel de control</p>
                <p className="text-sm text-gray-500">Preparando la información de tu clínica...</p>
              </div>
              {/* Skeleton cards */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                {[1, 2, 3].map(i => (
                  <div key={i} className="vet-card-unified p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-page">
      <div className="vet-container space-y-8">
        
        {/* Header con saludo animado */}
        <FadeIn>
          <div className="vet-card-unified overflow-hidden">
            <div className="vet-section-header-unified">
              <div className="vet-section-title-unified">
                <Activity className="w-8 h-8 sm:w-10 sm:h-10" />
                Panel de Control Veterinario
              </div>
            </div>
            <div className="p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-base sm:text-lg font-medium">Centro de gestión médica profesional</p>
                </div>
                <SlideIn direction="right" delay={200}>
                  <div className="text-center bg-gray-100 rounded-xl p-3 sm:p-4 flex-shrink-0 w-full sm:w-auto">
                    <div className="text-xs sm:text-sm font-bold text-gray-600 mb-1">
                      {new Date().toLocaleDateString('es-CL', { weekday: 'long' }).toUpperCase()}
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-gray-800">
                      {new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {new Date().getFullYear()}
                    </div>
                  </div>
                </SlideIn>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Alerta de suscripción */}
        {subscription && subscription.expiresAt && new Date(subscription.expiresAt) > new Date() && (
          <div className="vet-info-unified vet-info-blue">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <strong className="font-semibold text-gray-900 block">Período de prueba activo</strong>
                  <span className="text-sm text-gray-700 block sm:inline sm:ml-2">
                    Te quedan {Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000*60*60*24))} días
                  </span>
                </div>
              </div>
              <a 
                href="/dashboard/billing" 
                className="vet-btn-unified vet-btn-primary-unified text-sm w-full sm:w-auto"
              >
                Actualizar Plan
              </a>
            </div>
          </div>
        )}

        {/* Grid de métricas con animaciones */}
        <Stagger 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
          staggerDelay={150}
        >
          {[
            <div key="appointments" className="xl:col-span-2">
              <MetricCard
                title="Citas de Hoy"
                value={metrics.todayAppointments}
                icon={Calendar}
                change={metrics.todayAppointments > 0 ? `${metrics.todayAppointments} programadas` : "Sin citas hoy"}
                changeType={metrics.todayAppointments > 0 ? "positive" : "neutral"}
              />
            </div>,
            <div key="clients" className="xl:col-span-2">
              <MetricCard
                title="Total Clientes"
                value={metrics.totalClients}
                icon={Users}
                change={metrics.totalClients > 0 ? "Total registrados" : "Sin clientes aún"}
                changeType="neutral"
              />
            </div>,
            <div key="slots" className="xl:col-span-2">
              <MetricCard
                title="Horarios Disponibles"
                value={metrics.availableSlots}
                icon={Clock}
                change={metrics.availableSlots < 5 ? "Pocos horarios" : "Bien cubierto"}
                changeType={metrics.availableSlots < 5 ? "negative" : "positive"}
              />
            </div>
          ]}
        </Stagger>

        {/* Segunda fila de métricas con animaciones */}
        <Stagger 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          delay={500}
          staggerDelay={100}
        >
          {[
            <MetricCard
              key="revenue"
              title="Ingresos Semanales"
              value={metrics.weeklyRevenue}
              icon={DollarSign}
              format="currency"
              change={metrics.weeklyRevenue > 0 ? "Ingresos confirmados" : "Sin ingresos registrados"}
              changeType={metrics.weeklyRevenue > 0 ? "positive" : "neutral"}
            />,
            <MetricCard
              key="completed"
              title="Consultas Completadas"
              value={metrics.completedAppointments}
              icon={Stethoscope}
              change={metrics.completedAppointments > 0 ? "Atenciones realizadas" : "Sin consultas completadas"}
              changeType={metrics.completedAppointments > 0 ? "positive" : "neutral"}
            />,
            <MetricCard
              key="tasks"
              title="Tareas Pendientes"
              value={metrics.pendingTasks}
              icon={AlertTriangle}
              change={metrics.pendingTasks > 0 ? "Requiere atención" : "Todo al día"}
              changeType={metrics.pendingTasks > 0 ? "negative" : "positive"}
            />
          ]}
        </Stagger>

        {/* Gestión de enlaces públicos */}
        <AnimateOnView>
          <div className="vet-card-unified overflow-hidden">
            <div className="vet-section-header-unified">
              <div className="vet-section-title-unified">
                <TrendingUp className="w-6 h-6" />
                Sistema de Reservas Online
              </div>
            </div>
            <div className="p-6 lg:p-8">
              <p className="text-gray-600 font-medium mb-6">Enlace público para que tus clientes reserven citas</p>
              <PublicLinkManager />
            </div>
          </div>
        </AnimateOnView>

        {/* Layout principal con consultas y calendario */}
        <AnimateOnView>
          <div className="vet-grid-responsive">
            {/* Panel de consultas - 2/3 del espacio */}
            <div className="xl:col-span-2">
              <ConsultationsPanel />
            </div>

            {/* Calendario - 1/3 del espacio */}
            <div className="xl:col-span-1">
              <div className="vet-card-unified overflow-hidden">
                <div className="vet-section-header-unified">
                  <div className="vet-section-title-unified">
                    <Calendar className="w-6 h-6" />
                    Agenda Médica
                  </div>
                </div>
                <div className="p-6 lg:p-8">
                  <p className="text-gray-600 font-medium mb-6">Vista general de citas programadas</p>
                  {uid && <LazyDashboardCalendar userId={uid} />}
                </div>
              </div>
            </div>
          </div>
        </AnimateOnView>

      </div>
    </div>
  );
}
