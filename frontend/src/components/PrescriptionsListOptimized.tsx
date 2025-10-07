// Frontend optimizado - Acceso perpetuo con caché inteligente
import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/api';
import { Download, FileText, Clock, AlertCircle, Eye, History, ExternalLink } from 'lucide-react';

interface Medication {
  name: string;
  dose: string;
  frequency: string;
  duration?: string;
}

interface PrescriptionStats {
  accessCount: number;
  lastAccess: string | null;
  ageMonths: number;
}

interface Prescription {
  id: number;
  title: string;
  medications: Medication[];
  instructions?: string;
  createdAt: string;
  stats?: PrescriptionStats;
}

interface PrescriptionsListProps {
  petId: number;
}

export default function PrescriptionsList({ petId }: PrescriptionsListProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  useEffect(() => {
    loadPrescriptions();
  }, [petId]);

  const loadPrescriptions = async () => {
    try {
      const res = await authFetch(`/prescriptions/pet/${petId}`);
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Descargar PDF (desde caché o regenerado)
  const downloadPDF = async (prescriptionId: number) => {
    try {
      setDownloadingId(prescriptionId);
      
      const response = await authFetch(`/prescriptions/${prescriptionId}/pdf`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `receta_${prescriptionId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
        
        // Obtener información de origen del header
        const source = response.headers.get('X-PDF-Source') || 'unknown';
        const responseTime = response.headers.get('X-Response-Time') || '0ms';
        
        showNotification(
          `PDF descargado desde ${source} (${responseTime})`, 
          'success'
        );
        
        // Recargar lista para actualizar estadísticas
        loadPrescriptions();
      } else {
        throw new Error('Error descargando PDF');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al descargar el PDF', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // Ver PDF en navegador (sin descargar)
  const viewPDF = async (prescriptionId: number) => {
    try {
      setViewingId(prescriptionId);
      
      const url = `/api/prescriptions/${prescriptionId}/pdf`;
      window.open(url, '_blank');
      
      showNotification('PDF abierto en nueva pestaña', 'info');
      
      // Recargar lista para actualizar estadísticas
      setTimeout(() => loadPrescriptions(), 1000);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al abrir el PDF', 'error');
    } finally {
      setViewingId(null);
    }
  };

  // Generar enlace para compartir (WhatsApp, email)
  const generateShareLink = async (prescriptionId: number) => {
    try {
      const response = await authFetch(`/prescriptions/${prescriptionId}/download-link`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const { downloadUrl, expiresIn } = await response.json();
        
        // Copiar al portapapeles
        await navigator.clipboard.writeText(downloadUrl);
        showNotification(`Enlace copiado (válido ${expiresIn})`, 'success');
      } else {
        throw new Error('Error generando enlace');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al generar enlace para compartir', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {prescriptions.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay recetas registradas</p>
        </div>
      ) : (
        prescriptions.map((prescription) => (
          <div
            key={prescription.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {prescription.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Medicamentos:</span>
                    <ul className="mt-1 ml-4">
                      {prescription.medications.map((med, index) => (
                        <li key={index} className="list-disc">
                          <span className="font-medium">{med.name}</span> - 
                          {med.dose} ({med.frequency})
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {prescription.instructions && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Instrucciones:</span>
                      <p className="mt-1">{prescription.instructions}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {new Date(prescription.createdAt).toLocaleDateString('es-ES')}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                {/* Información de acceso histórico */}
                {prescription.stats && prescription.stats.ageMonths > 6 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-2">
                    <div className="flex items-center gap-2 text-xs text-orange-800">
                      <History className="w-3 h-3" />
                      <span className="font-medium">Receta Histórica</span>
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      {prescription.stats.ageMonths} meses • {prescription.stats.accessCount} accesos
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    onClick={() => viewPDF(prescription.id)}
                    disabled={viewingId === prescription.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    title="Ver en navegador"
                  >
                    {viewingId === prescription.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  
                  <button
                    onClick={() => downloadPDF(prescription.id)}
                    disabled={downloadingId === prescription.id}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {downloadingId === prescription.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="hidden sm:inline">Descargando...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Descargar</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => generateShareLink(prescription.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Generar enlace para compartir"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  Acceso perpetuo garantizado
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

type NotificationType = 'success' | 'error' | 'info' | 'warning';

function showNotification(message: string, type: NotificationType) {
  // Por ahora usando console, pero se puede integrar con react-toast o similar
  const emoji = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };
  
  console.log(`${emoji[type]} ${message}`);
  
  // Opcional: Mostrar alert temporal para feedback visual
  if (type === 'success') {
    // Crear notificación visual simple
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }
}