import { ROL_ADMIN, cargarArticulos, cargarOrdenes, cargarUsuarios, obtenerArticulosCriticos } from '../../data/datos';
import { descargarCsv } from '../../utils/archivos';
import {
  convertirACsv, productosMasVendidos, resumenOrdenes, totalVentas, ventasPorCategoria, ventasPorMes,
} from '../../utils/reportes';
import { useCategorias } from '../../context/CategoriasContext';
import useConsulta from '../../hooks/useConsulta';
import { formatearPrecio } from '../../utils/utilidades';
import EncabezadoPagina from '../components/EncabezadoPagina';

// "2026-10" -> "oct 2026"
const nombreMes = (clave) => {
  const [anio, mes] = clave.split('-').map(Number);
  return new Date(anio, mes - 1, 1).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
};

/** Barra horizontal simple (Bootstrap progress) para comparar montos. */
function Barra({ valor, maximo }) {
  const porcentaje = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;
  return (
    <div className="progress admin-barra" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar" style={{ width: `${porcentaje}%` }}></div>
    </div>
  );
}

/** Reportes de ventas, productos y usuarios, con exportacion a CSV. */
export default function Reportes() {
  const { etiquetaCategoria } = useCategorias();
  const { datos, cargando } = useConsulta(async () => {
    const [ordenes, articulos, usuarios, criticos] = await Promise.all([
      cargarOrdenes(), cargarArticulos(), cargarUsuarios(), obtenerArticulosCriticos(),
    ]);
    return { ordenes, articulos, usuarios, criticos };
  }, { ordenes: [], articulos: [], usuarios: [], criticos: [] }, []);

  if (cargando) return <p className="text-secondary">Cargando...</p>;
  const { ordenes, articulos, usuarios, criticos } = datos;

  const resumen = resumenOrdenes(ordenes);
  const porCategoria = ventasPorCategoria(ordenes);
  const masVendidos = productosMasVendidos(ordenes, 5);
  const porMes = ventasPorMes(ordenes);
  const maxCategoria = Math.max(0, ...porCategoria.map((f) => f.monto));
  const maxMes = Math.max(0, ...porMes.map((f) => f.monto));

  const exportarVentasCategoria = () => {
    const filas = porCategoria.map((f) => ({ categoria: etiquetaCategoria(f.categoria), unidades: f.unidades, monto: f.monto.toFixed(2) }));
    descargarCsv('ventas-por-categoria.csv', convertirACsv(filas, [
      { clave: 'categoria', titulo: 'Categoría' }, { clave: 'unidades', titulo: 'Unidades' }, { clave: 'monto', titulo: 'Monto' },
    ]));
  };
  const exportarMasVendidos = () => {
    const filas = masVendidos.map((f) => ({ ...f, monto: f.monto.toFixed(2) }));
    descargarCsv('productos-mas-vendidos.csv', convertirACsv(filas, [
      { clave: 'nombre', titulo: 'Producto' }, { clave: 'unidades', titulo: 'Unidades' }, { clave: 'monto', titulo: 'Monto' },
    ]));
  };

  return (
    <>
      <EncabezadoPagina titulo="Reportes" subtitulo="Las ventas cuentan solo las órdenes en estado Pagada" />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3"><div className="card"><div className="card-body"><div className="small text-secondary">Ventas totales</div><div className="fs-4 fw-bold">{formatearPrecio(totalVentas(ordenes))}</div></div></div></div>
        <div className="col-6 col-lg-3"><div className="card"><div className="card-body"><div className="small text-secondary">Órdenes pagadas</div><div className="fs-4 fw-bold">{resumen.pagadas}<span className="fs-6 text-secondary"> de {resumen.total}</span></div></div></div></div>
        <div className="col-6 col-lg-3"><div className="card"><div className="card-body"><div className="small text-secondary">Productos críticos</div><div className="fs-4 fw-bold">{criticos.length}<span className="fs-6 text-secondary"> de {articulos.length}</span></div></div></div></div>
        <div className="col-6 col-lg-3"><div className="card"><div className="card-body"><div className="small text-secondary">Usuarios</div><div className="fs-4 fw-bold">{usuarios.length}<span className="fs-6 text-secondary"> ({usuarios.filter((u) => u.rol === ROL_ADMIN).length} admin)</span></div></div></div></div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Ventas por categoría</strong>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={exportarVentasCategoria}><i className="fa-solid fa-file-csv"></i> CSV</button>
            </div>
            <div className="card-body">
              {porCategoria.map((fila) => (
                <div className="mb-3" key={fila.categoria}>
                  <div className="d-flex justify-content-between small">
                    <span>{etiquetaCategoria(fila.categoria)} <span className="text-secondary">({fila.unidades} u.)</span></span>
                    <strong>{formatearPrecio(fila.monto)}</strong>
                  </div>
                  <Barra valor={fila.monto} maximo={maxCategoria} />
                </div>
              ))}
              {porCategoria.length === 0 && <p className="text-secondary mb-0">Aún no hay ventas.</p>}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card h-100">
            <div className="card-header"><strong>Ventas por mes</strong></div>
            <div className="card-body">
              {porMes.map((fila) => (
                <div className="mb-3" key={fila.clave}>
                  <div className="d-flex justify-content-between small">
                    <span><span className="text-capitalize">{nombreMes(fila.clave)}</span> <span className="text-secondary">({fila.ordenes} {fila.ordenes === 1 ? 'orden' : 'órdenes'})</span></span>
                    <strong>{formatearPrecio(fila.monto)}</strong>
                  </div>
                  <Barra valor={fila.monto} maximo={maxMes} />
                </div>
              ))}
              {porMes.length === 0 && <p className="text-secondary mb-0">Aún no hay ventas.</p>}
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Productos más vendidos</strong>
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={exportarMasVendidos}><i className="fa-solid fa-file-csv"></i> CSV</button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Producto</th><th className="text-end">Unidades</th><th className="text-end">Monto</th></tr></thead>
                <tbody>
                  {masVendidos.map((fila) => (
                    <tr key={fila.idArticulo}><td>{fila.nombre}</td><td className="text-end">{fila.unidades}</td><td className="text-end">{formatearPrecio(fila.monto)}</td></tr>
                  ))}
                  {masVendidos.length === 0 && <tr><td colSpan={3} className="text-center text-secondary py-3">Aún no hay ventas.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-6">
          <div className="card h-100">
            <div className="card-header"><strong>Stock crítico</strong></div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead><tr><th>Producto</th><th className="text-end">Stock</th></tr></thead>
                <tbody>
                  {criticos.slice(0, 6).map((a) => (
                    <tr key={a.id}><td>{a.nombre}</td><td className="text-end">{a.stock ?? 0}</td></tr>
                  ))}
                  {criticos.length === 0 && <tr><td colSpan={2} className="text-center text-secondary py-3">Ningún producto con stock crítico.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
