import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Populate RBM Full Demo Data Across All Modules
 * Based on real UK property management industry data and benchmarks
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ============ COMPANY & PORTFOLIO SETUP ============
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
    });

    const properties = await base44.entities.Property.bulkCreate([
      {
        name: 'Admiral Point, Manchester',
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
      },
      {
        name: 'The Willows, Cheshire',
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
      },
      {
        name: 'Park View Apartments, Liverpool',
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
      },
    ]);

    // ============ UNITS ============
    const units = [];
    for (const property of properties) {
      for (let i = 1; i <= property.total_units; i++) {
        const floor = Math.ceil(i / 4);
        units.push({
          unit_reference: `Flat ${i}`,
          property_id: property.id,
          floor: `${floor}`,
          bedrooms: [1, 1, 2, 2][i % 4],
          unit_type: [1, 1, 2, 2][i % 4] === 1 ? 'flat' : 'apartment',
          tenure: 'leasehold',
          status: i % 7 === 0 ? 'vacant' : 'occupied',
          monthly_rent: 950 + Math.random() * 500,
          annual_ground_rent: 250,
          annual_service_charge: 1400 + Math.random() * 600,
          lease_start_date: '2019-01-01',
          lease_end_date: '2119-12-31',
          lease_term_years: 125,
          lease_remaining_years: 94,
        });
      }
    }
    const createdUnits = await base44.entities.Unit.bulkCreate(units);

    // ============ TENANTS ============
    const tenantData = [
      { name: 'Sarah Johnson', type: 'leaseholder' },
      { name: 'Michael Chen', type: 'leaseholder' },
      { name: 'Emma Williams', type: 'assured_shorthold' },
      { name: 'David Brown', type: 'leaseholder' },
      { name: 'Lisa Martinez', type: 'leaseholder' },
      { name: 'James Wilson', type: 'assured_shorthold' },
      { name: 'Patricia Lee', type: 'leaseholder' },
      { name: 'Robert Taylor', type: 'leaseholder' },
      { name: 'Jennifer Anderson', type: 'assured_shorthold' },
      { name: 'Christopher Davis', type: 'leaseholder' },
      { name: 'Mary Rodriguez', type: 'leaseholder' },
      { name: 'Daniel Martinez', type: 'assured_shorthold' },
      { name: 'Barbara Garcia', type: 'leaseholder' },
      { name: 'Matthew Robinson', type: 'leaseholder' },
      { name: 'Susan Clark', type: 'assured_shorthold' },
    ];

    const tenants = await base44.entities.Tenant.bulkCreate(
      tenantData.map((t, idx) => ({
        full_name: t.name,
        email: `${t.name.toLowerCase().replace(/\s/g, '.')}@email.com`,
        phone: `077${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        tenant_type: t.type,
        property_id: properties[idx % properties.length].id,
        unit_id: createdUnits[idx % createdUnits.length].id,
        tenancy_start_date: '2022-06-01',
        tenancy_end_date: '2027-05-31',
        deposit_amount: 1500,
        deposit_scheme: ['dps', 'mydeposits', 'tds'][Math.floor(Math.random() * 3)],
        status: ['active', 'active', 'active', 'in_arrears'][Math.floor(Math.random() * 4)],
      }))
    );

    // ============ SERVICE CHARGES ============
    const serviceCharges = await base44.entities.ServiceCharge.bulkCreate(
      properties.map(property => ({
        property_id: property.id,
        year: 2025,
        period_start: '2025-04-01',
        period_end: '2026-03-31',
        status: 'estimated',
        total_estimated_cost: property.total_units * 1400,
        leaseholder_count: property.total_units,
        cost_allocation_method: 'per_unit',
        cost_breakdown: [
          { category: 'repairs_maintenance', budgeted_cost: property.total_units * 380, note: 'Planned maintenance & emergency repairs' },
          { category: 'insurance', budgeted_cost: property.total_units * 220, note: 'Buildings & public liability' },
          { category: 'management_fee', budgeted_cost: property.total_units * 420, note: 'Professional management & admin' },
          { category: 'cleaning', budgeted_cost: property.total_units * 160, note: 'Common areas & grounds' },
          { category: 'utilities_common', budgeted_cost: property.total_units * 140, note: 'Electricity, water, heating common' },
          { category: 'contingency', budgeted_cost: property.total_units * 80, note: 'Emergency reserve fund' },
        ],
      }))
    );

    // ============ GROUND RENT ============
    const groundRents = await base44.entities.GroundRent.bulkCreate(
      createdUnits.slice(0, 30).map(unit => ({
        unit_id: unit.id,
        annual_amount: 250,
        payable_date: '2025-04-01',
        paid_to: company.id,
        status: Math.random() > 0.1 ? 'paid' : 'pending',
        notes: 'Ground rent capped at £250 per annum per government guidelines',
      }))
    );

    // ============ RENT LEDGER & FINANCIAL TRANSACTIONS ============
    const transactions = [];
    for (const tenant of tenants.slice(0, 10)) {
      transactions.push({
        description: `Monthly rent payment - ${tenant.full_name}`,
        transaction_type: 'rent_payment',
        amount: 1200 + Math.random() * 300,
        direction: 'income',
        status: Math.random() > 0.15 ? 'paid' : 'overdue',
        due_date: '2025-03-01',
        paid_date: '2025-02-28',
        property_id: properties[0].id,
        tenant_id: tenant.id,
      });
      
      transactions.push({
        description: `Service charge - ${tenant.full_name}`,
        transaction_type: 'service_charge',
        amount: 350,
        direction: 'income',
        status: 'paid',
        due_date: '2025-03-01',
        paid_date: '2025-03-01',
        property_id: properties[0].id,
        tenant_id: tenant.id,
      });
    }

    await base44.entities.FinancialTransaction.bulkCreate(transactions);

    // ============ MAINTENANCE ORDERS ============
    const maintenanceOrders = await base44.entities.MaintenanceOrder.bulkCreate([
      {
        title: 'Annual Fire Safety Inspection',
        description: 'Comprehensive fire safety audit & testing',
        property_id: properties[0].id,
        priority: 'urgent',
        status: 'assigned',
        category: 'fire_safety',
        assigned_contractor_name: 'SafeGuard Fire Services',
        assigned_contractor_phone: '0161 234 5678',
        assigned_contractor_email: 'info@safeguardfire.com',
        scheduled_date: '2025-04-15',
        estimated_cost: 1500,
      },
      {
        title: 'Boiler Service & Maintenance',
        description: 'Annual gas safety certification & service',
        property_id: properties[0].id,
        priority: 'standard',
        status: 'in_progress',
        category: 'plumbing',
        assigned_contractor_name: 'Heating Solutions Ltd',
        assigned_contractor_phone: '0161 555 9999',
        assigned_contractor_email: 'support@heatingsolutions.com',
        assigned_date: '2025-03-20',
        started_date: '2025-03-25',
        estimated_cost: 250,
        actual_cost: 280,
      },
      {
        title: 'Lift Maintenance Contract',
        description: 'Quarterly lift safety checks & maintenance',
        property_id: properties[2].id,
        priority: 'standard',
        status: 'assigned',
        category: 'lift',
        assigned_contractor_name: 'Lift Tech Services',
        assigned_contractor_phone: '0141 333 2222',
        assigned_contractor_email: 'bookings@lifttech.com',
        scheduled_date: '2025-04-10',
        estimated_cost: 800,
      },
      {
        title: 'Roof Tile Replacement',
        description: 'Repair damaged tiles & structural inspection',
        property_id: properties[1].id,
        priority: 'urgent',
        status: 'reported',
        category: 'roofing',
        estimated_cost: 4500,
        notes: 'Weather damage from February storm',
      },
      {
        title: 'Communal Area Deep Clean',
        description: 'Professional deep clean of lobbies & corridors',
        property_id: properties[3].id,
        priority: 'standard',
        status: 'completed',
        category: 'cleaning',
        assigned_contractor_name: 'Professional Cleaning Co',
        assigned_contractor_phone: '0151 444 5555',
        completed_date: '2025-03-10',
        actual_cost: 600,
      },
    ]);

    // ============ EMERGENCY CALLOUTS ============
    const emergencyCallouts = await base44.entities.EmergencyCallout.bulkCreate([
      {
        property_id: properties[0].id,
        unit_id: createdUnits[0].id,
        caller_name: 'Sarah Johnson',
        caller_phone: '07700 123456',
        call_received_date: '2025-03-15T22:30:00Z',
        call_type: 'heating_failure',
        severity: 'high',
        description: 'Central heating system not responding, temperature dropping',
        status: 'resolved',
        assigned_contractor_name: 'Heating Solutions Ltd',
        assigned_contractor_phone: '0161 555 9999',
        escalation_method: 'phone',
        escalation_time: '2025-03-15T22:35:00Z',
        estimated_arrival_time: '2025-03-15T23:45:00Z',
        actual_arrival_time: '2025-03-15T23:40:00Z',
        response_time_minutes: 70,
        resolution_notes: 'Boiler ignition fault - reset and recharged system. Works OK.',
        resolved_date: '2025-03-16T00:30:00Z',
        cost_actual: 185,
      },
      {
        property_id: properties[1].id,
        unit_id: createdUnits[25].id,
        caller_name: 'David Brown',
        caller_phone: '07700 654321',
        call_received_date: '2025-03-18T02:15:00Z',
        call_type: 'water_leak',
        severity: 'critical',
        description: 'Major water leak from flat above, water damage in progress',
        status: 'resolved',
        assigned_contractor_name: 'Emergency Plumbing 24/7',
        assigned_contractor_phone: '0161 888 7777',
        escalation_method: 'multiple',
        escalation_time: '2025-03-18T02:20:00Z',
        estimated_arrival_time: '2025-03-18T03:15:00Z',
        actual_arrival_time: '2025-03-18T03:10:00Z',
        response_time_minutes: 55,
        resolution_notes: 'Located source - burst pipe in upper unit. Isolate water & temporary repair.',
        resolved_date: '2025-03-18T04:45:00Z',
        cost_actual: 425,
        follow_up_required: true,
        follow_up_notes: 'Schedule permanent pipe replacement for next week',
      },
    ]);

    // ============ SAFETY CERTIFICATES ============
    const certificates = await base44.entities.SafetyCertificate.bulkCreate([
      {
        property_id: properties[0].id,
        certificate_type: 'gas_safety',
        issue_date: '2025-02-01',
        expiry_date: '2026-02-01',
        certificate_number: 'GAS-MAN-2025-001',
        issuing_body: 'SafeGuard Gas Services',
        status: 'valid',
        document_url: 'https://example.com/certs/gas-2025-001.pdf',
      },
      {
        property_id: properties[0].id,
        certificate_type: 'eicr',
        issue_date: '2024-06-15',
        expiry_date: '2029-06-15',
        certificate_number: 'EICR-MAN-2024-001',
        issuing_body: 'Electrical Safety Inspections Ltd',
        status: 'valid',
        document_url: 'https://example.com/certs/eicr-2024-001.pdf',
      },
      {
        property_id: properties[1].id,
        certificate_type: 'gas_safety',
        issue_date: '2024-11-20',
        expiry_date: '2025-11-20',
        certificate_number: 'GAS-CHE-2024-002',
        issuing_body: 'SafeGuard Gas Services',
        status: 'expiring_soon',
        alert_days: 30,
        document_url: 'https://example.com/certs/gas-2024-002.pdf',
      },
      {
        property_id: properties[2].id,
        certificate_type: 'fire_safety',
        issue_date: '2024-09-10',
        expiry_date: '2025-09-10',
        certificate_number: 'FIRE-LIV-2024-001',
        issuing_body: 'FireSafe UK',
        status: 'expiring_soon',
        alert_days: 45,
        document_url: 'https://example.com/certs/fire-2024-001.pdf',
      },
    ]);

    // ============ BUILDING SAFETY ============
    const buildingSafety = await base44.entities.BuildingSafety.create({
      property_id: properties[0].id,
      building_classification: {
        height_metres: 18,
        storeys: 6,
        units_count: 24,
        is_high_rise_residential_building: false,
        in_scope_building_safety_act: false,
      },
      accountable_person: {
        appointed: true,
        name: 'Nigel Brown',
        organisation: 'RBM (North West) Limited',
        contact_email: 'nigel@rbm-nw.co.uk',
        contact_phone: '01204 695919',
        appointment_date: '2024-01-01',
      },
      fire_safety: {
        fire_risk_assessment: {
          last_assessment_date: '2024-11-15',
          next_assessment_due: '2025-11-15',
          assessment_frequency_months: 12,
          assessor_qualified: true,
          fire_safety_report_url: 'https://example.com/reports/fire-2024.pdf',
          key_findings: 'Emergency lighting and alarms functioning. Evacuation procedures clear.',
          recommendations: [
            {
              description: 'Update fire safety signage in basement level',
              priority: 'medium',
              completion_date: '2025-06-30',
              completed: false,
            },
          ],
        },
        alarm_systems: {
          fire_alarms_fitted: true,
          type: 'optical',
          last_tested_date: '2025-03-01',
          next_test_due: '2025-04-01',
          maintenance_contract: 'SafeGuard Fire Services - Annual',
        },
      },
      structural_safety: {
        structural_defect_register: [
          {
            defect_id: 'DEFECT-001',
            description: 'Minor cracks in mortar pointing - east elevation',
            location: 'East face, 4th floor',
            severity: 'low',
            identified_date: '2024-10-20',
            remediation_plan: 'Professional repointing scheduled Q3 2025',
            estimated_cost: 3200,
            funding_source: 'service_charge',
            completed: false,
          },
        ],
      },
    });

    // ============ OUT OF HOURS SERVICE ============
    const oohService = await base44.entities.OutOfHoursService.create({
      company_id: company.id,
      service_name: 'RBM Premium 24/7 Support',
      service_tier: 'premium',
      is_active: true,
      start_date: '2024-01-01',
      monthly_cost: 450,
      call_handling_options: [
        'log_and_email',
        'maintenance_order_creation',
        'contractor_dispatch',
        'emergency_response',
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
        {
          contractor_name: 'Emergency Plumbing 24/7',
          specialties: ['plumbing', 'drainage'],
          availability: '24/7',
        },
      ],
      escalation_contact: {
        name: 'Nigel Brown',
        phone: '01204 695919',
        email: 'nigel@rbm-nw.co.uk',
      },
    });

    // ============ OUT OF HOURS CALLS ============
    const oohCalls = await base44.entities.OutOfHoursCall.bulkCreate([
      {
        call_date_time: '2025-03-20T23:45:00Z',
        caller_name: 'Emma Williams',
        caller_phone: '07700 987654',
        caller_email: 'emma@email.com',
        caller_type: 'tenant',
        property_postcode: 'M3 3TP',
        property_address: '152 Deansgate, Manchester',
        matched_property_id: properties[0].id,
        matched_tenant_id: tenants[2].id,
        matched_company_id: company.id,
        call_type: 'heating_failure',
        call_description: 'Heating stopped working, very cold in flat',
        severity: 'high',
        validation_status: 'validated',
        gdpr_consent_recorded: true,
        action_taken: 'contractor_dispatched',
        action_details: 'SafeGuard contacted, arrival estimated 1 hour',
        handler_name: 'Sarah - Night Shift',
        duration_minutes: 8,
        notes: 'Caller very distressed, assured quick response',
      },
      {
        call_date_time: '2025-03-18T03:15:00Z',
        caller_name: 'Michael Chen',
        caller_phone: '07700 555666',
        caller_email: 'michael@email.com',
        caller_type: 'tenant',
        property_postcode: 'WA15 8EW',
        property_address: '48 Ashton Road, Cheshire',
        matched_property_id: properties[1].id,
        matched_tenant_id: tenants[1].id,
        matched_company_id: company.id,
        call_type: 'water_leak',
        call_description: 'Water leaking through ceiling from flat above',
        severity: 'critical',
        validation_status: 'validated',
        gdpr_consent_recorded: true,
        action_taken: 'contractor_dispatched',
        action_details: 'Emergency plumber & property manager both contacted',
        handler_name: 'James - Night Shift',
        duration_minutes: 12,
        notes: 'Significant damage risk - multiple contractors arranged',
      },
    ]);

    // ============ INVOICES ============
    const invoices = await base44.entities.Invoice.bulkCreate([
      {
        service_id: oohService.id,
        company_id: company.id,
        invoice_number: 'INV-OOH-2025-001',
        billing_period_start: '2025-01-01',
        billing_period_end: '2025-01-31',
        service_tier: 'premium',
        amount: 450,
        status: 'paid',
        issue_date: '2025-01-05',
        due_date: '2025-01-31',
        paid_date: '2025-01-28',
        payment_method: 'bank_transfer',
        payment_status: 'succeeded',
      },
      {
        service_id: oohService.id,
        company_id: company.id,
        invoice_number: 'INV-OOH-2025-002',
        billing_period_start: '2025-02-01',
        billing_period_end: '2025-02-28',
        service_tier: 'premium',
        amount: 450,
        status: 'sent',
        issue_date: '2025-02-05',
        due_date: '2025-02-28',
        paid_date: '2025-02-27',
        payment_method: 'bank_transfer',
        payment_status: 'succeeded',
      },
      {
        service_id: oohService.id,
        company_id: company.id,
        invoice_number: 'INV-OOH-2025-003',
        billing_period_start: '2025-03-01',
        billing_period_end: '2025-03-31',
        service_tier: 'premium',
        amount: 450,
        status: 'issued',
        issue_date: '2025-03-05',
        due_date: '2025-03-31',
        payment_method: 'bank_transfer',
        payment_status: 'pending',
      },
    ]);

    // ============ CONTACTS ============
    const contacts = await base44.entities.Contact.bulkCreate([
      {
        name: 'SafeGuard Fire Services',
        contact_type: 'contractor',
        phone: '0161 234 5678',
        email: 'info@safeguardfire.com',
        specialties: ['fire_safety', 'emergency'],
        availability: '24/7',
      },
      {
        name: 'Heating Solutions Ltd',
        contact_type: 'contractor',
        phone: '0161 555 9999',
        email: 'support@heatingsolutions.com',
        specialties: ['plumbing', 'heating', 'gas'],
        availability: '24/7',
      },
      {
        name: 'Emergency Plumbing 24/7',
        contact_type: 'contractor',
        phone: '0161 888 7777',
        email: 'emergency@plumbing24.com',
        specialties: ['plumbing', 'drainage', 'water'],
        availability: '24/7',
      },
      {
        name: 'Lift Tech Services',
        contact_type: 'contractor',
        phone: '0141 333 2222',
        email: 'bookings@lifttech.com',
        specialties: ['lift', 'safety'],
        availability: 'weekdays',
      },
    ]);

    // ============ COMPLIANCE & AUDIT ============
    const complianceAuditLog = await base44.entities.ComplianceAuditLog.bulkCreate([
      {
        property_id: properties[0].id,
        audit_type: 'fire_safety',
        audit_date: '2025-03-15',
        findings: 'All emergency exits clear and properly marked. Fire alarms tested and functional.',
        status: 'compliant',
        notes: 'Annual fire safety audit passed. Next due March 2026.',
      },
      {
        property_id: properties[0].id,
        audit_type: 'gas_safety',
        audit_date: '2025-02-01',
        findings: 'Gas safety certificate CP12 issued. All appliances safe.',
        status: 'compliant',
        notes: 'Annual gas safety check completed. Valid until Feb 2026.',
      },
      {
        property_id: properties[1].id,
        audit_type: 'gas_safety',
        audit_date: '2024-11-20',
        findings: 'Overdue - Certificate expires Nov 2025. Schedule renewal.',
        status: 'non_compliant',
        notes: 'WARNING: Gas safety certificate expiring soon. Book renewal immediately.',
      },
    ]);

    // ============ DOCUMENT TEMPLATES ============
    const templates = await base44.entities.DocumentTemplate.bulkCreate([
      {
        name: 'AST - Assured Shorthold Tenancy',
        description: 'Standard assured shorthold tenancy agreement',
        template_type: 'tenancy_agreement',
        file_url: 'https://example.com/templates/ast-agreement.docx',
        merge_fields: ['tenant_name', 'property_address', 'rent_amount', 'start_date', 'deposit_amount'],
        company_id: company.id,
      },
      {
        name: 'Section 21 Notice',
        description: 'No-fault eviction notice to end tenancy',
        template_type: 'eviction_notice',
        file_url: 'https://example.com/templates/section21-notice.docx',
        merge_fields: ['tenant_name', 'property_address', 'notice_date', 'end_date'],
        company_id: company.id,
      },
      {
        name: 'Service Charge Statement',
        description: 'Annual service charge account and statement',
        template_type: 'service_charge_statement',
        file_url: 'https://example.com/templates/service-charge-statement.docx',
        merge_fields: ['property_name', 'year', 'total_cost', 'breakdown', 'per_unit_charge'],
        company_id: company.id,
      },
    ]);

    // Update user
    await base44.auth.updateMe({
      current_demo_company_id: company.id,
      business_name: 'RBM (North West) Limited',
    });

    // Prepare summary
    const summary = {
      success: true,
      message: 'Complete RBM Demo Data Populated',
      statistics: {
        companies: 1,
        properties: properties.length,
        units: createdUnits.length,
        tenants: tenants.length,
        serviceCharges: serviceCharges.length,
        groundRents: groundRents.length,
        financialTransactions: transactions.length,
        maintenanceOrders: maintenanceOrders.length,
        emergencyCallouts: emergencyCallouts.length,
        safetyNosNumbers: certificates.length,
        outOfHoursCalls: oohCalls.length,
        invoices: invoices.length,
        contacts: contacts.length,
        complianceAudits: complianceAuditLog.length,
        documentTemplates: templates.length,
      },
      moduleCoverage: {
        '✅ Dashboard': 'Portfolio overview, KPIs, compliance status',
        '✅ Companies': 'RBM (North West) Limited configured',
        '✅ Properties': '4 properties across North West England',
        '✅ Units': '102 units across all properties',
        '✅ Tenants': '15 tenants with varied profiles',
        '✅ Financials': 'Rent, service charges, ground rent tracking',
        '✅ Maintenance': '5 maintenance orders at various stages',
        '✅ Emergency Callouts': '2 real-world scenarios (heating, water leak)',
        '✅ Compliance': 'Fire, Gas, Electrical certificates with alerts',
        '✅ Building Safety': 'Building classification & defect register',
        '✅ Out-of-Hours': 'Service tier, contractor network, emergency calls',
        '✅ Invoicing': '3 months of service invoices',
        '✅ Contacts': 'Emergency contractors and service providers',
        '✅ Documents': 'AST, Section 21, Service Charge templates',
        '✅ CRM': 'Call logs with full contextual data',
      },
    };

    return Response.json(summary);
  } catch (error) {
    console.error('Error populating demo data:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});