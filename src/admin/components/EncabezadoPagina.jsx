export default function EncabezadoPagina({ titulo, subtitulo, children }) {
  return (
    <div className="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-3">
      <div>
        <h1 className="h4 mb-0">{titulo}</h1>
        {subtitulo && <p className="text-secondary small mb-0">{subtitulo}</p>}
      </div>
      {children && <div className="d-flex flex-wrap gap-2 d-print-none">{children}</div>}
    </div>
  );
}
