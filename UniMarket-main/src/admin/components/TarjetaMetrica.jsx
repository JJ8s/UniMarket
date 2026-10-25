/** Tarjeta de color con una cifra grande (Compras, Productos, Usuarios del dashboard). */
export default function TarjetaMetrica({ titulo, valor, detalle, icono, color }) {
  return (
    <div className={`card admin-metrica text-bg-${color} h-100`}>
      <div className="card-body d-flex align-items-center justify-content-between">
        <div>
          <div className="small">{titulo}</div>
          <div className="fs-3 fw-bold">{valor}</div>
          <div className="small opacity-75">{detalle}</div>
        </div>
        <i className={`fa-solid ${icono} admin-metrica-icono`}></i>
      </div>
    </div>
  );
}
