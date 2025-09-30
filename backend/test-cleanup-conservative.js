// Test del script de limpieza conservadora
import { cleanupProfessionalsConservingHistory } from './cleanup-professionals-conservative.js';

console.log('🧪 Ejecutando test de limpieza conservadora...');

try {
  await cleanupProfessionalsConservingHistory();
  console.log('✅ Test completado exitosamente');
} catch (error) {
  console.error('❌ Error en el test:', error);
}