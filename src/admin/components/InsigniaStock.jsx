import { UMBRAL_STOCK_CRITICO } from '../../data/datos';

/** Muestra el stock con color: rojo si esta agotado, amarillo si es critico, verde si esta bien. */
export default function InsigniaStock({ stock, umbral = UMBRAL_STOCK_CRITICO }) {
  const unidades = stock ?? 0;
  const color = unidades === 0 ? 'danger' : unidades <= umbral ? 'warning' : 'success';
  const texto = unidades === 0 ? 'Agotado' : `${unidades} u.`;
  return <span className={`badge text-bg-${color}`}>{texto}</span>;
}
