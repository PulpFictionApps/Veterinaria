"use client";

import Link from 'next/link';

export default function HomePage() {
  return (
      <div className="flex flex-col items-center text-center w-full px-4">
        <p className="text-base sm:text-lg mb-4">30 días gratis, luego suscripción mensual</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/login" className="w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Iniciar sesión
          </Link>
          <Link href="/register" className="w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Registrarse
          </Link>
        </div>
      </div>

  );
}
