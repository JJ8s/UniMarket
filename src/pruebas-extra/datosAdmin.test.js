// Pruebas de la capa de datos del panel de administracion (usuarios y roles,
// categorias, articulos y ordenes) contra un Supabase FALSO en memoria.
// Las politicas RLS NO se prueban aqui (el falso no las imita): se probaron
// contra un PostgreSQL real con supabase/esquema.sql.
// Usa solo sintaxis comun a Vitest y Jasmine; existe una copia identica como
// datosAdmin.spec.js (la que corre Karma).
import {
  ROL_ADMIN,
  ROL_CLIENTE,
  UMBRAL_STOCK_CRITICO,
  actualizarArticulo,
  actualizarCategoria,
  actualizarEstadoOrden,
  actualizarUsuarioAdmin,
  cargarArticulos,
  cargarCategorias,
  cargarOrdenes,
  cargarUsuarios,
  crearArticulo,
  crearCategoria,
  crearOrden,
  crearUsuario,
  eliminarArticulo,
  eliminarCategoria,
  eliminarUsuario,
  obtenerArticulosCriticos,
  obtenerOrden,
  obtenerUsuario,
  ordenesDeUsuario,
} from '../data/datos';
import { usarCliente } from '../data/supabase';
import { crearSupabaseFalso } from '../tests/supabaseFalso';

// OJO: en Karma todos los .spec.js comparten pagina y modulos, asi que esto NO
// va en un beforeEach global (pisaria el Supabase falso de las demas pruebas):
// se registra dentro de cada describe.
let falso;
const preparar = () => {
  localStorage.clear();
  falso = crearSupabaseFalso();
  usarCliente(falso.cliente);
  falso.iniciarComo('admin@unimarket.edu'); // el panel lo usa un administrador con sesion
};

describe('Admin - usuarios y roles', () => {
  beforeEach(preparar);
  it('cargarUsuarios devuelve las cuentas con su rol', async () => {
    const usuarios = await cargarUsuarios();
    expect(usuarios.length).toBe(2);
    expect(usuarios.filter((u) => u.rol === ROL_ADMIN).length).toBe(1);
  });

  it('obtenerUsuario busca por correo sin distinguir mayusculas ni espacios', async () => {
    expect((await obtenerUsuario('  ADMIN@unimarket.edu ')).rol).toBe(ROL_ADMIN);
    expect(await obtenerUsuario('nadie@unimarket.edu')).toBeNull();
  });

  it('crearUsuario rechaza contraseñas cortas y correos invalidos', async () => {
    expect((await crearUsuario({ nombre: 'A', correo: 'a@correo.cl', contrasena: '123' })).ok).toBe(false);
    expect((await crearUsuario({ nombre: 'A', correo: 'correo-malo', contrasena: '123456' })).ok).toBe(false);
    expect((await crearUsuario({ nombre: '  ', correo: 'a@correo.cl', contrasena: '123456' })).ok).toBe(false);
  });

  it('crearUsuario crea un cliente y no cambia la sesion del administrador', async () => {
    const resultado = await crearUsuario({ nombre: 'Nueva Persona', correo: 'nueva@correo.cl', contrasena: 'abcdef' });
    expect(resultado.ok).toBe(true);
    expect((await obtenerUsuario('nueva@correo.cl')).rol).toBe(ROL_CLIENTE);
    const sesion = await falso.cliente.auth.getSession();
    expect(sesion.data.session.user.id).toBe(falso.ID_ADMIN);
  });

  it('crearUsuario puede crear un administrador', async () => {
    const resultado = await crearUsuario({ nombre: 'Otro Admin', correo: 'otro.admin@correo.cl', contrasena: 'abcdef', rol: ROL_ADMIN });
    expect(resultado.ok).toBe(true);
    expect((await obtenerUsuario('otro.admin@correo.cl')).rol).toBe(ROL_ADMIN);
  });

  it('crearUsuario rechaza un correo que ya existe', async () => {
    const resultado = await crearUsuario({ nombre: 'Copia', correo: 'JUAN.PEREZ@unimarket.edu', contrasena: 'abcdef' });
    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toMatch(/ya existe/i);
  });

  it('actualizarUsuarioAdmin cambia nombre, universidad y rol', async () => {
    const resultado = await actualizarUsuarioAdmin('juan.perez@unimarket.edu', {
      nombre: 'Juan Pérez', nombreUsuario: '@juanperez', universidad: 'IPN', rol: ROL_ADMIN,
    });
    expect(resultado.ok).toBe(true);
    const juan = await obtenerUsuario('juan.perez@unimarket.edu');
    expect(juan.rol).toBe(ROL_ADMIN);
    expect(juan.universidad).toBe('IPN');
  });

  it('al cambiar el nombre de un usuario se renombra el vendedor de sus articulos', async () => {
    falso.db.articulos[0].vendedor_id = falso.ID_JUAN;
    await actualizarUsuarioAdmin('juan.perez@unimarket.edu', { nombre: 'Juan P. Gonzalez', rol: ROL_CLIENTE });
    expect((await cargarArticulos()).some((a) => a.vendedor === 'Juan P. Gonzalez')).toBe(true);
  });

  it('actualizarUsuarioAdmin rechaza nombre vacio y cuentas que no existen', async () => {
    expect((await actualizarUsuarioAdmin('juan.perez@unimarket.edu', { nombre: ' ', rol: ROL_CLIENTE })).ok).toBe(false);
    expect((await actualizarUsuarioAdmin('fantasma@correo.cl', { nombre: 'X', rol: ROL_CLIENTE })).ok).toBe(false);
  });

  it('no deja quitarle el rol al unico administrador', async () => {
    const resultado = await actualizarUsuarioAdmin('admin@unimarket.edu', { nombre: 'Admin', rol: ROL_CLIENTE });
    expect(resultado.ok).toBe(false);
    expect((await obtenerUsuario('admin@unimarket.edu')).rol).toBe(ROL_ADMIN);
  });

  it('eliminarUsuario borra un cliente pero no al unico administrador', async () => {
    expect((await eliminarUsuario('juan.perez@unimarket.edu')).ok).toBe(true);
    expect(await obtenerUsuario('juan.perez@unimarket.edu')).toBeNull();
    expect((await eliminarUsuario('admin@unimarket.edu')).ok).toBe(false);
    expect(await obtenerUsuario('admin@unimarket.edu')).not.toBeNull();
  });

  it('al eliminar un usuario sus articulos se conservan (quedan sin dueño)', async () => {
    falso.db.articulos[0].vendedor_id = falso.ID_JUAN;
    await eliminarUsuario('juan.perez@unimarket.edu');
    expect((await cargarArticulos()).length).toBe(4);
  });
});

