import { Link } from 'react-router-dom';

export default function EstadoVacio({ mensaje, enlaceA, enlaceTexto, icono }) {
  return (
    <div className="empty-state">
      <p style={{ marginBottom: '1rem' }}>{mensaje}</p>
      <Link to={enlaceA} className="btn-primary-orange" style={{ display: 'inline-flex', maxWidth: '260px', margin: '0 auto' }}>
        <i className={`fa-solid ${icono}`}></i> {enlaceTexto}
      </Link>
    </div>
  );
}
