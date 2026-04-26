import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportElementToPDF(elementRef, filename = 'document.pdf') {
  try {
    const element = elementRef.current || elementRef;
    if (!element) throw new Error('Element not found');

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const pdf = new jsPDF('a4', 'mm', 'a4');
    
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
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