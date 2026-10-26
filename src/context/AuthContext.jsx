import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cerrarSesion, iniciarSesion, obtenerSesion, suscribirSesion } from '../data/datos';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  /** Vuelve a leer el perfil */
  const refrescarUsuario = useCallback(async () => {
    try {
      setUsuario(await obtenerSesion());
    } catch {
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    let activo = true;
    refrescarUsuario().finally(() => activo && setCargando(false));

    let dejarDeEscuchar = () => {};
    try {
      dejarDeEscuchar = suscribirSesion((haySesion) => {
        if (!haySesion) setUsuario(null);
      });
    } catch {
    }
    return () => {
      activo = false;
      dejarDeEscuchar();
    };
  }, [refrescarUsuario]);

  /** Inicia sesion */
  const login = useCallback(async (correo, contrasena) => {
    const resultado = await iniciarSesion(correo, contrasena);
    if (resultado.ok) setUsuario(resultado.usuario);
    return resultado;
  }, []);

  const logout = useCallback(async () => {
    await cerrarSesion();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, login, logout, refrescarUsuario }),
    [usuario, cargando, login, logout, refrescarUsuario]
  );
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
