import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ESTADOS_ORDEN, actualizarEstadoOrden, obtenerOrden } from '../../data/datos';
import useConsulta from '../../hooks/useConsulta';
import { formatearFechaHora, formatearPrecio } from '../../utils/utilidades';
import EncabezadoPagina from '../components/EncabezadoPagina';
import InsigniaEstadoOrden from '../components/InsigniaEstadoOrden';
import MensajeError from '../components/MensajeError';

export default function BoletaOrden() {
  const { folio } = useParams();
  const { datos: ordenCargada, cargando } = useConsulta(() => obtenerOrden(folio), null, [folio]);
  const [ordenActualizada, setOrden] = useState(null);
  const orden = ordenActualizada ?? ordenCargada;
  const [error, setError] = useState('');
  const [guardado, setGuardado] = useState(false);

  if (cargando) return <p className="text-secondary">Cargando...</p>;

  if (!orden) {
    return (
      <>
        <EncabezadoPagina titulo="Boleta no encontrada" />
        <p>No existe una orden con el folio <strong>{folio}</strong>.</p>
        <Link to="/admin/ordenes" className="btn btn-outline-secondary">Volver a órdenes</Link>
      </>
    );
  }

  const cambiarEstado = async (evento) => {
    const resultado = await actualizarEstadoOrden(orden.folio, evento.target.value);
    if (!resultado.ok) {
      setError(resultado.mensaje);
      return;
    }
    setError('');
    setGuardado(true);
    setOrden(resultado.orden);
  };

  return (
    <>
      <EncabezadoPagina titulo={`Boleta ${orden.folio}`} subtitulo={formatearFechaHora(orden.creadaEn)}>
        <button type="button" className="btn btn-outline-secondary" onClick={() => window.print()}>
          <i className="fa-solid fa-print"></i> Imprimir
        </button>
        <Link to="/admin/ordenes" className="btn btn-outline-secondary">Volver</Link>
      </EncabezadoPagina>

      <MensajeError mensaje={error} />

      <div className="card" style={{ maxWidth: 760 }}>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-3 mb-3">
            <div className="flex-grow-1" style={{ minWidth: "240px" }}>
              <div className="small text-secondary">Cliente</div>
              <div className="fw-semibold">{orden.cliente.nombre}</div>
              <div className="small">{orden.cliente.correo}</div>
            </div>
            <div className="flex-grow-1" style={{ minWidth: "240px" }}>
              <div className="small text-secondary">Pago</div>
              <div className="fw-semibold">{orden.metodoPago} terminada en {orden.ultimosDigitos}</div>
              <div className="small">Autorización {orden.autorizacion}</div>
            </div>
            <div className="flex-grow-1 d-flex align-items-center gap-2" style={{ minWidth: "100%" }}>
              <span className="small text-secondary">Estado</span>
              <InsigniaEstadoOrden estado={orden.estado} />
              <select className="form-select form-select-sm w-auto d-print-none" value={orden.estado} onChange={cambiarEstado} aria-label="Cambiar estado">
                {ESTADOS_ORDEN.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              {guardado && <span className="small text-success d-print-none">Guardado</span>}
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr><th>Producto</th><th>Vendedor</th><th className="text-end">Precio</th><th className="text-end">Cant.</th><th className="text-end">Subtotal</th></tr>
              </thead>
              <tbody>
                {orden.lineas.map((linea) => (
                  <tr key={linea.idArticulo}>
                    <td>{linea.nombre}</td>
                    <td>{linea.vendedor}</td>
                    <td className="text-end">{formatearPrecio(linea.precio)}</td>
                    <td className="text-end">{linea.cantidad}</td>
                    <td className="text-end">{formatearPrecio(linea.precio * linea.cantidad)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><th colSpan={4} className="text-end">Total</th><th className="text-end">{formatearPrecio(orden.total)}</th></tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
