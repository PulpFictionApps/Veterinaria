import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="h-screen bg-gray-50">
        <AuthProvider>
          <div className="h-full flex flex-col">
            <Header />
            {/* main should fill remaining space; on small screens be full-bleed and inner card scrolls */}
            <main className="flex-1 w-full max-w-full sm:max-w-7xl mx-auto px-0 sm:px-3 py-0 sm:py-4 flex min-h-0 pb-28 sm:pb-12">
              <div className="flex-1 min-h-0 bg-white sm:bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-sm p-4 sm:p-6 overflow-auto">
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
