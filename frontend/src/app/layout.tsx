import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="h-screen flex flex-col overflow-hidden">
        <AuthProvider>
          <Header />
          <main className="flex-1 overflow-auto max-w-6xl mx-auto px-4 py-6 sm:py-8">
            <div className="min-h-0 bg-white/60 backdrop-blur-sm rounded-lg p-4 sm:p-6 shadow-md">{children}</div>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
