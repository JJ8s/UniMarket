import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ESTADOS_ORDEN, cargarOrdenes } from '../../data/datos';
import useConsulta from '../../hooks/useConsulta';
import { descargarCsv } from '../../utils/archivos';
import { convertirACsv } from '../../utils/reportes';
import { formatearFechaHora, formatearPrecio, normalizarTexto } from '../../utils/utilidades';
import BuscadorFiltros from '../components/BuscadorFiltros';
import EncabezadoPagina from '../components/EncabezadoPagina';
import InsigniaEstadoOrden from '../components/InsigniaEstadoOrden';

/** Listado de ordenes/boletas con busqueda, filtro por estado y exportacion a CSV. */
export default function Ordenes() {
  const { datos: ordenes, cargando } = useConsulta(cargarOrdenes, [], []);
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('todos');

  const filtradas = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim());
    return ordenes
      .filter((o) => estado === 'todos' || o.estado === estado)
      .filter((o) => !termino || normalizarTexto(`${o.folio} ${o.cliente.nombre} ${o.cliente.correo}`).includes(termino))
      .sort((a, b) => b.creadaEn - a.creadaEn);
  }, [ordenes, busqueda, estado]);

  const exportar = () => {
    const filas = filtradas.map((o) => ({
      folio: o.folio,
      fecha: formatearFechaHora(o.creadaEn),
      cliente: o.cliente.nombre,
      correo: o.cliente.correo,
      metodo: o.metodoPago,
      estado: o.estado,
      total: o.total.toFixed(2),
    }));
    descargarCsv('ordenes.csv', convertirACsv(filas, [
      { clave: 'folio', titulo: 'Boleta' }, { clave: 'fecha', titulo: 'Fecha' },
      { clave: 'cliente', titulo: 'Cliente' }, { clave: 'correo', titulo: 'Correo' },
      { clave: 'metodo', titulo: 'Método de pago' }, { clave: 'estado', titulo: 'Estado' },
      { clave: 'total', titulo: 'Total' },
    ]));
  };

  return (
    <>
      <EncabezadoPagina titulo="Órdenes" subtitulo="Compras realizadas en la tienda">
        <button type="button" className="btn btn-outline-secondary" onClick={exportar}>
          <i className="fa-solid fa-file-csv"></i> Exportar CSV
        </button>
      </EncabezadoPagina>

      <BuscadorFiltros busqueda={busqueda} onBusqueda={setBusqueda} placeholder="Buscar por boleta, cliente o correo">
        <div className="col-12 col-md-4 col-lg-3">
          <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)} aria-label="Filtrar por estado">
            <option value="todos">Todos los estados</option>
            {ESTADOS_ORDEN.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </BuscadorFiltros>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>Boleta</th><th>Fecha</th><th>Cliente</th><th>Pago</th><th className="text-end">Total</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {filtradas.map((orden) => (
                <tr key={orden.folio}>
                  <td className="fw-semibold">{orden.folio}</td>
                  <td>{formatearFechaHora(orden.creadaEn)}</td>
                  <td>{orden.cliente.nombre}<div className="small text-secondary">{orden.cliente.correo}</div></td>
                  <td>{orden.metodoPago} ····{orden.ultimosDigitos}</td>
                  <td className="text-end">{formatearPrecio(orden.total)}</td>
                  <td><InsigniaEstadoOrden estado={orden.estado} /></td>
                  <td className="text-end">
                    <Link to={`/admin/ordenes/${orden.folio}`} className="btn btn-sm btn-outline-primary">Ver boleta</Link>
                  </td>
                </tr>
              ))}
              {cargando && (
                <tr><td colSpan={7} className="text-center text-secondary py-4">Cargando...</td></tr>
              )}
              {!cargando && filtradas.length === 0 && (
                <tr><td colSpan={7} className="text-center text-secondary py-4">No hay órdenes que coincidan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
