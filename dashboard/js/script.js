
// ---------------------------------------------------------
//  ESTADO GLOBAL DE LA APLICACIÓN
// ---------------------------------------------------------
let articulos = [];            // Todos los artículos disponibles (cargados de data.js)
let categoriaActual = 'todos'; // Categoría seleccionada en los botones de filtro
let radioActual = 5;           // Radio de búsqueda en kilómetros (slider)
let ubicacionUsuario = null;   // { lat, lng } una vez que el usuario detecta su ubicación
let carrito = [];              // Array de ids de artículos agregados a la bolsa
let terminoBusqueda = '';      // Texto actual del buscador, ya normalizado
 
// ---------------------------------------------------------
//  ETIQUETAS DE CATEGORÍA
// ---------------------------------------------------------
// Nombre largo: se usa en los botones de filtro de categoría.
const ETIQUETAS_CATEGORIA_LARGA = {
  snacks: 'Snacks & Dulces',
  ropa: 'Ropa 2da Mano',
  tecnologia: 'Tecnología Usada',
  otros: 'Otros Artículos',
};
 
// Nombre corto: se usa junto al nombre del vendedor, en la tarjeta y en el modal.
const ETIQUETAS_CATEGORIA_CORTA = {
  snacks: 'Snacks & Comida',
  ropa: 'Ropa & Accesorios',
  tecnologia: 'Tecnología & Electrónica',
  otros: 'Otros',
};
 
// Paleta de colores para el bloque de imagen. Como todavía no hay
// fotos reales de los productos, se usa un color pastel como
// "placeholder" (marcador de posición).
const COLORES_IMAGEN = ['#FDF3D0', '#E7E9EC', '#DCEBFB', '#D9F5E3', '#FCE1E4'];
 
/**
 * Devuelve un color de la paleta según el id del artículo, para que
 * el bloque de imagen sea siempre del mismo color tanto en la
 * tarjeta como en el modal de detalle.
 * @param {number} idArticulo
 * @returns {string} color en formato hexadecimal
 */
function obtenerColorImagen(idArticulo) {
  return COLORES_IMAGEN[idArticulo % COLORES_IMAGEN.length];
}
 
/**
 * Normaliza un texto para poder comparar búsquedas sin importar
 * mayúsculas ni acentos (ej. "camara" encuentra "Cámara").
 * @param {string} texto
 * @returns {string} texto en minúsculas y sin acentos
 */
