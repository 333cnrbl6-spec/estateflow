import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const TIER_PRICING = {
  basic: 499,
  standard: 999,
  premium: 1499,
  enterprise: 2499,
};

function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `INV-${year}-${month}-${timestamp}`;
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch all active services
    const services = await base44.entities.OutOfHoursService.filter(
      { is_active: true },
      '-created_date',
      1000
    );

    const invoicesCreated = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const service of services) {
      // Check if invoice already exists for current month
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = addMonths(monthStart, 1);
      monthEnd.setDate(monthEnd.getDate() - 1);

      const existingInvoice = await base44.entities.Invoice.filter(
        {
          service_id: service.id,
          billing_period_start: monthStart.toISOString().split('T')[0],
        },
        '-created_date',
        1
      );

      if (existingInvoice.length > 0) {
        continue; // Skip if invoice already exists
      }

      // Get company details
      const company = await base44.entities.Company.filter(
        { id: service.company_id },
        undefined,
        1
      );

      const companyData = company[0];
      if (!companyData) continue;

      const amount = TIER_PRICING[service.service_tier] || 0;
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 30); // 30 days net

      // Create invoice
      const invoice = await base44.entities.Invoice.create({
        service_id: service.id,
        company_id: service.company_id,
        invoice_number: generateInvoiceNumber(),
        billing_period_start: monthStart.toISOString().split('T')[0],
        billing_period_end: monthEnd.toISOString().split('T')[0],
        service_tier: service.service_tier,
        amount,
        currency: 'GBP',
        status: 'issued',
        issue_date: today.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        payment_method: 'none',
        payment_status: 'unpaid',
        line_items: [
          {
            description: `${service.service_tier.charAt(0).toUpperCase() + service.service_tier.slice(1)} - Out of Hours Service`,
            quantity: 1,
            unit_price: amount,
            amount,
          },
        ],
      });

      invoicesCreated.push({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        company: companyData.name,
        amount: invoice.amount,
      });
    }

    return Response.json({
      success: true,
      invoices_created: invoicesCreated.length,
      invoices: invoicesCreated,
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});