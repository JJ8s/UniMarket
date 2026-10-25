import { useCallback, useState } from 'react';

/**
 * Lee datos con la funcion `cargar` (ej. cargarOrdenes) y devuelve
 * [datos, recargar]. Se llama a recargar() despues de crear, editar o
 * borrar para que la tabla se vuelva a pintar con lo que quedo guardado.
 */
export default function useRecarga(cargar) {
  const [datos, setDatos] = useState(() => cargar());
  const recargar = useCallback(() => setDatos(cargar()), [cargar]);
  return [datos, recargar];
}
