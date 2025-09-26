# Arquitectura del Sistema de Temas - VetScheduler

## 📋 Estructura Actual (Limpia y Optimizada)

### 🎨 Sistema de Temas Principal

```
/src/lib/
├── theme-context.tsx          # ✅ CONTEXTO PRINCIPAL
├── auth-context.tsx           # ✅ AUTENTICACIÓN OPTIMIZADA
├── constants.ts               # ✅ CONSTANTES DE MARCA Y COLORES
├── api.ts                     # ✅ API CON CACHE
├── cache.ts                   # ✅ SISTEMA DE CACHE
└── [archivos respaldados]
    ├── theme.ts.backup        # 🚫 Respaldado (conflictivo)
    └── useHybridTheme.tsx.backup # 🚫 Respaldado (conflictivo)
```

### 🎯 Componentes de Tema

```
/src/components/
├── ThemedButton.tsx           # ✅ Botón con colores dinámicos
├── ThemeWrapper.tsx           # ✅ Wrapper de fondo dinámico
├── ClientLayoutWrapper.tsx    # ✅ Layout con detección de ruta
└── [componentes lazy]
    ├── LazyDashboardCalendar.tsx # ✅ Calendario con lazy loading
    └── LazyAvailabilityManager.tsx # ✅ Disponibilidad con lazy loading
```

### 🔧 Hooks Personalizados

```
/src/hooks/
├── useThemeColors.ts          # ✅ Hook principal para colores
└── usePerformance.ts          # ✅ Hooks de optimización
```

## 🌊 Flujo de Datos

### 1. Inicialización
```
AuthProvider (auth-context.tsx)
    ↓
ThemeProvider (theme-context.tsx)
    ↓
useThemeColors (hook)
    ↓
ThemedButton, ThemeWrapper, etc.
```

### 2. Carga de Colores
```
Usuario autenticado → API /users/:id → Cache → Colores dinámicos
Usuario no autenticado → Colores por defecto (rosa pastel)
```

### 3. Sistema de Cache
```
GET request → Cache check → Si existe: usar cache → Si no: API call → Cache result
POST/PUT/PATCH/DELETE → Invalidate related cache
```

## ✅ Optimizaciones Implementadas

### 🚀 Rendimiento
- **Lazy Loading**: Componentes pesados se cargan bajo demanda
- **Memoización**: useMemo/useCallback en contextos críticos
- **Cache Inteligente**: 5min para datos generales, 1min para dinámicos
- **Debounce**: 100ms en carga de temas
- **Control de estado**: hasLoadedUserColors evita recargas

### 🎨 Sistema de Temas
- **Un solo contexto**: theme-context.tsx como fuente única
- **Colores dinámicos**: Generación automática de variaciones
- **CSS Variables**: Actualización en tiempo real
- **Fallbacks**: Colores por defecto siempre disponibles

### 🧹 Limpieza de Código
- **Eliminación de conflictos**: theme.ts y useHybridTheme respaldados
- **Importaciones consistentes**: Todo usa theme-context y constants
- **Separación de responsabilidades**: Marca en constants.ts

## 🎛️ Configuración de Colores

### Predefinidos (constants.ts)
```typescript
colorSchemes = {
  pink: { primary: '#EC4899', secondary: '#F9A8D4', accent: '#BE185D' },
  blue: { primary: '#3B82F6', secondary: '#93C5FD', accent: '#1D4ED8' },
  green: { primary: '#10B981', secondary: '#6EE7B7', accent: '#047857' },
  // ... más esquemas
}
```

### Dinámicos (theme-context.tsx)
```typescript
generateColorVariations(primary, secondary, accent) → {
  primary, secondary, accent,
  primaryHover, primaryGradient, secondaryGradient,
  bgGradient, cardGradient, shadowPrimary, shadowSecondary
}
```

## 📱 Uso en Componentes

### Correcto ✅
```tsx
import { useThemeColors } from '../hooks/useThemeColors';
const { getPrimaryButtonStyle } = useThemeColors();
```

### También correcto ✅
```tsx
import { useTheme } from '../lib/theme-context';
const { colors } = useTheme();
```

### Información de marca ✅
```tsx
import { brand, colorSchemes } from '../lib/constants';
```

## 🚫 Evitar

- ❌ Importar de theme.ts (respaldado)
- ❌ Usar useHybridTheme (respaldado)
- ❌ Llamadas directas a API sin cache
- ❌ Múltiples useTheme() en el mismo componente
- ❌ Hardcodear colores pink en lugar de usar dinámicos

## 📊 Resultado

### Antes de las optimizaciones:
- 🔴 60+ llamadas/minuto a /users/:id
- 🔴 Re-renders constantes
- 🔴 Conflictos entre sistemas de temas
- 🔴 Componentes pesados bloquean carga inicial

### Después de las optimizaciones:
- 🟢 1 llamada por sesión + cache automático
- 🟢 Re-renders controlados con memoización
- 🟢 Sistema de temas unificado y limpio
- 🟢 Lazy loading de componentes pesados
- 🟢 Cache inteligente con invalidación automática

Esta arquitectura garantiza un rendimiento óptimo y un mantenimiento sencillo del sistema de temas.