// Pruebas de los calculos de reportes. Sintaxis comun a Vitest y Jasmine:
// existe una copia identica como reportes.spec.js (la que corre Karma).
import { ORDENES_POR_DEFECTO } from '../data/datos';
import {
  convertirACsv,
  ordenesPagadas,
  productosMasVendidos,
  resumenOrdenes,
  totalVentas,
  ventasPorCategoria,
  ventasPorMes,
} from './reportes';

// Las 6 ordenes de ejemplo: 4 Pagada, 1 Pendiente, 1 Anulada. Pagadas = 20 + 16 + 20 + 23 = 79.
const ordenes = ORDENES_POR_DEFECTO;

describe('reportes - ventas', () => {
  it('ordenesPagadas deja solo las pagadas', () => {
    expect(ordenesPagadas(ordenes).length).toBe(4);
  });

  it('totalVentas ignora las ordenes pendientes y anuladas', () => {
    expect(totalVentas(ordenes)).toBeCloseTo(79, 5);
  });

  it('totalVentas de una lista vacia es 0', () => {
    expect(totalVentas([])).toBe(0);
  });

  it('resumenOrdenes cuenta por estado', () => {
    expect(resumenOrdenes(ordenes)).toEqual({ total: 6, pagadas: 4, pendientes: 1, anuladas: 1 });
  });

  it('ventasPorCategoria suma unidades y monto, de mayor a menor monto', () => {
    const filas = ventasPorCategoria(ordenes);
    expect(filas.map((f) => f.categoria)).toEqual(['ropa', 'snacks', 'tecnologia']);
    expect(filas[0].monto).toBeCloseTo(40, 5);
    expect(filas[1].unidades).toBe(9); // 6 brownies + 3 monster
    expect(filas[1].monto).toBeCloseTo(24, 5);
  });

  it('productosMasVendidos ordena por unidades y respeta el limite', () => {
    const top = productosMasVendidos(ordenes, 2);
    expect(top.length).toBe(2);
    expect(top[0].nombre).toBe('Brownies de Chocolate Caseros');
    expect(top[0].unidades).toBe(6);
  });

  it('ventasPorMes suma lo mismo que totalVentas y viene ordenado por fecha', () => {
    const meses = ventasPorMes(ordenes);
    const suma = meses.reduce((s, m) => s + m.monto, 0);
    expect(suma).toBeCloseTo(totalVentas(ordenes), 5);
    const claves = meses.map((m) => m.clave);
    expect(claves).toEqual([...claves].sort());
  });
});

describe('reportes - CSV', () => {
  const columnas = [{ clave: 'nombre', titulo: 'Nombre' }, { clave: 'precio', titulo: 'Precio' }];

  it('genera encabezado y una fila por registro', () => {
    const csv = convertirACsv([{ nombre: 'Pan', precio: 2 }, { nombre: 'Te', precio: 3 }], columnas);
    expect(csv).toBe('"Nombre","Precio"\n"Pan","2"\n"Te","3"');
  });

  it('escapa las comillas dobles duplicandolas', () => {
    const csv = convertirACsv([{ nombre: 'Libro "grande"', precio: 1 }], columnas);
    expect(csv).toContain('"Libro ""grande"""');
  });

  it('los valores vacios o nulos quedan como texto vacio', () => {
    const csv = convertirACsv([{ nombre: null }], columnas);
    expect(csv).toBe('"Nombre","Precio"\n"",""');
  });
});
