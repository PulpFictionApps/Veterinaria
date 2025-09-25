# Sistema de Recetas Médicas Veterinarias

## Resumen
Sistema completo de generación de recetas médicas en formato PDF que incluye:
- Configuración de perfil profesional
- Generación de PDFs con formato veterinario profesional
- Integración con datos de mascotas y tutores
- Notificaciones por WhatsApp (opcional)

## Funcionalidades Implementadas

### 1. Perfil Profesional
**Ubicación**: `/dashboard/profile`

**Campos configurables**:
- Nombre profesional
- RUT profesional
- Título profesional (ej: "Médico Veterinario")
- Dirección de clínica
- Teléfono profesional
- Número de registro profesional
- URL de firma digital
- URL de logo de clínica

**Cómo usar**:
1. Navegar a "Perfil Profesional" en el sidebar
2. Completar los datos profesionales
3. Guardar cambios
4. Estos datos se usarán automáticamente en todas las recetas

### 2. Generación de Recetas PDF

**Backend**: PDFKit con formato profesional
**Frontend**: Integración desde formularios de consulta

**Estructura del PDF**:
```
[MEMBRETE PROFESIONAL]
Dr. [Nombre]
[Título Profesional]
RUT: [RUT]
Registro Profesional: [Número]
[Dirección]
Tel: [Teléfono] | Email: [Email]

════════════════════════════════
         RECETA VETERINARIA
════════════════════════════════

DATOS DEL PACIENTE:
Nombre: [Mascota]     Especie: [Tipo]
Raza: [Raza]         Edad: [Edad] años
Peso: [Peso] kg

DATOS DEL PROPIETARIO:
Nombre: [Tutor]      RUT: [RUT]
Teléfono: [Tel]      Email: [Email]

℞ PRESCRIPCIÓN MÉDICA

Medicamento: [Medicamento]
Dosis: [Dosis]
Frecuencia: [Frecuencia]
Duración del tratamiento: [Duración]

INSTRUCCIONES ESPECIALES:
[Instrucciones]

OBSERVACIONES:
[Contenido adicional]

Fecha: [Fecha actual]

                    ________________
                    Dr. [Nombre]
                    [Título]
                    Reg. Prof.: [Número]
```

### 3. Base de Datos

**Tabla User** - Campos profesionales añadidos:
```sql
professionalRut      String?
professionalTitle    String?
clinicAddress        String?
professionalPhone    String?
licenseNumber        String?
signatureUrl         String?
logoUrl              String?
```

**Tabla Prescription** - Campos de medicación:
```sql
medication    String
dosage        String
frequency     String
duration      String
instructions  String?
```

### 4. API Endpoints

**Perfil Profesional**:
- `GET /users/:id` - Obtener datos del profesional
- `PATCH /users/:id` - Actualizar perfil profesional

**Prescripciones**:
- `POST /prescriptions` - Crear receta con PDF
- `GET /prescriptions/pet/:petId` - Recetas por mascota
- `GET /prescriptions/user/:userId` - Recetas por profesional

## Flujo de Uso

### 1. Configuración Inicial
1. Registrarse / Iniciar sesión
2. Ir a "Perfil Profesional"
3. Completar datos profesionales
4. Guardar configuración

### 2. Crear Receta
1. Ir a cita/consulta específica
2. Completar formulario de prescripción:
   - Medicamento
   - Dosis
   - Frecuencia
   - Duración
   - Instrucciones especiales
3. Enviar formulario
4. El sistema genera automáticamente PDF con:
   - Membrete profesional configurado
   - Datos de la mascota
   - Datos del tutor
   - Prescripción médica formateada

### 3. Descarga y Distribución
- PDF se genera automáticamente
- Opción de envío por WhatsApp al tutor
- Almacenamiento en historial de prescripciones

## Archivos Modificados/Creados

### Backend
- `prisma/schema.prisma` - Campos profesionales y medicación
- `src/routes/users.js` - API de perfil profesional
- `src/routes/prescriptions.js` - Generación PDF profesional
- `src/index.js` - Integración de rutas

### Frontend
- `app/dashboard/profile/page.tsx` - Página de perfil profesional
- `components/Sidebar.tsx` - Navegación actualizada
- API calls actualizadas para usar datos profesionales

### Migraciones
- `20250925040256_add_professional_data` - Campos profesionales en User

## Configuración Requerida

### Variables de Entorno
```env
# WhatsApp (opcional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

# URLs base
BACKEND_BASE_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

### Dependencias
- **Backend**: PDFKit para generación PDF
- **Frontend**: Formularios integrados con validación

## Testing

### Casos de Prueba
1. **Perfil vacío**: PDF genera con campos básicos
2. **Perfil completo**: PDF muestra todos los datos profesionales
3. **Prescripción básica**: Solo medicamento y dosis
4. **Prescripción completa**: Todos los campos incluidos
5. **WhatsApp**: Envío opcional funcionando

### Comandos
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev

# Navegar a http://localhost:3000
```

## Próximas Mejoras

### Sugeridas
- [ ] Upload de logo/firma desde interfaz
- [ ] Plantillas de prescripciones predefinidas
- [ ] Firmas digitales integradas
- [ ] Historial de prescripciones con filtros
- [ ] Exportación a otros formatos
- [ ] Impresión directa
- [ ] Validación de medicamentos contra base de datos

### Técnicas
- [ ] Tests unitarios para generación PDF
- [ ] Validación de campos profesionales
- [ ] Optimización de tamaño PDF
- [ ] Caché de perfiles profesionales

## Soporte
El sistema está completamente funcional y listo para uso en producción con configuración de perfil profesional y generación de PDFs con formato veterinario estándar.