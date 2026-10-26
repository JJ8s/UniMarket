import { cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SelectorModal from '../components/SelectorModal';
import EstadoVacio from '../components/EstadoVacio';
import TarjetaMetrica from '../admin/components/TarjetaMetrica';
import MensajeError from '../admin/components/MensajeError';
import InsigniaStock from '../admin/components/InsigniaStock';
import InsigniaEstadoOrden from '../admin/components/InsigniaEstadoOrden';
import BuscadorFiltros from '../admin/components/BuscadorFiltros';
import FormularioCategoria from '../admin/components/FormularioCategoria';

// Ajuste para Testing Library
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => cleanup());

const OPCIONES = [
  { valor: 'snacks', etiqueta: 'Snacks & Comida' },
  { valor: 'ropa', etiqueta: 'Ropa & Accesorios' },
  { valor: 'libros', etiqueta: 'Libros & Material de Estudio' },
];

const espiar = () => {
  const llamadas = [];
  const fn = (...args) => { llamadas.push(args); };
  fn.llamadas = llamadas;
  return fn;
};

describe('1. Renderizado correcto', () => {
  it('1) SelectorModal lista todas las opciones recibidas al abrirse', () => {
    const { getByText, container } = render(
      <SelectorModal valor="" onCambio={espiar()} titulo="Seleccionar categoria" textoVacio="Seleccionar..." opciones={OPCIONES} />
    );
    fireEvent.click(getByText('Seleccionar...'));

    expect(container.querySelectorAll('.option-item').length).toBe(3);
    expect(getByText('Ropa & Accesorios')).toBeTruthy();
  });

  it('2) TarjetaMetrica muestra el titulo, el valor y el detalle', () => {
    const { getByText } = render(<TarjetaMetrica titulo="Compras" valor="$79.00" detalle="4 pagadas" icono="fa-cart-shopping" color="primary" />);

    expect(getByText('Compras')).toBeTruthy();
    expect(getByText('$79.00')).toBeTruthy();
    expect(getByText('4 pagadas')).toBeTruthy();
  });
});

describe('2. Renderizado condicional', () => {
  it('3) MensajeError solo se muestra cuando hay un error', () => {
    const sinError = render(<MensajeError mensaje="" />);
    expect(sinError.container.querySelector('[role="alert"]')).toBeNull();
    sinError.unmount();

    const conError = render(<MensajeError mensaje="El nombre no puede quedar vacío." />);
    expect(conError.getByRole('alert').textContent).toBe('El nombre no puede quedar vacío.');
  });

  it('4) InsigniaStock muestra "Agotado" con stock 0 y las unidades en otro caso', () => {
    const agotado = render(<InsigniaStock stock={0} />);
    expect(agotado.getByText('Agotado')).toBeTruthy();
    agotado.unmount();

    const disponible = render(<InsigniaStock stock={12} />);
    expect(disponible.getByText('12 u.')).toBeTruthy();
    expect(disponible.queryByText('Agotado')).toBeNull();
  });
});

describe('3. Propiedades (props)', () => {
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

  it('6) InsigniaEstadoOrden cambia de color segun la prop "estado"', () => {
    const pagada = render(<InsigniaEstadoOrden estado="Pagada" />);
    expect(pagada.getByText('Pagada').className).toContain('text-bg-success');
    pagada.unmount();

    const anulada = render(<InsigniaEstadoOrden estado="Anulada" />);
    expect(anulada.getByText('Anulada').className).toContain('text-bg-secondary');
  });
});

describe('4. Estado (state)', () => {
  it('7) FormularioCategoria actualiza su estado cuando el usuario escribe', () => {
    const { getByLabelText } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FormularioCategoria onGuardar={espiar()} textoBoton="Crear categoría" />
      </MemoryRouter>
    );
    const nombre = getByLabelText('Nombre *');
    const descripcion = getByLabelText('Descripción');
    expect(nombre.value).toBe('');

    fireEvent.change(nombre, { target: { name: 'etiqueta', value: 'Deportes' } });
    fireEvent.change(descripcion, { target: { name: 'descripcion', value: 'Articulos deportivos' } });

    expect(nombre.value).toBe('Deportes');
    expect(descripcion.value).toBe('Articulos deportivos');
  });

  it('8) SelectorModal abre su modal al hacer clic y lo cierra con Escape', () => {
    const { getByText, container } = render(
      <SelectorModal valor="ropa" onCambio={espiar()} titulo="Seleccionar categoria" textoVacio="Seleccionar..." opciones={OPCIONES} />
    );
    expect(container.querySelector('.modal-overlay')).toBeNull();

    fireEvent.click(getByText('Ropa & Accesorios'));
    expect(container.querySelector('.modal-overlay')).not.toBeNull();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(container.querySelector('.modal-overlay')).toBeNull();
  });
});

describe('5. Eventos', () => {
  it('9) BuscadorFiltros llama a onBusqueda con el texto que se escribe', () => {
    const onBusqueda = espiar();
    const { getByPlaceholderText } = render(<BuscadorFiltros busqueda="" onBusqueda={onBusqueda} placeholder="Buscar producto..." />);

    fireEvent.change(getByPlaceholderText('Buscar producto...'), { target: { value: 'brownie' } });

    expect(onBusqueda.llamadas.length).toBe(1);
    expect(onBusqueda.llamadas[0][0]).toBe('brownie');
  });

  it('10) FormularioCategoria envia los datos al guardar y muestra el error que devuelve', async () => {
    const onGuardar = async (campos) => { onGuardar.recibido = campos; return { ok: false, mensaje: 'Ya existe una categoría con ese nombre.' }; };
    const { getByLabelText, getByText, findByRole } = render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <FormularioCategoria onGuardar={onGuardar} textoBoton="Crear categoría" />
      </MemoryRouter>
    );

    fireEvent.change(getByLabelText('Nombre *'), { target: { name: 'etiqueta', value: 'Otros' } });
    fireEvent.click(getByText('Crear categoría'));

    const alerta = await findByRole('alert');
    expect(onGuardar.recibido.etiqueta).toBe('Otros');
    expect(alerta.textContent).toBe('Ya existe una categoría con ese nombre.');
  });
});
