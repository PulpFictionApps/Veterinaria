"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { use } from 'react';
import { authFetch } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import ThemedButton from '@/components/ui/ThemedButton';
import { Pill, ArrowLeft, Plus } from 'lucide-react';

interface Prescription {
  id: number;
  title: string;
  content: string;
  pdfUrl?: string;
  sendWhatsApp: boolean;
  whatsappSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PrescriptionsPage({ params }: { params: Promise<{ id: string; petId: string }> }) {
  const resolvedParams = use(params);
  const petId = Number(resolvedParams.petId);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`/prescriptions/pet/${petId}`);
        if (res.ok) {
          const data: Prescription[] = await res.json();
          setPrescriptions(data || []);
        }
      } catch (error) {
        console.error('Error loading prescriptions:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [petId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Cargando recetas...</div>
      </div>
    );
  }

  return (
    <div className="vet-page">
      <PageHeader
        title="Recetas Veterinarias"
        subtitle="Gestión de recetas y medicamentos"
        icon={Pill}
        actions={
          <div className="flex gap-3">
            <Link href={`/dashboard/clients/${resolvedParams.id}/pets/${petId}`}>
              <button className="text-gray-600 hover:text-gray-900 transition-colors font-medium flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
            </Link>
            <Link href="./new">
              <ThemedButton variant="primary" icon={Plus} size="sm">
                Nueva Receta
              </ThemedButton>
            </Link>
          </div>
        }
      />

      <div className="vet-container space-y-6">

      {prescriptions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recetas</h3>
          <p className="text-gray-500 mb-4">Comienza creando la primera receta para esta mascota.</p>
          <Link 
            href={`./new`} 
            className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Crear Primera Receta
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map(prescription => (
            <div key={prescription.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{prescription.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(prescription.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {prescription.pdfUrl && (
                    <a
                      href={prescription.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                    >
                      📄 Ver PDF
                    </a>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{prescription.content}</p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-4 text-sm">
                {prescription.sendWhatsApp && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">WhatsApp:</span>
                    {prescription.whatsappSent ? (
                      <span className="text-gray-600 font-medium">✅ Enviado</span>
                    ) : (
                      <span className="text-gray-600 font-medium">⏳ Pendiente</span>
                    )}
                  </div>
                )}
                {prescription.pdfUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">PDF:</span>
                    <span className="text-gray-600 font-medium">✅ Generado</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}