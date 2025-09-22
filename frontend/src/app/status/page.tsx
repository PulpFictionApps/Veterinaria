"use client";

import { useState, useEffect } from 'react';
import { API_BASE } from '../../lib/api';

export default function StatusPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    setMessage('Verificando conexión...');
    
    try {
      const response = await fetch(`${API_BASE}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const text = await response.text();
        setStatus('success');
        setMessage('✅ Conexión exitosa!');
        setDetails({
          url: API_BASE,
          status: response.status,
          response: text,
          timestamp: new Date().toISOString()
        });
      } else {
        setStatus('error');
        setMessage(`❌ Error: Status ${response.status}`);
        setDetails({
          url: API_BASE,
          status: response.status,
          error: 'Backend responded with error status'
        });
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Error de conexión: ${error.message}`);
      setDetails({
        url: API_BASE,
        error: error.message,
        type: error.name
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">🔧 Estado de Conexión</h1>
        
        <div className="text-center mb-6">
          <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
            status === 'success' ? 'bg-green-100 text-green-800' :
            status === 'error' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status === 'checking' && '🔄 Verificando...'}
            {status === 'success' && '✅ Conectado'}
            {status === 'error' && '❌ Error'}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700">Mensaje:</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700">URL del Backend:</h3>
            <p className="text-sm text-gray-600 font-mono">{API_BASE}</p>
          </div>
          
          {details && (
            <div>
              <h3 className="font-semibold text-gray-700">Detalles:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mt-6 space-y-2">
          <button
            onClick={checkConnection}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            🔄 Probar de Nuevo
          </button>
          
          <a
            href="/login"
            className="block w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center"
          >
            🚀 Ir a Login
          </a>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Configuración Esperada:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Frontend: https://veterinaria-p918.vercel.app</li>
            <li>• Backend: https://veterinaria-gamma-virid.vercel.app</li>
            <li>• Variable: NEXT_PUBLIC_API_BASE</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
