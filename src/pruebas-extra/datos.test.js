// Pruebas de la capa de datos: carrito, registro/login (Supabase Auth) y perfil.
// Se usa un Supabase FALSO en memoria (src/tests/supabaseFalso.js): sin red y
// sin tocar la base real. Este archivo usa solo sintaxis comun a Vitest y
// Jasmine; existe una copia identica como datos.spec.js (la que corre Karma).
import {
  ROL_CLIENTE,
  actualizarUsuario,
  cargarArticulos,
  cargarCarrito,
  cerrarSesion,
  guardarCarrito,
  iniciarSesion,
  obtenerArticulo,
  obtenerSesion,
  obtenerUsuario,
  registrarUsuario,
  validarDatosUsuario,
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
};

describe('carrito (localStorage)', () => {
  beforeEach(preparar);
  it('sin nada guardado devuelve una lista vacia', () => {
    expect(cargarCarrito()).toEqual([]);
  });

  it('guarda y recupera los ids agregados', () => {
    guardarCarrito([1, 1, 3]);
    expect(cargarCarrito()).toEqual([1, 1, 3]);
  });

  it('si el JSON guardado esta corrupto, devuelve una lista vacia', () => {
    localStorage.setItem('unimarket_carrito', '{esto no es JSON valido');
    expect(cargarCarrito()).toEqual([]);
  });
});

describe('validarDatosUsuario', () => {
  beforeEach(preparar);
  const valido = { nombre: 'Ana', correo: 'ana@correo.cl', contrasena: 'abcdef' };

  it('acepta datos correctos', () => {
    expect(validarDatosUsuario(valido, true)).toBeNull();
  });

  it('rechaza nombre vacio, correo invalido y contraseña corta', () => {
    expect(validarDatosUsuario({ ...valido, nombre: '  ' }, true)).not.toBeNull();
    expect(validarDatosUsuario({ ...valido, correo: 'correo-malo' }, true)).not.toBeNull();
    expect(validarDatosUsuario({ ...valido, contrasena: '123' }, true)).not.toBeNull();
  });

  it('al editar, la contraseña vacia es valida (no se cambia)', () => {
    expect(validarDatosUsuario({ ...valido, contrasena: '' }, false)).toBeNull();
  });
});

describe('registrarUsuario', () => {
  beforeEach(preparar);
  const datosNuevos = { nombre: 'Jordy Solis', nombreUsuario: '@jordy', correo: 'jordy@duocuc.cl', universidad: 'DUOC UC', contrasena: 'clave123' };

  it('registra un usuario nuevo y queda con sesion como cliente', async () => {
    const resultado = await registrarUsuario(datosNuevos);
    expect(resultado.ok).toBe(true);
    expect(resultado.usuario.rol).toBe(ROL_CLIENTE);
    expect(resultado.usuario.nombre).toBe('Jordy Solis');
    expect((await obtenerSesion()).correo).toBe('jordy@duocuc.cl');
  });

  it('nadie puede registrarse como administrador', async () => {
    const resultado = await registrarUsuario({ ...datosNuevos, rol: 'admin' });
    expect(resultado.usuario.rol).toBe(ROL_CLIENTE);
  });

  it('rechaza un correo ya registrado, sin distinguir mayusculas ni espacios', async () => {
    const resultado = await registrarUsuario({ ...datosNuevos, correo: '  JUAN.PEREZ@unimarket.edu ' });
    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toMatch(/ya existe/i);
  });

  it('valida los datos antes de llamar a la base', async () => {
    const resultado = await registrarUsuario({ ...datosNuevos, contrasena: '123' });
    expect(resultado.ok).toBe(false);
  });
});

describe('iniciarSesion / cerrarSesion', () => {
  beforeEach(preparar);
  it('con la cuenta de prueba devuelve el usuario', async () => {
    const resultado = await iniciarSesion('juan.perez@unimarket.edu', '123456');
    expect(resultado.ok).toBe(true);
    expect(resultado.usuario.nombre).toBe('Juan Pérez');
  });

  it('con la contraseña incorrecta devuelve un error', async () => {
    const resultado = await iniciarSesion('juan.perez@unimarket.edu', 'incorrecta');
    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toMatch(/incorrectos/i);
  });

  it('con un correo que no existe devuelve un error', async () => {
    expect((await iniciarSesion('no-existe@unimarket.edu', '123456')).ok).toBe(false);
  });

  it('el correo no distingue mayusculas ni espacios', async () => {
    expect((await iniciarSesion('  JUAN.PEREZ@unimarket.edu  ', '123456')).ok).toBe(true);
  });

  it('el administrador entra con rol admin', async () => {
    const resultado = await iniciarSesion('admin@unimarket.edu', 'admin123');
    expect(resultado.usuario.rol).toBe('admin');
  });

  it('cerrarSesion deja la app sin usuario', async () => {
    await iniciarSesion('juan.perez@unimarket.edu', '123456');
    await cerrarSesion();
    expect(await obtenerSesion()).toBeNull();
  });

  it('sin iniciar sesion, obtenerSesion devuelve null', async () => {
    expect(await obtenerSesion()).toBeNull();
  });
});

describe('actualizarUsuario (perfil propio)', () => {
  beforeEach(preparar);
  it('actualiza nombre, usuario y universidad', async () => {
    const resultado = await actualizarUsuario(falso.ID_JUAN, { nombre: 'Juan P. Actualizado', nombreUsuario: '@jp', universidad: 'IPN' });
    expect(resultado.ok).toBe(true);
    expect(resultado.usuario.nombre).toBe('Juan P. Actualizado');
    expect((await obtenerUsuario('juan.perez@unimarket.edu')).universidad).toBe('IPN');
  });

  it('no permite dejar el nombre vacio', async () => {
    const resultado = await actualizarUsuario(falso.ID_JUAN, { nombre: '   ' });
    expect(resultado.ok).toBe(false);
  });

  it('al cambiar el nombre, sus articulos publicados cambian de vendedor', async () => {
    falso.db.articulos[0].vendedor_id = falso.ID_JUAN;
    await actualizarUsuario(falso.ID_JUAN, { nombre: 'Juan Nuevo Nombre' });
    expect((await obtenerArticulo(falso.db.articulos[0].id)).vendedor).toBe('Juan Nuevo Nombre');
  });
});

describe('lectura de articulos', () => {
  beforeEach(preparar);
  it('cargarArticulos devuelve los de ejemplo, del mas nuevo al mas viejo, en formato camelCase', async () => {
    const articulos = await cargarArticulos();
    expect(articulos.length).toBe(4);
    expect(articulos[0].nombre).toBe('Bebida Energética Monster Original 473ml');
    expect(articulos[0].universidadesVenta).toEqual([]);
    expect(typeof articulos[0].precio).toBe('number');
  });

  it('obtenerArticulo devuelve null si no existe', async () => {
    expect(await obtenerArticulo(9999)).toBeNull();
  });
});
