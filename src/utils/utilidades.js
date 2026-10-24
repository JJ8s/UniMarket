// ============================================================
// Utilidades compartidas. Antes cada pagina .html repetia su propia
// copia de obtenerColorImagen(), escaparHtml(), obtenerLineasDeBolsa(),
// etc. Ahora viven aqui una sola vez.
// (escaparHtml ya no hace falta: React escapa el texto por defecto.)
// ============================================================

// Las categorias ya no estan escritas aqui: viven en la base de datos y se
// editan desde el panel de administracion. En los componentes se obtienen con
// useCategorias() (context/CategoriasContext.jsx). Estas dos funciones son puras
// (reciben la lista) para poder usarlas y probarlas sin consultar nada.

/** Lista { valor, etiqueta } para selectores y botones de filtro. */
export function obtenerOpcionesCategoria(categorias) {
  return categorias.map(({ valor, etiqueta }) => ({ valor, etiqueta }));
}

/** Nombre visible de una categoria (si ya no existe, devuelve el valor tal cual). */
export function etiquetaCategoria(valor, categorias) {
  const categoria = categorias.find((c) => c.valor === valor);
  return categoria ? categoria.etiqueta : valor;
}

// Opciones del selector de estado del producto en publicar.
export const OPCIONES_ESTADO = [
  'Nuevo (Sellado)',
  'Como Nuevo (Casi sin uso)',
  'Usado - Buen estado',
  'Usado - Aceptable',
].map((texto) => ({ valor: texto, etiqueta: texto }));

// Paleta placeholder para articulos sin fotos.
const COLORES_IMAGEN = ['#FDF3D0', '#E7E9EC', '#DCEBFB', '#D9F5E3', '#FCE1E4'];

export function obtenerColorImagen(idArticulo) {
  return COLORES_IMAGEN[idArticulo % COLORES_IMAGEN.length];
}

/**
 * Estilo (objeto para el prop `style` de React) del bloque de imagen de un
 * articulo: primera foto si tiene, o el color placeholder.
 */
export function obtenerEstiloImagen(articulo) {
  if (articulo.fotos && articulo.fotos.length > 0) {
    return {
      backgroundImage: `url('${articulo.fotos[0]}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return { background: obtenerColorImagen(articulo.id) };
}

/** Minusculas y sin acentos, para comparar busquedas. */
export function normalizarTexto(texto) {
  return (texto || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Fecha y hora, ej. "16 oct 2026, 14:30". */
export function formatearFechaHora(marcaDeTiempo) {
  if (!marcaDeTiempo) return '';
  return new Date(marcaDeTiempo).toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatearPrecio(numero) {
  return `$${Number(numero).toFixed(2)}`;
}

export function formatearFecha(marcaDeTiempo) {
  if (!marcaDeTiempo) return '';
  return new Date(marcaDeTiempo).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * El carrito se guarda como un array plano de ids (uno por unidad).
 * Aqui se agrupa en lineas { articulo, cantidad }. Los ids cuyo articulo
 * ya no existe se descartan y se avisa con `hayFantasmas`.
 */
export function agruparCarrito(idsEnCarrito, articulosDisponibles) {
  const conteoPorId = idsEnCarrito.reduce((mapa, id) => {
    mapa[id] = (mapa[id] || 0) + 1;
    return mapa;
  }, {});

  const lineas = [];
  let hayFantasmas = false;

  Object.keys(conteoPorId).forEach((idTexto) => {
    const id = Number(idTexto);
    const articulo = articulosDisponibles.find((a) => a.id === id);
    if (!articulo) {
      hayFantasmas = true;
      return;
    }
    lineas.push({ articulo, cantidad: conteoPorId[id] });
  });

  return { lineas, hayFantasmas };
}

/** Convierte lineas { articulo, cantidad } de vuelta al array plano de ids. */
export function lineasAIds(lineas) {
  return lineas.flatMap((linea) => Array(linea.cantidad).fill(linea.articulo.id));
}

/**
 * Lee una imagen, la reduce (lado mas largo = tamanoMaximo) y la
 * comprime a JPEG para que ocupe poco en localStorage.
 * @returns {Promise<string>} data URL
 */
export function comprimirImagen(archivo, tamanoMaximo, calidad) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = reject;
    lector.onload = (evento) => {
      const imagen = new Image();
      imagen.onerror = reject;
      imagen.onload = () => {
        const escala = Math.min(1, tamanoMaximo / Math.max(imagen.width, imagen.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(imagen.width * escala);
        canvas.height = Math.round(imagen.height * escala);
        canvas.getContext('2d').drawImage(imagen, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      imagen.src = evento.target.result;
    };
    lector.readAsDataURL(archivo);
  });
}
