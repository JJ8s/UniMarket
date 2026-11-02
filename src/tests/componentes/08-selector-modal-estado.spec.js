import { cleanup, fireEvent, render } from '@testing-library/react';
import SelectorModal from '../../components/SelectorModal';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const OPCIONES = [
  { valor: 'snacks', etiqueta: 'Snacks & Comida' },
  { valor: 'ropa', etiqueta: 'Ropa & Accesorios' },
  { valor: 'libros', etiqueta: 'Libros & Material de Estudio' },
];

describe('4. Estado (state)', () => {
  afterEach(cleanup);

  it('8) SelectorModal abre su modal al hacer clic y lo cierra con Escape', () => {
    const onCambio = jasmine.createSpy('onCambio');
    const { getByText, container } = render(
      <SelectorModal valor="ropa" onCambio={onCambio} titulo="Seleccionar categoria" textoVacio="Seleccionar..." opciones={OPCIONES} />
    );
    expect(container.querySelector('.modal-overlay')).toBeNull();

    fireEvent.click(getByText('Ropa & Accesorios'));
    expect(container.querySelector('.modal-overlay')).not.toBeNull();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(container.querySelector('.modal-overlay')).toBeNull();
    expect(onCambio).not.toHaveBeenCalled();
  });
});
