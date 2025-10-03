
"use client";

import { useEffect, useState } from 'react';
import LazyDashboardCalendar from "../../components/LazyDashboardCalendar";
import LazyAvailabilityManager from '../../components/LazyAvailabilityManager';
import PublicLinkManager from '../../components/PublicLinkManager';
import ConsultationsPanel from '../../components/ConsultationsPanel';
import ThemedButton from '../../components/ThemedButton';
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

        // Simular ingresos semanales (esto podría venir de un endpoint específico)
        newMetrics.weeklyRevenue = newMetrics.completedAppointments * 25000; // Precio promedio
        newMetrics.pendingTasks = Math.max(0, 5 - newMetrics.availableSlots); // Lógica ejemplo

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
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-600'
    }[changeType];

    return (
      <div className="bg-white rounded-2xl p-6 shadow-card border border-medical-100 hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-neutral-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-neutral-900 transition-colors group-hover:text-medical-700">{formatValue(value)}</p>
            {change && (
              <p className={`text-sm ${changeColor} mt-2 font-medium`}>{change}</p>
            )}
          </div>
          <div className="p-4 bg-gradient-to-br from-medical-50 to-medical-100 rounded-xl group-hover:from-medical-100 group-hover:to-medical-200 transition-all duration-300">
            <Icon className="w-7 h-7 text-medical-600 group-hover:scale-110 transition-transform duration-300" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-full min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-medical-50 to-health-50">
        <div className="text-center">
          <div className="relative">
            {/* Spinner principal */}
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-medical-200 border-t-medical-600 mx-auto mb-6"></div>
            {/* Puntos animados alrededor */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-medical-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-neutral-700">Cargando panel de control</p>
            <p className="text-sm text-neutral-500">Preparando la información de tu clínica...</p>
          </div>
          {/* Skeleton cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Header con saludo animado */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-medical-600 to-health-600 bg-clip-text text-transparent">
                Panel de Control
              </h1>
              <p className="text-neutral-600 mt-2 text-lg">Bienvenido a tu clínica veterinaria</p>
            </div>
            <SlideIn direction="right" delay={200}>
              <div className="text-sm text-neutral-500 bg-white rounded-xl px-4 py-2 shadow-sm border border-medical-100">
                {new Date().toLocaleDateString('es-CL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </SlideIn>
          </div>
        </FadeIn>

        {/* Alerta de suscripción */}
        {subscription && subscription.expiresAt && new Date(subscription.expiresAt) > new Date() && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <strong className="font-semibold text-blue-900">Período de prueba activo</strong>
                  <span className="ml-2 text-sm text-blue-700">
                    Te quedan {Math.ceil((new Date(subscription.expiresAt).getTime() - Date.now()) / (1000*60*60*24))} días
                  </span>
                </div>
              </div>
              <a 
                href="/dashboard/billing" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
                change="+2 vs ayer"
                changeType="positive"
              />
            </div>,
            <div key="clients" className="xl:col-span-2">
              <MetricCard
                title="Total Clientes"
                value={metrics.totalClients}
                icon={Users}
                change="+5 este mes"
                changeType="positive"
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
              change="+12% vs semana anterior"
              changeType="positive"
            />,
            <MetricCard
              key="completed"
              title="Consultas Completadas"
              value={metrics.completedAppointments}
              icon={Stethoscope}
              change="Este mes"
              changeType="neutral"
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Enlace de Reservas</h2>
            <p className="text-sm text-gray-600 mt-1">Comparte este enlace para que tus clientes puedan agendar citas</p>
          </div>
          <div className="p-6">
            <PublicLinkManager />
          </div>
        </div>

        {/* Layout principal con consultas y calendario */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Panel de consultas - 2/3 del espacio */}
          <div className="xl:col-span-2">
            <ConsultationsPanel />
          </div>

          {/* Calendario - 1/3 del espacio */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Calendario de Citas</h2>
                <p className="text-sm text-gray-600 mt-1">Vista rápida de tu agenda</p>
              </div>
              <div className="p-6">
                {uid && <LazyDashboardCalendar userId={uid} />}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
