import { Link } from 'react-router-dom';

/** Banner azul con titulo, subtitulo y un boton de volver (Bolsa y Pedidos). */
export default function BannerPagina({ titulo, subtitulo, enlaceA, enlaceTexto }) {
  return (
    <header className="banner-card">
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{titulo}</h1>
        <p style={{ color: '#93c5fd', fontSize: '0.95rem', marginTop: '0.2rem' }}>{subtitulo}</p>
      </div>
      <Link to={enlaceA} className="btn-ghost-on-dark">
        <i className="fa-solid fa-arrow-left"></i> {enlaceTexto}
      </Link>
    </header>
  );
}
