// Color de la insignia segun el estado de la orden
const COLOR_POR_ESTADO = { Pagada: 'success', Pendiente: 'warning', Anulada: 'secondary' };

export default function InsigniaEstadoOrden({ estado }) {
  return <span className={`badge text-bg-${COLOR_POR_ESTADO[estado] || 'light'}`}>{estado}</span>;
}
