// Test para verificar la sincronización de tiempo con Chile
console.log('=== Verificación de Sincronización de Tiempo ===\n');

// Hora actual del servidor
const now = new Date();
console.log('Hora del servidor (UTC):', now.toISOString());
console.log('Hora del servidor (local):', now.toLocaleString());

// Hora en Chile (America/Santiago)
const chileTime = now.toLocaleString('es-CL', { 
  timeZone: 'America/Santiago',
  year: 'numeric',
  month: '2-digit', 
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

console.log('Hora en Chile (America/Santiago):', chileTime);

// Verificar si estamos en horario de verano
const chileDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
const chileTimeOnly = new Date().toLocaleTimeString('en-GB', { timeZone: 'America/Santiago' });
console.log('Fecha en Chile:', chileDate);
console.log('Hora en Chile (24h):', chileTimeOnly);

// Calcular offset de Chile respecto a UTC
const utcTime = now.getTime();
const chileOffset = new Date(now.toLocaleString('en-US', { timeZone: 'America/Santiago' })).getTime() - utcTime;
const offsetHours = Math.round(chileOffset / (1000 * 60 * 60));
console.log('Offset de Chile respecto UTC:', offsetHours, 'horas');

// Estado del horario de verano
const isDST = offsetHours === 3; // UTC-3 en verano, UTC-4 en invierno
console.log('¿Horario de verano?', isDST ? 'Sí (UTC-3)' : 'No (UTC-4)');

console.log('\n=== Verificación ===');
const currentHour = parseInt(chileTimeOnly.split(':')[0]);
const currentMinute = parseInt(chileTimeOnly.split(':')[1]);

console.log(`Hora actual en Chile: ${currentHour}:${currentMinute.toString().padStart(2, '0')}`);
console.log('Hora esperada por el usuario: 13:26');

const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (13 * 60 + 26));
console.log(`Diferencia en minutos: ${timeDiff}`);

if (timeDiff <= 5) {
  console.log('✅ Sistema sincronizado correctamente');
} else {
  console.log('❌ Sistema desincronizado');
}