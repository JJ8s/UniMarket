import { useState } from 'react';
import { Link } from 'react-router-dom';
import MensajeError from './MensajeError';

/**
 * Formulario de categoria, compartido por "Nueva categoria" y "Editar categoria".
 * Al editar se muestra el identificador (valor) solo de lectura: no cambia
 * para que los articulos existentes sigan enlazados.
 */
export default function FormularioCategoria({ valorInicial, onGuardar, textoBoton }) {
  const [campos, setCampos] = useState({ etiqueta: '', descripcion: '', ...valorInicial });
  const [error, setError] = useState('');

  const cambiar = (evento) => setCampos((anterior) => ({ ...anterior, [evento.target.name]: evento.target.value }));

  const enviar = (evento) => {
    evento.preventDefault();
    const resultado = onGuardar(campos);
    if (resultado && !resultado.ok) setError(resultado.mensaje);
  };

  return (
    <form className="card" onSubmit={enviar} noValidate>
      <div className="card-body">
        <MensajeError mensaje={error} />
        <div className="row g-3">
          {valorInicial?.valor && (
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="cat-valor">Identificador</label>
              <input id="cat-valor" className="form-control" value={valorInicial.valor} readOnly disabled />
            </div>
          )}
          <div className="col-12 col-md-8">
            <label className="form-label" htmlFor="cat-etiqueta">Nombre *</label>
            <input id="cat-etiqueta" name="etiqueta" className="form-control" value={campos.etiqueta} onChange={cambiar} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="cat-descripcion">Descripción</label>
            <textarea id="cat-descripcion" name="descripcion" rows={3} className="form-control" value={campos.descripcion} onChange={cambiar} />
          </div>
        </div>
      </div>
      <div className="card-footer d-flex justify-content-end gap-2">
        <Link to="/admin/categorias" className="btn btn-outline-secondary">Cancelar</Link>
        <button type="submit" className="btn btn-primary">{textoBoton}</button>
      </div>
    </form>
  );
}
