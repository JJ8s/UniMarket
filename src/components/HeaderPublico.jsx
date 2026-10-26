import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function HeaderPublico() {
  return (
    <header className="bg-white shadow-sm p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-primary flex items-center">
        <Logo imgClassName="h-10 w-auto" />
      </h1>
      <nav className="flex items-center gap-3">
        <Link to="/login" className="qs-enlace-nav">Iniciar sesión</Link>
        <Link to="/registro" className="qs-btn qs-btn-principal">Crear cuenta</Link>
      </nav>
    </header>
  );
}
