// Test del script de eliminación de clientes de prueba
import { deleteTestClients } from './delete-test-clients.js';

console.log('🧪 Ejecutando eliminación de clientes de prueba...');

try {
  await deleteTestClients();
  console.log('✅ Eliminación completada exitosamente');
} catch (error) {
  console.error('❌ Error en la eliminación:', error);
}