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
            {/* main should fill remaining space; inner card scrolls instead of body */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex min-h-0 pb-24 sm:pb-12">
              <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm p-3 sm:p-6 overflow-auto">
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
