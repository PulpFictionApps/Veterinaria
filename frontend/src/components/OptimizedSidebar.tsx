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
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-blue-200 hidden lg:block h-full sticky top-0 shadow-md">
      <div className="p-6 top-0 h-full overflow-auto">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center mr-4 bg-gradient-primary shadow-primary"
          >
            <span className="text-white text-base font-bold">{brand.shortName}</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-800 tracking-tight">{brand.name}</h2>
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
                        : 'text-neutral-700 hover:bg-blue-50 hover:text-primary'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-4" aria-hidden="true" />
                    <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                    
                    {/* Badge para disponibilidad */}
                    {item.href.includes('calendar') && availabilityCount !== null && (
                      <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        availabilityCount === 0 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
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
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                          canInstall 
                            ? 'animate-pulse bg-green-50 text-secondary hover:bg-green-100 border border-green-200' 
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-700 disabled:opacity-50'
                        }`}
                      >
                        <item.icon className="w-4 h-4 mr-3" aria-hidden="true" />
                        <span className="font-medium">{item.label}</span>
                        {canInstall && <span className="ml-auto text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">Disponible</span>}
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
                className="flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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