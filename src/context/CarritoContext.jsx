import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cargarCarrito, guardarCarrito } from '../data/datos';

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => cargarCarrito());

  const reemplazarCarrito = useCallback((nuevosIds) => {
    guardarCarrito(nuevosIds);
    setCarrito(nuevosIds);
  }, []);

  const agregarAlCarrito = useCallback((idArticulo) => {
    setCarrito((anterior) => {
      const nuevo = [...anterior, idArticulo];
      guardarCarrito(nuevo);
      return nuevo;
    });
  }, []);

  const vaciarCarrito = useCallback(() => reemplazarCarrito([]), [reemplazarCarrito]);

  const valor = useMemo(
    () => ({ carrito, agregarAlCarrito, reemplazarCarrito, vaciarCarrito }),
    [carrito, agregarAlCarrito, reemplazarCarrito, vaciarCarrito]
  );
  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
  return useContext(CarritoContext);
}
