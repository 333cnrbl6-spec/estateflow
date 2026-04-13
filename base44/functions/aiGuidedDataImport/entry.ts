import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { data_sources, data_gleans, company_name, services = [] } = payload;

    if (!data_sources || !data_gleans) {
      return Response.json({ error: 'Missing data_sources or data_gleans' }, { status: 400 });
    }

    // Build source descriptions from gleans
    const sourceDescriptions = Object.entries(data_gleans)
      .filter(([, gleans]) => gleans.length > 0)
      .map(([source, gleans]) => `${source.replace(/_/g, ' ')}: ${gleans.join(', ')}`)
      .join('\n');

    // Call LLM to generate realistic data based on available sources
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are generating realistic property management data for import into Premiso.

Company: ${company_name}
Services: ${services.join(', ')}

Available data sources:
${sourceDescriptions}

Generate realistic, interconnected property management data that would come from these sources. Create:

1. PROPERTIES (4-6 realistic UK properties):
   - Mix of houses, flats, multi-unit buildings
   - Real UK postcodes (e.g., London, Manchester, Birmingham areas)
   - Realistic service charges, ground rents where applicable
   - Year built, number of units

2. TENANTS (8-12 realistic tenants):
   - Mix of individual and corporate tenants
   - Realistic UK names
   - Contact details
   - Move-in dates (past 2-3 years)

3. UNITS (assign tenants to properties):
   - Realistic unit identifiers (Flat 1, Suite 2, etc)
   - Rental amounts (£1200-£2500/month typical)
   - Tenancy types

4. FINANCIAL TRANSACTIONS (20-30 realistic monthly transactions):
   - Rent payments (inbound) from tenants
   - Supplier/contractor payments (outbound) for maintenance
   - Utility payments
   - Insurance payments
   - Service charge distributions
   - Include realistic dates spread over 3-6 months

5. MAINTENANCE RECORDS (5-8 maintenance orders):
   - Realistic issues (boiler repair, plumbing, decoration)
   - Contractor names and costs
   - Completion dates

6. COMPLIANCE DATA:
   - Gas safety certificates (dates, expiry)
   - EICR certificates where applicable
   - Fire safety assessments

