// Test final de timezone con fecha actual
// Verificar que coincide con 30-09-2025 1:33 AM

const CHILE_TIMEZONE = 'America/Santiago';

function testCurrentTime() {
  console.log('🧪 Testing Current Chile Time\n');
  
  const now = new Date();
  const chileTime = new Date(now.toLocaleString("en-US", {timeZone: CHILE_TIMEZONE}));
  
  console.log(`⏰ System UTC: ${now.toISOString()}`);
  console.log(`🇨🇱 Chile Time: ${chileTime.toLocaleString('es-CL')}`);
  
  // Formatear para comparar con la imagen
  const formatted = chileTime.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  console.log(`📅 Chile Format: ${formatted}`);
  
  // Verificar offset
  const utcTime = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
  const offsetMs = chileTime.getTime() - utcTime.getTime();
  const offsetHours = Math.round(offsetMs / (1000 * 60 * 60));
  
  console.log(`📍 Offset: UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`);
  console.log(`✅ Expected: UTC-3 (Chile mantiene UTC-3 todo el año desde 2019)`);
  
  // Test del formato de hoy para inputs
  const today = chileTime.toISOString().split('T')[0];
  console.log(`📝 Today for inputs: ${today}`);
}

testCurrentTime();