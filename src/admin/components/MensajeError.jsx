/** Alerta roja */
export default function MensajeError({ mensaje }) {
  if (!mensaje) return null;
  return <div className="alert alert-danger py-2" role="alert">{mensaje}</div>;
}
