import { useEffect, useState } from 'react';
import { useCategorias } from '../context/CategoriasContext';
import { obtenerEstiloImagen } from '../utils/utilidades';

/** Ventana con el detalle */
export default function ModalProducto({ articulo, onCerrar, onAgregar }) {
  const { etiquetaCategoria } = useCategorias();
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alPresionarTecla);
    return () => document.removeEventListener('keydown', alPresionarTecla);
  }, [onCerrar]);

  useEffect(() => {
    if (!agregado) return undefined;
    const temporizador = setTimeout(onCerrar, 700);
    return () => clearTimeout(temporizador);
  }, [agregado, onCerrar]);

  const agregar = () => {
    if (agregado) return;
    onAgregar();
    setAgregado(true);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="modal-content">
        <button type="button" className="modal-close" aria-label="Cerrar" onClick={onCerrar}>&times;</button>
        <div className="modal-image" style={obtenerEstiloImagen(articulo)}></div>
        <div className="modal-body">
          <span className="modal-condition">{articulo.condicion || 'Sin condición'}</span>
          <h3 className="modal-name">{articulo.nombre}</h3>
          <p className="modal-seller">
            {articulo.vendedor} • {etiquetaCategoria(articulo.categoria)}
          </p>
          <p className="modal-description">{articulo.descripcion || 'Sin descripción disponible.'}</p>

          <div className="modal-info-grid">
            <div className="info-item">
              <span className="info-label">Precio</span>
              <span className="info-value">${articulo.precio.toFixed(2)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Universidad</span>
              <span className="info-value">{articulo.universidad}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Distancia</span>
              <span className="info-value">{articulo.distancia.toFixed(1)} km</span>
            </div>
            <div className="info-item">
              <span className="info-label">Calificación</span>
              <span className="info-value">★ {(articulo.calificacion ?? 0).toFixed(1)}</span>
            </div>
          </div>

          <div className="modal-entrega">
            <span className="info-label">Punto de entrega</span>
            <span className="info-value">{articulo.entrega || 'A convenir con el vendedor'}</span>
          </div>

          <button type="button" className={`modal-cart-btn ${agregado ? 'added' : ''}`} onClick={agregar}>
            {agregado ? 'Agregado a la bolsa' : 'Agregar a la bolsa'}
          </button>
        </div>
      </div>
    </div>
  );
}
