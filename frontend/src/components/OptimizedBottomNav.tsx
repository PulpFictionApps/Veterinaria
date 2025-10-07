"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MAIN_MENU_ITEMS } from './OptimizedSidebar';

export default function OptimizedBottomNav() {
  const pathname = usePathname();

  // Usar los elementos principales para móvil
  const mobileItems = MAIN_MENU_ITEMS;

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
    <nav aria-label="Navegación inferior" className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
      <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl px-2 py-3 flex items-center gap-1 border border-gray-100/50 shadow-primary">
        {mobileItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={`Ir a ${item.label}`}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center py-2.5 px-3 rounded-xl transition-all duration-200 text-xs min-w-0 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${
                active 
                  ? 'text-white bg-gray-700 shadow-lg shadow-gray-200/50 scale-105' 
                  : 'text-neutral-600 hover:text-gray-600 hover:bg-gray-50/70'
              }`}
            >
              <span className={`mb-1 ${active ? 'drop-shadow-sm' : ''}`}>
                <item.icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className={`text-[10px] font-semibold leading-tight ${active ? 'drop-shadow-sm' : 'font-medium'}`}>
                {item.mobileLabel || item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Botón "Más" para acceder a funciones adicionales */}
        <Link
          href="/dashboard/settings"
          aria-label="Acceder a configuración y más opciones"
          className={`flex flex-col items-center py-2.5 px-3 rounded-xl transition-all duration-200 text-xs min-w-0 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 ${
            pathname?.includes('/dashboard/settings') || 
            pathname?.includes('/dashboard/profile') ||
            pathname?.includes('/dashboard/billing')
              ? 'text-white bg-gradient-to-br from-neutral-500 to-neutral-600 shadow-lg shadow-neutral-200/50 scale-105' 
              : 'text-neutral-500 hover:text-neutral-600 hover:bg-neutral-50/70'
          }`}
        >
          <span className="text-lg mb-1" aria-hidden="true">⚙️</span>
          <span className="text-[10px] font-medium leading-tight">Más</span>
        </Link>
      </div>
    </nav>
  );
}
