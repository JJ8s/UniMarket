import { cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FormularioCategoria from '../../admin/components/FormularioCategoria';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('4. Estado (state)', () => {
  afterEach(cleanup);

  it('7) FormularioCategoria actualiza su estado cuando el usuario escribe', () => {
    const onGuardar = jasmine.createSpy('onGuardar');
    const { getByLabelText } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FormularioCategoria onGuardar={onGuardar} textoBoton="Crear categoría" />
      </MemoryRouter>
    );
    const nombre = getByLabelText('Nombre *');
    const descripcion = getByLabelText('Descripción');
    expect(nombre.value).toBe('');

    fireEvent.change(nombre, { target: { name: 'etiqueta', value: 'Deportes' } });
    fireEvent.change(descripcion, { target: { name: 'descripcion', value: 'Articulos deportivos' } });

    expect(nombre.value).toBe('Deportes');
    expect(descripcion.value).toBe('Articulos deportivos');
    expect(onGuardar).not.toHaveBeenCalled();
  });
});
