import { useEffect, useState } from 'react';

/**
 * Selector de una sola opcion que se elige desde un modal (Categoria,
 * Estado). Muestra un boton con el valor actual; al tocarlo abre el modal
 * con radio buttons. (Reemplaza la clase SelectorModal de publicar.js.)
 *
 * @param {string} valor            valor elegido ('' si ninguno)
 * @param {Function} onCambio       recibe el valor nuevo
 * @param {string} titulo           encabezado del modal
 * @param {string} textoVacio       texto del boton cuando no hay valor
 * @param {Array<{valor,etiqueta}>} opciones
 */
export default function SelectorModal({ valor, onCambio, titulo, textoVacio, opciones }) {
  const [abierto, setAbierto] = useState(false);
  const elegida = opciones.find((opcion) => opcion.valor === valor);

  useEffect(() => {
    if (!abierto) return undefined;
    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('keydown', alPresionarTecla);
    return () => document.removeEventListener('keydown', alPresionarTecla);
  }, [abierto]);

  const elegir = (opcion) => {
    onCambio(opcion.valor);
    setAbierto(false);
  };

  return (
    <>
      <button
        type="button"
        className={`form-select ${elegida ? 'has-value' : ''}`}
        onClick={() => setAbierto(true)}
      >
        {elegida ? elegida.etiqueta : textoVacio}
      </button>

      {abierto && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setAbierto(false)}>
          <div className="modal-content option-modal-content">
            <h4 className="option-modal-title">{titulo}</h4>
            <div>
              {opciones.map((opcion) => (
                <button key={opcion.valor} type="button" className="option-item" onClick={() => elegir(opcion)}>
                  <span>{opcion.etiqueta}</span>
                  <span className={`option-radio ${opcion.valor === valor ? 'option-radio-selected' : ''}`}></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
