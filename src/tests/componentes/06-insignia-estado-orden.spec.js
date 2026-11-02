import { cleanup, render } from '@testing-library/react';
import InsigniaEstadoOrden from '../../admin/components/InsigniaEstadoOrden';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('3. Propiedades (props)', () => {
  afterEach(cleanup);

  it('6) InsigniaEstadoOrden cambia de color segun la prop "estado"', () => {
    const pagada = render(<InsigniaEstadoOrden estado="Pagada" />);
    expect(pagada.getByText('Pagada').className).toContain('text-bg-success');
    pagada.unmount();

    const anulada = render(<InsigniaEstadoOrden estado="Anulada" />);
    expect(anulada.getByText('Anulada').className).toContain('text-bg-secondary');
  });
});
