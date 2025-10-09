#!/usr/bin/env node

/**
 * Script para configurar una tarea programada que ejecute la limpieza de horarios
 * automáticamente cada 15 minutos en sistemas Windows usando Task Scheduler
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function setupWindowsTaskScheduler() {
  console.log('🪟 Configurando tarea programada en Windows...');
  
  try {
    // Ruta al script de limpieza
    const scriptPath = path.join(__dirname, 'scripts', 'cleanup-expired-slots.js');
    
    // Comando para crear tarea programada
    const taskName = 'VetScheduler-CleanupSlots';
    const nodeExe = process.execPath; // Ruta al ejecutable de Node.js
    
    // Eliminar tarea existente si existe
    try {
      execSync(`schtasks /delete /tn "${taskName}" /f`, { stdio: 'pipe' });
      console.log('  ✅ Tarea existente eliminada');
    } catch (e) {
      console.log('  ℹ️  No había tarea previa que eliminar');
    }

    // Crear nueva tarea programada cada 15 minutos
    const createCommand = `schtasks /create /tn "${taskName}" /tr "\\"${nodeExe}\\" \\"${scriptPath}\\"" /sc minute /mo 15 /ru SYSTEM /f`;
    
    console.log('  📋 Ejecutando comando:');
    console.log('    ', createCommand);
    
    execSync(createCommand, { stdio: 'inherit' });
    
    console.log('  ✅ Tarea programada creada exitosamente');
    console.log('  ⏰ Se ejecutará cada 15 minutos');
    
    // Verificar que la tarea fue creada
    try {
      const queryResult = execSync(`schtasks /query /tn "${taskName}"`, { encoding: 'utf-8' });
      console.log('  ✅ Verificación exitosa - la tarea existe');
    } catch (e) {
      console.error('  ❌ Error al verificar la tarea');
    }
    
    // Ejecutar inmediatamente para probar
    console.log('  🚀 Ejecutando tarea inmediatamente para probar...');
    try {
      execSync(`schtasks /run /tn "${taskName}"`, { stdio: 'inherit' });
      console.log('  ✅ Tarea ejecutada manualmente');
    } catch (e) {
      console.error('  ❌ Error al ejecutar tarea manualmente:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Error configurando tarea programada:', error.message);
    console.log('\n💡 Puedes configurar manualmente:');
    console.log('   1. Abre Task Scheduler (Programador de Tareas)');
    console.log('   2. Crea nueva tarea básica');
    console.log('   3. Programa para cada 15 minutos');
    console.log('   4. Acción: Iniciar programa');
    console.log(`   5. Programa: ${process.execPath}`);
    console.log(`   6. Argumentos: ${scriptPath}`);
  }
}

function setupLinuxCron() {
  console.log('🐧 Para configurar en Linux, agregue esta línea al crontab:');
  const scriptPath = path.join(__dirname, 'scripts', 'cleanup-expired-slots.js');
  console.log(`*/15 * * * * ${process.execPath} ${scriptPath}`);
  console.log('\nEjecute: crontab -e');
}

function main() {
  console.log('🔧 Configurador de limpieza automática de horarios');
  console.log('=====================================\n');
  
  if (process.platform === 'win32') {
    setupWindowsTaskScheduler();
  } else {
    setupLinuxCron();
  }
  
  console.log('\n🎉 Configuración completa');
  console.log('📍 El script de limpieza ahora se ejecutará automáticamente cada 15 minutos');
}

main();