"use client";

import Link from 'next/link';
import InstallButton from '../components/InstallButton';

export default function HomePage() {
  return (
    <div className="flex-1 min-h-0 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12 min-h-0 flex flex-col">
        <div className="bg-white rounded-2xl shadow-lg p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-extrabold mb-3">Agenda tus citas veterinarias en minutos</h1>
            <p className="text-gray-600 mb-6 text-lg">Gestiona pacientes, profesionales y reservas desde una interfaz simple. Ideal para clínicas pequeñas y medianas.</p>

            <div className="flex gap-3">
              <Link href="/register" className="inline-block px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition">Comenzar gratis</Link>
              <Link href="/login" className="inline-block px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Iniciar sesión</Link>
            </div>

            <div className="mt-4">
              <InstallButton inline={true} />
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">¿Cómo funciona?</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Configura tu disponibilidad y profesionales.</li>
              <li>Publica tu agenda para que clientes reserven horarios.</li>
              <li>Gestiona pacientes, historiales y prescripciones desde el dashboard.</li>
            </ol>
          </div>
        </div>

        <section className="mt-10 bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold mb-4">Características principales</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">Agenda pública</h4>
              <p className="text-sm text-gray-600">Permite a los clientes reservar sin necesidad de iniciar sesión.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">Historiales médicos</h4>
              <p className="text-sm text-gray-600">Registra diagnósticos, tratamientos y recetas por mascota.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold">Gestión de equipo</h4>
              <p className="text-sm text-gray-600">Agrega profesionales y asigna horarios fácilmente.</p>
            </div>
          </div>
        </section>

        <section className="mt-8 text-center text-sm text-gray-600">
          <p>¿Necesitas ayuda? Revisa <a href="/test-connection" className="text-gray-600 underline hover:text-gray-800 transition-colors">la página de diagnóstico</a> o contáctanos.</p>
        </section>
      </div>
    </div>
  );
}
