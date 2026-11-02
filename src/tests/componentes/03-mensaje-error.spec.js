import { cleanup, render } from '@testing-library/react';
import MensajeError from '../../admin/components/MensajeError';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('2. Renderizado condicional', () => {
  afterEach(cleanup);

  it('3) MensajeError solo se muestra cuando hay un error', () => {
    const sinError = render(<MensajeError mensaje="" />);
    expect(sinError.container.querySelector('[role="alert"]')).toBeNull();
    sinError.unmount();

    const conError = render(<MensajeError mensaje="El nombre no puede quedar vacío." />);
    expect(conError.getByRole('alert').textContent).toBe('El nombre no puede quedar vacío.');
  });
});
