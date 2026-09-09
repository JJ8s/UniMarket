// ============================================================
// publicar.js - Logica de la pagina "Crear Publicacion"
// ============================================================
// Depende de datos.js y interfaz.js (deben cargarse antes, ver el orden
// de los <script> en publicar.html).
//
// Nota de estilo: comentarios sin tildes a proposito. El texto
// que ve el usuario (labels, mensajes) si mantiene tildes.
// ============================================================

// Opciones disponibles para el selector de categoria.
// El "valor" es la clave interna que se guarda en el articulo,
// la "etiqueta" es lo que ve el usuario.
const OPCIONES_CATEGORIA = [
  { valor: 'snacks', etiqueta: 'Snacks & Comida' },
  { valor: 'ropa', etiqueta: 'Ropa & Accesorios' },
  { valor: 'tecnologia', etiqueta: 'Tecnología & Electrónica' },
  { valor: 'libros', etiqueta: 'Libros & Material de Estudio' },
  { valor: 'otros', etiqueta: 'Otros' },
];

// Opciones disponibles para el selector de estado del producto.
// Aqui el valor y la etiqueta son iguales porque ya es un texto
// legible que se guarda tal cual en el articulo.
const OPCIONES_ESTADO = [
  { valor: 'Nuevo (Sellado)', etiqueta: 'Nuevo (Sellado)' },
  { valor: 'Como Nuevo (Casi sin uso)', etiqueta: 'Como Nuevo (Casi sin uso)' },
  { valor: 'Usado - Buen estado', etiqueta: 'Usado - Buen estado' },
  { valor: 'Usado - Aceptable', etiqueta: 'Usado - Aceptable' },
];

/**
 * Selector tipo "modal" reutilizable para campos de una sola opcion
 * (Categoria, Estado). Muestra una lista de opciones con radio button
 * dentro del modal generico (#option-modal) y, al elegir una, la
 * escribe en un input oculto y actualiza el texto del boton visible.
 */
class SelectorModal {
  /**
   * @param {Object} configuracion
   * @param {string} configuracion.idBoton - boton que abre el selector
   * @param {string} configuracion.idInputOculto - input hidden con el valor elegido
   * @param {string} configuracion.titulo - texto de encabezado del modal
   * @param {Array<{valor:string, etiqueta:string}>} configuracion.opciones
   */
  constructor(configuracion) {
    this.boton = document.getElementById(configuracion.idBoton);
    this.inputOculto = document.getElementById(configuracion.idInputOculto);
    this.titulo = configuracion.titulo;
    this.opciones = configuracion.opciones;
  }

  /** Engancha el evento de click en el boton visible. */
  inicializar() {
    if (!this.boton) return;
    this.boton.addEventListener('click', () => this.abrir());
  }

  /** Abre el modal generico de opciones (#option-modal) con esta lista. */
  abrir() {
    const modal = document.getElementById('option-modal');
    const tituloModal = document.getElementById('option-modal-title');
    const listaModal = document.getElementById('option-modal-list');

    tituloModal.textContent = this.titulo;
    const valorActual = this.inputOculto.value;
    listaModal.innerHTML = this.opciones.map(opcion => `
      <button type="button" class="option-item" data-valor="${opcion.valor}">
        <span>${opcion.etiqueta}</span>
        <span class="option-radio ${opcion.valor === valorActual ? 'option-radio-selected' : ''}"></span>
      </button>
    `).join('');

    // Al elegir una opcion: guardar el valor, actualizar el boton y cerrar
    listaModal.querySelectorAll('.option-item').forEach(item => {
      item.addEventListener('click', () => {
        const valorElegido = item.dataset.valor;
        const etiquetaElegida = item.querySelector('span').textContent;
        this.inputOculto.value = valorElegido;
        this.boton.textContent = etiquetaElegida;
        this.boton.classList.add('has-value');
        modal.classList.add('hidden');
      });
    });

    modal.classList.remove('hidden');
  }
}

/**
 * Se encarga de leer las fotos que el usuario selecciona, comprimirlas
 * (para no llenar el localStorage) y mostrar una vista previa en
 * miniatura. El resultado queda disponible en formato "data URL",
 * que se puede guardar directamente en localStorage y usar como
 * background-image sin necesidad de un servidor.
 */
class CargadorFotos {
  /**
   * @param {string} idInput - input type="file" que dispara la seleccion
   * @param {string} idContenedorPreview - contenedor donde se pintan las miniaturas
   * @param {number} maxFotos - cuantas fotos se aceptan como maximo
   */
  constructor(idInput, idContenedorPreview, maxFotos = 4) {
    this.input = document.getElementById(idInput);
    this.contenedorPreview = document.getElementById(idContenedorPreview);
    this.maxFotos = maxFotos;
    this.fotos = []; // data URLs ya comprimidas, listas para guardar
  }

  /** Engancha el evento de seleccion de archivos. */
  inicializar() {
    if (!this.input) return;
    this.input.addEventListener('change', () => this.manejarSeleccion());
  }

