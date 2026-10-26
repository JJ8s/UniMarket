import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env?.VITE_SUPABASE_URL;
const CLAVE = import.meta.env?.VITE_SUPABASE_ANON_KEY;

function validarConfiguracion() {
  if (!URL || !CLAVE) return null;
  if (/^sb_secret_/.test(CLAVE) || /service_role/i.test(CLAVE)) {
    return 'Pusiste una clave SECRETA (sb_secret_... / service_role) en VITE_SUPABASE_ANON_KEY. Esa clave nunca va en el navegador: usa la clave "publishable" (sb_publishable_...) de Project Settings -> API Keys. Si ya la compartiste, regenerala en Supabase.';
  }
  return null;
}

export let errorConfiguracion = validarConfiguracion();

let cliente = null;
if (URL && CLAVE && !errorConfiguracion) {
  try {
    cliente = createClient(URL, CLAVE);
  } catch (error) {
    errorConfiguracion = 'Supabase rechazo la configuracion del .env: ' + error.message;
  }
}

/** Supabase configurado */
export const supabaseConfigurado = Boolean(cliente);
let inyectado = false;

export function obtenerCliente() {
  if (!cliente) {
    throw new Error('Supabase no esta configurado: crea el archivo .env (ver .env.example).');
  }
  return cliente;
}

export function usarCliente(nuevoCliente) {
  cliente = nuevoCliente;
  inyectado = true;
}

export function crearClienteSinSesion() {
  if (!supabaseConfigurado || inyectado) return cliente;
  return createClient(URL, CLAVE, { auth: { persistSession: false, autoRefreshToken: false } });
}
