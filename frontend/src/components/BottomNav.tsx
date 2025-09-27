"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/clients', label: 'Clientes', icon: '👥' },
    { href: '/dashboard/appointments', label: 'Citas', icon: '📅' },
    { href: '/dashboard/calendar', label: 'Calendario', icon: '�' },
  ]; 
  
  return (
      <nav aria-label="Navegación inferior" className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
      <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-full px-3 py-2 flex items-center gap-2 border border-gray-100">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
              aria-label={item.label}
              className={`flex flex-col items-center py-1 px-3 rounded-md transition-colors text-xs ${pathname === item.href ? 'text-pink-600 bg-pink-50/60' : 'text-gray-600 hover:text-pink-600'}`}
          >
            <span className="text-lg mb-0">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
