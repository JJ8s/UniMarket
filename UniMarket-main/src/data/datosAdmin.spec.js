// Pruebas de la capa de datos del panel de administracion (roles, CRUD de
// usuarios, categorias, articulos y ordenes).
// Este archivo usa solo sintaxis comun a Vitest y Jasmine, por eso existe una
// copia identica como datosAdmin.test.js (la que corre Vitest).
import {
  CATEGORIAS_POR_DEFECTO,
  ORDENES_POR_DEFECTO,
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
  esAdmin,
  guardarArticulos,
  guardarOrdenes,
  obtenerArticulosCriticos,
  obtenerOrden,
  obtenerUsuario,
  ordenesDeUsuario,
  registrarUsuario,
  validarCredenciales,
} from './datos';

describe('Admin - roles y usuarios', () => {
  beforeEach(() => localStorage.clear());

  it('existe un administrador por defecto que puede iniciar sesion', () => {
    const admin = validarCredenciales('admin@unimarket.edu', 'admin123');
    expect(admin).not.toBeNull();
    expect(admin.rol).toBe(ROL_ADMIN);
  });

  it('esAdmin distingue admin, cliente y correos que no existen', () => {
    expect(esAdmin('admin@unimarket.edu')).toBe(true);
    expect(esAdmin('  ADMIN@unimarket.edu ')).toBe(true); // sin importar mayusculas ni espacios
    expect(esAdmin('juan.perez@unimarket.edu')).toBe(false);
    expect(esAdmin('nadie@unimarket.edu')).toBe(false);
    expect(esAdmin(undefined)).toBe(false);
  });

  it('un usuario registrado sin indicar rol queda como cliente', () => {
    const resultado = registrarUsuario({ nombre: 'Nuevo', correo: 'nuevo@correo.cl', contrasena: 'abcdef' });
    expect(resultado.usuario.rol).toBe(ROL_CLIENTE);
  });

  it('si la lista guardada no tiene admin (datos antiguos), se agrega el admin por defecto', () => {
    localStorage.setItem('unimarket_usuarios', JSON.stringify([
      { nombre: 'Antiguo', nombreUsuario: '@a', correo: 'antiguo@correo.cl', universidad: '', contrasena: '123456' },
    ]));
    const usuarios = cargarUsuarios();
    expect(usuarios.length).toBe(2);
    expect(usuarios.some((u) => u.rol === ROL_ADMIN)).toBe(true);
  });

  it('crearUsuario rechaza contraseñas cortas y correos invalidos', () => {
    expect(crearUsuario({ nombre: 'A', correo: 'a@correo.cl', contrasena: '123' }).ok).toBe(false);
    expect(crearUsuario({ nombre: 'A', correo: 'correo-malo', contrasena: '123456' }).ok).toBe(false);
    expect(crearUsuario({ nombre: '  ', correo: 'a@correo.cl', contrasena: '123456' }).ok).toBe(false);
  });

  it('crearUsuario puede crear un administrador', () => {
    const resultado = crearUsuario({ nombre: 'Otro Admin', correo: 'otro.admin@correo.cl', contrasena: 'abcdef', rol: ROL_ADMIN });
    expect(resultado.ok).toBe(true);
    expect(esAdmin('otro.admin@correo.cl')).toBe(true);
  });

  it('actualizarUsuarioAdmin cambia el rol y conserva la contraseña si no se escribe otra', () => {
    const resultado = actualizarUsuarioAdmin('juan.perez@unimarket.edu', {
      nombre: 'Juan Pérez', nombreUsuario: '@juanperez', correo: 'juan.perez@unimarket.edu',
      universidad: 'UNAM', rol: ROL_ADMIN, contrasena: '',
    });
    expect(resultado.ok).toBe(true);
    expect(esAdmin('juan.perez@unimarket.edu')).toBe(true);
    expect(validarCredenciales('juan.perez@unimarket.edu', '123456')).not.toBeNull(); // misma clave
  });

  it('actualizarUsuarioAdmin cambia la contraseña cuando se indica una nueva', () => {
    actualizarUsuarioAdmin('juan.perez@unimarket.edu', {
      nombre: 'Juan Pérez', correo: 'juan.perez@unimarket.edu', rol: ROL_CLIENTE, contrasena: 'nueva-clave',
    });
    expect(validarCredenciales('juan.perez@unimarket.edu', '123456')).toBeNull();
    expect(validarCredenciales('juan.perez@unimarket.edu', 'nueva-clave')).not.toBeNull();
  });

  it('al cambiar el nombre de un usuario se renombra el vendedor de sus articulos', () => {
    guardarArticulos([{ id: 1, nombre: 'Algo', vendedor: 'Juan Pérez', stock: 1, precio: 1, categoria: 'otros', creadoEn: 1 }]);
    actualizarUsuarioAdmin('juan.perez@unimarket.edu', {
      nombre: 'Juan P. Gonzalez', correo: 'juan.perez@unimarket.edu', rol: ROL_CLIENTE,
    });
    expect(cargarArticulos()[0].vendedor).toBe('Juan P. Gonzalez');
  });

  it('al cambiar el correo de un usuario, su historial de compras lo sigue', () => {
    const antes = ordenesDeUsuario('juan.perez@unimarket.edu').length;
    actualizarUsuarioAdmin('juan.perez@unimarket.edu', {
      nombre: 'Juan Pérez', correo: 'juan.nuevo@unimarket.edu', rol: ROL_CLIENTE,
    });
    expect(ordenesDeUsuario('juan.perez@unimarket.edu').length).toBe(0);
    expect(ordenesDeUsuario('juan.nuevo@unimarket.edu').length).toBe(antes);
  });

  it('no deja quitarle el rol al unico administrador', () => {
    const resultado = actualizarUsuarioAdmin('admin@unimarket.edu', {
      nombre: 'Admin', correo: 'admin@unimarket.edu', rol: ROL_CLIENTE,
    });
    expect(resultado.ok).toBe(false);
    expect(esAdmin('admin@unimarket.edu')).toBe(true);
  });

  it('no deja usar el correo de otra cuenta', () => {
    const resultado = actualizarUsuarioAdmin('juan.perez@unimarket.edu', {
      nombre: 'Juan', correo: 'admin@unimarket.edu', rol: ROL_CLIENTE,
    });
    expect(resultado.ok).toBe(false);
  });

  it('eliminarUsuario borra un cliente pero no al unico administrador', () => {
    expect(eliminarUsuario('juan.perez@unimarket.edu').ok).toBe(true);
    expect(obtenerUsuario('juan.perez@unimarket.edu')).toBeNull();
    expect(eliminarUsuario('admin@unimarket.edu').ok).toBe(false);
    expect(obtenerUsuario('admin@unimarket.edu')).not.toBeNull();
  });
});

