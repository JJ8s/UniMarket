import { vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import SelectorModal from '../../../../components/SelectorModal';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const OPCIONES = [
  { valor: 'snacks', etiqueta: 'Snacks & Comida' },
  { valor: 'ropa', etiqueta: 'Ropa & Accesorios' },
  { valor: 'libros', etiqueta: 'Libros & Material de Estudio' },
];

describe('1. Renderizado correcto', () => {
  afterEach(cleanup);

  it('1) SelectorModal lista todas las opciones recibidas al abrirse', () => {
    const onCambio = vi.fn();
    const { getByText, container } = render(
      <SelectorModal valor="" onCambio={onCambio} titulo="Seleccionar categoria" textoVacio="Seleccionar..." opciones={OPCIONES} />
    );
    fireEvent.click(getByText('Seleccionar...'));

    expect(container.querySelectorAll('.option-item').length).toBe(3);
    expect(getByText('Ropa & Accesorios')).toBeTruthy();
    expect(onCambio).not.toHaveBeenCalled();
  });
});
