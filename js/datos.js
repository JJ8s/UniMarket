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

// -------- EXPOSICION GLOBAL (para que otros archivos las usen) --------
window.ARTICULOS_POR_DEFECTO = ARTICULOS_POR_DEFECTO;
window.USUARIO_ACTUAL = USUARIO_ACTUAL;
window.UNIVERSIDADES_DISPONIBLES = UNIVERSIDADES_DISPONIBLES;
window.cargarArticulos = cargarArticulos;
window.guardarArticulos = guardarArticulos;
window.cargarCarrito = cargarCarrito;
window.guardarCarrito = guardarCarrito;
window.obtenerSiguienteId = obtenerSiguienteId;
