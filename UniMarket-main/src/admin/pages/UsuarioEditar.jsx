import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { actualizarUsuarioAdmin, obtenerUsuario } from '../../data/datos';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FormularioUsuario from '../components/FormularioUsuario';

/** "Editar usuario". */
export default function UsuarioEditar() {
  const { correo } = useParams(); // React Router ya lo entrega decodificado
  const navigate = useNavigate();
  const { usuario: sesion, login } = useAuth();
  const usuario = obtenerUsuario(correo);

  if (!usuario) {
    return (
      <>
        <EncabezadoPagina titulo="Usuario no encontrado" />
        <Link to="/admin/usuarios" className="btn btn-outline-secondary">Volver a usuarios</Link>
      </>
    );
  }

  const guardar = (datos) => {
    const resultado = actualizarUsuarioAdmin(usuario.correo, datos);
    if (!resultado.ok) return resultado;

    // Si el admin se edito a si mismo, se refresca su sesion (nombre, correo, rol).
    if (usuario.correo.toLowerCase() === (sesion.correo || '').toLowerCase()) login(resultado.usuario);
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
