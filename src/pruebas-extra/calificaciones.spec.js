import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { calificarArticulo, estadoCalificacion, cargarArticulos } from '../data/datos';
import { usarCliente } from '../data/supabase';
import { crearSupabaseFalso } from '../tests/supabaseFalso';
import CalificarArticulo from '../components/CalificarArticulo';
import Estrellas from '../components/Estrellas';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let falso;
const preparar = () => {
  falso = crearSupabaseFalso();
  usarCliente(falso.cliente);
};

const esperar = (condicion) =>
  waitFor(() => {
    if (!condicion()) throw new Error('todavia no');
  });

describe('Calificaciones - capa de datos', () => {
  beforeEach(preparar);

  it('un comprador califica y el promedio se recalcula', async () => {
    falso.iniciarComo('juan.perez@unimarket.edu');
    const r = await calificarArticulo(1, 4);
    expect(r.ok).toBe(true);
    expect(r.articulo.calificacion).toBe(4);
    expect(r.articulo.calificacionesCantidad).toBe(1);

    falso.iniciarComo('admin@unimarket.edu');
    falso.db.ordenes.push({ folio: 'BOL-X', user_id: falso.ID_ADMIN, cliente_correo: 'admin@unimarket.edu', estado: 'Pagada', lineas: [{ idArticulo: 1 }] });
    const r2 = await calificarArticulo(1, 5);
    expect(r2.articulo.calificacion).toBe(4.5);
    expect(r2.articulo.calificacionesCantidad).toBe(2);
  });

  it('volver a calificar cambia el voto y no suma otro', async () => {
    falso.iniciarComo('juan.perez@unimarket.edu');
    await calificarArticulo(1, 2);
    const r = await calificarArticulo(1, 5);
    expect(r.articulo.calificacion).toBe(5);
    expect(r.articulo.calificacionesCantidad).toBe(1);
    expect((await estadoCalificacion(1)).puntaje).toBe(5);
  });

  it('solo puede calificar quien compró el artículo', async () => {
    falso.iniciarComo('admin@unimarket.edu');
    const r = await calificarArticulo(4, 5);
    expect(r.ok).toBe(false);
    expect(r.mensaje).toMatch(/compraste/);
    expect((await estadoCalificacion(4)).motivo).toMatch(/compraste/);
  });

  it('no se puede calificar el propio artículo', async () => {
    falso.db.articulos[0].vendedor_id = falso.ID_JUAN;
    falso.iniciarComo('juan.perez@unimarket.edu');
    const r = await calificarArticulo(1, 5);
    expect(r.ok).toBe(false);
    expect(r.mensaje).toMatch(/propio/);
  });

  it('rechaza puntajes fuera de 1 a 5 y exige sesión', async () => {
    falso.iniciarComo('juan.perez@unimarket.edu');
    expect((await calificarArticulo(1, 0)).ok).toBe(false);
    expect((await calificarArticulo(1, 6)).ok).toBe(false);
    expect((await calificarArticulo(1, 3.5)).ok).toBe(false);
    usarCliente(crearSupabaseFalso().cliente);
    expect((await calificarArticulo(1, 5)).ok).toBe(false);
  });

  it('la lista de artículos trae el promedio y la cantidad', async () => {
    falso.iniciarComo('juan.perez@unimarket.edu');
    await calificarArticulo(1, 3);
    const brownies = (await cargarArticulos()).find((a) => a.id === 1);
    expect(brownies.calificacion).toBe(3);
    expect(brownies.calificacionesCantidad).toBe(1);
  });
});

describe('Calificaciones - componentes', () => {
  beforeEach(preparar);
  afterEach(() => cleanup());

  it('Estrellas muestra "Sin calificar" y el promedio con su cantidad', () => {
    const vacio = render(<Estrellas valor={0} cantidad={0} />);
    expect(vacio.getByText('Sin calificar')).toBeTruthy();
    vacio.unmount();

    const con = render(<Estrellas valor={4.5} cantidad={2} />);
    expect(con.getByText('4.5')).toBeTruthy();
    expect(con.getByText('(2 calificaciones)')).toBeTruthy();
    expect(con.container.querySelector('.estrellas-relleno').style.width).toBe('90%');
  });

  it('CalificarArticulo muestra una vista previa al pasar el mouse', async () => {
    falso.iniciarComo('juan.perez@unimarket.edu');
    const { container, getByText } = render(<CalificarArticulo articulo={{ id: 1 }} />);
    await esperar(() => container.querySelector('.calificar-etiqueta').textContent.includes('Toca una estrella'));

    const botones = container.querySelectorAll('.calificar-estrella');
    expect(botones.length).toBe(5);
    fireEvent.mouseEnter(botones[3]);
    expect(getByText('4 estrellas · Muy bueno')).toBeTruthy();
    expect(container.querySelectorAll('.calificar-estrella.activa').length).toBe(4);
    fireEvent.mouseLeave(container.querySelector('.calificar-estrellas'));
    expect(container.querySelectorAll('.calificar-estrella.activa').length).toBe(0);
  });

  it('CalificarArticulo guarda la calificación y avisa al padre', async () => {
    falso.iniciarComo('juan.perez@unimarket.edu');
    const recibidos = [];
    const { container, findByText } = render(<CalificarArticulo articulo={{ id: 1 }} onCalificado={(a) => recibidos.push(a)} />);
    await esperar(() => !container.querySelector('.calificar-estrella').disabled);

    fireEvent.click(container.querySelectorAll('.calificar-estrella')[4]);
    expect(await findByText('¡Gracias! Tu calificación quedó guardada.')).toBeTruthy();
    expect(recibidos.length).toBe(1);
    expect(recibidos[0].calificacion).toBe(5);
    expect(container.querySelector('[aria-checked="true"]').getAttribute('aria-label')).toMatch(/^5 estrellas/);
  });

  it('CalificarArticulo bloquea las estrellas y explica por qué si no compró', async () => {
    falso.iniciarComo('admin@unimarket.edu');
    const { container, findByText } = render(<CalificarArticulo articulo={{ id: 4 }} />);
    expect(await findByText('Solo puedes calificar artículos que compraste.')).toBeTruthy();
    const botones = container.querySelectorAll('.calificar-estrella');
    expect(Array.from(botones).every((b) => b.disabled)).toBe(true);
  });

  it('CalificarArticulo permite moverse con las flechas del teclado', async () => {
    falso.iniciarComo('juan.perez@unimarket.edu');
    const { container } = render(<CalificarArticulo articulo={{ id: 1 }} />);
    await esperar(() => !container.querySelector('.calificar-estrella').disabled);
    const botones = container.querySelectorAll('.calificar-estrella');
    botones[0].focus();
    fireEvent.keyDown(botones[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(botones[1]);
    fireEvent.keyDown(botones[1], { key: 'End' });
    expect(document.activeElement).toBe(botones[4]);
  });
});
