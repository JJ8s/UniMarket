import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SelectorModal from '../components/SelectorModal';
import { useAuth } from '../context/AuthContext';
import { useCategorias } from '../context/CategoriasContext';
import { UNIVERSIDADES_DISPONIBLES, crearArticulo } from '../data/datos';
import useBodyClass from '../hooks/useBodyClass';
import { OPCIONES_ESTADO, comprimirImagen } from '../utils/utilidades';

const MAX_FOTOS = 4;
const MAX_ENTREGA = 300;

const FORMULARIO_INICIAL = {
  titulo: '',
  descripcion: '',
  categoria: '',
  estado: '',
  precio: '',
  stock: '1',
  entrega: '',
};

export default function Publicar() {
  useBodyClass('bg-surface');
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const { opciones: opcionesCategoria } = useCategorias();
  const [guardando, setGuardando] = useState(false);

  const [campos, setCampos] = useState(FORMULARIO_INICIAL);
  const [fotos, setFotos] = useState([]);
  const [universidadesVenta, setUniversidadesVenta] = useState([]);

  const cambiarCampo = (nombre, valor) => setCampos((anterior) => ({ ...anterior, [nombre]: valor }));
  const manejarInput = (evento) => cambiarCampo(evento.target.name, evento.target.value);

  const manejarFotos = async (evento) => {
    const archivos = Array.from(evento.target.files).slice(0, MAX_FOTOS);
    const comprimidas = await Promise.all(archivos.map((archivo) => comprimirImagen(archivo, 480, 0.7)));
    setFotos(comprimidas);
  };

  const alternarUniversidad = (universidad) => {
    setUniversidadesVenta((actuales) =>
      actuales.includes(universidad)
        ? actuales.filter((u) => u !== universidad)
        : [...actuales, universidad]
    );
  };

  const validar = () => {
    if (!campos.categoria) return 'Selecciona una categoria.';
    if (!campos.estado) return 'Selecciona el estado del producto.';

    const precio = parseFloat(campos.precio);
    if (!campos.precio || isNaN(precio) || precio <= 0) return 'Ingresa un precio valido, mayor a cero.';

    const stock = parseInt(campos.stock, 10);
    if (!campos.stock || isNaN(stock) || stock < 1) return 'Ingresa una cantidad valida, minimo 1.';

    const entrega = campos.entrega.trim();
    if (!entrega) return 'Escribe un punto de entrega.';
    if (entrega.length > MAX_ENTREGA) return 'El punto de entrega supera los 300 caracteres.';
    return null;
  };

  const generarTituloAutomatico = (categoria) => {
    const opcion = opcionesCategoria.find((o) => o.valor === categoria);
    return `Articulo de ${opcion ? opcion.etiqueta : categoria} sin titulo`;
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    const errorValidacion = validar();
    if (errorValidacion) {
      alert(errorValidacion);
      return;
    }

    setGuardando(true);
    const resultado = await crearArticulo({
      nombre: campos.titulo.trim() || generarTituloAutomatico(campos.categoria),
      descripcion: campos.descripcion.trim(),
      precio: parseFloat(campos.precio),
      categoria: campos.categoria,
      universidad: usuario.universidad || 'Sin universidad',
      vendedor: usuario.nombre || 'Vendedor',
      condicion: campos.estado,
      stock: parseInt(campos.stock, 10),
      entrega: campos.entrega.trim(),
      universidadesVenta,
      fotos,
    });
    setGuardando(false);

    if (!resultado.ok) {
      alert(resultado.mensaje || 'No se pudo guardar la publicacion. Intenta con fotos mas livianas o menos fotos.');
      return;
    }
    navigate('/');
  };

  return (
    <>
      <Header />

      <main className="max-w-2xl mx-auto px-6 py-8">
        <Link to="/panel-vendedor" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver al panel de vendedor
        </Link>

        <h2 className="text-3xl font-bold text-primary mt-4 mb-6">Crear Publicación</h2>

        <form onSubmit={manejarEnvio}>
          {/* FOTOS */}
          <section className="form-section">
            <h3 className="form-section-title">
              <img src="/img/icono-camara.png" alt="camara" className="form-section-icon" />
              Fotos del Producto
            </h3>

            <label htmlFor="input-fotos" className="upload-box">
              <img src="/img/icono-subir-imagen.png" alt="subir imagen" className="upload-box-icon" />
              <span className="upload-box-title">Sube hasta 4 fotos</span>
              <span className="upload-box-subtitle">Muestra el estado real del producto. Formatos soportados: JPG, PNG. Máximo 5MB por foto.</span>
              <div className="upload-preview">
                {fotos.map((foto, indice) => (
                  <img key={indice} src={foto} className="upload-preview-thumb" alt="foto del producto" />
                ))}
              </div>
            </label>
            <input
              type="file"
              id="input-fotos"
              accept="image/png, image/jpeg"
              multiple
              className="hidden"
              onChange={manejarFotos}
            />
          </section>

          {/* INFORMACION */}
          <section className="form-section">
            <h3 className="form-section-title">
              <img src="/img/icono-info.png" alt="informacion" className="form-section-icon" />
              Información del Producto
            </h3>

            <label className="form-label" htmlFor="campo-titulo">Título del producto</label>
            <input type="text" id="campo-titulo" name="titulo" className="form-input" maxLength={120}
                   placeholder="Ej: Calculadora Científica Casio fx-991LA X"
                   value={campos.titulo} onChange={manejarInput} />
            <p className="form-hint">Déjalo vacío para que Unimarket genere uno automáticamente.</p>

            <label className="form-label" htmlFor="campo-descripcion">Descripción</label>
            <textarea id="campo-descripcion" name="descripcion" className="form-textarea" rows={4} maxLength={500}
                      placeholder="Describe los detalles, tiempo de uso, si tiene algún detalle o desperfecto..."
                      value={campos.descripcion} onChange={manejarInput}></textarea>

            <label className="form-label">Categoría</label>
            <SelectorModal
              valor={campos.categoria}
              onCambio={(valor) => cambiarCampo('categoria', valor)}
              titulo="Seleccionar categoria"
              textoVacio="Seleccionar categoría..."
              opciones={opcionesCategoria}
            />

            <label className="form-label">Estado</label>
            <SelectorModal
              valor={campos.estado}
              onCambio={(valor) => cambiarCampo('estado', valor)}
              titulo="Seleccionar estado"
              textoVacio="Seleccionar estado..."
              opciones={OPCIONES_ESTADO}
            />
          </section>

          {/* PRECIO E INVENTARIO */}
          <section className="form-section">
            <h3 className="form-section-title">
              <img src="/img/icono-dolar.png" alt="precio" className="form-section-icon" />
              Precio e Inventario
            </h3>

            <label className="form-label" htmlFor="campo-precio">Precio</label>
            <div className="form-input-adornado">
              <span className="form-input-prefijo">$</span>
              <input type="number" id="campo-precio" name="precio" step="0.01" min="0" placeholder="0.00"
                     value={campos.precio} onChange={manejarInput} />
            </div>

            <label className="form-label" htmlFor="campo-stock">Cantidad (Stock)</label>
            <input type="number" id="campo-stock" name="stock" className="form-input" min="1"
                   value={campos.stock} onChange={manejarInput} />
            <p className="form-hint">El código SKU para tu inventario lo genera Unimarket automáticamente al publicar.</p>
          </section>

          {/* PUNTO DE ENTREGA */}
          <section className="form-section">
            <h3 className="form-section-title">
              <img src="/img/icono-entrega.png" alt="entrega" className="form-section-icon" />
              Punto de Entrega
            </h3>
            <p className="form-section-description">
              Escribe en qué lugar del campus estás dispuesto a entregar este producto.
            </p>

            <textarea id="campo-entrega" name="entrega" className="form-textarea" rows={3} maxLength={MAX_ENTREGA}
                      placeholder="Ej: Biblioteca Central, entrada principal, de 3pm a 5pm."
                      value={campos.entrega} onChange={manejarInput}></textarea>
            <p className="form-hint form-hint-derecha">{campos.entrega.length}/{MAX_ENTREGA}</p>
          </section>

          {/* UNIVERSIDADES */}
          <section className="form-section">
            <h3 className="form-section-title">
              <img src="/img/icono-universidad.png" alt="universidad" className="form-section-icon" />
              Universidades donde vendes
            </h3>
            <p className="form-section-description">
              No es obligatorio. Si no marcas ninguna, tu producto se muestra a estudiantes de cualquier universidad.
              Si marcas una o mas, solo va a aparecer cuando busquen en esas universidades.
            </p>

            <div className="checklist">
              {UNIVERSIDADES_DISPONIBLES.map((universidad, indice) => (
                <label key={universidad} className="checklist-item">
                  <input
                    type="checkbox"
                    id={`universidad-${indice}`}
                    checked={universidadesVenta.includes(universidad)}
                    onChange={() => alternarUniversidad(universidad)}
                  />
                  <span>{universidad}</span>
                </label>
              ))}
            </div>
          </section>

          <button type="submit" className="submit-btn" disabled={guardando}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            {guardando ? 'Publicando...' : 'Publicar Producto'}
          </button>
        </form>
      </main>
    </>
  );
}
