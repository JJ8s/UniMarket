import { useCategorias } from '../context/CategoriasContext';
import { obtenerEstiloImagen } from '../utils/utilidades';

/** Tarjeta de un producto */
export default function TarjetaArticulo({ articulo, onClick }) {
  const { etiquetaCategoria } = useCategorias();
  const textoCalificacion = articulo.calificacionesCantidad > 0
    ? `${articulo.calificacionesCantidad} calificaciones`
    : 'Aún sin calificaciones de compradores';
  return (
    <div className="card" onClick={onClick}>
      <div className="card-image" style={obtenerEstiloImagen(articulo)}>
        {articulo.condicion && <span className="badge-condition">{articulo.condicion}</span>}
        <span className="badge-distance">{articulo.distancia.toFixed(1)} km</span>
      </div>
      <div className="card-body">
        <h3 className="product-name">{articulo.nombre}</h3>
        <p className="seller-name">
          {articulo.vendedor} • {etiquetaCategoria(articulo.categoria)}
        </p>
        <div className="card-footer">
          <span className="rating" title={textoCalificacion}>
            <span className="star">★</span> {articulo.calificacion > 0 ? articulo.calificacion.toFixed(1) : 'Sin calificar'}
            {articulo.calificacionesCantidad > 0 && <span className="rating-cantidad">({articulo.calificacionesCantidad})</span>}
          </span>
          <span className="product-price">${articulo.precio.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
