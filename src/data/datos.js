// ============================================================
// Capa de datos (localStorage). Es el unico archivo que toca
// localStorage directamente. Antes exponia todo en `window`; ahora
// cada funcion se importa donde se necesita:
//   import { cargarArticulos } from '../data/datos';
// ============================================================

// -------- LLAVES DE ALMACENAMIENTO (localStorage) --------
const CLAVE_ALMACENAMIENTO_ARTICULOS = 'unimarket_articulos';
const CLAVE_ALMACENAMIENTO_CARRITO = 'unimarket_carrito';
const CLAVE_ALMACENAMIENTO_SESION = 'unimarket_sesion';
const CLAVE_ALMACENAMIENTO_USUARIOS = 'unimarket_usuarios';
const CLAVE_ALMACENAMIENTO_CATEGORIAS = 'unimarket_categorias';
const CLAVE_ALMACENAMIENTO_ORDENES = 'unimarket_ordenes';

// Roles posibles de una cuenta. Solo 'admin' puede entrar a /admin.
export const ROL_ADMIN = 'admin';
export const ROL_CLIENTE = 'cliente';

// Un articulo con stock menor o igual a este numero se considera "critico"
// (aparece en el listado de productos criticos del panel de administracion).
export const UMBRAL_STOCK_CRITICO = 5;

// -------- ARTICULOS SEMILLA --------
// Estructura de cada articulo:
//   id           : identificador unico (number)
//   nombre       : nombre del producto (string)
//   descripcion  : descripcion corta del producto (string)
//   precio       : precio de venta en dolares (number)
//   calificacion : calificacion del articulo/vendedor, de 0 a 5 (number)
//   categoria    : 'snacks' | 'ropa' | 'tecnologia' | 'libros' | 'otros'
//   universidad  : universidad del vendedor (string)
//   vendedor     : nombre del vendedor (string)
//   distancia    : distancia en kilometros hasta el usuario (number)
//   condicion    : estado del articulo, ej. 'Nuevo (Sellado)' (string)
//   stock        : cantidad disponible (number)
//   sku          : codigo unico de inventario, generado por la web (string)
//   entrega      : texto libre con el punto de entrega (string)
//   universidadesVenta : universidades a las que vende el articulo.
//                        Array vacio significa "todas" (sin restriccion).
//   fotos        : array de fotos en formato data URL, opcional (Array<string>)
//   creadoEn     : marca de tiempo de creacion, en milisegundos (number)
export const ARTICULOS_POR_DEFECTO = [
  {
    id: 1,
    nombre: 'Brownies de Chocolate Caseros',
    descripcion: 'Deliciosos brownies con chispas de chocolate, hechos en casa.',
    precio: 2.5,
    calificacion: 5.0,
    categoria: 'snacks',
    universidad: 'UNAM',
    vendedor: 'María G.',
    distancia: 0.5,
    condicion: 'Casero',
    stock: 10,
    sku: '',
    entrega: 'Entrada de la Facultad de Ingenieria',
    universidadesVenta: [],
    creadoEn: Date.now() - 1000000,
  },
  {
    id: 2,
    nombre: 'Calculadora Científica Casio fx-991LA X',
    descripcion: 'Como nueva, con estuche para ingeniería.',
    precio: 15.0,
    calificacion: 4.8,
    categoria: 'tecnologia',
    universidad: 'IPN',
    vendedor: 'Carlos R.',
    distancia: 1.2,
    condicion: 'Usado',
    stock: 1,
    sku: 'CALC-CASIO-991',
    entrega: 'Biblioteca Central - Entrada',
    universidadesVenta: [],
    creadoEn: Date.now() - 2000000,
  },
  {
    id: 3,
    nombre: 'Chaqueta Denim Vintage',
    descripcion: 'Talla M, excelente estado, estilo retro.',
    precio: 20.0,
    calificacion: 4.9,
    categoria: 'ropa',
    universidad: 'Tec de Monterrey',
    vendedor: 'Ana V.',
    distancia: 2.5,
    condicion: '2da Mano',
    stock: 1,
    sku: '',
    entrega: 'A convenir por chat',
    universidadesVenta: [],
    creadoEn: Date.now() - 3000000,
  },
  {
    id: 4,
    nombre: 'Bebida Energética Monster Original 473ml',
    descripcion: 'Lata fría, directo del kiosco central.',
    precio: 3.0,
    calificacion: 4.5,
    categoria: 'snacks',
    universidad: 'UAM',
    vendedor: 'Kiosco Central',
    distancia: 0.2,
    condicion: 'Nuevo',
    stock: 25,
    sku: '',
    entrega: 'Kiosco Central',
    universidadesVenta: [],
    creadoEn: Date.now() - 4000000,
  },
];

