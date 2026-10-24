// ============================================================
// Capa de datos. Habla con Supabase (PostgreSQL + Auth) y es el unico
// archivo que lo hace; el unico localStorage que queda es el del carrito
// (la bolsa es de cada dispositivo, no necesita estar en la base).
//
// Reglas del proyecto que se mantienen:
//  - Las funciones que pueden fallar NO lanzan errores: devuelven
//    { ok:boolean, mensaje?:string, ...datos }.
//  - Las funciones de lectura devuelven los datos (o null / []).
//  - Los objetos que salen de aqui usan camelCase (articulo.universidadesVenta,
//    orden.cliente.correo...) aunque en la base las columnas sean snake_case.
//
// IMPORTANTE: todo lo que toca la base es asincrono (async/await).
// La seguridad real (quien puede leer o escribir que) esta en las
// politicas RLS de supabase/esquema.sql, no en este archivo.
// ============================================================
import { crearClienteSinSesion, obtenerCliente } from './supabase';

// -------- CONSTANTES --------
const CLAVE_ALMACENAMIENTO_CARRITO = 'unimarket_carrito';

export const ROL_ADMIN = 'admin';
export const ROL_CLIENTE = 'cliente';

// Un articulo con stock menor o igual a este numero se considera "critico".
export const UMBRAL_STOCK_CRITICO = 5;

export const ESTADOS_ORDEN = ['Pagada', 'Pendiente', 'Anulada'];

export const UNIVERSIDADES_DISPONIBLES = [
  'Instituto Profesional DUOC UC - Sede Alameda',
  'Instituto Profesional DUOC UC - Sede Plaza Oeste',
  'Instituto Profesional DUOC UC - Sede Plaza Vespucio',
  'Instituto Profesional DUOC UC - Sede San Carlos de Apoquindo',
  'Instituto Profesional DUOC UC - Sede Puente Alto',
  'Instituto Profesional DUOC UC - Sede Antonio Varas',
  'Instituto Profesional DUOC UC - Sede Melipilla',
  'Instituto Profesional DUOC UC - Sede Maipú',
  'Instituto Profesional DUOC UC - Sede Valparaíso',
  'Instituto Profesional DUOC UC - Sede Viña del Mar',
  'Instituto Profesional DUOC UC - Sede Concepción San Andrés',
  'Pontificia Universidad Católica de Chile',
];

const CORREO_VALIDO = /^\S+@\S+\.\S+$/;
const LARGO_MINIMO_CONTRASENA = 6;
export const normalizarCorreo = (correo) => (correo || '').trim().toLowerCase();

// -------- UTILIDADES INTERNAS --------

/** Traduce un error de Supabase/Postgres a un mensaje para mostrar. */
function mensajeDeError(error, porDefecto = 'Ocurrió un error. Intenta de nuevo.') {
  if (!error) return porDefecto;
  const texto = error.message || '';
  if (error.code === '42501' || /row-level security/i.test(texto)) return 'No tienes permiso para realizar esta acción.';
  if (error.code === '23503') return 'No se puede completar: hay datos que dependen de este registro.';
  if (error.code === '23505') return 'Ya existe un registro con ese valor.';
  if (/failed to fetch|networkerror|network request failed/i.test(texto)) return 'No se pudo conectar con el servidor.';
  return texto || porDefecto;
}

const falla = (error, porDefecto) => ({ ok: false, mensaje: mensajeDeError(error, porDefecto) });

/** Id del usuario con sesion (o null). */
async function idSesion() {
  const { data } = await obtenerCliente().auth.getSession();
  return data?.session?.user?.id ?? null;
}

// -------- MAPEO base de datos (snake_case) <-> app (camelCase) --------

const aUsuario = (f) =>
  f && {
    id: f.id,
    nombre: f.nombre,
    nombreUsuario: f.nombre_usuario,
    correo: f.correo,
    universidad: f.universidad || '',
    rol: f.rol || ROL_CLIENTE,
    foto: f.foto || null,
  };

