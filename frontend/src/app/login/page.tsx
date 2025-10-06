"use client";
import { useState } from "react";
import { useAuthContext } from "../../lib/auth-context";
import { API_BASE } from "../../lib/api";
import { useRouter } from "next/navigation";
import AuthShell from '@/components/AuthShell';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        login(data.token);
        router.push("/dashboard");
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        setError(errorData.error || `Error del servidor: ${res.status}`);
      }
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError(`No se puede conectar al servidor. Verifica que la URL del backend sea correcta: ${API_BASE}`);
      } else {
        setError(`Error de conexión: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Use AuthShell to centralize the auth page layout */}
  <AuthShell title="Inicia sesión" subtitle="Accede a tu cuenta" variant="login">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoFocus
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus:border-transparent transition-colors"
                aria-describedby="email-help"
                required
              />
              <p id="email-help" className="sr-only">Usa el email con el que te registraste.</p>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus:border-transparent transition-colors"
                aria-describedby="password-help"
                required
              />
              <p id="password-help" className="sr-only">Tu contraseña debe tener al menos 8 caracteres.</p>
            </div>

            {error && (
              <div role="alert" aria-live="assertive" className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
                <strong className="font-medium">Error: </strong>
                <span className="ml-1">{error}</span>
              </div>
            )}

            <button
              type="submit"
              aria-label="Iniciar sesión"
              className={`w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? '⏳ Iniciando...' : '🚀 Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <a href="/register" className="text-gray-600 hover:text-gray-800 font-semibold transition-colors">
                Regístrate aquí
              </a>
            </p>
          </div>
        </AuthShell>
    </>
  );
}
