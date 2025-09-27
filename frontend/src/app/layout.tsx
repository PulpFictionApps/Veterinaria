import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { ThemeProvider } from '../lib/theme-context';
import ConditionalHeader from '../components/ConditionalHeader';
import ConditionalFooter from '../components/ConditionalFooter';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import IOSInstallInstructions from '../components/IOSInstallInstructions';
import UpdateNotification from '../components/UpdateNotification';

export const metadata = {
  title: 'VetConnect - Sistema Veterinario',
  description: 'Sistema completo de gestión veterinaria para profesionales',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VetConnect',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'VetConnect',
    title: 'VetConnect - Sistema Veterinario',
    description: 'Sistema completo de gestión veterinaria para profesionales',
  },
  icons: {
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ec4899',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="VetConnect" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
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
                
                {/* PWA Components */}
                <PWAInstallPrompt />
                <IOSInstallInstructions />
                <UpdateNotification />
              </div>
            </ClientLayoutWrapper>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
