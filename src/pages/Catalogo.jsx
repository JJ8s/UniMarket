import { useMemo, useState } from 'react';
import ModalProducto from '../components/ModalProducto';
import TarjetaArticulo from '../components/TarjetaArticulo';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useCarrito } from '../context/CarritoContext';
import { useCategorias } from '../context/CategoriasContext';
import useConsulta from '../hooks/useConsulta';
import { UNIVERSIDADES_DISPONIBLES, cargarArticulos } from '../data/datos';
import { normalizarTexto } from '../utils/utilidades';

const UBICACION_SIMULADA = { lat: 19.4326, lng: -99.1332 };

const IconoUbicacion = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

export default function Catalogo() {
  const { agregarAlCarrito } = useCarrito();

  const { datos: articulos, cargando } = useConsulta(cargarArticulos, []);
  const { opciones, etiquetaCategoria } = useCategorias();
  const filtrosCategoria = useMemo(() => [{ valor: 'todos', etiqueta: 'Todos' }, ...opciones], [opciones]);
  const [categoria, setCategoria] = useState('todos');
  const [universidad, setUniversidad] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [radio, setRadio] = useState(5);
  const [ubicacion, setUbicacion] = useState(null);
  const [articuloModal, setArticuloModal] = useState(null);

  const articulosFiltrados = useMemo(() => {
    const termino = normalizarTexto(busqueda.trim());
    let lista = [...articulos];

    if (categoria !== 'todos') {
      lista = lista.filter((a) => a.categoria === categoria);
    }
    if (ubicacion) {
      lista = lista.filter((a) => a.distancia <= radio);
    }
    if (universidad !== 'todas') {
      lista = lista.filter((a) => {
        const unis = a.universidadesVenta;
        return !unis || unis.length === 0 || unis.includes(universidad);
      });
    }
    if (termino) {
      lista = lista.filter((a) => {
        const categoriaTexto = etiquetaCategoria(a.categoria);
        return normalizarTexto(`${a.nombre} ${a.descripcion} ${a.vendedor} ${categoriaTexto}`).includes(termino);
      });
    }

    if (ubicacion) lista.sort((a, b) => a.distancia - b.distancia);
    else lista.sort((a, b) => b.creadoEn - a.creadoEn);
    return lista;
  }, [articulos, categoria, universidad, busqueda, radio, ubicacion, etiquetaCategoria]);

  const irAProductos = () =>
    document.getElementById('seccion-productos')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });

  const elegirCategoriaDesdeFooter = (valor) => {
    setCategoria(valor);
    irAProductos();
  };
  const elegirUniversidadDesdeFooter = (nombre) => {
    setUniversidad(nombre);
    irAProductos();
  };

  const detectarUbicacion = () => {
    const usarSimulada = (avisar) => {
      setUbicacion({ ...UBICACION_SIMULADA, simulada: true });
      if (avisar) alert('No se pudo obtener ubicación real. Usamos una ubicación simulada.');
    };

    if (!('geolocation' in navigator)) {
      usarSimulada(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) =>
        setUbicacion({ lat: posicion.coords.latitude, lng: posicion.coords.longitude, simulada: false }),
      () => usarSimulada(true)
    );
  };

  const textoBotonUbicacion = !ubicacion
    ? 'Detectar ubicación'
    : ubicacion.simulada
      ? 'Ubicación simulada (CDMX)'
      : 'Ubicación detectada';

  const textoBadgeUbicacion = ubicacion?.simulada
    ? `A menos de ${radio} km (simulado)`
    : `A menos de ${radio} km de tu ubicación`;

  return (
    <>
      <div className="pagina-con-footer">
      <Header conBusqueda busqueda={busqueda} onBusqueda={setBusqueda} />

      <main>
        {/* HERO: ubicacion */}
        <section className="bg-surface py-16 px-6 text-center border-b border-gray-200">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Encuentra lo que necesitas en tu campus</h2>
            <p className="text-gray-600 text-lg mb-6">Compra y vende snacks, ropa, tecnología y más con estudiantes de tu universidad.</p>

            <div className="bg-white p-3 rounded-xl shadow-md flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
              <button
                type="button"
                onClick={detectarUbicacion}
                className="flex items-center gap-3 px-4 py-2 bg-surface hover:bg-gray-200 rounded-lg w-full sm:w-auto transition"
              >
                <IconoUbicacion className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{textoBotonUbicacion}</span>
              </button>
              <div className="w-px h-8 bg-gray-300 hidden sm:block"></div>
              <div className="flex-1 flex items-center gap-3 w-full">
                <span className="text-sm text-gray-500">Radio:</span>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={radio}
                  onChange={(e) => setRadio(parseFloat(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-sm font-bold text-primary">{radio} km</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA PUBLICAR */}
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
          <div className="bg-primary rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <h3 className="text-xl font-bold text-white">¿Quieres vender lo que ya no usas?</h3>
              <p className="text-white/80 text-sm">Publica tus artículos y gana dinero extra en tu comunidad.</p>
            </div>
            <Link to="/publicar" className="bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Publicar artículo
            </Link>
          </div>
        </div>

        {/* FILTROS Y PRODUCTOS */}
        <section id="seccion-productos" style={{ scrollMarginTop: '90px' }} className="max-w-7xl mx-auto px-6 pb-12">
          <div className="flex flex-wrap items-center gap-3 pb-4">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {filtrosCategoria.map((filtro) => (
                <button
                  key={filtro.valor}
                  type="button"
                  className={`filter-btn ${categoria === filtro.valor ? 'active' : ''}`}
                  onClick={() => setCategoria(filtro.valor)}
                >
                  {filtro.etiqueta}
                </button>
              ))}
            </div>

            <select
              className="university-select"
              value={universidad}
              onChange={(e) => setUniversidad(e.target.value)}
            >
              <option value="todas">Filtrar por Universidad</option>
              {UNIVERSIDADES_DISPONIBLES.map((uni) => (
                <option key={uni} value={uni}>{uni}</option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Artículos cerca de ti</h3>
              {ubicacion && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <IconoUbicacion className="w-4 h-4" />
                  <span>{textoBadgeUbicacion}</span>
                </span>
              )}
            </div>

            {cargando ? (
              <p className="text-center py-12 text-gray-500">Cargando...</p>
            ) : articulosFiltrados.length === 0 ? (
              <div className="text-center py-12 bg-surface rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No hay artículos que coincidan con tu búsqueda o filtros.</p>
              </div>
            ) : (
              <div id="product-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {articulosFiltrados.map((articulo) => (
                  <TarjetaArticulo
                    key={articulo.id}
                    articulo={articulo}
                    onClick={() => setArticuloModal(articulo)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer
        onElegirCategoria={elegirCategoriaDesdeFooter}
        onElegirUniversidad={elegirUniversidadDesdeFooter}
      />
      </div>

      {articuloModal && (
        <ModalProducto
          articulo={articuloModal}
          onCerrar={() => setArticuloModal(null)}
          onAgregar={() => agregarAlCarrito(articuloModal.id)}
        />
      )}
    </>
  );
}
