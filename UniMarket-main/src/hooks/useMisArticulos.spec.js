// Pruebas Jasmine (ejecutadas por Karma): npm run test:karma
// Mismos casos que useMisArticulos.test.js (Vitest), con sintaxis Jasmine.
import { act, renderHook } from '@testing-library/react';
import { guardarArticulos } from '../data/datos';
import useMisArticulos from './useMisArticulos';

// React le avisa a Testing Library que el entorno soporta act() (en Vitest
// esto lo hace jsdom/setup; aqui lo declaramos explicitamente).
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const articulosDePrueba = [
  { id: 1, nombre: 'Brownie', vendedor: 'María G.', stock: 10, creadoEn: 1000 },
  { id: 2, nombre: 'Chaqueta', vendedor: 'Ana V.', stock: 1, creadoEn: 2000 },
  { id: 3, nombre: 'Audífonos', vendedor: 'María G.', stock: 0, stockGuardado: 5, creadoEn: 3000 },
];

describe('useMisArticulos', () => {
  // IMPORTANTE: en Karma todos los .spec.js corren en la misma pagina, asi
  // que un beforeEach fuera de un describe se aplicaria a TODAS las pruebas
  // del proyecto. Por eso vive dentro de este describe.
  beforeEach(() => {
    localStorage.clear();
    guardarArticulos(articulosDePrueba);
  });

  it('solo devuelve los articulos del vendedor indicado', () => {
    const { result } = renderHook(() => useMisArticulos('María G.'));
    expect(result.current.misArticulos.length).toBe(2);
    expect(result.current.misArticulos.every((a) => a.vendedor === 'María G.')).toBe(true);
  });

  it('ordena los articulos del mas nuevo al mas viejo', () => {
    const { result } = renderHook(() => useMisArticulos('María G.'));
    expect(result.current.misArticulos.map((a) => a.id)).toEqual([3, 1]); // creadoEn 3000 antes que 1000
  });

  it('alternarDisponibilidad pone el stock en 0 y lo recuerda en stockGuardado', () => {
    const { result } = renderHook(() => useMisArticulos('María G.'));

    act(() => result.current.alternarDisponibilidad(1)); // id 1 tenia stock 10

    const actualizado = result.current.misArticulos.find((a) => a.id === 1);
    expect(actualizado.stock).toBe(0);
    expect(actualizado.stockGuardado).toBe(10);
  });

  it('alternarDisponibilidad restaura el stock guardado al reactivar', () => {
    const { result } = renderHook(() => useMisArticulos('María G.'));

    act(() => result.current.alternarDisponibilidad(3)); // id 3 tenia stock 0, stockGuardado 5

    const actualizado = result.current.misArticulos.find((a) => a.id === 3);
    expect(actualizado.stock).toBe(5);
  });

  it('borrarArticulo no borra nada si el usuario cancela la confirmacion', () => {
    spyOn(window, 'confirm').and.returnValue(false); // Jasmine: spyOn(...).and.returnValue(...)
    const { result } = renderHook(() => useMisArticulos('María G.'));

    act(() => result.current.borrarArticulo(1, '¿Seguro?'));

    expect(result.current.misArticulos.length).toBe(2); // sigue habiendo 2
  });

  it('borrarArticulo borra el articulo si el usuario confirma', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const { result } = renderHook(() => useMisArticulos('María G.'));

    act(() => result.current.borrarArticulo(1, '¿Seguro?'));

    expect(result.current.misArticulos.some((a) => a.id === 1)).toBe(false);
    expect(result.current.misArticulos.length).toBe(1);
  });
});
