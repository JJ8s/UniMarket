import { beforeEach, describe, expect, it } from 'vitest';
import {
  ARTICULOS_POR_DEFECTO,
  actualizarUsuario,
  cargarArticulos,
  cargarUsuarios,
  guardarArticulos,
  obtenerSiguienteId,
  registrarUsuario,
  validarCredenciales,
} from './datos';

// jsdom nos da un localStorage real (en memoria) para estas pruebas, pero
// no se limpia solo entre tests: si no lo vaciamos, lo que un test guarda
// "se filtra" al siguiente y los resultados dejan de ser confiables.
beforeEach(() => {
  localStorage.clear();
});

// ------------------------------------------------------------
// cargarArticulos / guardarArticulos
// ------------------------------------------------------------
describe('cargarArticulos', () => {
  it('sin nada guardado, devuelve los articulos semilla', () => {
    const articulos = cargarArticulos();
    expect(articulos).toHaveLength(ARTICULOS_POR_DEFECTO.length);
    expect(articulos[0].nombre).toBe(ARTICULOS_POR_DEFECTO[0].nombre);
  });

  it('con datos guardados, devuelve exactamente lo guardado', () => {
    const propios = [{ id: 99, nombre: 'Mi articulo de prueba' }];
    guardarArticulos(propios);
    expect(cargarArticulos()).toEqual(propios);
  });

  it('si el JSON guardado esta corrupto, cae de vuelta a los articulos semilla', () => {
    localStorage.setItem('unimarket_articulos', '{esto no es JSON valido');
    const articulos = cargarArticulos();
    expect(articulos).toHaveLength(ARTICULOS_POR_DEFECTO.length);
  });
});

// ------------------------------------------------------------
// obtenerSiguienteId
// ------------------------------------------------------------
describe('obtenerSiguienteId', () => {
  it('devuelve 1 si la lista esta vacia', () => {
    expect(obtenerSiguienteId([])).toBe(1);
  });

  it('devuelve el id maximo + 1, sin importar el orden de la lista', () => {
    const articulos = [{ id: 5 }, { id: 2 }, { id: 9 }, { id: 3 }];
    expect(obtenerSiguienteId(articulos)).toBe(10);
  });
});

// ------------------------------------------------------------
// registrarUsuario / validarCredenciales
// ------------------------------------------------------------
describe('registrarUsuario', () => {
  it('registra un usuario nuevo correctamente', () => {
    const resultado = registrarUsuario({
      nombre: 'Jordy Solis',
      nombreUsuario: '@jordy',
      correo: 'jordy@duocuc.cl',
      universidad: 'DUOC UC',
      contrasena: 'clave123',
    });

    expect(resultado.ok).toBe(true);
    expect(cargarUsuarios()).toHaveLength(3); // cliente de prueba + admin + el nuevo
  });

  it('rechaza un correo ya registrado', () => {
    registrarUsuario({ nombre: 'Uno', correo: 'repetido@unimarket.edu', contrasena: 'a' });
    const resultado = registrarUsuario({ nombre: 'Dos', correo: 'repetido@unimarket.edu', contrasena: 'b' });

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toMatch(/ya existe/i);
  });

  it('el correo repetido no distingue mayusculas/minusculas ni espacios', () => {
    registrarUsuario({ nombre: 'Uno', correo: 'Jordy@UniMarket.edu', contrasena: 'a' });
    const resultado = registrarUsuario({ nombre: 'Dos', correo: '  jordy@unimarket.edu  ', contrasena: 'b' });

    expect(resultado.ok).toBe(false);
  });
});

describe('validarCredenciales', () => {
  it('con la cuenta de prueba por defecto, devuelve el usuario', () => {
    const usuario = validarCredenciales('juan.perez@unimarket.edu', '123456');
    expect(usuario).not.toBeNull();
    expect(usuario.nombre).toBe('Juan Pérez');
  });

  it('con la contraseña incorrecta, devuelve null', () => {
    expect(validarCredenciales('juan.perez@unimarket.edu', 'clave-incorrecta')).toBeNull();
  });

  it('con un correo que no existe, devuelve null', () => {
    expect(validarCredenciales('no-existe@unimarket.edu', '123456')).toBeNull();
  });

  it('el correo no distingue mayusculas ni espacios al hacer login', () => {
    const usuario = validarCredenciales('  JUAN.PEREZ@unimarket.edu  ', '123456');
    expect(usuario).not.toBeNull();
  });
});

// ------------------------------------------------------------
// actualizarUsuario
// ------------------------------------------------------------
describe('actualizarUsuario', () => {
  it('actualiza los datos de una cuenta existente', () => {
    const resultado = actualizarUsuario('juan.perez@unimarket.edu', {
      nombre: 'Juan Pérez Actualizado',
      correo: 'juan.perez@unimarket.edu',
      universidad: 'UNAM',
    });

    expect(resultado.ok).toBe(true);
    expect(resultado.usuario.nombre).toBe('Juan Pérez Actualizado');
  });

  it('no permite cambiar el correo a uno que ya usa otra cuenta', () => {
    registrarUsuario({ nombre: 'Otro', correo: 'otro@unimarket.edu', contrasena: '123456' });

    const resultado = actualizarUsuario('juan.perez@unimarket.edu', {
      nombre: 'Juan Pérez',
      correo: 'otro@unimarket.edu',
      universidad: 'UNAM',
    });

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toMatch(/ya existe otra cuenta/i);
  });

  it('devuelve error si la cuenta original no existe', () => {
    const resultado = actualizarUsuario('fantasma@unimarket.edu', {
      nombre: 'X',
      correo: 'x@unimarket.edu',
    });
    expect(resultado.ok).toBe(false);
  });
});
