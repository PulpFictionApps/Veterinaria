import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthContext } from '../lib/auth-context';
import { authFetch } from '../lib/api';
import { brand } from '../lib/theme';

export default function Sidebar() {
  const pathname = usePathname();
  const { userId } = useAuthContext();
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

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/clients', label: 'Clientes', icon: '👥' },
    { href: '/dashboard/appointments', label: 'Citas', icon: '📅' },
    { href: '/dashboard/consultation-types', label: 'Tipos de Consulta', icon: '💊' },
    { href: '/dashboard/availability', label: 'Disponibilidad', icon: '⏰' },
    { href: '/plans', label: 'Planes', icon: '📦' },
  ];
  const secondary = [
    { href: '/dashboard/profile', label: 'Perfil Profesional', icon: '👨‍⚕️' },
    { href: '/dashboard/team', label: 'Equipo', icon: '👩‍⚕️' },
    { href: '/dashboard/billing', label: 'Facturación', icon: '💳' },
    { href: '/dashboard/integrations', label: 'Integraciones', icon: '🔌' },
    { href: '/dashboard/settings', label: 'Ajustes', icon: '⚙️' },
  ];
 
  return (
    <aside className="w-64 bg-white border-r border-pink-100 hidden lg:block h-full sticky top-0 shadow-sm shadow-pink-100/50">
      <div className="p-4 top-0 h-full overflow-auto">
        {/* Logo */}
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-500 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-pink-200/50">
            <span className="text-white text-sm font-bold">{brand.shortName}</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{brand.name}</h2>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname && pathname.startsWith(item.href)
                    ? 'bg-pink-50 text-pink-700 border-r-2 border-pink-400 shadow-sm shadow-pink-100/50'
                    : 'text-gray-700 hover:bg-pink-25 hover:text-pink-600'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {/* Mobile badge: show when availability count is 0 and this is the availability item */}
                  {item.href.endsWith('/availability') && availabilityCount !== null && (
                    <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${availabilityCount === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {availabilityCount === 0 ? 'Sin horarios' : `${availabilityCount}`}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-3">
            <h4 className="text-xs text-gray-400 uppercase mb-2 px-4">Cuenta</h4>
            <ul className="space-y-2">
              {secondary.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname && pathname.startsWith(item.href) ? 'bg-pink-50 text-pink-700 border-r-2 border-pink-400' : 'text-gray-700 hover:bg-pink-25 hover:text-pink-600'}`}>
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}

