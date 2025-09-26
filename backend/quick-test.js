import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function quickTest() {
  console.log('🔗 Probando conexión rápida con Supabase...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey ? 'Configurada ✅' : 'No configurada ❌');
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Faltan variables de entorno');
    return;
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase creado');
    
    // Test simple bucket list
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('❌ Error listando buckets:', error.message);
      return;
    }
    
    console.log('✅ Buckets encontrados:', buckets.map(b => b.name));
    
    const prescriptionBucket = buckets.find(b => b.name === 'prescriptions');
    if (prescriptionBucket) {
      console.log('✅ Bucket "prescriptions" encontrado y accesible!');
    } else {
      console.log('⚠️  Bucket "prescriptions" no encontrado');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

quickTest();