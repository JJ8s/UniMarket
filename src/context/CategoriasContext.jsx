import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cargarCategorias } from '../data/datos';

const CategoriasContext = createContext({ categorias: [], opciones: [], etiquetaCategoria: (v) => v, recargar: async () => {} });

/**
 * Categorias cargadas una sola vez desde Supabase y compartidas (catalogo,
 * formularios, footer, tarjetas). Antes cada componente las leia de
 * localStorage al instante; ahora la consulta es asincrona, asi que se
 * guarda aqui para no repetirla por cada tarjeta. El panel de admin llama
 * a recargar() despues de crear, editar o borrar una categoria.
 */
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
    // Nombre visible de una categoria (si ya no existe, devuelve el valor tal cual).
    const etiquetaCategoria = (v) => categorias.find((c) => c.valor === v)?.etiqueta ?? v;
    return { categorias, opciones, etiquetaCategoria, recargar };
  }, [categorias, recargar]);

  return <CategoriasContext.Provider value={valor}>{children}</CategoriasContext.Provider>;
}

export function useCategorias() {
  return useContext(CategoriasContext);
}
