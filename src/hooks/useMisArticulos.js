import { useCallback, useState } from 'react';
import { cargarArticulos, guardarArticulos } from '../data/datos';

/**
 * Articulos publicados por el usuario con sesion activa (los que tienen
 * `vendedor === nombre`). Lo usan pedidos.html y panel-vendedor.html, que
 * antes duplicaban esta logica.
 */
export default function useMisArticulos(nombreVendedor) {
  const [articulos, setArticulos] = useState(() => cargarArticulos());

  const misArticulos = articulos
    .filter((articulo) => articulo.vendedor === nombreVendedor)
    .sort((a, b) => b.creadoEn - a.creadoEn);

  const persistir = useCallback((nuevos) => {
    guardarArticulos(nuevos);
    setArticulos(nuevos);
  }, []);

  /** Borra un articulo por completo (pide confirmacion). */
  const borrarArticulo = useCallback(
    (idArticulo, mensaje) => {
      if (!window.confirm(mensaje)) return;
      persistir(articulos.filter((a) => a.id !== idArticulo));
    },
    [articulos, persistir]
  );

  /**
   * Disponible <-> Agotado sin borrar:
   *  - a Agotado: guarda el stock en stockGuardado y deja stock en 0.
   *  - a Disponible: restaura stockGuardado (o 1 si no habia).
   */
  const alternarDisponibilidad = useCallback(
    (idArticulo) => {
      persistir(
        articulos.map((articulo) => {
          if (articulo.id !== idArticulo) return articulo;
          if ((articulo.stock ?? 0) > 0) {
            return { ...articulo, stockGuardado: articulo.stock, stock: 0 };
          }
          const restaurado = articulo.stockGuardado > 0 ? articulo.stockGuardado : 1;
          return { ...articulo, stock: restaurado };
        })
      );
    },
    [articulos, persistir]
  );

  return { misArticulos, borrarArticulo, alternarDisponibilidad };
}
