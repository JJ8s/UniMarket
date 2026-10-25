// Pruebas Jasmine (ejecutadas por Karma): npm run test:karma
// Mismos casos que utilidades.test.js (Vitest), con sintaxis Jasmine.
import {
  agruparCarrito,
  formatearPrecio,
  lineasAIds,
  normalizarTexto,
  obtenerColorImagen,
} from './utilidades';

// ------------------------------------------------------------
// formatearPrecio: numero -> texto con simbolo $ y 2 decimales
// ------------------------------------------------------------
describe('formatearPrecio', () => {
  it('agrega el simbolo $ y dos decimales', () => {
    expect(formatearPrecio(2.5)).toBe('$2.50');
  });

  it('redondea a 2 decimales cuando el numero tiene mas', () => {
    expect(formatearPrecio(19.999)).toBe('$20.00');
  });

  it('funciona con precios enteros', () => {
    expect(formatearPrecio(10)).toBe('$10.00');
  });
});

// ------------------------------------------------------------
// normalizarTexto: minusculas y sin acentos, para comparar busquedas
// ------------------------------------------------------------
describe('normalizarTexto', () => {
  it('pasa el texto a minusculas', () => {
    expect(normalizarTexto('CALCULADORA')).toBe('calculadora');
  });

  it('quita los acentos', () => {
    expect(normalizarTexto('Científica')).toBe('cientifica');
  });

  it('devuelve texto vacio si recibe null o undefined', () => {
    expect(normalizarTexto(null)).toBe('');
    expect(normalizarTexto(undefined)).toBe('');
  });
});

// ------------------------------------------------------------
// obtenerColorImagen: siempre devuelve un color de la paleta
// ------------------------------------------------------------
describe('obtenerColorImagen', () => {
  it('devuelve el mismo color para el mismo id (es determinista)', () => {
    expect(obtenerColorImagen(7)).toBe(obtenerColorImagen(7));
  });

  it('no revienta con ids mas grandes que el tamano de la paleta', () => {
    const color = obtenerColorImagen(999);
    expect(typeof color).toBe('string');
    expect(color.startsWith('#')).toBe(true);
  });
});

// ------------------------------------------------------------
// agruparCarrito / lineasAIds: ida y vuelta entre el array plano de
// ids del carrito y las lineas agrupadas {articulo, cantidad}
// ------------------------------------------------------------
describe('agruparCarrito', () => {
  const articulosDisponibles = [
    { id: 1, nombre: 'Brownie', precio: 2.5 },
    { id: 2, nombre: 'Calculadora', precio: 15 },
  ];

  it('agrupa ids repetidos en una sola linea con su cantidad', () => {
    const { lineas, hayFantasmas } = agruparCarrito([1, 1, 1, 2], articulosDisponibles);

    expect(lineas.length).toBe(2);
    expect(lineas.find((l) => l.articulo.id === 1).cantidad).toBe(3);
    expect(lineas.find((l) => l.articulo.id === 2).cantidad).toBe(1);
    expect(hayFantasmas).toBe(false);
  });

  it('marca hayFantasmas cuando un id del carrito ya no existe como articulo', () => {
    const { lineas, hayFantasmas } = agruparCarrito([1, 999], articulosDisponibles);

    expect(lineas.length).toBe(1); // el id 999 (fantasma) se descarta
    expect(hayFantasmas).toBe(true);
  });

  it('con un carrito vacio devuelve lineas vacias y sin fantasmas', () => {
    const { lineas, hayFantasmas } = agruparCarrito([], articulosDisponibles);
    expect(lineas).toEqual([]);
    expect(hayFantasmas).toBe(false);
  });

  it('lineasAIds es el inverso de agruparCarrito', () => {
    const idsOriginales = [1, 1, 2, 2, 2];
    const { lineas } = agruparCarrito(idsOriginales, articulosDisponibles);
    const idsReconstruidos = lineasAIds(lineas).sort();
    expect(idsReconstruidos).toEqual([...idsOriginales].sort());
  });
});
