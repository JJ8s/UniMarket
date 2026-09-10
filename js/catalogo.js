// ============================================================
// Este archivo es responsable de:
//   -Renderizar las tarjetas de producto (cuadricula).
//   -Manejar los filtros: categoria, radio de ubicacion y
//    busqueda por texto.
//   -Mostrar el modal con el detalle de un producto al hacer
//    click sobre su tarjeta.
//   -Manejar el carrito ("bolsa de compras"): agregar un
//    producto y actualizar el numero del icono del carrito.
// ============================================================
// ---------------------------------------------------------
// ESTADO GLOBAL DE LA APLICACION
// ---------------------------------------------------------
let articulos = [];            // Todos los articulos disponibles (cargados de datos.js)
let categoriaActual = 'todos'; // Categoria seleccionada en los botones de filtro
let radioActual = 5;           // Radio de busqueda en kilometros (slider)
let ubicacionUsuario = null;   // { lat, lng } una vez que el usuario detecta su ubicacion
let carrito = [];              // Array de ids de articulos agregados a la bolsa
let terminoBusqueda = '';      // Texto actual del buscador, ya normalizado
let universidadFiltro = 'todas'; // Universidad elegida en el selector de filtro

// ---------------------------------------------------------
// ETIQUETAS DE CATEGORIA
// ---------------------------------------------------------
// Nombre largo: se usa en los botones de filtro de categoria.
const ETIQUETAS_CATEGORIA_LARGA = {
  snacks: 'Snacks & Dulces',
  ropa: 'Ropa 2da Mano',
  tecnologia: 'Tecnología Usada',
  libros: 'Libros y Material',
  otros: 'Otros Artículos',
};

// Nombre corto: se usa junto al nombre del vendedor, en la tarjeta y en el modal.
const ETIQUETAS_CATEGORIA_CORTA = {
  snacks: 'Snacks & Comida',
  ropa: 'Ropa & Accesorios',
  tecnologia: 'Tecnología & Electrónica',
  libros: 'Libros & Material de Estudio',
  otros: 'Otros',
};

// Paleta de colores para el bloque de imagen. Como todavia no hay
// fotos reales de los productos, se usa un color pastel como
// "placeholder" (marcador de posicion).
const COLORES_IMAGEN = ['#FDF3D0', '#E7E9EC', '#DCEBFB', '#D9F5E3', '#FCE1E4'];

/**
 * Devuelve un color de la paleta segun el id del articulo, para que
 * el bloque de imagen sea siempre del mismo color tanto en la
 * tarjeta como en el modal de detalle.
 * @param {number} idArticulo
 * @returns {string} color en formato hexadecimal
 */
function obtenerColorImagen(idArticulo) {
  return COLORES_IMAGEN[idArticulo % COLORES_IMAGEN.length];
}

/**
 * Devuelve el estilo CSS para el bloque de imagen de un articulo:
 * si tiene fotos reales (subidas al publicar), usa la primera como
 * fondo; si no, usa el color placeholder de siempre.
 * @param {Object} articulo
 * @returns {string} valor listo para usar en style="..."
 */
function obtenerEstiloImagen(articulo) {
  if (articulo.fotos && articulo.fotos.length > 0) {
    return `background-image:url('${articulo.fotos[0]}'); background-size:cover; background-position:center;`;
  }
  return `background:${obtenerColorImagen(articulo.id)};`;
}

/**
 * Normaliza un texto para poder comparar busquedas sin importar
 * mayusculas ni acentos (ej. "camara" encuentra "Cámara").
 * @param {string} texto
 * @returns {string} texto en minusculas y sin acentos
 */
