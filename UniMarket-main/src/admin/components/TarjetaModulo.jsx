import { Link } from 'react-router-dom';

/** Acceso directo a una seccion del panel (las tarjetas bajo las metricas). */
export default function TarjetaModulo({ a, icono, titulo, texto }) {
  return (
    <Link to={a} className="admin-modulo">
      <i className={`fa-solid ${icono} mb-2`}></i>
      <div className="fw-semibold">{titulo}</div>
      <div className="small text-secondary">{texto}</div>
    </Link>
  );
}