// -------- USUARIOS REGISTRADOS (mock de autenticacion, sin backend) --------
// Como el proyecto todavia no tiene servidor, la "base de datos" de
// usuarios es simplemente un array guardado en localStorage. Se arranca
// con una cuenta de prueba para poder loguearse de inmediato:
//   correo: juan.perez@unimarket.edu   contraseña: 123456
//
// Tambien hay una cuenta de administrador (rol 'admin') para entrar al
// panel /admin:
//   correo: admin@unimarket.edu        contraseña: admin123
export const USUARIOS_POR_DEFECTO = [
  {
    nombre: 'Juan Pérez',
    nombreUsuario: '@juanperez',
    correo: 'juan.perez@unimarket.edu',
    universidad: 'UNAM',
    contrasena: '123456',
    rol: ROL_CLIENTE,
  },
  {
    nombre: 'Administrador UniMarket',
    nombreUsuario: '@admin',
    correo: 'admin@unimarket.edu',
    universidad: 'Instituto Profesional DUOC UC - Sede Alameda',
    contrasena: 'admin123',
    rol: ROL_ADMIN,
  },
];

// Cuenta admin de respaldo: si la lista guardada en localStorage (creada
// antes de que existieran los roles) no tiene ningun admin, se agrega esta.
const ADMIN_POR_DEFECTO = USUARIOS_POR_DEFECTO.find((u) => u.rol === ROL_ADMIN);

function asegurarAdmin(usuarios) {
  const hayAdmin = usuarios.some((u) => u.rol === ROL_ADMIN);
  return hayAdmin ? usuarios : [...usuarios, { ...ADMIN_POR_DEFECTO }];
}

// -------- UNIVERSIDADES DISPONIBLES --------
// Lista usada en dos lugares:
//   1. publicar.html: el vendedor marca a que universidades vende.
//   2. index.html: el comprador filtra el catalogo por universidad.
//
// Nota: esta es una lista de ejemplo con nombres completos (sin
// acronimos de sede). Ajusta o agrega los nombres exactos de tus
// sedes reales antes de usar esto en produccion.
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

/**
 * Lee los articulos guardados en localStorage.
 * Si no hay nada guardado (primera vez que se abre la app) o el
 * JSON esta corrupto, devuelve una copia de los articulos semilla.
 * @returns {Array<Object>} lista de articulos
 */
export function cargarArticulos() {
  const almacenados = localStorage.getItem(CLAVE_ALMACENAMIENTO_ARTICULOS);
  if (almacenados) {
    try {
      return JSON.parse(almacenados);
    } catch {
      return [...ARTICULOS_POR_DEFECTO];
    }
  }
  return [...ARTICULOS_POR_DEFECTO];
}

/**
 * Guarda el array de articulos completo en localStorage.
 * @param {Array<Object>} articulos - lista completa de articulos a guardar
 */
export function guardarArticulos(articulos) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_ARTICULOS, JSON.stringify(articulos));
}

/**
 * Lee el carrito ("bolsa de compras") guardado en localStorage.
 * El carrito es un array simple con los IDs de los articulos agregados.
 * @returns {Array<number>} ids de articulos en la bolsa
 */
export function cargarCarrito() {
  const almacenado = localStorage.getItem(CLAVE_ALMACENAMIENTO_CARRITO);
  if (almacenado) {
    try {
      return JSON.parse(almacenado);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Guarda el carrito (array de ids de articulos) en localStorage.
 * @param {Array<number>} carrito
 */
export function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_CARRITO, JSON.stringify(carrito));
}

/**
 * Calcula el siguiente id disponible a partir de una lista de
 * articulos, buscando el id mas alto y sumando uno.
 * @param {Array<Object>} articulos
 * @returns {number} siguiente id disponible
 */
export function obtenerSiguienteId(articulos) {
  if (!articulos || articulos.length === 0) return 1;
  const idMaximo = articulos.reduce((maximo, articulo) => Math.max(maximo, articulo.id), 0);
  return idMaximo + 1;
}

// -------- USUARIOS (registro / login / logout, mock con localStorage) --------
// Este bloque es lo unico que agrega la capa de autenticacion. No toca
// ninguna de las funciones de arriba (articulos, carrito, universidades).

/**
 * Lee la lista de usuarios registrados desde localStorage.
 * Si no hay nada guardado todavia, la crea con el usuario de prueba.
 * @returns {Array<Object>} lista de usuarios { nombre, nombreUsuario, correo, universidad, contrasena }
 */
export function cargarUsuarios() {
  const almacenados = localStorage.getItem(CLAVE_ALMACENAMIENTO_USUARIOS);
  if (almacenados) {
    try {
      return asegurarAdmin(JSON.parse(almacenados));
    } catch {
      return [...USUARIOS_POR_DEFECTO];
    }
  }
  return [...USUARIOS_POR_DEFECTO];
}

/**
 * Guarda la lista completa de usuarios en localStorage.
 * @param {Array<Object>} usuarios
 */
export function guardarUsuarios(usuarios) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_USUARIOS, JSON.stringify(usuarios));
}

