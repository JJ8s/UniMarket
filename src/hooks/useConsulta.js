import { useCallback, useEffect, useRef, useState } from 'react';

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
