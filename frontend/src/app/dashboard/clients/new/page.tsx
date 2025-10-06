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
import ThemedCard from '../../../../components/ui/ThemedCard';
import ThemedButton from '../../../../components/ui/ThemedButton';
import ThemedInput from '../../../../components/ui/ThemedInput';
import SubscriptionGuard from '../../../../components/SubscriptionGuard';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    <SubscriptionGuard>
      <div className="w-full min-h-full bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <FadeIn>
            <ThemedCard variant="medical" padding="lg" shadow="xl" className="mb-8">
              <div className="bg-gradient-mixed p-6 sm:p-8 text-white rounded-2xl shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                  <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto">
                    <Link href="/dashboard/clients" className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10 hover:bg-white/30 transition-all group">
                      <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                    </Link>
                    <div className="w-14 h-14 sm:w-18 sm:h-18 bg-white/20 rounded-3xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm border border-white/10">
                      <UserPlus className="w-7 h-7 sm:w-9 sm:h-9 text-white drop-shadow-sm" />
                    </div>
                    <div className="min-w-0 flex-1 sm:flex-initial">
                      <h1 className="text-2xl sm:text-4xl font-black mb-2 leading-tight tracking-tight">
                        Nuevo Cliente Veterinario
                      </h1>
                      <p className="text-white/90 text-sm sm:text-lg font-medium">
                        👥 Registra la información completa del tutor de la mascota
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ThemedCard>
          </FadeIn>

          <AnimateOnView>
            <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
              <div className="bg-gradient-primary px-8 py-6">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Información del Cliente</h2>
                </div>
              </div>

            <form onSubmit={submit} className="p-8">
              {error && (
                <SlideIn direction="down" delay={0.1}>
                  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-800 font-medium">{error}</span>
                  </div>
                </SlideIn>
              )}

              <Stagger className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-3">
                      <UserPlus className="h-4 w-4" />
                      Nombre completo *
                    </label>
                    <ThemedInput
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Juan Pérez González"
                      required
                      variant="default"
                    />
                  </div>

                  <div>
                    <label htmlFor="rut" className="flex items-center gap-2 text-sm font-bold text-green-700 mb-3">
                      <CreditCard className="h-4 w-4" />
                      RUT
                    </label>
                    <ThemedInput
                      type="text"
                      id="rut"
                      value={rut}
                      onChange={(e) => setRut(e.target.value)}
                      placeholder="Ej: 12.345.678-9"
                      variant="default"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-3">
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                    <ThemedInput
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ej: juan.perez@email.com"
                      variant="default"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="flex items-center gap-2 text-sm font-bold text-green-700 mb-3">
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </label>
                    <ThemedInput
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej: +56 9 1234 5678"
                      variant="default"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-3">
                    <MapPin className="h-4 w-4" />
                    Dirección Completa
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 resize-none font-medium bg-white"
                    placeholder="Ej: Av. Providencia 1234, Departamento 501, Providencia, Santiago"
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <ThemedButton
                    variant="outline"
                    onClick={() => router.back()}
                    size="lg"
                    fullWidth
                  >
                    Cancelar
                  </ThemedButton>
                  <Tooltip content="Crear nuevo cliente veterinario">
                    <ThemedButton
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      loading={loading}
                      icon={loading ? undefined : Save}
                      iconPosition="left"
                      size="lg"
                      fullWidth
                    >
                      {loading ? 'Creando Cliente...' : 'Crear Cliente'}
                    </ThemedButton>
                  </Tooltip>
                </div>
              </Stagger>
            </form>
            </div>
          </AnimateOnView>
        </div>
      </div>
    </SubscriptionGuard>
  );
}
