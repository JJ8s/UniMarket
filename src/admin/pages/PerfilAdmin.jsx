import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { actualizarUsuario } from '../../data/datos';
import EncabezadoPagina from '../components/EncabezadoPagina';
import MensajeError from '../components/MensajeError';

/**
 * Perfil del administrador: editar su nombre y su nombre de usuario.
 * El correo y la contraseña los maneja Supabase Auth, no se cambian aqui.
 */
export default function PerfilAdmin() {
  const { usuario: sesion, refrescarUsuario } = useAuth();

  const [nombre, setNombre] = useState(sesion.nombre || '');
  const [nombreUsuario, setNombreUsuario] = useState(sesion.nombreUsuario || '');
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const guardar = async (evento) => {
    evento.preventDefault();
    setExito(false);
    setGuardando(true);
    const resultado = await actualizarUsuario(sesion.id, { nombre, nombreUsuario, universidad: sesion.universidad });
    setGuardando(false);
    if (!resultado.ok) {
      setError(resultado.mensaje);
      return;
    }
    await refrescarUsuario(); // refresca el nombre en la sesion
    setError('');
    setExito(true);
  };

  return (
    <>
      <EncabezadoPagina titulo="Mi perfil" subtitulo={sesion.correo} />
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
            <div className="col-12">
              <label className="form-label" htmlFor="perfil-correo">Correo</label>
              <input id="perfil-correo" className="form-control" value={sesion.correo} readOnly disabled />
            </div>
          </div>
        </div>
        <div className="card-footer text-end">
          <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar cambios'}</button>
        </div>
      </form>
    </>
  );
}