function normalizarTexto(texto) {
  return (texto || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // elimina los acentos (diacríticos)
}
 
// ---------------------------------------------------------
//  INICIALIZACIÓN
// ---------------------------------------------------------
/**
 * Punto de entrada de la aplicación. Se ejecuta una sola vez, cuando
 * el DOM ya está listo (ver el `addEventListener` al final del archivo).
 */
function inicializar() {
  articulos = cargarArticulos();
  carrito = cargarCarrito();
  actualizarBadgeCarrito();
  renderizarArticulos();
  configurarEventosDeFiltros();
  configurarModalDeProducto();
  configurarBusqueda();
  configurarMenuPerfil();
}
 
// ---------------------------------------------------------
//  FILTRADO DE ARTÍCULOS
// ---------------------------------------------------------
/**
 * Aplica, en orden, el filtro de categoría, el filtro de radio (solo
 * si el usuario ya detectó su ubicación), el filtro de búsqueda por
 * texto, y finalmente ordena el resultado.
 * @returns {Array<Object>} artículos filtrados y ordenados
 */
function obtenerArticulosFiltrados() {
  let filtrados = [...articulos];
 
  // 1. Filtro por categoría
  if (categoriaActual !== 'todos') {
    filtrados = filtrados.filter(articulo => articulo.categoria === categoriaActual);
  }
 
  // 2. Filtro por radio de distancia (solo si hay ubicación detectada)
  if (ubicacionUsuario) {
    filtrados = filtrados.filter(articulo => articulo.distancia <= radioActual);
  }
 
  // 3. Filtro por término de búsqueda
  if (terminoBusqueda) {
    // Búsqueda local simple: coincide si el término aparece en el
    // nombre, la descripción, el vendedor o la categoría del artículo.
    //
    // NOTA PARA EL FUTURO: si se conecta un backend real, esta parte
    // se puede reemplazar por una petición, por ejemplo:
    //   fetch(`/api/articulos?buscar=${encodeURIComponent(terminoBusqueda)}`)
    // y usar directamente el resultado del servidor en vez de filtrar
    // el array local.
    filtrados = filtrados.filter(articulo => {
      const categoriaTexto = ETIQUETAS_CATEGORIA_CORTA[articulo.categoria] || articulo.categoria;
      const textoCombinado = normalizarTexto(
        `${articulo.nombre} ${articulo.descripcion} ${articulo.vendedor} ${categoriaTexto}`
      );
      return textoCombinado.includes(terminoBusqueda);
    });
  }
 
  // 4. Orden: por cercanía si hay ubicación, si no, por más reciente
  if (ubicacionUsuario) {
    filtrados.sort((a, b) => a.distancia - b.distancia);
  } else {
    filtrados.sort((a, b) => b.creadoEn - a.creadoEn);
  }
 
  return filtrados;
}
 
// ---------------------------------------------------------
//  RENDERIZADO DE TARJETAS DE PRODUCTO
// ---------------------------------------------------------
/**
 * Dibuja las tarjetas de producto dentro de #product-grid.
 * Cada tarjeta muestra: un bloque de imagen (color) con las
 * etiquetas de condición y distancia encima, el nombre del
 * producto, "vendedor • categoría", la calificación (rating) y
 * el precio. Al hacer click en una tarjeta se abre el modal
 * de detalle de ese producto.
 */
function renderizarArticulos() {
  const contenedor = document.getElementById('product-grid');
  const mensajeVacio = document.getElementById('empty-message');
  const filtrados = obtenerArticulosFiltrados();
 
  if (filtrados.length === 0) {
    contenedor.innerHTML = '';
    mensajeVacio.classList.remove('hidden');
    return;
  }
  mensajeVacio.classList.add('hidden');
 
  contenedor.innerHTML = filtrados.map(articulo => `
    <div class="card" data-id="${articulo.id}">
      <div class="card-image" style="background:${obtenerColorImagen(articulo.id)}">
        ${articulo.condicion ? `<span class="badge-condition">${articulo.condicion}</span>` : ''}
        <span class="badge-distance">📍 ${articulo.distancia.toFixed(1)} km</span>
      </div>
      <div class="card-body">
        <h3 class="product-name">${articulo.nombre}</h3>
        <p class="seller-name">${articulo.vendedor} • ${ETIQUETAS_CATEGORIA_CORTA[articulo.categoria] || articulo.categoria}</p>
        <div class="card-footer">
          <span class="rating"><span class="star">★</span> ${(articulo.calificacion ?? 5).toFixed(1)}</span>
          <span class="product-price">$${articulo.precio.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `).join('');
 
  // Click en una tarjeta → abre el modal de detalle de ese artículo
  document.querySelectorAll('#product-grid .card').forEach(tarjeta => {
    tarjeta.addEventListener('click', function () {
      const id = parseInt(this.dataset.id, 10);
      const articulo = articulos.find(a => a.id === id);
      if (articulo) abrirModalDeProducto(articulo);
    });
  });
}
 
// ============================================================
//  BUSCADOR
// ============================================================
 
/**
 * Configura la barra de búsqueda. El filtro se aplica de dos formas:
 *   - Al enviar el formulario (tecla Enter o click en la lupa).
 *   - "En vivo", mientras el usuario escribe (el conjunto de datos
 *     es local y pequeño, así que filtrar en cada tecla no cuesta nada).
 * En ambos casos se filtra localmente sobre `articulos`.
 */
function configurarBusqueda() {
  const formulario = document.getElementById('search-form');
  const campoBusqueda = document.getElementById('search-input');
  if (!formulario || !campoBusqueda) return;
 
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault(); // evita que la página se recargue (todavía no hay backend real)
    terminoBusqueda = normalizarTexto(campoBusqueda.value.trim());
    renderizarArticulos();
  });
 
  campoBusqueda.addEventListener('input', function () {
    terminoBusqueda = normalizarTexto(campoBusqueda.value.trim());
    renderizarArticulos();
  });
}
 
// ============================================================
//  MODAL DE DETALLE DE PRODUCTO
// ============================================================
 
let idArticuloEnModal = null; // id del artículo que se está mostrando actualmente en el modal
 
/**
 * Rellena el modal con los datos de un artículo y lo muestra en pantalla.
 * @param {Object} articulo - artículo a mostrar (ver estructura en data.js)
 */
