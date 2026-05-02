import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { reportId, format = 'json' } = await req.json();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const report = await base44.asServiceRole.entities.CustomReport.get(reportId);
    if (!report) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }

    // Fetch data based on report type
    let data = [];
    
    switch(report.report_type) {
      case 'financial':
        data = await base44.asServiceRole.entities.FinancialTransaction.filter(
          report.filters || {},
          '-created_date',
          1000
        );
        break;
      case 'maintenance':
        data = await base44.asServiceRole.entities.MaintenanceOrder.filter(
          report.filters || {},
          '-created_date',
          1000
        );
        break;
      case 'occupancy':
        data = await base44.asServiceRole.entities.Unit.list('-updated_date', 500);
        break;
      case 'compliance':
        data = await base44.asServiceRole.entities.SafetyCertificate?.filter?.(
          report.filters || {},
          '-updated_date',
          500
        ) || [];
        break;
      case 'portfolio':
        data = await base44.asServiceRole.entities.Property.list('-updated_date', 500);
        break;
    }

    // Filter columns if specified
    if (report.columns?.length > 0) {
      data = data.map(row => {
        const filtered = {};
        report.columns.forEach(col => {
          if (col in row) filtered[col] = row[col];
        });
        return filtered;
      });
    }

    // Sort data
    if (report.sort_by) {
      const [field, order] = report.sort_by.split(':');
      data.sort((a, b) => {
        if (order === 'desc') return b[field] > a[field] ? 1 : -1;
        return a[field] > b[field] ? 1 : -1;
      });
    }

    // Update last_generated
    await base44.asServiceRole.entities.CustomReport.update(reportId, {
      last_generated: new Date().toISOString()
    });

    if (format === 'excel') {
      // Return CSV (Excel-compatible)
      const headers = Object.keys(data[0] || {});
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify(row[h])).join(','))
      ].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=${report.name}.csv`
        }
      });
    }

    if (format === 'pdf') {
      // Return simplified PDF (in production use jsPDF)
      const html = generateReportHTML(report, data);
      return Response.json({ 
        message: 'PDF generated',
        html,
        downloadUrl: `/report/${reportId}/download.pdf`
      });
    }

    return Response.json({
      report: report.name,
      rows: data.length,
      data: data.slice(0, 100)
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateReportHTML(report, data) {
  const rows = data.slice(0, 50);
  const headers = Object.keys(rows[0] || {});

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${report.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        h1 { color: #333; }
        .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>${report.name}</h1>
      <div class="meta">
        Generated: ${new Date().toLocaleString()} | Type: ${report.report_type}
      </div>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>${headers.map(h => `<td>${row[h] || '-'}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;
}