/**
 * Registra un nuevo usuario si el correo no esta en uso.
 * @param {{nombre:string, nombreUsuario:string, correo:string, contrasena:string, universidad?:string}} datos
 * @returns {{ok:boolean, mensaje?:string, usuario?:Object}}
 */
export function registrarUsuario(datos) {
  const usuarios = cargarUsuarios();
  const correoNormalizado = (datos.correo || '').trim().toLowerCase();

  const yaExiste = usuarios.some(u => u.correo.trim().toLowerCase() === correoNormalizado);
  if (yaExiste) {
    return { ok: false, mensaje: 'Ya existe una cuenta con ese correo.' };
  }

  const nuevoUsuario = {
    nombre: datos.nombre || '',
    nombreUsuario: datos.nombreUsuario || '',
    correo: datos.correo,
    universidad: datos.universidad || '',
    contrasena: datos.contrasena,
    rol: datos.rol === ROL_ADMIN ? ROL_ADMIN : ROL_CLIENTE, // el registro publico siempre es cliente
  };

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);
  return { ok: true, usuario: nuevoUsuario };
}

/**
 * Verifica un correo y contraseña contra los usuarios registrados.
 * El correo se compara sin importar mayusculas/minusculas ni espacios
 * sobrantes, para que "Juan.Perez@unimarket.edu " si encuentre la cuenta.
 * @param {string} correo
 * @param {string} contrasena
 * @returns {Object|null} el usuario si las credenciales son correctas, si no null
 */
export function validarCredenciales(correo, contrasena) {
  const usuarios = cargarUsuarios();
  const correoNormalizado = (correo || '').trim().toLowerCase();

  return usuarios.find(u =>
    u.correo.trim().toLowerCase() === correoNormalizado && u.contrasena === contrasena
  ) || null;
}

/**
 * Guarda en localStorage al usuario que acaba de iniciar sesion.
 * Se guarda el correo tal cual quedo registrado (sin recortar ni
 * cambiar mayusculas), para que se muestre exactamente igual en
 * todo el sitio (header, perfil, etc.). Esto es lo que corrige que
 * el correo mostrado al final no coincidiera con la cuenta usada.
 * @param {Object} usuario - usuario devuelto por validarCredenciales() o registrarUsuario()
 */
export function iniciarSesion(usuario) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify({
    nombre: usuario.nombre,
    nombreUsuario: usuario.nombreUsuario,
    correo: usuario.correo,
    universidad: usuario.universidad || '',
    rol: usuario.rol || ROL_CLIENTE,
    iniciadaEn: Date.now(),
  }));
}

/**
 * Borra la sesion guardada. Se llama al hacer click en
 * "Salir de la sesion".
 */
export function cerrarSesion() {
  localStorage.removeItem(CLAVE_ALMACENAMIENTO_SESION);
}

/**
 * Indica si hay una sesion activa guardada en localStorage.
 * @returns {boolean}
 */
export function haySesionActiva() {
  return localStorage.getItem(CLAVE_ALMACENAMIENTO_SESION) !== null;
}

/**
 * Devuelve los datos del usuario con sesion activa, o null si no hay.
 * @returns {Object|null}
 */
export function obtenerSesion() {
  const guardada = localStorage.getItem(CLAVE_ALMACENAMIENTO_SESION);
  if (!guardada) return null;
  try {
    return JSON.parse(guardada);
  } catch {
    return null;
  }
}

/**
 * Actualiza los datos editables de una cuenta ya registrada (nombre,
 * correo, universidad). No permite cambiar la contraseña ni el nombre
 * de usuario desde aqui. Usado por el boton "Editar" de perfil.html.
 * @param {string} correoOriginal - correo con el que se encontro/inicio sesion la cuenta
 * @param {{nombre:string, correo:string, universidad?:string}} datosNuevos
 * @returns {{ok:boolean, mensaje?:string, usuario?:Object}}
 */
