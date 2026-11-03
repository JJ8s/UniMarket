import { cleanup, fireEvent, render } from '@testing-library/react';
import BuscadorFiltros from '../../../../admin/components/BuscadorFiltros';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('5. Eventos', () => {
  afterEach(cleanup);

  it('9) BuscadorFiltros llama a onBusqueda con el texto que se escribe', () => {
    const onBusqueda = jasmine.createSpy('onBusqueda');
    const { getByPlaceholderText } = render(<BuscadorFiltros busqueda="" onBusqueda={onBusqueda} placeholder="Buscar producto..." />);

    fireEvent.change(getByPlaceholderText('Buscar producto...'), { target: { value: 'brownie' } });

    expect(onBusqueda).toHaveBeenCalledTimes(1);
    expect(onBusqueda).toHaveBeenCalledWith('brownie');
  });
});
