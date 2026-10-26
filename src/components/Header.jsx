import { Link } from 'react-router-dom';
import Logo from './Logo';
import MenuPerfil from './MenuPerfil';
import { useCarrito } from '../context/CarritoContext';

export default function Header({ conBusqueda = false, busqueda, onBusqueda }) {
  const { carrito } = useCarrito();
  const controlado = busqueda !== undefined;

  return (
    <header className="bg-white shadow-sm p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      <h1 className="text-2xl font-bold text-primary flex items-center">
        <Logo imgClassName="h-10 w-auto" />
      </h1>

      {conBusqueda && (
        <form className="search-form flex-1 max-w-xl" onSubmit={(evento) => evento.preventDefault()}>
          <input
            type="search"
            name="q"
            placeholder="Buscar snacks, ropa, tecnología..."
            {...(controlado ? { value: busqueda } : {})}
            onChange={(evento) => onBusqueda && onBusqueda(evento.target.value)}
          />
          <button type="submit">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
        </form>
      )}

      <div className={`flex items-center gap-3 ${conBusqueda ? '' : 'ml-auto'}`}>
        <MenuPerfil />

        <Link to="/bolsa" className="relative">
          <img src="/img/ayqmoverelcacharro.png" alt="Carrito" className="w-7 h-7" />
          <span className="absolute -top-1 -right-2 bg-accent text-white text-xs font-bold rounded-full px-1.5">
            {carrito.length}
          </span>
        </Link>
      </div>
    </header>
  );
}