function abrirModalDeProducto(articulo) {
  idArticuloEnModal = articulo.id;
 
  document.getElementById('modal-image').style.background = obtenerColorImagen(articulo.id);
  document.getElementById('modal-condition').textContent = articulo.condicion || 'Sin condición';
  document.getElementById('modal-name').textContent = articulo.nombre;
  document.getElementById('modal-seller').textContent =
    `${articulo.vendedor} • ${ETIQUETAS_CATEGORIA_CORTA[articulo.categoria] || articulo.categoria}`;
  document.getElementById('modal-description').textContent =
    articulo.descripcion || 'Sin descripción disponible.';
  document.getElementById('modal-price').textContent = `$${articulo.precio.toFixed(2)}`;
  document.getElementById('modal-university').textContent = articulo.universidad;
  document.getElementById('modal-distance').textContent = `${articulo.distancia.toFixed(1)} km`;
  document.getElementById('modal-rating').textContent = `★ ${(articulo.calificacion ?? 5).toFixed(1)}`;
 
  // Reinicia el botón de "Agregar a la bolsa" por si quedó marcado
  // como "Agregado" de una apertura anterior del modal.
  const botonAgregarCarrito = document.getElementById('modal-add-cart');
  botonAgregarCarrito.textContent = 'Agregar a la bolsa';
  botonAgregarCarrito.classList.remove('added');
 
  document.getElementById('product-modal').classList.remove('hidden');
}
 
/** Cierra el modal de detalle de producto. */
function cerrarModalDeProducto() {
  document.getElementById('product-modal').classList.add('hidden');
  idArticuloEnModal = null;
}
 
/**
 * Configura todos los eventos del modal de producto:
 *   - Botón de cerrar (la "X").
 *   - Click en el fondo oscuro, fuera de la tarjeta blanca.
 *   - Tecla Escape (también cierra el menú de perfil si está abierto).
 *   - Botón "Agregar a la bolsa".
 */
function configurarModalDeProducto() {
  const fondoModal = document.getElementById('product-modal');
  const botonCerrar = document.getElementById('modal-close');
  const botonAgregarCarrito = document.getElementById('modal-add-cart');
 
  botonCerrar.addEventListener('click', cerrarModalDeProducto);
 
  fondoModal.addEventListener('click', function (evento) {
    if (evento.target === fondoModal) cerrarModalDeProducto();
  });
 
  document.addEventListener('keydown', function (evento) {
    if (evento.key !== 'Escape') return;
    if (!fondoModal.classList.contains('hidden')) cerrarModalDeProducto();
    cerrarMenuPerfil();
  });
 
  botonAgregarCarrito.addEventListener('click', function () {
    if (idArticuloEnModal === null) return;
    agregarAlCarrito(idArticuloEnModal);
 
    botonAgregarCarrito.textContent = '✓ Agregado a la bolsa';
    botonAgregarCarrito.classList.add('added');
    setTimeout(cerrarModalDeProducto, 700);
  });
}
 
// ============================================================
//  CARRITO ("bolsa de compras")
// ============================================================
 
/**
 * Agrega el id de un artículo al carrito, lo persiste en
 * localStorage y actualiza el número que se ve en el ícono del carrito.
 * @param {number} idArticulo
 */
function agregarAlCarrito(idArticulo) {
  carrito.push(idArticulo);
  guardarCarrito(carrito);
  actualizarBadgeCarrito();
}
 
/** Actualiza el número mostrado en el badge (globo) del ícono del carrito. */
function actualizarBadgeCarrito() {
  const badge = document.getElementById('badge');
  if (badge) badge.textContent = carrito.length;
}
 
// ============================================================
//  MENÚ DESPLEGABLE DE PERFIL
// ============================================================
 
/**
 * Rellena el menú de perfil con los datos de USUARIO_ACTUAL (de
 * data.js) y configura cómo se abre y se cierra:
 *   - Click en el botón del ícono de perfil: lo abre o lo cierra.
 *   - Click en cualquier otra parte de la página: lo cierra.
 * Los enlaces del menú ("Ver mi perfil", "Mis pedidos", etc.) todavía
 * no tienen lógica: a propósito abren una pestaña en blanco.
 */
