import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import useBodyClass from '../hooks/useBodyClass';
import useMisArticulos from '../hooks/useMisArticulos';
import { obtenerEstiloImagen } from '../utils/utilidades';

// Pedidos de ejemplo: todavia no existe un sistema real de pedidos/compras.
const PEDIDOS_EJEMPLO = [
  { id: 'ORD-001', producto: 'Brownies de...', comprador: 'Juan P.', entrega: 'Patio de Ingeniería' },
  { id: 'ORD-002', producto: 'Calculadora...', comprador: 'Ana L.', entrega: 'Biblioteca Central' },
];

export default function PanelVendedor() {
  useBodyClass('bg-surface');
  const { usuario } = useAuth();
  const { misArticulos, borrarArticulo, alternarDisponibilidad, cargando } = useMisArticulos(usuario.id);

  // Calificacion promedio de los articulos del vendedor (solo los calificados)
  const conCalificacion = misArticulos.filter((a) => typeof a.calificacion === 'number' && a.calificacion > 0);
  const promedio = conCalificacion.length
    ? conCalificacion.reduce((suma, a) => suma + a.calificacion, 0) / conCalificacion.length
    : null;

  return (
    <>
      <Header conBusqueda />

      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        <h2 className="panel-titulo text-3xl font-bold">
          <i className="fa-solid fa-shop"></i> Panel de Vendedor
        </h2>

        {/* ----- Estadisticas ----- */}
        <section className="stats-grid">
          <div className="stat-card">
            <div>
              <p className="stat-label">Ventas del mes</p>
              <p className="stat-value">$145.00</p>
            </div>
            <div className="stat-icon-circle verde"><i className="fa-solid fa-arrow-trend-up"></i></div>
          </div>

          <div className="stat-card">
            <div>
              <p className="stat-label">Pedidos por entregar hoy</p>
              <p className="stat-value">3</p>
            </div>
            <div className="stat-icon-circle azul"><i className="fa-regular fa-calendar"></i></div>
          </div>

          <div className="stat-card">
            <div>
              <p className="stat-label">Calificación promedio</p>
              <p className="stat-value">
                {promedio === null ? 'Sin datos' : <>{promedio.toFixed(1)} <i className="fa-solid fa-star"></i></>}
              </p>
            </div>
            <div className="stat-icon-circle ambar"><i className="fa-solid fa-check"></i></div>
          </div>
        </section>
        <p className="stats-nota">* "Ventas del mes" y "Pedidos por entregar hoy" son datos de ejemplo: se conectarán con datos reales cuando exista un sistema de pedidos/compras. "Calificación promedio" ya se calcula con tus artículos publicados.</p>

        <div className="panel-layout">
          {/* ----- Pedidos activos (ejemplo) ----- */}
          <section>
            <h3 className="panel-seccion-titulo">Pedidos Activos</h3>
            <div className="tabla-wrapper">
              <table className="tabla-pedidos">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Comprador</th>
                    <th>Entrega</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {PEDIDOS_EJEMPLO.map((pedido) => (
                    <tr key={pedido.id}>
                      <td>
                        <p className="pedido-producto-nombre">{pedido.producto}</p>
                        <p className="pedido-producto-id">{pedido.id}</p>
                      </td>
                      <td>{pedido.comprador}</td>
                      <td><span className="pedido-entrega"><i className="fa-solid fa-location-dot"></i> {pedido.entrega}</span></td>
                      <td><span className="estado-pill pendiente"><i className="fa-regular fa-clock"></i> Pendiente</span></td>
                      <td><button className="btn-accion-pedido" title="Próximamente" disabled><i className="fa-solid fa-ellipsis-vertical"></i></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ----- Inventario rapido (real) ----- */}
          <section>
            <h3 className="panel-seccion-titulo">Inventario Rápido</h3>
            <div className="inventario-card">
              <div>
                {misArticulos.map((articulo) => {
                  const disponible = (articulo.stock ?? 0) > 0;
                  return (
                    <div className="inventario-item" key={articulo.id}>
                      <div className="inventario-swatch" style={obtenerEstiloImagen(articulo)}></div>
                      <div className="inventario-info">
                        <p className="inventario-nombre">{articulo.nombre}</p>
                        <p className="inventario-precio">${Number(articulo.precio).toFixed(2)}</p>
                      </div>
                      <div className="inventario-controles">
                        <span className={`inventario-estado-texto ${disponible ? 'disponible' : 'agotado'}`}>
                          {disponible ? 'Disponible' : 'Agotado'}
                        </span>
                        <label
                          className="switch-disponibilidad"
                          title={`Marcar como ${disponible ? 'agotado' : 'disponible'} (no borra el producto)`}
                        >
                          <input
                            type="checkbox"
                            checked={disponible}
                            onChange={() => alternarDisponibilidad(articulo.id)}
                          />
                          <span className="switch-slider"></span>
                        </label>
                        <button
                          type="button"
                          className="btn-borrar-inventario"
                          title="Borrar publicación por completo"
                          onClick={() =>
                            borrarArticulo(articulo.id, '¿Seguro que quieres borrar esta publicación por completo? Esta acción no se puede deshacer.')
                          }
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {cargando && <p className="inventario-vacio">Cargando...</p>}

              {!cargando && misArticulos.length === 0 && (
                <p className="inventario-vacio">
                  Todavía no has publicado ningún artículo.<br />
                  <Link to="/publicar" style={{ color: '#1A365D', fontWeight: 600 }}>Publica tu primer artículo</Link>
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
