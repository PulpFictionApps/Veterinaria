import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { ThemeProvider } from '../lib/theme-context';
import ConditionalHeader from '../components/ConditionalHeader';
import ConditionalFooter from '../components/ConditionalFooter';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ThemeProvider>
            <ClientLayoutWrapper>
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
            </ClientLayoutWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
