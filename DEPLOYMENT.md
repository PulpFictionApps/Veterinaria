# 🚀 Guía de Deployment - VetConnect PWA

## 📋 Checklist Pre-Deploy

### ✅ Configuración Básica
- [ ] Variables de entorno configuradas en `.env.production`
- [ ] URL de API de producción definida
- [ ] Manifest.json actualizado con dominio real
- [ ] Service Worker configurado para producción
- [ ] Iconos PWA generados en todas las resoluciones

### ✅ Optimizaciones
- [ ] Build de producción exitoso (`npm run build`)
- [ ] Cache strategies configuradas
- [ ] Página offline personalizada
- [ ] Actualizaciones automáticas habilitadas

## 🌐 Opciones de Deployment

### 1️⃣ **Vercel (Recomendado)**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy desde /frontend
cd frontend
vercel --prod

# Configurar variables de entorno en dashboard
# - NEXT_PUBLIC_API_BASE
# - NEXT_PUBLIC_PWA_VERSION
```

### 2️⃣ **Netlify**
```bash
# Build command: npm run build
# Publish directory: frontend/.next
# Variables de entorno: configurar en dashboard
```

### 3️⃣ **Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🔄 Proceso de Actualizaciones Automáticas

### Cómo Funciona:
1. **Push a main** → GitHub Actions triggered
2. **Build automático** → Nueva versión generada
3. **Deploy** → App actualizada en producción
4. **Service Worker** detecta nueva versión
5. **Notification** aparece en app para usuarios
6. **Auto-update** → App se actualiza automáticamente

### Para los Usuarios:
- Ven notificación "Actualización disponible"
- Pueden actualizar inmediatamente o más tarde
- La app funciona offline con versión cacheada
- Próxima visita tendrá la nueva versión

## 📱 Validación PWA

### Herramientas de Testing:
```bash
# Lighthouse PWA audit
npx lighthouse https://tu-app.com --view

# PWA Builder validation
# Visita: https://www.pwabuilder.com/

# Chrome DevTools > Application > Manifest
```

### Criterios PWA:
- ✅ HTTPS obligatorio
- ✅ Service Worker registrado
- ✅ Manifest válido
- ✅ Icons de múltiples tamaños
- ✅ Responsive design
- ✅ Funcionalidad offline

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build
npm run start

# Análisis del bundle
npm run build:analyze

# Servir build estático
npm run serve
```

## 🐛 Troubleshooting

### Problemas Comunes:

**PWA no se instala:**
- Verificar HTTPS
- Validar manifest.json
- Comprobar service worker

**Actualizaciones no llegan:**
- Clear cache: Chrome DevTools > Application > Clear Storage
- Verificar skipWaiting: true en next.config.ts

**App no funciona offline:**
- Revisar runtimeCaching en PWA config
- Comprobar que offline.html existe

## 📊 Monitoreo Post-Deploy

### Métricas a Seguir:
- **Core Web Vitals** (LCP, FID, CLS)
- **PWA Install Rate**
- **Cache Hit Ratio**
- **Offline Usage**
- **Update Success Rate**

### Tools:
- Google Analytics
- Vercel Analytics
- Chrome UX Report
- PWA Builder Report