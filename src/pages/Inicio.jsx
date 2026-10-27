import { useAuth } from '../context/AuthContext';
import Catalogo from './Catalogo';
import QuienesSomos from './QuienesSomos';

export default function Inicio() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p className="p-8 text-center text-gray-500">Cargando...</p>;
  return usuario ? <Catalogo /> : <QuienesSomos />;
}
