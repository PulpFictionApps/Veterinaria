"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../lib/auth-context";
import { API_BASE } from "../../lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [accountType, setAccountType] = useState("client");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { email, password, fullName, phone, clinicName, accountType };
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token);
        router.push("/dashboard");
      } else {
        setError(data.error || 'Error al crear cuenta');
      }
    } catch (err) {
      setError("Error de conexión");
    }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 flex items-stretch justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-0 overflow-auto">
      <div className="w-full h-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">V</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Veterinaria</h1>
          <p className="text-gray-600 mt-2">Crea tu cuenta</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-none md:rounded-2xl shadow-none md:shadow-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch h-full overflow-hidden">
          <div className="hidden md:block p-6 h-full">
            <div className="h-full flex items-center justify-center text-center text-gray-600">
              <div>
                <div className="mb-4"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="4" stroke="#bbf7d0" strokeWidth="2"/><path d="M7 12h10" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                <h3 className="font-semibold text-lg">Únete a VetScheduler</h3>
                <p className="text-sm mt-2">Crea tu cuenta para empezar a agendar y gestionar pacientes.</p>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-2 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-md">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
                />
              </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:border-transparent transition-colors"
                aria-describedby="email-help"
                required
              />
              <p id="email-help" className="sr-only">Usa el email con el que te registraste.</p>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                id="phone"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700 mb-2">Nombre de la clínica (opcional)</label>
              <input
                id="clinicName"
                type="text"
                placeholder="Nombre de la clínica"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-2">Tipo de cuenta</label>
              <select
                id="accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
              >
                <option value="client">Cliente / Tutor</option>
                <option value="professional">Profesional / Clínica</option>
              </select>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus:border-transparent transition-colors"
                aria-describedby="password-help"
                required
              />
              <p id="password-help" className="sr-only">Tu contraseña debe tener al menos 8 caracteres.</p>
            </div>

            {error && (
              <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <strong className="font-medium">Error: </strong>
                <span className="ml-1">{error}</span>
              </div>
            )}

            <button
              type="submit"
              aria-label="Crear cuenta"
              className={`w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors ${loading ? 'opacity-70 cursor-wait' : ''}`}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
              </form>

              <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
                Inicia sesión aquí
              </a>
            </p>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
