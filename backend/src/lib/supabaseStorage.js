import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente de Supabase con service role para operaciones de storage
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Configuración del bucket
export const STORAGE_BUCKET = 'Prescriptions';

/**
 * Sube un archivo PDF a Supabase Storage
 * @param {Buffer} fileBuffer - Buffer del archivo PDF
 * @param {string} fileName - Nombre del archivo
 * @returns {Promise<{url: string, path: string}>} URL pública y path del archivo
 */
export async function uploadPDF(fileBuffer, fileName) {
  try {
    const filePath = `pdfs/${Date.now()}-${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error in uploadPDF:', error);
    throw error;
  }
}

/**
 * Elimina un archivo PDF de Supabase Storage
 * @param {string} filePath - Path del archivo en storage
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
export async function deletePDF(filePath) {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePDF:', error);
    return false;
  }
}

/**
 * Obtiene la URL pública de un archivo
 * @param {string} filePath - Path del archivo en storage
 * @returns {string} URL pública del archivo
 */
export function getPublicUrl(filePath) {
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);
    
  return publicUrl;
}