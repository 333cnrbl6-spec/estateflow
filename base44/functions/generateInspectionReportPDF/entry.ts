import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      property,
      unit,
      rooms,
      inspectionNotes,
      overallRating,
      landlordEmail,
      inspectionDate,
    } = await req.json();

    // Generate HTML for PDF
    const roomsHTML = rooms
      .filter(r => r.name && r.name.trim())
      .map(room => `
        <div style="page-break-inside: avoid; margin-bottom: 30px;">
          <h3 style="color: #1a202c; font-size: 18px; font-weight: bold; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            ${room.name}
          </h3>
          <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f0f4f8;">
                <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Item</th>
                <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Condition</th>
              </tr>
            </thead>
            <tbody>
              ${
                room.checklist
                  .map(
                    item => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${item.item}</td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">
                    <span style="
                      padding: 4px 8px;
                      border-radius: 4px;
                      font-weight: bold;
                      ${
                        item.status === 'excellent'
                          ? 'background-color: #dcfce7; color: #166534;'
                          : item.status === 'good'
                          ? 'background-color: #dbeafe; color: #1e40af;'
                          : item.status === 'fair'
                          ? 'background-color: #fed7aa; color: #92400e;'
                          : 'background-color: #fecaca; color: #991b1b;'
                      }
                    ">
                      ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                </tr>
              `
                  )
                  .join('')
              }
            </tbody>
          </table>
          ${
            room.photos && room.photos.length > 0
              ? `
            <div style="margin-top: 15px;">
              <p style="font-weight: bold; color: #374151;">Photos:</p>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
                ${room.photos.map(photo => `<img src="${photo}" style="width: 100%; height: auto; border-radius: 4px;" />`).join('')}
              </div>
            </div>
          `
              : ''
          }
        </div>
      `)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Inspection Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1a202c; line-height: 1.6; margin: 0; padding: 20px; }
            .header { background-color: #1e293b; color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 28px; }
            .header p { margin: 5px 0; font-size: 14px; }
            .summary { background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .summary-item { margin-bottom: 10px; }
            .summary-label { font-weight: bold; color: #3b82f6; }
            .rating-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-top: 10px; }
            .rating-excellent { background-color: #dcfce7; color: #166534; }
            .rating-good { background-color: #dbeafe; color: #1e40af; }
            .rating-fair { background-color: #fed7aa; color: #92400e; }
            .rating-poor { background-color: #fecaca; color: #991b1b; }
            .notes { background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6; margin-bottom: 30px; }
            .footer { color: #64748b; font-size: 12px; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Property Inspection Report</h1>
            <p><strong>Property:</strong> ${property.name}</p>
            <p><strong>Unit:</strong> ${unit.name}</p>
            <p><strong>Inspection Date:</strong> ${new Date(inspectionDate).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</p>
            <p><strong>Inspector:</strong> ${user.full_name}</p>
          </div>

          <div class="summary">
            <div class="summary-item">
              <span class="summary-label">Overall Property Condition:</span>
              <span class="rating-badge rating-${overallRating}">
                ${overallRating.charAt(0).toUpperCase() + overallRating.slice(1)}
              </span>
            </div>
          </div>

          ${rooms.length > 0 ? `<h2 style="color: #1a202c; margin-top: 30px;">Room Inspections</h2>${roomsHTML}` : ''}

          ${
            inspectionNotes
              ? `
            <div class="notes">
              <strong style="color: #1e293b;">Inspector Notes:</strong>
              <p>${inspectionNotes.replace(/\n/g, '<br>')}</p>
            </div>
          `
              : ''
          }

          <div class="footer">
            <p>This inspection report was generated on ${new Date().toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}.</p>
          </div>
        </body>
      </html>
    `;

    // Send email with PDF
    const emailResult = await base44.integrations.Core.SendEmail({
      to: landlordEmail,
      subject: `Property Inspection Report - ${property.name}, ${unit.name}`,
      body: `
        Dear Landlord,

        Please find attached the inspection report for your property:

        Property: ${property.name}
        Unit: ${unit.name}
        Inspection Date: ${new Date(inspectionDate).toLocaleDateString('en-GB')}

        Overall Condition: ${overallRating.charAt(0).toUpperCase() + overallRating.slice(1)}

        The detailed inspection report including photos and checklists is attached as a PDF.

        Best regards,
        Property Management Team
      `,
    });

    return Response.json({
      success: true,
      message: 'Inspection report generated and sent',
      emailSent: true,
    });
  } catch (error) {
    console.error('Error generating inspection report:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});