"use client";

import { useState } from 'react';
import { API_BASE } from '../../lib/api';

export default function DebugPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, status: 'success' | 'error' | 'info', message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Check environment variables
    addResult(
      'Environment Variables',
      'info',
      `API_BASE: ${API_BASE}`,
      { 
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE 
      }
    );

    // Test 2: Basic connectivity
    try {
      const response = await fetch(`${API_BASE}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const text = await response.text();
        addResult('Basic Connectivity', 'success', `Backend is reachable: ${text}`);
      } else {
        addResult('Basic Connectivity', 'error', `Backend responded with status: ${response.status}`);
      }
    } catch (error: any) {
      addResult('Basic Connectivity', 'error', `Failed to connect: ${error.message}`, error);
    }

    // Test 3: CORS test
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' })
      });
      
      addResult('CORS Test', 'success', `CORS is working. Status: ${response.status}`);
    } catch (error: any) {
      addResult('CORS Test', 'error', `CORS failed: ${error.message}`, error);
    }

    // Test 4: Check if backend is running
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_BASE}/`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      addResult('Backend Status', 'success', `Backend is running and responding`);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        addResult('Backend Status', 'error', 'Backend timeout - might be down or slow');
      } else {
        addResult('Backend Status', 'error', `Backend error: ${error.message}`, error);
      }
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔧 Debug de Conexión API</h1>
      
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Ejecutando tests...' : 'Ejecutar Tests de Conexión'}
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded border-l-4 ${
              result.status === 'success' 
                ? 'bg-green-50 border-green-500' 
                : result.status === 'error'
                ? 'bg-red-50 border-red-500'
                : 'bg-blue-50 border-blue-500'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">{result.test}</span>
              <span className={`px-2 py-1 text-xs rounded ${
                result.status === 'success' 
                  ? 'bg-green-200 text-green-800' 
                  : result.status === 'error'
                  ? 'bg-red-200 text-red-800'
                  : 'bg-blue-200 text-blue-800'
              }`}>
                {result.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{result.message}</p>
            {result.details && (
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-600">Ver detalles</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
            <p className="text-xs text-gray-500 mt-2">{result.timestamp}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold text-yellow-800 mb-2">📋 Pasos para Solucionar:</h3>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Verifica que tu backend esté desplegado en Vercel</li>
          <li>2. Copia la URL de tu backend de Vercel</li>
          <li>3. Ve a tu proyecto frontend en Vercel → Settings → Environment Variables</li>
          <li>4. Agrega: NEXT_PUBLIC_API_BASE = https://tu-backend-url.vercel.app</li>
          <li>5. Redeploy tu frontend</li>
          <li>6. Ejecuta estos tests nuevamente</li>
        </ol>
      </div>
    </div>
  );
}
