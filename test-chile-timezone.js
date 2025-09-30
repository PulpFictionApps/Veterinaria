// Test de timezone de Chile
// Verificar que UTC-3 (verano) y UTC-4 (invierno) funcionan correctamente

const CHILE_TIMEZONE = 'America/Santiago';

function getChileTime() {
  const now = new Date();
  const chileTimeString = now.toLocaleString("sv-SE", {timeZone: CHILE_TIMEZONE});
  const chileTime = new Date(chileTimeString);
  return chileTime;
}

function getChileOffset() {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const chileTime = new Date(now.toLocaleString("en-US", {timeZone: CHILE_TIMEZONE}));
  const offset = (chileTime.getTime() - utcTime) / (1000 * 60 * 60);
  return Math.round(offset);
}

function testTimezone() {
  console.log('🧪 Testing Chile Timezone Configuration\n');
  
  const now = new Date();
  const chileTime = getChileTime();
  const offset = getChileOffset();
  
  console.log(`⏰ UTC Time: ${now.toISOString()}`);
  console.log(`🇨🇱 Chile Time: ${chileTime.toISOString()}`);
  console.log(`📍 Current Offset: UTC${offset >= 0 ? '+' : ''}${offset}`);
  
  // Determinar si es verano o invierno
  const month = chileTime.getMonth() + 1; // 1-12
  const isSummer = month >= 10 || month <= 3; // Oct-Mar = verano
  const expectedOffset = isSummer ? -3 : -4;
  
  console.log(`🌞 Season: ${isSummer ? 'Verano (Summer)' : 'Invierno (Winter)'}`);
  console.log(`📊 Expected Offset: UTC${expectedOffset}`);
  console.log(`✅ Offset Match: ${offset === expectedOffset ? 'YES' : 'NO'}`);
  
  // Mostrar fecha formateada
  const chileFormatted = chileTime.toLocaleString('es-CL', {
    timeZone: CHILE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  console.log(`🗓️  Chile Formatted: ${chileFormatted}`);
  
  // Test de fechas específicas
  console.log('\n📅 Testing specific dates:');
  
  const testDates = [
    new Date('2025-01-15T12:00:00Z'), // Verano
    new Date('2025-07-15T12:00:00Z'), // Invierno
    new Date('2025-10-15T12:00:00Z'), // Transición a verano
    new Date('2025-03-15T12:00:00Z')  // Transición a invierno
  ];
  
  testDates.forEach(date => {
    const chileDate = new Date(date.toLocaleString("sv-SE", {timeZone: CHILE_TIMEZONE}));
    const month = chileDate.getMonth() + 1;
    const isSummer = month >= 10 || month <= 3;
    const season = isSummer ? 'Verano' : 'Invierno';
    
    console.log(`   ${date.toISOString().split('T')[0]} → ${chileDate.toISOString().split('T')[0]} (${season})`);
  });
}

testTimezone();