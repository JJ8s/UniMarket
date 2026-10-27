import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cargarCategorias } from '../data/datos';

const CategoriasContext = createContext({ categorias: [], opciones: [], etiquetaCategoria: (v) => v, recargar: async () => {} });

export function CategoriasProvider({ children }) {
  const [categorias, setCategorias] = useState([]);

  const recargar = useCallback(async () => {
    try {
      setCategorias(await cargarCategorias());
    } catch {
      setCategorias([]);
    }
  }, []);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const valor = useMemo(() => {
    const opciones = categorias.map(({ valor: v, etiqueta }) => ({ valor: v, etiqueta }));
    const etiquetaCategoria = (v) => categorias.find((c) => c.valor === v)?.etiqueta ?? v;
    return { categorias, opciones, etiquetaCategoria, recargar };
  }, [categorias, recargar]);

  return <CategoriasContext.Provider value={valor}>{children}</CategoriasContext.Provider>;
}

export function useCategorias() {
  return useContext(CategoriasContext);
}
