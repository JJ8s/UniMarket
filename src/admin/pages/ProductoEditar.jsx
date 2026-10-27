import { Link, useNavigate, useParams } from 'react-router-dom';
import { actualizarArticulo, obtenerArticulo } from '../../data/datos';
import useConsulta from '../../hooks/useConsulta';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FormularioProducto from '../components/FormularioProducto';

/** "Editar producto" */
export default function ProductoEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { datos: articulo, cargando } = useConsulta(() => obtenerArticulo(id), null, [id]);

  if (cargando) return <p className="text-secondary">Cargando...</p>;

  if (!articulo) {
    return (
      <>
        <EncabezadoPagina titulo="Producto no encontrado" />
        <Link to="/admin/productos" className="btn btn-outline-secondary">Volver a productos</Link>
      </>
    );
  }

  const guardar = async (datos) => {
    const resultado = await actualizarArticulo(articulo.id, datos);
    if (resultado.ok) navigate(`/admin/productos/${articulo.id}`);
    return resultado;
  };

  return (
    <>
      <EncabezadoPagina titulo="Editar producto" subtitulo={articulo.nombre} />
      <FormularioProducto valorInicial={articulo} onGuardar={guardar} textoBoton="Guardar cambios" />
    </>
  );
}
