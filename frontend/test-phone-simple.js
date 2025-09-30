// Test simple de las funciones de validación
console.log('🇨🇱 TESTING VALIDACIONES CHILENAS');
console.log('='.repeat(40));

// Funciones copiadas para test
function formatChileanPhone(value) {
  const digits = value.replace(/\D/g, '');
  
  if (digits.startsWith('56')) {
    const phoneNumber = digits.substring(2);
    if (phoneNumber.length <= 9) {
      return `+56 ${phoneNumber.substring(0, 1)} ${phoneNumber.substring(1, 5)} ${phoneNumber.substring(5)}`.trim();
    }
  }
  
  if (digits.length >= 8 && digits.length <= 9) {
    if (digits.startsWith('9') && digits.length === 9) {
      return `+56 9 ${digits.substring(1, 5)} ${digits.substring(5)}`;
    } else if (digits.length === 8) {
      return `+56 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
    }
  }
  
  if (value.startsWith('+56')) {
    return value;
  }
  
  return value;
}

function validateChileanPhone(phone) {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: 'El teléfono es obligatorio' };
  }
  
  const digits = phone.replace(/\D/g, '');
  
  if (phone.startsWith('+56')) {
    if (digits.length === 11 && digits.startsWith('569')) {
      return { isValid: true };
    } else if (digits.length === 10 && !digits.startsWith('569')) {
      return { isValid: true };
    }
  }
  
  if (digits.length === 9 && digits.startsWith('9')) {
    return { isValid: true };
  } else if (digits.length === 8) {
    return { isValid: true };
  }
  
  return { 
    isValid: false, 
    message: 'Formato inválido. Use: +56 9 XXXX XXXX (celular) o +56 XX XXX XXXX (fijo)' 
  };
}

// Tests
console.log('\n📞 TESTING TELÉFONOS:');

const phoneTests = [
  '912345678',
  '56912345678',
  '+56 9 1234 5678',
  '221234567',
  'abc123',
];

phoneTests.forEach(phone => {
  const formatted = formatChileanPhone(phone);
  const validation = validateChileanPhone(formatted);
  console.log(`"${phone}" → "${formatted}" → ${validation.isValid ? '✅' : '❌'} ${validation.message || ''}`);
});

console.log('\n✅ Tests completados');