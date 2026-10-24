import { useRef, useState } from 'react';
import Logo from '../components/Logo';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UNIVERSIDADES_DISPONIBLES, actualizarUsuario, borrarFotoPerfil, guardarFotoPerfil } from '../data/datos';
import useBodyClass from '../hooks/useBodyClass';
import { comprimirImagen } from '../utils/utilidades';

const TAMANIO_MAX_FOTO = 240; // px del lado mas largo

export default function Perfil() {
  useBodyClass('perfil-body');
  const { usuario, refrescarUsuario } = useAuth();

  const nombreCompleto = (usuario.nombre || 'Usuario').trim();
  const partesNombre = nombreCompleto.split(' ').filter(Boolean);
  const nombre = partesNombre[0] || nombreCompleto;
  const apellido = partesNombre.slice(1).join(' ') || '-';

  // ---- Foto de perfil (opcional; se comprime antes de guardarla) ----
  const foto = usuario.foto; // viene del perfil guardado en la base
  const inputFotoRef = useRef(null);

  const manejarSeleccionDeFoto = async (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen.');
      return;
    }
    const dataUrl = await comprimirImagen(archivo, TAMANIO_MAX_FOTO, 0.75);
    const resultado = await guardarFotoPerfil(usuario.id, dataUrl);
    if (!resultado.ok) alert(resultado.mensaje);
    await refrescarUsuario();
    evento.target.value = ''; // permite volver a elegir el mismo archivo
  };

  const quitarFoto = async () => {
    await borrarFotoPerfil(usuario.id);
    await refrescarUsuario();
  };

  // ---- Edicion: nombre, apellido y universidad (el correo lo maneja Supabase Auth) ----
  const [editando, setEditando] = useState(false);
  const [formulario, setFormulario] = useState({ nombre: '', apellido: '', universidad: '' });
  const [error, setError] = useState('');

  const entrarModoEdicion = () => {
    setFormulario({
      nombre,
      apellido: apellido === '-' ? '' : apellido,
      universidad: usuario.universidad || '',
    });
    setError('');
    setEditando(true);
  };

  const cambiarCampo = (campo, valor) => setFormulario((anterior) => ({ ...anterior, [campo]: valor }));

  const guardarEdicion = async () => {
    const nombreNuevo = formulario.nombre.trim();
    const apellidoNuevo = formulario.apellido.trim();
    const nombreCompletoNuevo = [nombreNuevo, apellidoNuevo].filter(Boolean).join(' ');

    if (!nombreNuevo) {
      setError('El nombre no puede quedar vacío.');
      return;
    }

    // Si cambia el nombre, actualizarUsuario tambien renombra al vendedor de
    // sus articulos publicados.
    const resultado = await actualizarUsuario(usuario.id, {
      nombre: nombreCompletoNuevo,
      nombreUsuario: usuario.nombreUsuario,
      universidad: formulario.universidad,
    });
    if (!resultado.ok) {
      setError(resultado.mensaje);
      return;
    }

    // Refresca la sesion: toda la app (header, tarjetas...) se actualiza sola.
    await refrescarUsuario();
    setError('');
    setEditando(false);
  };

  return (
    <>
      <div className="perfil-header-logo">
        <Logo />
      </div>

      <main className="dashboard-container">
        <Link to="/" className="btn-volver-inicio">
          <i className="fa-solid fa-arrow-left"></i> Volver al inicio
        </Link>

        <header className="banner-card">
          <div className="user-profile-summary">
            <div className="avatar-wrapper">
              {foto ? (
                <img src={foto} alt="Foto de perfil" />
              ) : (
                <div className="avatar-placeholder"><i className="fa-solid fa-user"></i></div>
              )}
              <button type="button" className="edit-badge" title="Cambiar foto de perfil" onClick={() => inputFotoRef.current.click()}>
                <i className="fa-solid fa-camera"></i>
              </button>
              <input type="file" accept="image/*" className="hidden" ref={inputFotoRef} onChange={manejarSeleccionDeFoto} />
            </div>
            <div className="user-meta">
              <h1>{nombreCompleto}</h1>
              <p className="user-handle">{usuario.nombreUsuario || ''}</p>
              <div className="tags-row">
                <span className="tag-pill">
                  <i className="fa-solid fa-graduation-cap"></i> {usuario.universidad || 'Sin universidad'}
                </span>
              </div>
              {foto && (
                <button type="button" className="quitar-foto-link" onClick={quitarFoto}>Quitar foto</button>
              )}
            </div>
          </div>

          <div className="stats-counters">
            <div className="counter-block">
              <span className="counter-number">0</span>
              <span className="counter-label">Ventas</span>
            </div>
            <div className="counter-block">
              <span className="counter-number">0</span>
              <span className="counter-label">Compras</span>
            </div>
          </div>
        </header>

        <div className="grid-content">
          <section className="perfil-card info-card">
            <div className="card-header-action">
              <h2 className="card-title">Información Personal</h2>
              {editando ? (
                <div className="acciones-editar-grupo">
                  <button type="button" className="btn-edit-outline" onClick={() => { setEditando(false); setError(''); }}>Cancelar</button>
                  <button type="button" className="btn-guardar-perfil" onClick={guardarEdicion}>
                    <i className="fa-solid fa-check"></i> Guardar
                  </button>
                </div>
              ) : (
                <div>
                  <button type="button" className="btn-edit-outline" onClick={entrarModoEdicion}>
                    <i className="fa-solid fa-pen"></i> Editar
                  </button>
                </div>
              )}
            </div>

            {error && <p className="perfil-error">{error}</p>}

            <div className="field-list">
              <div className="field-item">
                <div className="field-icon"><i className="fa-regular fa-user"></i></div>
                <div className="field-content">
                  <span className="field-label">Nombre</span>
                  {editando ? (
                    <input type="text" className="campo-editable-input" placeholder="Nombre"
                           value={formulario.nombre} onChange={(e) => cambiarCampo('nombre', e.target.value)} />
                  ) : (
                    <span className="field-value">{nombre}</span>
                  )}
                </div>
              </div>

              <div className="field-item">
                <div className="field-icon"><i className="fa-regular fa-user"></i></div>
                <div className="field-content">
                  <span className="field-label">Apellido</span>
                  {editando ? (
                    <input type="text" className="campo-editable-input" placeholder="Apellido"
                           value={formulario.apellido} onChange={(e) => cambiarCampo('apellido', e.target.value)} />
                  ) : (
                    <span className="field-value">{apellido}</span>
                  )}
                </div>
              </div>

              <div className="field-item">
                <div className="field-icon"><i className="fa-solid fa-at"></i></div>
                <div className="field-content">
                  <span className="field-label">Nombre de usuario</span>
                  <span className="field-value">{usuario.nombreUsuario || '-'}</span>
                  <span className="field-subvalue">El nombre de usuario no se puede editar</span>
                </div>
              </div>

              <div className="field-item">
                <div className="field-icon"><i className="fa-solid fa-book-open"></i></div>
                <div className="field-content">
                  <span className="field-label">Universidad</span>
                  {editando ? (
                    <select className="campo-editable-input" value={formulario.universidad}
                            onChange={(e) => cambiarCampo('universidad', e.target.value)}>
                      {UNIVERSIDADES_DISPONIBLES.map((uni) => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="field-value">{usuario.universidad || 'Sin universidad registrada'}</span>
                  )}
                </div>
              </div>

              <div className="field-item">
                <div className="field-icon"><i className="fa-regular fa-envelope"></i></div>
                <div className="field-content">
                  <span className="field-label">Correo de la cuenta</span>
                  <span className="field-value">{usuario.correo || 'Sin correo registrado'}</span>
                  {editando && <span className="field-subvalue">El correo no se puede editar</span>}
                </div>
              </div>
            </div>
          </section>

          <div className="right-sidebar">
            <section className="perfil-card actions-card">
              <h2 className="card-title">Acciones rápidas</h2>
              <div className="actions-group">
                <Link to="/publicar" className="btn-primary-orange"><i className="fa-solid fa-plus"></i> Publicar nuevo artículo</Link>
                <Link to="/pedidos" className="btn-outline-blue"><i className="fa-solid fa-boxes-stacked"></i> Mis pedidos</Link>
                <Link to="/panel-vendedor" className="btn-outline-blue"><i className="fa-solid fa-shop"></i> Panel de vendedor</Link>
              </div>
            </section>

            <section className="perfil-card activity-card">
              <h2 className="card-title">Actividad reciente</h2>
              <div className="activity-list">
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Aún no tienes actividad registrada.</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
