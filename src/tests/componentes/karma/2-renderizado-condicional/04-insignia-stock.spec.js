import { cleanup, render } from '@testing-library/react';
import InsigniaStock from '../../../../admin/components/InsigniaStock';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('2. Renderizado condicional', () => {
  afterEach(cleanup);

  it('4) InsigniaStock muestra "Agotado" con stock 0 y las unidades en otro caso', () => {
    const agotado = render(<InsigniaStock stock={0} />);
    expect(agotado.getByText('Agotado')).toBeTruthy();
    agotado.unmount();

    const disponible = render(<InsigniaStock stock={12} />);
    expect(disponible.getByText('12 u.')).toBeTruthy();
    expect(disponible.queryByText('Agotado')).toBeNull();
  });
});
