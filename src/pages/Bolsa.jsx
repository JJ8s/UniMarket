import { useEffect, useMemo } from 'react';
import BannerPagina from '../components/BannerPagina';
import EstadoVacio from '../components/EstadoVacio';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { cargarArticulos } from '../data/datos';
import useBodyClass from '../hooks/useBodyClass';
import useConsulta from '../hooks/useConsulta';
import { agruparCarrito, formatearPrecio, lineasAIds, obtenerEstiloImagen } from '../utils/utilidades';

export default function Bolsa() {
  useBodyClass('bolsa-body');
  const navigate = useNavigate();
  const { carrito, reemplazarCarrito } = useCarrito();

  const { datos: articulos, cargando } = useConsulta(cargarArticulos, []);
  const { lineas, hayFantasmas } = useMemo(() => agruparCarrito(carrito, articulos), [carrito, articulos]);

  useEffect(() => {
    if (!cargando && hayFantasmas) reemplazarCarrito(lineasAIds(lineas));
  }, [cargando, hayFantasmas, lineas, reemplazarCarrito]);

  const totalUnidades = lineas.reduce((suma, l) => suma + l.cantidad, 0);
  const total = lineas.reduce((suma, l) => suma + l.articulo.precio * l.cantidad, 0);

  const cambiarCantidad = (idArticulo, delta) => {
    const nuevas = lineas
      .map((l) => (l.articulo.id === idArticulo ? { ...l, cantidad: l.cantidad + delta } : l))
      .filter((l) => l.cantidad > 0);
    reemplazarCarrito(lineasAIds(nuevas));
  };

  const quitar = (idArticulo) => {
    reemplazarCarrito(lineasAIds(lineas.filter((l) => l.articulo.id !== idArticulo)));
  };

  const subtitulo =
    lineas.length === 0
      ? 'Tu bolsa está vacía'
      : `${totalUnidades} artículo${totalUnidades === 1 ? '' : 's'} en tu bolsa`;

  return (
    <>
      <div className="bolsa-header-logo">
        <Logo />
      </div>

      <main className="bolsa-wrapper">
        <BannerPagina titulo="Mi Bolsa" subtitulo={subtitulo} enlaceA="/" enlaceTexto="Seguir comprando" />

        {cargando ? (
          <p className="text-center p-8">Cargando...</p>
        ) : lineas.length === 0 ? (
          <EstadoVacio mensaje="Tu bolsa está vacía." enlaceA="/" enlaceTexto="Ir al catálogo" icono="fa-store" />
        ) : (
          <div className="bolsa-layout">
            <div className="bolsa-lista">
              {lineas.map(({ articulo, cantidad }) => (
                <article className="bolsa-item" key={articulo.id}>
                  <div className="bolsa-item-imagen" style={obtenerEstiloImagen(articulo)}></div>
                  <div className="bolsa-item-info">
                    <p className="bolsa-item-nombre">{articulo.nombre}</p>
                    <p className="bolsa-item-meta">{articulo.vendedor || 'Vendedor'} · {articulo.universidad || ''}</p>
                    <p className="bolsa-item-precio-unitario">{formatearPrecio(articulo.precio)} c/u</p>
                  </div>
                  <div className="bolsa-item-acciones">
                    <p className="bolsa-item-subtotal">{formatearPrecio(articulo.precio * cantidad)}</p>
                    <div className="stepper-cantidad">
                      <button type="button" aria-label="Quitar una unidad" onClick={() => cambiarCantidad(articulo.id, -1)}>−</button>
                      <span>{cantidad}</span>
                      <button type="button" aria-label="Agregar una unidad" onClick={() => cambiarCantidad(articulo.id, 1)}>+</button>
                    </div>
                    <button type="button" className="bolsa-item-quitar" onClick={() => quitar(articulo.id)}>
                      <i className="fa-solid fa-trash"></i> Quitar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="bolsa-resumen">
              <h2>Resumen del pedido</h2>
              <div className="resumen-linea">
                <span>Artículos ({totalUnidades})</span>
                <span>{formatearPrecio(total)}</span>
              </div>
              <div className="resumen-linea total">
                <span>Total</span>
                <span>{formatearPrecio(total)}</span>
              </div>
              <button className="btn-checkout" onClick={() => navigate('/pago')}>
                <i className="fa-solid fa-lock"></i> Proceder al pago
              </button>
              <p className="checkout-nota">Pago simulado: no se realiza ningún cobro real.</p>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
