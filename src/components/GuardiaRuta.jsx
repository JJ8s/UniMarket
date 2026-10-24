import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROL_ADMIN } from '../data/datos';

/**
 * Decide quien puede entrar a un grupo de rutas (se usa en App.jsx):
 *   <GuardiaRuta requiereSesion />          -> solo con sesion; si no, va al login
 *   <GuardiaRuta requiereSesion rol="admin" /> -> solo administradores; un cliente vuelve al catalogo
 *   <GuardiaRuta requiereSesion={false} />  -> solo sin sesion (login/registro); si ya hay,
 *                                              un cliente va al catalogo y un admin al panel
 *
 * El rol sale del perfil guardado en la base (usuario.rol). Esto solo decide
 * que pantalla se muestra: lo que realmente protege los datos son las
 * politicas RLS de Supabase (supabase/esquema.sql), que se aplican en el
 * servidor aunque alguien se salte esta pantalla.
 */
export default function GuardiaRuta({ requiereSesion, rol }) {
  const { usuario, cargando } = useAuth();

  // Al abrir la app todavia no sabemos si hay sesion: no redirigir aun.
  if (cargando) return <p className="p-8 text-center text-gray-500">Cargando...</p>;

  if (requiereSesion) {
    if (!usuario) return <Navigate to="/login" replace />;
    if (rol === ROL_ADMIN && usuario.rol !== ROL_ADMIN) return <Navigate to="/" replace />;
    return <Outlet />;
  }

  if (usuario) {
    return <Navigate to={usuario.rol === ROL_ADMIN ? '/admin' : '/'} replace />;
  }
  return <Outlet />;
}
