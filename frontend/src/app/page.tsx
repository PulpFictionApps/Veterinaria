"use client";

import Link from 'next/link';

export default function HomePage() {
  return (
      <div className="flex flex-col items-center text-center">
  <h1 className="text-2xl sm:text-4xl font-bold mb-4">Vet Scheduler</h1>
        <p className="text-lg mb-6">30 días gratis, luego suscripción mensual</p>
        <div className="flex flex-col gap-4 w-64">
          <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Iniciar sesión
          </Link>
          <Link href="/register" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Registrarse
          </Link>
        </div>
      </div>

  );
}
