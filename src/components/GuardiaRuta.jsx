import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROL_ADMIN, esAdmin } from '../data/datos';

/**
 * Decide quien puede entrar a un grupo de rutas (se usa en App.jsx):
 *   <GuardiaRuta requiereSesion />          -> solo con sesion; si no, va al login
 *   <GuardiaRuta requiereSesion rol="admin" /> -> solo administradores; un cliente vuelve al catalogo
 *   <GuardiaRuta requiereSesion={false} />  -> solo sin sesion (login/registro); si ya hay,
 *                                              un cliente va al catalogo y un admin al panel
 *
 * El rol se verifica contra la lista de usuarios (esAdmin) y no solo contra
 * lo guardado en la sesion. Sigue siendo localStorage, o sea que no es
 * seguridad real: un backend deberia validar el rol en cada peticion.
 */
export default function GuardiaRuta({ requiereSesion, rol }) {
  const { usuario } = useAuth();

  if (requiereSesion) {
    if (!usuario) return <Navigate to="/login" replace />;
    if (rol === ROL_ADMIN && !esAdmin(usuario.correo)) return <Navigate to="/" replace />;
    return <Outlet />;
  }

  if (usuario) {
    return <Navigate to={esAdmin(usuario.correo) ? '/admin' : '/'} replace />;
  }
  return <Outlet />;
}
