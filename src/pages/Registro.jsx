import { useState } from 'react';
import Logo from '../components/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { UNIVERSIDADES_DISPONIBLES, registrarUsuario } from '../data/datos';
import { useAuth } from '../context/AuthContext';
import useBodyClass from '../hooks/useBodyClass';

export default function Registro() {
  useBodyClass('auth-body');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [campos, setCampos] = useState({
    nombre: '',
    nombreUsuario: '',
    correo: '',
    universidad: '',
    contrasena: '',
    contrasena2: '',
  });
  const [error, setError] = useState('');

  // Un solo handler para todos los inputs (usa el atributo name).
  const cambiarCampo = (evento) => {
    const { name, value } = evento.target;
    setCampos((anterior) => ({ ...anterior, [name]: value }));
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();

    if (campos.contrasena !== campos.contrasena2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const resultado = registrarUsuario({
      nombre: campos.nombre.trim(),
      nombreUsuario: campos.nombreUsuario.trim(),
      correo: campos.correo.trim(),
      universidad: campos.universidad,
      contrasena: campos.contrasena,
    });

    if (!resultado.ok) {
      setError(resultado.mensaje);
      return;
    }

    setError('');
    // Registro exitoso: inicia sesion automaticamente y entra al catalogo.
    login(resultado.usuario);
    navigate('/');
  };

  return (
    <>
      <div className="auth-logo">
        <Logo />
      </div>

      <div className="login-container">
        <h2>Crear cuenta</h2>

        <form onSubmit={manejarEnvio}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo</label>
            <input type="text" id="nombre" name="nombre" placeholder="Ingresa tu nombre" required
                   value={campos.nombre} onChange={cambiarCampo} />
          </div>
          <div className="form-group">
            <label htmlFor="usuario">Nombre de usuario</label>
            <input type="text" id="usuario" name="nombreUsuario" placeholder="@usuario" required
                   value={campos.nombreUsuario} onChange={cambiarCampo} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input type="email" id="email" name="correo" placeholder="Ingresa tu correo" required
                   value={campos.correo} onChange={cambiarCampo} />
          </div>
          <div className="form-group">
            <label htmlFor="universidad">Universidad</label>
            <select
              id="universidad"
              name="universidad"
              className="university-select"
              style={{ width: '100%', padding: '11px 12px', border: '1px solid #CBD5E0', borderRadius: '8px', fontSize: '14px' }}
              value={campos.universidad}
              onChange={cambiarCampo}
            >
              <option value="">Selecciona tu universidad</option>
              {UNIVERSIDADES_DISPONIBLES.map((universidad) => (
                <option key={universidad} value={universidad}>{universidad}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" name="contrasena" placeholder="Mínimo 6 caracteres" minLength={6} required
                   value={campos.contrasena} onChange={cambiarCampo} />
          </div>
          <div className="form-group">
            <label htmlFor="password2">Confirmar contraseña</label>
            <input type="password" id="password2" name="contrasena2" placeholder="Repite tu contraseña" minLength={6} required
                   value={campos.contrasena2} onChange={cambiarCampo} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-submit">Crear cuenta</button>
          <div className="form-footer">
            <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </form>
      </div>
    </>
  );
}
