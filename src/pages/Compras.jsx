import BannerPagina from '../components/BannerPagina';
import EstadoVacio from '../components/EstadoVacio';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { ordenesDeUsuario } from '../data/datos';
import useBodyClass from '../hooks/useBodyClass';
import useConsulta from '../hooks/useConsulta';
import { descargarBoletaPdf } from '../utils/boletaPdf';
import { formatearFechaHora, formatearPrecio } from '../utils/utilidades';

export default function Compras() {
  useBodyClass('perfil-body');
  const { usuario } = useAuth();
  const { datos: ordenes, cargando } = useConsulta(() => ordenesDeUsuario(usuario.correo), []);

  return (
    <>
      <div className="perfil-header-logo">
        <Logo />
      </div>

      <main className="orders-wrapper">
        <BannerPagina titulo="Mis compras" subtitulo="Tus boletas de UniMarket" enlaceA="/perfil" enlaceTexto="Volver al perfil" />

        {ordenes.map((orden) => (
          <section className="publicacion-card" key={orden.folio}>
            <div className="publicacion-header">
              <span className="order-id">{orden.folio}</span>
              <span className="order-date">{formatearFechaHora(orden.creadaEn)}</span>
            </div>
            <div className="publicacion-body">
              <div className="order-details">
                <h3>{orden.lineas.map((l) => l.nombre).join(', ')}</h3>
                <p className="publicacion-meta">
                  {orden.lineas.reduce((suma, l) => suma + l.cantidad, 0)} producto(s) · {orden.estado}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <p className="publicacion-precio">{formatearPrecio(orden.total)}</p>
                <button type="button" className="btn-delete-outline" onClick={() => descargarBoletaPdf(orden)}>
                  <i className="fa-solid fa-file-pdf"></i> Boleta PDF
                </button>
              </div>
            </div>
          </section>
        ))}

        {cargando && <p className="text-center text-gray-500">Cargando...</p>}

        {!cargando && ordenes.length === 0 && (
          <EstadoVacio mensaje="Todavía no has hecho compras." enlaceA="/" enlaceTexto="Ir al catálogo" icono="fa-store" />
        )}
      </main>
    </>
  );
}
