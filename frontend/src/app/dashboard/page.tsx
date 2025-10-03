
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
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
            {change && (
              <p className={`text-sm ${changeColor} mt-1`}>{change}</p>
            )}
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Header con saludo */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
            <p className="text-gray-600 mt-1">Bienvenido a tu clínica veterinaria</p>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('es-CL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

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

        {/* Grid de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div className="xl:col-span-2">
            <MetricCard
              title="Citas de Hoy"
              value={metrics.todayAppointments}
              icon={Calendar}
              change="+2 vs ayer"
              changeType="positive"
            />
          </div>
          <div className="xl:col-span-2">
            <MetricCard
              title="Total Clientes"
              value={metrics.totalClients}
              icon={Users}
              change="+5 este mes"
              changeType="positive"
            />
          </div>
          <div className="xl:col-span-2">
            <MetricCard
              title="Horarios Disponibles"
              value={metrics.availableSlots}
              icon={Clock}
              change={metrics.availableSlots < 5 ? "Pocos horarios" : "Bien cubierto"}
              changeType={metrics.availableSlots < 5 ? "negative" : "positive"}
            />
          </div>
        </div>

        {/* Segunda fila de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Ingresos Semanales"
            value={metrics.weeklyRevenue}
            icon={DollarSign}
            format="currency"
            change="+12% vs semana anterior"
            changeType="positive"
          />
          <MetricCard
            title="Consultas Completadas"
            value={metrics.completedAppointments}
            icon={Stethoscope}
            change="Este mes"
            changeType="neutral"
          />
          <MetricCard
            title="Tareas Pendientes"
            value={metrics.pendingTasks}
            icon={AlertTriangle}
            change={metrics.pendingTasks > 0 ? "Requiere atención" : "Todo al día"}
            changeType={metrics.pendingTasks > 0 ? "negative" : "positive"}
          />
        </div>

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
