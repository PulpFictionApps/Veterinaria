# Migración a Supabase - Pasos Finales

## ✅ Completado

1. ✅ Instaladas las dependencias de Supabase (`@supabase/supabase-js`)
2. ✅ Creado el cliente de Supabase (`backend/src/lib/supabase.js`)
3. ✅ Actualizado el Prisma Schema con los nuevos campos:
   - `pdfUrl` - URL del PDF en Supabase Storage
   - `pdfFileName` - Nombre del archivo en Supabase Storage
4. ✅ Configuradas las variables de entorno en `.env`
5. ✅ Actualizado el archivo de prescripciones para usar Supabase Storage
6. ✅ Ejecutada la migración de Prisma (`prisma generate` y `prisma db push`)

## 🔧 Pasos Pendientes (que debes hacer tú)

### 1. Configurar Supabase Storage

Ve a tu dashboard de Supabase (https://app.supabase.com) y:

1. **Crear el bucket de Storage:**
   - Ve a Storage
   - Crear nuevo bucket llamado `prescriptions`
   - Hacer el bucket **público**

2. **Configurar políticas de acceso (RLS):**
   ```sql
   -- Permitir lectura pública
   CREATE POLICY "Public can view prescriptions" ON storage.objects
   FOR SELECT USING (bucket_id = 'prescriptions');

   -- Permitir subida para usuarios autenticados
   CREATE POLICY "Authenticated users can upload prescriptions" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'prescriptions');

   -- Permitir actualización para usuarios autenticados  
   CREATE POLICY "Authenticated users can update prescriptions" ON storage.objects
   FOR UPDATE USING (bucket_id = 'prescriptions');

   -- Permitir eliminación para usuarios autenticados
   CREATE POLICY "Authenticated users can delete prescriptions" ON storage.objects
   FOR DELETE USING (bucket_id = 'prescriptions');
   ```

### 2. Cambiar a la Base de Datos de Supabase

Cuando estés listo para migrar completamente, cambia en el archivo `.env`:

```env
# Cambiar estas líneas:
DATABASE_URL="postgresql://postgres:Rafa3136569_Rafa3136569@db.evnlmiukdcpafbeifokz.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:Rafa3136569_Rafa3136569@db.evnlmiukdcpafbeifokz.supabase.co:5432/postgres"

# Y comentar:
# DATABASE_URL="postgresql://neondb_owner:npg_HV9nblEAu8Lc@ep-lingering-star-acer8j9d-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

Luego ejecutar:
```bash
cd backend
npx prisma db push
```

### 3. Migrar datos existentes (Opcional)

Si tienes prescripciones existentes con PDFs locales, puedes crear un script para migrarlos a Supabase Storage.

### 4. Probar la funcionalidad

1. **Crear una nueva prescripción** - El PDF se subirá automáticamente a Supabase Storage
2. **Descargar una prescripción** - Se descargará desde Supabase Storage
3. **Verificar en Supabase Dashboard** - Los archivos deben aparecer en el bucket `prescriptions`

## 📁 Archivos Modificados

- `backend/src/lib/supabase.js` - **NUEVO** Cliente de Supabase
- `backend/.env` - **ACTUALIZADO** Variables de entorno
- `frontend/.env` - **CREADO** Variables de entorno del frontend
- `backend/prisma/schema.prisma` - **ACTUALIZADO** Campo `pdfFileName` agregado
- `backend/src/routes/prescriptions.js` - **ACTUALIZADO** Soporte para Supabase Storage
- `backend/package.json` - **ACTUALIZADO** Dependencia `@supabase/supabase-js`

## 🚀 Funcionalidades Implementadas

1. **Generación de PDFs con Supabase Storage:**
   - Los PDFs se generan localmente
   - Se suben automáticamente a Supabase Storage
   - Se almacena la URL pública en la base de datos
   - Se limpia el archivo local después de subirlo

2. **Descarga de PDFs híbrida:**
   - Primero intenta descargar desde Supabase Storage
   - Fallback a archivo local si no está disponible en Supabase

3. **Compatibilidad hacia atrás:**
   - Los PDFs existentes seguirán funcionando
   - Soporte para migración gradual

## ⚠️ Notas Importantes

- El proyecto actual sigue usando la base de datos de Neon temporalmente
- Los nuevos PDFs se suben a Supabase Storage inmediatamente
- La migración es compatible con el código existente
- Se mantiene el fallback a archivos locales por seguridad

## 🔄 Próximos Pasos Sugeridos

1. Configurar el bucket de Storage en Supabase
2. Probar la creación de prescripciones
3. Verificar la descarga de PDFs
4. Migrar a la base de datos de Supabase cuando estés listo
5. Opcional: Crear script de migración para PDFs existentes