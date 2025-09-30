// Test Chilean phone validation - Fixed numbers
const { formatChileanPhone, validateChileanPhone } = require('./frontend/src/lib/chilean-validation.ts');

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