"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthContext } from '../lib/auth-context';
import { useThemeColors } from '../hooks/useThemeColors';
import { useInstallPWA } from '../hooks/useInstallPWA';
import { authFetch } from '../lib/api';
import { brand } from '../lib/constants';
import { 
  Home, 
  Calendar, 
  Users, 
  Stethoscope, 
  UserCheck, 
  Pill, 
  CreditCard, 
  Settings, 
  Smartphone 
} from 'lucide-react';

// Definición de elementos del menú unificado
export const MAIN_MENU_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, mobileLabel: 'Inicio' },
  { href: '/dashboard/calendar', label: 'Agenda', icon: Calendar, mobileLabel: 'Agenda' },
  { href: '/dashboard/clients', label: 'Clientes', icon: Users, mobileLabel: 'Clientes' },
  { href: '/dashboard/appointments', label: 'Citas Médicas', icon: Stethoscope, mobileLabel: 'Citas' },
];

export const SECONDARY_MENU_ITEMS = [
  { href: '/dashboard/profile', label: 'Perfil Profesional', icon: UserCheck },
  { href: '/dashboard/consultations', label: 'Tipos de Consulta', icon: Pill },
  { href: '/dashboard/billing', label:'Facturación', icon: CreditCard },
  { href: '/dashboard/settings', label: 'Configuración', icon: Settings },
  { href: '#install-app', label: 'Instalar App', icon: Smartphone, action: 'install' },
];

export default function OptimizedSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userId, logout } = useAuthContext();
  const { getNavigationIconStyle, primaryGradient } = useThemeColors();
  const { canInstall, isInstalled, installApp } = useInstallPWA();
  const [availabilityCount, setAvailabilityCount] = useState<number | null>(null);

  const handleInstallClick = () => {
    installApp();
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!userId) return;
      try {
        const res = await authFetch(`/availability/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setAvailabilityCount(Array.isArray(data) ? data.length : 0);
        }
      } catch (e) {
        console.error('Error fetching availability count', e);
      }
    }
    load();
    return () => { mounted = false };
  }, [userId]);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    // Para evitar conflictos, hacemos matching exacto o con path específico
    if (pathname?.startsWith(href)) {
      // Si es el path exacto o sigue la jerarquía correcta
      const remainingPath = pathname.slice(href.length);
      return remainingPath === '' || remainingPath.startsWith('/');
    }
    return false;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block h-full sticky top-0 shadow-md">
      <div className="p-6 top-0 h-full overflow-auto">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4 bg-gray-700 shadow-lg border-2 border-white/20"
          >
            <span className="text-white text-lg font-black tracking-tight">🏥</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-neutral-800 tracking-tight leading-tight">{brand.name}</h2>
            <span className="text-xs text-gray-600 font-semibold">Sistema Veterinario</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav role="navigation" aria-label="Navegación principal">
          <ul className="space-y-2">
            {MAIN_MENU_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    aria-label={`Ir a ${item.label}`}
                    className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      active
                        ? 'text-white bg-gray-600 shadow-lg border-l-4 border-white'  // PLOMO COMO PEDISTE
                        : 'text-neutral-700 hover:bg-gray-50 hover:text-gray-600'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-4" aria-hidden="true" />
                    <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                    
                    {/* Badge para disponibilidad */}
                    {item.href.includes('calendar') && availabilityCount !== null && (
                      <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        availabilityCount === 0 
                          ? 'bg-gray-100 text-gray-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {availabilityCount === 0 ? 'Sin horarios' : `${availabilityCount}`}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Secondary Navigation */}
          <div className="mt-8 border-t border-neutral-200 pt-6">
            <h4 className="text-xs text-neutral-500 uppercase mb-4 px-4 font-bold tracking-wider" id="secondary-nav-heading">Configuración</h4>
            <ul className="space-y-1.5" role="menu" aria-labelledby="secondary-nav-heading">
              {SECONDARY_MENU_ITEMS.map(item => {
                const active = isActive(item.href);
                
                // Caso especial para el botón de instalación
                if (item.action === 'install') {
                  // No mostrar si ya está instalado
                  if (isInstalled) return null;
                  
                  return (
                    <li key={item.href}>
                      <button 
                        onClick={handleInstallClick}
                        disabled={!canInstall}
                        aria-label={canInstall ? 'Instalar aplicación móvil' : 'Aplicación ya instalada'}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-semibold ${
                          canInstall 
                            ? 'animate-pulse bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg' 
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-700 disabled:opacity-50 border border-neutral-200'
                        }`}
                      >
                        <item.icon className="w-4 h-4 mr-3" aria-hidden="true" />
                        <span className="font-semibold">{item.label}</span>
                        {canInstall && <span className="ml-auto text-xs bg-white/20 text-white px-2 py-1 rounded-full font-bold">📱</span>}
                      </button>
                    </li>
                  );
                }
                
                // Elementos normales del menú
                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href}
                      role="menuitem"
                      aria-current={active ? 'page' : undefined}
                      aria-label={`Ir a ${item.label}`}
                      className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        active
                          ? 'text-white bg-gray-600 shadow-lg border-l-4 border-white'  // PLOMO COMO PEDISTE
                          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-700'
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-3" aria-hidden="true" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8 border-t border-neutral-200 pt-6">
            <h4 className="text-xs text-neutral-500 uppercase mb-4 px-4 font-bold tracking-wider">Acciones Rápidas</h4>
            <div className="space-y-3 px-4">
              <Link 
                href="/dashboard/clients/new"
                className="flex items-center justify-center w-full py-3 px-4 bg-gradient-secondary text-white rounded-xl hover:opacity-90 transition-all duration-200 text-sm font-semibold shadow-secondary"
              >
                + Nuevo Cliente
              </Link>
            </div>
          </div>

          {/* Logout */}
          <div className="mt-8 border-t border-neutral-200 pt-6">
            <div className="px-4">
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                aria-label="Cerrar sesión y salir de la aplicación"
                className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-semibold border border-gray-200 hover:border-gray-300"
              >
                <span className="text-base mr-3" aria-hidden="true">🚪</span>
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
