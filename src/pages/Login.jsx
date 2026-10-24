import { useState } from 'react';
import Logo from '../components/Logo';
import { Link, useNavigate } from 'react-router-dom';
import { ROL_ADMIN } from '../data/datos';
import { useAuth } from '../context/AuthContext';
import useBodyClass from '../hooks/useBodyClass';

export default function Login() {
  useBodyClass('auth-body');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    const resultado = await login(correo, contrasena);
    setEnviando(false);

    if (!resultado.ok) {
      setError(resultado.mensaje);
      return;
    }
    setError('');
    navigate(resultado.usuario.rol === ROL_ADMIN ? '/admin' : '/'); // el admin entra directo a su panel
  };

  return (
    <>
      <div className="auth-logo">
        <Logo />
      </div>

      <div className="login-container">
        <h2>Inicia sesión</h2>

        <form onSubmit={manejarEnvio}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Ingresa tu correo"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Ingresa tu contraseña"
              required
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-submit" disabled={enviando}>{enviando ? 'Ingresando...' : 'Ingresar'}</button>
          <div className="form-footer">
            <p><a href="#">¿Olvidaste tu contraseña?</a></p>
            <p>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
          </div>
        </form>
      </div>
    </>
  );
}
