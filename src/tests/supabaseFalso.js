// ============================================================
// Supabase FALSO en memoria, solo para las pruebas (Vitest y Karma).
// Imita lo justo de la API real (from/select/insert/update/delete/eq/lte/
// order/single/maybeSingle/rpc y auth) y de las reglas de la base:
//   - el trigger que crea el perfil al registrarse (rol cliente)
//   - ids autoincrementales, valores por defecto, folio BOL-######
//   - claves unicas (categorias) y restriccion al borrar categorias en uso
//   - no se puede quitar/eliminar al ultimo admin
// NO imita las politicas RLS: esas se probaron contra un PostgreSQL real
// (ver supabase/esquema.sql). Asi las pruebas unitarias no necesitan red.
// ============================================================

const ID_ADMIN = 'u-admin';
const ID_JUAN = 'u-juan';

const DIA = 24 * 60 * 60 * 1000;
const hace = (dias) => Date.now() - dias * DIA;

/** Ordenes de ejemplo en formato de la app (4 Pagada, 1 Pendiente, 1 Anulada). */
export const ORDENES_EJEMPLO = [
  { folio: 'BOL-100001', creadaEn: hace(34), estado: 'Pagada', cliente: { nombre: 'Juan Pérez', correo: 'juan.perez@unimarket.edu' }, metodoPago: 'Crédito', ultimosDigitos: '4242', autorizacion: 'EJ0001',
    lineas: [{ idArticulo: 3, nombre: 'Chaqueta Denim Vintage', categoria: 'ropa', vendedor: 'Ana V.', precio: 20, cantidad: 1 }], total: 20 },
  { folio: 'BOL-100002', creadaEn: hace(21), estado: 'Pagada', cliente: { nombre: 'Camila Rojas', correo: 'camila.rojas@correo.cl' }, metodoPago: 'Débito', ultimosDigitos: '1111', autorizacion: 'EJ0002',
    lineas: [{ idArticulo: 1, nombre: 'Brownies de Chocolate Caseros', categoria: 'snacks', vendedor: 'María G.', precio: 2.5, cantidad: 4 },
             { idArticulo: 4, nombre: 'Bebida Energética Monster Original 473ml', categoria: 'snacks', vendedor: 'Kiosco Central', precio: 3, cantidad: 2 }], total: 16 },
  { folio: 'BOL-100003', creadaEn: hace(12), estado: 'Pagada', cliente: { nombre: 'Juan Pérez', correo: 'juan.perez@unimarket.edu' }, metodoPago: 'Crédito', ultimosDigitos: '4242', autorizacion: 'EJ0003',
    lineas: [{ idArticulo: 2, nombre: 'Calculadora Científica Casio fx-991LA X', categoria: 'tecnologia', vendedor: 'Carlos R.', precio: 15, cantidad: 1 },
             { idArticulo: 1, nombre: 'Brownies de Chocolate Caseros', categoria: 'snacks', vendedor: 'María G.', precio: 2.5, cantidad: 2 }], total: 20 },
  { folio: 'BOL-100004', creadaEn: hace(6), estado: 'Pendiente', cliente: { nombre: 'Pedro Soto', correo: 'pedro.soto@correo.cl' }, metodoPago: 'Débito', ultimosDigitos: '2222', autorizacion: 'EJ0004',
    lineas: [{ idArticulo: 4, nombre: 'Bebida Energética Monster Original 473ml', categoria: 'snacks', vendedor: 'Kiosco Central', precio: 3, cantidad: 6 }], total: 18 },
  { folio: 'BOL-100005', creadaEn: hace(2), estado: 'Pagada', cliente: { nombre: 'Juan Pérez', correo: 'juan.perez@unimarket.edu' }, metodoPago: 'Crédito', ultimosDigitos: '4242', autorizacion: 'EJ0005',
    lineas: [{ idArticulo: 3, nombre: 'Chaqueta Denim Vintage', categoria: 'ropa', vendedor: 'Ana V.', precio: 20, cantidad: 1 },
             { idArticulo: 4, nombre: 'Bebida Energética Monster Original 473ml', categoria: 'snacks', vendedor: 'Kiosco Central', precio: 3, cantidad: 1 }], total: 23 },
  { folio: 'BOL-100006', creadaEn: hace(1), estado: 'Anulada', cliente: { nombre: 'Camila Rojas', correo: 'camila.rojas@correo.cl' }, metodoPago: 'Débito', ultimosDigitos: '1111', autorizacion: 'EJ0006',
    lineas: [{ idArticulo: 2, nombre: 'Calculadora Científica Casio fx-991LA X', categoria: 'tecnologia', vendedor: 'Carlos R.', precio: 15, cantidad: 1 }], total: 15 },
];

