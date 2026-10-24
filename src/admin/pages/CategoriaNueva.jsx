import { useNavigate } from 'react-router-dom';
import { useCategorias } from '../../context/CategoriasContext';
import { crearCategoria } from '../../data/datos';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FormularioCategoria from '../components/FormularioCategoria';

/** "Nueva categoria". */
export default function CategoriaNueva() {
  const navigate = useNavigate();
  const { recargar: recargarCategorias } = useCategorias();

  const guardar = async (datos) => {
    const resultado = await crearCategoria(datos);
    if (resultado.ok) {
      await recargarCategorias(); // la tienda y los formularios ven la categoria nueva
      navigate('/admin/categorias');
    }
    return resultado;
  };

  return (
    <>
      <EncabezadoPagina titulo="Nueva categoría" />
      <FormularioCategoria onGuardar={guardar} textoBoton="Crear categoría" />
    </>
  );
}
