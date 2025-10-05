export default function GradientTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Test de Gradientes</h1>
      
      {/* Test with problematic Tailwind classes */}
      <div className="bg-gradient-to-r from-medical-500 to-health-500 p-4 rounded-lg">
        <h2 className="text-white font-semibold">Tailwind: from-medical-500 to-health-500</h2>
        <p className="text-white">Este debería verse con gradiente azul a verde</p>
      </div>
      
      {/* Test with utility classes */}
      <div className="gradient-medical-health p-4 rounded-lg">
        <h2 className="font-semibold">Utility Class: gradient-medical-health</h2>
        <p>Este debería verse con gradiente azul a verde</p>
      </div>
      
      <div className="bg-gradient-to-r from-medical-600 to-health-600 p-4 rounded-lg">
        <h2 className="text-white font-semibold">Tailwind: from-medical-600 to-health-600</h2>
        <p className="text-white">Este debería verse con gradiente azul oscuro a verde oscuro</p>
      </div>
      
      <div className="bg-gradient-to-br from-medical-600 to-medical-700 p-4 rounded-lg">
        <h2 className="text-white font-semibold">Tailwind: from-medical-600 to-medical-700</h2>
        <p className="text-white">Este debería verse con gradiente azul diagonal</p>
      </div>
    </div>
  );
}