Return as JSON with these arrays. Make data realistic, interconnected (e.g., same tenant across multiple properties if applicable), and include all required fields per entity schema. For dates, use realistic past/recent dates. For amounts, use realistic GBP values.`,
      response_json_schema: {
        type: 'object',
        properties: {
          properties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                address_line_1: { type: 'string' },
                city: { type: 'string' },
                postcode: { type: 'string' },
                property_type: { type: 'string' },
                ownership_type: { type: 'string' },
                total_units: { type: 'number' },
                year_built: { type: 'number' },
              },
            },
          },
          tenants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                full_name: { type: 'string' },
                email: { type: 'string' },
                phone: { type: 'string' },
                company_name: { type: 'string' },
              },
            },
          },
          units: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                property_id_index: { type: 'number' },
                tenant_id_index: { type: 'number' },
                unit_identifier: { type: 'string' },
                monthly_rent: { type: 'number' },
                tenancy_start_date: { type: 'string' },
                tenancy_type: { type: 'string' },
              },
            },
          },
          transactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                property_id_index: { type: 'number' },
                type: { type: 'string' },
                amount: { type: 'number' },
                description: { type: 'string' },
                transaction_date: { type: 'string' },
                from_account: { type: 'string' },
                to_account: { type: 'string' },
              },
            },
          },
          maintenance: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                property_id_index: { type: 'number' },
                issue_type: { type: 'string' },
                description: { type: 'string' },
                status: { type: 'string' },
                estimated_cost: { type: 'number' },
                actual_cost: { type: 'number' },
                completion_date: { type: 'string' },
              },
            },
          },
          compliance: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                property_id_index: { type: 'number' },
                certificate_type: { type: 'string' },
                issue_date: { type: 'string' },
                expiry_date: { type: 'string' },
                status: { type: 'string' },
              },
            },
          },
        },
      },
    });

    // Now import the generated data into entities
    const importedData = {
      properties: [],
      tenants: [],
      units: [],
      transactions: [],
      maintenance: [],
      compliance: [],
    };

    try {
      // Import Properties
      if (llmResponse.properties?.length > 0) {
        const propRecords = await base44.entities.Property.bulkCreate(
          llmResponse.properties.map(p => ({
            name: p.name,
            address_line_1: p.address_line_1,
            city: p.city,
            postcode: p.postcode,
            property_type: p.property_type || 'house',
            ownership_type: p.ownership_type || 'leasehold',
            total_units: p.total_units || 1,
            year_built: p.year_built,
          }))
        );
        importedData.properties = propRecords;
      }

      // Import Tenants
      if (llmResponse.tenants?.length > 0) {
        const tenantRecords = await base44.entities.Tenant.bulkCreate(
          llmResponse.tenants.map(t => ({
            full_name: t.full_name,
            email: t.email,
            phone: t.phone,
            company_name: t.company_name,
          }))
        );
        importedData.tenants = tenantRecords;
      }

      // Import Units with property/tenant references
      if (llmResponse.units?.length > 0 && importedData.properties.length > 0 && importedData.tenants.length > 0) {
        const unitRecords = await base44.entities.Unit.bulkCreate(
          llmResponse.units.map(u => ({
            property_id: importedData.properties[u.property_id_index % importedData.properties.length]?.id,
            tenant_id: importedData.tenants[u.tenant_id_index % importedData.tenants.length]?.id,
            unit_identifier: u.unit_identifier,
            monthly_rent: u.monthly_rent,
            tenancy_start_date: u.tenancy_start_date,
            tenancy_type: u.tenancy_type || 'residential',
          }))
        );
        importedData.units = unitRecords;
      }

      // Import Financial Transactions
      if (llmResponse.transactions?.length > 0 && importedData.properties.length > 0) {
        const txnRecords = await base44.entities.FinancialTransaction.bulkCreate(
          llmResponse.transactions.map(t => ({
            property_id: importedData.properties[t.property_id_index % importedData.properties.length]?.id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            transaction_date: t.transaction_date,
            from_account: t.from_account,
            to_account: t.to_account,
          }))
        );
        importedData.transactions = txnRecords;
      }

      // Import Maintenance Orders
      if (llmResponse.maintenance?.length > 0 && importedData.properties.length > 0) {
        const mainRecords = await base44.entities.MaintenanceOrder.bulkCreate(
          llmResponse.maintenance.map(m => ({
            property_id: importedData.properties[m.property_id_index % importedData.properties.length]?.id,
            issue_type: m.issue_type,
            description: m.description,
            status: m.status || 'pending',
            estimated_cost: m.estimated_cost,
            actual_cost: m.actual_cost,
            completion_date: m.completion_date,
          }))
        );
        importedData.maintenance = mainRecords;
      }

      // Import Compliance Data
      if (llmResponse.compliance?.length > 0 && importedData.properties.length > 0) {
        const compRecords = await base44.entities.SafetyCertificate.bulkCreate(
          llmResponse.compliance.map(c => ({
            property_id: importedData.properties[c.property_id_index % importedData.properties.length]?.id,
            certificate_type: c.certificate_type,
            issue_date: c.issue_date,
            expiry_date: c.expiry_date,
            status: c.status || 'valid',
          }))
        );
        importedData.compliance = compRecords;
      }

    } catch (entityError) {
      console.error('Entity import error:', entityError);
      // Continue with partial data
    }

    return Response.json({
      success: true,
      summary: `Imported ${importedData.properties.length} properties, ${importedData.tenants.length} tenants, ${importedData.units.length} units, ${importedData.transactions.length} transactions, ${importedData.maintenance.length} maintenance orders, ${importedData.compliance.length} compliance records`,
      imported_data: importedData,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});