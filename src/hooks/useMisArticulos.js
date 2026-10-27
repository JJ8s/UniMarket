import { useCallback, useEffect, useState } from 'react';
import { actualizarArticulo, articulosDeVendedor, eliminarArticulo } from '../data/datos';

export default function useMisArticulos(idVendedor) {
  const [misArticulos, setMisArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    setMisArticulos(await articulosDeVendedor(idVendedor));
    setCargando(false);
  }, [idVendedor]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  /** Borra un articulo por completo */
  const borrarArticulo = useCallback(
    async (idArticulo, mensaje) => {
      if (!window.confirm(mensaje)) return;
      const resultado = await eliminarArticulo(idArticulo);
      if (!resultado.ok) alert(resultado.mensaje);
      await recargar();
    },
    [recargar]
  );

  const alternarDisponibilidad = useCallback(
    async (idArticulo) => {
      const articulo = misArticulos.find((a) => a.id === idArticulo);
      if (!articulo) return;
      const cambios =
        (articulo.stock ?? 0) > 0
          ? { stockGuardado: articulo.stock, stock: 0 }
          : { stock: articulo.stockGuardado > 0 ? articulo.stockGuardado : 1 };
      const resultado = await actualizarArticulo(idArticulo, cambios);
      if (!resultado.ok) alert(resultado.mensaje);
      await recargar();
    },
    [misArticulos, recargar]
  );

  return { misArticulos, borrarArticulo, alternarDisponibilidad, cargando };
}
