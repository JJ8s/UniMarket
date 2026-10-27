import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROL_ADMIN } from '../data/datos';

export default function GuardiaRuta({ requiereSesion, rol }) {
  const { usuario, cargando } = useAuth();

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
