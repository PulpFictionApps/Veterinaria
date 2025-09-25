"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Unhandled route error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-2">Algo salió mal</h1>
            <p className="text-gray-600 mb-4">Hubo un problema al cargar esta página. Intenta recargar o vuelve al dashboard.</p>

            <div className="flex gap-3">
              <button onClick={() => reset()} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg shadow-pink-200/50">Reintentar</button>
              <Link href="/dashboard" className="px-4 py-2 border rounded">Ir al dashboard</Link>
            </div>

            <div className="mt-4">
              <button onClick={() => setShowDetails(s => !s)} className="text-sm text-gray-500">{showDetails ? 'Ocultar detalles' : 'Ver detalles'}</button>
              {showDetails && (
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">{String(error?.message)}
{error?.stack}</pre>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
