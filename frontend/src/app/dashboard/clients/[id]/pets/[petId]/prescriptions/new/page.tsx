"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { authFetch } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import { FileText, ArrowLeft, Send } from 'lucide-react';

interface Pet {
  id: number;
  name: string;
  type: string;
  breed?: string;
  age?: number;
  tutor: {
    name: string;
    phone?: string;
    email?: string;
  };
}

export default function NewPrescription({ params }: { params: Promise<{ id: string; petId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const petId = Number(resolvedParams.petId);
  const [pet, setPet] = useState<Pet | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPet() {
      try {
        const res = await authFetch(`/pets/${petId}`);
        if (res.ok) {
          const petData = await res.json();
          setPet(petData);
        }
      } catch (err) {
        console.error('Error loading pet:', err);
      }
    }
    loadPet();
  }, [petId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await authFetch('/prescriptions', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          petId, 
          tutorId: pet?.tutor ? resolvedParams.id : null,
          title, 
          content, 
          sendWhatsApp 
        }) 
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.file) {
          // Open PDF in new tab
          window.open(data.file, '_blank');
        }
        router.push(`/dashboard/clients/${resolvedParams.id}/pets/${petId}/prescriptions`);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Error al crear receta' }));
        setError(errorData.error || 'Error al crear receta');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  if (!pet) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Cargando información de la mascota...</div>
      </div>
    );
  }

  return (
    <div className="vet-page">
      <PageHeader
        title="Nueva Receta Veterinaria"
        subtitle={`Crear prescripción para ${pet.name}`}
        icon={FileText}
        actions={
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
        }
      />

      <div className="vet-container">
        <div className="vet-card-unified">
          <div className="p-6">
            {/* Pet Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Información del Paciente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Nombre:</span> {pet.name}
            </div>
            <div>
              <span className="font-medium">Tipo:</span> {pet.type}
            </div>
            {pet.breed && (
              <div>
                <span className="font-medium">Raza:</span> {pet.breed}
              </div>
            )}
            {pet.age && (
              <div>
                <span className="font-medium">Edad:</span> {pet.age} años
              </div>
            )}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título de la Receta
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Tratamiento para infección, Control de dolor, etc."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Contenido de la Receta
            </label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Detalla los medicamentos, dosis, frecuencia, duración del tratamiento, instrucciones especiales, etc."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* WhatsApp Option */}
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={e => setSendWhatsApp(e.target.checked)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-gray-900">📱 Enviar por WhatsApp</div>
                <div className="text-sm text-gray-700 mt-1">
                  La receta se enviará automáticamente al tutor por WhatsApp junto con el PDF.
                  {pet.tutor.phone ? ` (${pet.tutor.phone})` : ' (No hay teléfono registrado)'}
                </div>
                {!pet.tutor.phone && (
                  <div className="text-sm text-gray-600 mt-1">
                    ⚠️ No se puede enviar por WhatsApp: falta el número de teléfono del tutor
                  </div>
                )}
              </div>
            </label>
          </div>

          {error && (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || (!pet.tutor.phone && sendWhatsApp)}
                className="flex-1 bg-medical-600 text-white px-6 py-3 rounded-lg hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> {loading ? 'Creando...' : 'Crear Receta'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
