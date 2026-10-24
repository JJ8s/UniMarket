import { useCategorias } from '../context/CategoriasContext';
import { obtenerEstiloImagen } from '../utils/utilidades';

/** Tarjeta de un producto en la grilla del catalogo. */
export default function TarjetaArticulo({ articulo, onClick }) {
  const { etiquetaCategoria } = useCategorias();
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
          <span className="rating"><span className="star">★</span> {(articulo.calificacion ?? 0).toFixed(1)}</span>
          <span className="product-price">${articulo.precio.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
