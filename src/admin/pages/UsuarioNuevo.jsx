import { useNavigate } from 'react-router-dom';
import { crearUsuario } from '../../data/datos';
import EncabezadoPagina from '../components/EncabezadoPagina';
import FormularioUsuario from '../components/FormularioUsuario';

/** "Nuevo usuario" */
export default function UsuarioNuevo() {
  const navigate = useNavigate();

  const guardar = async (datos) => {
    const resultado = await crearUsuario(datos);
    if (resultado.ok) navigate(`/admin/usuarios/${encodeURIComponent(resultado.usuario.correo)}`);
    return resultado;
  };

  return (
    <>
      <EncabezadoPagina titulo="Nuevo usuario" subtitulo="Los campos con * son obligatorios" />
      <p className="text-secondary small">
        Si el proyecto de Supabase exige confirmar el correo, la persona debe confirmarlo antes de poder iniciar sesión.
      </p>
      <FormularioUsuario onGuardar={guardar} textoBoton="Crear usuario" />
    </>
  );
}
