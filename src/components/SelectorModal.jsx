import { useEffect, useState } from 'react';

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
