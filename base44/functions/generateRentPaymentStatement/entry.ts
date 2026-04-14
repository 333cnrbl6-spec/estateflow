import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenant_id, format: outputFormat = 'pdf' } = await req.json();

    // Fetch tenant
    const tenant = await base44.entities.Tenant.get(tenant_id);
    if (!tenant) {
      return Response.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Fetch all rent transactions
    const transactions = await base44.entities.FinancialTransaction.filter(
      { tenant_id, transaction_type: 'rent' },
      '-transaction_date',
      100
    );

    // Calculate summary
    const summary = {
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      transactionCount: transactions.length
    };

    transactions.forEach(t => {
      if (t.status === 'paid') summary.totalPaid += t.amount || 0;
      if (t.status === 'pending') summary.totalPending += t.amount || 0;
      if (t.status === 'overdue') summary.totalOverdue += t.amount || 0;
    });

    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Rent Payment Statement</title>
        <style>
          body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
          .header h1 { margin: 0; color: #1e40af; }
          .header p { margin: 5px 0; color: #666; }
          .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .summary-card { background: #f3f4f6; padding: 15px; border-radius: 5px; }
          .summary-card h3 { margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase; }
          .summary-card .amount { font-size: 24px; font-weight: bold; color: #1e40af; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          thead { background: #f3f4f6; }
          th { padding: 10px; text-align: left; font-weight: bold; font-size: 12px; color: #666; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          tr:hover { background: #f9fafb; }
          .status { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: bold; }
          .status-paid { background: #d1fae5; color: #065f46; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-overdue { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          .date { color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Rent Payment Statement</h1>
          <p><strong>${tenant.full_name}</strong></p>
          <p>${tenant.email}</p>
          <p class="date">Generated: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div class="summary">
          <div class="summary-card">
            <h3>Total Paid</h3>
            <p class="amount">£${summary.totalPaid.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="summary-card">
            <h3>Pending</h3>
            <p class="amount">£${summary.totalPending.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="summary-card">
            <h3>Overdue</h3>
            <p class="amount" style="color: #dc2626;">£${summary.totalOverdue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <h2>Transaction History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Period</th>
              <th>Amount</th>
              <th>Reference</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr>
                <td>${new Date(t.transaction_date).toLocaleDateString('en-GB')}</td>
                <td>${new Date(t.transaction_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}</td>
                <td>£${(t.amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td>
                <td><code style="font-size: 11px;">${(t.reference || 'N/A').slice(0, 16)}</code></td>
                <td><span class="status status-${t.status}">${t.status.toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This is an official rent payment statement. For questions, please contact your property manager.</p>
        </div>
      </body>
      </html>
    `;

    // For now, return HTML content
    // In production, you would convert this to PDF using a service like wkhtmltopdf or similar
    return Response.json({
      success: true,
      html_content: htmlContent,
      summary,
      pdf_url: null // Would be generated by PDF service
    });
  } catch (error) {
    console.error('Error generating rent statement:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});