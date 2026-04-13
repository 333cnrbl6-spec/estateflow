import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inspectionId } = await req.json();

    if (!inspectionId) {
      return Response.json({ error: 'Missing inspectionId' }, { status: 400 });
    }

    // Fetch inspection record
    const inspection = await base44.entities.InspectionRecord.get(inspectionId);
    if (!inspection) {
      return Response.json({ error: 'Inspection not found' }, { status: 404 });
    }

    // Fetch property and unit details
    const property = await base44.entities.Property.get(inspection.property_id);
    const unit = inspection.unit_id ? await base44.entities.Unit.get(inspection.unit_id) : null;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    const margin = 15;
    const lineHeight = 5;

    // Helper functions
    const addSection = (title) => {
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 51);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin, yPosition);
      yPosition += 8;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 3;
    };

    const addField = (label, value) => {
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text(`${label}:`, margin, yPosition);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(51, 51, 51);
      const fieldValue = String(value || '—');
      doc.text(fieldValue, margin + 50, yPosition);
      yPosition += lineHeight + 1;
    };

    const checkNewPage = () => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(33, 88, 135);
    doc.text('Property Inspection Report', margin, yPosition);
    yPosition += 12;

    // Property Info Section
    addSection('Property Information');
    addField('Property', property?.name || 'Unknown');
    addField('Address', `${property?.address_line_1 || ''} ${property?.city || ''} ${property?.postcode || ''}`);
    if (unit) {
      addField('Unit', unit.unit_reference || 'N/A');
    }
    yPosition += 3;

    // Inspection Details Section
    checkNewPage();
    addSection('Inspection Details');
    addField('Inspector', inspection.inspector_name || 'Unknown');
    addField('Date', new Date(inspection.inspection_date).toLocaleDateString('en-GB'));
    addField('Type', inspection.inspection_type?.replace(/_/g, ' ').toUpperCase());
    addField('Overall Condition', inspection.overall_condition?.toUpperCase());
    yPosition += 3;

    // Room Inspections Section
    checkNewPage();
    addSection('Room-by-Room Assessment');

    (inspection.room_inspections || []).forEach(room => {
      checkNewPage();
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(70, 130, 180);
      doc.text(`${room.room_name}`, margin, yPosition);
      yPosition += 6;

      if (room.condition_rating) {
        addField('Condition', room.condition_rating);
      }

      if (room.comments) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text('Notes:', margin, yPosition);
        yPosition += lineHeight;
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(51, 51, 51);
        const wrappedText = doc.splitTextToSize(room.comments, pageWidth - margin * 2);
        doc.text(wrappedText, margin, yPosition);
        yPosition += wrappedText.length * lineHeight + 2;
      }

      if (room.fixtures && room.fixtures.length > 0) {
        checkNewPage();
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text('Fixtures & Issues:', margin, yPosition);
        yPosition += 4;

        room.fixtures.forEach(fixture => {
          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');
          const fixtureText = `• ${fixture.fixture_name} - ${fixture.condition}`;
          if (fixture.needs_repair) {
            doc.setTextColor(200, 0, 0);
            doc.text(`${fixtureText} (${fixture.repair_priority})`, margin + 3, yPosition);
          } else {
            doc.setTextColor(51, 51, 51);
            doc.text(fixtureText, margin + 3, yPosition);
          }
          yPosition += lineHeight + 1;
        });
        yPosition += 2;
      }
    });

    // Issues Section
    checkNewPage();
    if (inspection.issues_identified && inspection.issues_identified.length > 0) {
      addSection('Issues Identified');
      inspection.issues_identified.forEach(issue => {
        checkNewPage();
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        const severityColor = {
          low: [100, 150, 100],
          medium: [200, 150, 0],
          high: [200, 100, 0],
          critical: [200, 0, 0],
        };
        doc.setTextColor(...(severityColor[issue.severity] || [0, 0, 0]));
        doc.text(`${issue.title} [${issue.severity.toUpperCase()}]`, margin, yPosition);
        yPosition += 5;

        doc.setFont(undefined, 'normal');
        doc.setTextColor(51, 51, 51);
        const issueText = doc.splitTextToSize(issue.description, pageWidth - margin * 2);
        doc.text(issueText, margin, yPosition);
        yPosition += issueText.length * lineHeight + 3;

        if (issue.room) {
          doc.setTextColor(100, 100, 100);
          doc.text(`Location: ${issue.room}`, margin, yPosition);
          yPosition += lineHeight + 1;
        }
        yPosition += 2;
      });
    }

    // Summary Section
    checkNewPage();
    addSection('Summary & Recommendations');
    if (inspection.summary_notes) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(51, 51, 51);
      const summaryText = doc.splitTextToSize(inspection.summary_notes, pageWidth - margin * 2);
      doc.text(summaryText, margin, yPosition);
      yPosition += summaryText.length * lineHeight;
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')} | Report ID: ${inspectionId}`, margin, pageHeight - 10);

    // Get PDF as base64
    const pdfBase64 = doc.output('datauristring').split(',')[1];
    const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

    // Save PDF to file storage
    const fileName = `inspection-${inspectionId}-${Date.now()}.pdf`;
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const file = new File([blob], fileName, { type: 'application/pdf' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Update inspection record with PDF URL
    await base44.entities.InspectionRecord.update(inspectionId, {
      pdf_url: file_url,
      status: 'submitted',
      submitted_date: new Date().toISOString(),
    });

    return Response.json({ success: true, pdf_url: file_url });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});