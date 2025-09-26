"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthContext } from '../lib/auth-context';
import { useThemeColors } from '../hooks/useThemeColors';
import { authFetch } from '../lib/api';
import { brand } from '../lib/constants';

// Definición de elementos del menú unificado
const MAIN_MENU_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠', mobileLabel: 'Inicio' },
  { href: '/dashboard/calendar', label: 'Calendar', icon: '📅', mobileLabel: 'Agenda' },
  { href: '/dashboard/clients', label: 'Clientes', icon: '👥', mobileLabel: 'Clientes' },
  { href: '/dashboard/pets', label: 'Mascotas', icon: '🐾', mobileLabel: 'Mascotas' },
  { href: '/dashboard/records', label: 'Historial', icon: '📋', mobileLabel: 'Historial' },
  { href: '/dashboard/prescriptions', label: 'Recetas', icon: '💊', mobileLabel: 'Recetas', desktopOnly: true },
];

const SECONDARY_MENU_ITEMS = [
  { href: '/dashboard/profile', label: 'Perfil Profesional', icon: '👨‍⚕️' },
  { href: '/dashboard/consultations', label: 'Tipos de Consulta', icon: '💡' },
  { href: '/dashboard/team', label: 'Equipo', icon: '👩‍⚕️' },
  { href: '/dashboard/billing', label: 'Facturación', icon: '💳' },
  { href: '/dashboard/integrations', label: 'Integraciones', icon: '🔌' },
  { href: '/dashboard/settings', label: 'Ajustes', icon: '⚙️' },
];

export default function OptimizedSidebar() {
  const pathname = usePathname();
  const { userId } = useAuthContext();
  const { getNavigationIconStyle, primaryGradient } = useThemeColors();
  const [availabilityCount, setAvailabilityCount] = useState<number | null>(null);

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
    <aside className="w-64 bg-white border-r border-pink-100 hidden lg:block h-full sticky top-0 shadow-sm shadow-pink-100/50">
      <div className="p-4 top-0 h-full overflow-auto">
        {/* Logo */}
        <div className="flex items-center mb-6">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 shadow-lg"
            style={getNavigationIconStyle()}
          >
            <span className="text-white text-sm font-bold">{brand.shortName}</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{brand.name}</h2>
        </div>

        {/* Main Navigation */}
        <nav>
          <ul className="space-y-1">
            {MAIN_MENU_ITEMS.filter(item => !item.desktopOnly || true).map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                      active
                        ? 'text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={active ? { background: primaryGradient } : {}}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    
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
          <div className="mt-6 border-t pt-4">
            <h4 className="text-xs text-gray-400 uppercase mb-3 px-4">Configuración</h4>
            <ul className="space-y-1">
              {SECONDARY_MENU_ITEMS.map(item => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href} 
                      className={`flex items-center px-4 py-2.5 rounded-lg transition-all text-sm ${
                        active
                          ? 'text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                      style={active ? { background: primaryGradient } : {}}
                    >
                      <span className="text-base mr-3">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 border-t pt-4">
            <h4 className="text-xs text-gray-400 uppercase mb-3 px-4">Acciones Rápidas</h4>
            <div className="space-y-2 px-4">
              <Link 
                href="/dashboard/clients/new"
                className="flex items-center justify-center w-full py-2 px-3 bg-pink-50 text-pink-600 rounded-lg hover:bg-pink-100 transition-colors text-sm font-medium"
              >
                + Nuevo Cliente
              </Link>
              <Link 
                href="/dashboard/pets/new"
                className="flex items-center justify-center w-full py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
              >
                + Nueva Mascota
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}

// Export del menú para uso en otros componentes
export { MAIN_MENU_ITEMS, SECONDARY_MENU_ITEMS };