// Utilidades para formateo y validación de teléfonos chilenos
export function formatChileanPhone(value: string): string {
  // Remover todo lo que no sea dígito
  const digits = value.replace(/\D/g, '');
  
  // Si empieza con 56, es formato internacional
  if (digits.startsWith('56')) {
    const phoneNumber = digits.substring(2);
    if (phoneNumber.length <= 9) {
      return `+56 ${phoneNumber.substring(0, 1)} ${phoneNumber.substring(1, 5)} ${phoneNumber.substring(5)}`.trim();
    }
  }
  
  // Si empieza con 9 (celular) y tiene 9 dígitos
  if (digits.startsWith('9') && digits.length === 9) {
    // Celular: 9 XXXX XXXX
    return `+56 9 ${digits.substring(1, 5)} ${digits.substring(5)}`;
  }
  
  // Si tiene 8-9 dígitos y no empieza con 9 (teléfono fijo)
  if (digits.length >= 8 && digits.length <= 9 && !digits.startsWith('9')) {
    if (digits.length === 8) {
      // Fijo: XX XXX XXXX  
      return `+56 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`;
    } else if (digits.length === 9) {
      // Fijo con área: XXX XXX XXX
      return `+56 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
    }
  }
  
  // Si ya tiene el formato correcto, mantenerlo
  if (value.startsWith('+56')) {
    return value;
  }
  
  return value; // Devolver sin formateo si no cumple patrones
}

export function validateChileanPhone(phone: string): { isValid: boolean; message?: string } {
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
  
  return { 
    isValid: false, 
    message: 'Formato inválido. Use: +56 9 XXXX XXXX (celular) o +56 XX XXX XXXX (fijo)' 
  };
}

export function formatRutChile(value: string): string {
  // Remover todo lo que no sea dígito o K
  let rut = value.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (rut.length <= 1) return rut;
  
  // Separar dígito verificador
  const dv = rut.slice(-1);
  const numbers = rut.slice(0, -1);
  
  // Formatear números con puntos
  const formattedNumbers = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedNumbers}-${dv}`;
}

export function validateRutChile(rut: string): { isValid: boolean; message?: string } {
  if (!rut || rut.trim() === '') {
    return { isValid: false, message: 'El RUT es obligatorio' };
  }
  
  // Limpiar RUT
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (cleanRut.length < 2) {
    return { isValid: false, message: 'RUT debe tener al menos 2 caracteres' };
  }
  
  const dv = cleanRut.slice(-1);
  const numbers = cleanRut.slice(0, -1);
  
  // Validar que numbers sea solo dígitos
  if (!/^\d+$/.test(numbers)) {
    return { isValid: false, message: 'RUT debe contener solo números y dígito verificador' };
  }
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = numbers.length - 1; i >= 0; i--) {
    sum += parseInt(numbers[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDv = 11 - (sum % 11);
  const finalDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();
  
  if (dv !== finalDv) {
    return { isValid: false, message: 'RUT inválido - dígito verificador incorrecto' };
  }
  
  return { isValid: true };
}