const CATEGORIAS = [
  { valor: 'snacks', etiqueta: 'Snacks & Comida', descripcion: 'Comida casera, dulces y bebidas.' },
  { valor: 'ropa', etiqueta: 'Ropa & Accesorios', descripcion: 'Ropa de segunda mano y accesorios.' },
  { valor: 'tecnologia', etiqueta: 'Tecnología & Electrónica', descripcion: 'Calculadoras, audífonos, cables y más.' },
  { valor: 'libros', etiqueta: 'Libros & Material de Estudio', descripcion: 'Textos, apuntes y útiles.' },
  { valor: 'otros', etiqueta: 'Otros', descripcion: 'Todo lo que no entra en otra categoría.' },
];

const ARTICULOS = [
  ['Brownies de Chocolate Caseros', 2.5, 'snacks', 'María G.', 10],
  ['Calculadora Científica Casio fx-991LA X', 15, 'tecnologia', 'Carlos R.', 1],
  ['Chaqueta Denim Vintage', 20, 'ropa', 'Ana V.', 1],
  ['Bebida Energética Monster Original 473ml', 3, 'snacks', 'Kiosco Central', 25],
];

/**
 * Crea un cliente falso con datos de ejemplo.
 * Cuentas: admin@unimarket.edu / admin123 (admin) y juan.perez@unimarket.edu / 123456 (cliente).
 * Empieza SIN sesion; usa `iniciarComo(correo)` para simular una cuenta con sesion.
 */
