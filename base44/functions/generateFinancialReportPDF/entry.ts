/**
 * Generate tax-ready PDF financial reports
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, month, properties } = await req.json();

    // Use LLM to generate PDF content (since jsPDF isn't ideal for tables)
    const htmlContent = generateHTMLReport(data, month, properties, user);

    // Return HTML that can be printed/saved as PDF via browser
    return Response.json({
      success: true,
      html: htmlContent,
      pdfUrl: null, // Browser will handle print-to-PDF
      month,
    });
  } catch (error) {
    console.error('[PDF_GENERATION_ERROR]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function generateHTMLReport(data, month, properties, user) {
   const timestamp = new Date().toLocaleDateString();
   const [year, monthNum] = month.split('-');
   const monthName = new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

   return `
 <!DOCTYPE html>
 <html>
 <head>
   <meta charset="utf-8">
   <title>Financial Report - ${escapeHtml(month)}</title>
   <style>
     body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
     h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
     h2 { color: #1e40af; margin-top: 30px; font-size: 18px; }
     h3 { color: #475569; font-size: 14px; margin-top: 15px; }
     table { width: 100%; border-collapse: collapse; margin: 15px 0; }
     th { background-color: #e0e7ff; padding: 10px; text-align: left; border-bottom: 2px solid #1e40af; font-weight: bold; }
     td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
     tr:nth-child(even) { background-color: #f8fafc; }
     .summary-box { background-color: #f0f9ff; padding: 15px; border-left: 4px solid #1e40af; margin: 15px 0; }
     .positive { color: #10b981; font-weight: bold; }
     .negative { color: #ef4444; font-weight: bold; }
     .warning-box { background-color: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 10px 0; }
     .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
     .page-break { page-break-after: always; }
     .amount-right { text-align: right; font-family: monospace; }
   </style>
 </head>
 <body>
   <h1>Financial Report for ${escapeHtml(monthName)}</h1>
   <div class="summary-box">
     <p><strong>Generated:</strong> ${timestamp}</p>
     <p><strong>Prepared for:</strong> ${escapeHtml(user.full_name || 'User')} (${escapeHtml(user.email || '')})</p>
     <p><strong>Properties Included:</strong> ${(properties || []).map(p => escapeHtml(p.name || '')).join(', ')}</p>
   </div>

  <!-- CASH FLOW SECTION -->
  <div class="page-break">
    <h2>Cash Flow Statement</h2>
    <table>
      <tr>
        <th>Category</th>
        <th class="amount-right">Amount</th>
      </tr>
      <tr>
        <td><strong>Total Inflows</strong></td>
        <td class="amount-right positive">£${data.cashFlow.summary.totalInflows.toFixed(2)}</td>
      </tr>
      <tr>
        <td><strong>Total Outflows</strong></td>
        <td class="amount-right negative">-£${data.cashFlow.summary.totalOutflows.toFixed(2)}</td>
      </tr>
      <tr style="background-color: #f0f9ff;">
        <td><strong>Net Cash Flow</strong></td>
        <td class="amount-right" style="color: #1e40af; font-weight: bold;">£${data.cashFlow.summary.netCashFlow.toFixed(2)}</td>
      </tr>
    </table>

    <h3>Transaction Details</h3>
    <table>
      <tr>
        <th>Description</th>
        <th class="amount-right">Amount</th>
      </tr>
      ${data.cashFlow.details.map(d => `
        <tr>
          <td>${d.category}</td>
          <td class="amount-right ${d.amount > 0 ? 'positive' : 'negative'}">£${d.amount.toFixed(2)}</td>
        </tr>
      `).join('')}
    </table>
  </div>

  <!-- P&L SECTION -->
  <div class="page-break">
    <h2>Profit & Loss by Property</h2>
    <table>
      <tr>
        <th>Property</th>
        <th class="amount-right">Revenue</th>
        <th class="amount-right">Expenses</th>
        <th class="amount-right">Profit</th>
        <th class="amount-right">Margin %</th>
      </tr>
      ${data.profitLoss.properties.map(p => `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td class="amount-right">£${p.revenue.toFixed(2)}</td>
          <td class="amount-right">£${p.expenses.toFixed(2)}</td>
          <td class="amount-right ${p.profit >= 0 ? 'positive' : 'negative'}">£${p.profit.toFixed(2)}</td>
          <td class="amount-right">${p.margin.toFixed(1)}%</td>
        </tr>
      `).join('')}
      <tr style="background-color: #f0f9ff; font-weight: bold;">
        <td>TOTAL</td>
        <td class="amount-right">£${data.profitLoss.summary.totalRevenue.toFixed(2)}</td>
        <td class="amount-right">£${data.profitLoss.summary.totalExpenses.toFixed(2)}</td>
        <td class="amount-right">£${data.profitLoss.summary.netProfit.toFixed(2)}</td>
        <td class="amount-right">${data.profitLoss.summary.profitMargin.toFixed(1)}%</td>
      </tr>
    </table>
  </div>

  <!-- TAX SECTION -->
  <div class="page-break">
    <h2>Tax Summary (Self-Assessment)</h2>
    <table>
      <tr>
        <th>Item</th>
        <th class="amount-right">Amount</th>
      </tr>
      <tr>
        <td>Gross Rental Income</td>
        <td class="amount-right positive">£${data.taxSummary.summary.taxableIncome.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Less: Allowable Expenses</td>
        <td class="amount-right negative">-£${data.taxSummary.summary.allowableExpenses.toFixed(2)}</td>
      </tr>
      <tr style="background-color: #f0f9ff;">
        <td><strong>Taxable Profit</strong></td>
        <td class="amount-right" style="color: #ea580c; font-weight: bold;">£${data.taxSummary.summary.taxableProfit.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Estimated Tax @ 20%</td>
        <td class="amount-right negative">£${(data.taxSummary.summary.taxableProfit * 0.2).toFixed(2)}</td>
      </tr>
    </table>

    <h3>Allowable Expenses Breakdown</h3>
    <table>
      <tr>
        <th>Expense Category</th>
        <th class="amount-right">Amount</th>
        <th>Status</th>
      </tr>
      ${data.taxSummary.expenseCategories.map(e => `
        <tr>
          <td>${e.name}</td>
          <td class="amount-right">£${e.amount.toFixed(2)}</td>
          <td>${e.taxAllowable ? '✓ Allowable' : '✗ Non-allowable'}</td>
        </tr>
      `).join('')}
    </table>

    <div class="warning-box">
      <strong>⚠️ Important Notice:</strong>
      <p>This report is for reference only. Consult your accountant before submitting Self-Assessment tax returns. Ensure all expense receipts are retained for 6 years.</p>
    </div>
  </div>

  <!-- COMPLIANCE -->
  <div class="page-break">
    <h2>Tax Compliance Checklist</h2>
    ${data.taxSummary.complianceItems.map(item => `
      <div class="summary-box">
        <h3>${item.verified ? '✓' : '⚠'} ${item.title}</h3>
        <p>${item.description}</p>
        ${item.warning ? `<p style="color: #f59e0b;"><strong>Note:</strong> ${item.warning}</p>` : ''}
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p>This report has been generated automatically by the Premiso platform. It is provided for convenience only and should not be relied upon for tax or financial advice. Always consult with a qualified accountant for official submissions.</p>
  </div>
</body>
</html>
  `;
}