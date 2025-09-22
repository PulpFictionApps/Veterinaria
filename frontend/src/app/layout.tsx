import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="app-shell bg-gray-50">
        <AuthProvider>
          <div className="flex-1 flex flex-col min-h-0">
            {/* header kept minimal; content should be full-bleed */}
            <Header />
            <main className="flex-1 w-full mx-auto px-0 py-0 min-h-0 overflow-auto">
              <div className="w-full h-full flex min-h-0">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
