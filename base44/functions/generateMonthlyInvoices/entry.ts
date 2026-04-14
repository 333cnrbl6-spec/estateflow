import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { month } = body; // Format: YYYY-MM

    // Parse the month
    const [year, monthNum] = month.split('-');
    const date = new Date(year, parseInt(monthNum) - 1, 1);
    
    // Fetch all tenancies
    const tenancies = await base44.entities.Tenancy.list('-updated_date', 1000);
    
    // Filter active tenancies for this period
    const activeTenancies = tenancies.filter(t => {
      const startDate = new Date(t.start_date);
      const endDate = t.end_date ? new Date(t.end_date) : new Date('2099-12-31');
      return startDate <= date && date <= endDate;
    });

    // Generate invoices for each active tenancy
    const generatedInvoices = [];
    for (const tenancy of activeTenancies) {
      const unitData = await base44.entities.Unit.get(tenancy.unit_id);
      const tenantData = await base44.entities.Tenant.get(tenancy.tenant_id);
      const propertyData = await base44.entities.Property.get(unitData?.property_id);

      if (!tenancy.rent_amount || !tenancy.rent_frequency) continue;

      // Create invoice
      const invoice = await base44.entities.Invoice.create({
        maintenance_request_id: tenancy.unit_id,
        contractor_id: tenancy.tenant_id,
        amount: tenancy.rent_amount,
        description: `Rent for ${propertyData?.name} - ${unitData?.name} - ${month}`,
        document_url: '', // Can be populated with generated PDF
        status: 'pending_approval',
        submitted_by: user.email,
        submitted_date: new Date().toISOString(),
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