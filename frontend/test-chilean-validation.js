// Test de validaciones chilenas
import { formatChileanPhone, validateChileanPhone, formatRutChile, validateRutChile } from './src/lib/chilean-validation.js';

console.log('🇨🇱 TESTING VALIDACIONES CHILENAS');
console.log('='.repeat(40));

// Test de teléfonos
console.log('\n📞 TESTING TELÉFONOS:');

const phoneTests = [
  '912345678',
  '9 1234 5678', 
  '+56912345678',
  '+56 9 1234 5678',
  '221234567',
  '+56221234567',
  '+56 22 123 4567',
  '12345', // inválido
  'abc123', // inválido
];

phoneTests.forEach(phone => {
  const formatted = formatChileanPhone(phone);
  const validation = validateChileanPhone(formatted);
  console.log(`Input: "${phone}" → Formatted: "${formatted}" → ${validation.isValid ? '✅ Válido' : `❌ ${validation.message}`}`);
});

// Test de RUTs
console.log('\n🆔 TESTING RUTS:');

const rutTests = [
  '12345678-9',
  '12.345.678-9',
  '123456789',
  '12345678K',
  '12.345.678-K',
  '11111111-1',
  '12345678-0', // inválido DV
  '123', // muy corto
  'abc123', // inválido
];

rutTests.forEach(rut => {
  const formatted = formatRutChile(rut);
  const validation = validateRutChile(formatted);
  console.log(`Input: "${rut}" → Formatted: "${formatted}" → ${validation.isValid ? '✅ Válido' : `❌ ${validation.message}`}`);
});

console.log('\n✅ Tests completados');