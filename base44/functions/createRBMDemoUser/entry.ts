import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Create RBM company
    const rbmCompany = await base44.entities.Company.create({
      name: 'RBM (North West) Limited',
      company_number: 'TBD',
      status: 'active',
      category: 'management',
      registered_address: '29 Lee Lane, Horwich, Bolton, BL6 7AY',
      incorporation_date: '2020-01-01',
      sic_code: '68320',
      sic_description: 'Management of real estate on a fee or contract basis',
      region: 'bolton',
      notes: 'Founded by Regency Estates. TPI member. The Property Ombudsman member.',
    });

    // Create property 1: Modern apartment block (based on Atherton testimonial)
    const property1 = await base44.entities.Property.create({
      name: 'Atherton Apartments',
      address_line_1: 'Atherton',
      city: 'Atherton',
      postcode: 'M46',
      region: 'bolton',
      property_type: 'leasehold_block',
      ownership_type: 'leasehold',
      total_units: 24,
      year_built: 2008,
      listed_building: false,
      notes: 'Modern apartment block. Managed by RBM since 2019. Primary focus on transparency and leaseholder communication.',
    });

    // Create property 2: Estate development (based on Alan Tattersall testimonial)
    const property2 = await base44.entities.Property.create({
      name: 'Horwich Heights Estate',
      address_line_1: 'Horwich',
      city: 'Horwich',
      postcode: 'BL6',
      region: 'bolton',
      property_type: 'leasehold_block',
      ownership_type: 'leasehold',
      total_units: 32,
      year_built: 2010,
      listed_building: false,
      notes: 'Multi-unit residential development. Long-standing RBM client (several years). Developer liaison and resident communication.',
    });

    // Create property 3: Mixed communal development
    const property3 = await base44.entities.Property.create({
      name: 'Lee Lane Quarter',
      address_line_1: 'Lee Lane',
      city: 'Bolton',
      postcode: 'BL6 7AY',
      region: 'bolton',
      property_type: 'mixed_use',
      ownership_type: 'leasehold',
      total_units: 18,
      year_built: 2015,
      listed_building: false,
      notes: 'Mixed-use development with retail and residential. Focus on communal area standards.',
    });

    // Create Units for Property 1
    const units1 = [];
    for (let i = 1; i <= 24; i++) {
      const unit = await base44.entities.Unit.create({
        unit_reference: `Flat ${i}`,
        property_id: property1.id,
        floor: Math.ceil(i / 6).toString(),
        bedrooms: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
        unit_type: i % 3 === 0 ? 'apartment' : i % 2 === 0 ? 'flat' : 'studio',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 0,
        annual_service_charge: 1200 + (i * 50),
        notes: `Unit ${i} - Atherton Apartments`,
      });
      units1.push(unit);
    }

    // Create Tenants
    const tenants = [];
    const tenantData = [
      { name: 'Sarah Johnson', email: 'sarah.j@example.com', phone: '07700 900001', type: 'leaseholder' },
      { name: 'Mark Williams', email: 'mark.w@example.com', phone: '07700 900002', type: 'leaseholder' },
      { name: 'Emma Davis', email: 'emma.d@example.com', phone: '07700 900003', type: 'leaseholder' },
      { name: 'James Brown', email: 'james.b@example.com', phone: '07700 900004', type: 'leaseholder' },
      { name: 'Lisa Thompson', email: 'lisa.t@example.com', phone: '07700 900005', type: 'leaseholder' },
      { name: 'David Miller', email: 'david.m@example.com', phone: '07700 900006', type: 'leaseholder' },
    ];

    for (let i = 0; i < tenantData.length; i++) {
      const tenant = await base44.entities.Tenant.create({
        full_name: tenantData[i].name,
        email: tenantData[i].email,
        phone: tenantData[i].phone,
        tenant_type: tenantData[i].type,
        unit_id: units1[i % units1.length].id,
        property_id: property1.id,
        tenancy_start_date: '2022-01-15',
        status: 'active',
        notes: `Leaseholder - ${tenantData[i].name}`,
      });
      tenants.push(tenant);
    }

    // Create Contacts (RBM team + contractors)
    const contacts = [];
    const contactData = [
      { name: 'Nick Holt', type: 'director', company: 'RBM (North West)', email: 'nick@rbm-nw.co.uk', phone: '01204 924400' },
      { name: 'Nigel Holt', type: 'director', company: 'RBM (North West)', email: 'nigel@rbm-nw.co.uk', phone: '01204 924400' },
      { name: 'Zoe Richardson', type: 'agent', company: 'RBM (North West)', email: 'zoe@rbm-nw.co.uk', phone: '01204 924400' },
      { name: 'Charlie Morris', type: 'agent', company: 'RBM (North West)', email: 'charlie@rbm-nw.co.uk', phone: '01204 924400' },
      { name: 'Rhiannon Hoyle', type: 'agent', company: 'RBM (North West)', email: 'rhiannon@rbm-nw.co.uk', phone: '01204 924400' },
      { name: 'John Smith Plumbing', type: 'contractor', company: 'JS Plumbing', email: 'john@jsplumbing.co.uk', phone: '07700 111111' },
      { name: 'Elite Electrical Services', type: 'contractor', company: 'Elite Electrical', email: 'dispatch@elite-elec.co.uk', phone: '07700 222222' },
      { name: 'NW Fire Safety', type: 'contractor', company: 'NW Fire', email: 'admin@nwfire.co.uk', phone: '07700 333333' },
      { name: 'Cleaning Plus Ltd', type: 'contractor', company: 'Cleaning Plus', email: 'ops@cleaningplus.co.uk', phone: '07700 444444' },
      { name: 'RBM Insurance Broker', type: 'insurance_broker', company: 'RBM Insurance', email: 'insurance@rbm-nw.co.uk', phone: '01204 924400' },
    ];

    for (const contactData_item of contactData) {
      const contact = await base44.entities.Contact.create({
        full_name: contactData_item.name,
        email: contactData_item.email,
        phone: contactData_item.phone,
        contact_type: contactData_item.type,
        company_name: contactData_item.company,
      });
      contacts.push(contact);
    }

    // Create Service Charges
    const serviceCharges = [];
    for (let year = 2024; year <= 2025; year++) {
      const sc = await base44.entities.ServiceCharge.create({
        property_id: property1.id,
        year: year,
        period_start: `${year}-01-01`,
        period_end: `${year}-12-31`,
        status: year === 2025 ? 'estimated' : 'final_approved',
        total_estimated_cost: 35000,
        actual_cost: year === 2024 ? 34800 : null,
        leaseholder_count: 24,
        cost_allocation_method: 'per_unit',
        cost_breakdown: [
          { category: 'repairs_maintenance', budgeted_cost: 12000, actual_cost: year === 2024 ? 11900 : null },
          { category: 'insurance', budgeted_cost: 8500, actual_cost: year === 2024 ? 8500 : null },
          { category: 'management_fee', budgeted_cost: 7200, actual_cost: year === 2024 ? 7200 : null },
          { category: 'cleaning', budgeted_cost: 4000, actual_cost: year === 2024 ? 4200 : null },
          { category: 'utilities_common', budgeted_cost: 2400, actual_cost: year === 2024 ? 2400 : null },
          { category: 'fire_safety', budgeted_cost: 900, actual_cost: year === 2024 ? 900 : null },
        ],
        section_20_consultation_required: false,
        section_20_status: 'not_required',
        leaseholder_statement_sent: year === 2024,
        statement_sent_date: year === 2024 ? '2024-03-15' : null,
        notes: `Service charge account ${year} - Atherton Apartments`,
      });
      serviceCharges.push(sc);
    }

    // Create Maintenance Orders
    const maintenanceOrders = [];
    const maintenanceData = [
      { title: 'Lift maintenance and inspection', category: 'lift', priority: 'high', status: 'completed' },
      { title: 'Communal lighting repair - Ground floor corridor', category: 'electrical', priority: 'standard', status: 'completed' },
      { title: 'Fire alarm system test', category: 'fire_safety', priority: 'high', status: 'completed' },
      { title: 'External gutter and drainage clean', category: 'general', priority: 'standard', status: 'in_progress' },
      { title: 'Communal area deep clean', category: 'cleaning', priority: 'standard', status: 'approved' },
      { title: 'Emergency lighting battery replacement', category: 'electrical', priority: 'high', status: 'reported' },
    ];

    for (const mo of maintenanceData) {
      const order = await base44.entities.MaintenanceOrder.create({
        title: mo.title,
        description: `Monthly inspection identifies issue: ${mo.title}. Standard RBM maintenance protocol.`,
        property_id: property1.id,
        reported_by: 'RBM Monthly Inspection',
        priority: mo.priority,
        status: mo.status,
        category: mo.category,
        contractor_name: mo.category === 'electrical' ? 'Elite Electrical Services' : mo.category === 'fire_safety' ? 'NW Fire Safety' : 'Cleaning Plus Ltd',
        contractor_phone: mo.category === 'electrical' ? '07700 222222' : mo.category === 'fire_safety' ? '07700 333333' : '07700 444444',
        estimated_cost: mo.priority === 'high' ? 800 : 300,
        scheduled_date: '2026-04-15',
        notes: `Scheduled as part of planned maintenance program. RBM proactive approach.`,
      });
      maintenanceOrders.push(order);
    }

    // Create Compliance records (Fire Safety, Building Safety)
    const buildingSafety = await base44.entities.BuildingSafety.create({
      property_id: property1.id,
      building_classification: {
        height_metres: 18,
        storeys: 4,
        units_count: 24,
        is_high_rise_residential_building: false,
        in_scope_building_safety_act: false,
      },
      accountable_person: {
        appointed: true,
        name: 'Nigel Holt',
        organisation: 'RBM (North West) Limited',
        contact_email: 'nigel@rbm-nw.co.uk',
        contact_phone: '01204 924400',
        appointment_date: '2021-01-01',
        responsibilities: ['structural_safety', 'fire_safety', 'regulatory_compliance'],
      },
      responsible_person: {
        appointed: true,
        name: 'Zoe Richardson',
        organisation: 'RBM (North West) Limited',
        contact_details: '01204 924400',
        appointed_date: '2021-01-01',
        fire_safety_duties: ['fire_risk_assessment', 'emergency_procedures', 'staff_training', 'equipment_maintenance'],
      },
      fire_safety: {
        fire_risk_assessment: {
          last_assessment_date: '2025-03-01',
          next_assessment_due: '2026-03-01',
          assessment_frequency_months: 12,
          assessor_qualified: true,
          fire_safety_report_url: 'https://rbm-nw.co.uk/docs/fire-assessment-2025.pdf',
          key_findings: 'Building is compliant with all fire safety standards.',
        },
        alarm_systems: {
          fire_alarms_fitted: true,
          type: 'combined',
          last_tested_date: '2026-03-15',
          next_test_due: '2026-04-15',
          maintenance_contract: 'NW Fire Safety',
        },
        emergency_lighting: {
          fitted: true,
          last_tested: '2026-03-15',
          next_due: '2026-09-15',
        },
        fire_extinguishers: {
          fitted: true,
          count: 8,
          last_serviced: '2025-12-01',
          next_service_due: '2026-12-01',
        },
      },
      notes: 'Atherton Apartments - Modern block with high compliance standards. Monthly inspections maintained.',
    });

    // Create RTM record
    const rtm = await base44.entities.RTMManagement.create({
      property_id: property2.id,
      rtm_company_id: rbmCompany.id,
      rtm_status: 'traditional_management',
      management_type: 'managing_agent',
      current_managing_agent: 'RBM (North West) Limited',
      leaseholder_eligibility: {
        total_leaseholders: 32,
        long_leaseholders: 30,
        eligible_to_participate: 32,
        eligible_percentage: 100,
        claim_threshold_met: true,
      },
      leaseholder_communications: [
        {
          date_sent: '2026-01-15',
          communication_type: 'annual_statement',
          recipients_count: 32,
          status: 'sent',
        },
      ],
      notes: 'Horwich Heights Estate - RBM long-standing client relationship. Proactive communication with leaseholders.',
    });

    // Create Financial Transactions
    const transactions = [];
    for (let i = 0; i < 12; i++) {
      const month = (i + 1).toString().padStart(2, '0');
      const tx = await base44.entities.FinancialTransaction.create({
        description: `Service charge collection Q${Math.ceil((i + 1) / 3)} - Atherton Apartments`,
        transaction_type: 'service_charge',
        amount: 8800,
        direction: 'income',
        status: 'paid',
        due_date: `2026-${month}-01`,
        paid_date: `2026-${month}-05`,
        property_id: property1.id,
        reference: `SC-2026-${month}-APT`,
        notes: `Regular service charge collection - High collection rate (92% per RBM metrics)`,
      });
      transactions.push(tx);
    }

    // Create Emergency Callout records
    const emergencyCallouts = [];
    const calloutTypes = ['water_leak', 'electrical_fault', 'heating_failure', 'security_breach'];
    
    for (let i = 0; i < 3; i++) {
      const callout = await base44.entities.EmergencyCallout.create({
        property_id: property1.id,
        unit_id: units1[i].id,
        caller_name: tenants[i].full_name,
        caller_phone: tenants[i].phone,
        call_received_date: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        call_type: calloutTypes[i],
        severity: i === 0 ? 'high' : 'medium',
        description: `Out-of-hours emergency reported by leaseholder. RBM emergency line response: ${i === 0 ? '12 minutes' : '18 minutes'}`,
        response_time_minutes: i === 0 ? 12 : 18,
        status: 'resolved',
        assigned_contractor_name: i === 0 ? 'JS Plumbing' : 'Elite Electrical Services',
        assigned_contractor_phone: i === 0 ? '07700 111111' : '07700 222222',
        escalation_method: 'phone',
        escalation_time: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        estimated_arrival_time: new Date(Date.now() - ((i * 7 - 1) * 24 * 60 * 60 * 1000)).toISOString(),
        actual_arrival_time: new Date(Date.now() - ((i * 7 - 0.5) * 24 * 60 * 60 * 1000)).toISOString(),
        resolved_date: new Date(Date.now() - ((i * 7 - 0.2) * 24 * 60 * 60 * 1000)).toISOString(),
        resolution_notes: `Issue resolved on-site. Documented by RBM. Contractor report filed.`,
        cost_actual: i === 0 ? 350 : 280,
        notes: `RBM 24/7 emergency line: 07919 408 214. Professional rapid response protocol.`,
      });
      emergencyCallouts.push(callout);
    }

    // Create Leaseholder Rights records
    for (let i = 0; i < 3; i++) {
      const rights = await base44.entities.LeaseholderRights.create({
        unit_id: units1[i].id,
        property_id: property1.id,
        tenant_id: tenants[i].id,
        lease_details: {
          lease_start_date: '2022-01-15',
          lease_end_date: '2122-01-15',
          original_term_years: 100,
          remaining_years: 96,
          is_long_leaseholder: true,
        },
        statutory_rights: ['right_to_information', 'right_to_manage', 'lease_extension'],
        prescribed_information: {
          notice_provided: true,
          notice_date: '2022-01-15',
          managing_agent_name: 'RBM (North West) Limited',
          managing_agent_address: '29 Lee Lane, Horwich, Bolton, BL6 7AY',
          managing_agent_contact: '01204 924400 / hello@rbm-nw.co.uk',
          dispute_body_name: 'The Property Ombudsman',
          dispute_body_contact: 'www.thepropertyombudsman.com',
        },
        service_charge_transparency: {
          annual_statement_received: true,
          statement_date: '2025-03-15',
          service_charge_amount: 1200,
          arrears_amount: 0,
          arrears_status: 'no_arrears',
        },
        notes: `${tenants[i].full_name} - Full transparency and communication from RBM.`,
      });
    }

    // Create a sample workflow
    const workflow = await base44.entities.Workflow.create({
      name: 'Gas Safety Certificate Reminder',
      trigger_type: 'custom',
      days_before: 30,
      is_active: true,
      actions: [
        {
          action_type: 'send_email',
          email_subject: 'Gas Safety Certificate Due - {{property_name}}',
          email_body_template: 'Your Gas Safety Certificate (CP12) is due for renewal in {{days}} days. Please contact your managing agent to arrange.',
        },
      ],
      apply_to_properties: 'all',
      notes: 'RBM proactive compliance reminder - Ensures all properties maintain current certifications.',
    });

    return Response.json({
      success: true,
      message: 'RBM demo user profile created successfully',
      data: {
        company: rbmCompany.name,
        properties: [property1.name, property2.name, property3.name],
        units_created: units1.length,
        tenants_created: tenants.length,
        contacts_created: contacts.length,
        service_charges: serviceCharges.length,
        maintenance_orders: maintenanceOrders.length,
        emergency_callouts: emergencyCallouts.length,
        transactions: transactions.length,
        summary: `Full RBM demo profile with 3 properties (Atherton Apartments as primary), 24+ units, 6 leaseholders, 10 team/contractor contacts, 2 years service charges, 6 maintenance orders, 3 emergency callouts, 12 financial transactions, compliance records, and leaseholder rights. Ready for demonstration.`,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error creating RBM demo user:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});