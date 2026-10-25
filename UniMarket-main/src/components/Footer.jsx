import { Link } from 'react-router-dom';
import Logo from './Logo';
import { UNIVERSIDADES_DISPONIBLES } from '../data/datos';
import { obtenerOpcionesCategoria } from '../utils/utilidades';

// Los 3 mensajes de la franja de arriba. Edita los textos aqui.
const BENEFICIOS = [
  {
    icono: 'fa-shield-halved',
    titulo: 'Compra segura',
    texto: 'Compra y vende entre estudiantes de tu universidad, con publicaciones claras y detalles del producto antes de comprar.',
  },
  {
    icono: 'fa-location-dot',
    titulo: 'Entrega en el campus',
    texto: 'Cada vendedor indica su punto de entrega dentro del campus, para que te encuentres en un lugar conocido.',
  },
  {
    icono: 'fa-star',
    titulo: 'Calificaciones visibles',
    texto: 'Revisa la calificación de cada artículo antes de decidir.',
  },
];

// "Instituto Profesional DUOC UC - Sede Alameda" -> "DUOC UC · Alameda"
const acortarUniversidad = (nombre) => nombre.replace('Instituto Profesional DUOC UC - Sede ', 'DUOC UC · ');

/**
 * Footer del sitio, pegado al final de la pagina. Tiene 4 partes:
 *   1. Beneficios: 3 columnas con icono, titulo y texto (lista BENEFICIOS)
 *   2. Enlaces rapidos: categorias y universidades (filtran el catalogo)
 *   3. TU ESPACIO: bloque vacio para que agregues lo que quieras
 *   4. Barra inferior con logo y copyright
 *
 * Props (opcionales): si las pasas, las categorias y universidades se
 * muestran como botones que filtran el catalogo. Sin ellas, esa seccion se oculta.
 *   onElegirCategoria(valor)    onElegirUniversidad(nombre)
 */
export default function Footer({ onElegirCategoria, onElegirUniversidad }) {
  const hayEnlaces = onElegirCategoria || onElegirUniversidad;
  const categorias = obtenerOpcionesCategoria(); // vienen de datos.js (editables desde el admin)

  return (
    <footer className="site-footer">
      {/* 1. BENEFICIOS */}
      <div className="footer-beneficios">
        {BENEFICIOS.map((beneficio) => (
          <div className="footer-beneficio" key={beneficio.titulo}>
            <i className={`fa-solid ${beneficio.icono} footer-beneficio-icono`}></i>
            <h4>{beneficio.titulo}</h4>
            <p>{beneficio.texto}</p>
          </div>
        ))}
      </div>

      {/* 2. ENLACES RAPIDOS (filtran el catalogo) */}
      {hayEnlaces && (
        <div className="footer-enlaces">
          {onElegirCategoria && (
            <section>
              <h5>Categorías populares</h5>
              <div className="footer-chips">
                {categorias.map((categoria) => (
                  <button key={categoria.valor} type="button" className="footer-chip" onClick={() => onElegirCategoria(categoria.valor)}>
                    {categoria.etiqueta}
                  </button>
                ))}
              </div>
            </section>
          )}

          {onElegirUniversidad && (
            <section>
              <h5>Compra por universidad</h5>
              <div className="footer-chips">
                {UNIVERSIDADES_DISPONIBLES.map((universidad) => (
                  <button
                    key={universidad}
                    type="button"
                    className="footer-chip"
                    title={universidad}
                    onClick={() => onElegirUniversidad(universidad)}
                  >
                    {acortarUniversidad(universidad)}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* 3. TU ESPACIO: agrega aqui lo que quieras (vacio por defecto, no ocupa lugar).
          Ejemplos: columnas de enlaces, correo de contacto, redes sociales, terminos...
          Usa <Link to="/ruta"> para paginas internas o <a href="..."> para externas. */}
      <div className="footer-espacio">
        <div className="footer-columna">
          <h5>UniMarket</h5>
          <Link to="/quienes-somos">Quiénes somos</Link>
        </div>

        {/* <div className="footer-columna">
              <h5>Ayuda</h5>
              <a href="#">Preguntas frecuentes</a>
              <a href="#">Contacto</a>
            </div> */}
      </div>

      {/* 4. BARRA INFERIOR */}
      <div className="footer-inferior">
        <div className="footer-inferior-contenido">
          <Logo className="footer-logo-link" />
          <p>© {new Date().getFullYear()} UniMarket. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
