/** Alerta roja de Bootstrap; no se pinta nada si no hay mensaje. */
export default function MensajeError({ mensaje }) {
  if (!mensaje) return null;
  return <div className="alert alert-danger py-2" role="alert">{mensaje}</div>;
}
