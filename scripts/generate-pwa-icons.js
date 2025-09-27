#!/usr/bin/env node

/**
 * 🎨 Generador de Iconos PWA - VetConnect
 * Genera iconos básicos SVG para PWA (placeholder)
 * En producción, usar herramientas como PWA Asset Generator
 */

const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../frontend/public/icons');

// Crear directorio si no existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG base para el icono
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#EC4899;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#BE185D;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <g transform="translate(${size * 0.2}, ${size * 0.2})">
    <path d="M${size * 0.3} ${size * 0.15}L${size * 0.45} ${size * 0.25}L${size * 0.3} ${size * 0.35}Z" fill="white" opacity="0.9"/>
    <rect x="${size * 0.1}" y="${size * 0.4}" width="${size * 0.5}" height="${size * 0.03}" fill="white" opacity="0.9" rx="${size * 0.015}"/>
    <rect x="${size * 0.1}" y="${size * 0.45}" width="${size * 0.4}" height="${size * 0.03}" fill="white" opacity="0.7" rx="${size * 0.015}"/>
    <rect x="${size * 0.1}" y="${size * 0.5}" width="${size * 0.3}" height="${size * 0.03}" fill="white" opacity="0.5" rx="${size * 0.015}"/>
  </g>
  <text x="${size/2}" y="${size * 0.85}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold">VetConnect</text>
</svg>`;

console.log('🎨 Generando iconos PWA para VetConnect...\n');

iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.png`;
  const svgFilename = `icon-${size}x${size}.svg`;
  
  // Guardar SVG (para desarrollo)
  fs.writeFileSync(path.join(iconsDir, svgFilename), svgContent.trim());
  
  console.log(`✅ Generado: ${svgFilename}`);
});

// Crear archivo de instrucciones
const instructions = `
# 📱 Iconos PWA - VetConnect

## 📋 Estado Actual
- ✅ SVG placeholder generados para desarrollo
- ⚠️ Para producción, convertir SVG a PNG de alta calidad

## 🎨 Para Producción (Recomendado)

### Opción 1: PWA Asset Generator (Automático)
\`\`\`bash
npm install -g pwa-asset-generator
pwa-asset-generator logo-base.svg icons/ --manifest manifest.json
\`\`\`

### Opción 2: PWA Builder (Online)
1. Visita: https://www.pwabuilder.com/imageGenerator
2. Sube tu logo en alta resolución
3. Descarga el paquete de iconos
4. Reemplaza los archivos en /public/icons/

### Opción 3: Manual con GIMP/Photoshop
Crear PNG desde los SVG en estas resoluciones:
- 72x72, 96x96, 128x128, 144x144
- 152x152, 192x192, 384x384, 512x512

## 🔧 Configuración Actual
Los iconos están configurados en:
- \`public/manifest.json\` - Referencias a los iconos
- Con \`purpose: "maskable any"\` para mejor compatibilidad

## ✨ Características del Diseño
- Gradiente rosa/púrpura (colores del tema)
- Icono de veterinaria estilizado
- Texto "VetConnect" legible
- Esquinas redondeadas
- Optimizado para diferentes tamaños
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), instructions.trim());

console.log(`\n📁 Iconos generados en: ${iconsDir}`);
console.log('📋 Lee icons/README.md para instrucciones de producción');
console.log('\n⚠️  Nota: Para producción, convierte los SVG a PNG de alta calidad');
console.log('🔗 Recomendado: https://www.pwabuilder.com/imageGenerator');