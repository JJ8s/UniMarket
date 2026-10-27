import BannerPagina from '../components/BannerPagina';
import EstadoVacio from '../components/EstadoVacio';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import useBodyClass from '../hooks/useBodyClass';
import useMisArticulos from '../hooks/useMisArticulos';
import { formatearFecha } from '../utils/utilidades';

export default function Pedidos() {
  useBodyClass('perfil-body');
  const { usuario } = useAuth();
  const { misArticulos, borrarArticulo, cargando } = useMisArticulos(usuario.id);

  return (
    <>
      <div className="perfil-header-logo">
        <Logo />
      </div>

      <main className="orders-wrapper">
        <BannerPagina titulo="Mis Pedidos" subtitulo="Publicaciones que has creado en UniMarket" enlaceA="/perfil" enlaceTexto="Volver al perfil" />

        <div>
          {misArticulos.map((articulo) => (
            <section className="publicacion-card" key={articulo.id}>
              <div className="publicacion-header">
                <span className="order-id">{articulo.sku || 'Sin SKU'}</span>
                <span className="order-date">Publicado el {formatearFecha(articulo.creadoEn)}</span>
              </div>
              <div className="publicacion-body">
                <div className="order-details">
                  <h3>{articulo.nombre}</h3>
                  <p className="publicacion-meta">
                    {articulo.condicion || 'Sin condición'} · Stock: {articulo.stock ?? 0} · Punto de entrega: {articulo.entrega || 'A convenir'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <p className="publicacion-precio">${Number(articulo.precio).toFixed(2)}</p>
                  <button
                    className="btn-delete-outline"
                    onClick={() =>
                      borrarArticulo(articulo.id, '¿Seguro que quieres borrar esta publicación? Esta acción no se puede deshacer.')
                    }
                  >
                    <i className="fa-solid fa-trash"></i> Borrar
                  </button>
                </div>
              </div>
            </section>
          ))}
        </div>

        {cargando && <p className="text-center text-gray-500">Cargando...</p>}

        {!cargando && misArticulos.length === 0 && (
          <EstadoVacio mensaje="Todavía no has publicado ningún artículo." enlaceA="/publicar" enlaceTexto="Publicar mi primer artículo" icono="fa-plus" />
        )}
      </main>
    </>
  );
}
