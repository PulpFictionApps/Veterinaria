import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/clients', label: 'Clientes', icon: '👥' },
    { href: '/dashboard/appointments', label: 'Citas', icon: '📅' },
    { href: '/dashboard/availability', label: 'Disponibilidad', icon: '⏰' },
  ];
  const secondary = [
    { href: '/dashboard/team', label: 'Equipo', icon: '👩‍⚕️' },
    { href: '/dashboard/billing', label: 'Facturación', icon: '💳' },
    { href: '/dashboard/integrations', label: 'Integraciones', icon: '🔌' },
    { href: '/dashboard/settings', label: 'Ajustes', icon: '⚙️' },
  ];
 
  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden lg:block h-screen sticky top-0">
      <div className="p-4 sticky top-0 h-full overflow-auto">
        {/* Logo */}
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-sm font-bold">V</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Veterinaria</h2>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname && pathname.startsWith(item.href)
                    ? 'bg-brand-50 text-brand-700 border-r-2 border-brand-700'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-3">
            <h4 className="text-xs text-gray-400 uppercase mb-2 px-4">Cuenta</h4>
            <ul className="space-y-2">
              {secondary.map(item => (
                <li key={item.href}>
                  <Link href={item.href} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname && pathname.startsWith(item.href) ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
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
