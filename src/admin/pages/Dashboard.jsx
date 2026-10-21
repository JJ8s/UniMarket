import { Link } from 'react-router-dom';
import { ROL_ADMIN, cargarArticulos, cargarOrdenes, cargarUsuarios, obtenerArticulosCriticos } from '../../data/datos';
import { formatearFechaHora, formatearPrecio } from '../../utils/utilidades';
import { resumenOrdenes, totalVentas } from '../../utils/reportes';
import EncabezadoPagina from '../components/EncabezadoPagina';
import InsigniaEstadoOrden from '../components/InsigniaEstadoOrden';
import TarjetaMetrica from '../components/TarjetaMetrica';
import TarjetaModulo from '../components/TarjetaModulo';

// Accesos directos a cada seccion (Figura 9 del anexo)
const MODULOS = [
  { a: '/admin/ordenes', icono: 'fa-receipt', titulo: 'Órdenes', texto: 'Seguimiento de las compras y sus boletas.' },
  { a: '/admin/productos', icono: 'fa-box', titulo: 'Productos', texto: 'Inventario y detalle de los productos.' },
  { a: '/admin/productos/criticos', icono: 'fa-triangle-exclamation', titulo: 'Stock crítico', texto: 'Productos que se están agotando.' },
  { a: '/admin/categorias', icono: 'fa-tags', titulo: 'Categorías', texto: 'Organiza los productos por categoría.' },
  { a: '/admin/usuarios', icono: 'fa-users', titulo: 'Usuarios', texto: 'Cuentas y roles del sistema.' },
  { a: '/admin/reportes', icono: 'fa-chart-column', titulo: 'Reportes', texto: 'Ventas, productos y exportación a CSV.' },
  { a: '/admin/perfil', icono: 'fa-user', titulo: 'Perfil', texto: 'Tus datos y tu contraseña.' },
  { a: '/', icono: 'fa-store', titulo: 'Tienda', texto: 'Ver la tienda como la ven los clientes.' },
];

/** Home del panel: metricas, accesos directos y ultimas ordenes. */
export default function Dashboard() {
  const ordenes = cargarOrdenes();
  const articulos = cargarArticulos();
  const usuarios = cargarUsuarios();

  const resumen = resumenOrdenes(ordenes);
  const criticos = obtenerArticulosCriticos().length;
  const admins = usuarios.filter((u) => u.rol === ROL_ADMIN).length;
  const ultimas = [...ordenes].sort((a, b) => b.creadaEn - a.creadaEn).slice(0, 5);

  return (
    <>
      <EncabezadoPagina titulo="Dashboard" subtitulo="Resumen de la actividad de UniMarket" />

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <TarjetaMetrica titulo="Compras" valor={resumen.pagadas} color="primary" icono="fa-cart-shopping"
            detalle={`${formatearPrecio(totalVentas(ordenes))} vendidos · ${resumen.pendientes} pendiente(s)`} />
        </div>
        <div className="col-12 col-md-4">
          <TarjetaMetrica titulo="Productos" valor={articulos.length} color="success" icono="fa-box"
            detalle={`${criticos} con stock crítico`} />
        </div>
        <div className="col-12 col-md-4">
          <TarjetaMetrica titulo="Usuarios" valor={usuarios.length} color="warning" icono="fa-users"
            detalle={`${admins} administrador(es)`} />
        </div>
      </div>

      <div className="row g-3 mb-4">
        {MODULOS.map((modulo) => (
          <div className="col-6 col-md-4 col-xl-3" key={modulo.a}>
            <TarjetaModulo {...modulo} />
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>Últimas órdenes</strong>
          <Link to="/admin/ordenes" className="small">Ver todas</Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>Boleta</th><th>Fecha</th><th>Cliente</th><th className="text-end">Total</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {ultimas.map((orden) => (
                <tr key={orden.folio}>
                  <td><Link to={`/admin/ordenes/${orden.folio}`}>{orden.folio}</Link></td>
                  <td>{formatearFechaHora(orden.creadaEn)}</td>
                  <td>{orden.cliente.nombre}</td>
                  <td className="text-end">{formatearPrecio(orden.total)}</td>
                  <td><InsigniaEstadoOrden estado={orden.estado} /></td>
                </tr>
              ))}
              {ultimas.length === 0 && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">Todavía no hay órdenes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
