export default function BuscadorFiltros({ busqueda, onBusqueda, placeholder, children }) {
  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      <div className="flex-grow-1" style={{ minWidth: "200px" }}>
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