  /** Lee y comprime todos los archivos seleccionados (hasta maxFotos). */
  async manejarSeleccion() {
    const archivos = Array.from(this.input.files).slice(0, this.maxFotos);
    this.fotos = await Promise.all(archivos.map(archivo => this.comprimirImagen(archivo)));
    this.pintarPreview();
  }

  /**
   * Reduce el tamano de una imagen (maximo 480px de lado) y la
   * convierte a JPEG con compresion, para que ocupe poco espacio
   * en localStorage.
   * @param {File} archivo
   * @returns {Promise<string>} data URL de la imagen ya comprimida
   */
  comprimirImagen(archivo) {
    return new Promise((resolve) => {
      const lector = new FileReader();
      lector.onload = (evento) => {
        const imagen = new Image();
        imagen.onload = () => {
          const tamanoMaximo = 480;
          const escala = Math.min(1, tamanoMaximo / Math.max(imagen.width, imagen.height));
          const canvas = document.createElement('canvas');
          canvas.width = imagen.width * escala;
          canvas.height = imagen.height * escala;
          canvas.getContext('2d').drawImage(imagen, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        imagen.src = evento.target.result;
      };
      lector.readAsDataURL(archivo);
    });
  }

  /** Pinta las miniaturas de las fotos ya comprimidas. */
  pintarPreview() {
    if (!this.contenedorPreview) return;
    this.contenedorPreview.innerHTML = this.fotos
      .map(foto => `<img src="${foto}" class="upload-preview-thumb" alt="foto del producto" />`)
      .join('');
  }

  /** @returns {Array<string>} las fotos ya comprimidas (data URLs) */
  obtenerFotos() {
    return this.fotos;
  }
}

/**
 * Controla el formulario completo de "Crear Publicacion": valida
 * los campos, arma el objeto del nuevo articulo (incluyendo las
 * fotos que haya subido el CargadorFotos), lo guarda junto a los
 * demas articulos y redirige de vuelta al catalogo.
 */
class FormularioPublicacion {
  /**
   * @param {string} idFormulario
   * @param {CargadorFotos} cargadorFotos - instancia ya inicializada
   */
  constructor(idFormulario, cargadorFotos) {
    this.formulario = document.getElementById(idFormulario);
    this.campoEntrega = document.getElementById('campo-entrega');
    this.contadorEntrega = document.getElementById('contador-entrega');
    this.cargadorFotos = cargadorFotos;
  }


  /** Engancha los eventos del formulario (contador de caracteres y envio). */
  inicializar() {
    if (!this.formulario) return;

    if (this.campoEntrega && this.contadorEntrega) {
      this.actualizarContadorEntrega();
      this.campoEntrega.addEventListener('input', () => this.actualizarContadorEntrega());
    }

    this.formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      this.manejarEnvio();
    });
  }

  /** Refleja cuantos caracteres lleva escritos el punto de entrega, sobre 300. */
  actualizarContadorEntrega() {
    const longitud = this.campoEntrega.value.length;
    this.contadorEntrega.textContent = `${longitud}/300`;
  }

  /**
   * Lee los valores del formulario.
   * @returns {Object} valores crudos, tal como estan en los campos
   */
  leerValores() {
    return {
      titulo: document.getElementById('campo-titulo').value.trim(),
      descripcion: document.getElementById('campo-descripcion').value.trim(),
      categoria: document.getElementById('campo-categoria').value,
      estado: document.getElementById('campo-estado').value,
      precio: document.getElementById('campo-precio').value,
      stock: document.getElementById('campo-stock').value,
      entrega: document.getElementById('campo-entrega').value.trim(),
      universidadesVenta: this.leerUniversidadesSeleccionadas(),
    };
  }

  /**
   * Lee que universidades quedaron marcadas en el checklist.
   * Un array vacio significa "todas las universidades" (sin restriccion).
   * @returns {Array<string>}
   */
  leerUniversidadesSeleccionadas() {
    const marcadas = document.querySelectorAll('#lista-universidades input[type="checkbox"]:checked');
    return Array.from(marcadas).map(casilla => casilla.value);
  }

  /**
   * Valida los valores minimos necesarios para publicar.
   * @param {Object} valores - resultado de leerValores()
   * @returns {string|null} mensaje de error, o null si todo esta bien
   */
  validar(valores) {
    if (!valores.categoria) return 'Selecciona una categoria.';
    if (!valores.estado) return 'Selecciona el estado del producto.';

    const precioNumerico = parseFloat(valores.precio);
    if (!valores.precio || isNaN(precioNumerico) || precioNumerico <= 0) {
      return 'Ingresa un precio valido, mayor a cero.';
    }

    const stockNumerico = parseInt(valores.stock, 10);
    if (!valores.stock || isNaN(stockNumerico) || stockNumerico < 1) {
      return 'Ingresa una cantidad valida, minimo 1.';
    }

    if (!valores.entrega) return 'Escribe un punto de entrega.';
    if (valores.entrega.length > 300) return 'El punto de entrega supera los 300 caracteres.';

    return null;
  }