export function actualizarUsuario(correoOriginal, datosNuevos) {
  const usuarios = cargarUsuarios();
  const correoOriginalNormalizado = (correoOriginal || '').trim().toLowerCase();
  const indice = usuarios.findIndex(u => u.correo.trim().toLowerCase() === correoOriginalNormalizado);

  if (indice === -1) {
    return { ok: false, mensaje: 'No se encontró la cuenta a actualizar.' };
  }

  const correoNuevoNormalizado = (datosNuevos.correo || '').trim().toLowerCase();
  const correoEnUsoPorOtraCuenta = usuarios.some((u, i) =>
    i !== indice && u.correo.trim().toLowerCase() === correoNuevoNormalizado
  );
  if (correoEnUsoPorOtraCuenta) {
    return { ok: false, mensaje: 'Ya existe otra cuenta con ese correo.' };
  }

  usuarios[indice] = {
    ...usuarios[indice],
    nombre: datosNuevos.nombre,
    correo: datosNuevos.correo,
    universidad: datosNuevos.universidad || '',
  };

  guardarUsuarios(usuarios);
  if (correoNuevoNormalizado !== correoOriginalNormalizado) {
    migrarCorreoEnOrdenes(correoOriginal, datosNuevos.correo);
  }
  return { ok: true, usuario: usuarios[indice] };
}

/**
 * Guarda/lee/borra la foto de perfil de una cuenta. Se guarda como un
 * dataURL (imagen ya redimensionada y comprimida en el navegador antes
 * de llegar aqui, ver perfil.html) bajo una llave propia por correo,
 * para no mezclar fotos de distintas cuentas y no tener que reescribir
 * un JSON grande cada vez que alguien cambia su foto.
 */
export function obtenerFotoPerfil(correo) {
  if (!correo) return null;
  return localStorage.getItem('unimarket_foto_' + correo.trim().toLowerCase());
}

export function guardarFotoPerfil(correo, dataUrl) {
  if (!correo) return;
  localStorage.setItem('unimarket_foto_' + correo.trim().toLowerCase(), dataUrl);
}

export function borrarFotoPerfil(correo) {
  if (!correo) return;
  localStorage.removeItem('unimarket_foto_' + correo.trim().toLowerCase());
}

// ============================================================
// ADMINISTRACION
// CRUD que usa el panel /admin (usuarios, categorias, articulos y
// ordenes). Sigue la regla del proyecto: este archivo es el unico que
// toca localStorage. Todas las funciones que pueden fallar devuelven
// { ok:boolean, mensaje?:string, ...datos } en vez de lanzar errores.
// ============================================================

const normalizarCorreo = (correo) => (correo || '').trim().toLowerCase();
const CORREO_VALIDO = /^\S+@\S+\.\S+$/;
const LARGO_MINIMO_CONTRASENA = 6;

// -------- USUARIOS (admin) --------

/** Busca un usuario por correo (sin distinguir mayusculas ni espacios). */
export function obtenerUsuario(correo) {
  const buscado = normalizarCorreo(correo);
  return cargarUsuarios().find((u) => normalizarCorreo(u.correo) === buscado) || null;
}

/**
 * Indica si el correo pertenece a un administrador. Consulta la lista de
 * usuarios y no solo la sesion, para que el rol se verifique en el "modelo".
 * (Sigue siendo localStorage: no es seguridad real, ver DOCUMENTACION.md.)
 */
export function esAdmin(correo) {
  const usuario = obtenerUsuario(correo);
  return !!usuario && usuario.rol === ROL_ADMIN;
}

/**
 * Valida los campos comunes de crear/editar usuario.
 * `contrasenaObligatoria` es true al crear y false al editar (vacia = no cambia).
 */
