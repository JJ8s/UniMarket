import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { actualizarUsuarioAdmin, obtenerUsuario } from '../../data/datos';
import EncabezadoPagina from '../components/EncabezadoPagina';
import MensajeError from '../components/MensajeError';

/** Perfil del administrador: editar su nombre y cambiar su contraseña. */
export default function PerfilAdmin() {
  const { usuario: sesion, login } = useAuth();
  const actual = obtenerUsuario(sesion.correo);

  const [nombre, setNombre] = useState(actual?.nombre || '');
  const [nombreUsuario, setNombreUsuario] = useState(actual?.nombreUsuario || '');
  const [contrasena, setContrasena] = useState('');
  const [repetida, setRepetida] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);

  if (!actual) return <p>No se encontró tu cuenta.</p>;

  const guardar = (evento) => {
    evento.preventDefault();
    setExito(false);
    if (contrasena !== repetida) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    const resultado = actualizarUsuarioAdmin(actual.correo, {
      nombre, nombreUsuario, correo: actual.correo, universidad: actual.universidad, rol: actual.rol, contrasena,
    });
    if (!resultado.ok) {
      setError(resultado.mensaje);
      return;
    }
    login(resultado.usuario); // refresca el nombre en la sesion
    setError('');
    setContrasena('');
    setRepetida('');
    setExito(true);
  };

  return (
    <>
      <EncabezadoPagina titulo="Mi perfil" subtitulo={actual.correo} />
      <form className="card" style={{ maxWidth: 640 }} onSubmit={guardar} noValidate>
        <div className="card-body">
          <MensajeError mensaje={error} />
          {exito && <div className="alert alert-success py-2">Cambios guardados.</div>}
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="perfil-nombre">Nombre</label>
              <input id="perfil-nombre" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="perfil-usuario">Nombre de usuario</label>
              <input id="perfil-usuario" className="form-control" value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="perfil-clave">Nueva contraseña</label>
              <input id="perfil-clave" type="password" autoComplete="new-password" className="form-control" placeholder="Vacía = no cambiar" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="perfil-clave2">Repetir contraseña</label>
              <input id="perfil-clave2" type="password" autoComplete="new-password" className="form-control" value={repetida} onChange={(e) => setRepetida(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="card-footer text-end"><button type="submit" className="btn btn-primary">Guardar cambios</button></div>
      </form>
    </>
  );
}
