/** Cinco estrellas con relleno proporcional al promedio */
export default function Estrellas({ valor = 0, cantidad = 0 }) {
  const promedio = Math.max(0, Math.min(5, Number(valor) || 0));
  const texto = promedio > 0 ? promedio.toFixed(1) : 'Sin calificar';
  const detalle = cantidad > 0 ? `${cantidad} ${cantidad === 1 ? 'calificación' : 'calificaciones'}` : '';

  return (
    <span className="estrellas-resumen">
      <span className="estrellas" role="img" aria-label={promedio > 0 ? `${texto} de 5 estrellas` : 'Sin calificaciones'}>
        <span className="estrellas-fondo" aria-hidden="true">★★★★★</span>
        <span className="estrellas-relleno" aria-hidden="true" style={{ width: `${(promedio / 5) * 100}%` }}>★★★★★</span>
      </span>
      <span className="estrellas-numero">{texto}</span>
      {detalle && <span className="estrellas-detalle">({detalle})</span>}
    </span>
  );
}
