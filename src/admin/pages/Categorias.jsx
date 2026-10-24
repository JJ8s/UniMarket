import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cargarArticulos, cargarCategorias, eliminarCategoria } from '../../data/datos';
import { useCategorias } from '../../context/CategoriasContext';
import useConsulta from '../../hooks/useConsulta';
import EncabezadoPagina from '../components/EncabezadoPagina';
import MensajeError from '../components/MensajeError';

/** Listado de categorias con la cantidad de productos de cada una. */
export default function Categorias() {
  const { recargar: recargarCategoriasTienda } = useCategorias();
  const { datos: categorias, cargando, recargar } = useConsulta(cargarCategorias, [], []);
  const { datos: articulos } = useConsulta(cargarArticulos, [], []);
  const [error, setError] = useState('');

  const contarProductos = (valor) => articulos.filter((a) => a.categoria === valor).length;

  const borrar = async (categoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.etiqueta}"?`)) return;
    const resultado = await eliminarCategoria(categoria.valor);
    setError(resultado.ok ? '' : resultado.mensaje);
    await Promise.all([recargar(), recargarCategoriasTienda()]);
  };

  return (
    <>
      <EncabezadoPagina titulo="Categorías" subtitulo="Organizan los productos en la tienda">
        <Link to="/admin/categorias/nueva" className="btn btn-primary"><i className="fa-solid fa-plus"></i> Nueva categoría</Link>
      </EncabezadoPagina>

      <MensajeError mensaje={error} />

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr><th>Nombre</th><th>Identificador</th><th>Descripción</th><th className="text-end">Productos</th><th></th></tr></thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.valor}>
                  <td className="fw-semibold">{categoria.etiqueta}</td>
                  <td><code>{categoria.valor}</code></td>
                  <td className="text-secondary">{categoria.descripcion || '-'}</td>
                  <td className="text-end">{contarProductos(categoria.valor)}</td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/categorias/${categoria.valor}/editar`} className="btn btn-sm btn-outline-primary me-1" title="Editar">
                      <i className="fa-solid fa-pen"></i>
                    </Link>
                    <button type="button" className="btn btn-sm btn-outline-danger" title="Eliminar" onClick={() => borrar(categoria)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {cargando && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">Cargando...</td></tr>
              )}
              {!cargando && categorias.length === 0 && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">No hay categorías.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
