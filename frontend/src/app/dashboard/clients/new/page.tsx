"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../../lib/api';
import { 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Save,
  AlertCircle,
  Users,
  Heart
} from 'lucide-react';
import { FadeIn, SlideIn, Stagger, AnimateOnView } from '../../../../components/ui/Transitions';
import Tooltip from '../../../../components/ui/Tooltip';

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rut, setRut] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authFetch('/tutors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          rut: rut.trim() || null,
          address: address.trim() || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/clients/${data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear el cliente');
      }
    } catch (err) {
      console.error('Error creating client:', err);
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-health-50">
      <div className="max-w-4xl mx-auto p-6">
        <FadeIn>
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-medical-100 p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-medical-500 to-health-500 rounded-xl shadow-lg">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-medical-700 to-health-600 bg-clip-text text-transparent">
                    Nuevo Cliente Veterinario
                  </h1>
                  <p className="text-neutral-600 mt-1 font-medium">
                    Registra la información completa del tutor de la mascota
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <AnimateOnView>
          <div className="bg-white rounded-2xl shadow-xl border border-medical-100 overflow-hidden">
            <div className="bg-gradient-to-r from-medical-500 to-health-500 px-8 py-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Información del Cliente</h2>
              </div>
            </div>

            <form onSubmit={submit} className="p-8">
              {error && (
                <SlideIn direction="down" delay={0.1}>
                  <div className="mb-6 p-4 bg-gradient-to-r from-emergency-50 to-emergency-100 border border-emergency-200 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-emergency-500" />
                    <span className="text-emergency-800 font-medium">{error}</span>
                  </div>
                </SlideIn>
              )}

              <Stagger className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="flex items-center gap-2 text-sm font-bold text-medical-700 mb-3">
                      <UserPlus className="h-4 w-4" />
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-medical-200 rounded-xl focus:ring-4 focus:ring-medical-100 focus:border-medical-500 transition-all duration-300 font-medium"
                      placeholder="Ej: Juan Pérez González"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="rut" className="flex items-center gap-2 text-sm font-bold text-health-700 mb-3">
                      <CreditCard className="h-4 w-4" />
                      RUT
                    </label>
                    <input
                      type="text"
                      id="rut"
                      value={rut}
                      onChange={(e) => setRut(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-health-200 rounded-xl focus:ring-4 focus:ring-health-100 focus:border-health-500 transition-all duration-300 font-medium"
                      placeholder="Ej: 12.345.678-9"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-bold text-medical-700 mb-3">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-medical-200 rounded-xl focus:ring-4 focus:ring-medical-100 focus:border-medical-500 transition-all duration-300 font-medium"
                      placeholder="Ej: juan.perez@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="flex items-center gap-2 text-sm font-bold text-health-700 mb-3">
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-health-200 rounded-xl focus:ring-4 focus:ring-health-100 focus:border-health-500 transition-all duration-300 font-medium"
                      placeholder="Ej: +56 9 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="flex items-center gap-2 text-sm font-bold text-medical-700 mb-3">
                    <MapPin className="h-4 w-4" />
                    Dirección Completa
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-medical-200 rounded-xl focus:ring-4 focus:ring-medical-100 focus:border-medical-500 transition-all duration-300 resize-none font-medium"
                    placeholder="Ej: Av. Providencia 1234, Departamento 501, Providencia, Santiago"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-8 py-4 border-2 border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all duration-300 font-bold"
                  >
                    Cancelar
                  </button>
                  <Tooltip content="Crear nuevo cliente veterinario">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group flex-1 px-8 py-4 bg-gradient-to-r from-medical-500 to-health-500 text-white rounded-xl hover:from-medical-600 hover:to-health-600 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Creando...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                          Crear Cliente
                          <Heart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        </>
                      )}
                    </button>
                  </Tooltip>
                </div>
              </Stagger>
            </form>
          </div>
        </AnimateOnView>
      </div>
    </div>
  );
}
