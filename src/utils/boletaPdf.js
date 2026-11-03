import { formatearFechaHora, formatearPrecio } from './utilidades';

const AZUL = [26, 54, 93];
const NARANJA = [249, 115, 22];
const GRIS = [100, 116, 139];

/** Descarga la boleta de una orden como PDF (jsPDF se carga solo al usarlo). */
export async function descargarBoletaPdf(orden) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const ancho = doc.internal.pageSize.getWidth();
  const margen = 18;
  let y = 0;

  doc.setFillColor(...AZUL);
  doc.rect(0, 0, ancho, 32, 'F');
  doc.setFillColor(...NARANJA);
  doc.rect(0, 32, ancho, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('UniMarket', margen, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Boleta electrónica', margen, 25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`N° ${orden.folio}`, ancho - margen, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(formatearFechaHora(orden.creadaEn), ancho - margen, 25, { align: 'right' });

  y = 46;
  const dato = (etiqueta, valor, x, yy) => {
    doc.setTextColor(...GRIS);
    doc.setFontSize(8);
    doc.text(etiqueta.toUpperCase(), x, yy);
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.text(String(valor), x, yy + 5.5);
    doc.setFont('helvetica', 'normal');
  };
  dato('Cliente', orden.cliente.nombre, margen, y);
  doc.setFontSize(9);
  doc.setTextColor(...GRIS);
  doc.text(orden.cliente.correo || '', margen, y + 10.5);
  dato('Pago', `${orden.metodoPago} terminada en ${orden.ultimosDigitos}`, ancho / 2 + 4, y);
  doc.setFontSize(9);
  doc.setTextColor(...GRIS);
  doc.text(`Autorización ${orden.autorizacion}`, ancho / 2 + 4, y + 10.5);
  dato('Estado', orden.estado, margen, y + 20);

  y += 36;
  const colProducto = margen + 2;
  const colVendedor = 92;
  const colPrecio = 138;
  const colCant = 156;
  const colSub = ancho - margen - 2;

  doc.setFillColor(247, 250, 252);
  doc.rect(margen, y, ancho - margen * 2, 9, 'F');
  doc.setTextColor(...AZUL);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Producto', colProducto, y + 6);
  doc.text('Vendedor', colVendedor, y + 6);
  doc.text('Precio', colPrecio, y + 6, { align: 'right' });
  doc.text('Cant.', colCant, y + 6, { align: 'right' });
  doc.text('Subtotal', colSub, y + 6, { align: 'right' });
  y += 9;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  orden.lineas.forEach((linea) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }
    const nombre = doc.splitTextToSize(String(linea.nombre), colVendedor - colProducto - 4);
    const alto = Math.max(nombre.length * 4.6, 6) + 4;
    doc.setFontSize(9.5);
    doc.text(nombre, colProducto, y + 6);
    doc.text(doc.splitTextToSize(String(linea.vendedor || ''), 40), colVendedor, y + 6);
    doc.text(formatearPrecio(linea.precio), colPrecio, y + 6, { align: 'right' });
    doc.text(String(linea.cantidad), colCant, y + 6, { align: 'right' });
    doc.text(formatearPrecio(linea.precio * linea.cantidad), colSub, y + 6, { align: 'right' });
    y += alto;
    doc.setDrawColor(226, 232, 240);
    doc.line(margen, y, ancho - margen, y);
  });

  y += 8;
  doc.setFillColor(...AZUL);
  doc.roundedRect(ancho - margen - 70, y, 70, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL', ancho - margen - 66, y + 7.8);
  doc.text(formatearPrecio(orden.total), ancho - margen - 4, y + 7.8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);
  doc.text('Documento generado por UniMarket. Pago simulado con fines académicos.', ancho / 2, 287, { align: 'center' });

  doc.save(`boleta-${orden.folio}.pdf`);
}