describe('Admin - categorias', () => {
  beforeEach(preparar);
  it('cargarCategorias devuelve las de ejemplo', async () => {
    expect((await cargarCategorias()).length).toBe(5);
  });

  it('crearCategoria genera el identificador sin acentos ni simbolos', async () => {
    const resultado = await crearCategoria({ etiqueta: 'Deportes & Más', descripcion: 'x' });
    expect(resultado.ok).toBe(true);
    expect(resultado.categoria.valor).toBe('deportes-mas');
    expect((await cargarCategorias()).length).toBe(6);
  });

  it('rechaza nombres vacios o repetidos (sin distinguir mayusculas)', async () => {
    expect((await crearCategoria({ etiqueta: '   ' })).ok).toBe(false);
    expect((await crearCategoria({ etiqueta: 'OTROS' })).ok).toBe(false);
  });

  it('actualizarCategoria cambia el nombre pero no el identificador', async () => {
    const resultado = await actualizarCategoria('otros', { etiqueta: 'Varios', descripcion: 'Cosas varias' });
    expect(resultado.ok).toBe(true);
    expect(resultado.categoria.valor).toBe('otros');
    expect(resultado.categoria.etiqueta).toBe('Varios');
  });

  it('actualizarCategoria rechaza un nombre que ya usa otra categoria', async () => {
    expect((await actualizarCategoria('otros', { etiqueta: 'Libros & Material de Estudio' })).ok).toBe(false);
  });

  it('no se puede eliminar una categoria que tiene articulos', async () => {
    const resultado = await eliminarCategoria('snacks');
    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toMatch(/artículo/);
  });

  it('una categoria sin articulos si se elimina', async () => {
    await crearCategoria({ etiqueta: 'Vacia' });
    expect((await eliminarCategoria('vacia')).ok).toBe(true);
    expect((await cargarCategorias()).some((c) => c.valor === 'vacia')).toBe(false);
  });
});

