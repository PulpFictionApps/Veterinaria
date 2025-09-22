"use client";

import { useState } from 'react';
import { API_BASE } from '../../lib/api';

export default function TestConnectionPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Probando conexión...\n');
    
    try {
      // Test 1: Basic connectivity
      setResult(prev => prev + `🌐 Probando: ${API_BASE}\n`);
      
      const response = await fetch(`${API_BASE}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const text = await response.text();
        setResult(prev => prev + `✅ Backend respondió: "${text}"\n`);
        setResult(prev => prev + `📊 Status: ${response.status}\n`);
        setResult(prev => prev + `🎉 ¡Conexión exitosa!\n`);
      } else {
        setResult(prev => prev + `❌ Error: Status ${response.status}\n`);
      }
    } catch (error: any) {
      setResult(prev => prev + `❌ Error de conexión: ${error.message}\n`);
      setResult(prev => prev + `🔍 Tipo de error: ${error.name}\n`);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔧 Test de Conexión Rápido</h1>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <p><strong>API Base URL:</strong> {API_BASE}</p>
        <p><strong>Backend esperado:</strong> https://veterinaria-gamma-virid.vercel.app</p>
      </div>
      
      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 mb-4"
      >
        {loading ? 'Probando...' : 'Probar Conexión'}
      </button>
      
      <div className="bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Resultado:</h3>
        <pre className="whitespace-pre-wrap text-sm">{result || 'Haz clic en "Probar Conexión"'}</pre>
      </div>
      
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">Si hay error:</h3>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Ve a Vercel → Tu proyecto frontend → Settings → Environment Variables</li>
          <li>2. Agrega: NEXT_PUBLIC_API_BASE = https://veterinaria-gamma-virid.vercel.app</li>
          <li>3. Redeploy tu frontend</li>
          <li>4. Prueba de nuevo</li>
        </ol>
      </div>
    </div>
  );
}
