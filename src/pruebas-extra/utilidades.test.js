import { describe, expect, it } from 'vitest';
import {
  agruparCarrito,
  formatearPrecio,
  lineasAIds,
  normalizarTexto,
  obtenerColorImagen,
} from '../utils/utilidades';

// FormatearPrecio: numero
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

// NormalizarTexto: minusculas
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

describe('agruparCarrito', () => {
  const articulosDisponibles = [
    { id: 1, nombre: 'Brownie', precio: 2.5 },
    { id: 2, nombre: 'Calculadora', precio: 15 },
  ];

  it('agrupa ids repetidos en una sola linea con su cantidad', () => {
    const { lineas, hayFantasmas } = agruparCarrito([1, 1, 1, 2], articulosDisponibles);

    expect(lineas).toHaveLength(2);
    expect(lineas.find((l) => l.articulo.id === 1).cantidad).toBe(3);
    expect(lineas.find((l) => l.articulo.id === 2).cantidad).toBe(1);
    expect(hayFantasmas).toBe(false);
  });

  it('marca hayFantasmas cuando un id del carrito ya no existe como articulo', () => {
    const { lineas, hayFantasmas } = agruparCarrito([1, 999], articulosDisponibles);

    expect(lineas).toHaveLength(1);
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
