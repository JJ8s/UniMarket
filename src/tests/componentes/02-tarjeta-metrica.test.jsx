import { cleanup, render } from '@testing-library/react';
import TarjetaMetrica from '../../admin/components/TarjetaMetrica';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('1. Renderizado correcto', () => {
  afterEach(cleanup);

  it('2) TarjetaMetrica muestra el titulo, el valor y el detalle', () => {
    const { getByText } = render(<TarjetaMetrica titulo="Compras" valor="$79.00" detalle="4 pagadas" icono="fa-cart-shopping" color="primary" />);

    expect(getByText('Compras')).toBeTruthy();
    expect(getByText('$79.00')).toBeTruthy();
    expect(getByText('4 pagadas')).toBeTruthy();
  });
});
