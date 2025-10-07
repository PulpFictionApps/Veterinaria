// Test script para verificar la lógica de navegación
const testNavigationLogic = () => {
  // Función isActive corregida
  const isActive = (pathname, href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    // Para evitar conflictos, hacemos matching exacto o con path específico
    if (pathname?.startsWith(href)) {
      // Si es el path exacto o sigue la jerarquía correcta
      const remainingPath = pathname.slice(href.length);
      return remainingPath === '' || remainingPath.startsWith('/');
    }
    return false;
  };

  // Casos de prueba
  const testCases = [
    // Dashboard principal
    { pathname: '/dashboard', href: '/dashboard', expected: true },
    { pathname: '/dashboard/calendar', href: '/dashboard', expected: false },
    
    // Clientes
    { pathname: '/dashboard/clients', href: '/dashboard/clients', expected: true },
    { pathname: '/dashboard/clients/123', href: '/dashboard/clients', expected: true },
    { pathname: '/dashboard/clients/123/pet/new', href: '/dashboard/clients', expected: true },
    
    // Facturación NO debe activarse con clientes
    { pathname: '/dashboard/clients', href: '/dashboard/billing', expected: false },
    { pathname: '/dashboard/clients/123', href: '/dashboard/billing', expected: false },
    
    // Facturación SÍ debe activarse con sus propios paths
    { pathname: '/dashboard/billing', href: '/dashboard/billing', expected: true },
    { pathname: '/dashboard/billing/reports', href: '/dashboard/billing', expected: true },
    
    // Otros tests
    { pathname: '/dashboard/calendar', href: '/dashboard/calendar', expected: true },
    { pathname: '/dashboard/calendar/week', href: '/dashboard/calendar', expected: true },
    { pathname: '/dashboard/appointments', href: '/dashboard/appointments', expected: true },
    { pathname: '/dashboard/appointments/123', href: '/dashboard/appointments', expected: true },
  ];

  console.log('Testing navigation logic...\n');
  
  let passed = 0;
  let failed = 0;

  testCases.forEach(({ pathname, href, expected }, index) => {
    const result = isActive(pathname, href);
    const status = result === expected ? '✅ PASS' : '❌ FAIL';
    
    if (result === expected) {
      passed++;
    } else {
      failed++;
      console.log(`${status} Test ${index + 1}: pathname="${pathname}", href="${href}"`);
      console.log(`  Expected: ${expected}, Got: ${result}`);
    }
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! Navigation logic is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Navigation logic needs adjustment.');
  }
};

// Ejecutar las pruebas
testNavigationLogic();