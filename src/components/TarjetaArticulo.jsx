import { useCategorias } from '../context/CategoriasContext';
import { obtenerEstiloImagen } from '../utils/utilidades';

/** Tarjeta de un producto */
export default function TarjetaArticulo({ articulo, onClick }) {
  const { etiquetaCategoria } = useCategorias();
  const stock = articulo.stock ?? 0;
  const vendido = stock <= 0;
  return (
    <div className={`card ${vendido ? 'card-vendido' : ''}`} onClick={onClick}>
      <div className="card-image" style={obtenerEstiloImagen(articulo)}>
        {vendido && <span className="badge-vendido">Vendido</span>}
        {articulo.condicion && (
          <span className={`badge-condition ${vendido ? 'a-la-izquierda' : ''}`}>{articulo.condicion}</span>
        )}
        <span className="badge-distance">{articulo.distancia.toFixed(1)} km</span>
        {!vendido && (
          <span className="badge-stock">{stock === 1 ? 'Queda 1' : `Quedan ${stock}`}</span>
        )}
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