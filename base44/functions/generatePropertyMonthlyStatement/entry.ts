import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { propertyId, month } = await req.json();

    if (!propertyId || !month) {
      return Response.json({ error: 'Missing propertyId or month' }, { status: 400 });
    }

    // Parse month (YYYY-MM format)
    const monthStart = new Date(`${month}-01`);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    // Get property and related data
    const [property, tenants, transactions, maintenanceOrders] = await Promise.all([
      base44.asServiceRole.entities.Property.get(propertyId),
      base44.asServiceRole.entities.Tenant.filter({ property_id: propertyId }),
      base44.asServiceRole.entities.FinancialTransaction.filter({ property_id: propertyId }),
      base44.asServiceRole.entities.MaintenanceOrder.filter({ property_id: propertyId })
    ]);

    if (!property) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }

    // Calculate financial metrics
    const monthTransactions = transactions?.filter(t =>
      new Date(t.transaction_date) >= monthStart &&
      new Date(t.transaction_date) < monthEnd
    ) || [];

    const rentalIncome = monthTransactions
      .filter(t => t.type === 'rent_payment' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const otherIncome = monthTransactions
      .filter(t => t.type !== 'rent_payment' && t.status === 'completed')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const monthMaintenanceOrders = maintenanceOrders?.filter(m =>
      m.status === 'completed' &&
      m.completion_date &&
      new Date(m.completion_date) >= monthStart &&
      new Date(m.completion_date) < monthEnd
    ) || [];

    const maintenanceExpenses = monthMaintenanceOrders.reduce((sum, m) => sum + (m.total_cost || 0), 0);

    // Generate HTML statement
    const statementHTML = generateStatementHTML(
      property,
      month,
      monthStart,
      monthEnd,
      tenants,
      monthTransactions,
      monthMaintenanceOrders,
      rentalIncome,
      otherIncome,
      maintenanceExpenses
    );

    // Upload statement as file
    const { file_url } = await base44.integrations.Core.UploadFile({
      file: Buffer.from(statementHTML, 'utf-8')
    });

    return Response.json({
      success: true,
      download_url: file_url,
      summary: {
        property_name: property.name,
        month: month,
        rental_income: rentalIncome / 100,
        other_income: otherIncome / 100,
        maintenance_expenses: maintenanceExpenses / 100,
        net_income: (rentalIncome + otherIncome - maintenanceExpenses) / 100
      }
    });

  } catch (error) {
    console.error('Statement generation error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});

function generateStatementHTML(property, month, monthStart, monthEnd, tenants, transactions, maintenanceOrders, rentalIncome, otherIncome, maintenanceExpenses) {
  const monthLabel = monthStart.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' });
  const netIncome = rentalIncome + otherIncome - maintenanceExpenses;

  const transactionRows = transactions.map(t => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; text-align: left;">${new Date(t.transaction_date).toLocaleDateString('en-GB')}</td>
      <td style="padding: 10px; text-align: left;">${t.tenant_id || 'System'}</td>
      <td style="padding: 10px; text-align: left;">${t.description || t.type}</td>
      <td style="padding: 10px; text-align: right;">£${(t.amount / 100).toFixed(2)}</td>
      <td style="padding: 10px; text-align: center;"><span style="background: ${t.status === 'completed' ? '#d1fae5' : '#fee2e2'}; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${t.status}</span></td>
    </tr>
  `).join('');

  const maintenanceRows = maintenanceOrders.map(m => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; text-align: left;">${new Date(m.completion_date || m.created_date).toLocaleDateString('en-GB')}</td>
      <td style="padding: 10px; text-align: left;">${m.description || 'Maintenance'}</td>
      <td style="padding: 10px; text-align: left;">${m.category || 'General'}</td>
      <td style="padding: 10px; text-align: right;">£${(m.total_cost / 100).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0 0; opacity: 0.9; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
        .kpi-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; }
        .kpi-card .label { font-size: 12px; color: #7f8c8d; text-transform: uppercase; }
        .kpi-card .value { font-size: 24px; font-weight: bold; color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background-color: #ecf0f1; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #bdc3c7; }
        td { padding: 10px; }
        .total-row { background-color: #ecf0f1; font-weight: 600; border-top: 2px solid #bdc3c7; }
        .summary-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .warning-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Monthly Financial Statement</h1>
        <p>${property.name} • ${monthLabel}</p>
      </div>

      <div class="section">
        <h2>Summary</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="label">Rental Income</div>
            <div class="value">£${(rentalIncome / 100).toFixed(2)}</div>
          </div>
          <div class="kpi-card">
            <div class="label">Other Income</div>
            <div class="value">£${(otherIncome / 100).toFixed(2)}</div>
          </div>
          <div class="kpi-card">
            <div class="label">Maintenance Expenses</div>
            <div class="value">£${(maintenanceExpenses / 100).toFixed(2)}</div>
          </div>
          <div class="kpi-card" style="border-left-color: ${netIncome >= 0 ? '#27ae60' : '#e74c3c'};">
            <div class="label">Net Income</div>
            <div class="value" style="color: ${netIncome >= 0 ? '#27ae60' : '#e74c3c'};">£${(netIncome / 100).toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Property Details</h2>
        <table>
          <tr>
            <td style="font-weight: 600; width: 30%;">Address</td>
            <td>${property.address_line_1}${property.address_line_2 ? ', ' + property.address_line_2 : ''}<br>${property.city}, ${property.postcode}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="font-weight: 600;">Property Type</td>
            <td>${property.property_type || 'Residential'}</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Active Tenants</td>
            <td>${tenants?.length || 0}</td>
          </tr>
          <tr style="background: #f8f9fa;">
            <td style="font-weight: 600;">Statement Period</td>
            <td>${monthStart.toLocaleDateString('en-GB')} to ${new Date(monthEnd.getTime() - 1).toLocaleDateString('en-GB')}</td>
          </tr>
        </table>
      </div>

      <div class="section">
        <h2>Rental Income & Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Tenant/Source</th>
              <th>Description</th>
              <th style="text-align: right;">Amount</th>
              <th style="text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows || '<tr><td colspan="5" style="text-align: center; padding: 20px;">No transactions for this period</td></tr>'}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">Total Income</td>
              <td style="text-align: right;">£${((rentalIncome + otherIncome) / 100).toFixed(2)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Maintenance & Expenses</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th style="text-align: right;">Cost</th>
            </tr>
          </thead>
          <tbody>
            ${maintenanceRows || '<tr><td colspan="4" style="text-align: center; padding: 20px;">No maintenance expenses for this period</td></tr>'}
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">Total Expenses</td>
              <td style="text-align: right;">£${(maintenanceExpenses / 100).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary-box">
        <strong>Net Income for ${monthLabel}:</strong> £${(netIncome / 100).toFixed(2)}
      </div>

      ${netIncome < 0 ? '<div class="warning-box"><strong>⚠️ Warning:</strong> Expenses exceeded income this month. Review maintenance spending and rental income.</div>' : ''}

      <div class="footer">
        <p>This statement was automatically generated on ${new Date().toLocaleDateString('en-GB')}.</p>
        <p>For questions, contact your property management team.</p>
      </div>
    </body>
    </html>
  `;
}