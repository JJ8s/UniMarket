/**
 * Barra de busqueda de las listas. `children` permite agregar filtros extra
 * (por ejemplo un <select> de categoria) al lado del campo de texto.
 */
export default function BuscadorFiltros({ busqueda, onBusqueda, placeholder, children }) {
  return (
    <div className="row g-2 mb-3">
      <div className="col-12 col-md-6 col-lg-4">
        <input
          type="search"
          className="form-control"
          placeholder={placeholder}
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
        />
      </div>
      {children}
    </div>
  );
}
