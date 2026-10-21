import { Link, useNavigate, useParams } from 'react-router-dom';
import { actualizarCategoria, obtenerCategoria } from '../../data/datos';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FormularioCategoria from '../components/FormularioCategoria';

/** "Editar categoria". */
export default function CategoriaEditar() {
  const { valor } = useParams();
  const navigate = useNavigate();
  const categoria = obtenerCategoria(valor);

  if (!categoria) {
    return (
      <>
        <EncabezadoPagina titulo="Categoría no encontrada" />
        <Link to="/admin/categorias" className="btn btn-outline-secondary">Volver a categorías</Link>
      </>
    );
  }

  const guardar = (datos) => {
    const resultado = actualizarCategoria(categoria.valor, datos);
    if (resultado.ok) navigate('/admin/categorias');
    return resultado;
  };

  return (
    <>
      <EncabezadoPagina titulo="Editar categoría" subtitulo={categoria.etiqueta} />
      <FormularioCategoria valorInicial={categoria} onGuardar={guardar} textoBoton="Guardar cambios" />
    </>
  );
}
