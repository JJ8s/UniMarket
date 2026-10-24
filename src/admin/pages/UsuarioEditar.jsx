import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { actualizarUsuarioAdmin, obtenerUsuario } from '../../data/datos';
import useConsulta from '../../hooks/useConsulta';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FormularioUsuario from '../components/FormularioUsuario';

/** "Editar usuario". */
export default function UsuarioEditar() {
  const { correo } = useParams(); // React Router ya lo entrega decodificado
  const navigate = useNavigate();
  const { usuario: sesion, refrescarUsuario } = useAuth();
  const { datos: usuario, cargando } = useConsulta(() => obtenerUsuario(correo), null, [correo]);

  if (cargando) return <p className="text-secondary">Cargando...</p>;

  if (!usuario) {
    return (
      <>
        <EncabezadoPagina titulo="Usuario no encontrado" />
        <Link to="/admin/usuarios" className="btn btn-outline-secondary">Volver a usuarios</Link>
      </>
    );
  }

  const guardar = async (datos) => {
    const resultado = await actualizarUsuarioAdmin(usuario.correo, datos);
    if (!resultado.ok) return resultado;

    // Si el admin se edito a si mismo, se refresca su perfil en la sesion (nombre, rol).
    if (usuario.id === sesion.id) await refrescarUsuario();
    navigate(`/admin/usuarios/${encodeURIComponent(resultado.usuario.correo)}`);
    return resultado;
  };

  return (
    <>
      <EncabezadoPagina titulo="Editar usuario" subtitulo={usuario.correo} />
      <FormularioUsuario valorInicial={usuario} onGuardar={guardar} textoBoton="Guardar cambios" esEdicion />
    </>
  );
}
