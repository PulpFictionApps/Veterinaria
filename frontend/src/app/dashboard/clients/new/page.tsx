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
import PageHeader from '../../../../components/ui/PageHeader';
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
      <div className="vet-page">
        <div className="vet-container">
          <PageHeader
            title="Nuevo Cliente Veterinario"
            subtitle="👥 Registra la información completa del tutor de la mascota"
            icon={UserPlus}
            actions={
              <Link 
                href="/dashboard/clients" 
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Volver a Clientes
              </Link>
            }
          />

          <div className="vet-container space-y-8">

          <AnimateOnView>
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-8 py-6">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Información del Cliente</h2>
                </div>
              </div>            <form onSubmit={submit} className="p-8">
              {error && (
                <SlideIn direction="down" delay={0.1}>
                  <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-gray-500" />
                    <span className="text-gray-800 font-medium">{error}</span>
                  </div>
                </SlideIn>
              )}

              <Stagger className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
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
                    <label htmlFor="rut" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
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
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
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
                    <label htmlFor="phone" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
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
                  <label htmlFor="address" className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                    <MapPin className="h-4 w-4" />
                    Dirección Completa
                  </label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-gray-100 focus:border-gray-500 transition-all duration-300 resize-none font-medium bg-white"
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
      </div>
    </SubscriptionGuard>
  );
}