export function crearSupabaseFalso() {
  let reloj = Date.now();
  const marca = () => new Date((reloj += 1000)).toISOString(); // siempre creciente
  let sigueId = 1;
  let sigueFolio = 100001;

  const db = {
    perfiles: [
      { id: ID_ADMIN, nombre: 'Administrador UniMarket', nombre_usuario: '@admin', correo: 'admin@unimarket.edu', universidad: 'DUOC UC', rol: 'admin', foto: null, creado_en: marca() },
      { id: ID_JUAN, nombre: 'Juan Pérez', nombre_usuario: '@juanperez', correo: 'juan.perez@unimarket.edu', universidad: 'UNAM', rol: 'cliente', foto: null, creado_en: marca() },
    ],
    categorias: CATEGORIAS.map((c) => ({ ...c })),
    articulos: [],
    ordenes: [],
  };
  const cuentas = [
    { id: ID_ADMIN, email: 'admin@unimarket.edu', password: 'admin123' },
    { id: ID_JUAN, email: 'juan.perez@unimarket.edu', password: '123456' },
  ];
  let sesion = null; // { user: { id } }
  const oyentes = [];

  const completarArticulo = (f) => ({
    id: sigueId++, descripcion: '', calificacion: 0, universidad: '', vendedor: 'UniMarket', vendedor_id: null,
    distancia: 0, condicion: 'Nuevo (Sellado)', stock: 0, stock_guardado: null, sku: '', entrega: 'A convenir',
    universidades_venta: [], fotos: [], creado_en: marca(), ...f,
  });
  ARTICULOS.forEach(([nombre, precio, categoria, vendedor, stock]) =>
    db.articulos.push(completarArticulo({ nombre, precio, categoria, vendedor, stock })));

  ORDENES_EJEMPLO.forEach((o) => {
    db.ordenes.push({
      folio: o.folio, user_id: null, cliente_nombre: o.cliente.nombre, cliente_correo: o.cliente.correo, estado: o.estado,
      metodo_pago: o.metodoPago, ultimos_digitos: o.ultimosDigitos, autorizacion: o.autorizacion,
      lineas: o.lineas, total: o.total, creada_en: new Date(o.creadaEn).toISOString(),
    });
    sigueFolio += 1;
  });

  const cantidadAdmins = () => db.perfiles.filter((p) => p.rol === 'admin').length;
  const error = (message, code) => ({ message, code });

  // ---- constructor de consultas (imita el de supabase-js) ----
  class Consulta {
    constructor(tabla) { this.tabla = tabla; this.op = null; this.filtros = []; this.orden = null; this.devuelve = false; this.modo = 'lista'; this.opts = {}; }
    select(_columnas, opts = {}) { if (this.op) this.devuelve = true; else { this.op = 'select'; this.opts = opts; } return this; }
    insert(fila) { this.op = 'insert'; this.payload = fila; return this; }
    update(fila) { this.op = 'update'; this.payload = fila; return this; }
    delete() { this.op = 'delete'; return this; }
    eq(col, val) { this.filtros.push((f) => f[col] === val); return this; }
    lte(col, val) { this.filtros.push((f) => f[col] <= val); return this; }
    order(col, { ascending = true } = {}) { this.orden = { col, ascending }; return this; }
    single() { this.modo = 'unica'; return this; }
    maybeSingle() { this.modo = 'quizas'; return this; }
    then(resolver, rechazar) { return Promise.resolve().then(() => this.ejecutar()).then(resolver, rechazar); }

    ejecutar() {
      const filas = db[this.tabla];
      const coinciden = () => filas.filter((f) => this.filtros.every((fn) => fn(f)));
      let afectadas = [];

      if (this.op === 'insert') {
        const r = this.insertar(this.payload);
        if (r.error) return { data: null, error: r.error };
        afectadas = [r.fila];
      } else if (this.op === 'update') {
        afectadas = coinciden();
        for (const f of afectadas) {
          if (this.tabla === 'perfiles' && this.payload.rol && f.rol === 'admin' && this.payload.rol !== 'admin' && cantidadAdmins() <= 1) {
            return { data: null, error: error('No puedes quitar el rol al unico administrador.', 'P0001') };
          }
          Object.assign(f, this.payload);
        }
      } else if (this.op === 'delete') {
        afectadas = coinciden();
        if (this.tabla === 'categorias' && afectadas.some((c) => db.articulos.some((a) => a.categoria === c.valor))) {
          return { data: null, error: error('violates foreign key constraint', '23503') };
        }
        db[this.tabla] = filas.filter((f) => !afectadas.includes(f));
        return { data: null, error: null };
      } else {
        afectadas = coinciden();
      }

      const esLectura = this.op === 'select';
      if (!esLectura && !this.devuelve) return { data: null, error: null };

      let salida = afectadas.map((f) => structuredClone(f));
      if (this.orden) {
        const { col, ascending } = this.orden;
        salida.sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (ascending ? 1 : -1));
      }
      if (this.opts.head) return { data: null, error: null, count: salida.length };
      if (this.modo === 'unica') {
        return salida.length === 1 ? { data: salida[0], error: null } : { data: null, error: error('Se esperaba una fila', 'PGRST116') };
      }
      if (this.modo === 'quizas') return { data: salida[0] ?? null, error: null };
      return { data: salida, error: null, count: salida.length };
    }

    insertar(fila) {
      const fila0 = structuredClone(fila);
      if (this.tabla === 'categorias') {
        if (db.categorias.some((c) => c.valor === fila0.valor || c.etiqueta === fila0.etiqueta)) return { error: error('duplicate key', '23505') };
        const nueva = { descripcion: '', ...fila0 };
        db.categorias.push(nueva);
        return { fila: nueva };
      }
      if (this.tabla === 'articulos') {
        if (!db.categorias.some((c) => c.valor === fila0.categoria)) return { error: error('violates foreign key constraint', '23503') };
        const nuevo = completarArticulo(fila0);
        db.articulos.push(nuevo);
        return { fila: nuevo };
      }
      if (this.tabla === 'ordenes') {
        const nueva = { folio: 'BOL-' + sigueFolio++, user_id: null, estado: 'Pagada', lineas: [], total: 0, creada_en: marca(), ...fila0 };
        db.ordenes.push(nueva);
        return { fila: nueva };
      }
      return { error: error('tabla no soportada en el falso', 'XX000') };
    }
  }

  const notificar = (evento) => oyentes.forEach((fn) => fn(evento, sesion));

  const cliente = {
    from: (tabla) => new Consulta(tabla),

    rpc: async (nombre, { p_id }) => {
      if (nombre !== 'eliminar_usuario') return { data: null, error: error('funcion desconocida', '42883') };
      const perfil = db.perfiles.find((p) => p.id === p_id);
      if (perfil?.rol === 'admin' && cantidadAdmins() <= 1) return { data: null, error: error('No puedes eliminar al unico administrador.', 'P0001') };
      db.perfiles = db.perfiles.filter((p) => p.id !== p_id);
      db.articulos.forEach((a) => { if (a.vendedor_id === p_id) a.vendedor_id = null; }); // on delete set null
      const i = cuentas.findIndex((c) => c.id === p_id);
      if (i >= 0) cuentas.splice(i, 1);
      return { data: null, error: null };
    },

    auth: {
      async signUp({ email, password, options }) {
        const correo = email.trim().toLowerCase();
        if (cuentas.some((c) => c.email === correo)) return { data: { user: null, session: null }, error: { message: 'User already registered' } };
        const id = 'u-' + (cuentas.length + 1) + '-' + Math.round(Math.random() * 1e6);
        cuentas.push({ id, email: correo, password });
        const meta = options?.data || {};
        // trigger al_registrarse: el rol SIEMPRE parte como cliente
        db.perfiles.push({ id, nombre: meta.nombre || '', nombre_usuario: meta.nombre_usuario || '', correo, universidad: meta.universidad || '', rol: 'cliente', foto: null, creado_en: marca() });
        // como el cliente real: si no habia sesion, la cuenta nueva queda con sesion
        if (!sesion) { sesion = { user: { id } }; notificar('SIGNED_IN'); }
        return { data: { user: { id, identities: [{}] }, session: sesion }, error: null };
      },
      async signInWithPassword({ email, password }) {
        const c = cuentas.find((x) => x.email === email.trim().toLowerCase() && x.password === password);
        if (!c) return { data: { user: null, session: null }, error: { message: 'Invalid login credentials' } };
        sesion = { user: { id: c.id } };
        notificar('SIGNED_IN');
        return { data: { user: { id: c.id }, session: sesion }, error: null };
      },
      async signOut() { sesion = null; notificar('SIGNED_OUT'); return { error: null }; },
      async getSession() { return { data: { session: sesion }, error: null }; },
      onAuthStateChange(fn) {
        oyentes.push(fn);
        return { data: { subscription: { unsubscribe: () => { const i = oyentes.indexOf(fn); if (i >= 0) oyentes.splice(i, 1); } } } };
      },
    },
  };

  /** Atajo de pruebas: deja una cuenta existente con sesion iniciada. */
  const iniciarComo = (correo) => {
    const c = cuentas.find((x) => x.email === correo.toLowerCase());
    sesion = c ? { user: { id: c.id } } : null;
  };

  return { cliente, db, iniciarComo, ID_ADMIN, ID_JUAN };
}
