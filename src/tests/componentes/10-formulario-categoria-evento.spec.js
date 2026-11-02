import { cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FormularioCategoria from '../../admin/components/FormularioCategoria';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('5. Eventos', () => {
  afterEach(cleanup);

  it('10) FormularioCategoria envia los datos al guardar y muestra el error que devuelve', async () => {
    const onGuardar = jasmine.createSpy('onGuardar').and.resolveTo({ ok: false, mensaje: 'Ya existe una categoría con ese nombre.' });
    const { getByLabelText, getByText, findByRole } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FormularioCategoria onGuardar={onGuardar} textoBoton="Crear categoría" />
      </MemoryRouter>
    );

    fireEvent.change(getByLabelText('Nombre *'), { target: { name: 'etiqueta', value: 'Otros' } });
    fireEvent.click(getByText('Crear categoría'));

    const alerta = await findByRole('alert');
    expect(onGuardar).toHaveBeenCalledTimes(1);
    expect(onGuardar).toHaveBeenCalledWith(jasmine.objectContaining({ etiqueta: 'Otros' }));
    expect(alerta.textContent).toBe('Ya existe una categoría con ese nombre.');
  });
});
