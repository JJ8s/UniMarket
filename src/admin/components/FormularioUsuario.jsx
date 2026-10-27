import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROL_ADMIN, ROL_CLIENTE, UNIVERSIDADES_DISPONIBLES } from '../../data/datos';
import MensajeError from './MensajeError';

export default function FormularioUsuario({ valorInicial, onGuardar, textoBoton, esEdicion = false }) {
  const [campos, setCampos] = useState({
    nombre: '', nombreUsuario: '', correo: '', universidad: '', rol: ROL_CLIENTE,
    ...valorInicial,
    contrasena: '',
  });
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
          <div className="flex-grow-1" style={{ minWidth: "240px" }}>
            <label className="form-label" htmlFor="usu-nombre">Nombre completo *</label>
            <input id="usu-nombre" name="nombre" className="form-control" value={campos.nombre} onChange={cambiar} />
          </div>
          <div className="flex-grow-1" style={{ minWidth: "240px" }}>
            <label className="form-label" htmlFor="usu-usuario">Nombre de usuario</label>
            <input id="usu-usuario" name="nombreUsuario" className="form-control" placeholder="@usuario" value={campos.nombreUsuario} onChange={cambiar} />
          </div>
          <div className="flex-grow-1" style={{ minWidth: "240px" }}>
            <label className="form-label" htmlFor="usu-correo">Correo *</label>
            <input id="usu-correo" name="correo" type="email" className="form-control" value={campos.correo} onChange={cambiar} readOnly={esEdicion} disabled={esEdicion} />
          </div>
          {!esEdicion && (
            <div className="flex-grow-1" style={{ minWidth: "240px" }}>
              <label className="form-label" htmlFor="usu-contrasena">Contraseña * (mínimo 6 caracteres)</label>
              <input id="usu-contrasena" name="contrasena" type="password" autoComplete="new-password" className="form-control" value={campos.contrasena} onChange={cambiar} />
            </div>
          )}
          <div className="flex-grow-1" style={{ minWidth: "300px" }}>
            <label className="form-label" htmlFor="usu-universidad">Universidad</label>
            <select id="usu-universidad" name="universidad" className="form-select" value={campos.universidad} onChange={cambiar}>
              <option value="">Sin especificar</option>
              {campos.universidad && !UNIVERSIDADES_DISPONIBLES.includes(campos.universidad) && (
                <option value={campos.universidad}>{campos.universidad}</option>
              )}
              {UNIVERSIDADES_DISPONIBLES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="flex-grow-1" style={{ minWidth: "200px" }}>
            <label className="form-label" htmlFor="usu-rol">Rol</label>
            <select id="usu-rol" name="rol" className="form-select" value={campos.rol} onChange={cambiar}>
              <option value={ROL_CLIENTE}>Cliente</option>
              <option value={ROL_ADMIN}>Administrador</option>
            </select>
          </div>
        </div>
      </div>
      <div className="card-footer d-flex justify-content-end gap-2">
        <Link to="/admin/usuarios" className="btn btn-outline-secondary">Cancelar</Link>
        <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : textoBoton}</button>
      </div>
    </form>
  );
}
