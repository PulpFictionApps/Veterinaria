"use client";

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { brand } from '../lib/constants';

// Simple focus trap for small drawer
function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const first = containerRef.current.querySelector<HTMLElement>('a,button,input,select,textarea');
    first?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        const focusable = containerRef.current!.querySelectorAll<HTMLElement>('a,button,input,select,textarea');
        if (!focusable.length) return;
        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, containerRef]);
}

export default function Navbar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const menuOpen = search?.get('menu') === 'open';
  const [open, setOpen] = useState<boolean>(!!menuOpen);
  const containerRef = useRef<HTMLElement | null>(null);

    const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/dashboard/clients', label: 'Clientes', icon: '👥' },
    { href: '/dashboard/appointments', label: 'Citas', icon: '📅' },
    { href: '/dashboard/consultations', label: 'Consultas', icon: '�' },
    { href: '/dashboard/calendar', label: 'Calendario', icon: '�' },
  ];

  // sync state with URL
  useEffect(() => {
    const has = search?.get('menu') === 'open';
    setOpen(Boolean(has));
  }, [search]);

  // update URL when open changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (open) params.set('menu', 'open');
    else params.delete('menu');
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', url);
  }, [open]);

  // focus trap
  useFocusTrap(open, containerRef as any);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // close when route changes (with small delay to allow navigation)
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
  <nav className="bg-white/95 text-gray-700 p-3 sticky top-0 z-40 flex justify-between items-center border-b border-pink-100 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-pink-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-pink-200/50">
              <span className="text-white text-sm font-bold">{brand.shortName}</span>
            </div>
            <span className="hidden sm:inline font-semibold text-gray-800">{brand.name}</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {/* On desktop we keep Navbar minimal; Sidebar contains full nav */}
        </div>
      </nav>

      {/* Overlay + Drawer with slide animation */}
      <div id="mobile-drawer" aria-hidden={!open} className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)} />

        <aside
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          className={`absolute left-0 top-0 h-full w-72 max-w-full bg-white border-r border-pink-100 p-4 transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-pink-200/50">
                <span className="text-white text-sm font-bold">{brand.shortName}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{brand.name}</h3>
            </div>
            <button aria-label="Cerrar menú" onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-pink-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <nav>
            <ul className="space-y-1">
              {menuItems.map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${pathname && pathname.startsWith(item.href) ? 'bg-pink-50 text-pink-700' : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'}`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
}
