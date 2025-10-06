"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from '../../lib/api';
import { useAuthContext } from "../../lib/auth-context";
import { API_BASE } from "../../lib/api";
import AuthShell from '@/components/AuthShell';
import { formatChileanPhone, validateChileanPhone, formatRutChile, validateRutChile } from '../../lib/chilean-validation';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [rut, setRut] = useState("");
  const [clinicName, setClinicName] = useState("");
  // Server enforces only 'professional' registrations; default here to professional
  const [accountType, setAccountType] = useState("professional");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [rutError, setRutError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthContext();

  // Manejar cambio en teléfono con formateo
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatChileanPhone(e.target.value);
    setPhone(formatted);
    
    const validation = validateChileanPhone(formatted);
    if (!validation.isValid && formatted.length > 0) {
      setPhoneError(validation.message || 'Formato de teléfono inválido');
    } else {
      setPhoneError('');
    }
  };

  // Manejar cambio en RUT con formateo
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRutChile(e.target.value);
    setRut(formatted);
    
    const validation = validateRutChile(formatted);
    if (!validation.isValid && formatted.length > 0) {
      setRutError(validation.message || 'RUT inválido');
    } else {
      setRutError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validar campos obligatorios
    if (!fullName || !email || !password || !phone || !rut) {
      setError("Todos los campos marcados con * son obligatorios");
      setLoading(false);
      return;
    }

    // Validar teléfono
    const phoneValidation = validateChileanPhone(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.message || 'Teléfono inválido');
      setLoading(false);
      return;
    }

    // Validar RUT
    const rutValidation = validateRutChile(rut);
    if (!rutValidation.isValid) {
      setRutError(rutValidation.message || 'RUT inválido');
      setLoading(false);
      return;
    }

    try {
      const payload = { email, password, fullName, phone, professionalRut: rut, clinicName, accountType };
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token);
        // Re-read plan param at submit time (more robust) and use authFetch so token from localStorage is used
        try {
          const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
          const planParam = params?.get('plan');
          if (planParam) {
            const createRes = await authFetch('/billing/create-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ preapproval_plan_id: planParam })
            });
            const createData = await createRes.json();
            if (createRes.ok && createData.checkoutUrl) {
              window.location.href = createData.checkoutUrl;
              return;
            } else {
              console.warn('create-subscription failed after register', createData);
            }
          }
        } catch (e) {
          console.error('Error creating subscription after register', e);
        }
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
  <AuthShell title="Crear cuenta" subtitle="Crea tu cuenta para empezar a agendar y gestionar pacientes." variant="register">
      <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
                  required
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={phone}
                onChange={handlePhoneChange}
                className={`w-full px-4 py-3 border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors ${
                  phoneError ? 'border-gray-300 bg-gray-50' : 'border-gray-300'
                }`}
                required
              />
              {phoneError && (
                <p className="mt-1 text-sm text-gray-600">{phoneError}</p>
              )}
            </div>

            <div>
              <label htmlFor="rut" className="block text-sm font-medium text-gray-700 mb-2">
                RUT *
              </label>
              <input
                id="rut"
                type="text"
                placeholder="12.345.678-9"
                value={rut}
                onChange={handleRutChange}
                className={`w-full px-4 py-3 border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors ${
                  rutError ? 'border-gray-300 bg-gray-50' : 'border-gray-300'
                }`}
                required
              />
              {rutError && (
                <p className="mt-1 text-sm text-gray-600">{rutError}</p>
              )}
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
              <div role="alert" aria-live="assertive" className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
                <strong className="font-medium">Error: </strong>
                <span className="ml-1">{error}</span>
              </div>
            )}

            <button
              type="submit"
              aria-label="Crear cuenta"
              className={`w-full bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-all ${loading ? 'opacity-70 cursor-wait' : ''}`}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? '⏳ Creando cuenta...' : '🌱 Crear cuenta'}
            </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-gray-600 hover:text-gray-800 font-semibold">
            Inicia sesión aquí
          </a>
        </p>
      </div>

    </AuthShell>
  );
}
