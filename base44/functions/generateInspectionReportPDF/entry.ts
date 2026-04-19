import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import jspdf from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inspectionId } = await req.json();

    if (!inspectionId) {
      return Response.json({ error: 'Inspection ID required' }, { status: 400 });
    }

    // Fetch inspection data
    const inspection = await base44.entities.PropertyInspection.get(inspectionId);
    
    if (!inspection) {
      return Response.json({ error: 'Inspection not found' }, { status: 404 });
    }

    // Fetch property and tenant details
    const property = inspection.property_id ? await base44.entities.Property.get(inspection.property_id) : null;
    const tenant = inspection.tenant_id ? await base44.entities.Tenant.get(inspection.tenant_id) : null;

    // Create PDF
    const doc = new jspdf();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Property Inspection Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Property details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Property: ${property?.name || 'N/A'}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Address: ${property?.address_line_1 || ''}, ${property?.city || ''}, ${property?.postcode || ''}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Inspection Type: ${inspection.inspection_type.replace('_', ' ').toUpperCase()}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Date: ${inspection.completed_date ? new Date(inspection.completed_date).toLocaleDateString() : 'Pending'}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Inspector: ${inspection.inspector_name} (${inspection.inspector_email})`, 20, yPosition);
    yPosition += 15;

    // Status
    doc.setFont('helvetica', 'bold');
    doc.text(`Status: ${inspection.status.replace('_', ' ').toUpperCase()}`, 20, yPosition);
    yPosition += 15;

    // Rooms section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Room Details', 20, yPosition);
    yPosition += 10;

    if (inspection.rooms && inspection.rooms.length > 0) {
      inspection.rooms.forEach((room, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${room.room_name}`, 20, yPosition);
        yPosition += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Condition: ${room.condition_rating.toUpperCase()}`, 25, yPosition);
        yPosition += 6;

        if (room.walls_condition) {
          doc.text(`Walls: ${room.walls_condition}`, 25, yPosition);
          yPosition += 6;
        }

        if (room.flooring_condition) {
          doc.text(`Flooring: ${room.flooring_condition}`, 25, yPosition);
          yPosition += 6;
        }

        if (room.windows_condition) {
          doc.text(`Windows: ${room.windows_condition}`, 25, yPosition);
          yPosition += 6;
        }

        if (room.notes) {
          doc.text(`Notes: ${room.notes}`, 25, yPosition);
          yPosition += 6;
        }

        // Items in room
        if (room.items && room.items.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Items:', 25, yPosition);
          yPosition += 6;

          room.items.forEach((item, itemIndex) => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }

            doc.setFont('helvetica', 'normal');
            doc.text(`• ${item.item_name}: ${item.condition.toUpperCase()} - ${item.description || ''}`, 30, yPosition);
            yPosition += 5;

            if (item.notes) {
              doc.text(`  Notes: ${item.notes}`, 30, yPosition);
              yPosition += 5;
            }
          });
        }

        yPosition += 5;
      });
    }

    // Meter readings
    if (inspection.meter_readings) {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Meter Readings', 20, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      
      if (inspection.meter_readings.electricity) {
        doc.text(`Electricity: ${inspection.meter_readings.electricity}`, 20, yPosition);
        yPosition += 6;
      }
      if (inspection.meter_readings.gas) {
        doc.text(`Gas: ${inspection.meter_readings.gas}`, 20, yPosition);
        yPosition += 6;
      }
      if (inspection.meter_readings.water) {
        doc.text(`Water: ${inspection.meter_readings.water}`, 20, yPosition);
        yPosition += 6;
      }
    }

    // Keys
    if (inspection.keys_provided && inspection.keys_provided.length > 0) {
      yPosition += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Keys Provided', 20, yPosition);
      yPosition += 7;
      doc.setFont('helvetica', 'normal');
      inspection.keys_provided.forEach((key, idx) => {
        doc.text(`• ${key}`, 20, yPosition);
        yPosition += 6;
      });
    }

    // Overall condition
    yPosition += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Condition: ${inspection.overall_condition ? inspection.overall_condition.toUpperCase() : 'N/A'}`, 20, yPosition);
    yPosition += 15;

    // Tenant sign-off
    doc.setFont('helvetica', 'bold');
    doc.text('Tenant Sign-off', 20, yPosition);
    yPosition += 7;
    doc.setFont('helvetica', 'normal');
    
    if (inspection.tenant_agreed) {
      doc.text(`Status: AGREED AND SIGNED`, 20, yPosition);
      yPosition += 6;
      doc.text(`Signed by: ${tenant?.full_name || 'Tenant'}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Date: ${inspection.tenant_signature_date ? new Date(inspection.tenant_signature_date).toLocaleString() : 'N/A'}`, 20, yPosition);
    } else if (inspection.status === 'disputed') {
      doc.text(`Status: DISPUTED`, 20, yPosition);
      yPosition += 6;
      if (inspection.dispute_details) {
        doc.text(`Dispute Details: ${inspection.dispute_details}`, 20, yPosition);
        yPosition += 6;
      }
    } else {
      doc.text(`Status: PENDING TENANT REVIEW`, 20, yPosition);
    }

    if (inspection.tenant_comments) {
      yPosition += 6;
      doc.text(`Tenant Comments: ${inspection.tenant_comments}`, 20, yPosition);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      doc.text(`Generated on ${new Date().toLocaleString()}`, 20, doc.internal.pageSize.getHeight() - 10);
    }

    // Convert to blob
    const pdfBlob = doc.output('blob');
    const arrayBuffer = await pdfBlob.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="inspection_report_${inspectionId}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});