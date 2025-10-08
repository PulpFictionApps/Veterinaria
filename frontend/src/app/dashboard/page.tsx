
"use client";

import { useEffect, useState } from 'react';
import React from 'react';
import Link from 'next/link';
import LazyDashboardCalendar from "../../components/LazyDashboardCalendar";
import LazyAvailabilityManager from '../../components/LazyAvailabilityManager';
import PublicLinkManager from '../../components/PublicLinkManager';
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
import PageHeader from '../../components/ui/PageHeader';

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

interface Appointment {
  id?: number;
  date?: string;
  status?: string;
  consultationType?: { price?: number } | null;
  confirmed?: boolean;
}

export default function Dashboard() {
  const { userId: uid } = useAuthContext();
  const [subscription, setSubscription] = useState<unknown>(null);
  const getSubscriptionExpiresAt = (sub: unknown): string | null => {
    if (!sub || typeof sub !== 'object') return null;
    const s = sub as Record<string, unknown>;
    if ('expiresAt' in s && typeof s.expiresAt === 'string') return s.expiresAt;
    if ('subscription' in s && typeof s.subscription === 'object') {
      const inner = s.subscription as Record<string, unknown>;
      if ('expiresAt' in inner && typeof inner.expiresAt === 'string') return inner.expiresAt;
    }
    return null;
  };
  const [metrics, setMetrics] = useState({
    todayAppointments: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    completedAppointments: 0,
    availableSlots: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);

  // Expose loader so external events can trigger a refresh (e.g., after marking a consultation completed)
  useEffect(() => {
    let mounted = true;
    async function loadDashboardData() {
      try {
        if (!uid) return;
        setLoading(true);
        
        // Cargar datos en paralelo
        const [subRes, appointmentsRes, clientsRes, availabilityRes] = await Promise.all([
          authFetch('/account/subscription'),
          // force:true to bypass client cache and get fresh data after updates
          authFetch(`/appointments/${uid}`, { force: true }),
          authFetch('/tutors'),
          authFetch(`/availability/${uid}`, { force: true })
        ]);

        // Parse each response exactly once and reuse the parsed JSON
  let subData: unknown = null;
  let appointmentsData: unknown[] = [];
  let clientsData: unknown[] = [];
  let availabilityData: unknown[] = [];

        if (subRes && subRes.ok) {
          try { subData = await subRes.json(); } catch (e) { subData = null; }
          if (mounted && typeof subData === 'object' && subData !== null) {
            const subObj = subData as Record<string, unknown>;
            setSubscription((subObj.subscription as unknown) || null);
          }
        }

        if (appointmentsRes && appointmentsRes.ok) {
          try { appointmentsData = await appointmentsRes.json(); } catch (e) { appointmentsData = []; }
        }

        if (clientsRes && clientsRes.ok) {
          try { clientsData = await clientsRes.json(); } catch (e) { clientsData = []; }
        }

        if (availabilityRes && availabilityRes.ok) {
          try { availabilityData = await availabilityRes.json(); } catch (e) { availabilityData = []; }
        }

        // Calcular métricas
        const newMetrics = { ...metrics };

        // Use Chile timezone to compute 'today' and 'pending' consistently
        const tz = 'America/Santiago';
        const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: tz });
        if (appointmentsData && Array.isArray(appointmentsData)) {
          // Helper to safely treat unknown as Appointment
          const asAppointment = (x: unknown): Appointment => (x as Appointment);

          // Today appointments (Chile local day)
          newMetrics.todayAppointments = appointmentsData.filter((apt: unknown) => {
            const a = asAppointment(apt);
            if (!a || !a.date) return false;
            return new Date(String(a.date)).toLocaleDateString('en-CA', { timeZone: tz }) === todayKey;
          }).length;

          // Completed appointments: rely on explicit status === 'completed'
          newMetrics.completedAppointments = appointmentsData.filter((apt: unknown) => {
            const a = asAppointment(apt);
            return a && a.status === 'completed';
          }).length;

          // Ingresos mensuales: sumar precio de consultas completadas dentro del mes actual (Chile timezone)
          const currentMonthKey = new Date().toLocaleString('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit' });
          const completedThisMonth = appointmentsData.filter((apt: unknown) => {
            const a = asAppointment(apt);
            if (!a || a.status !== 'completed' || !a.consultationType) return false;
            if (!a.date) return false;
            return new Date(String(a.date)).toLocaleString('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit' }) === currentMonthKey;
          }) as Appointment[];

          // consultationType.price is stored in cents -> convert to CLP (pesos) when summing
          newMetrics.monthlyRevenue = completedThisMonth.reduce((sum: number, apt: Appointment) => {
            let priceCents = 0;
            if (apt.consultationType && typeof apt.consultationType === 'object') {
              const ct = apt.consultationType as { price?: number };
              if (ct && 'price' in ct) priceCents = Number(ct.price || 0) || 0;
            }
            const pricePesos = Math.round(priceCents / 100);
            return sum + pricePesos;
          }, 0);

          // Tareas pendientes: citas no confirmadas dentro de las próximas 24 horas
          const nowChileStr = new Date().toLocaleString('en-CA', { timeZone: tz });
          const nowChile = new Date(nowChileStr);
          const in24hChile = new Date(nowChile.getTime() + 24 * 60 * 60 * 1000);
          newMetrics.pendingTasks = appointmentsData.filter((apt: unknown) => {
            const a = asAppointment(apt);
            if (!a) return false;
            if (a.confirmed) return false;
            if (!a.date) return false;
            const aptChileStr = new Date(String(a.date)).toLocaleString('en-CA', { timeZone: tz });
            const aptChile = new Date(aptChileStr);
            return aptChile.getTime() > nowChile.getTime() && aptChile.getTime() <= in24hChile.getTime();
          }).length;
        }

        if (clientsData && Array.isArray(clientsData)) {
          newMetrics.totalClients = clientsData.length;
        }

        if (availabilityData && Array.isArray(availabilityData)) {
          // The backend already returns only future (non-expired) slots for the user.
          // Count the number of slots returned rather than re-parsing dates on the client
          // (this avoids timezone/parsing mismatches).
          newMetrics.availableSlots = availabilityData.length;
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

    // Wrap to allow re-loading from outside via event
    const reload = async () => { await loadDashboardData(); };

    // Initial load
    loadDashboardData();

    // Listen for appointment updates triggered elsewhere in the app
    const handler = () => { reload(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('appointments:updated', handler);
    }

    return () => { mounted = false; if (typeof window !== 'undefined') window.removeEventListener('appointments:updated', handler); };
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
  icon: React.FC<{ className?: string }>;
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

  const subscriptionExpiresAt = getSubscriptionExpiresAt(subscription);

  return (
    <div className="vet-page">
      <div className="vet-container space-y-8">
        
        {/* Header con saludo animado */}
        <PageHeader 
          title="Panel de Control Veterinario"
          subtitle="Centro de gestión médica profesional"
          icon={Activity}
          actions={
            <SlideIn direction="right" delay={200}>
              <div className="text-center bg-gray-100 rounded-xl p-3 sm:p-4 flex-shrink-0">
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
          }
        />

  {/* Alerta de suscripción */}
  {subscriptionExpiresAt && new Date(subscriptionExpiresAt) > new Date() && (
          <div className="vet-info-unified vet-info-blue">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0">
                  <strong className="font-semibold text-gray-900 block">Período de prueba activo</strong>
                  <span className="text-sm text-gray-700 block sm:inline sm:ml-2">
                    Te quedan {Math.ceil((new Date(subscriptionExpiresAt).getTime() - Date.now()) / (1000*60*60*24))} días
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          staggerDelay={150}
        >
          {[
            <Link key="appointments" href="/dashboard/appointments?filter=today">
              <MetricCard
                title="Citas de Hoy"
                value={metrics.todayAppointments}
                icon={Calendar}
                change={metrics.todayAppointments > 0 ? `${metrics.todayAppointments} programadas` : "Sin citas hoy"}
                changeType={metrics.todayAppointments > 0 ? "positive" : "neutral"}
              />
            </Link>,
            <Link key="clients" href="/dashboard/clients">
              <MetricCard
                title="Total Clientes"
                value={metrics.totalClients}
                icon={Users}
                change={metrics.totalClients > 0 ? "Total registrados" : "Sin clientes aún"}
                changeType="neutral"
              />
            </Link>,
            <Link key="slots" href="/dashboard/calendar">
              <MetricCard
                title="Horarios Disponibles"
                value={metrics.availableSlots}
                icon={Clock}
                change={metrics.availableSlots < 5 ? "Pocos horarios" : "Bien cubierto"}
                changeType={metrics.availableSlots < 5 ? "negative" : "positive"}
              />
            </Link>
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
                title="Ingresos Mensuales"
                value={metrics.monthlyRevenue}
                icon={DollarSign}
                format="currency"
                change={metrics.monthlyRevenue > 0 ? "Ingresos confirmados" : "Sin ingresos registrados"}
                changeType={metrics.monthlyRevenue > 0 ? "positive" : "neutral"}
              />,
            <Link key="completed" href="/dashboard/appointments?filter=past">
              <MetricCard
                title="Consultas Completadas"
                value={metrics.completedAppointments}
                icon={Stethoscope}
                change={metrics.completedAppointments > 0 ? "Atenciones realizadas" : "Sin consultas completadas"}
                changeType={metrics.completedAppointments > 0 ? "positive" : "neutral"}
              />
            </Link>,
            <Link key="tasks" href="/dashboard/appointments?filter=upcoming">
              <MetricCard
                title="Tareas Pendientes"
                value={metrics.pendingTasks}
                icon={AlertTriangle}
                change={metrics.pendingTasks > 0 ? "Requiere atención" : "Todo al día"}
                changeType={metrics.pendingTasks > 0 ? "negative" : "positive"}
              />
            </Link>
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
            {/* Calendario profesional - ocupar todo el espacio disponible */}
            <div className="xl:col-span-3">
              <div className="vet-card-unified overflow-hidden">
                <div className="vet-section-header-unified">
                  <div className="vet-section-title-unified">
                    <Calendar className="w-6 h-6" />
                    Agenda Médica
                  </div>
                </div>
                <div className="p-6 lg:p-8">
                  <p className="text-gray-600 font-medium mb-6">Vista profesional de la agenda</p>
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
