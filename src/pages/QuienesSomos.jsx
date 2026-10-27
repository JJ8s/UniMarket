import { Link } from 'react-router-dom';
import Header from '../components/Header';
import HeaderPublico from '../components/HeaderPublico';
import Footer from '../components/Footer';
import useBodyClass from '../hooks/useBodyClass';
import { useAuth } from '../context/AuthContext';
import { UNIVERSIDADES_DISPONIBLES } from '../data/datos';

// Misión y visión
const MISION_VISION = [
  {
    icono: 'fa-bullseye',
    titulo: 'Nuestra misión',
    texto:
      'Facilitar que los estudiantes compren y vendan entre ellos de forma simple, segura y dentro de su propio campus, ahorrando dinero y dándole una segunda vida a lo que ya no usan.',
  },
  {
    icono: 'fa-eye',
    titulo: 'Nuestra visión',
    texto:
      'Ser el marketplace estudiantil de referencia en Chile, conectando a las comunidades de cada sede en un espacio de confianza.',
  },
];

// Cómo funciona
const PASOS = [
  { icono: 'fa-camera', titulo: 'Publica', texto: 'Sube fotos, ponle precio y elige tu punto de entrega en el campus.' },
  { icono: 'fa-magnifying-glass', titulo: 'Encuentra', texto: 'Busca por categoría o por universidad y revisa los detalles antes de comprar.' },
  { icono: 'fa-handshake', titulo: 'Reúnete', texto: 'Coordina la entrega en un lugar conocido de tu sede y listo.' },
];

// Valores
const VALORES = [
  { icono: 'fa-shield-halved', titulo: 'Confianza', texto: 'Compras entre estudiantes de la misma comunidad.' },
  { icono: 'fa-piggy-bank', titulo: 'Ahorro', texto: 'Precios pensados para el bolsillo universitario.' },
  { icono: 'fa-recycle', titulo: 'Reutilización', texto: 'Lo que a ti ya no te sirve, a otro sí.' },
  { icono: 'fa-users', titulo: 'Comunidad', texto: 'Hecho por estudiantes, para estudiantes.' },
];

// Equipo: sin foto se muestra un icono
const EQUIPO = [
  { nombre: 'Jordy', rol: 'Desarrollo Backend', foto: '' },
  { nombre: 'Aschton Medolphe', rol: 'Desarrollo Frontend', foto: '' },
];

export default function QuienesSomos() {
  useBodyClass('bg-surface');
  const { usuario } = useAuth();

  return (
    <div className="pagina-con-footer qs-pagina">
      {usuario ? <Header /> : <HeaderPublico />}

      <main>
        {/* Hero */}
        <section className="qs-hero">
          <div className="qs-contenedor">
            <span className="qs-etiqueta">Quiénes somos</span>
            <h1>
              Somos estudiantes <span className="qs-resalte">ayudando a estudiantes</span>
            </h1>
            <p>
              <strong>UniMarket nació de una idea simple:</strong> dentro de cada campus hay cosas que alguien ya no necesita
              y que otro está buscando. Creamos un lugar para que esos dos se encuentren.
            </p>
            {!usuario && (
              <div className="qs-hero-botones">
                <Link to="/registro" className="qs-btn qs-btn-principal">Crear mi cuenta</Link>
                <Link to="/login" className="qs-btn qs-btn-fantasma">Iniciar sesión</Link>
              </div>
            )}
          </div>
        </section>

        {/* Misión y visión */}
        <section className="qs-contenedor qs-seccion">
          <div className="qs-grid-2">
            {MISION_VISION.map((item) => (
              <article className="qs-tarjeta" key={item.titulo}>
                <i className={`fa-solid ${item.icono} qs-icono`}></i>
                <h2>{item.titulo}</h2>
                <p>{item.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="qs-contenedor qs-seccion">
          <h2 className="qs-titulo-seccion">¿Cómo funciona?</h2>
          <div className="qs-grid-3">
            {PASOS.map((paso, indice) => (
              <article className="qs-paso" key={paso.titulo}>
                <span className="qs-paso-numero">{indice + 1}</span>
                <i className={`fa-solid ${paso.icono} qs-icono`}></i>
                <h3>{paso.titulo}</h3>
                <p>{paso.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Cifras */}
        <section className="qs-cifras">
          <div className="qs-contenedor qs-cifras-grid">
            <div>
              <strong>{UNIVERSIDADES_DISPONIBLES.length}</strong>
              <span>sedes disponibles</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>entre estudiantes</span>
            </div>
            <div>
              <strong>$0</strong>
              <span>costo por publicar</span>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="qs-contenedor qs-seccion">
          <h2 className="qs-titulo-seccion">Nuestros valores</h2>
          <div className="qs-grid-4">
            {VALORES.map((valor) => (
              <article className="qs-valor" key={valor.titulo}>
                <i className={`fa-solid ${valor.icono} qs-icono`}></i>
                <h3>{valor.titulo}</h3>
                <p>{valor.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Equipo */}
        <section className="qs-contenedor qs-seccion">
          <h2 className="qs-titulo-seccion">El equipo</h2>
          <div className="qs-grid-equipo">
            {EQUIPO.map((persona, indice) => (
              <article className="qs-persona" key={indice}>
                <div className="qs-avatar">
                  {persona.foto ? <img src={persona.foto} alt={persona.nombre} /> : <i className="fa-solid fa-user"></i>}
                </div>
                <h3>{persona.nombre}</h3>
                <p>{persona.rol}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Llamado a la acción */}
        <section className="qs-contenedor qs-seccion qs-seccion-final">
          <div className="qs-cta">
            <h2>¿Listo para ser parte?</h2>
            <p>Publica lo que ya no usas o encuentra lo que necesitas en tu campus.</p>
            <div className="qs-cta-botones">
              {usuario ? (
                <>
                  <Link to="/publicar" className="qs-btn qs-btn-principal">
                    <i className="fa-solid fa-plus"></i> Publicar un artículo
                  </Link>
                  <Link to="/" className="qs-btn qs-btn-fantasma">Ver el catálogo</Link>
                </>
              ) : (
                <>
                  <Link to="/registro" className="qs-btn qs-btn-principal">Crear mi cuenta</Link>
                  <Link to="/login" className="qs-btn qs-btn-fantasma">Iniciar sesión</Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
