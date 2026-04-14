import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { jsPDF } from 'npm:jspdf@4.0.0';
import html2canvas from 'npm:html2canvas@1.4.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      templateId,
      propertyId,
      unitId,
      tenantId,
      landlordId,
    } = await req.json();

    // Fetch template
    const template = await base44.entities.DocumentTemplate.get(templateId);
    if (!template) {
      return Response.json({ error: 'Template not found' }, { status: 404 });
    }

    // Fetch data entities
    const property = await base44.entities.Property.get(propertyId);
    const tenant = tenantId ? await base44.entities.Tenant.get(tenantId) : null;
    const unit = unitId ? await base44.entities.Unit.get(unitId) : null;
    const landlord = landlordId ? await base44.entities.Contact.get(landlordId) : null;

    // Build data map for placeholder replacement
    const dataMap = {
      PROPERTY_ADDRESS: `${property.address_line_1}${property.address_line_2 ? ', ' + property.address_line_2 : ''}`,
      PROPERTY_CITY: property.city,
      PROPERTY_POSTCODE: property.postcode,
      PROPERTY_TYPE: property.property_type,
      TENANT_NAME: tenant?.full_name || '',
      TENANT_EMAIL: tenant?.email || '',
      TENANT_PHONE: tenant?.phone || '',
      LANDLORD_NAME: landlord?.name || '',
      LANDLORD_EMAIL: landlord?.email || '',
      LANDLORD_PHONE: landlord?.phone || '',
      UNIT_NAME: unit?.name || '',
      CURRENT_DATE: new Date().toLocaleDateString('en-GB'),
      TODAY: new Date().toLocaleDateString('en-GB'),
    };

    // Add custom placeholder mappings from template
    if (template.placeholder_fields) {
      for (const placeholder of template.placeholder_fields) {
        const sourceEntity = placeholder.source_entity.toLowerCase();
        const sourceField = placeholder.source_field;

        let value = '';
        if (sourceEntity === 'property' && property) {
          value = property[sourceField] || '';
        } else if (sourceEntity === 'tenant' && tenant) {
          value = tenant[sourceField] || '';
        } else if (sourceEntity === 'landlord' && landlord) {
          value = landlord[sourceField] || '';
        } else if (sourceEntity === 'unit' && unit) {
          value = unit[sourceField] || '';
        }

        dataMap[placeholder.placeholder_name] = String(value);
      }
    }

    // Replace placeholders in template content
    let populatedContent = template.template_content;
    for (const [key, value] of Object.entries(dataMap)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      populatedContent = populatedContent.replace(placeholder, String(value));
    }

    // Create HTML document with styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: ${template.formatting_rules?.font_family || 'Arial'}, sans-serif;
            font-size: ${template.formatting_rules?.font_size || 11}pt;
            line-height: ${template.formatting_rules?.line_spacing || 1.5};
            margin: ${template.formatting_rules?.margins?.top || 20}mm 
                    ${template.formatting_rules?.margins?.right || 20}mm 
                    ${template.formatting_rules?.margins?.bottom || 20}mm 
                    ${template.formatting_rules?.margins?.left || 20}mm;
            color: #000;
          }
          .signature-block {
            margin-top: 2cm;
            page-break-inside: avoid;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            width: 8cm;
            margin-top: 1cm;
            margin-bottom: 0.5cm;
          }
          .date-line {
            margin-top: 0.5cm;
          }
        </style>
      </head>
      <body>
        ${populatedContent}
      </body>
      </html>
    `;

    // Convert HTML to PDF
    const canvas = await html2canvas(new DOMParser().parseFromString(htmlContent, 'text/html').body);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: template.formatting_rules?.page_size || 'A4',
    });

    const imgData = canvas.toDataURL('image/png');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const pdfBytes = pdf.output('arraybuffer');

    // Upload PDF
    const fileName = `${template.template_code}_${propertyId}_${new Date().getTime()}.pdf`;
    const uploadResult = await base44.integrations.Core.UploadFile({
      file: new Blob([pdfBytes], { type: 'application/pdf' }),
    });

    // Create GeneratedDocument record
    const generatedDoc = await base44.entities.GeneratedDocument.create({
      template_id: templateId,
      template_code: template.template_code,
      property_id: propertyId,
      unit_id: unitId,
      tenant_id: tenantId,
      landlord_id: landlordId,
      document_name: fileName,
      document_type: template.document_type,
      generated_date: new Date().toISOString(),
      generated_by: user.email,
      data_used: dataMap,
      document_url: uploadResult.file_url,
      status: 'ready_for_signature',
      signature_status: template.signature_blocks?.map(block => ({
        signer_type: block.signer_type,
        signed: false,
      })) || [],
      version: 1,
    });

    return Response.json({
      success: true,
      document_id: generatedDoc.id,
      document_url: uploadResult.file_url,
      document_name: fileName,
      message: 'Document generated successfully',
    });
  } catch (error) {
    console.error('Error generating document:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});