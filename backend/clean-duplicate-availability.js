// Script para limpiar duplicados de disponibilidad
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanDuplicateAvailability() {
  console.log('🧹 Iniciando limpieza de duplicados de disponibilidad...\n');
  
  try {
    // Obtener todos los slots de disponibilidad agrupados por userId, start, end
    const allSlots = await prisma.availability.findMany({
      orderBy: [
        { userId: 'asc' },
        { start: 'asc' },
        { end: 'asc' },
        { id: 'asc' }
      ]
    });

    console.log(`📊 Total de slots encontrados: ${allSlots.length}`);

    // Identificar duplicados
    const duplicateGroups = {};
    const duplicateIds = [];

    allSlots.forEach(slot => {
      const key = `${slot.userId}-${slot.start.toISOString()}-${slot.end.toISOString()}`;
      
      if (!duplicateGroups[key]) {
        duplicateGroups[key] = [];
      }
      
      duplicateGroups[key].push(slot);
    });

    // Encontrar grupos con duplicados (más de 1 slot con la misma combinación)
    Object.keys(duplicateGroups).forEach(key => {
      const group = duplicateGroups[key];
      if (group.length > 1) {
        console.log(`🔍 Duplicados encontrados para ${key}:`);
        group.forEach((slot, index) => {
          console.log(`  ${index + 1}. ID: ${slot.id}, Creado: ${slot.createdAt}`);
          
          // Mantener el primer slot (más antiguo), marcar el resto para eliminación
          if (index > 0) {
            duplicateIds.push(slot.id);
          }
        });
      }
    });

    if (duplicateIds.length === 0) {
      console.log('✅ No se encontraron duplicados. Base de datos limpia.');
      return;
    }

    console.log(`\n🗑️  Se eliminarán ${duplicateIds.length} slots duplicados:`);
    duplicateIds.forEach(id => console.log(`  - ID: ${id}`));

    // Eliminar duplicados
    const deleteResult = await prisma.availability.deleteMany({
      where: {
        id: {
          in: duplicateIds
        }
      }
    });

    console.log(`\n✅ Limpieza completada. ${deleteResult.count} slots duplicados eliminados.`);

    // Verificar estado final
    const finalCount = await prisma.availability.count();
    console.log(`📊 Total de slots después de limpieza: ${finalCount}`);

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar directamente
cleanDuplicateAvailability();