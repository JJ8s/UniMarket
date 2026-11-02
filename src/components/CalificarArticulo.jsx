import { useEffect, useRef, useState } from 'react';
import { calificarArticulo, estadoCalificacion } from '../data/datos';

const ETIQUETAS = ['Malo', 'Regular', 'Bueno', 'Muy bueno', 'Excelente'];

/** Estrellas para que el comprador califique el artículo */
export default function CalificarArticulo({ articulo, onCalificado }) {
  const [estado, setEstado] = useState({ cargando: true, puntaje: null, motivo: null });
  const [vista, setVista] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const botones = useRef([]);

  useEffect(() => {
    let activo = true;
    setEstado({ cargando: true, puntaje: null, motivo: null });
    estadoCalificacion(articulo.id).then((r) => {
      if (!activo) return;
      setEstado(r.ok
        ? { cargando: false, puntaje: r.puntaje, motivo: r.motivo }
        : { cargando: false, puntaje: null, motivo: r.mensaje });
    });
    return () => { activo = false; };
  }, [articulo.id]);

  const bloqueado = estado.cargando || Boolean(estado.motivo) || guardando;
  const mostrado = vista || estado.puntaje || 0;

  const elegir = async (puntaje) => {
    if (bloqueado) return;
    if (puntaje === estado.puntaje) {
      setMensaje({ tipo: 'info', texto: `Ya calificaste este artículo con ${puntaje} ${puntaje === 1 ? 'estrella' : 'estrellas'}.` });
      return;
    }
    setMensaje(null);
    setVista(puntaje);
    setGuardando(true);
    const r = await calificarArticulo(articulo.id, puntaje);
    setGuardando(false);
    setVista(0);
    if (!r.ok) {
      setMensaje({ tipo: 'error', texto: r.mensaje });
      return;
    }
    setEstado((anterior) => ({ ...anterior, puntaje }));
    setMensaje({ tipo: 'ok', texto: estado.puntaje ? '¡Listo! Actualizamos tu calificación.' : '¡Gracias! Tu calificación quedó guardada.' });
    if (onCalificado) onCalificado(r.articulo);
  };

  const alTeclear = (evento, indice) => {
    const pasos = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    let destino = null;
    if (pasos[evento.key]) destino = Math.min(4, Math.max(0, indice + pasos[evento.key]));
    if (evento.key === 'Home') destino = 0;
    if (evento.key === 'End') destino = 4;
    if (destino === null) return;
    evento.preventDefault();
    botones.current[destino]?.focus();
  };

  let etiqueta = 'Toca una estrella para calificar';
  if (estado.cargando) etiqueta = 'Cargando tu calificación...';
  else if (guardando) etiqueta = 'Guardando...';
  else if (estado.motivo) etiqueta = estado.motivo;
  else if (vista) etiqueta = `${vista} ${vista === 1 ? 'estrella' : 'estrellas'} · ${ETIQUETAS[vista - 1]}`;
  else if (estado.puntaje) etiqueta = `Tu calificación: ${estado.puntaje} ${estado.puntaje === 1 ? 'estrella' : 'estrellas'} · ${ETIQUETAS[estado.puntaje - 1]}`;

  const foco = estado.puntaje || 1;

  return (
    <div className={`calificar ${estado.motivo ? 'calificar-bloqueado' : ''}`}>
      <p className="calificar-titulo">{estado.puntaje ? 'Tu calificación' : 'Califica este artículo'}</p>

      <div className="calificar-estrellas" role="radiogroup" aria-label="Tu calificación" onMouseLeave={() => setVista(0)}>
        {[1, 2, 3, 4, 5].map((n, indice) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={estado.puntaje === n}
            aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}, ${ETIQUETAS[n - 1]}`}
            tabIndex={n === foco ? 0 : -1}
            disabled={bloqueado}
            ref={(el) => { botones.current[indice] = el; }}
            className={`calificar-estrella ${n <= mostrado ? 'activa' : ''}`}
            onMouseEnter={() => !bloqueado && setVista(n)}
            onFocus={() => !bloqueado && setVista(n)}
            onBlur={() => setVista(0)}
            onKeyDown={(e) => alTeclear(e, indice)}
            onClick={() => elegir(n)}
          >
            ★
          </button>
        ))}
      </div>

      <p className="calificar-etiqueta" aria-live="polite">{etiqueta}</p>
      {mensaje && (
        <p className={`calificar-mensaje calificar-mensaje-${mensaje.tipo}`} role={mensaje.tipo === 'error' ? 'alert' : 'status'}>
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}
