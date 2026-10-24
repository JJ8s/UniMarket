import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cerrarSesion, iniciarSesion, obtenerSesion, suscribirSesion } from '../data/datos';

const AuthContext = createContext(null);

/**
 * Sesion activa compartida por toda la app (Supabase Auth). `usuario` es el
 * perfil completo (nombre, correo, rol, foto...) o null si no hay sesion.
 * Mientras se consulta la sesion al abrir la app, `cargando` es true: las
 * rutas protegidas esperan a que termine antes de decidir si redirigir.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  /** Vuelve a leer el perfil (despues de editar nombre, foto, etc.). */
  const refrescarUsuario = useCallback(async () => {
    try {
      setUsuario(await obtenerSesion());
    } catch {
      setUsuario(null); // por ejemplo, Supabase sin configurar
    }
  }, []);

  useEffect(() => {
    let activo = true;
    refrescarUsuario().finally(() => activo && setCargando(false));

    // Si la sesion se cierra o expira en otra pestana, esta pestana se entera.
    let dejarDeEscuchar = () => {};
    try {
      dejarDeEscuchar = suscribirSesion((haySesion) => {
        if (!haySesion) setUsuario(null);
      });
    } catch {
      // sin configuracion no hay a quien escuchar
    }
    return () => {
      activo = false;
      dejarDeEscuchar();
    };
  }, [refrescarUsuario]);

  /** Inicia sesion. Devuelve { ok, usuario } o { ok:false, mensaje }. */
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