function configurarMenuPerfil() {
  const botonPerfil = document.getElementById('profile-btn');
  const menuPerfil = document.getElementById('profile-dropdown');
  if (!botonPerfil || !menuPerfil) return;
 
  // Rellenar los datos del usuario (mock) que vienen de data.js
  const usuario = window.USUARIO_ACTUAL || {};
  document.getElementById('profile-name').textContent = usuario.nombre || 'Usuario';
  document.getElementById('profile-username').textContent = usuario.nombreUsuario || '';
  document.getElementById('profile-email').textContent = usuario.correo || '';
 
  botonPerfil.addEventListener('click', function (evento) {
    evento.stopPropagation(); // evita que el listener de "click afuera" lo cierre de inmediato
    menuPerfil.classList.toggle('hidden');
  });
 
  // Cerrar el menú al hacer click en cualquier otro lugar de la página
  document.addEventListener('click', function (evento) {
    if (!menuPerfil.classList.contains('hidden') && !menuPerfil.contains(evento.target)) {
      cerrarMenuPerfil();
    }
  });
}
 
/** Cierra el menú de perfil si está abierto. */
function cerrarMenuPerfil() {
  const menuPerfil = document.getElementById('profile-dropdown');
  if (menuPerfil) menuPerfil.classList.add('hidden');
}
 
// ---------------------------------------------------------
//  EVENTOS DE FILTROS Y UBICACIÓN
// ---------------------------------------------------------
/**
 * Configura los controles que no son ni el buscador ni el modal ni
 * el perfil: los botones de filtro por categoría, el slider de radio
 * y el botón de detectar ubicación.
 */
function configurarEventosDeFiltros() {
  // 1. Botones de filtro por categoría
  const botonesFiltro = document.querySelectorAll('.filter-btn');
  botonesFiltro.forEach(boton => {
    boton.addEventListener('click', function () {
      botonesFiltro.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      categoriaActual = this.dataset.filter;
      renderizarArticulos();
    });
  });
 
  // 2. Slider de radio de búsqueda
  const sliderRadio = document.getElementById('radius-slider');
  const etiquetaRadio = document.getElementById('radius-label');
  if (sliderRadio) {
    sliderRadio.addEventListener('input', function () {
      radioActual = parseFloat(this.value);
      etiquetaRadio.textContent = `${radioActual} km`;
      renderizarArticulos();
    });
  }
 
  // 3. Botón para detectar la ubicación del usuario
  const botonUbicacion = document.getElementById('detect-location');
  const textoUbicacion = document.getElementById('location-text');
  const badgeUbicacion = document.getElementById('location-badge');
  const textoBadgeUbicacion = document.getElementById('badge-text');
 
  if (botonUbicacion) {
    botonUbicacion.addEventListener('click', function () {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          // Éxito: el navegador entregó la ubicación real del usuario
          posicion => {
            ubicacionUsuario = { lat: posicion.coords.latitude, lng: posicion.coords.longitude };
            textoUbicacion.textContent = '📍 Ubicación detectada';
            badgeUbicacion.classList.remove('hidden');
            textoBadgeUbicacion.textContent = `A menos de ${radioActual} km de tu ubicación`;
            renderizarArticulos();
          },
          // Error o permiso denegado: se usa una ubicación simulada (CDMX)
          () => {
            ubicacionUsuario = { lat: 19.4326, lng: -99.1332 };
            textoUbicacion.textContent = '📍 Ubicación simulada (CDMX)';
            badgeUbicacion.classList.remove('hidden');
            textoBadgeUbicacion.textContent = `A menos de ${radioActual} km (simulado)`;
            renderizarArticulos();
            alert('No se pudo obtener ubicación real. Usamos una ubicación simulada.');
          }
        );
      } else {
        // El navegador no soporta geolocalización
        ubicacionUsuario = { lat: 19.4326, lng: -99.1332 };
        textoUbicacion.textContent = '📍 Ubicación simulada (CDMX)';
        badgeUbicacion.classList.remove('hidden');
        textoBadgeUbicacion.textContent = `A menos de ${radioActual} km (simulado)`;
        renderizarArticulos();
      }
    });
  }
 
  // NOTA: todavía no hay funcionalidad de "publicar artículo".
  // El botón "Publicar artículo" queda inactivo a propósito.
}
 
// ---------------------------------------------------------
//  ARRANQUE DE LA APLICACIÓN
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', inicializar);