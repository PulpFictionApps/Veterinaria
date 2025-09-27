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
    return pathname?.startsWith(href);
  };

  return (
    <nav aria-label="Navegación inferior" className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
      <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl px-2 py-2.5 flex items-center gap-1 border border-gray-100/50 shadow-pink-100/50">
        {mobileItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all text-xs min-w-0 ${
                active 
                  ? 'text-white bg-gradient-to-br from-pink-400 to-pink-500 shadow-lg shadow-pink-200/50 scale-105' 
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/70'
              }`}
            >
              <span className={`text-lg mb-0.5 ${active ? 'drop-shadow-sm' : ''}`}>
                {item.icon}
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
          aria-label="Más opciones"
          className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all text-xs min-w-0 ${
            pathname?.includes('/dashboard/settings') || 
            pathname?.includes('/dashboard/profile') ||
            pathname?.includes('/dashboard/team') ||
            pathname?.includes('/dashboard/billing')
              ? 'text-white bg-gradient-to-br from-gray-400 to-gray-500 shadow-lg shadow-gray-200/50 scale-105' 
              : 'text-gray-500 hover:text-gray-600 hover:bg-gray-50/70'
          }`}
        >
          <span className="text-lg mb-0.5">⚙️</span>
          <span className="text-[10px] font-medium leading-tight">Más</span>
        </Link>
      </div>
    </nav>
  );
}