import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UNIVERSIDADES_DISPONIBLES } from '../../data/datos';
import { OPCIONES_ESTADO, comprimirImagen, obtenerOpcionesCategoria } from '../../utils/utilidades';
import MensajeError from './MensajeError';

const VACIO = {
  nombre: '', descripcion: '', categoria: '', precio: '', stock: '',
  condicion: OPCIONES_ESTADO[0].valor, vendedor: '', universidad: '', sku: '', entrega: '', fotos: [],
};

/**
 * Formulario de producto, compartido por "Nuevo producto" y "Editar producto".
 *   valorInicial : producto existente (al editar) o nada (al crear)
 *   onGuardar    : recibe los datos y devuelve { ok, mensaje } (ver datos.js)
 *   textoBoton   : texto del boton de guardar
 */
export default function FormularioProducto({ valorInicial, onGuardar, textoBoton }) {
  const [campos, setCampos] = useState({ ...VACIO, ...valorInicial });
  const [error, setError] = useState('');
  const [categorias] = useState(() => obtenerOpcionesCategoria());

  const cambiar = (evento) => setCampos((anterior) => ({ ...anterior, [evento.target.name]: evento.target.value }));

  const elegirFoto = async (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      setError('Elige un archivo de imagen.');
      return;
    }
    const dataUrl = await comprimirImagen(archivo, 480, 0.7);
    setCampos((anterior) => ({ ...anterior, fotos: [dataUrl] }));
    setError('');
  };

  const enviar = (evento) => {
    evento.preventDefault();
    const resultado = onGuardar(campos);
    if (resultado && !resultado.ok) setError(resultado.mensaje);
  };

  // Si el producto trae un estado que ya no esta en la lista, se conserva como opcion.
  const estados = OPCIONES_ESTADO.some((o) => o.valor === campos.condicion)
    ? OPCIONES_ESTADO
    : [...OPCIONES_ESTADO, { valor: campos.condicion, etiqueta: campos.condicion }];

  return (
    <form className="card" onSubmit={enviar} noValidate>
      <div className="card-body">
        <MensajeError mensaje={error} />
        <div className="row g-3">
          <div className="col-12 col-md-8">
            <label className="form-label" htmlFor="prod-nombre">Nombre *</label>
            <input id="prod-nombre" name="nombre" className="form-control" value={campos.nombre} onChange={cambiar} />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="prod-categoria">Categoría *</label>
            <select id="prod-categoria" name="categoria" className="form-select" value={campos.categoria} onChange={cambiar}>
              <option value="">Seleccionar...</option>
              {categorias.map((c) => <option key={c.valor} value={c.valor}>{c.etiqueta}</option>)}
            </select>
          </div>

          <div className="col-12">
            <label className="form-label" htmlFor="prod-descripcion">Descripción</label>
            <textarea id="prod-descripcion" name="descripcion" rows={3} className="form-control" value={campos.descripcion} onChange={cambiar} />
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="prod-precio">Precio (USD) *</label>
            <input id="prod-precio" name="precio" type="number" min="0" step="0.01" className="form-control" value={campos.precio} onChange={cambiar} />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="prod-stock">Stock *</label>
            <input id="prod-stock" name="stock" type="number" min="0" step="1" className="form-control" value={campos.stock} onChange={cambiar} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="prod-condicion">Estado del producto</label>
            <select id="prod-condicion" name="condicion" className="form-select" value={campos.condicion} onChange={cambiar}>
              {estados.map((o) => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="prod-vendedor">Vendedor</label>
            <input id="prod-vendedor" name="vendedor" className="form-control" placeholder="UniMarket" value={campos.vendedor} onChange={cambiar} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="prod-universidad">Universidad del vendedor</label>
            <select id="prod-universidad" name="universidad" className="form-select" value={campos.universidad} onChange={cambiar}>
              <option value="">Sin especificar</option>
              {UNIVERSIDADES_DISPONIBLES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="prod-sku">SKU</label>
            <input id="prod-sku" name="sku" className="form-control" placeholder="Se genera si lo dejas vacío" value={campos.sku} onChange={cambiar} />
          </div>
          <div className="col-12 col-md-8">
            <label className="form-label" htmlFor="prod-entrega">Punto de entrega</label>
            <input id="prod-entrega" name="entrega" className="form-control" value={campos.entrega} onChange={cambiar} />
          </div>

          <div className="col-12">
            <label className="form-label" htmlFor="prod-foto">Foto</label>
            <input id="prod-foto" type="file" accept="image/*" className="form-control" onChange={elegirFoto} />
            {campos.fotos.length > 0 && (
              <div className="d-flex align-items-center gap-3 mt-2">
                <img src={campos.fotos[0]} alt="Vista previa" style={{ height: 72, borderRadius: 8 }} />
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setCampos((a) => ({ ...a, fotos: [] }))}>
                  Quitar foto
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="card-footer d-flex justify-content-end gap-2">
        <Link to="/admin/productos" className="btn btn-outline-secondary">Cancelar</Link>
        <button type="submit" className="btn btn-primary">{textoBoton}</button>
      </div>
    </form>
  );
}
