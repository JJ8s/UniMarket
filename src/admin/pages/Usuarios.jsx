import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROL_ADMIN, cargarUsuarios, eliminarUsuario } from '../../data/datos';
import { useAuth } from '../../context/AuthContext';
import useConsulta from '../../hooks/useConsulta';
import { normalizarTexto } from '../../utils/utilidades';
import BuscadorFiltros from '../components/BuscadorFiltros';
import EncabezadoPagina from '../components/EncabezadoPagina';
import MensajeError from '../components/MensajeError';

/** Listado de usuarios con busqueda y acciones ver / editar / eliminar. */
export default function Usuarios() {
  const { usuario: sesion } = useAuth();
  const { datos: usuarios, cargando, recargar } = useConsulta(cargarUsuarios, [], []);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');

  const filtrados = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim());
    return usuarios.filter((u) => !termino || normalizarTexto(`${u.nombre} ${u.nombreUsuario} ${u.correo}`).includes(termino));
  }, [usuarios, busqueda]);

  const esYo = (u) => u.id === sesion.id;

  const borrar = async (u) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${u.nombre}? Sus publicaciones y órdenes se conservan.`)) return;
    const resultado = await eliminarUsuario(u.correo);
    setError(resultado.ok ? '' : resultado.mensaje);
    await recargar();
  };

  return (
    <>
      <EncabezadoPagina titulo="Usuarios" subtitulo={`${usuarios.length} cuenta(s) registradas`}>
        <Link to="/admin/usuarios/nuevo" className="btn btn-primary"><i className="fa-solid fa-plus"></i> Nuevo usuario</Link>
      </EncabezadoPagina>

      <MensajeError mensaje={error} />
      <BuscadorFiltros busqueda={busqueda} onBusqueda={setBusqueda} placeholder="Buscar por nombre, usuario o correo" />

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr><th>Nombre</th><th>Correo</th><th>Universidad</th><th>Rol</th><th></th></tr></thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.correo}>
                  <td>
                    <div className="fw-semibold">{u.nombre}</div>
                    <div className="small text-secondary">{u.nombreUsuario}</div>
                  </td>
                  <td>{u.correo}</td>
                  <td className="small">{u.universidad || '-'}</td>
                  <td>
                    <span className={`badge text-bg-${u.rol === ROL_ADMIN ? 'primary' : 'secondary'}`}>
                      {u.rol === ROL_ADMIN ? 'Administrador' : 'Cliente'}
                    </span>
                  </td>
                  <td className="text-end text-nowrap">
                    <Link to={`/admin/usuarios/${encodeURIComponent(u.correo)}`} className="btn btn-sm btn-outline-secondary me-1" title="Ver">
                      <i className="fa-solid fa-eye"></i>
                    </Link>
                    <Link to={`/admin/usuarios/${encodeURIComponent(u.correo)}/editar`} className="btn btn-sm btn-outline-primary me-1" title="Editar">
                      <i className="fa-solid fa-pen"></i>
                    </Link>
                    <button type="button" className="btn btn-sm btn-outline-danger" title={esYo(u) ? 'No puedes eliminar tu propia cuenta' : 'Eliminar'}
                            disabled={esYo(u)} onClick={() => borrar(u)}>
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {cargando && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">Cargando...</td></tr>
              )}
              {!cargando && filtrados.length === 0 && (
                <tr><td colSpan={5} className="text-center text-secondary py-4">No hay usuarios que coincidan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
