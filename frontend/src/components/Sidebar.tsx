import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthContext } from '../lib/auth-context';
import { authFetch } from '../lib/api';
import { brand } from '../lib/constants';

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
    { href: '/dashboard/appointments', label: 'Citas', icon: '🏥' },
    { href: '/dashboard/consultations', label: 'Consultas', icon: '💊' },
    { href: '/dashboard/calendar', label: 'Calendario', icon: '📅' },
  ];
  const secondary = [
    { href: '/dashboard/profile', label: 'Perfil Profesional', icon: '👨‍⚕️' },
    { href: '/dashboard/consultationTypes', label: 'Tipos de Consulta', icon: '🩺' },
    { href: '/dashboard/team', label: 'Equipo', icon: '👩‍⚕️' },
    { href: '/dashboard/billing', label: 'Facturación', icon: '💳' },
    { href: '/dashboard/integrations', label: 'Integraciones', icon: '🔌' },
    { href: '/dashboard/settings', label: 'Configuración', icon: '⚙️' },
  ];
 
  return (
    <aside className="w-64 hidden lg:block h-full sticky top-0 shadow-sm" style={{ background: 'var(--gradient-primary)' }}>
      <div className="p-4 top-0 h-full overflow-auto">
        {/* Logo */}
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 shadow-lg bg-gradient-primary">
            <span className="text-white text-sm font-bold">{brand.shortName}</span>
          </div>
          <h2 className="text-lg font-semibold text-white">{brand.name}</h2>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname && pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 border-t pt-3">
            <h4 className="text-xs text-white/60 uppercase mb-2 px-4">Cuenta</h4>
            <ul className="space-y-1">
              {secondary.map(item => {
                const isActive = pathname && pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href} 
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      <span className="text-lg mr-3">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
}