function validarDatosUsuario(datos, contrasenaObligatoria) {
  if (!(datos.nombre || '').trim()) return 'El nombre no puede quedar vacío.';
  if (!CORREO_VALIDO.test((datos.correo || '').trim())) return 'Ingresa un correo válido.';
  const contrasena = datos.contrasena || '';
  if (contrasenaObligatoria || contrasena) {
    if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
      return `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
    }
  }
  return null;
}

/** Crea una cuenta desde el panel (permite elegir el rol). */
export function crearUsuario(datos) {
  const error = validarDatosUsuario(datos, true);
  if (error) return { ok: false, mensaje: error };
  return registrarUsuario({
    nombre: datos.nombre.trim(),
    nombreUsuario: (datos.nombreUsuario || '').trim(),
    correo: datos.correo.trim(),
    universidad: datos.universidad || '',
    contrasena: datos.contrasena,
    rol: datos.rol,
  });
}

/**
 * Edita una cuenta desde el panel: nombre, usuario, correo, universidad,
 * rol y (opcional) contraseña. Mantiene la coherencia con otros datos:
 *  - si cambia el nombre, los articulos del vendedor se renombran;
 *  - si cambia el correo, la foto de perfil se mueve a la llave nueva;
 *  - no deja degradar al ultimo administrador.
 */
export function actualizarUsuarioAdmin(correoOriginal, datos) {
  const usuarios = cargarUsuarios();
  const original = normalizarCorreo(correoOriginal);
  const indice = usuarios.findIndex((u) => normalizarCorreo(u.correo) === original);
  if (indice === -1) return { ok: false, mensaje: 'No se encontró la cuenta a actualizar.' };

  const error = validarDatosUsuario(datos, false);
  if (error) return { ok: false, mensaje: error };

  const correoNuevo = datos.correo.trim();
  const enUsoPorOtra = usuarios.some((u, i) => i !== indice && normalizarCorreo(u.correo) === normalizarCorreo(correoNuevo));
  if (enUsoPorOtra) return { ok: false, mensaje: 'Ya existe otra cuenta con ese correo.' };

  const anterior = usuarios[indice];
  const rolNuevo = datos.rol === ROL_ADMIN ? ROL_ADMIN : ROL_CLIENTE;
  const cantidadAdmins = usuarios.filter((u) => u.rol === ROL_ADMIN).length;
  if (anterior.rol === ROL_ADMIN && rolNuevo !== ROL_ADMIN && cantidadAdmins <= 1) {
    return { ok: false, mensaje: 'No puedes quitar el rol al único administrador.' };
  }

  const actualizado = {
    ...anterior,
    nombre: datos.nombre.trim(),
    nombreUsuario: (datos.nombreUsuario || '').trim(),
    correo: correoNuevo,
    universidad: datos.universidad || '',
    rol: rolNuevo,
    contrasena: datos.contrasena ? datos.contrasena : anterior.contrasena,
  };
  usuarios[indice] = actualizado;
  guardarUsuarios(usuarios);

  if (actualizado.nombre !== anterior.nombre) {
    const articulos = cargarArticulos();
    if (articulos.some((a) => a.vendedor === anterior.nombre)) {
      guardarArticulos(articulos.map((a) => (a.vendedor === anterior.nombre ? { ...a, vendedor: actualizado.nombre } : a)));
    }
  }
  if (normalizarCorreo(actualizado.correo) !== original) {
    migrarCorreoEnOrdenes(anterior.correo, actualizado.correo);
    const foto = obtenerFotoPerfil(anterior.correo);
    if (foto) {
      guardarFotoPerfil(actualizado.correo, foto);
      borrarFotoPerfil(anterior.correo);
    }
  }
  return { ok: true, usuario: actualizado };
}

/**
 * Elimina una cuenta. No permite borrar al ultimo administrador. Sus
 * publicaciones y ordenes se conservan (las ordenes son historial).
 */
export function eliminarUsuario(correo) {
  const usuarios = cargarUsuarios();
  const objetivo = normalizarCorreo(correo);
  const usuario = usuarios.find((u) => normalizarCorreo(u.correo) === objetivo);
  if (!usuario) return { ok: false, mensaje: 'No se encontró la cuenta.' };

  const cantidadAdmins = usuarios.filter((u) => u.rol === ROL_ADMIN).length;
  if (usuario.rol === ROL_ADMIN && cantidadAdmins <= 1) {
    return { ok: false, mensaje: 'No puedes eliminar al único administrador.' };
  }
  guardarUsuarios(usuarios.filter((u) => normalizarCorreo(u.correo) !== objetivo));
  borrarFotoPerfil(correo);
  return { ok: true };
}

// -------- CATEGORIAS --------
// Antes las categorias estaban escritas a mano en utilidades.js. Ahora son
// datos editables desde el panel y el catalogo, el formulario de publicar y
// el footer las leen de aqui.
//   valor       : identificador estable que guardan los articulos (ej. 'snacks')
//   etiqueta    : nombre visible (ej. 'Snacks & Comida')
//   descripcion : texto corto para el panel (opcional)
export const CATEGORIAS_POR_DEFECTO = [
  { valor: 'snacks', etiqueta: 'Snacks & Comida', descripcion: 'Comida casera, dulces y bebidas.' },
  { valor: 'ropa', etiqueta: 'Ropa & Accesorios', descripcion: 'Ropa de segunda mano y accesorios.' },
  { valor: 'tecnologia', etiqueta: 'Tecnología & Electrónica', descripcion: 'Calculadoras, audífonos, cables y más.' },
  { valor: 'libros', etiqueta: 'Libros & Material de Estudio', descripcion: 'Textos, apuntes y útiles.' },
  { valor: 'otros', etiqueta: 'Otros', descripcion: 'Todo lo que no entra en otra categoría.' },
];

export function cargarCategorias() {
  const almacenadas = localStorage.getItem(CLAVE_ALMACENAMIENTO_CATEGORIAS);
  if (almacenadas) {
    try {
      return JSON.parse(almacenadas);
    } catch {
      return [...CATEGORIAS_POR_DEFECTO];
    }
  }
  return [...CATEGORIAS_POR_DEFECTO];
}

export function guardarCategorias(categorias) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_CATEGORIAS, JSON.stringify(categorias));
}

export function obtenerCategoria(valor) {
  return cargarCategorias().find((c) => c.valor === valor) || null;
}

/** "Tecnología & Electrónica" -> "tecnologia-electronica" (sin acentos ni simbolos). */
function generarValorCategoria(etiqueta) {
  return etiqueta
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function crearCategoria({ etiqueta, descripcion }) {
  const nombre = (etiqueta || '').trim();
  if (!nombre) return { ok: false, mensaje: 'El nombre de la categoría no puede quedar vacío.' };

  const categorias = cargarCategorias();
  const valor = generarValorCategoria(nombre);
  if (!valor) return { ok: false, mensaje: 'El nombre debe tener letras o números.' };
  const repetida = categorias.some((c) => c.valor === valor || c.etiqueta.toLowerCase() === nombre.toLowerCase());
  if (repetida) return { ok: false, mensaje: 'Ya existe una categoría con ese nombre.' };

  const nueva = { valor, etiqueta: nombre, descripcion: (descripcion || '').trim() };
  guardarCategorias([...categorias, nueva]);
  return { ok: true, categoria: nueva };
}

/** El `valor` no cambia al editar: asi los articulos existentes siguen enlazados. */
export function actualizarCategoria(valor, { etiqueta, descripcion }) {
  const categorias = cargarCategorias();
  const indice = categorias.findIndex((c) => c.valor === valor);
  if (indice === -1) return { ok: false, mensaje: 'No se encontró la categoría.' };

  const nombre = (etiqueta || '').trim();
  if (!nombre) return { ok: false, mensaje: 'El nombre de la categoría no puede quedar vacío.' };
  const repetida = categorias.some((c, i) => i !== indice && c.etiqueta.toLowerCase() === nombre.toLowerCase());
  if (repetida) return { ok: false, mensaje: 'Ya existe otra categoría con ese nombre.' };

  categorias[indice] = { ...categorias[indice], etiqueta: nombre, descripcion: (descripcion || '').trim() };
  guardarCategorias(categorias);
  return { ok: true, categoria: categorias[indice] };
}

/** No deja borrar una categoria que todavia tiene articulos. */
export function eliminarCategoria(valor) {
  const enUso = cargarArticulos().filter((a) => a.categoria === valor).length;
  if (enUso > 0) {
    return { ok: false, mensaje: `No se puede eliminar: ${enUso} artículo(s) usan esta categoría.` };
  }
  const categorias = cargarCategorias();
  if (!categorias.some((c) => c.valor === valor)) return { ok: false, mensaje: 'No se encontró la categoría.' };
  guardarCategorias(categorias.filter((c) => c.valor !== valor));
  return { ok: true };
}

// -------- ARTICULOS (admin) --------

export function obtenerArticulo(id) {
  return cargarArticulos().find((a) => a.id === Number(id)) || null;
}

/** Valida nombre, precio, stock y categoria. Devuelve un mensaje o null. */
function validarDatosArticulo(datos) {
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

/** Crea un articulo desde el panel. Completa con valores por defecto lo que falte. */
export function crearArticulo(datos) {
  const error = validarDatosArticulo(datos);
  if (error) return { ok: false, mensaje: error };

  const articulos = cargarArticulos();
  const nuevo = {
    id: obtenerSiguienteId(articulos),
    nombre: datos.nombre.trim(),
    descripcion: (datos.descripcion || '').trim(),
    precio: Number(datos.precio),
    calificacion: 0,
    categoria: datos.categoria,
    universidad: datos.universidad || '',
    vendedor: (datos.vendedor || '').trim() || 'UniMarket',
    distancia: 0,
    condicion: datos.condicion || 'Nuevo (Sellado)',
    stock: Number(datos.stock),
    sku: (datos.sku || '').trim() || 'SKU-' + Date.now().toString(36).toUpperCase(),
    entrega: (datos.entrega || '').trim() || 'A convenir',
    universidadesVenta: datos.universidadesVenta || [],
    creadoEn: Date.now(),
  };
  if (datos.fotos && datos.fotos.length > 0) nuevo.fotos = datos.fotos;

  guardarArticulos([...articulos, nuevo]);
  return { ok: true, articulo: nuevo };
}

/** Edita un articulo existente. Solo cambia los campos que vengan en `cambios`. */
export function actualizarArticulo(id, cambios) {
  const articulos = cargarArticulos();
  const indice = articulos.findIndex((a) => a.id === Number(id));
  if (indice === -1) return { ok: false, mensaje: 'No se encontró el producto.' };

  const combinado = { ...articulos[indice], ...cambios };
  const error = validarDatosArticulo(combinado);
  if (error) return { ok: false, mensaje: error };

  articulos[indice] = {
    ...combinado,
    nombre: combinado.nombre.trim(),
    precio: Number(combinado.precio),
    stock: Number(combinado.stock),
  };
  guardarArticulos(articulos);
  return { ok: true, articulo: articulos[indice] };
}

export function eliminarArticulo(id) {
  const articulos = cargarArticulos();
  if (!articulos.some((a) => a.id === Number(id))) return { ok: false, mensaje: 'No se encontró el producto.' };
  guardarArticulos(articulos.filter((a) => a.id !== Number(id)));
  return { ok: true };
}

/** Articulos con stock bajo (<= umbral), del mas urgente al menos. */
export function obtenerArticulosCriticos(umbral = UMBRAL_STOCK_CRITICO) {
  return cargarArticulos()
    .filter((a) => (a.stock ?? 0) <= umbral)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
}

// -------- ORDENES / BOLETAS --------
// Cada compra confirmada en la pasarela (Pago.jsx) guarda una orden.
//   folio        : numero de boleta, ej. 'BOL-100001'
//   creadaEn     : marca de tiempo en milisegundos
//   estado       : 'Pagada' | 'Pendiente' | 'Anulada'
//   cliente      : { nombre, correo }  (puede ser un invitado sin cuenta)
//   metodoPago, ultimosDigitos, autorizacion
//   lineas       : [{ idArticulo, nombre, categoria, vendedor, precio, cantidad }]
//                  (copia del articulo al momento de comprar: si despues se
//                  edita o borra el articulo, la boleta no cambia)
//   total        : suma de precio * cantidad
export const ESTADOS_ORDEN = ['Pagada', 'Pendiente', 'Anulada'];

export function calcularTotalLineas(lineas) {
  return lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0);
}

const DIA_EN_MS = 24 * 60 * 60 * 1000;

function armarOrdenEjemplo(numero, diasAtras, estado, cliente, metodoPago, ultimosDigitos, lineas) {
  return {
    folio: 'BOL-' + (100000 + numero),
    creadaEn: Date.now() - diasAtras * DIA_EN_MS,
    estado,
    cliente,
    metodoPago,
    ultimosDigitos,
    autorizacion: 'EJ' + String(numero).padStart(4, '0'),
    lineas,
    total: calcularTotalLineas(lineas),
  };
}

const LINEA_BROWNIES = { idArticulo: 1, nombre: 'Brownies de Chocolate Caseros', categoria: 'snacks', vendedor: 'María G.', precio: 2.5 };
const LINEA_CALCULADORA = { idArticulo: 2, nombre: 'Calculadora Científica Casio fx-991LA X', categoria: 'tecnologia', vendedor: 'Carlos R.', precio: 15 };
const LINEA_CHAQUETA = { idArticulo: 3, nombre: 'Chaqueta Denim Vintage', categoria: 'ropa', vendedor: 'Ana V.', precio: 20 };
const LINEA_MONSTER = { idArticulo: 4, nombre: 'Bebida Energética Monster Original 473ml', categoria: 'snacks', vendedor: 'Kiosco Central', precio: 3 };

const JUAN = { nombre: 'Juan Pérez', correo: 'juan.perez@unimarket.edu' };
const CAMILA = { nombre: 'Camila Rojas', correo: 'camila.rojas@correo.cl' }; // invitada
const PEDRO = { nombre: 'Pedro Soto', correo: 'pedro.soto@correo.cl' }; // invitado

// Ordenes de ejemplo para que el panel no arranque vacio (datos ficticios).
export const ORDENES_POR_DEFECTO = [
  armarOrdenEjemplo(1, 34, 'Pagada', JUAN, 'Crédito', '4242', [{ ...LINEA_CHAQUETA, cantidad: 1 }]),
  armarOrdenEjemplo(2, 21, 'Pagada', CAMILA, 'Débito', '1111', [{ ...LINEA_BROWNIES, cantidad: 4 }, { ...LINEA_MONSTER, cantidad: 2 }]),
  armarOrdenEjemplo(3, 12, 'Pagada', JUAN, 'Crédito', '4242', [{ ...LINEA_CALCULADORA, cantidad: 1 }, { ...LINEA_BROWNIES, cantidad: 2 }]),
  armarOrdenEjemplo(4, 6, 'Pendiente', PEDRO, 'Débito', '2222', [{ ...LINEA_MONSTER, cantidad: 6 }]),
  armarOrdenEjemplo(5, 2, 'Pagada', JUAN, 'Crédito', '4242', [{ ...LINEA_CHAQUETA, cantidad: 1 }, { ...LINEA_MONSTER, cantidad: 1 }]),
  armarOrdenEjemplo(6, 1, 'Anulada', CAMILA, 'Débito', '1111', [{ ...LINEA_CALCULADORA, cantidad: 1 }]),
];

export function cargarOrdenes() {
  const almacenadas = localStorage.getItem(CLAVE_ALMACENAMIENTO_ORDENES);
  if (almacenadas) {
    try {
      return JSON.parse(almacenadas);
    } catch {
      return [...ORDENES_POR_DEFECTO];
    }
  }
  return [...ORDENES_POR_DEFECTO];
}

export function guardarOrdenes(ordenes) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_ORDENES, JSON.stringify(ordenes));
}

export function obtenerOrden(folio) {
  return cargarOrdenes().find((o) => o.folio === folio) || null;
}

/** Ordenes de un cliente (historial de compras), de la mas nueva a la mas vieja. */
export function ordenesDeUsuario(correo) {
  const objetivo = normalizarCorreo(correo);
  return cargarOrdenes()
    .filter((o) => normalizarCorreo(o.cliente.correo) === objetivo)
    .sort((a, b) => b.creadaEn - a.creadaEn);
}

/** Calcula el siguiente folio: BOL-100001, BOL-100002... */
function siguienteFolio(ordenes) {
  const mayor = ordenes.reduce((max, o) => Math.max(max, Number(String(o.folio).replace(/\D/g, '')) || 0), 100000);
  return 'BOL-' + (mayor + 1);
}

/** Guarda una orden nueva (la llama Pago.jsx al confirmar el pago). */
export function crearOrden({ cliente, lineas, metodoPago, ultimosDigitos, autorizacion, estado = 'Pagada' }) {
  const ordenes = cargarOrdenes();
  const orden = {
    folio: siguienteFolio(ordenes),
    creadaEn: Date.now(),
    estado,
    cliente,
    metodoPago,
    ultimosDigitos,
    autorizacion,
    lineas,
    total: calcularTotalLineas(lineas),
  };
  guardarOrdenes([...ordenes, orden]);
  return orden;
}

/**
 * Cuando una cuenta cambia de correo, sus ordenes se re-asocian al correo
 * nuevo; si no, el historial de compras quedaria "huerfano" (se busca por correo).
 */
export function migrarCorreoEnOrdenes(correoAnterior, correoNuevo) {
  const anterior = String(correoAnterior || '').trim().toLowerCase();
  const ordenes = cargarOrdenes();
  let cambio = false;
  const actualizadas = ordenes.map((o) => {
    if (String(o.cliente?.correo || '').trim().toLowerCase() !== anterior) return o;
    cambio = true;
    return { ...o, cliente: { ...o.cliente, correo: correoNuevo } };
  });
  if (cambio) guardarOrdenes(actualizadas);
}

export function actualizarEstadoOrden(folio, estado) {
  if (!ESTADOS_ORDEN.includes(estado)) return { ok: false, mensaje: 'Estado no válido.' };
  const ordenes = cargarOrdenes();
  const indice = ordenes.findIndex((o) => o.folio === folio);
  if (indice === -1) return { ok: false, mensaje: 'No se encontró la orden.' };
  ordenes[indice] = { ...ordenes[indice], estado };
  guardarOrdenes(ordenes);
  return { ok: true, orden: ordenes[indice] };
}