const aArticulo = (f) =>
  f && {
    id: f.id,
    nombre: f.nombre,
    descripcion: f.descripcion,
    precio: Number(f.precio),
    calificacion: Number(f.calificacion),
    categoria: f.categoria,
    universidad: f.universidad,
    vendedor: f.vendedor,
    vendedorId: f.vendedor_id,
    distancia: Number(f.distancia),
    condicion: f.condicion,
    stock: f.stock,
    stockGuardado: f.stock_guardado,
    sku: f.sku,
    entrega: f.entrega,
    universidadesVenta: f.universidades_venta || [],
    fotos: f.fotos || [],
    creadoEn: Date.parse(f.creado_en),
  };

const aOrden = (f) =>
  f && {
    folio: f.folio,
    userId: f.user_id,
    creadaEn: Date.parse(f.creada_en),
    estado: f.estado,
    cliente: { nombre: f.cliente_nombre, correo: f.cliente_correo },
    metodoPago: f.metodo_pago,
    ultimosDigitos: f.ultimos_digitos,
    autorizacion: f.autorizacion,
    lineas: f.lineas || [],
    total: Number(f.total),
  };

// Campos de articulo app -> columna. Solo se envian los que vengan definidos.
const COLUMNAS_ARTICULO = {
  nombre: 'nombre',
  descripcion: 'descripcion',
  precio: 'precio',
  calificacion: 'calificacion',
  categoria: 'categoria',
  universidad: 'universidad',
  vendedor: 'vendedor',
  vendedorId: 'vendedor_id',
  distancia: 'distancia',
  condicion: 'condicion',
  stock: 'stock',
  stockGuardado: 'stock_guardado',
  sku: 'sku',
  entrega: 'entrega',
  universidadesVenta: 'universidades_venta',
  fotos: 'fotos',
};

function aFilaArticulo(articulo) {
  const fila = {};
  Object.entries(COLUMNAS_ARTICULO).forEach(([campo, columna]) => {
    if (articulo[campo] !== undefined) fila[columna] = articulo[campo];
  });
  return fila;
}

// ============================================================
// CARRITO (unico uso de localStorage)
// El carrito es un array simple con los IDs de los articulos agregados.
// ============================================================
export function cargarCarrito() {
  const almacenado = localStorage.getItem(CLAVE_ALMACENAMIENTO_CARRITO);
  if (!almacenado) return [];
  try {
    return JSON.parse(almacenado);
  } catch {
    return [];
  }
}

export function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_CARRITO, JSON.stringify(carrito));
}

// ============================================================
// AUTENTICACION (Supabase Auth) Y PERFILES
// ============================================================

