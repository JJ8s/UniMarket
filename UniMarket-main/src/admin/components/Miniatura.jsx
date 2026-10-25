import { obtenerEstiloImagen } from '../../utils/utilidades';

/** Cuadrito con la primera foto del articulo (o su color de relleno). */
export default function Miniatura({ articulo }) {
  return <div className="admin-miniatura" style={obtenerEstiloImagen(articulo)}></div>;
}
