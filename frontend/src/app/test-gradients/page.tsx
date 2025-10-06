export default function GradientTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Test de Gradientes</h1>
      
      {/* Test with problematic Tailwind classes */}
      <div className="bg-gradient-to-r from-gray-500 to-gray-500 p-4 rounded-lg">
        <h2 className="text-white font-semibold">Tailwind: from-gray-500 to-gray-500</h2>
        <p className="text-white">Este debería verse con gradiente azul a verde</p>
      </div>
      
      {/* Test with utility classes */}
      <div className="gradient-gray-health p-4 rounded-lg">
        <h2 className="font-semibold">Utility Class: gradient-gray-health</h2>
        <p>Este debería verse con gradiente azul a verde</p>
      </div>
      
      <div className="bg-gradient-to-r from-gray-600 to-gray-600 p-4 rounded-lg">
        <h2 className="text-white font-semibold">Tailwind: from-gray-600 to-gray-600</h2>
        <p className="text-white">Este debería verse con gradiente azul oscuro a verde oscuro</p>
      </div>
      
      <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-4 rounded-lg">
        <h2 className="text-white font-semibold">Tailwind: from-gray-600 to-gray-700</h2>
        <p className="text-white">Este debería verse con gradiente azul diagonal</p>
      </div>
    </div>
  );
}
