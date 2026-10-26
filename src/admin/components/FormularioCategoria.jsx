import { useState } from 'react';
import { Link } from 'react-router-dom';
import MensajeError from './MensajeError';

export default function FormularioCategoria({ valorInicial, onGuardar, textoBoton }) {
  const [campos, setCampos] = useState({ etiqueta: '', descripcion: '', ...valorInicial });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cambiar = (evento) => setCampos((anterior) => ({ ...anterior, [evento.target.name]: evento.target.value }));

  const enviar = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    const resultado = await onGuardar(campos);
    setGuardando(false);
    if (resultado && !resultado.ok) setError(resultado.mensaje);
  };

  return (
    <form className="card" onSubmit={enviar} noValidate>
      <div className="card-body">
        <MensajeError mensaje={error} />
        <div className="d-flex flex-wrap gap-3">
          {valorInicial?.valor && (
            <div className="flex-grow-1" style={{ minWidth: "200px" }}>
              <label className="form-label" htmlFor="cat-valor">Identificador</label>
              <input id="cat-valor" className="form-control" value={valorInicial.valor} readOnly disabled />
            </div>
          )}
          <div className="flex-grow-1" style={{ minWidth: "300px" }}>
            <label className="form-label" htmlFor="cat-etiqueta">Nombre *</label>
            <input id="cat-etiqueta" name="etiqueta" className="form-control" value={campos.etiqueta} onChange={cambiar} />
          </div>
          <div className="flex-grow-1" style={{ minWidth: "100%" }}>
            <label className="form-label" htmlFor="cat-descripcion">Descripción</label>
            <textarea id="cat-descripcion" name="descripcion" rows={3} className="form-control" value={campos.descripcion} onChange={cambiar} />
          </div>
        </div>
      </div>
      <div className="card-footer d-flex justify-content-end gap-2">
        <Link to="/admin/categorias" className="btn btn-outline-secondary">Cancelar</Link>
        <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : textoBoton}</button>
      </div>
    </form>
  );
}
