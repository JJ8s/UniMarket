import { act, renderHook, waitFor } from '@testing-library/react';
import { usarCliente } from '../data/supabase';
import { crearSupabaseFalso } from '../tests/supabaseFalso';
import useMisArticulos from '../hooks/useMisArticulos';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('useMisArticulos', () => {
  let falso;
  let confirmOriginal;

  beforeEach(() => {
    falso = crearSupabaseFalso();
    usarCliente(falso.cliente);
    const [a1, a2, a3] = falso.db.articulos;
    Object.assign(a1, { vendedor_id: falso.ID_JUAN, stock: 10, creado_en: '2026-01-01T00:00:00.000Z' });
    Object.assign(a2, { vendedor_id: null, creado_en: '2026-01-02T00:00:00.000Z' });
    Object.assign(a3, { vendedor_id: falso.ID_JUAN, stock: 0, stock_guardado: 5, creado_en: '2026-01-03T00:00:00.000Z' });
    confirmOriginal = window.confirm;
  });

  afterEach(() => {
    window.confirm = confirmOriginal;
  });

  const esperarCarga = (hook) =>
    waitFor(() => {
      if (hook.result.current.cargando) throw new Error('todavia cargando');
    });

  const cargar = async () => {
    const hook = renderHook(() => useMisArticulos(falso.ID_JUAN));
    await esperarCarga(hook);
    return hook;
  };

  it('empieza en estado de carga y luego muestra los articulos', async () => {
    const hook = renderHook(() => useMisArticulos(falso.ID_JUAN));
    expect(hook.result.current.cargando).toBe(true);
    await esperarCarga(hook);
    expect(hook.result.current.misArticulos.length).toBe(2);
  });

  it('solo devuelve los articulos del vendedor indicado', async () => {
    const { result } = await cargar();
    expect(result.current.misArticulos.every((a) => a.vendedorId === falso.ID_JUAN)).toBe(true);
  });

  it('sin id de vendedor devuelve una lista vacia', async () => {
    const hook = renderHook(() => useMisArticulos(null));
    await esperarCarga(hook);
    expect(hook.result.current.misArticulos.length).toBe(0);
  });

  it('ordena los articulos del mas nuevo al mas viejo', async () => {
    const { result } = await cargar();
    expect(result.current.misArticulos.map((a) => a.id)).toEqual([3, 1]);
  });

  it('alternarDisponibilidad pone el stock en 0 y lo recuerda en stockGuardado', async () => {
    const { result } = await cargar();
    await act(async () => { await result.current.alternarDisponibilidad(1); });
    const actualizado = result.current.misArticulos.find((a) => a.id === 1);
    expect(actualizado.stock).toBe(0);
    expect(actualizado.stockGuardado).toBe(10);
  });

  it('alternarDisponibilidad restaura el stock guardado al reactivar', async () => {
    const { result } = await cargar();
    await act(async () => { await result.current.alternarDisponibilidad(3); });
    expect(result.current.misArticulos.find((a) => a.id === 3).stock).toBe(5);
  });

  it('borrarArticulo no borra nada si el usuario cancela la confirmacion', async () => {
    window.confirm = () => false;
    const { result } = await cargar();
    await act(async () => { await result.current.borrarArticulo(1, '¿Seguro?'); });
    expect(result.current.misArticulos.length).toBe(2);
  });

  it('borrarArticulo borra el articulo si el usuario confirma', async () => {
    window.confirm = () => true;
    const { result } = await cargar();
    await act(async () => { await result.current.borrarArticulo(1, '¿Seguro?'); });
    expect(result.current.misArticulos.some((a) => a.id === 1)).toBe(false);
    expect(result.current.misArticulos.length).toBe(1);
  });
});
