# Sistema de Recordatorios Automáticos 📧📱

El sistema envía recordatorios automáticos por WhatsApp y Email a los clientes:
- **24 horas antes** de la cita
- **1 hora antes** de la cita

## Configuración

### 1. Variables de Entorno (.env)

```env
# WhatsApp (via Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"  
TWILIO_WHATSAPP_NUMBER="+14155238886"

# Email (via Resend)
EMAIL_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@vetrium.cl"
```

### 2. Configuración del Profesional

Cada profesional puede habilitar/deshabilitar recordatorios desde su perfil:
- `enableWhatsappReminders`: Activar recordatorios por WhatsApp
- `enableEmailReminders`: Activar recordatorios por Email
- `whatsappNumber`: Número de WhatsApp del profesional (opcional)

## Funcionamiento

### Automático
- El sistema verifica cada **10 minutos** si hay recordatorios por enviar
- Marca automáticamente las citas como "recordatorio enviado" para evitar duplicados

### Manual (Testing)
```bash
# Probar todo el sistema
POST /reminders/test

# Probar una cita específica
POST /reminders/test-single/:appointmentId
Body: { "type": "24h" } // o "1h"

# Ver estado de recordatorios
GET /reminders/status
```

## Base de Datos

Se agregaron campos al modelo `Appointment`:
- `reminder24hSent: Boolean`
- `reminder24hSentAt: DateTime?`
- `reminder1hSent: Boolean`
- `reminder1hSentAt: DateTime?`

## Testing

```bash
# Verificar configuración y citas próximas
node test-reminders.js

# Ver logs en tiempo real
npm run dev
```

## Servicios Externos

### WhatsApp (Twilio)
- Sandbox: `+1 415 523 8886`
- Producción: Requiere número verificado
- Formato mensajes: Markdown básico

### Email (Resend)
- API moderna y confiable
- Templates HTML personalizados
- Tracking de entregas

## Solución de Problemas

1. **No se envían recordatorios**
   - Verificar variables de entorno
   - Revisar configuración del profesional
   - Comprobar logs del servidor

2. **WhatsApp no funciona**
   - Verificar número Twilio
   - Confirmar formato números (+56...)
   - Revisar créditos Twilio

3. **Emails no llegan**
   - Verificar API key Resend
   - Comprobar dominio EMAIL_FROM
   - Revisar logs de entrega

## Escalabilidad

Para muchas citas, considerar:
- Queue system (Redis + Bull)
- Separate microservice
- Database indexing en campos de fecha
- Rate limiting para APIs externas