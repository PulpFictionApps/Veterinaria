// Test Chilean phone validation - Fixed numbers (JavaScript version)

function formatChileanPhone(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  // Extraer solo dígitos
  const digits = value.replace(/\D/g, '');
  
  // Si empieza con 56, quitar el prefijo de país
  const cleanDigits = digits.startsWith('56') ? digits.slice(2) : digits;
  
  // Si es celular (9 dígitos empezando con 9)
  if (cleanDigits.length === 9 && cleanDigits.startsWith('9')) {
    return `+56 9 ${cleanDigits.slice(1, 5)} ${cleanDigits.slice(5)}`;
  }
  
  // Si tiene 8-9 dígitos y no empieza con 9 (teléfono fijo)
  if (cleanDigits.length >= 8 && cleanDigits.length <= 9 && !cleanDigits.startsWith('9')) {
    if (cleanDigits.length === 8) {
      // Fijo: XX XXX XXXX  
      return `+56 ${cleanDigits.substring(0, 2)} ${cleanDigits.substring(2, 5)} ${cleanDigits.substring(5)}`;
    } else if (cleanDigits.length === 9) {
      // Fijo con área: XXX XXX XXX
      return `+56 ${cleanDigits.substring(0, 3)} ${cleanDigits.substring(3, 6)} ${cleanDigits.substring(6)}`;
    }
  }
  
  // Si ya tiene el formato correcto, mantenerlo
  if (value.startsWith('+56')) {
    return value;
  }
  
  return value; // Devolver sin formateo si no cumple patrones
}

function validateChileanPhone(phone) {
  if (!phone || phone.trim() === '') {
    return { isValid: false, message: 'El teléfono es obligatorio' };
  }
  
  // Extraer solo dígitos
  const digits = phone.replace(/\D/g, '');
  
  // Validar formato internacional completo (+56...)
  if (phone.startsWith('+56')) {
    if (digits.length === 11 && digits.startsWith('569')) {
      return { isValid: true }; // Celular: +56 9 XXXX XXXX
    } else if ((digits.length === 10 || digits.length === 11) && !digits.startsWith('569')) {
      return { isValid: true }; // Fijo: +56 XX XXX XXXX o +56 XXX XXX XXX
    }
  }
  
  // Validar formato nacional
  if (digits.length === 9 && digits.startsWith('9')) {
    return { isValid: true }; // Celular: 9XXXXXXXX
  } else if (digits.length >= 8 && digits.length <= 9 && !digits.startsWith('9')) {
    return { isValid: true }; // Fijo: XXXXXXXX o XXXXXXXXX
  }
  
  return { isValid: false, message: 'Formato de teléfono chileno inválido' };
}

// Tests
const testCases = [
  // Cellular
  "912345678",        // Should format to +56 9 1234 5678
  "56912345678",      // Should format to +56 9 1234 5678
  "+56 9 1234 5678",  // Should stay the same
  
  // Fixed 8 digits
  "22123456",         // Should format to +56 22 123 456
  "32987654",         // Should format to +56 32 987 654
  
  // Fixed 9 digits (with area code)
  "223123456",        // Should format to +56 223 123 456
  "329876543",        // Should format to +56 329 876 543
  
  // Invalid
  "abc123",
  "123"
];

console.log("🧪 Testing Chilean Phone Validation & Formatting:\n");

testCases.forEach(phone => {
  const formatted = formatChileanPhone(phone);
  const validation = validateChileanPhone(formatted);
  
  console.log(`📱 "${phone}" → "${formatted}" → ${validation.isValid ? '✅' : '❌'}`);
  if (!validation.isValid && validation.message) {
    console.log(`   Error: ${validation.message}`);
  }
});