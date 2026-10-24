// ============================================================
// Cliente de Supabase. Es el unico lugar donde se crea la conexion.
// Las credenciales van en un archivo .env (ver .env.example):
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=<anon / publishable key>
// La anon key es publica por diseno: la seguridad real la dan las
// politicas RLS de supabase/esquema.sql. NUNCA pongas aqui la
// service_role key.
// ============================================================
import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env?.VITE_SUPABASE_URL;
const CLAVE = import.meta.env?.VITE_SUPABASE_ANON_KEY;

/** Mensaje si la configuracion es invalida (clave secreta, URL mala...). Si no, null. */
function validarConfiguracion() {
  if (!URL || !CLAVE) return null; // faltan variables: lo avisa la pantalla de configuracion
  if (/^sb_secret_/.test(CLAVE) || /service_role/i.test(CLAVE)) {
    return 'Pusiste una clave SECRETA (sb_secret_... / service_role) en VITE_SUPABASE_ANON_KEY. Esa clave nunca va en el navegador: usa la clave "publishable" (sb_publishable_...) de Project Settings -> API Keys. Si ya la compartiste, regenerala en Supabase.';
  }
  return null;
}

/** Texto del problema de configuracion (o null); la pantalla de App.jsx lo muestra. */
export let errorConfiguracion = validarConfiguracion();

let cliente = null;
if (URL && CLAVE && !errorConfiguracion) {
  try {
    cliente = createClient(URL, CLAVE);
  } catch (error) {
    // supabase-js lanza error con claves o URL invalidas: se muestra en pantalla en vez de dejarla en blanco
    errorConfiguracion = 'Supabase rechazo la configuracion del .env: ' + error.message;
  }
}

/** true si el .env tiene las dos variables y el cliente se pudo crear. */
export const supabaseConfigurado = Boolean(cliente);
let inyectado = false; // true cuando una prueba reemplazo el cliente

/** Devuelve el cliente activo (o lanza un error claro si falta la configuracion). */
export function obtenerCliente() {
  if (!cliente) {
    throw new Error('Supabase no esta configurado: crea el archivo .env (ver .env.example).');
  }
  return cliente;
}

/**
 * Reemplaza el cliente. Lo usan las pruebas para inyectar un Supabase
 * falso en memoria (ver src/tests/supabaseFalso.js), asi no necesitan red.
 */
export function usarCliente(nuevoCliente) {
  cliente = nuevoCliente;
  inyectado = true;
}

/**
 * Cliente aparte que NO guarda sesion. Sirve para que un admin cree la
 * cuenta de otra persona sin cerrar su propia sesion (signUp inicia sesion
 * con la cuenta nueva en el cliente que lo llama).
 */
export function crearClienteSinSesion() {
  if (!supabaseConfigurado || inyectado) return cliente; // en pruebas se reutiliza el falso
  return createClient(URL, CLAVE, { auth: { persistSession: false, autoRefreshToken: false } });
}
