import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UMBRAL_STOCK_CRITICO, obtenerArticulosCriticos } from '../../data/datos';
import { useCategorias } from '../../context/CategoriasContext';
import useConsulta from '../../hooks/useConsulta';
import EncabezadoPagina from '../components/EncabezadoPagina';
import InsigniaStock from '../components/InsigniaStock';
import Miniatura from '../components/Miniatura';

export default function ProductosCriticos() {
  const [umbral, setUmbral] = useState(UMBRAL_STOCK_CRITICO);
  const { etiquetaCategoria } = useCategorias();
  const { datos: criticos, cargando } = useConsulta(() => obtenerArticulosCriticos(umbral), [], [umbral]);

  return (
    <>
      <EncabezadoPagina titulo="Productos críticos" subtitulo="Productos con poco stock que conviene reponer">
        <Link to="/admin/productos" className="btn btn-outline-secondary">Volver a productos</Link>
      </EncabezadoPagina>

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <div><label htmlFor="umbral" className="col-form-label">Mostrar productos con stock de</label></div>
        <div>
          <input id="umbral" type="number" min="0" className="form-control" style={{ width: 90 }}
                 value={umbral} onChange={(e) => setUmbral(Math.max(0, Number(e.target.value) || 0))} />
        </div>
        <div><span className="col-form-label">unidades o menos</span></div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr><th>Producto</th><th>Categoría</th><th>Vendedor</th><th>Stock</th><th></th></tr></thead>
            <tbody>
              {criticos.map((articulo) => (
                <tr key={articulo.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Miniatura articulo={articulo} />
                      <Link to={`/admin/productos/${articulo.id}`}>{articulo.nombre}</Link>
                    </div>
                  </td>
                  <td>{etiquetaCategoria(articulo.categoria)}</td>
                  <td>{articulo.vendedor}</td>
                  <td><InsigniaStock stock={articulo.stock} umbral={umbral} /></td>
                  <td className="text-end">
                    <Link to={`/admin/productos/${articulo.id}/editar`} className="btn btn-sm btn-outline-primary">Reponer stock</Link>
                  </td>
                </tr>
              ))}
              {cargando && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">Cargando...</td></tr>
              )}
              {!cargando && criticos.length === 0 && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">No hay productos con ese nivel de stock.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
