import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import ConditionalHeader from '@/components/ConditionalHeader';
import ConditionalFooter from '@/components/ConditionalFooter';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
  <body className="app-shell bg-gradient-to-br from-slate-50 to-slate-100">
        <AuthProvider>
          <div className="flex-1 flex flex-col min-h-0">
            {/* header only shown on public pages, not dashboard */}
            <ConditionalHeader />
            <main className="flex-1 w-full mx-auto px-0 py-0 min-h-0 overflow-auto">
              <div className="w-full h-full flex min-h-0">
                <div className="w-full flex-1 flex flex-col min-h-0">
                  {children}
                </div>
              </div>
            </main>
            <ConditionalFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
