import { useEffect, useRef, useState } from 'react';
import Logo from '../components/Logo';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { cargarArticulos, crearOrden } from '../data/datos';
import useBodyClass from '../hooks/useBodyClass';
import { agruparCarrito, formatearPrecio } from '../utils/utilidades';

const PASOS_STEPPER = [
  { numero: 1, etiqueta: 'Método' },
  { numero: 2, etiqueta: 'Datos' },
  { numero: 3, etiqueta: 'Confirmación' },
];

const ETIQUETA_METODO = { credito: 'Crédito', debito: 'Débito' };

// Formatos en vivo
const soloDigitos = (texto, maximo) => texto.replace(/\D/g, '').slice(0, maximo);
const formatearNumeroTarjeta = (texto) => soloDigitos(texto, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
const formatearVencimiento = (texto) => {
  const digitos = soloDigitos(texto, 4);
  return digitos.length >= 3 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
};

export default function Pago() {
  useBodyClass('pago-body');
  const { usuario } = useAuth();
  const { carrito, vaciarCarrito } = useCarrito();

  const [lineasCompra, setLineasCompra] = useState(null);
  useEffect(() => {
    let activo = true;
    cargarArticulos().then((articulos) => {
      if (activo) setLineasCompra(agruparCarrito(carrito, articulos).lineas);
    });
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const totalCompra = (lineasCompra || []).reduce((suma, l) => suma + l.articulo.precio * l.cantidad, 0);

  const [paso, setPaso] = useState(1);
  const [metodo, setMetodo] = useState(null);
  const [tarjeta, setTarjeta] = useState({ numero: '', nombre: '', vencimiento: '', cvv: '' });
  const [error, setError] = useState('');
  const [boleta, setBoleta] = useState(null);
  const temporizador = useRef(null);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  if (lineasCompra === null) return <p className="p-8 text-center">Cargando...</p>;
  if (lineasCompra.length === 0) return <Navigate to="/bolsa" replace />;

  const cambiarTarjeta = (campo, valor) => setTarjeta((anterior) => ({ ...anterior, [campo]: valor }));

  const pasoStepper = paso >= 3 ? 3 : paso;

  const generarBoleta = (numeroLimpio) => ({
    fecha: new Date().toLocaleString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }),
    folio: 'BOL-' + Math.floor(100000 + Math.random() * 900000),
    autorizacion: Math.random().toString(36).slice(2, 8).toUpperCase(),
    ultimosDigitos: numeroLimpio.slice(-4),
  });

  const manejarPago = (evento) => {
    evento.preventDefault();

    const numeroLimpio = tarjeta.numero.replace(/\s/g, '');
    const errores = [];
    if (numeroLimpio.length !== 16) errores.push('El número de tarjeta debe tener 16 dígitos.');
    if (tarjeta.nombre.trim().length < 3) errores.push('Ingresa el nombre del titular.');
    if (!/^\d{2}\/\d{2}$/.test(tarjeta.vencimiento)) errores.push('La fecha de vencimiento debe tener el formato MM/AA.');
    if (tarjeta.cvv.length < 3) errores.push('El CVV debe tener 3 o 4 dígitos.');

    if (errores.length > 0) {
      setError(errores[0]);
      return;
    }
    setError('');
    setPaso(3);

    temporizador.current = setTimeout(async () => {
      const datosBoleta = generarBoleta(numeroLimpio);

      const resultado = await crearOrden({
        lineas: lineasCompra.map(({ articulo, cantidad }) => ({
          idArticulo: articulo.id,
          nombre: articulo.nombre,
          categoria: articulo.categoria,
          vendedor: articulo.vendedor,
          precio: articulo.precio,
          cantidad,
        })),
        metodoPago: ETIQUETA_METODO[metodo],
        ultimosDigitos: datosBoleta.ultimosDigitos,
        autorizacion: datosBoleta.autorizacion,
      });

      if (!resultado.ok) {
        setError(resultado.mensaje || 'No se pudo registrar la compra. Intenta de nuevo.');
        setPaso(2);
        return;
      }

      setBoleta({ ...datosBoleta, folio: resultado.orden.folio });
      setPaso(4);
      vaciarCarrito();
    }, 4500);
  };

  const numeroPreview = soloDigitos(tarjeta.numero, 16).padEnd(16, '•').match(/.{1,4}/g).join(' ');

  return (
    <>
      <div className="pago-header-logo">
        <Logo imgStyle={{ height: '40px' }} />
      </div>

      <div className="pago-container">
        {/* Stepper de progreso */}
        <div className="stepper-pago">
          {PASOS_STEPPER.map(({ numero, etiqueta }) => {
            const estado = numero < pasoStepper ? 'completado' : numero === pasoStepper ? 'activo' : '';
            return (
              <div key={numero} className={`stepper-paso ${estado}`}>
                <div className="stepper-circulo">{numero}</div>
                <span className="stepper-etiqueta">{etiqueta}</span>
                <div className="stepper-linea"></div>
              </div>
            );
          })}
        </div>

        {/* PASO 1 */}
        {paso === 1 && (
          <section>
            <p className="pago-titulo-paso">¿Cómo quieres pagar?</p>
            <div className="metodo-grid">
              <div
                className={`metodo-card ${metodo === 'credito' ? 'seleccionado' : ''}`}
                onClick={() => setMetodo('credito')}
              >
                <i className="fa-solid fa-credit-card"></i>
                <span>Crédito</span>
              </div>
              <div
                className={`metodo-card ${metodo === 'debito' ? 'seleccionado' : ''}`}
                onClick={() => setMetodo('debito')}
              >
                <i className="fa-solid fa-money-check-dollar"></i>
                <span>Débito</span>
              </div>
            </div>
            <button type="button" className="btn-submit" id="btn-continuar-metodo" disabled={!metodo} onClick={() => setPaso(2)}>
              Continuar
            </button>
          </section>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <section>
            <div className="tarjeta-preview">
              <div className="tarjeta-preview-top">
                <div className="tarjeta-preview-chip"></div>
                <span className="tarjeta-preview-metodo">{ETIQUETA_METODO[metodo]}</span>
              </div>
              <p className="tarjeta-preview-numero">{numeroPreview}</p>
              <div className="tarjeta-preview-bottom">
                <div>
                  Titular
                  <strong>{tarjeta.nombre.trim() || 'NOMBRE APELLIDO'}</strong>
                </div>
                <div>
                  Vence
                  <strong>{tarjeta.vencimiento || 'MM/AA'}</strong>
                </div>
              </div>
            </div>

            <form onSubmit={manejarPago} noValidate>
              <div className="form-group">
                <label htmlFor="numero-tarjeta">Número de tarjeta</label>
                <input type="text" id="numero-tarjeta" inputMode="numeric" placeholder="1234 5678 9012 3456" maxLength={19} required
                       value={tarjeta.numero}
                       onChange={(e) => cambiarTarjeta('numero', formatearNumeroTarjeta(e.target.value))} />
              </div>
              <div className="form-group">
                <label htmlFor="nombre-titular">Nombre del titular</label>
                <input type="text" id="nombre-titular" placeholder="Como aparece en la tarjeta" required
                       value={tarjeta.nombre}
                       onChange={(e) => cambiarTarjeta('nombre', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="vencimiento-tarjeta">Vencimiento</label>
                  <input type="text" id="vencimiento-tarjeta" inputMode="numeric" placeholder="MM/AA" maxLength={5} required
                         value={tarjeta.vencimiento}
                         onChange={(e) => cambiarTarjeta('vencimiento', formatearVencimiento(e.target.value))} />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv-tarjeta">CVV</label>
                  <input type="password" id="cvv-tarjeta" inputMode="numeric" placeholder="123" maxLength={4} required
                         value={tarjeta.cvv}
                         onChange={(e) => cambiarTarjeta('cvv', soloDigitos(e.target.value, 4))} />
                </div>
              </div>
              {error && <p className="form-error">{error}</p>}
              <div className="form-actions">
                <button type="button" className="btn-secundario" onClick={() => setPaso(1)}>Atrás</button>
                <button type="submit" className="btn-submit">Pagar <span>{formatearPrecio(totalCompra)}</span></button>
              </div>
            </form>
          </section>
        )}

        {/* PASO 3 */}
        {paso === 3 && (
          <section>
            <div className="pago-procesando">
              <div className="spinner-pago"></div>
              <p>Procesando tu pago, no cierres esta ventana...</p>
            </div>
          </section>
        )}

        {/* PASO 4 */}
        {paso === 4 && boleta && (
          <section>
            <div className="boleta">
              <div className="boleta-encabezado">
                <div className="boleta-check"><i className="fa-solid fa-check"></i></div>
                <h2>¡Pago exitoso!</h2>
                <p>{boleta.fecha}</p>
              </div>

              <div className="boleta-datos">
                <div className="boleta-linea-dato"><span>N° de boleta</span><strong>{boleta.folio}</strong></div>
                <div className="boleta-linea-dato"><span>Cliente</span><strong>{usuario.correo || usuario.nombre || 'Cliente UniMarket'}</strong></div>
                <div className="boleta-linea-dato"><span>Método de pago</span><strong>{ETIQUETA_METODO[metodo]} terminada en {boleta.ultimosDigitos}</strong></div>
                <div className="boleta-linea-dato"><span>Código de autorización</span><strong>{boleta.autorizacion}</strong></div>
              </div>

              <div className="boleta-items">
                {lineasCompra.map(({ articulo, cantidad }) => (
                  <div className="boleta-item" key={articulo.id}>
                    <div>
                      <p className="boleta-item-nombre">{articulo.nombre}</p>
                      <p className="boleta-item-cantidad">{cantidad} × {formatearPrecio(articulo.precio)}</p>
                    </div>
                    <span className="boleta-item-subtotal">{formatearPrecio(articulo.precio * cantidad)}</span>
                  </div>
                ))}
              </div>

              <div className="boleta-total">
                <span>Total pagado</span>
                <span>{formatearPrecio(totalCompra)}</span>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secundario" onClick={() => window.print()}>
                  <i className="fa-solid fa-print"></i> Imprimir
                </button>
                <Link to="/" className="btn-submit" style={{ flex: 2, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Volver al inicio
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
