/** Lista para selectores */
export function obtenerOpcionesCategoria(categorias) {
  return categorias.map(({ valor, etiqueta }) => ({ valor, etiqueta }));
}

export function etiquetaCategoria(valor, categorias) {
  const categoria = categorias.find((c) => c.valor === valor);
  return categoria ? categoria.etiqueta : valor;
}

// Opciones del selector
export const OPCIONES_ESTADO = [
  'Nuevo (Sellado)',
  'Como Nuevo (Casi sin uso)',
  'Usado - Buen estado',
  'Usado - Aceptable',
].map((texto) => ({ valor: texto, etiqueta: texto }));

// Colores de relleno
const COLORES_IMAGEN = ['#FDF3D0', '#E7E9EC', '#DCEBFB', '#D9F5E3', '#FCE1E4'];

export function obtenerColorImagen(idArticulo) {
  return COLORES_IMAGEN[idArticulo % COLORES_IMAGEN.length];
}

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

/** Minusculas y sin acentos */
export function normalizarTexto(texto) {
  return (texto || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Fecha y hora */
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

export function lineasAIds(lineas) {
  return lineas.flatMap((linea) => Array(linea.cantidad).fill(linea.articulo.id));
}

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
