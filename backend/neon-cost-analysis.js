/**
 * Análisis de costos de Neon para el sistema de recordatorios automáticos
 * Basado en precios de Neon (Septiembre 2025)
 */

// PRECIOS DE NEON (USD)
const NEON_PRICING = {
  // Plan Free
  free: {
    storage: { limit: '512 MB', cost: 0 },
    compute: { limit: '191.7 horas/mes', cost: 0 },
    branches: { limit: 1, cost: 0 }
  },
  
  // Plan Launch ($19/mes)
  launch: {
    storage: { limit: '10 GB', cost: 19, additionalPerGB: 0.15 },
    compute: { limit: '191.7 horas/mes', cost: 19, additionalPerHour: 0.16 },
    branches: { limit: 3, cost: 19 }
  },
  
  // Plan Scale ($69/mes)
  scale: {
    storage: { limit: '50 GB', cost: 69, additionalPerGB: 0.15 },
    compute: { limit: '750 horas/mes', cost: 69, additionalPerHour: 0.16 },
    branches: { limit: 10, cost: 69 }
  }
};

// CONFIGURACIÓN ACTUAL DEL SISTEMA
const SYSTEM_CONFIG = {
  reminderInterval: 10, // minutos
  queriesPerCheck: 3, // recordatorios 24h, 1h, y limpieza
  avgQueryTime: 0.002, // 2ms por consulta (estimado)
  hoursPerDay: 24,
  daysPerMonth: 30
};

// CÁLCULOS DE USO
function calculateUsage() {
  const checksPerHour = 60 / SYSTEM_CONFIG.reminderInterval;
  const checksPerDay = checksPerHour * SYSTEM_CONFIG.hoursPerDay;
  const checksPerMonth = checksPerDay * SYSTEM_CONFIG.daysPerMonth;
  
  const queriesPerMonth = checksPerMonth * SYSTEM_CONFIG.queriesPerCheck;
  const computeTimePerMonth = (queriesPerMonth * SYSTEM_CONFIG.avgQueryTime) / 3600; // convertir a horas
  
  return {
    checksPerHour,
    checksPerDay,
    checksPerMonth,
    queriesPerMonth,
    computeTimePerMonth
  };
}

// ANÁLISIS DE COSTOS
function analyzeCosts() {
  const usage = calculateUsage();
  
  console.log('='.repeat(60));
  console.log('📊 ANÁLISIS DE COSTOS NEON - SISTEMA DE RECORDATORIOS');
  console.log('='.repeat(60));
  
  console.log('\n🔄 USO DEL SISTEMA:');
  console.log(`• Verificaciones por hora: ${usage.checksPerHour}`);
  console.log(`• Verificaciones por día: ${usage.checksPerDay}`);
  console.log(`• Verificaciones por mes: ${usage.checksPerMonth.toLocaleString()}`);
  console.log(`• Consultas SQL por mes: ${usage.queriesPerMonth.toLocaleString()}`);
  console.log(`• Tiempo de cómputo por mes: ${usage.computeTimePerMonth.toFixed(4)} horas`);
  
  console.log('\n💰 ANÁLISIS DE COSTOS POR PLAN:');
  
  // Plan Free
  console.log('\n🆓 PLAN FREE ($0/mes):');
  if (usage.computeTimePerMonth <= 191.7) {
    console.log(`✅ Cómputo: ${usage.computeTimePerMonth.toFixed(4)}h / 191.7h límite`);
    console.log('✅ COSTO ADICIONAL: $0 USD');
    console.log('✅ Tu sistema automático NO genera costos adicionales');
  } else {
    const excessHours = usage.computeTimePerMonth - 191.7;
    console.log(`❌ Cómputo: ${usage.computeTimePerMonth.toFixed(4)}h (excede por ${excessHours.toFixed(4)}h)`);
    console.log('❌ Plan Free insuficiente');
  }
  
  // Plan Launch
  console.log('\n🚀 PLAN LAUNCH ($19/mes):');
  if (usage.computeTimePerMonth <= 191.7) {
    console.log(`✅ Cómputo: ${usage.computeTimePerMonth.toFixed(4)}h / 191.7h límite`);
    console.log('✅ COSTO ADICIONAL: $0 USD');
    console.log('💵 COSTO TOTAL: $19 USD/mes');
  } else {
    const excessHours = usage.computeTimePerMonth - 191.7;
    const additionalCost = excessHours * 0.16;
    console.log(`⚠️ Cómputo: ${usage.computeTimePerMonth.toFixed(4)}h (excede por ${excessHours.toFixed(4)}h)`);
    console.log(`💵 Costo adicional: $${additionalCost.toFixed(4)} USD`);
    console.log(`💵 COSTO TOTAL: $${(19 + additionalCost).toFixed(2)} USD/mes`);
  }
  
  // Estimación de almacenamiento típico
  console.log('\n💾 ESTIMACIÓN DE ALMACENAMIENTO:');
  console.log('• Base de datos típica con 100 citas/mes: ~5-10 MB');
  console.log('• Con logs del sistema: ~20-50 MB');
  console.log('✅ Bien dentro de los límites de cualquier plan');
  
  console.log('\n🎯 RECOMENDACIONES:');
  console.log('• Para uso básico: Plan FREE es suficiente');
  console.log('• Para clínicas grandes: Plan LAUNCH ($19/mes) es más que suficiente');
  console.log('• El sistema de recordatorios usa recursos MÍNIMOS');
  
  return usage;
}

