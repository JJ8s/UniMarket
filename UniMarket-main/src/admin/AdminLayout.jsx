import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import bootstrapCssUrl from 'bootstrap/dist/css/bootstrap.min.css?url';
import { useAuth } from '../context/AuthContext';
import useBodyClass from '../hooks/useBodyClass';
import './admin.css';

// Secciones del menu lateral (Figura 9 del anexo). `fin` hace que el enlace
// "Dashboard" solo se marque activo en /admin y no en todas las subrutas.
const SECCIONES = [
  { a: '/admin', texto: 'Dashboard', icono: 'fa-gauge', fin: true },
  { a: '/admin/ordenes', texto: 'Órdenes', icono: 'fa-receipt' },
  { a: '/admin/productos', texto: 'Productos', icono: 'fa-box' },
  { a: '/admin/categorias', texto: 'Categorías', icono: 'fa-tags' },
  { a: '/admin/usuarios', texto: 'Usuarios', icono: 'fa-users' },
  { a: '/admin/reportes', texto: 'Reportes', icono: 'fa-chart-column' },
];

/**
 * Marco de todo el panel /admin: barra superior, menu lateral y, en el
 * centro, la pagina que corresponda a la ruta (<Outlet />).
 *
 * Bootstrap solo se carga mientras el administrador esta en /admin: se agrega
 * un <link> al entrar y se quita al salir. Asi no choca con los estilos de la
 * tienda (que usa Tailwind y CSS propio) ni los altera.
 */
export default function AdminLayout() {
  useBodyClass('admin-body');
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false); // solo se usa en pantallas chicas
  const [bootstrapListo, setBootstrapListo] = useState(false);

  useEffect(() => {
    const enlace = document.createElement('link');
    enlace.rel = 'stylesheet';
    enlace.href = bootstrapCssUrl;
    enlace.onload = () => setBootstrapListo(true);
    enlace.onerror = () => setBootstrapListo(true); // si falla, se muestra igual
    document.head.appendChild(enlace);
    return () => enlace.remove();
  }, []);

  const cerrarSesion = () => {
    logout();
    navigate('/login');
  };

  // Mientras Bootstrap carga no se pinta nada, para evitar un parpadeo sin estilos.
  if (!bootstrapListo) return null;

  return (
    <div className="admin-shell">
      <header className="admin-topbar d-print-none">
        <button
          type="button"
          className="btn btn-outline-light btn-sm d-lg-none"
          aria-label="Abrir menú"
          onClick={() => setMenuAbierto((valor) => !valor)}
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <Link to="/admin" className="admin-marca">UniMarket Admin</Link>
        <span className="ms-auto small text-white-50 d-none d-sm-inline">{usuario.nombre}</span>
      </header>

      {menuAbierto && <div className="admin-fondo-menu d-lg-none" onClick={() => setMenuAbierto(false)}></div>}

      <aside className={`admin-sidebar d-print-none ${menuAbierto ? 'abierto' : ''}`}>
        <nav className="nav flex-column gap-1">
          {SECCIONES.map(({ a, texto, icono, fin }) => (
            <NavLink key={a} to={a} end={fin} className="admin-enlace" onClick={() => setMenuAbierto(false)}>
              <i className={`fa-solid ${icono}`}></i> {texto}
            </NavLink>
          ))}
        </nav>

        <hr className="border-secondary" />
        <NavLink to="/admin/perfil" className="admin-enlace" onClick={() => setMenuAbierto(false)}>
          <i className="fa-solid fa-user"></i> Perfil
        </NavLink>

        <div className="d-grid gap-2 mt-4">
          <Link to="/" className="btn btn-dark btn-sm">
            <i className="fa-solid fa-store"></i> Tienda
          </Link>
          <button type="button" className="btn btn-danger btn-sm" onClick={cerrarSesion}>
            <i className="fa-solid fa-right-from-bracket"></i> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-contenido">
        <Outlet />
      </main>
    </div>
  );
}
