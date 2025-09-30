// Test completo de cambios de horario en Chile
// Verificar transiciones de horario de verano/invierno

const CHILE_TIMEZONE = 'America/Santiago';

function getChileDSTTransitions(year) {
  // Find first Saturday of September (summer starts)
  const septFirst = new Date(year, 8, 1); // September 1st
  const septFirstSaturday = new Date(year, 8, 1 + (6 - septFirst.getDay()) % 7);
  
  // Find first Saturday of April (winter starts)
  const aprilFirst = new Date(year, 3, 1); // April 1st
  const aprilFirstSaturday = new Date(year, 3, 1 + (6 - aprilFirst.getDay()) % 7);
  
  return {
    summerStart: septFirstSaturday,
    winterStart: aprilFirstSaturday
  };
}

function getChileOffset(date = new Date()) {
  const utcTime = new Date(date.toLocaleString("en-US", {timeZone: "UTC"}));
  const chileTime = new Date(date.toLocaleString("en-US", {timeZone: CHILE_TIMEZONE}));
  
  const offsetMs = chileTime.getTime() - utcTime.getTime();
  const offsetHours = Math.round(offsetMs / (1000 * 60 * 60));
  
  return offsetHours;
}

function testChileDST() {
  console.log('🧪 Testing Chile DST Transitions\n');
  
  const year = 2025;
  const transitions = getChileDSTTransitions(year);
  
  console.log(`📅 DST Transitions for ${year}:`);
  console.log(`   🌞 Summer starts: ${transitions.summerStart.toLocaleDateString('es-CL')} (UTC-3)`);
  console.log(`   ❄️  Winter starts: ${transitions.winterStart.toLocaleDateString('es-CL')} (UTC-4)`);
  
  // Test current time
  const now = new Date();
  const currentOffset = getChileOffset(now);
  const currentSeason = currentOffset === -3 ? 'Verano' : 'Invierno';
  
  console.log(`\n⏰ Current Status (${now.toLocaleDateString('es-CL')}):`);
  console.log(`   🇨🇱 Offset: UTC${currentOffset}`);
  console.log(`   🌡️  Season: ${currentSeason}`);
  
  // Test specific dates around transitions
  console.log('\n🔄 Testing specific dates:');
  
  const testDates = [
    { date: new Date(2025, 0, 15), desc: 'Enero (Verano)' },
    { date: new Date(2025, 2, 15), desc: 'Marzo (Verano)' },
    { date: new Date(2025, 3, 15), desc: 'Abril (Invierno)' },
    { date: new Date(2025, 5, 15), desc: 'Junio (Invierno)' },
    { date: new Date(2025, 7, 15), desc: 'Agosto (Invierno)' },
    { date: new Date(2025, 8, 15), desc: 'Septiembre (Verano)' },
    { date: new Date(2025, 10, 15), desc: 'Noviembre (Verano)' }
  ];
  
  testDates.forEach(test => {
    const offset = getChileOffset(test.date);
    const season = offset === -3 ? 'Verano' : 'Invierno';
    const chileTime = test.date.toLocaleString('es-CL', {
      timeZone: CHILE_TIMEZONE,
      hour12: false
    });
    
    console.log(`   ${test.desc}: UTC${offset} (${season}) - ${chileTime}`);
  });
  
  // Verify we're currently in the correct season for September 30
  console.log('\n✅ Verification:');
  console.log(`   September 30, 2025 should be in Verano (UTC-3) since summer starts first Saturday of September`);
  console.log(`   Current offset: UTC${currentOffset} - ${currentOffset === -3 ? '✅ CORRECT' : '❌ INCORRECT'}`);
}

testChileDST();