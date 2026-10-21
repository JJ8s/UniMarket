import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROL_ADMIN, ROL_CLIENTE, UNIVERSIDADES_DISPONIBLES } from '../../data/datos';
import MensajeError from './MensajeError';

/**
 * Formulario de usuario, compartido por "Nuevo usuario" y "Editar usuario".
 *   esEdicion : al editar la contraseña es opcional (vacia = no se cambia)
 */
export default function FormularioUsuario({ valorInicial, onGuardar, textoBoton, esEdicion = false }) {
  const [campos, setCampos] = useState({
    nombre: '', nombreUsuario: '', correo: '', universidad: '', rol: ROL_CLIENTE,
    ...valorInicial,
    contrasena: '', // nunca se precarga la contraseña actual
  });
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
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="usu-nombre">Nombre completo *</label>
            <input id="usu-nombre" name="nombre" className="form-control" value={campos.nombre} onChange={cambiar} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="usu-usuario">Nombre de usuario</label>
            <input id="usu-usuario" name="nombreUsuario" className="form-control" placeholder="@usuario" value={campos.nombreUsuario} onChange={cambiar} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="usu-correo">Correo *</label>
            <input id="usu-correo" name="correo" type="email" className="form-control" value={campos.correo} onChange={cambiar} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="usu-contrasena">
              Contraseña {esEdicion ? '(vacía = no cambiar)' : '*'}
            </label>
            <input id="usu-contrasena" name="contrasena" type="password" autoComplete="new-password" className="form-control" value={campos.contrasena} onChange={cambiar} />
          </div>
          <div className="col-12 col-md-8">
            <label className="form-label" htmlFor="usu-universidad">Universidad</label>
            <select id="usu-universidad" name="universidad" className="form-select" value={campos.universidad} onChange={cambiar}>
              <option value="">Sin especificar</option>
              {UNIVERSIDADES_DISPONIBLES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-4">
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
        <button type="submit" className="btn btn-primary">{textoBoton}</button>
      </div>
    </form>
  );
}
