# 📱 Iconos PWA - Vetrium

## 📋 Estado Actual
- ✅ SVG placeholder generados para desarrollo
- ⚠️ Para producción, convertir SVG a PNG de alta calidad

## 🎨 Para Producción (Recomendado)

### Opción 1: PWA Asset Generator (Automático)
```bash
npm install -g pwa-asset-generator
pwa-asset-generator logo-base.svg icons/ --manifest manifest.json
```

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
- `public/manifest.json` - Referencias a los iconos
- Con `purpose: "maskable any"` para mejor compatibilidad

## ✨ Características del Diseño
- Gradiente rosa/púrpura (colores del tema)
- Icono de veterinaria estilizado
- Texto "Vetrium" legible
- Esquinas redondeadas
- Optimizado para diferentes tamaños