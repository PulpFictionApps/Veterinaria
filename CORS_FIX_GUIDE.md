# 🔧 Solución CORS - Guía de Deploy

## ❌ **Problema identificado:**
```
Access to fetch at 'https://veterinaria-gamma-virid.vercel.app/auth/login' 
from origin 'https://veterinaria-p918.vercel.app' has been blocked by CORS policy
```

## ✅ **Solución implementada:**

### 1. **Backend CORS actualizado** (`backend/src/index.js`)
- ✅ Configuración dinámica de origins permitidos
- ✅ Support para RegEx (cualquier subdominio de vercel.app)
- ✅ Headers adicionales para preflight requests
- ✅ Manejo robusto de OPTIONS requests

### 2. **Frontend API detecta entorno automáticamente** (`frontend/src/lib/api.ts`)
- ✅ Detecta si está en Vercel (producción)
- ✅ Usa URL correcta según el entorno
- ✅ Fallback a desarrollo local

### 3. **Variables de entorno actualizadas**

#### Backend (`.env`):
```env
FRONTEND_URL="http://localhost:3000"
FRONTEND_PRODUCTION_URL="https://veterinaria-p918.vercel.app"
```

#### Frontend (`.env.local`):
```env
NEXT_PUBLIC_API_BASE="http://localhost:4000"
NEXT_PUBLIC_API_BASE_PROD="https://veterinaria-gamma-virid.vercel.app"
```

## 🚀 **Pasos para resolver:**

### 1. **Deploy el backend actualizado:**
```bash
# Desde la carpeta backend
git add .
git commit -m "Fix CORS configuration for Vercel deployment"
git push origin main
# Vercel redesplegará automáticamente
```

### 2. **Deploy el frontend actualizado:**
```bash 
# Desde la carpeta frontend
git add .
git commit -m "Update API base URL detection for production"
git push origin main
# Vercel redesplegará automáticamente
```

### 3. **Verificar variables de entorno en Vercel:**

#### En el proyecto backend de Vercel:
- `FRONTEND_URL` = `http://localhost:3000`
- `FRONTEND_PRODUCTION_URL` = `https://veterinaria-p918.vercel.app`
- (Todas las otras variables existentes)

#### En el proyecto frontend de Vercel:
- `NEXT_PUBLIC_API_BASE` = `http://localhost:4000`
- `NEXT_PUBLIC_API_BASE_PROD` = `https://veterinaria-gamma-virid.vercel.app`
- (Todas las otras variables existentes)

### 4. **Forzar redeployment (si es necesario):**
- Ve a Vercel Dashboard
- Selecciona cada proyecto
- Ve a Deployments
- Click en "Redeploy" en el último deployment

## 🧪 **Para probar localmente:**
```bash
node test-cors.js
```

## 🎯 **Resultado esperado:**
- ✅ Frontend puede hacer requests al backend sin errores CORS
- ✅ Login/Register funcionan correctamente
- ✅ Todas las APIs responden desde Vercel
- ✅ Compatibilidad completa entre URLs de Vercel

## 🔍 **URLs involucradas:**
- **Frontend**: https://veterinaria-p918.vercel.app
- **Backend**: https://veterinaria-gamma-virid.vercel.app
- **Patrón permitido**: `*.vercel.app`

¡Una vez que redeployes ambos proyectos, el error de CORS debería desaparecer! 🎉