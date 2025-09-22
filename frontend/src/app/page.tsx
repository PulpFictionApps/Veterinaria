"use client";

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Veterinaria - Agenda tus citas</h1>
          <p className="text-gray-600 mb-6">Prueba gratuita de 30 días. Fácil, rápido y confiable.</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="inline-block w-full sm:w-auto text-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Iniciar sesión</Link>
            <Link href="/register" className="inline-block w-full sm:w-auto text-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Registrarse</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
