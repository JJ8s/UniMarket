import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCategorias } from '../../context/CategoriasContext';
import { actualizarCategoria, obtenerCategoria } from '../../data/datos';
import useConsulta from '../../hooks/useConsulta';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FormularioCategoria from '../components/FormularioCategoria';

/** "Editar categoria" */
export default function CategoriaEditar() {
  const { valor } = useParams();
  const navigate = useNavigate();
  const { recargar: recargarCategorias } = useCategorias();
  const { datos: categoria, cargando } = useConsulta(() => obtenerCategoria(valor), null, [valor]);

  if (cargando) return <p className="text-secondary">Cargando...</p>;

  if (!categoria) {
    return (
      <>
        <EncabezadoPagina titulo="Categoría no encontrada" />
        <Link to="/admin/categorias" className="btn btn-outline-secondary">Volver a categorías</Link>
      </>
    );
  }

  const guardar = async (datos) => {
    const resultado = await actualizarCategoria(categoria.valor, datos);
    if (resultado.ok) {
      await recargarCategorias();
      navigate('/admin/categorias');
    }
    return resultado;
  };

  return (
    <>
      <EncabezadoPagina titulo="Editar categoría" subtitulo={categoria.etiqueta} />
      <FormularioCategoria valorInicial={categoria} onGuardar={guardar} textoBoton="Guardar cambios" />
    </>
  );
}