/** Valida los campos comunes de crear/editar usuario. Devuelve un mensaje o null. */
export function validarDatosUsuario(datos, contrasenaObligatoria) {
  if (!(datos.nombre || '').trim()) return 'El nombre no puede quedar vacío.';
  if (!CORREO_VALIDO.test((datos.correo || '').trim())) return 'Ingresa un correo válido.';
  const contrasena = datos.contrasena || '';
  if ((contrasenaObligatoria || contrasena) && contrasena.length < LARGO_MINIMO_CONTRASENA) {
    return `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  }
  return null;
}

/** Perfil de un usuario por su id (o null). */
async function perfilPorId(id) {
  const { data } = await obtenerCliente().from('perfiles').select('*').eq('id', id).maybeSingle();
  return aUsuario(data);
}

/**
 * Registro publico: crea la cuenta en Supabase Auth (el trigger de la base
 * crea el perfil con rol 'cliente'). Si el proyecto exige confirmar el
 * correo, devuelve requiereConfirmacion:true y todavia no hay sesion.
 */
export async function registrarUsuario(datos) {
  const error = validarDatosUsuario(datos, true);
  if (error) return { ok: false, mensaje: error };

  const { data, error: errorAuth } = await obtenerCliente().auth.signUp({
    email: normalizarCorreo(datos.correo),
    password: datos.contrasena,
    options: {
      data: {
        nombre: datos.nombre.trim(),
        nombre_usuario: (datos.nombreUsuario || '').trim(),
        universidad: datos.universidad || '',
      },
    },
  });
  if (errorAuth) {
    if (/already registered/i.test(errorAuth.message)) return { ok: false, mensaje: 'Ya existe una cuenta con ese correo.' };
    return falla(errorAuth);
  }
  // Con confirmacion de correo activada, un correo repetido no da error: devuelve
  // un usuario sin identidades.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { ok: false, mensaje: 'Ya existe una cuenta con ese correo.' };
  }
  if (!data.session) return { ok: true, requiereConfirmacion: true };
  return { ok: true, usuario: await perfilPorId(data.user.id) };
}

/** Login. Devuelve { ok, usuario } o { ok:false, mensaje }. */
export async function iniciarSesion(correo, contrasena) {
  const { data, error } = await obtenerCliente().auth.signInWithPassword({
    email: normalizarCorreo(correo),
    password: contrasena,
  });
  if (error) {
    if (/invalid login credentials/i.test(error.message)) return { ok: false, mensaje: 'Correo o contraseña incorrectos.' };
    if (/email not confirmed/i.test(error.message)) return { ok: false, mensaje: 'Confirma tu correo antes de iniciar sesión.' };
    return falla(error);
  }
  const usuario = await perfilPorId(data.user.id);
  if (!usuario) return { ok: false, mensaje: 'Tu cuenta no tiene perfil. Contacta al administrador.' };
  return { ok: true, usuario };
}

export async function cerrarSesion() {
  await obtenerCliente().auth.signOut();
}

/** Usuario (perfil) con sesion activa, o null. */
export async function obtenerSesion() {
  const id = await idSesion();
  return id ? perfilPorId(id) : null;
}

/**
 * Avisa cada vez que la sesion cambia (login, logout, token renovado).
 * @param {(haySesion:boolean)=>void} alCambiar
 * @returns {() => void} funcion para dejar de escuchar
 */
export function suscribirSesion(alCambiar) {
  const { data } = obtenerCliente().auth.onAuthStateChange((_evento, sesion) => alCambiar(Boolean(sesion)));
  return () => data.subscription.unsubscribe();
}

/** Actualiza los datos propios (nombre, usuario, universidad). El correo no se cambia aqui. */
export async function actualizarUsuario(id, { nombre, nombreUsuario, universidad }) {
  if (!(nombre || '').trim()) return { ok: false, mensaje: 'El nombre no puede quedar vacío.' };
  const cliente = obtenerCliente();
  const { data, error } = await cliente
    .from('perfiles')
    .update({ nombre: nombre.trim(), nombre_usuario: (nombreUsuario || '').trim(), universidad: universidad || '' })
    .eq('id', id)
    .select()
    .single();
  if (error) return falla(error, 'No se pudo actualizar la cuenta.');
  await cliente.from('articulos').update({ vendedor: data.nombre }).eq('vendedor_id', id); // el nombre del vendedor sigue al perfil
  return { ok: true, usuario: aUsuario(data) };
}

/** La foto va dentro del perfil (data URL ya comprimida en el navegador). */
export async function guardarFotoPerfil(id, dataUrl) {
  const { error } = await obtenerCliente().from('perfiles').update({ foto: dataUrl }).eq('id', id);
  return error ? falla(error, 'No se pudo guardar la foto.') : { ok: true };
}

export async function borrarFotoPerfil(id) {
  const { error } = await obtenerCliente().from('perfiles').update({ foto: null }).eq('id', id);
  return error ? falla(error, 'No se pudo quitar la foto.') : { ok: true };
}

// -------- USUARIOS (panel de administracion) --------

/** Todos los perfiles (la politica RLS solo lo permite a administradores). */
export async function cargarUsuarios() {
  const { data, error } = await obtenerCliente().from('perfiles').select('*').order('creado_en', { ascending: true });
  return error ? [] : data.map(aUsuario);
}

export async function obtenerUsuario(correo) {
  const { data } = await obtenerCliente().from('perfiles').select('*').eq('correo', normalizarCorreo(correo)).maybeSingle();
  return aUsuario(data);
}

/**
 * Un admin crea la cuenta de otra persona. Se usa un cliente aparte sin
 * sesion para no cerrar la sesion del admin. Si el proyecto exige confirmar
 * el correo, la persona debe confirmarlo antes de entrar.
 */
export async function crearUsuario(datos) {
  const error = validarDatosUsuario(datos, true);
  if (error) return { ok: false, mensaje: error };

  const { data, error: errorAuth } = await crearClienteSinSesion().auth.signUp({
    email: normalizarCorreo(datos.correo),
    password: datos.contrasena,
    options: {
      data: {
        nombre: datos.nombre.trim(),
        nombre_usuario: (datos.nombreUsuario || '').trim(),
        universidad: datos.universidad || '',
      },
    },
  });
  if (errorAuth) {
    if (/already registered/i.test(errorAuth.message)) return { ok: false, mensaje: 'Ya existe una cuenta con ese correo.' };
    return falla(errorAuth);
  }
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { ok: false, mensaje: 'Ya existe una cuenta con ese correo.' };
  }
  if (datos.rol === ROL_ADMIN) {
    const { error: errorRol } = await obtenerCliente().from('perfiles').update({ rol: ROL_ADMIN }).eq('id', data.user.id);
    if (errorRol) return { ok: false, mensaje: 'La cuenta se creó, pero no se pudo darle rol de administrador: ' + mensajeDeError(errorRol) };
  }
  return { ok: true, usuario: { id: data.user.id, correo: normalizarCorreo(datos.correo) } };
}

async function cantidadAdmins() {
  const { count } = await obtenerCliente().from('perfiles').select('id', { count: 'exact', head: true }).eq('rol', ROL_ADMIN);
  return count ?? 0;
}

/**
 * Edita una cuenta desde el panel: nombre, usuario, universidad y rol.
 * El correo y la contrasena los maneja Supabase Auth, no se editan aqui.
 * No deja degradar al ultimo administrador (ademas lo exige un trigger en la base).
 */
export async function actualizarUsuarioAdmin(correo, datos) {
  const anterior = await obtenerUsuario(correo);
  if (!anterior) return { ok: false, mensaje: 'No se encontró la cuenta a actualizar.' };
  if (!(datos.nombre || '').trim()) return { ok: false, mensaje: 'El nombre no puede quedar vacío.' };

  const rolNuevo = datos.rol === ROL_ADMIN ? ROL_ADMIN : ROL_CLIENTE;
  if (anterior.rol === ROL_ADMIN && rolNuevo !== ROL_ADMIN && (await cantidadAdmins()) <= 1) {
    return { ok: false, mensaje: 'No puedes quitar el rol al único administrador.' };
  }

  const cliente = obtenerCliente();
  const { data, error } = await cliente
    .from('perfiles')
    .update({
      nombre: datos.nombre.trim(),
      nombre_usuario: (datos.nombreUsuario || '').trim(),
      universidad: datos.universidad || '',
      rol: rolNuevo,
    })
    .eq('id', anterior.id)
    .select()
    .single();
  if (error) return falla(error, 'No se pudo actualizar la cuenta.');

  if (data.nombre !== anterior.nombre) {
    await cliente.from('articulos').update({ vendedor: data.nombre }).eq('vendedor_id', anterior.id);
  }
  return { ok: true, usuario: aUsuario(data) };
}

/**
 * Elimina la cuenta completa (Auth + perfil) con la funcion eliminar_usuario
 * de la base. Sus articulos quedan sin dueno y sus ordenes se conservan.
 */
export async function eliminarUsuario(correo) {
  const usuario = await obtenerUsuario(correo);
  if (!usuario) return { ok: false, mensaje: 'No se encontró la cuenta.' };
  if (usuario.rol === ROL_ADMIN && (await cantidadAdmins()) <= 1) {
    return { ok: false, mensaje: 'No puedes eliminar al único administrador.' };
  }
  const { error } = await obtenerCliente().rpc('eliminar_usuario', { p_id: usuario.id });
  return error ? falla(error, 'No se pudo eliminar la cuenta.') : { ok: true };
}

// ============================================================
// CATEGORIAS
//   valor       : identificador estable que guardan los articulos (ej. 'snacks')
//   etiqueta    : nombre visible (ej. 'Snacks & Comida')
//   descripcion : texto corto para el panel (opcional)
// ============================================================
export async function cargarCategorias() {
  const { data, error } = await obtenerCliente().from('categorias').select('*').order('etiqueta', { ascending: true });
  return error ? [] : data;
}

export async function obtenerCategoria(valor) {
  const { data } = await obtenerCliente().from('categorias').select('*').eq('valor', valor).maybeSingle();
  return data || null;
}

/** "Tecnología & Electrónica" -> "tecnologia-electronica" (sin acentos ni simbolos). */
export function generarValorCategoria(etiqueta) {
  return etiqueta
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function crearCategoria({ etiqueta, descripcion }) {
  const nombre = (etiqueta || '').trim();
  if (!nombre) return { ok: false, mensaje: 'El nombre de la categoría no puede quedar vacío.' };
  const valor = generarValorCategoria(nombre);
  if (!valor) return { ok: false, mensaje: 'El nombre debe tener letras o números.' };

  const existentes = await cargarCategorias();
  if (existentes.some((c) => c.valor === valor || c.etiqueta.toLowerCase() === nombre.toLowerCase())) {
    return { ok: false, mensaje: 'Ya existe una categoría con ese nombre.' };
  }

  const { data, error } = await obtenerCliente()
    .from('categorias')
    .insert({ valor, etiqueta: nombre, descripcion: (descripcion || '').trim() })
    .select()
    .single();
  return error ? falla(error, 'No se pudo crear la categoría.') : { ok: true, categoria: data };
}

/** El `valor` no cambia al editar: asi los articulos existentes siguen enlazados. */
export async function actualizarCategoria(valor, { etiqueta, descripcion }) {
  const existentes = await cargarCategorias();
  const actual = existentes.find((c) => c.valor === valor);
  if (!actual) return { ok: false, mensaje: 'No se encontró la categoría.' };

  const nombre = (etiqueta || '').trim();
  if (!nombre) return { ok: false, mensaje: 'El nombre de la categoría no puede quedar vacío.' };
  if (existentes.some((c) => c.valor !== valor && c.etiqueta.toLowerCase() === nombre.toLowerCase())) {
    return { ok: false, mensaje: 'Ya existe otra categoría con ese nombre.' };
  }

  const { data, error } = await obtenerCliente()
    .from('categorias')
    .update({ etiqueta: nombre, descripcion: (descripcion || '').trim() })
    .eq('valor', valor)
    .select()
    .single();
  return error ? falla(error, 'No se pudo actualizar la categoría.') : { ok: true, categoria: data };
}

/** No deja borrar una categoria que todavia tiene articulos (la base tambien lo impide). */
export async function eliminarCategoria(valor) {
  const cliente = obtenerCliente();
  if (!(await obtenerCategoria(valor))) return { ok: false, mensaje: 'No se encontró la categoría.' };

  const { count } = await cliente.from('articulos').select('id', { count: 'exact', head: true }).eq('categoria', valor);
  if (count > 0) return { ok: false, mensaje: `No se puede eliminar: ${count} artículo(s) usan esta categoría.` };

  const { error } = await cliente.from('categorias').delete().eq('valor', valor);
  return error ? falla(error, 'No se pudo eliminar la categoría.') : { ok: true };
}

// ============================================================
// ARTICULOS
//   id, nombre, descripcion, precio, calificacion (0-5), categoria, universidad,
//   vendedor, vendedorId, distancia, condicion, stock, stockGuardado, sku, entrega,
//   universidadesVenta (vacio = todas), fotos (data URLs), creadoEn (ms)
// ============================================================
export async function cargarArticulos() {
  const { data, error } = await obtenerCliente().from('articulos').select('*').order('creado_en', { ascending: false });
  return error ? [] : data.map(aArticulo);
}

export async function obtenerArticulo(id) {
  const { data } = await obtenerCliente().from('articulos').select('*').eq('id', Number(id)).maybeSingle();
  return aArticulo(data);
}

/** Articulos publicados por una cuenta (para "Panel vendedor"), del mas nuevo al mas viejo. */
export async function articulosDeVendedor(idVendedor) {
  if (!idVendedor) return [];
  const { data, error } = await obtenerCliente()
    .from('articulos')
    .select('*')
    .eq('vendedor_id', idVendedor)
    .order('creado_en', { ascending: false });
  return error ? [] : data.map(aArticulo);
}

/** Valida nombre, precio, stock y categoria. Devuelve un mensaje o null. */
export function validarDatosArticulo(datos) {
  if (!(datos.nombre || '').trim()) return 'El nombre del producto no puede quedar vacío.';
  const precio = Number(datos.precio);
  if (datos.precio === '' || datos.precio === null || Number.isNaN(precio) || precio < 0) {
    return 'Ingresa un precio válido (0 o mayor).';
  }
  const stock = Number(datos.stock);
  if (datos.stock === '' || datos.stock === null || !Number.isInteger(stock) || stock < 0) {
    return 'El stock debe ser un número entero (0 o mayor).';
  }
  if (!datos.categoria) return 'Elige una categoría.';
  return null;
}

/**
 * Crea un articulo (lo usan Publicar y el panel). Queda a nombre de la cuenta
 * con sesion (vendedorId); completa con valores por defecto lo que falte.
 */
export async function crearArticulo(datos) {
  const error = validarDatosArticulo(datos);
  if (error) return { ok: false, mensaje: error };

  const nuevo = {
    nombre: datos.nombre.trim(),
    descripcion: (datos.descripcion || '').trim(),
    precio: Number(datos.precio),
    categoria: datos.categoria,
    universidad: datos.universidad || '',
    vendedor: (datos.vendedor || '').trim() || 'UniMarket',
    vendedorId: datos.vendedorId ?? (await idSesion()),
    condicion: datos.condicion || 'Nuevo (Sellado)',
    stock: Number(datos.stock),
    sku: (datos.sku || '').trim() || 'SKU-' + Date.now().toString(36).toUpperCase(),
    entrega: (datos.entrega || '').trim() || 'A convenir',
    universidadesVenta: datos.universidadesVenta || [],
    fotos: datos.fotos || [],
  };

  const { data, error: errorBd } = await obtenerCliente().from('articulos').insert(aFilaArticulo(nuevo)).select().single();
  return errorBd ? falla(errorBd, 'No se pudo guardar el producto.') : { ok: true, articulo: aArticulo(data) };
}

/** Edita un articulo existente. Solo cambia los campos que vengan en `cambios`. */
export async function actualizarArticulo(id, cambios) {
  const actual = await obtenerArticulo(id);
  if (!actual) return { ok: false, mensaje: 'No se encontró el producto.' };

  const combinado = { ...actual, ...cambios };
  const error = validarDatosArticulo(combinado);
  if (error) return { ok: false, mensaje: error };

  const fila = aFilaArticulo({
    ...cambios,
    ...(cambios.nombre !== undefined && { nombre: cambios.nombre.trim() }),
    ...(cambios.precio !== undefined && { precio: Number(cambios.precio) }),
    ...(cambios.stock !== undefined && { stock: Number(cambios.stock) }),
  });
  const { data, error: errorBd } = await obtenerCliente().from('articulos').update(fila).eq('id', Number(id)).select().single();
  return errorBd ? falla(errorBd, 'No se pudo actualizar el producto.') : { ok: true, articulo: aArticulo(data) };
}

export async function eliminarArticulo(id) {
  if (!(await obtenerArticulo(id))) return { ok: false, mensaje: 'No se encontró el producto.' };
  const { error } = await obtenerCliente().from('articulos').delete().eq('id', Number(id));
  return error ? falla(error, 'No se pudo eliminar el producto.') : { ok: true };
}

/** Articulos con stock bajo (<= umbral), del mas urgente al menos. */
export async function obtenerArticulosCriticos(umbral = UMBRAL_STOCK_CRITICO) {
  const { data, error } = await obtenerCliente().from('articulos').select('*').lte('stock', umbral).order('stock', { ascending: true });
  return error ? [] : data.map(aArticulo);
}

// ============================================================
// ORDENES / BOLETAS
// Cada compra confirmada en la pasarela (Pago.jsx) guarda una orden.
//   folio  : 'BOL-100001' (lo genera la base con una secuencia)
//   lineas : [{ idArticulo, nombre, categoria, vendedor, precio, cantidad }]
//            (copia al momento de comprar: si el articulo cambia, la boleta no)
// ============================================================
export function calcularTotalLineas(lineas) {
  return lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);
}

/** Todas las ordenes (admin) o solo las propias (cliente), segun la politica RLS. */
export async function cargarOrdenes() {
  const { data, error } = await obtenerCliente().from('ordenes').select('*').order('creada_en', { ascending: false });
  return error ? [] : data.map(aOrden);
}

export async function obtenerOrden(folio) {
  const { data } = await obtenerCliente().from('ordenes').select('*').eq('folio', folio).maybeSingle();
  return aOrden(data);
}

/** Ordenes de un cliente (historial de compras), de la mas nueva a la mas vieja. */
export async function ordenesDeUsuario(correo) {
  const { data, error } = await obtenerCliente()
    .from('ordenes')
    .select('*')
    .eq('cliente_correo', normalizarCorreo(correo))
    .order('creada_en', { ascending: false });
  return error ? [] : data.map(aOrden);
}

/** Guarda una orden nueva (la llama Pago.jsx al confirmar el pago). */
export async function crearOrden({ cliente, lineas, metodoPago, ultimosDigitos, autorizacion, estado = 'Pagada' }) {
  const fila = {
    user_id: await idSesion(),
    cliente_nombre: cliente.nombre,
    cliente_correo: normalizarCorreo(cliente.correo),
    estado,
    metodo_pago: metodoPago,
    ultimos_digitos: ultimosDigitos,
    autorizacion,
    lineas,
    total: calcularTotalLineas(lineas),
  };
  const { data, error } = await obtenerCliente().from('ordenes').insert(fila).select().single();
  return error ? falla(error, 'No se pudo registrar la compra.') : { ok: true, orden: aOrden(data) };
}

export async function actualizarEstadoOrden(folio, estado) {
  if (!ESTADOS_ORDEN.includes(estado)) return { ok: false, mensaje: 'Estado no válido.' };
  if (!(await obtenerOrden(folio))) return { ok: false, mensaje: 'No se encontró la orden.' };
  const { data, error } = await obtenerCliente().from('ordenes').update({ estado }).eq('folio', folio).select().single();
  return error ? falla(error, 'No se pudo cambiar el estado.') : { ok: true, orden: aOrden(data) };
}
