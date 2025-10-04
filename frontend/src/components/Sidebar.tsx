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
              // Detección de rutas activas mejorada
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname?.startsWith(item.href + '/'));
              
              // Debug temporal para ver qué está pasando
              console.log(`Item: ${item.href}, Current: ${pathname}, Active: ${isActive}`);
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    style={{
                      // ESTILOS INLINE ABSOLUTOS - imposible de sobrescribir
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      marginBottom: '4px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: isActive ? '#1F2937' : 'transparent', // Gris muy oscuro
                      color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                      borderLeft: isActive ? '4px solid #FFFFFF' : '3px solid transparent',
                      fontWeight: isActive ? '700' : '500',
                      boxShadow: isActive ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.3)' : 'none'
                    }}
                  >
                    <span className="text-lg mr-3" style={{ color: 'inherit' }}>{item.icon}</span>
                    <span className="font-medium" style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 border-t pt-3">
            <h4 className="text-xs text-white/60 uppercase mb-2 px-4">Cuenta</h4>
            <ul className="space-y-1">
              {secondary.map(item => {
                // Detección de rutas activas mejorada
                const isActive = pathname === item.href || 
                  (pathname?.startsWith(item.href + '/'));
                
                // Debug temporal para ver qué está pasando
                console.log(`Secondary Item: ${item.href}, Current: ${pathname}, Active: ${isActive}`);
                
                return (
                  <li key={item.href}>
                    <Link 
                      href={item.href} 
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      style={{
                        // ESTILOS INLINE ABSOLUTOS - imposible de sobrescribir
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        marginBottom: '4px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        backgroundColor: isActive ? '#1F2937' : 'transparent', // Gris muy oscuro
                        color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                        borderLeft: isActive ? '4px solid #FFFFFF' : '3px solid transparent',
                        fontWeight: isActive ? '700' : '500',
                        boxShadow: isActive ? 'inset 0 0 0 1px rgba(255, 255, 255, 0.3)' : 'none'
                      }}
                    >
                      <span className="text-lg mr-3" style={{ color: 'inherit' }}>{item.icon}</span>
                      <span className="font-medium" style={{ color: 'inherit', fontWeight: 'inherit' }}>{item.label}</span>
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

