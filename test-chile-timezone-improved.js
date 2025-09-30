// Test mejorado de timezone de Chile con API nativa

function testChileTimezoneImproved() {
  console.log('🧪 Testing Chile Timezone (Improved)\n');
  
  const now = new Date();
  
  // Usar API nativa de JavaScript para obtener el offset real
  const chileDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Santiago"}));
  const utcDate = new Date(now.toLocaleString("en-US", {timeZone: "UTC"}));
  
  // Calcular diferencia en horas
  const offsetMs = chileDate.getTime() - utcDate.getTime();
  const offsetHours = Math.round(offsetMs / (1000 * 60 * 60));
  
  console.log(`⏰ UTC Time: ${now.toISOString()}`);
  console.log(`🇨🇱 Chile Time (formatted): ${chileDate.toISOString()}`);
  console.log(`📍 Calculated Offset: UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`);
  
  // Verificar con Intl.DateTimeFormat
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  console.log(`🗓️  Chile Formatted: ${formatter.format(now)}`);
  
  // Verificar mes actual para determinar estación
  const chileMonth = parseInt(chileDate.toLocaleString("en-US", {
    timeZone: "America/Santiago",
    month: "2-digit"
  }));
  
  // En Chile: verano de octubre a marzo, invierno de abril a septiembre
  const isSummer = chileMonth >= 10 || chileMonth <= 3;
  const expectedOffset = isSummer ? -3 : -4;
  
  console.log(`🌞 Season: ${isSummer ? 'Verano (Summer)' : 'Invierno (Winter)'}`);
  console.log(`📊 Expected Offset: UTC${expectedOffset}`);
  
  // Verificación adicional usando getTimezoneOffset
  const localOffset = now.getTimezoneOffset(); // minutos
  console.log(`💻 Local System Offset: ${-localOffset/60} hours from UTC`);
  
  // Test con fechas específicas de cambio de horario
  console.log('\n📅 Testing DST transitions:');
  
  const testDates = [
    { date: '2025-01-15T15:00:00Z', desc: 'Enero (Verano)' },
    { date: '2025-07-15T15:00:00Z', desc: 'Julio (Invierno)' },
    { date: '2025-09-30T15:00:00Z', desc: 'Septiembre (Invierno)' },
    { date: '2025-10-15T15:00:00Z', desc: 'Octubre (Verano)' }
  ];
  
  testDates.forEach(test => {
    const date = new Date(test.date);
    const chileLocal = date.toLocaleString("es-CL", {timeZone: "America/Santiago"});
    console.log(`   ${test.desc}: ${date.toISOString()} → ${chileLocal}`);
  });
}

testChileTimezoneImproved();