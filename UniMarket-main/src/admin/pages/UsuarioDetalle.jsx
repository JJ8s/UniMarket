import { Link, useParams } from 'react-router-dom';
import { ROL_ADMIN, cargarArticulos, obtenerFotoPerfil, obtenerUsuario, ordenesDeUsuario } from '../../data/datos';
import { totalVentas } from '../../utils/reportes';
import { formatearPrecio } from '../../utils/utilidades';
import EncabezadoPagina from '../components/EncabezadoPagina';

/** "Mostrar usuario": ficha de una cuenta, con accesos a editar y al historial de compras. */
export default function UsuarioDetalle() {
  const { correo } = useParams();
  const usuario = obtenerUsuario(correo);

  if (!usuario) {
    return (
      <>
        <EncabezadoPagina titulo="Usuario no encontrado" />
        <Link to="/admin/usuarios" className="btn btn-outline-secondary">Volver a usuarios</Link>
      </>
    );
  }

  const ordenes = ordenesDeUsuario(usuario.correo);
  const publicaciones = cargarArticulos().filter((a) => a.vendedor === usuario.nombre).length;
  const foto = obtenerFotoPerfil(usuario.correo);
  const enlace = encodeURIComponent(usuario.correo);

  return (
    <>
      <EncabezadoPagina titulo={usuario.nombre} subtitulo={usuario.nombreUsuario}>
        <Link to={`/admin/usuarios/${enlace}/editar`} className="btn btn-primary"><i className="fa-solid fa-pen"></i> Editar</Link>
        <Link to={`/admin/usuarios/${enlace}/historial`} className="btn btn-outline-primary"><i className="fa-solid fa-clock-rotate-left"></i> Historial de compras</Link>
        <Link to="/admin/usuarios" className="btn btn-outline-secondary">Volver</Link>
      </EncabezadoPagina>

      <div className="row g-3">
        <div className="col-12 col-lg-7">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-3">
                {foto
                  ? <img src={foto} alt="Foto de perfil" className="rounded-circle" style={{ width: 64, height: 64, objectFit: 'cover' }} />
                  : <div className="rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }}><i className="fa-solid fa-user fs-4"></i></div>}
                <span className={`badge text-bg-${usuario.rol === ROL_ADMIN ? 'primary' : 'secondary'}`}>
                  {usuario.rol === ROL_ADMIN ? 'Administrador' : 'Cliente'}
                </span>
              </div>
              <div className="row g-3">
                <div className="col-12 col-md-6"><div className="small text-secondary">Correo</div><div>{usuario.correo}</div></div>
                <div className="col-12 col-md-6"><div className="small text-secondary">Usuario</div><div>{usuario.nombreUsuario || '-'}</div></div>
                <div className="col-12"><div className="small text-secondary">Universidad</div><div>{usuario.universidad || '-'}</div></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-5">
          <div className="row g-3">
            <div className="col-4 col-lg-12"><div className="card"><div className="card-body py-3"><div className="small text-secondary">Compras pagadas</div><div className="fs-4 fw-bold">{ordenes.filter((o) => o.estado === 'Pagada').length}</div></div></div></div>
            <div className="col-4 col-lg-12"><div className="card"><div className="card-body py-3"><div className="small text-secondary">Total gastado</div><div className="fs-4 fw-bold">{formatearPrecio(totalVentas(ordenes))}</div></div></div></div>
            <div className="col-4 col-lg-12"><div className="card"><div className="card-body py-3"><div className="small text-secondary">Publicaciones</div><div className="fs-4 fw-bold">{publicaciones}</div></div></div></div>
          </div>
        </div>
      </div>
    </>
  );
}