describe('Admin - categorias', () => {
  beforeEach(() => localStorage.clear());

  it('sin nada guardado devuelve las categorias por defecto', () => {
    expect(cargarCategorias().length).toBe(CATEGORIAS_POR_DEFECTO.length);
  });

  it('crearCategoria genera el identificador sin acentos ni simbolos', () => {
    const resultado = crearCategoria({ etiqueta: 'Deportes & Más', descripcion: 'x' });
    expect(resultado.ok).toBe(true);
    expect(resultado.categoria.valor).toBe('deportes-mas');
    expect(cargarCategorias().length).toBe(CATEGORIAS_POR_DEFECTO.length + 1);
  });

  it('rechaza nombres vacios o repetidos (sin distinguir mayusculas)', () => {
    expect(crearCategoria({ etiqueta: '   ' }).ok).toBe(false);
    expect(crearCategoria({ etiqueta: 'OTROS' }).ok).toBe(false);
  });

  it('actualizarCategoria cambia el nombre pero no el identificador', () => {
    const resultado = actualizarCategoria('otros', { etiqueta: 'Varios', descripcion: 'Cosas varias' });
    expect(resultado.ok).toBe(true);
    expect(resultado.categoria.valor).toBe('otros');
    expect(resultado.categoria.etiqueta).toBe('Varios');
  });

  it('no se puede eliminar una categoria que tiene articulos', () => {
    const resultado = eliminarCategoria('snacks'); // los articulos de ejemplo usan snacks
    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toMatch(/artículo/);
  });

  it('una categoria sin articulos si se elimina', () => {
    crearCategoria({ etiqueta: 'Vacia' });
    expect(eliminarCategoria('vacia').ok).toBe(true);
    expect(cargarCategorias().some((c) => c.valor === 'vacia')).toBe(false);
  });
});

