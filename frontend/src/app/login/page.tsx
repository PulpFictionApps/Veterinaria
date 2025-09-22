"use client";
import { useState } from "react";
import { useAuth } from "../../lib/useAuth";
import { API_BASE } from "../../lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      console.log('🔐 Attempting login to:', `${API_BASE}/auth/login`);
      
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      console.log('📡 Login response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        login(data.token);
        router.push("/dashboard");
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        setError(errorData.error || `Error del servidor: ${res.status}`);
      }
    } catch (err: any) {
      console.error('❌ Login error:', err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError(`No se puede conectar al servidor. Verifica que la URL del backend sea correcta: ${API_BASE}`);
      } else {
        setError(`Error de conexión: ${err.message}`);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-65 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      
      {/* Debug info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <p><strong>API Base:</strong> {API_BASE}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
        <a href="/debug" className="text-blue-600 underline">🔧 Ir a Debug de Conexión</a>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-80">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}
