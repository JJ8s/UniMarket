import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROL_ADMIN } from '../data/datos';

export default function MenuPerfil() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;

    const alHacerClick = (evento) => {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target)) {
        setAbierto(false);
      }
    };
    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') setAbierto(false);
    };

    document.addEventListener('click', alHacerClick);
    document.addEventListener('keydown', alPresionarTecla);
    return () => {
      document.removeEventListener('click', alHacerClick);
      document.removeEventListener('keydown', alPresionarTecla);
    };
  }, [abierto]);

  const salir = async (evento) => {
    evento.preventDefault();
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto((valor) => !valor)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-surface hover:bg-gray-200 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </button>

      {abierto && (
        <div className="profile-dropdown">
          <div className="profile-info">
            <p className="profile-name">{usuario?.nombre || 'Usuario'}</p>
            <p className="profile-username">{usuario?.nombreUsuario || ''}</p>
            <p className="profile-email">{usuario?.correo || ''}</p>
          </div>
          <hr className="profile-divider" />
          <Link to="/perfil" className="profile-menu-item">Ver mi perfil</Link>
          <Link to="/pedidos" className="profile-menu-item">Mis pedidos</Link>
          <Link to="/panel-vendedor" className="profile-menu-item">Panel vendedor</Link>
          <Link to="/quienes-somos" className="profile-menu-item">Quiénes somos</Link>
          {usuario?.rol === ROL_ADMIN && (
            <Link to="/admin" className="profile-menu-item">Administración</Link>
          )}
          <hr className="profile-divider" />
          <a href="#" onClick={salir} className="profile-menu-item profile-menu-item-danger">
            Salir de la sesión
          </a>
        </div>
      )}
    </div>
  );
}
