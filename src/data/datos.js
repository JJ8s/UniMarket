import { crearClienteSinSesion, obtenerCliente } from './supabase';

const CLAVE_ALMACENAMIENTO_CARRITO = 'unimarket_carrito';

export const ROL_ADMIN = 'admin';
export const ROL_CLIENTE = 'cliente';

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

// UTILIDADES INTERNAS

/** Traduce un error */
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

/** Id del usuario */
async function idSesion() {
  const { data } = await obtenerCliente().auth.getSession();
  return data?.session?.user?.id ?? null;
}

// MAPEO BD <-> APP

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

// AUTENTICACION Y PERFILES

export function validarDatosUsuario(datos, contrasenaObligatoria) {
  if (!(datos.nombre || '').trim()) return 'El nombre no puede quedar vacío.';
  if (!CORREO_VALIDO.test((datos.correo || '').trim())) return 'Ingresa un correo válido.';
  const contrasena = datos.contrasena || '';
  if ((contrasenaObligatoria || contrasena) && contrasena.length < LARGO_MINIMO_CONTRASENA) {
    return `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
  }
  return null;
}

/** Perfil de un usuario por */
async function perfilPorId(id) {
  const { data } = await obtenerCliente().from('perfiles').select('*').eq('id', id).maybeSingle();
  return aUsuario(data);
}

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
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { ok: false, mensaje: 'Ya existe una cuenta con ese correo.' };
  }
  if (!data.session) return { ok: true, requiereConfirmacion: true };
  return { ok: true, usuario: await perfilPorId(data.user.id) };
}

/** Login */
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

/** Usuario con sesion */
export async function obtenerSesion() {
  const id = await idSesion();
  return id ? perfilPorId(id) : null;
}

export function suscribirSesion(alCambiar) {
  const { data } = obtenerCliente().auth.onAuthStateChange((_evento, sesion) => alCambiar(Boolean(sesion)));
  return () => data.subscription.unsubscribe();
}

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
  await cliente.from('articulos').update({ vendedor: data.nombre }).eq('vendedor_id', id);
  return { ok: true, usuario: aUsuario(data) };
}

/** La foto va */
export async function guardarFotoPerfil(id, dataUrl) {
  const { error } = await obtenerCliente().from('perfiles').update({ foto: dataUrl }).eq('id', id);
  return error ? falla(error, 'No se pudo guardar la foto.') : { ok: true };
}

export async function borrarFotoPerfil(id) {
  const { error } = await obtenerCliente().from('perfiles').update({ foto: null }).eq('id', id);
  return error ? falla(error, 'No se pudo quitar la foto.') : { ok: true };
}

// USUARIOS

export async function cargarUsuarios() {
  const { data, error } = await obtenerCliente().from('perfiles').select('*').order('creado_en', { ascending: true });
  return error ? [] : data.map(aUsuario);
}

export async function obtenerUsuario(correo) {
  const { data } = await obtenerCliente().from('perfiles').select('*').eq('correo', normalizarCorreo(correo)).maybeSingle();
  return aUsuario(data);
}

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

export async function eliminarUsuario(correo) {
  const usuario = await obtenerUsuario(correo);
  if (!usuario) return { ok: false, mensaje: 'No se encontró la cuenta.' };
  if (usuario.rol === ROL_ADMIN && (await cantidadAdmins()) <= 1) {
    return { ok: false, mensaje: 'No puedes eliminar al único administrador.' };
  }
  const { error } = await obtenerCliente().rpc('eliminar_usuario', { p_id: usuario.id });
  return error ? falla(error, 'No se pudo eliminar la cuenta.') : { ok: true };
}

export async function cargarCategorias() {
  const { data, error } = await obtenerCliente().from('categorias').select('*').order('etiqueta', { ascending: true });
  return error ? [] : data;
}

export async function obtenerCategoria(valor) {
  const { data } = await obtenerCliente().from('categorias').select('*').eq('valor', valor).maybeSingle();
  return data || null;
}

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

export async function eliminarCategoria(valor) {
  const cliente = obtenerCliente();
  if (!(await obtenerCategoria(valor))) return { ok: false, mensaje: 'No se encontró la categoría.' };

  const { count } = await cliente.from('articulos').select('id', { count: 'exact', head: true }).eq('categoria', valor);
  if (count > 0) return { ok: false, mensaje: `No se puede eliminar: ${count} artículo(s) usan esta categoría.` };

  const { error } = await cliente.from('categorias').delete().eq('valor', valor);
  return error ? falla(error, 'No se pudo eliminar la categoría.') : { ok: true };
}

export async function cargarArticulos() {
  const { data, error } = await obtenerCliente().from('articulos').select('*').order('creado_en', { ascending: false });
  return error ? [] : data.map(aArticulo);
}

export async function obtenerArticulo(id) {
  const { data } = await obtenerCliente().from('articulos').select('*').eq('id', Number(id)).maybeSingle();
  return aArticulo(data);
}

export async function articulosDeVendedor(idVendedor) {
  if (!idVendedor) return [];
  const { data, error } = await obtenerCliente()
    .from('articulos')
    .select('*')
    .eq('vendedor_id', idVendedor)
    .order('creado_en', { ascending: false });
  return error ? [] : data.map(aArticulo);
}

/** Valida nombre */
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

/** Articulos con stock bajo */
export async function obtenerArticulosCriticos(umbral = UMBRAL_STOCK_CRITICO) {
  const { data, error } = await obtenerCliente().from('articulos').select('*').lte('stock', umbral).order('stock', { ascending: true });
  return error ? [] : data.map(aArticulo);
}

export function calcularTotalLineas(lineas) {
  return lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);
}

export async function cargarOrdenes() {
  const { data, error } = await obtenerCliente().from('ordenes').select('*').order('creada_en', { ascending: false });
  return error ? [] : data.map(aOrden);
}

export async function obtenerOrden(folio) {
  const { data } = await obtenerCliente().from('ordenes').select('*').eq('folio', folio).maybeSingle();
  return aOrden(data);
}

export async function ordenesDeUsuario(correo) {
  const { data, error } = await obtenerCliente()
    .from('ordenes')
    .select('*')
    .eq('cliente_correo', normalizarCorreo(correo))
    .order('creada_en', { ascending: false });
  return error ? [] : data.map(aOrden);
}

/** Compra: el servidor valida el */
export async function crearOrden({ lineas, metodoPago, ultimosDigitos, autorizacion }) {
  const { data, error } = await obtenerCliente().rpc('crear_orden', {
    p_lineas: lineas.map(({ idArticulo, cantidad }) => ({ idArticulo, cantidad })),
    p_metodo_pago: metodoPago,
    p_ultimos_digitos: ultimosDigitos,
    p_autorizacion: autorizacion,
  });
  return error ? falla(error, 'No se pudo registrar la compra.') : { ok: true, orden: aOrden(data) };
}

export async function actualizarEstadoOrden(folio, estado) {
  if (!ESTADOS_ORDEN.includes(estado)) return { ok: false, mensaje: 'Estado no válido.' };
  if (!(await obtenerOrden(folio))) return { ok: false, mensaje: 'No se encontró la orden.' };
  const { data, error } = await obtenerCliente().from('ordenes').update({ estado }).eq('folio', folio).select().single();
  return error ? falla(error, 'No se pudo cambiar el estado.') : { ok: true, orden: aOrden(data) };
}
