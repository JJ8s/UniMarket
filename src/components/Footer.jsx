import Logo from './Logo';
import { UNIVERSIDADES_DISPONIBLES } from '../data/datos';
import { useCategorias } from '../context/CategoriasContext';

// Beneficios
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

// Nombre corto de la sede
const acortarUniversidad = (nombre) => nombre.replace('Instituto Profesional DUOC UC - Sede ', 'DUOC UC · ');

export default function Footer({ onElegirCategoria, onElegirUniversidad }) {
  const hayEnlaces = onElegirCategoria || onElegirUniversidad;
  const { opciones: categorias } = useCategorias();

  return (
    <footer className="site-footer">
      {/* BENEFICIOS */}
      <div className="footer-beneficios">
        {BENEFICIOS.map((beneficio) => (
          <div className="footer-beneficio" key={beneficio.titulo}>
            <i className={`fa-solid ${beneficio.icono} footer-beneficio-icono`}></i>
            <h4>{beneficio.titulo}</h4>
            <p>{beneficio.texto}</p>
          </div>
        ))}
      </div>

      {/* ENLACES RAPIDOS */}
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

      <div className="footer-espacio">
      </div>

      {/* BARRA INFERIOR */}
      <div className="footer-inferior">
        <div className="footer-inferior-contenido">
          <Logo className="footer-logo-link" />
          <p>© {new Date().getFullYear()} UniMarket. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
