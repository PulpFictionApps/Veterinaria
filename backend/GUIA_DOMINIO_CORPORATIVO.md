# ============================================
# GUÍA: CONFIGURAR DOMINIO CORPORATIVO
# ============================================

# PASO 1: Verificar Dominio en Resend
# ------------------------------------
# 1. Ve a https://resend.com/domains
# 2. Haz clic en "Add Domain"
# 3. Ingresa tu dominio (ej: veterinaria.com)
# 4. Resend te dará registros DNS para configurar:
#    - TXT record para verificación
#    - MX records para recepción (opcional)
#    - DKIM records para autenticación

# PASO 2: Configurar DNS
# ----------------------
# En tu proveedor de dominio (GoDaddy, Namecheap, etc.):
# - Agrega los registros TXT y DKIM que te dé Resend
# - Espera 5-15 minutos para propagación
# - Verifica en Resend que el dominio esté activo

# PASO 3: Actualizar .env
# -----------------------
# Cambia esta línea:
EMAIL_FROM="onboarding@resend.dev"
# Por tu email corporativo:
EMAIL_FROM="citas@tudominio.com"
# O:
EMAIL_FROM="noreply@tudominio.com"

# ============================================
# OPCIONES DE DOMINIOS ECONÓMICOS
# ============================================

# Opción A: Namecheap (~$1-8/año)
# - Ve a namecheap.com
# - Busca dominios .com, .org, .net
# - Algunos TLD baratos: .tk, .ml, .ga

# Opción B: Freenom (GRATIS)
# - Ve a freenom.com
# - Dominios gratuitos: .tk, .ml, .ga, .cf
# - Nota: Pueden tener limitaciones

# Opción C: Cloudflare (~$8/año)
# - Ve a cloudflare.com/products/registrar
# - Precios al costo, sin markup
# - Incluye protección de privacidad

# ============================================
# DESPUÉS DE VERIFICAR EL DOMINIO
# ============================================

# 1. Actualiza EMAIL_FROM en .env
# 2. Reinicia el backend
# 3. Ejecuta: node test-dual-reminders.js
# 4. ¡Ya puedes enviar a cualquier email!

# ============================================
# EMAILS CORPORATIVOS SUGERIDOS
# ============================================

# Para recordatorios automáticos:
EMAIL_FROM="citas@tudominio.com"
EMAIL_FROM="recordatorios@tudominio.com"
EMAIL_FROM="noreply@tudominio.com"

# Para soporte:
EMAIL_FROM="soporte@tudominio.com"
EMAIL_FROM="contacto@tudominio.com"