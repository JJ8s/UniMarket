import { Link, useNavigate, useParams } from 'react-router-dom';
import { UMBRAL_STOCK_CRITICO, eliminarArticulo, obtenerArticulo } from '../../data/datos';
import { etiquetaCategoria, formatearFechaHora, formatearPrecio } from '../../utils/utilidades';
import EncabezadoPagina from '../components/EncabezadoPagina';
import InsigniaStock from '../components/InsigniaStock';
import Miniatura from '../components/Miniatura';

// Filas de datos que se muestran en la ficha del producto
const dato = (etiqueta, valor) => (
  <div className="col-12 col-md-6" key={etiqueta}>
    <div className="small text-secondary">{etiqueta}</div>
    <div>{valor || '-'}</div>
  </div>
);

/** "Mostrar producto": ficha completa de un producto. */
export default function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const articulo = obtenerArticulo(id);

  if (!articulo) {
    return (
      <>
        <EncabezadoPagina titulo="Producto no encontrado" />
        <Link to="/admin/productos" className="btn btn-outline-secondary">Volver a productos</Link>
      </>
    );
  }

  const borrar = () => {
    if (!window.confirm(`¿Eliminar "${articulo.nombre}"? Esta acción no se puede deshacer.`)) return;
    eliminarArticulo(articulo.id);
    navigate('/admin/productos');
  };

  const critico = (articulo.stock ?? 0) <= UMBRAL_STOCK_CRITICO;

  return (
    <>
      <EncabezadoPagina titulo={articulo.nombre} subtitulo={`Producto #${articulo.id}`}>
        <Link to={`/admin/productos/${articulo.id}/editar`} className="btn btn-primary"><i className="fa-solid fa-pen"></i> Editar</Link>
        <button type="button" className="btn btn-outline-danger" onClick={borrar}><i className="fa-solid fa-trash"></i> Eliminar</button>
        <Link to="/admin/productos" className="btn btn-outline-secondary">Volver</Link>
      </EncabezadoPagina>

      {critico && (
        <div className="alert alert-warning py-2">
          Stock crítico: quedan {articulo.stock ?? 0} unidad(es).
        </div>
      )}

      <div className="card" style={{ maxWidth: 820 }}>
        <div className="card-body">
          <div className="d-flex gap-3 mb-3">
            <div style={{ width: 96, flexShrink: 0 }}>
              <div className="ratio ratio-1x1"><Miniatura articulo={articulo} /></div>
            </div>
            <div>
              <p className="mb-1">{articulo.descripcion || 'Sin descripción.'}</p>
              <InsigniaStock stock={articulo.stock} />
            </div>
          </div>
          <div className="row g-3">
            {dato('Categoría', etiquetaCategoria(articulo.categoria))}
            {dato('Precio', formatearPrecio(articulo.precio))}
            {dato('Stock', `${articulo.stock ?? 0} unidades`)}
            {dato('Estado', articulo.condicion)}
            {dato('Vendedor', articulo.vendedor)}
            {dato('Universidad', articulo.universidad)}
            {dato('SKU', articulo.sku)}
            {dato('Punto de entrega', articulo.entrega)}
            {dato('Calificación', (articulo.calificacion ?? 0).toFixed(1))}
            {dato('Publicado', formatearFechaHora(articulo.creadoEn))}
          </div>
        </div>
      </div>
    </>
  );
}
