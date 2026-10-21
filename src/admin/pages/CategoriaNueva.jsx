import { useNavigate } from 'react-router-dom';
import { crearCategoria } from '../../data/datos';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FormularioCategoria from '../components/FormularioCategoria';

/** "Nueva categoria". */
export default function CategoriaNueva() {
  const navigate = useNavigate();

  const guardar = (datos) => {
    const resultado = crearCategoria(datos);
    if (resultado.ok) navigate('/admin/categorias');
    return resultado;
  };

  return (
    <>
      <EncabezadoPagina titulo="Nueva categoría" />
      <FormularioCategoria onGuardar={guardar} textoBoton="Crear categoría" />
    </>
  );
}
