import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            {/* header kept minimal; content should be full-bleed */}
            <Header />
            <main className="flex-1 w-full mx-auto px-0 py-0 min-h-0 overflow-hidden">
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