  /**
   * Genera un titulo automatico cuando el usuario deja el campo vacio.
   * @param {string} categoria
   * @returns {string}
   */
  generarTituloAutomatico(categoria) {
    const etiqueta = OPCIONES_CATEGORIA.find(o => o.valor === categoria);
    return `Articulo de ${etiqueta ? etiqueta.etiqueta : categoria} sin titulo`;
  }

  /**
   * Genera un SKU automatico cuando el usuario deja el campo vacio.
   * @returns {string}
   */
  generarSkuAutomatico() {
    return `SKU-${Date.now().toString(36).toUpperCase()}`;
  }

  /** Valida, construye el nuevo articulo, lo guarda y redirige al catalogo. */
  manejarEnvio() {
    const valores = this.leerValores();
    const errorValidacion = this.validar(valores);
    if (errorValidacion) {
      alert(errorValidacion);
      return;
    }

    const usuario = (typeof obtenerSesion === 'function' && obtenerSesion()) || window.USUARIO_ACTUAL || {};
    const articulosActuales = cargarArticulos();

    const nuevoArticulo = {
      id: obtenerSiguienteId(articulosActuales),
      nombre: valores.titulo || this.generarTituloAutomatico(valores.categoria),
      descripcion: valores.descripcion,
      precio: parseFloat(valores.precio),
      calificacion: 0,
      categoria: valores.categoria,
      universidad: usuario.universidad || 'Sin universidad',
      vendedor: usuario.nombre || 'Vendedor',
      distancia: 0,
      condicion: valores.estado,
      stock: parseInt(valores.stock, 10),
      sku: this.generarSkuAutomatico(),
      entrega: valores.entrega,
      universidadesVenta: valores.universidadesVenta,
      fotos: this.cargadorFotos ? this.cargadorFotos.obtenerFotos() : [],
      creadoEn: Date.now(),
    };

    articulosActuales.push(nuevoArticulo);

    try {
      guardarArticulos(articulosActuales);
    } catch (error) {
      // Puede fallar si localStorage se queda sin espacio (fotos muy pesadas o muchas publicaciones)
      alert('No se pudo guardar la publicacion. Intenta con fotos mas livianas o menos fotos.');
      return;
    }

    window.location.href = 'index.html';
  }
}

/**
 * Pinta, dentro de #lista-universidades, un checkbox por cada
 * universidad disponible (definida en datos.js). No marca ninguna
 * por defecto: dejarlas todas sin marcar significa "vender a todas".
 */
function pintarListaUniversidades() {
  const contenedor = document.getElementById('lista-universidades');
  if (!contenedor) return;

  const universidades = window.UNIVERSIDADES_DISPONIBLES || [];
  contenedor.innerHTML = universidades.map((universidad, indice) => `
    <label class="checklist-item">
      <input type="checkbox" value="${universidad}" id="universidad-${indice}" />
      <span>${universidad}</span>
    </label>
  `).join('');
}

// ---------------------------------------------------------
// ARRANQUE DE LA PAGINA
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', function () {
  // Si no hay sesion activa, no se puede publicar: al login.
  if (typeof haySesionActiva === 'function' && !haySesionActiva()) {
    window.location.href = 'login.html';
    return;
  }

  // Menu de perfil (clase compartida definida en interfaz.js), con los
  // datos de la sesion real cuando existen.
  const usuarioSesion = (typeof obtenerSesion === 'function' && obtenerSesion()) || window.USUARIO_ACTUAL;
  const menuPerfil = new MenuPerfil('profile-btn', 'profile-dropdown', usuarioSesion);
  menuPerfil.inicializar();

  pintarListaUniversidades();

  // Selector de categoria
  new SelectorModal({
    idBoton: 'selector-categoria',
    idInputOculto: 'campo-categoria',
    titulo: 'Seleccionar categoria',
    opciones: OPCIONES_CATEGORIA,
  }).inicializar();

  // Selector de estado
  new SelectorModal({
    idBoton: 'selector-estado',
    idInputOculto: 'campo-estado',
    titulo: 'Seleccionar estado',
    opciones: OPCIONES_ESTADO,
  }).inicializar();

  // Cerrar el modal generico de opciones al hacer click afuera o con Escape
  const modalOpciones = document.getElementById('option-modal');
  if (modalOpciones) {
    modalOpciones.addEventListener('click', function (evento) {
      if (evento.target === modalOpciones) modalOpciones.classList.add('hidden');
    });
    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape') modalOpciones.classList.add('hidden');
    });
  }

  // Actualizar el numero del carrito en el header, igual que en el catalogo
  const badgeCarrito = document.getElementById('badge');
  if (badgeCarrito) badgeCarrito.textContent = cargarCarrito().length;

  // Cargador de fotos del producto (lee, comprime y muestra vista previa)
  const cargadorFotos = new CargadorFotos('input-fotos', 'fotos-preview');
  cargadorFotos.inicializar();

  // Formulario principal de publicacion
  new FormularioPublicacion('form-publicar', cargadorFotos).inicializar();
});