function normalizarTexto(texto) {
  return (texto || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // elimina los acentos (diacriticos)
}

/**
 * Escapa caracteres especiales de HTML para poder insertar texto
 * escrito por el usuario (nombre, descripcion) dentro de un
 * innerHTML sin que rompa el marcado ni ejecute codigo.
 * @param {string} texto
 * @returns {string} texto seguro para insertar en HTML
 */
function escaparHtml(texto) {
  const elementoAuxiliar = document.createElement('div');
  elementoAuxiliar.textContent = texto ?? '';
  return elementoAuxiliar.innerHTML;
}

// ---------------------------------------------------------
// INICIALIZACION
// ---------------------------------------------------------
/**
 * Punto de entrada de la aplicacion. Se ejecuta una sola vez, cuando
 * el DOM ya esta listo (ver el addEventListener al final del archivo).
 */
function inicializar() {
  // Si no hay sesion activa, no se puede ver el dashboard: al login.
  if (typeof haySesionActiva === 'function' && !haySesionActiva()) {
    window.location.href = 'login.html';
    return;
  }

  articulos = cargarArticulos();
  carrito = cargarCarrito();
  actualizarBadgeCarrito();
  renderizarArticulos();
  configurarEventosDeFiltros();
  configurarModalDeProducto();
  configurarBusqueda();

  // El menu de perfil es una clase compartida definida en interfaz.js.
  // Se le pasan los datos de la sesion real (guardada al iniciar sesion);
  // si por algun motivo no hay sesion, se usa el usuario de ejemplo.
  const usuarioSesion = (typeof obtenerSesion === 'function' && obtenerSesion()) || window.USUARIO_ACTUAL;
  const menuPerfil = new MenuPerfil('profile-btn', 'profile-dropdown', usuarioSesion);
  menuPerfil.inicializar();
  window.menuPerfilActivo = menuPerfil; // para poder cerrarlo desde el Escape del modal
}

// ---------------------------------------------------------
// FILTRADO DE ARTICULOS
// ---------------------------------------------------------
/**
 * Aplica, en orden, el filtro de categoria, el filtro de radio (solo
 * si el usuario ya detecto su ubicacion), el filtro de busqueda por
 * texto, y finalmente ordena el resultado.
 * @returns {Array<Object>} articulos filtrados y ordenados
 */
function obtenerArticulosFiltrados() {
  let filtrados = [...articulos];

  if (categoriaActual !== 'todos') {
    filtrados = filtrados.filter(articulo => articulo.categoria === categoriaActual);
  }

  if (ubicacionUsuario) {
    filtrados = filtrados.filter(articulo => articulo.distancia <= radioActual);
  }

  if (universidadFiltro !== 'todas') {
    // Un articulo sin universidadesVenta (o con el array vacio) vende
    // a todas las universidades, asi que siempre pasa este filtro.
    filtrados = filtrados.filter(articulo => {
      const universidades = articulo.universidadesVenta;
      return !universidades || universidades.length === 0 || universidades.includes(universidadFiltro);
    });
  }

  if (terminoBusqueda) {
    // Busqueda local simple: coincide si el termino aparece en el
    // nombre, la descripcion, el vendedor o la categoria del articulo.
    //
    // NOTA PARA EL FUTURO: si se conecta un backend real, esta parte
    // se puede reemplazar por una peticion, por ejemplo:
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

  if (ubicacionUsuario) {
    filtrados.sort((a, b) => a.distancia - b.distancia);
  } else {
    filtrados.sort((a, b) => b.creadoEn - a.creadoEn);
  }

  return filtrados;
}

// ---------------------------------------------------------
// RENDERIZADO DE TARJETAS DE PRODUCTO
// ---------------------------------------------------------
/**
 * Dibuja las tarjetas de producto dentro de #product-grid.
 * Cada tarjeta muestra: un bloque de imagen (color) con las
 * etiquetas de condicion y distancia encima, el nombre del
 * producto, "vendedor - categoria", la calificacion (rating) y
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
      <div class="card-image" style="${obtenerEstiloImagen(articulo)}">
        ${articulo.condicion ? `<span class="badge-condition">${articulo.condicion}</span>` : ''}
        <span class="badge-distance">${articulo.distancia.toFixed(1)} km</span>
      </div>
      <div class="card-body">
        <h3 class="product-name">${escaparHtml(articulo.nombre)}</h3>
        <p class="seller-name">${escaparHtml(articulo.vendedor)} • ${ETIQUETAS_CATEGORIA_CORTA[articulo.categoria] || articulo.categoria}</p>
        <div class="card-footer">
          <span class="rating"><span class="star">★</span> ${(articulo.calificacion ?? 0).toFixed(1)}</span>
          <span class="product-price">$${articulo.precio.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Click en una tarjeta -> abre el modal de detalle de ese articulo
  document.querySelectorAll('#product-grid .card').forEach(tarjeta => {
    tarjeta.addEventListener('click', function () {
      const id = parseInt(this.dataset.id, 10);
      const articulo = articulos.find(a => a.id === id);
      if (articulo) abrirModalDeProducto(articulo);
    });
  });
}

// ============================================================
// BUSCADOR
// ============================================================

/**
 * Configura la barra de busqueda. El filtro se aplica de dos formas:
 *   - Al enviar el formulario (tecla Enter o click en la lupa).
 *   - "En vivo", mientras el usuario escribe.
 * En ambos casos se filtra localmente sobre `articulos`.
 */
function configurarBusqueda() {
  const formulario = document.getElementById('search-form');
  const campoBusqueda = document.getElementById('search-input');
  if (!formulario || !campoBusqueda) return;

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault(); // evita que la pagina se recargue (todavia no hay backend real)
    terminoBusqueda = normalizarTexto(campoBusqueda.value.trim());
    renderizarArticulos();
  });

  campoBusqueda.addEventListener('input', function () {
    terminoBusqueda = normalizarTexto(campoBusqueda.value.trim());
    renderizarArticulos();
  });
}

