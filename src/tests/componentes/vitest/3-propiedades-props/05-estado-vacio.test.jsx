import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EstadoVacio from '../../../../components/EstadoVacio';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('3. Propiedades (props)', () => {
  afterEach(cleanup);

  it('5) EstadoVacio usa el mensaje, el texto y el destino del enlace que recibe', () => {
    const { getByText, container } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <EstadoVacio mensaje="Tu bolsa está vacía." enlaceA="/" enlaceTexto="Ir al catálogo" icono="fa-store" />
      </MemoryRouter>
    );

    expect(getByText('Tu bolsa está vacía.')).toBeTruthy();
    const enlace = container.querySelector('a');
    expect(enlace.textContent).toContain('Ir al catálogo');
    expect(enlace.getAttribute('href')).toBe('/');
  });
});
