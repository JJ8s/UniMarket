import { useNavigate } from 'react-router-dom';
import { crearArticulo } from '../../data/datos';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FormularioProducto from '../components/FormularioProducto';

/** "Nuevo producto" */
export default function ProductoNuevo() {
  const navigate = useNavigate();

  const guardar = async (datos) => {
    const resultado = await crearArticulo(datos);
    if (resultado.ok) navigate(`/admin/productos/${resultado.articulo.id}`);
    return resultado;
  };

  return (
    <>
      <EncabezadoPagina titulo="Nuevo producto" subtitulo="Los campos con * son obligatorios" />
      <FormularioProducto onGuardar={guardar} textoBoton="Crear producto" />
    </>
  );
}
