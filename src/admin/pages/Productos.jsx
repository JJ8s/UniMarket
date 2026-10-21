import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cargarArticulos, cargarCategorias, eliminarArticulo } from '../../data/datos';
import useRecarga from '../../hooks/useRecarga';
import { descargarCsv } from '../../utils/archivos';
import { convertirACsv } from '../../utils/reportes';
import { etiquetaCategoria, formatearPrecio, normalizarTexto } from '../../utils/utilidades';
import BuscadorFiltros from '../components/BuscadorFiltros';
import EncabezadoPagina from '../components/EncabezadoPagina';
import InsigniaStock from '../components/InsigniaStock';
import MensajeError from '../components/MensajeError';
import Miniatura from '../components/Miniatura';

/** Listado de productos con busqueda, filtro por categoria y acciones ver / editar / eliminar. */
export default function Productos() {
  const [articulos, recargar] = useRecarga(cargarArticulos);
  const [categorias] = useState(() => cargarCategorias());
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('todas');
  const [error, setError] = useState('');

  const filtrados = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim());
    return articulos
      .filter((a) => categoria === 'todas' || a.categoria === categoria)
      .filter((a) => !termino || normalizarTexto(`${a.nombre} ${a.vendedor} ${a.sku}`).includes(termino))
      .sort((a, b) => b.creadoEn - a.creadoEn);
  }, [articulos, busqueda, categoria]);

  const borrar = (articulo) => {
    if (!window.confirm(`¿Eliminar "${articulo.nombre}"? Esta acción no se puede deshacer.`)) return;
    const resultado = eliminarArticulo(articulo.id);
    setError(resultado.ok ? '' : resultado.mensaje);
    recargar();
  };

  const exportar = () => {
    const filas = filtrados.map((a) => ({
      id: a.id, nombre: a.nombre, categoria: etiquetaCategoria(a.categoria), precio: a.precio.toFixed(2),
      stock: a.stock ?? 0, vendedor: a.vendedor, sku: a.sku,
    }));
    descargarCsv('productos.csv', convertirACsv(filas, [
      { clave: 'id', titulo: 'ID' }, { clave: 'nombre', titulo: 'Nombre' }, { clave: 'categoria', titulo: 'Categoría' },
      { clave: 'precio', titulo: 'Precio' }, { clave: 'stock', titulo: 'Stock' },
      { clave: 'vendedor', titulo: 'Vendedor' }, { clave: 'sku', titulo: 'SKU' },
    ]));
  };

  return (
    <>
      <EncabezadoPagina titulo="Productos" subtitulo={`${articulos.length} producto(s) en total`}>
        <Link to="/admin/productos/criticos" className="btn btn-outline-warning">
          <i className="fa-solid fa-triangle-exclamation"></i> Stock crítico
        </Link>
        <Link to="/admin/reportes" className="btn btn-outline-secondary">Reportes</Link>
        <button type="button" className="btn btn-outline-secondary" onClick={exportar}>
          <i className="fa-solid fa-file-csv"></i> CSV
        </button>
        <Link to="/admin/productos/nuevo" className="btn btn-primary">
          <i className="fa-solid fa-plus"></i> Nuevo producto
        </Link>
      </EncabezadoPagina>

      <MensajeError mensaje={error} />

      <BuscadorFiltros busqueda={busqueda} onBusqueda={setBusqueda} placeholder="Buscar por nombre, vendedor o SKU">
        <div className="col-12 col-md-4 col-lg-3">
          <select className="form-select" value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Filtrar por categoría">
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => <option key={c.valor} value={c.valor}>{c.etiqueta}</option>)}
          </select>
        </div>
      </BuscadorFiltros>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr><th>Producto</th><th>Categoría</th><th className="text-end">Precio</th><th>Stock</th><th>Vendedor</th><th></th></tr>
            </thead>
            <tbody>
              {filtrados.map((articulo) => (
                <tr key={articulo.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <Miniatura articulo={articulo} />
                      <div>
                        <div className="fw-semibold">{articulo.nombre}</div>
                        <div className="small text-secondary">{articulo.sku || 'Sin SKU'}</div>
                      </div>
                    </div>
                  </td>
                  <td>{etiquetaCategoria(articulo.categoria)}</td>
                  <td className="text-end">{formatearPrecio(articulo.precio)}</td>
                  <td><InsigniaStock stock={articulo.stock} /></td>
                  <td>{articulo.vendedor}</td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/productos/${articulo.id}`} className="btn btn-sm btn-outline-secondary me-1" title="Ver">
                      <i className="fa-solid fa-eye"></i>
                    </Link>
                    <Link to={`/admin/productos/${articulo.id}/editar`} className="btn btn-sm btn-outline-primary me-1" title="Editar">
                      <i className="fa-solid fa-pen"></i>
                    </Link>
                    <button type="button" className="btn btn-sm btn-outline-danger" title="Eliminar" onClick={() => borrar(articulo)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={6} className="text-center text-secondary py-4">No hay productos que coincidan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
