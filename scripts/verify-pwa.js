#!/usr/bin/env node

/**
 * 🔍 Script de Verificación PWA - VetConnect
 * Verifica que todos los componentes PWA estén correctamente configurados
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración PWA de VetConnect...\n');

const checks = [];

// 1. Verificar manifest.json
function checkManifest() {
  const manifestPath = path.join(__dirname, '../frontend/public/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return { status: '❌', message: 'manifest.json no encontrado' };
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const required = ['name', 'short_name', 'start_url', 'display', 'theme_color', 'icons'];
  const missing = required.filter(key => !manifest[key]);
  
  if (missing.length > 0) {
    return { status: '⚠️', message: `manifest.json falta: ${missing.join(', ')}` };
  }
  
  return { status: '✅', message: 'manifest.json configurado correctamente' };
}

// 2. Verificar service worker config
function checkServiceWorker() {
  const nextConfigPath = path.join(__dirname, '../frontend/next.config.ts');
  if (!fs.existsSync(nextConfigPath)) {
    return { status: '❌', message: 'next.config.ts no encontrado' };
  }
  
  const content = fs.readFileSync(nextConfigPath, 'utf8');
  if (!content.includes('withPWA')) {
    return { status: '❌', message: 'PWA no configurado en next.config.ts' };
  }
  
  return { status: '✅', message: 'Service Worker configurado correctamente' };
}

// 3. Verificar página offline
function checkOffline() {
  const offlinePath = path.join(__dirname, '../frontend/public/offline.html');
  if (!fs.existsSync(offlinePath)) {
    return { status: '⚠️', message: 'offline.html no encontrado (opcional pero recomendado)' };
  }
  
  return { status: '✅', message: 'Página offline configurada' };
}

// 4. Verificar componentes PWA
function checkComponents() {
  const components = [
    '../frontend/src/components/PWAInstallPrompt.tsx',
    '../frontend/src/components/UpdateNotification.tsx',
    '../frontend/src/components/InstallButton.tsx',
    '../frontend/src/hooks/useInstallPWA.ts'
  ];
  
  const missing = components.filter(comp => 
    !fs.existsSync(path.join(__dirname, comp))
  );
  
  if (missing.length > 0) {
    return { status: '❌', message: `Componentes faltantes: ${missing.map(p => path.basename(p)).join(', ')}` };
  }
  
  return { status: '✅', message: 'Todos los componentes PWA están presentes' };
}

// 5. Verificar iconos PWA
function checkIcons() {
  const iconsDir = path.join(__dirname, '../frontend/public/icons');
  if (!fs.existsSync(iconsDir)) {
    return { status: '⚠️', message: 'Directorio de iconos no encontrado' };
  }
  
  const requiredSizes = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'];
  const existingIcons = fs.readdirSync(iconsDir);
  const missingIcons = requiredSizes.filter(size => 
    !existingIcons.some(icon => icon.includes(size))
  );
  
  if (missingIcons.length > 0) {
    return { status: '⚠️', message: `Iconos faltantes: ${missingIcons.join(', ')}` };
  }
  
  return { status: '✅', message: 'Todos los iconos PWA están presentes' };
}

// 6. Verificar variables de entorno
function checkEnvironment() {
  const envPath = path.join(__dirname, '../frontend/.env.production');
  if (!fs.existsSync(envPath)) {
    return { status: '⚠️', message: '.env.production no encontrado (recomendado para producción)' };
  }
  
  return { status: '✅', message: 'Variables de entorno de producción configuradas' };
}

// 7. Verificar GitHub Actions
function checkGitHubActions() {
  const workflowPath = path.join(__dirname, '../.github/workflows/deploy.yml');
  if (!fs.existsSync(workflowPath)) {
    return { status: '⚠️', message: 'GitHub Actions no configurado (deploy automático)' };
  }
  
  return { status: '✅', message: 'GitHub Actions configurado para deploy automático' };
}

// Ejecutar todas las verificaciones
const verifications = [
  { name: 'Manifest PWA', check: checkManifest },
  { name: 'Service Worker', check: checkServiceWorker },
  { name: 'Página Offline', check: checkOffline },
  { name: 'Componentes PWA', check: checkComponents },
  { name: 'Iconos PWA', check: checkIcons },
  { name: 'Variables de Entorno', check: checkEnvironment },
  { name: 'GitHub Actions', check: checkGitHubActions }
];

let allGood = true;

verifications.forEach(({ name, check }) => {
  const result = check();
  console.log(`${result.status} ${name}: ${result.message}`);
  if (result.status === '❌') allGood = false;
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 ¡Excelente! Tu PWA está completamente configurada');
  console.log('\n📋 Próximos pasos:');
  console.log('1. Deploy a producción (Vercel/Netlify)');
  console.log('2. Testear instalación en dispositivos móviles');
  console.log('3. Verificar funcionamiento offline');
  console.log('4. Monitorear actualizaciones automáticas');
} else {
  console.log('⚠️ Hay algunos elementos que necesitan atención');
  console.log('\n🔧 Revisa los elementos marcados con ❌ y ⚠️');
}

console.log('\n🔗 Recursos útiles:');
console.log('- PWA Builder: https://www.pwabuilder.com/');
console.log('- Lighthouse: npx lighthouse <tu-url> --view');
console.log('- Documentación: ./DEPLOYMENT.md');