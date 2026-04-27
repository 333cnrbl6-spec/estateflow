import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportElementToPDF(elementRef, filename = 'document.pdf') {
  try {
    const element = elementRef.current || elementRef;
    if (!element) throw new Error('Element not found');

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210;
    const pageHeight = 297;
    let heightLeft = canvas.height * imgWidth / canvas.width;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, heightLeft);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - canvas.height * imgWidth / canvas.width;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, canvas.height * imgWidth / canvas.width);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  }
}

// Export plain text document to PDF with Premiso branding
export function exportTextToPDF(title, body, property = null, filename = null) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header bar
  pdf.setFillColor(26, 54, 93); // dark blue
  pdf.rect(0, 0, 210, 14, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PREMISO', margin, 9);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('Property Intelligence Platform', margin + 22, 9);
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - margin, 9, { align: 'right' });

  y = 24;

  // Property header
  if (property) {
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(8);
    pdf.text(`Property: ${property.name || ''} ${property.address_line_1 || ''} ${property.postcode || ''}`.trim(), margin, y);
    y += 6;
  }

  // Document title
  pdf.setTextColor(15, 23, 42);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title || 'Document', margin, y);
  y += 8;

  // Divider
  pdf.setDrawColor(203, 213, 225);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Body text
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(30, 41, 59);

  const lines = pdf.splitTextToSize(body || '', contentWidth);
  lines.forEach(line => {
    if (y > 275) {
      pdf.addPage();
      y = margin;
      // page number
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
    }
    pdf.text(line, margin, y);
    y += 4.5;
  });

  // Footer
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(7);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Page ${i} of ${pageCount} — Premiso Property Intelligence`, margin, 290);
    pdf.text('This document is AI-generated. Seek legal advice before use.', pageWidth - margin, 290, { align: 'right' });
  }

  const safeFilename = filename || `${(title || 'document').replace(/\s+/g, '_').toLowerCase()}.pdf`;
  pdf.save(safeFilename);
}