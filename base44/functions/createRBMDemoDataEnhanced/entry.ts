import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Enhanced RBM Demo Data - Based on Real Company Information
 * RBM (North West) Limited - Bolton, UK
 * Address: 29 Lee Lane, Horwich, Bolton, BL6 7AY
 * Phone: 01204 695919
 * Email: hello@rbm-nw.co.uk
 * Company Number: 16608812
 * SIC Code: 68320 (Management of real estate on a fee or contract basis)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Company - RBM (North West) Limited
    const company = await base44.entities.Company.create({
      name: 'RBM (North West) Limited',
      company_number: '16608812',
      status: 'active',
      category: 'core_property',
      registered_address: '29 Lee Lane, Horwich, Bolton, BL6 7AY',
      incorporation_date: '2023-06-15',
      sic_code: '68320',
      sic_description: 'Management of real estate on a fee or contract basis',
      region: 'bolton',
      notes: 'Specialist block management and property management company based in Bolton, North West England. Established to meet demand for dedicated, specialist Block Management services.',
    });

    // Create Properties - Representative North West Portfolio
    const properties = await base44.entities.Property.bulkCreate([
      {
        name: 'Admiral Point',
        address_line_1: '152 Deansgate',
        city: 'Manchester',
        postcode: 'M3 3TP',
        region: 'manchester',
        property_type: 'leasehold_block',
        ownership_type: 'leasehold',
        owning_company: company.id,
        management_company: company.id,
        total_units: 24,
        year_built: 2015,
        listed_building: false,
      },
      {
        name: 'The Willows',
        address_line_1: '48 Ashton Road',
        city: 'Cheshire',
        postcode: 'WA15 8EW',
        region: 'other',
        property_type: 'leasehold_block',
        ownership_type: 'leasehold',
        owning_company: company.id,
        management_company: company.id,
        total_units: 18,
        year_built: 2008,
        listed_building: false,
      },
      {
        name: 'Park View Apartments',
        address_line_1: '91 Princes Road',
        city: 'Liverpool',
        postcode: 'L8 1TA',
        region: 'other',
        property_type: 'leasehold_block',
        ownership_type: 'leasehold',
        owning_company: company.id,
        management_company: company.id,
        total_units: 32,
        year_built: 2012,
        listed_building: false,
      },
      {
        name: 'Bolton Town Centre',
        address_line_1: '15 Knowsley Street',
        city: 'Bolton',
        postcode: 'BL1 2AH',
        region: 'bolton',
        property_type: 'leasehold_block',
        ownership_type: 'leasehold',
        owning_company: company.id,
        management_company: company.id,
        total_units: 28,
        year_built: 2010,
        listed_building: false,
      },
    ]);

    // Create Units for each property
    const unitPromises = properties.flatMap(property => {
      const unitCount = property.total_units;
      const units = [];
      
      for (let i = 1; i <= unitCount; i++) {
        const floor = Math.ceil(i / 4);
        units.push({
          unit_reference: `Flat ${i}`,
          property_id: property.id,
          floor: `${floor}`,
          bedrooms: [1, 1, 2, 2][i % 4],
          unit_type: [1, 1, 2, 2][i % 4] === 1 ? 'flat' : 'apartment',
          tenure: 'leasehold',
          status: Math.random() > 0.15 ? 'occupied' : 'vacant',
          monthly_rent: 800 + (Math.random() * 400),
          annual_service_charge: 1200 + (Math.random() * 600),
          lease_start_date: '2019-01-01',
          lease_end_date: '2089-12-31',
          lease_term_years: 125,
          lease_remaining_years: 63,
        });
      }
      return units;
    });

    const allUnits = await base44.entities.Unit.bulkCreate(
      unitPromises.flat().slice(0, 100) // Limit to 100 units for demo
    );

    // Create Tenants
    const tenantNames = [
      'Sarah Johnson', 'Michael Chen', 'Emma Williams', 'David Brown', 'Lisa Martinez',
      'James Wilson', 'Patricia Lee', 'Robert Taylor', 'Jennifer Anderson', 'Christopher Davis',
      'Mary Rodriguez', 'Daniel Martinez', 'Barbara Garcia', 'Matthew Robinson', 'Susan Clark',
    ];

    const tenants = await base44.entities.Tenant.bulkCreate(
      tenantNames.map((name, idx) => ({
        full_name: name,
        email: `${name.toLowerCase().replace(/\s/g, '.')}@email.com`,
        phone: `077${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        tenant_type: ['leaseholder', 'assured_shorthold'][Math.floor(Math.random() * 2)],
        property_id: properties[idx % properties.length].id,
        unit_id: allUnits[idx % allUnits.length].id,
        tenancy_start_date: '2022-06-01',
        tenancy_end_date: '2027-05-31',
        deposit_amount: 1500,
        deposit_scheme: ['dps', 'mydeposits', 'tds'][Math.floor(Math.random() * 3)],
        status: 'active',
        emergency_contact_name: `${name} Parent`,
        emergency_contact_phone: `077${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
      }))
    );

    // Create Service Charges
    const serviceCharges = await base44.entities.ServiceCharge.bulkCreate(
      properties.map(property => ({
        property_id: property.id,
        year: 2025,
        period_start: '2025-04-01',
        period_end: '2026-03-31',
        status: 'estimated',
        total_estimated_cost: property.total_units * 1350,
        leaseholder_count: property.total_units,
        cost_allocation_method: 'per_unit',
        cost_breakdown: [
          { category: 'repairs_maintenance', budgeted_cost: property.total_units * 350 },
          { category: 'insurance', budgeted_cost: property.total_units * 200 },
          { category: 'management_fee', budgeted_cost: property.total_units * 400 },
          { category: 'cleaning', budgeted_cost: property.total_units * 150 },
          { category: 'utilities_common', budgeted_cost: property.total_units * 150 },
          { category: 'contingency', budgeted_cost: property.total_units * 100 },
        ],
        per_unit_charges: allUnits
          .filter(u => u.property_id === property.id)
          .slice(0, property.total_units)
          .map(unit => ({
            unit_id: unit.id,
            estimated_charge: 1350,
            payment_status: Math.random() > 0.1 ? 'paid' : 'unpaid',
          })),
        section_20_consultation_required: false,
        section_20_status: 'not_required',
        leaseholder_statement_sent: true,
        statement_sent_date: '2025-05-01',
      }))
    );

    // Create Maintenance Orders
    const maintenanceOrders = await base44.entities.MaintenanceOrder.bulkCreate([
      {
        title: 'Annual Fire Safety Inspection',
        description: 'Annual fire safety inspection and testing of all systems',
        property_id: properties[0].id,
        priority: 'urgent',
        status: 'assigned',
        category: 'fire_safety',
        assigned_contractor_name: 'SafeGuard Fire Services',
        assigned_contractor_phone: '0161 234 5678',
        scheduled_date: '2025-04-15',
        estimated_cost: 1500,
      },
      {
        title: 'Boiler Service & Maintenance',
        description: 'Annual boiler service and gas safety certification',
        property_id: properties[0].id,
        priority: 'standard',
        status: 'in_progress',
        category: 'plumbing',
        assigned_contractor_name: 'Heating Solutions Ltd',
        assigned_contractor_phone: '0161 555 9999',
        assigned_date: '2025-03-20',
        started_date: '2025-03-25',
        estimated_cost: 250,
      },
      {
        title: 'Lift Maintenance Contract',
        description: 'Quarterly lift maintenance and safety checks',
        property_id: properties[2].id,
        priority: 'standard',
        status: 'assigned',
        category: 'lift',
        assigned_contractor_name: 'Lift Tech Services',
        assigned_contractor_phone: '0141 333 2222',
        scheduled_date: '2025-04-10',
        estimated_cost: 800,
      },
      {
        title: 'Roof Repair & Inspection',
        description: 'Repair roof tiles and conduct structural inspection',
        property_id: properties[1].id,
        priority: 'urgent',
        status: 'reported',
        category: 'roofing',
        estimated_cost: 4500,
      },
    ]);

    // Create Safety Certificates
    const certificates = await base44.entities.SafetyCertificate.bulkCreate([
      {
        property_id: properties[0].id,
        certificate_type: 'gas_safety',
        issue_date: '2025-02-01',
        expiry_date: '2026-02-01',
        certificate_number: 'GAS-2025-001',
        issuing_body: 'SafeGuard Gas Services',
        status: 'valid',
      },
      {
        property_id: properties[0].id,
        certificate_type: 'eicr',
        issue_date: '2024-06-15',
        expiry_date: '2029-06-15',
        certificate_number: 'EICR-2024-001',
        issuing_body: 'Electrical Safety Inspections',
        status: 'valid',
      },
      {
        property_id: properties[1].id,
        certificate_type: 'gas_safety',
        issue_date: '2024-11-20',
        expiry_date: '2025-11-20',
        certificate_number: 'GAS-2024-002',
        issuing_body: 'SafeGuard Gas Services',
        status: 'expiring_soon',
        alert_days: 30,
      },
    ]);

    // Create Out of Hours Service Configuration
    const oohService = await base44.entities.OutOfHoursService.create({
      company_id: company.id,
      service_name: 'RBM Emergency After-Hours Support',
      service_tier: 'premium',
      is_active: true,
      start_date: '2024-01-01',
      monthly_cost: 450,
      call_handling_options: [
        'log_and_email',
        'maintenance_order_creation',
        'contractor_dispatch',
      ],
      emergency_contractors: [
        {
          contractor_name: 'SafeGuard Emergency Services',
          specialties: ['heating', 'plumbing', 'electrical'],
          availability: '24/7',
        },
        {
          contractor_name: 'Locksmith Pro',
          specialties: ['locksmith', 'security'],
          availability: '24/7',
        },
      ],
      escalation_contact: {
        name: 'Nigel Brown (RBM Manager)',
        phone: '01204 695919',
        email: 'nigel@rbm-nw.co.uk',
      },
      notes: 'Premium tier with immediate contractor dispatch for emergency situations',
    });

    // Create Invoices for Out of Hours Services
    const invoices = await base44.entities.Invoice.bulkCreate([
      {
        service_id: oohService.id,
        company_id: company.id,
        invoice_number: 'INV-2025-001',
        billing_period_start: '2025-01-01',
        billing_period_end: '2025-01-31',
        service_tier: 'premium',
        amount: 450,
        status: 'paid',
        issue_date: '2025-01-05',
        due_date: '2025-01-31',
        paid_date: '2025-01-28',
        payment_method: 'bank_transfer',
      },
      {
        service_id: oohService.id,
        company_id: company.id,
        invoice_number: 'INV-2025-002',
        billing_period_start: '2025-02-01',
        billing_period_end: '2025-02-28',
        service_tier: 'premium',
        amount: 450,
        status: 'sent',
        issue_date: '2025-02-05',
        due_date: '2025-02-28',
        payment_method: 'bank_transfer',
      },
      {
        service_id: oohService.id,
        company_id: company.id,
        invoice_number: 'INV-2025-003',
        billing_period_start: '2025-03-01',
        billing_period_end: '2025-03-31',
        service_tier: 'premium',
        amount: 450,
        status: 'issued',
        issue_date: '2025-03-05',
        due_date: '2025-03-31',
        payment_method: 'bank_transfer',
      },
    ]);

    // Update user with company context
    await base44.auth.updateMe({
      current_demo_company_id: company.id,
      business_name: 'RBM (North West) Limited',
    });

    return Response.json({
      success: true,
      message: 'RBM Enhanced Demo Data Created Successfully',
      data: {
        company: {
          id: company.id,
          name: company.name,
          location: 'Bolton, North West England',
          registrationNumber: company.company_number,
        },
        portfolio: {
          propertiesCount: properties.length,
          unitsCount: allUnits.length,
          tenantsCount: tenants.length,
          totalServiceChargeBudget: serviceCharges.reduce((sum, sc) => sum + sc.total_estimated_cost, 0),
        },
        operationalSetup: {
          maintenanceOrdersCreated: maintenanceOrders.length,
          safetyNumbersCertificatesCount: certificates.length,
          outOfHoursServiceActive: true,
          invoicesGenerated: invoices.length,
        },
        realWorldData: {
          companyRegistration: '16608812',
          sicCode: '68320 (Real estate management)',
          address: '29 Lee Lane, Horwich, Bolton, BL6 7AY',
          phone: '01204 695919',
          email: 'hello@rbm-nw.co.uk',
          website: 'rbm-nw.co.uk',
          serviceModel: 'Specialist Block Management with premium out-of-hours support',
        },
      },
    });
  } catch (error) {
    console.error('Error creating RBM demo data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});