// OPTIMIZACIONES SUGERIDAS
function suggestOptimizations() {
  console.log('\n⚡ OPCIONES PARA REDUCIR COSTOS AÚN MÁS:');
  
  // Opción 1: Intervalo más largo
  const optimized30min = calculateOptimizedUsage(30);
  console.log('\n1️⃣ CAMBIAR INTERVALO A 30 MINUTOS:');
  console.log(`• Verificaciones por mes: ${optimized30min.checksPerMonth.toLocaleString()}`);
  console.log(`• Tiempo de cómputo: ${optimized30min.computeTimePerMonth.toFixed(4)} horas/mes`);
  console.log(`• Reducción: ${((1 - optimized30min.computeTimePerMonth / calculateUsage().computeTimePerMonth) * 100).toFixed(1)}%`);
  
  // Opción 2: Consultas inteligentes
  console.log('\n2️⃣ CONSULTAS INTELIGENTES (solo cuando hay citas):');
  console.log('• Verificar primero si hay citas en próximas 25 horas');
  console.log('• Si no hay citas, saltar verificación');
  console.log('• Reducción estimada: 60-80% en días sin citas');
  
  // Opción 3: Cron externo
  console.log('\n3️⃣ USAR VERCEL CRON (RECOMENDADO):');
  console.log('• Ejecutar solo 2 veces al día (10am y 6pm)');
  console.log('• Verificaciones por mes: 60');
  console.log('• Tiempo de cómputo: ~0.0001 horas/mes');
  console.log('• Reducción: >99%');
  console.log('• COSTO: $0 adicional (incluido en Vercel)');
}

function calculateOptimizedUsage(intervalMinutes) {
  const checksPerHour = 60 / intervalMinutes;
  const checksPerDay = checksPerHour * 24;
  const checksPerMonth = checksPerDay * 30;
  const queriesPerMonth = checksPerMonth * 3;
  const computeTimePerMonth = (queriesPerMonth * 0.002) / 3600;
  
  return {
    checksPerHour,
    checksPerDay,
    checksPerMonth,
    queriesPerMonth,
    computeTimePerMonth
  };
}

// EJECUTAR ANÁLISIS
console.clear();
const usage = analyzeCosts();
suggestOptimizations();

console.log('\n' + '='.repeat(60));
console.log('🎯 CONCLUSIÓN: Tu sistema de recordatorios usa recursos MÍNIMOS');
console.log('💡 En Plan FREE: $0 adicional');
console.log('💡 En Plan Launch: $19/mes total (sin cargos extra)');
console.log('='.repeat(60));