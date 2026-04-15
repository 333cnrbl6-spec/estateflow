import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const InvoiceGenerationSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = InvoiceGenerationSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { month } = validation.data; // Format: YYYY-MM

    // Parse the month
    const [year, monthNum] = month.split('-');
    const date = new Date(year, parseInt(monthNum) - 1, 1);
    
    // Fetch all tenancies
    const tenancies = await base44.entities.Tenancy.list('-updated_date', 1000);
    
    // Filter active tenancies for this period
    const activeTenancies = tenancies.filter(t => {
      const startDate = new Date(t.start_date);
      // Open-ended tenancies: only check start date, end date null/future is ignored
      const endDate = t.end_date ? new Date(t.end_date) : null;
      return startDate <= date && (!endDate || date <= endDate);
    });

    // Generate invoices for each active tenancy
    const generatedInvoices = [];
    for (const tenancy of activeTenancies) {
      const unitData = await base44.entities.Unit.get(tenancy.unit_id);
      const tenantData = await base44.entities.Tenant.get(tenancy.tenant_id);
      const propertyData = await base44.entities.Property.get(unitData?.property_id);

      if (!tenancy.rent_amount || !tenancy.rent_frequency) continue;

      // Create invoice (note: using FinancialTransaction for rent, not Invoice entity)
       const invoice = await base44.entities.FinancialTransaction.create({
        tenant_id: tenancy.tenant_id,
        property_id: propertyData?.id,
        unit_id: tenancy.unit_id,
        transaction_type: 'rent',
        direction: 'income',
        amount: tenancy.rent_amount,
        description: `Rent for ${propertyData?.name || 'Property'} - ${unitData?.name || 'Unit'} - ${month}`,
        status: 'pending',
        created_date: new Date().toISOString(),
        due_date: new Date(year, parseInt(monthNum), 1).toISOString().split('T')[0], // 1st of next month
        notes: `Auto-generated for ${month} rent period`,
      });

      generatedInvoices.push(invoice);
    }

    return Response.json({
      success: true,
      invoicesGenerated: generatedInvoices.length,
      month: month,
      invoices: generatedInvoices,
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return Response.json(
      { error: error.message || 'Failed to generate invoices' },
      { status: 500 }
    );
  }
});