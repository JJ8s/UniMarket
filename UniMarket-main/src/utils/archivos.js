// Descarga de archivos generados en el navegador (sin servidor).

/** Descarga `texto` como archivo CSV. El BOM inicial hace que Excel respete las tildes. */
export function descargarCsv(nombreArchivo, texto) {
  const blob = new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}
