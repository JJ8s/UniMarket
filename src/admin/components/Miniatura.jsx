import { obtenerEstiloImagen } from '../../utils/utilidades';

/** Cuadrito con la primera foto */
export default function Miniatura({ articulo }) {
  return <div className="admin-miniatura" style={obtenerEstiloImagen(articulo)}></div>;
}