describe('Admin - articulos (productos)', () => {
  beforeEach(() => localStorage.clear());

  const datosValidos = { nombre: 'Balon', categoria: 'otros', precio: '12.5', stock: '3' };

  it('crearArticulo asigna el siguiente id y completa los valores por defecto', () => {
    const resultado = crearArticulo(datosValidos);
    expect(resultado.ok).toBe(true);
    expect(resultado.articulo.id).toBe(5); // los 4 de ejemplo ya usan 1 a 4
    expect(resultado.articulo.precio).toBe(12.5);
    expect(resultado.articulo.stock).toBe(3);
    expect(resultado.articulo.vendedor).toBe('UniMarket');
    expect(resultado.articulo.sku).toMatch(/^SKU-/);
    expect(cargarArticulos().length).toBe(5);
  });

  it('crearArticulo valida nombre, precio, stock y categoria', () => {
    expect(crearArticulo({ ...datosValidos, nombre: ' ' }).ok).toBe(false);
    expect(crearArticulo({ ...datosValidos, precio: '-1' }).ok).toBe(false);
    expect(crearArticulo({ ...datosValidos, precio: '' }).ok).toBe(false);
    expect(crearArticulo({ ...datosValidos, stock: '1.5' }).ok).toBe(false);
    expect(crearArticulo({ ...datosValidos, categoria: '' }).ok).toBe(false);
  });

  it('actualizarArticulo cambia solo lo indicado', () => {
    const resultado = actualizarArticulo(1, { stock: 40 });
    expect(resultado.ok).toBe(true);
    expect(resultado.articulo.stock).toBe(40);
    expect(resultado.articulo.nombre).toBe('Brownies de Chocolate Caseros');
  });

  it('actualizarArticulo rechaza datos invalidos y ids que no existen', () => {
    expect(actualizarArticulo(1, { precio: -5 }).ok).toBe(false);
    expect(actualizarArticulo(999, { stock: 1 }).ok).toBe(false);
  });

  it('eliminarArticulo borra el articulo', () => {
    expect(eliminarArticulo(1).ok).toBe(true);
    expect(cargarArticulos().some((a) => a.id === 1)).toBe(false);
    expect(eliminarArticulo(1).ok).toBe(false); // ya no existe
  });

  it('obtenerArticulosCriticos devuelve los de poco stock, del mas urgente al menos', () => {
    guardarArticulos([
      { id: 1, nombre: 'A', stock: 5, precio: 1, categoria: 'otros', creadoEn: 1 },
      { id: 2, nombre: 'B', stock: 0, precio: 1, categoria: 'otros', creadoEn: 1 },
      { id: 3, nombre: 'C', stock: 6, precio: 1, categoria: 'otros', creadoEn: 1 },
      { id: 4, nombre: 'D', stock: 2, precio: 1, categoria: 'otros', creadoEn: 1 },
    ]);
    const criticos = obtenerArticulosCriticos();
    expect(UMBRAL_STOCK_CRITICO).toBe(5);
    expect(criticos.map((a) => a.id)).toEqual([2, 4, 1]); // C (6) queda fuera
    expect(obtenerArticulosCriticos(0).map((a) => a.id)).toEqual([2]); // umbral personalizado
  });
});

describe('Admin - ordenes y boletas', () => {
  beforeEach(() => localStorage.clear());

  it('sin nada guardado devuelve las ordenes de ejemplo', () => {
    expect(cargarOrdenes().length).toBe(ORDENES_POR_DEFECTO.length);
  });

  it('el total de cada orden de ejemplo coincide con la suma de sus lineas', () => {
    cargarOrdenes().forEach((orden) => {
      const suma = orden.lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
      expect(orden.total).toBeCloseTo(suma, 5);
    });
  });

  it('crearOrden calcula el total y asigna el siguiente folio', () => {
    const orden = crearOrden({
      cliente: { nombre: 'Ana', correo: 'ana@correo.cl' },
      lineas: [
        { idArticulo: 1, nombre: 'Brownies', categoria: 'snacks', vendedor: 'M', precio: 2.5, cantidad: 2 },
        { idArticulo: 4, nombre: 'Monster', categoria: 'snacks', vendedor: 'K', precio: 3, cantidad: 1 },
      ],
      metodoPago: 'Crédito', ultimosDigitos: '4242', autorizacion: 'ABC123',
    });
    expect(orden.folio).toBe('BOL-100007'); // las 6 de ejemplo llegan hasta BOL-100006
    expect(orden.total).toBe(8);
    expect(orden.estado).toBe('Pagada');
    expect(obtenerOrden('BOL-100007')).not.toBeNull();
  });

  it('el siguiente folio sigue al mayor aunque se hayan borrado ordenes', () => {
    guardarOrdenes([{ folio: 'BOL-100050', cliente: { nombre: 'x', correo: 'x@x.cl' }, lineas: [], total: 0, creadaEn: 1, estado: 'Pagada' }]);
    const orden = crearOrden({ cliente: { nombre: 'y', correo: 'y@y.cl' }, lineas: [], metodoPago: 'Débito', ultimosDigitos: '1111', autorizacion: 'Z' });
    expect(orden.folio).toBe('BOL-100051');
  });

  it('ordenesDeUsuario filtra por correo (sin distinguir mayusculas) y ordena de nueva a vieja', () => {
    const ordenes = ordenesDeUsuario(' JUAN.PEREZ@unimarket.edu ');
    expect(ordenes.length).toBe(3);
    expect(ordenes[0].creadaEn).toBeGreaterThan(ordenes[1].creadaEn);
    expect(ordenesDeUsuario('nadie@correo.cl').length).toBe(0);
  });

  it('actualizarEstadoOrden acepta estados validos y rechaza los demas', () => {
    expect(actualizarEstadoOrden('BOL-100004', 'Pagada').ok).toBe(true);
    expect(obtenerOrden('BOL-100004').estado).toBe('Pagada');
    expect(actualizarEstadoOrden('BOL-100004', 'Inventado').ok).toBe(false);
    expect(actualizarEstadoOrden('BOL-999999', 'Pagada').ok).toBe(false);
  });

  it('obtenerOrden devuelve null si el folio no existe', () => {
    expect(obtenerOrden('NO-EXISTE')).toBeNull();
  });
});