// ============================================================
// MODAL DE DETALLE DE PRODUCTO
// ============================================================

let idArticuloEnModal = null; // id del articulo que se esta mostrando actualmente en el modal

/**
 * Rellena el modal con los datos de un articulo y lo muestra en pantalla.
 * @param {Object} articulo - articulo a mostrar (ver estructura en datos.js)
 */
function abrirModalDeProducto(articulo) {
  idArticuloEnModal = articulo.id;

  document.getElementById('modal-image').style.cssText = obtenerEstiloImagen(articulo);
  document.getElementById('modal-condition').textContent = articulo.condicion || 'Sin condición';
  document.getElementById('modal-name').textContent = articulo.nombre;
  document.getElementById('modal-seller').textContent =
    `${articulo.vendedor} • ${ETIQUETAS_CATEGORIA_CORTA[articulo.categoria] || articulo.categoria}`;
  document.getElementById('modal-description').textContent =
    articulo.descripcion || 'Sin descripción disponible.';
  document.getElementById('modal-price').textContent = `$${articulo.precio.toFixed(2)}`;
  document.getElementById('modal-university').textContent = articulo.universidad;
  document.getElementById('modal-distance').textContent = `${articulo.distancia.toFixed(1)} km`;
  document.getElementById('modal-rating').textContent = `★ ${(articulo.calificacion ?? 0).toFixed(1)}`;
  document.getElementById('modal-entrega').textContent = articulo.entrega || 'A convenir con el vendedor';

  // Reinicia el boton de "Agregar a la bolsa" por si quedo marcado
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
 *   - Boton de cerrar (la "X").
 *   - Click en el fondo oscuro, fuera de la tarjeta blanca.
 *   - Tecla Escape (tambien cierra el menu de perfil si esta abierto).
 *   - Boton "Agregar a la bolsa".
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
    if (window.menuPerfilActivo) window.menuPerfilActivo.cerrar();
  });

  botonAgregarCarrito.addEventListener('click', function () {
    if (idArticuloEnModal === null) return;
    agregarAlCarrito(idArticuloEnModal);

    botonAgregarCarrito.textContent = 'Agregado a la bolsa';
    botonAgregarCarrito.classList.add('added');
    setTimeout(cerrarModalDeProducto, 700);
  });
}

