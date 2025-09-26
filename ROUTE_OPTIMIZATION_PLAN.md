# Estructura de Rutas Optimizada - Veterinaria App

## Estructura Actual vs Propuesta

### PROBLEMAS IDENTIFICADOS:
1. **Rutas redundantes**: `/dashboard/clients` y `/dashboard/tutors` (ambas manejan tutores)
2. **Anidación excesiva**: `/dashboard/clients/[id]/pets/[petId]/records/new` (5 niveles)
3. **Menús inconsistentes**: Sidebar, BottomNav y Navbar tienen diferentes elementos
4. **Navegación compleja**: Dificil acceso a funciones frecuentes

## NUEVA ESTRUCTURA PROPUESTA

### 1. RUTAS CONSOLIDADAS (Reducción de ~66 a ~35 rutas)

#### Estructura Raíz
```
/                           # Landing page
/login                      # Login
/register                   # Registro
/plans                      # Planes de suscripción
/book/[id]                  # Reserva pública
```

#### Dashboard Principal - Módulos Centralizados
```
/dashboard                  # Dashboard principal
/dashboard/calendar         # Vista de calendario unificada (appointments + availability)
/dashboard/clients          # Lista de clientes/tutores
/dashboard/clients/new      # Nuevo cliente
/dashboard/clients/[id]     # Perfil del cliente
/dashboard/pets             # Lista GLOBAL de mascotas (búsqueda y filtros)
/dashboard/pets/new         # Nueva mascota (con selector de tutor)
/dashboard/pets/[id]        # Perfil completo de mascota
/dashboard/consultations    # Gestión de tipos de consulta
```

#### Módulos de Gestión Médica (Centralizados)
```
/dashboard/appointments     # Lista de todas las citas
/dashboard/appointments/new # Nueva cita (con búsqueda de pet/cliente)
/dashboard/appointments/[id] # Detalle de cita + consulta
/dashboard/records          # Historial médico global (búsqueda por pet/cliente)
/dashboard/records/new      # Nuevo registro médico
/dashboard/records/[id]     # Detalle/edición de registro
/dashboard/prescriptions    # Recetas globales
/dashboard/prescriptions/new # Nueva receta
/dashboard/prescriptions/[id] # Detalle de receta
```

#### Configuración y Cuenta
```
/dashboard/profile          # Perfil profesional
/dashboard/settings         # Configuraciones generales
/dashboard/team             # Gestión de equipo
/dashboard/billing          # Facturación
/dashboard/integrations     # Integraciones
```

### 2. ELIMINACIÓN DE RUTAS REDUNDANTES

#### Rutas a ELIMINAR:
- `/dashboard/tutors/*` → Consolidado en `/dashboard/clients`
- `/dashboard/clients/[id]/pet/new` → Usar `/dashboard/pets/new?tutor=id`
- `/dashboard/clients/[id]/pets/*` → Usar `/dashboard/pets?tutor=id`
- `/dashboard/pets/[id]/edit` → Integrado en `/dashboard/pets/[id]`
- `/dashboard/availability` → Integrado en `/dashboard/calendar`
- Todo el árbol `/dashboard/clients/[id]/pets/[petId]/*` → Usar rutas globales

### 3. NAVEGACIÓN UNIFICADA

#### Menú Principal (Sidebar + BottomNav + Mobile)
```
🏠 Dashboard          /dashboard
📅 Calendar          /dashboard/calendar  (appointments + availability)
👥 Clientes          /dashboard/clients
🐾 Mascotas          /dashboard/pets
📋 Historial         /dashboard/records
💊 Recetas           /dashboard/prescriptions
⚙️  Más              [Submenu: profile, settings, team, billing]
```

#### Menú Secundario "Más" (Solo desktop Sidebar)
```
👨‍⚕️ Perfil           /dashboard/profile
👩‍⚕️ Equipo           /dashboard/team
💊 Tipos Consulta    /dashboard/consultations
💳 Facturación       /dashboard/billing
🔌 Integraciones     /dashboard/integrations
⚙️  Ajustes          /dashboard/settings
```

### 4. BENEFICIOS DE LA NUEVA ESTRUCTURA

#### Reducción de Rutas:
- **Antes**: ~66 rutas anidadas
- **Después**: ~35 rutas optimizadas
- **Reducción**: ~47% menos rutas

#### Navegación Mejorada:
- Acceso directo a mascotas desde menú principal
- Vista de calendario unificada
- Búsqueda global en cada módulo
- Menús consistentes entre dispositivos

#### UX Optimizada:
- Menos clics para tareas frecuentes
- Navegación predictible
- Búsqueda y filtros en vistas principales
- Responsive design consistente

### 5. PLAN DE IMPLEMENTACIÓN

#### Fase 1: Preparación
1. Crear nuevas rutas consolidadas
2. Migrar componentes a nuevas rutas
3. Actualizar componentes de navegación

#### Fase 2: Migración
1. Implementar redirects de rutas antiguas
2. Actualizar todos los enlaces internos
3. Testing exhaustivo

#### Fase 3: Cleanup
1. Eliminar rutas obsoletas
2. Documentar nueva estructura
3. Optimizar rendimiento

### 6. FUNCIONALIDADES MANTENIDAS

✅ **Todas las funcionalidades actuales se mantienen**
✅ **Mejora la experiencia de usuario**
✅ **Reduce complejidad técnica**
✅ **Facilita futuras expansiones**
✅ **Optimiza rendimiento (menos anidación)**

### 7. CONSIDERACIONES TÉCNICAS

- Usar parámetros de query para filtros: `/dashboard/pets?tutor=123`
- Breadcrumbs dinámicos para navegación contextual  
- Estado global para mantener contexto entre rutas
- Lazy loading para módulos menos usados
- Cache inteligente para datos frecuentemente accedidos