"use client";

import { useAuthContext } from '../../lib/auth-context';
import { useState, useEffect } from 'react';

export default function AuthDebugPage() {
  const { token, userId, login, logout } = useAuthContext();
  const [localStorageToken, setLocalStorageToken] = useState<string | null>(null);

  useEffect(() => {
    setLocalStorageToken(localStorage.getItem('token'));
  }, []);

  const testLogin = async () => {
    try {
      const response = await fetch('https://veterinaria-gamma-virid.vercel.app/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Test login response:', data);
        if (data.token) {
          login(data.token);
          setLocalStorageToken(data.token);
        }
      } else {
        console.error('Test login failed:', response.status);
      }
    } catch (error) {
      console.error('Test login error:', error);
    }
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    logout();
    setLocalStorageToken(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔐 Debug de Autenticación</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Estado del AuthProvider</h2>
          <div className="space-y-2">
            <p><strong>Token:</strong> {token ? '✅ Presente' : '❌ Ausente'}</p>
            <p><strong>User ID:</strong> {userId || 'N/A'}</p>
            <p><strong>Token Preview:</strong> {token ? token.substring(0, 20) + '...' : 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Estado del localStorage</h2>
          <div className="space-y-2">
            <p><strong>Token:</strong> {localStorageToken ? '✅ Presente' : '❌ Ausente'}</p>
            <p><strong>Token Preview:</strong> {localStorageToken ? localStorageToken.substring(0, 20) + '...' : 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Acciones de Prueba</h2>
        <div className="space-x-4">
          <button
            onClick={testLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            🔑 Probar Login
          </button>
          <button
            onClick={clearToken}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            🗑️ Limpiar Token
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            🔄 Recargar Página
          </button>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 p-4 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">🔍 Instrucciones de Debug:</h3>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Abre las herramientas de desarrollador (F12)</li>
          <li>2. Ve a la pestaña Console</li>
          <li>3. Haz clic en "Probar Login"</li>
          <li>4. Revisa los logs en la consola</li>
          <li>5. Verifica que ambos tokens coincidan</li>
        </ol>
      </div>

      <div className="mt-4">
        <a
          href="/login"
          className="text-blue-600 underline"
        >
          ← Volver al Login
        </a>
      </div>
    </div>
  );
}
