export const ESTADO_PAGADA = 'Pagada';

/** Ordenes que cuentan */
export function ordenesPagadas(ordenes) {
  return ordenes.filter((o) => o.estado === ESTADO_PAGADA);
}

/** Suma del total */
export function totalVentas(ordenes) {
  return ordenesPagadas(ordenes).reduce((suma, o) => suma + o.total, 0);
}

export function resumenOrdenes(ordenes) {
  return {
    total: ordenes.length,
    pagadas: ordenes.filter((o) => o.estado === 'Pagada').length,
    pendientes: ordenes.filter((o) => o.estado === 'Pendiente').length,
    anuladas: ordenes.filter((o) => o.estado === 'Anulada').length,
  };
}

export function ventasPorCategoria(ordenes) {
  const mapa = {};
  ordenesPagadas(ordenes).forEach((orden) => {
    orden.lineas.forEach((linea) => {
      const fila = mapa[linea.categoria] || { categoria: linea.categoria, unidades: 0, monto: 0 };
      fila.unidades += linea.cantidad;
      fila.monto += linea.precio * linea.cantidad;
      mapa[linea.categoria] = fila;
    });
  });
  return Object.values(mapa).sort((a, b) => b.monto - a.monto);
}

export function productosMasVendidos(ordenes, limite = 5) {
  const mapa = {};
  ordenesPagadas(ordenes).forEach((orden) => {
    orden.lineas.forEach((linea) => {
      const fila = mapa[linea.idArticulo] || { idArticulo: linea.idArticulo, nombre: linea.nombre, unidades: 0, monto: 0 };
      fila.unidades += linea.cantidad;
      fila.monto += linea.precio * linea.cantidad;
      mapa[linea.idArticulo] = fila;
    });
  });
  return Object.values(mapa)
    .sort((a, b) => b.unidades - a.unidades || b.monto - a.monto)
    .slice(0, limite);
}

export function ventasPorMes(ordenes) {
  const mapa = {};
  ordenesPagadas(ordenes).forEach((orden) => {
    const fecha = new Date(orden.creadaEn);
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    const fila = mapa[clave] || { clave, monto: 0, ordenes: 0 };
    fila.monto += orden.total;
    fila.ordenes += 1;
    mapa[clave] = fila;
  });
  return Object.values(mapa).sort((a, b) => a.clave.localeCompare(b.clave));
}

export function convertirACsv(filas, columnas) {
  const celda = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;
  const encabezado = columnas.map((c) => celda(c.titulo)).join(',');
  const cuerpo = filas.map((fila) => columnas.map((c) => celda(fila[c.clave])).join(','));
  return [encabezado, ...cuerpo].join('\n');
}
