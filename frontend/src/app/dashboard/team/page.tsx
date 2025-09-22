"use client";

import { useEffect, useState } from 'react';
import { authFetch } from '../../../lib/api';

interface Tutor { id: number; name: string; email?: string; phone?: string; pets?: any[] }

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-2">Equipo</h1>
        <p className="text-sm text-gray-600">Estamos implementando esta funcionalidad. Pronto podrás gestionar profesionales (esta función estará disponible en la suscripción premium).</p>
        <div className="mt-6 text-sm text-gray-500">Mientras tanto, puedes gestionar permisos y cuentas desde la sección de ajustes o contactar al soporte para activación temprana.</div>
      </div>
    </div>
  );
}
