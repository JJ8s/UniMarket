//    - ARTICULOS_POR_DEFECTO : array semilla de artículos
//    - USUARIO_ACTUAL        : objeto con datos del usuario (mock)
//    - cargarArticulos()     : devuelve los artículos guardados
//    - guardarArticulos(arr) : persiste el array de artículos
//    - cargarCarrito()       : devuelve el carrito guardado
//    - guardarCarrito(arr)   : persiste el array del carrito
// ============================================================
 
// -------- LLAVES DE ALMACENAMIENTO (localStorage) --------
const CLAVE_ALMACENAMIENTO_ARTICULOS = 'unimarket_articulos';
const CLAVE_ALMACENAMIENTO_CARRITO = 'unimarket_carrito';
 
// -------- ARTÍCULOS SEMILLA --------
// Estructura de cada artículo:
//   id          : identificador único (number)
//   nombre      : nombre del producto (string)
//   descripcion : descripción corta del producto (string)
//   precio      : precio de venta en dólares (number)
//   calificacion: calificación del artículo/vendedor, de 0 a 5 (number)
//   categoria   : 'snacks' | 'ropa' | 'tecnologia' | 'otros'
//   universidad : universidad del vendedor (string)
//   vendedor    : nombre del vendedor (string)
//   distancia   : distancia en kilómetros hasta el usuario (number)
//   condicion   : estado del artículo, ej. 'Nuevo', 'Usado' (string)
//   creadoEn    : marca de tiempo de creación, en milisegundos (number)
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
    creadoEn: Date.now() - 4000000,
  },
];
 
// -------- USUARIO ACTUAL (datos de ejemplo) --------
// Cuando exista un sistema de inicio de sesión real, este objeto se
// debe reemplazar por los datos de la sesión activa del usuario.
//   nombre        : nombre completo del usuario (string)
//   nombreUsuario : nombre de usuario / handle (string)
//   correo        : correo electrónico asociado (string)
const USUARIO_ACTUAL = {
  nombre: 'Juan Pérez',
  nombreUsuario: '@juanperez',
  correo: 'juan.perez@unimarket.edu',
};
 
/**
 * Lee los artículos guardados en localStorage.
 * Si no hay nada guardado (primera vez que se abre la app) o el
 * JSON está corrupto, devuelve una copia de los artículos semilla.
 * @returns {Array<Object>} lista de artículos
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
 * Guarda el array de artículos completo en localStorage.
 * @param {Array<Object>} articulos - lista completa de artículos a guardar
 */
function guardarArticulos(articulos) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_ARTICULOS, JSON.stringify(articulos));
}
 
/**
 * Lee el carrito ("bolsa de compras") guardado en localStorage.
 * El carrito es un array simple con los IDs de los artículos agregados.
 * @returns {Array<number>} ids de artículos en la bolsa
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
 * Guarda el carrito (array de ids de artículos) en localStorage.
 * @param {Array<number>} carrito
 */
function guardarCarrito(carrito) {
  localStorage.setItem(CLAVE_ALMACENAMIENTO_CARRITO, JSON.stringify(carrito));
}
 
// -------- EXPOSICIÓN GLOBAL (para que script.js pueda usarlas) --------
window.ARTICULOS_POR_DEFECTO = ARTICULOS_POR_DEFECTO;
window.USUARIO_ACTUAL = USUARIO_ACTUAL;
window.cargarArticulos = cargarArticulos;
window.guardarArticulos = guardarArticulos;
window.cargarCarrito = cargarCarrito;
window.guardarCarrito = guardarCarrito;