import { Link, useParams } from 'react-router-dom';
import { obtenerUsuario, ordenesDeUsuario } from '../../data/datos';
import useConsulta from '../../hooks/useConsulta';
import { totalVentas } from '../../utils/reportes';
import { formatearFechaHora, formatearPrecio } from '../../utils/utilidades';
import EncabezadoPagina from '../components/EncabezadoPagina';
import InsigniaEstadoOrden from '../components/InsigniaEstadoOrden';

export default function HistorialCompras() {
  const { correo } = useParams();
  const { datos: ficha, cargando } = useConsulta(async () => {
    const [usuario, ordenes] = await Promise.all([obtenerUsuario(correo), ordenesDeUsuario(correo)]);
    return { usuario, ordenes };
  }, { usuario: null, ordenes: [] }, [correo]);
  const { usuario, ordenes } = ficha;

  return (
    <>
      <EncabezadoPagina titulo="Historial de compras" subtitulo={usuario ? `${usuario.nombre} · ${usuario.correo}` : correo}>
        {usuario && <Link to={`/admin/usuarios/${encodeURIComponent(usuario.correo)}`} className="btn btn-outline-secondary">Volver al usuario</Link>}
        <Link to="/admin/usuarios" className="btn btn-outline-secondary">Usuarios</Link>
      </EncabezadoPagina>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr><th>Boleta</th><th>Fecha</th><th>Productos</th><th className="text-end">Total</th><th>Estado</th></tr></thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.folio}>
                  <td><Link to={`/admin/ordenes/${orden.folio}`}>{orden.folio}</Link></td>
                  <td>{formatearFechaHora(orden.creadaEn)}</td>
                  <td className="small">{orden.lineas.map((l) => `${l.cantidad} × ${l.nombre}`).join(', ')}</td>
                  <td className="text-end">{formatearPrecio(orden.total)}</td>
                  <td><InsigniaEstadoOrden estado={orden.estado} /></td>
                </tr>
              ))}
              {cargando && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">Cargando...</td></tr>
              )}
              {!cargando && ordenes.length === 0 && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">Este usuario todavía no tiene compras.</td></tr>
              )}
            </tbody>
            {ordenes.length > 0 && (
              <tfoot><tr><th colSpan={3} className="text-end">Total pagado</th><th className="text-end">{formatearPrecio(totalVentas(ordenes))}</th><th></th></tr></tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}