describe('Admin - articulos (productos)', () => {
  beforeEach(preparar);
  const datosValidos = { nombre: 'Balon', categoria: 'otros', precio: '12.5', stock: '3' };

  it('crearArticulo asigna el siguiente id y completa los valores por defecto', async () => {
    const resultado = await crearArticulo(datosValidos);
    expect(resultado.ok).toBe(true);
    expect(resultado.articulo.id).toBe(5); // los 4 de ejemplo usan 1 a 4
    expect(resultado.articulo.precio).toBe(12.5);
    expect(resultado.articulo.stock).toBe(3);
    expect(resultado.articulo.vendedor).toBe('UniMarket');
    expect(resultado.articulo.sku).toMatch(/^SKU-/);
    expect((await cargarArticulos()).length).toBe(5);
  });

  it('crearArticulo queda a nombre de la cuenta con sesion', async () => {
    const resultado = await crearArticulo(datosValidos);
    expect(resultado.articulo.vendedorId).toBe(falso.ID_ADMIN);
  });

  it('crearArticulo valida nombre, precio, stock y categoria', async () => {
    expect((await crearArticulo({ ...datosValidos, nombre: ' ' })).ok).toBe(false);
    expect((await crearArticulo({ ...datosValidos, precio: '-1' })).ok).toBe(false);
    expect((await crearArticulo({ ...datosValidos, precio: '' })).ok).toBe(false);
    expect((await crearArticulo({ ...datosValidos, stock: '1.5' })).ok).toBe(false);
    expect((await crearArticulo({ ...datosValidos, categoria: '' })).ok).toBe(false);
  });

  it('actualizarArticulo cambia solo lo indicado', async () => {
    const resultado = await actualizarArticulo(1, { stock: 40 });
    expect(resultado.ok).toBe(true);
    expect(resultado.articulo.stock).toBe(40);
    expect(resultado.articulo.nombre).toBe('Brownies de Chocolate Caseros');
  });

  it('actualizarArticulo rechaza datos invalidos y ids que no existen', async () => {
    expect((await actualizarArticulo(1, { precio: -5 })).ok).toBe(false);
    expect((await actualizarArticulo(999, { stock: 1 })).ok).toBe(false);
  });

  it('eliminarArticulo borra el articulo', async () => {
    expect((await eliminarArticulo(1)).ok).toBe(true);
    expect((await cargarArticulos()).some((a) => a.id === 1)).toBe(false);
    expect((await eliminarArticulo(1)).ok).toBe(false); // ya no existe
  });

  it('obtenerArticulosCriticos devuelve los de poco stock, del mas urgente al menos', async () => {
    falso.db.articulos.forEach((a, i) => { a.stock = [5, 0, 6, 2][i]; });
    const criticos = await obtenerArticulosCriticos();
    expect(UMBRAL_STOCK_CRITICO).toBe(5);
    expect(criticos.map((a) => a.id)).toEqual([2, 4, 1]); // el de stock 6 queda fuera
    expect((await obtenerArticulosCriticos(0)).map((a) => a.id)).toEqual([2]); // umbral personalizado
  });
});

describe('Admin - ordenes y boletas', () => {
  beforeEach(preparar);
  const nueva = {
    cliente: { nombre: 'Ana', correo: 'ANA@correo.cl' },
    lineas: [
      { idArticulo: 1, nombre: 'Brownies', categoria: 'snacks', vendedor: 'M', precio: 2.5, cantidad: 2 },
      { idArticulo: 4, nombre: 'Monster', categoria: 'snacks', vendedor: 'K', precio: 3, cantidad: 1 },
    ],
    metodoPago: 'Crédito', ultimosDigitos: '4242', autorizacion: 'ABC123',
  };

  it('cargarOrdenes devuelve las de ejemplo, de la mas nueva a la mas vieja', async () => {
    const ordenes = await cargarOrdenes();
    expect(ordenes.length).toBe(6);
    expect(ordenes[0].creadaEn).toBeGreaterThan(ordenes[5].creadaEn);
  });

  it('crearOrden calcula el total, asigna el siguiente folio y guarda el correo en minusculas', async () => {
    const resultado = await crearOrden(nueva);
    expect(resultado.ok).toBe(true);
    expect(resultado.orden.folio).toBe('BOL-100007'); // las 6 de ejemplo llegan hasta BOL-100006
    expect(resultado.orden.total).toBe(8);
    expect(resultado.orden.estado).toBe('Pagada');
    expect(resultado.orden.cliente.correo).toBe('ana@correo.cl');
    expect(await obtenerOrden('BOL-100007')).not.toBeNull();
  });

  it('la orden queda asociada a la cuenta con sesion', async () => {
    const resultado = await crearOrden(nueva);
    expect(resultado.orden.userId).toBe(falso.ID_ADMIN);
  });

  it('ordenesDeUsuario filtra por correo (sin distinguir mayusculas) y ordena de nueva a vieja', async () => {
    const ordenes = await ordenesDeUsuario(' JUAN.PEREZ@unimarket.edu ');
    expect(ordenes.length).toBe(3);
    expect(ordenes[0].creadaEn).toBeGreaterThan(ordenes[1].creadaEn);
    expect((await ordenesDeUsuario('nadie@correo.cl')).length).toBe(0);
  });

  it('actualizarEstadoOrden acepta estados validos y rechaza los demas', async () => {
    expect((await actualizarEstadoOrden('BOL-100004', 'Pagada')).ok).toBe(true);
    expect((await obtenerOrden('BOL-100004')).estado).toBe('Pagada');
    expect((await actualizarEstadoOrden('BOL-100004', 'Inventado')).ok).toBe(false);
    expect((await actualizarEstadoOrden('BOL-999999', 'Pagada')).ok).toBe(false);
  });

  it('obtenerOrden devuelve null si el folio no existe', async () => {
    expect(await obtenerOrden('NO-EXISTE')).toBeNull();
  });
});
