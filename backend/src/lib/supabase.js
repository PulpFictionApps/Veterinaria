import { createClient } from '@supabase/supabase-js';

// Función para crear el cliente de Supabase
const createSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  // Cliente con service role para operaciones del backend
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Exportar función que crea el cliente cuando se necesita
export const getSupabaseClient = createSupabaseClient;

// Para compatibilidad, crear el cliente de forma lazy
let _supabase = null;
export const supabase = new Proxy({}, {
  get: function(target, prop) {
    if (!_supabase) {
      _supabase = createSupabaseClient();
    }
    return _supabase[prop];
  }
});