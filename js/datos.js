// ============================================================
// datos.js - Capa de datos
// ============================================================
// Este archivo es el unico responsable de:
//   1. Guardar y leer datos desde localStorage (persistencia).
//   2. Exponer los datos "semilla" (articulos y usuario de
//      ejemplo) que se usan la primera vez que se abre la app,
//      antes de que exista informacion guardada.
//
// Nota de estilo: comentarios sin tildes a proposito. El texto
// que ve el usuario (nombres, descripciones) si mantiene tildes.
//
// Funciones y datos que expone en `window` (para que otros
// archivos los puedan usar):
//   - ARTICULOS_POR_DEFECTO : array semilla de articulos
//   - USUARIO_ACTUAL        : objeto con datos del usuario (mock)
//   - cargarArticulos()     : devuelve los articulos guardados
//   - guardarArticulos(arr) : persiste el array de articulos
//   - cargarCarrito()       : devuelve el carrito guardado
//   - guardarCarrito(arr)   : persiste el array del carrito
//   - obtenerSiguienteId(arr) : calcula el proximo id disponible
// ============================================================

// -------- LLAVES DE ALMACENAMIENTO (localStorage) --------
const CLAVE_ALMACENAMIENTO_ARTICULOS = 'unimarket_articulos';
const CLAVE_ALMACENAMIENTO_CARRITO = 'unimarket_carrito';
const CLAVE_ALMACENAMIENTO_SESION = 'unimarket_sesion';
const CLAVE_ALMACENAMIENTO_USUARIOS = 'unimarket_usuarios';

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
const ARTICULOS_POR_DEFECTO = [
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

// -------- USUARIO ACTUAL (datos de ejemplo) --------
// Cuando exista un sistema de inicio de sesion real, este objeto
// se debe reemplazar por los datos de la sesion activa.
//   nombre        : nombre completo del usuario (string)
//   nombreUsuario : nombre de usuario / handle (string)
//   correo        : correo electronico asociado (string)
//   universidad   : universidad del usuario (string)
const USUARIO_ACTUAL = {
  nombre: 'Juan Pérez',
  nombreUsuario: '@juanperez',
  correo: 'juan.perez@unimarket.edu',
  universidad: 'UNAM',
};

// -------- USUARIOS REGISTRADOS (mock de autenticacion, sin backend) --------
// Como el proyecto todavia no tiene servidor, la "base de datos" de
// usuarios es simplemente un array guardado en localStorage. Se arranca
// con una cuenta de prueba para poder loguearse de inmediato:
//   correo: juan.perez@unimarket.edu   contraseña: 123456
const USUARIOS_POR_DEFECTO = [
  {
    nombre: 'Juan Pérez',
    nombreUsuario: '@juanperez',
    correo: 'juan.perez@unimarket.edu',
    universidad: 'UNAM',
    contrasena: '123456',
  },
];

// -------- UNIVERSIDADES DISPONIBLES --------
// Lista usada en dos lugares:
//   1. publicar.html: el vendedor marca a que universidades vende.
//   2. index.html: el comprador filtra el catalogo por universidad.
//
// Nota: esta es una lista de ejemplo con nombres completos (sin
// acronimos de sede). Ajusta o agrega los nombres exactos de tus
// sedes reales antes de usar esto en produccion.
const UNIVERSIDADES_DISPONIBLES = [
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
function cargarArticulos() {
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
function guardarArticulos(articulos) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_ARTICULOS, JSON.stringify(articulos));
}

/**
 * Lee el carrito ("bolsa de compras") guardado en localStorage.
 * El carrito es un array simple con los IDs de los articulos agregados.
 * @returns {Array<number>} ids de articulos en la bolsa
 */
function cargarCarrito() {
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
function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_CARRITO, JSON.stringify(carrito));
}

/**
 * Calcula el siguiente id disponible a partir de una lista de
 * articulos, buscando el id mas alto y sumando uno.
 * @param {Array<Object>} articulos
 * @returns {number} siguiente id disponible
 */
function obtenerSiguienteId(articulos) {
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
function cargarUsuarios() {
  const almacenados = localStorage.getItem(CLAVE_ALMACENAMIENTO_USUARIOS);
  if (almacenados) {
    try {
      return JSON.parse(almacenados);
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
function guardarUsuarios(usuarios) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_USUARIOS, JSON.stringify(usuarios));
}

/**
 * Registra un nuevo usuario si el correo no esta en uso.
 * @param {{nombre:string, nombreUsuario:string, correo:string, contrasena:string, universidad?:string}} datos
 * @returns {{ok:boolean, mensaje?:string, usuario?:Object}}
 */
function registrarUsuario(datos) {
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
function validarCredenciales(correo, contrasena) {
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
function iniciarSesion(usuario) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_SESION, JSON.stringify({
    nombre: usuario.nombre,
    nombreUsuario: usuario.nombreUsuario,
    correo: usuario.correo,
    universidad: usuario.universidad || '',
    iniciadaEn: Date.now(),
  }));
}

/**
 * Borra la sesion guardada. Se llama al hacer click en
 * "Salir de la sesion".
 */
function cerrarSesion() {
  localStorage.removeItem(CLAVE_ALMACENAMIENTO_SESION);
}

/**
 * Indica si hay una sesion activa guardada en localStorage.
 * @returns {boolean}
 */
function haySesionActiva() {
  return localStorage.getItem(CLAVE_ALMACENAMIENTO_SESION) !== null;
}

/**
 * Devuelve los datos del usuario con sesion activa, o null si no hay.
 * @returns {Object|null}
 */
function obtenerSesion() {
  const guardada = localStorage.getItem(CLAVE_ALMACENAMIENTO_SESION);
  if (!guardada) return null;
  try {
    return JSON.parse(guardada);
  } catch {
    return null;
  }
}

// -------- EXPOSICION GLOBAL (para que otros archivos las usen) --------
window.ARTICULOS_POR_DEFECTO = ARTICULOS_POR_DEFECTO;
window.USUARIO_ACTUAL = USUARIO_ACTUAL;
window.USUARIOS_POR_DEFECTO = USUARIOS_POR_DEFECTO;
window.UNIVERSIDADES_DISPONIBLES = UNIVERSIDADES_DISPONIBLES;
window.cargarArticulos = cargarArticulos;
window.guardarArticulos = guardarArticulos;
window.cargarCarrito = cargarCarrito;
window.guardarCarrito = guardarCarrito;
window.obtenerSiguienteId = obtenerSiguienteId;
window.cargarUsuarios = cargarUsuarios;
window.guardarUsuarios = guardarUsuarios;
window.registrarUsuario = registrarUsuario;
window.validarCredenciales = validarCredenciales;
window.iniciarSesion = iniciarSesion;
window.cerrarSesion = cerrarSesion;
window.haySesionActiva = haySesionActiva;
window.obtenerSesion = obtenerSesion;
