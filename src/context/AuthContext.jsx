import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cerrarSesion, iniciarSesion, obtenerSesion } from '../data/datos';

const AuthContext = createContext(null);

/**
 * Sesion activa compartida por toda la app. Reemplaza los chequeos
 * `haySesionActiva()` + `window.location.href = 'login.html'` que cada
 * pagina hacia por su cuenta.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => obtenerSesion());

  const login = useCallback((datosUsuario) => {
    iniciarSesion(datosUsuario);
    setUsuario(obtenerSesion());
  }, []);

  const logout = useCallback(() => {
    cerrarSesion();
    setUsuario(null);
  }, []);

  const valor = useMemo(() => ({ usuario, login, logout }), [usuario, login, logout]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
