import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Ejecuta una funcion asincrona de datos.js al montar el componente (y cada
 * vez que cambie `dependencias`) y devuelve { datos, cargando, recargar }.
 *
 *   const { datos: ordenes, cargando, recargar } = useConsulta(cargarOrdenes, [], []);
 *
 * - `valorInicial` es lo que se usa mientras llega la respuesta (ej. [] o null).
 * - Se llama a recargar() despues de crear, editar o borrar para volver a pedir los datos.
 * - Si el componente se desmonta antes de que llegue la respuesta, se ignora.
 */
export default function useConsulta(cargar, valorInicial = null, dependencias = []) {
  const [datos, setDatos] = useState(valorInicial);
  const [cargando, setCargando] = useState(true);
  const montado = useRef(true);
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const recargar = useCallback(async () => {
    setCargando(true);
    let resultado = valorInicial;
    try {
      resultado = await cargarRef.current();
    } catch {
      // se queda con el valor inicial (por ejemplo, sin conexion)
    }
    if (montado.current) {
      setDatos(resultado);
      setCargando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  return { datos, cargando, recargar };
}