// ============================================================
// CARRITO ("bolsa de compras")
// ============================================================

/**
 * Agrega el id de un articulo al carrito, lo persiste en
 * localStorage y actualiza el numero que se ve en el icono del carrito.
 * @param {number} idArticulo
 */
function agregarAlCarrito(idArticulo) {
  carrito.push(idArticulo);
  guardarCarrito(carrito);
  actualizarBadgeCarrito();
}

/** Actualiza el numero mostrado en el badge del icono del carrito. */
function actualizarBadgeCarrito() {
  const badge = document.getElementById('badge');
  if (badge) badge.textContent = carrito.length;
}

// ---------------------------------------------------------
// EVENTOS DE FILTROS Y UBICACION
// ---------------------------------------------------------
/**
 * Configura los controles que no son ni el buscador ni el modal ni
 * el perfil: los botones de filtro por categoria, el slider de radio
 * y el boton de detectar ubicacion.
 */
function configurarEventosDeFiltros() {
  // 1. Botones de filtro por categoria
  const botonesFiltro = document.querySelectorAll('.filter-btn');
  botonesFiltro.forEach(boton => {
    boton.addEventListener('click', function () {
      botonesFiltro.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      categoriaActual = this.dataset.filter;
      renderizarArticulos();
    });
  });

  // 2. Selector de universidad (se llena con la lista de datos.js)
  const selectUniversidad = document.getElementById('filtro-universidad');
  if (selectUniversidad) {
    const universidades = window.UNIVERSIDADES_DISPONIBLES || [];
    universidades.forEach(universidad => {
      const opcion = document.createElement('option');
      opcion.value = universidad;
      opcion.textContent = universidad;
      selectUniversidad.appendChild(opcion);
    });

    selectUniversidad.addEventListener('change', function () {
      universidadFiltro = this.value;
      renderizarArticulos();
    });
  }

  // 3. Slider de radio de busqueda
  const sliderRadio = document.getElementById('radius-slider');
  const etiquetaRadio = document.getElementById('radius-label');
  if (sliderRadio) {
    sliderRadio.addEventListener('input', function () {
      radioActual = parseFloat(this.value);
      etiquetaRadio.textContent = `${radioActual} km`;
      renderizarArticulos();
    });
  }

  // 4. Boton para detectar la ubicacion del usuario
  const botonUbicacion = document.getElementById('detect-location');
  const textoUbicacion = document.getElementById('location-text');
  const badgeUbicacion = document.getElementById('location-badge');
  const textoBadgeUbicacion = document.getElementById('badge-text');

  if (botonUbicacion) {
    botonUbicacion.addEventListener('click', function () {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          posicion => {
            ubicacionUsuario = { lat: posicion.coords.latitude, lng: posicion.coords.longitude };
            textoUbicacion.textContent = 'Ubicación detectada';
            badgeUbicacion.classList.remove('hidden');
            textoBadgeUbicacion.textContent = `A menos de ${radioActual} km de tu ubicación`;
            renderizarArticulos();
          },
          () => {
            ubicacionUsuario = { lat: 19.4326, lng: -99.1332 };
            textoUbicacion.textContent = 'Ubicación simulada (CDMX)';
            badgeUbicacion.classList.remove('hidden');
            textoBadgeUbicacion.textContent = `A menos de ${radioActual} km (simulado)`;
            renderizarArticulos();
            alert('No se pudo obtener ubicación real. Usamos una ubicación simulada.');
          }
        );
      } else {
        ubicacionUsuario = { lat: 19.4326, lng: -99.1332 };
        textoUbicacion.textContent = 'Ubicación simulada (CDMX)';
        badgeUbicacion.classList.remove('hidden');
        textoBadgeUbicacion.textContent = `A menos de ${radioActual} km (simulado)`;
        renderizarArticulos();
      }
    });
  }
}
// ---------------------------------------------------------
// ARRANQUE DE LA APLICACION
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', inicializar);
