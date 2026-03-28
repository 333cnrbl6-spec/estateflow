import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Create demo user for Regal Rentals
    const demoUser = await base44.users.inviteUser('demo@regalrentals.co.uk', 'user');

    // Update the user with Regal Rentals business data
    await base44.auth.updateMe({
      business_name: 'Regal Rentals & Property Management',
      is_subscribed: true
    });

    // Create Companies (Regal Rentals group)
    const companies = await base44.entities.Company.bulkCreate([
      {
        name: 'Regal Rentals and Property Management Ltd',
        company_number: '12468048',
        status: 'active',
        category: 'management',
        registered_address: '60 Edinburgh Road, Little Lever, Bolton, BL3 1TQ',
        incorporation_date: '2020-02-17',
        sic_code: '68320',
        sic_description: 'Renting and operating of real estate property',
        directors: [
          {
            name: 'Charlotte Angela Sandiford',
            role: 'Director',
            appointed_date: '2020-02-17',
            resigned_date: null
          }
        ],
        accounts_next_due: '2026-11-17',
        accounts_last_made_up: '2025-02-28',
        confirmation_next_due: '2026-02-17',
        confirmation_last_dated: '2025-02-17',
        region: 'bolton',
        notes: 'Independent letting agent and property management company serving Bolton and Greater Manchester. Specializes in full property management, tenant reference checks, and property inspections.'
      },
      {
        name: 'Regal Developments & Rentals Ltd',
        company_number: '12380751',
        status: 'active',
        category: 'investment',
        registered_address: '60 Edinburgh Road, Little Lever, Bolton, BL3 1TQ',
        incorporation_date: '2019-12-30',
        sic_code: '68100',
        sic_description: 'Buying, selling and renting of own or leased real estate',
        directors: [
          {
            name: 'Paul Sandiford',
            role: 'Director',
            appointed_date: '2019-12-30',
            resigned_date: null
          }
        ],
        accounts_next_due: '2026-12-30',
        accounts_last_made_up: '2025-12-31',
        confirmation_next_due: '2026-12-30',
        confirmation_last_dated: '2025-12-30',
        region: 'bolton',
        notes: 'Investment and property development company associated with Regal Rentals group.'
      }
    ]);

    // Create Properties managed by Regal Rentals
    const properties = await base44.entities.Property.bulkCreate([
      {
        name: 'Moss Lane Portfolio',
        address_line_1: '42 Moss Lane',
        address_line_2: 'Bolton',
        city: 'Bolton',
        postcode: 'BL1 4QG',
        region: 'bolton',
        property_type: 'leasehold_block',
        ownership_type: 'leasehold',
        owning_company: companies[0].id,
        management_company: companies[0].id,
        total_units: 12,
        year_built: 1995,
        listed_building: false,
        notes: 'Well-maintained leasehold block in central Bolton. Strong tenant base with low turnover.'
      },
      {
        name: 'Little Lever Flats',
        address_line_1: '78-82 High Street',
        address_line_2: 'Little Lever',
        city: 'Bolton',
        postcode: 'BL3 1PD',
        region: 'bolton',
        property_type: 'leasehold_block',
        ownership_type: 'leasehold',
        owning_company: companies[0].id,
        management_company: companies[0].id,
        total_units: 8,
        year_built: 1998,
        listed_building: false,
        notes: 'Converted Victorian building with 8 residential units. Professional management and maintenance.'
      },
      {
        name: 'Farnworth Terraced Houses',
        address_line_1: '15-27 Park Avenue',
        address_line_2: 'Farnworth',
        city: 'Bolton',
        postcode: 'BL4 7RJ',
        region: 'bolton',
        property_type: 'freehold_block',
        ownership_type: 'freehold',
        owning_company: companies[1].id,
        management_company: companies[0].id,
        total_units: 6,
        year_built: 1975,
        listed_building: false,
        notes: 'Portfolio of 6 freehold terraced houses. Strong rental demand in this area.'
      },
      {
        name: 'Smithills Luxury Apartments',
        address_line_1: '50 Smithills Drive',
        address_line_2: 'Bolton',
        city: 'Bolton',
        postcode: 'BL1 7DP',
        region: 'bolton',
        property_type: 'leasehold_block',
        ownership_type: 'leasehold',
        owning_company: companies[0].id,
        management_company: companies[0].id,
        total_units: 14,
        year_built: 2005,
        listed_building: false,
        notes: 'Modern apartment complex in desirable Smithills area. Premium rental rates.'
      },
      {
        name: 'Eagley Studio Conversions',
        address_line_1: '120 Eagley Road',
        address_line_2: 'Bolton',
        city: 'Bolton',
        postcode: 'BL1 8AL',
        region: 'bolton',
        property_type: 'converted_building',
        ownership_type: 'leasehold',
        owning_company: companies[0].id,
        management_company: companies[0].id,
        total_units: 10,
        year_built: 2008,
        listed_building: false,
        notes: 'Purpose-converted studio apartments. High occupancy rate.'
      }
    ]);

    // Create Units across properties
    const units = await base44.entities.Unit.bulkCreate([
      // Moss Lane Portfolio units
      {
        unit_reference: 'Flat 1',
        property_id: properties[0].id,
        floor: 'Ground',
        bedrooms: 1,
        unit_type: 'flat',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 550,
        annual_service_charge: 1200,
        lease_start_date: '2023-06-01',
        lease_end_date: '2033-05-31',
        lease_term_years: 10,
        lease_remaining_years: 7
      },
      {
        unit_reference: 'Flat 2',
        property_id: properties[0].id,
        floor: 'Ground',
        bedrooms: 2,
        unit_type: 'flat',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 720,
        annual_service_charge: 1200,
        lease_start_date: '2024-01-15',
        lease_end_date: '2034-01-14',
        lease_term_years: 10,
        lease_remaining_years: 8
      },
      // Little Lever Flats units
      {
        unit_reference: 'Flat 1A',
        property_id: properties[1].id,
        floor: 'First',
        bedrooms: 2,
        unit_type: 'flat',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 650,
        annual_service_charge: 1000,
        lease_start_date: '2023-09-01',
        lease_end_date: '2033-08-31',
        lease_term_years: 10,
        lease_remaining_years: 7
      },
      // Farnworth Terraced Houses
      {
        unit_reference: 'House 15',
        property_id: properties[2].id,
        floor: 'All Floors',
        bedrooms: 3,
        unit_type: 'house',
        tenure: 'freehold',
        status: 'occupied',
        monthly_rent: 850,
        lease_start_date: '2023-03-01',
        lease_end_date: '2026-02-28',
        lease_term_years: 3,
        lease_remaining_years: 0
      },
      // Smithills Luxury Apartments
      {
        unit_reference: 'Apt 201',
        property_id: properties[3].id,
        floor: 'Second',
        bedrooms: 2,
        unit_type: 'apartment',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 950,
        annual_service_charge: 1500,
        lease_start_date: '2024-04-01',
        lease_end_date: '2034-03-31',
        lease_term_years: 10,
        lease_remaining_years: 8
      },
      // Eagley Studio Conversions
      {
        unit_reference: 'Studio 5',
        property_id: properties[4].id,
        floor: 'Ground',
        bedrooms: 0,
        unit_type: 'studio',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 480,
        annual_service_charge: 800,
        lease_start_date: '2024-02-01',
        lease_end_date: '2034-01-31',
        lease_term_years: 10,
        lease_remaining_years: 8
      }
    ]);

    // Create Tenants
    const tenants = await base44.entities.Tenant.bulkCreate([
      {
        full_name: 'James Mitchell',
        email: 'james.mitchell@example.com',
        phone: '07700 900123',
        tenant_type: 'assured_shorthold',
        unit_id: units[0].id,
        property_id: properties[0].id,
        tenancy_start_date: '2023-06-01',
        tenancy_end_date: '2026-05-31',
        deposit_amount: 1100,
        deposit_scheme: 'dps',
        status: 'active',
        emergency_contact_name: 'Sarah Mitchell',
        emergency_contact_phone: '07700 900124'
      },
      {
        full_name: 'Emily Thompson & David Thompson',
        email: 'emily.thompson@example.com',
        phone: '07700 900234',
        tenant_type: 'assured_shorthold',
        unit_id: units[1].id,
        property_id: properties[0].id,
        tenancy_start_date: '2024-01-15',
        tenancy_end_date: '2027-01-14',
        deposit_amount: 1440,
        deposit_scheme: 'mydeposits',
        status: 'active',
        emergency_contact_name: 'Robert Thompson',
        emergency_contact_phone: '07700 900235'
      },
      {
        full_name: 'Priya Patel',
        email: 'priya.patel@example.com',
        phone: '07700 900345',
        tenant_type: 'assured_shorthold',
        unit_id: units[2].id,
        property_id: properties[1].id,
        tenancy_start_date: '2023-09-01',
        tenancy_end_date: '2026-08-31',
        deposit_amount: 1300,
        deposit_scheme: 'tds',
        status: 'active',
        emergency_contact_name: 'Rajesh Patel',
        emergency_contact_phone: '07700 900346'
      },
      {
        full_name: 'Michael Johnson',
        email: 'michael.johnson@example.com',
        phone: '07700 900456',
        tenant_type: 'assured_shorthold',
        unit_id: units[3].id,
        property_id: properties[2].id,
        tenancy_start_date: '2023-03-01',
        tenancy_end_date: '2026-02-28',
        deposit_amount: 1700,
        deposit_scheme: 'dps',
        status: 'active',
        emergency_contact_name: 'Margaret Johnson',
        emergency_contact_phone: '07700 900457'
      },
      {
        full_name: 'Sophie Roberts',
        email: 'sophie.roberts@example.com',
        phone: '07700 900567',
        tenant_type: 'assured_shorthold',
        unit_id: units[4].id,
        property_id: properties[3].id,
        tenancy_start_date: '2024-04-01',
        tenancy_end_date: '2027-03-31',
        deposit_amount: 1900,
        deposit_scheme: 'mydeposits',
        status: 'active',
        emergency_contact_name: 'Thomas Roberts',
        emergency_contact_phone: '07700 900568'
      },
      {
        full_name: 'Alex Chen',
        email: 'alex.chen@example.com',
        phone: '07700 900678',
        tenant_type: 'assured_shorthold',
        unit_id: units[5].id,
        property_id: properties[4].id,
        tenancy_start_date: '2024-02-01',
        tenancy_end_date: '2027-01-31',
        deposit_amount: 960,
        deposit_scheme: 'tds',
        status: 'active',
        emergency_contact_name: 'Wei Chen',
        emergency_contact_phone: '07700 900679'
      }
    ]);

    // Create Financial Transactions
    await base44.entities.FinancialTransaction.bulkCreate([
      {
        description: 'Monthly rent collection - Moss Lane Flat 1',
        transaction_type: 'rent_payment',
        amount: 550,
        direction: 'income',
        status: 'paid',
        due_date: '2026-03-01',
        paid_date: '2026-03-01',
        property_id: properties[0].id,
        unit_id: units[0].id,
        tenant_id: tenants[0].id,
        reference: 'RENT-ML-FL01-MAR26'
      },
      {
        description: 'Service charge collection - Moss Lane',
        transaction_type: 'service_charge',
        amount: 100,
        direction: 'income',
        status: 'paid',
        due_date: '2026-03-15',
        paid_date: '2026-03-15',
        property_id: properties[0].id,
        reference: 'SC-ML-MAR26'
      },
      {
        description: 'Monthly rent collection - Smithills Luxury Apt 201',
        transaction_type: 'rent_payment',
        amount: 950,
        direction: 'income',
        status: 'paid',
        due_date: '2026-03-01',
        paid_date: '2026-03-01',
        property_id: properties[3].id,
        unit_id: units[4].id,
        tenant_id: tenants[4].id,
        reference: 'RENT-SL-APT201-MAR26'
      },
      {
        description: 'Plumbing repairs - Eagley Studios',
        transaction_type: 'maintenance_cost',
        amount: 450,
        direction: 'expense',
        status: 'paid',
        paid_date: '2026-03-20',
        property_id: properties[4].id,
        reference: 'MAINT-ES-PLUMB-MAR26'
      },
      {
        description: 'Property management fee - March 2026',
        transaction_type: 'management_fee',
        amount: 2500,
        direction: 'expense',
        status: 'paid',
        paid_date: '2026-03-01',
        reference: 'MGMT-FEE-MAR26'
      }
    ]);

    // Create Maintenance Orders
    await base44.entities.MaintenanceOrder.bulkCreate([
      {
        title: 'Boiler maintenance - Little Lever Flat 1A',
        description: 'Annual boiler service and safety certification',
        property_id: properties[1].id,
        unit_id: units[2].id,
        reported_by: 'Charlotte Sandiford',
        priority: 'standard',
        status: 'completed',
        category: 'plumbing',
        contractor_name: 'Bolton Heating Services',
        contractor_phone: '01204 555234',
        estimated_cost: 150,
        actual_cost: 150,
        scheduled_date: '2026-03-10',
        completed_date: '2026-03-10',
        notes: 'CP12 certificate issued. Valid until March 2027.'
      },
      {
        title: 'Window repairs - Farnworth House 15',
        description: 'Sash window sill repair and repainting',
        property_id: properties[2].id,
        unit_id: units[3].id,
        reported_by: 'Michael Johnson (Tenant)',
        priority: 'standard',
        status: 'approved',
        category: 'decorating',
        contractor_name: 'Bolton Window Repairs Ltd',
        contractor_phone: '01204 555345',
        estimated_cost: 280,
        actual_cost: null,
        scheduled_date: '2026-04-05',
        notes: 'Tenant reported water ingress. Approved for repair.'
      },
      {
        title: 'Electrical inspection - Smithills Apartment 201',
        description: 'EICR electrical installation condition report',
        property_id: properties[3].id,
        unit_id: units[4].id,
        reported_by: 'Charlotte Sandiford',
        priority: 'urgent',
        status: 'in_progress',
        category: 'electrical',
        contractor_name: 'Certified Electricians Bolton',
        contractor_phone: '01204 555456',
        estimated_cost: 200,
        scheduled_date: '2026-04-01',
        notes: 'Routine EICR required for compliance. Conducted every 5 years.'
      }
    ]);

    // Create Contacts
    await base44.entities.Contact.bulkCreate([
      {
        full_name: 'Charlotte Angela Sandiford',
        email: 'charlotte@regalrentals.co.uk',
        phone: '01204 777337',
        contact_type: 'director',
        company_name: 'Regal Rentals and Property Management Ltd',
        address: '60 Edinburgh Road, Little Lever, Bolton, BL3 1TQ',
        notes: 'Director and founder of Regal Rentals. Key point of contact for all landlord and tenant matters.'
      },
      {
        full_name: 'Paul Sandiford',
        email: 'paul@regalrentals.co.uk',
        phone: '01204 777337',
        contact_type: 'director',
        company_name: 'Regal Developments & Rentals Ltd',
        address: '60 Edinburgh Road, Little Lever, Bolton, BL3 1TQ',
        notes: 'Director of investment company. Property acquisition and portfolio development.'
      },
      {
        full_name: 'Bolton Heating Services',
        email: 'info@boltonheating.co.uk',
        phone: '01204 555234',
        contact_type: 'contractor',
        company_name: 'Bolton Heating Services',
        notes: 'Boiler maintenance, gas safety certificates, central heating repairs'
      },
      {
        full_name: 'Certified Electricians Bolton',
        email: 'quotes@certifiedelectriciansbolt.co.uk',
        phone: '01204 555456',
        contact_type: 'contractor',
        company_name: 'Certified Electricians Bolton',
        notes: 'EICR electrical inspections, rewiring, fault finding'
      },
      {
        full_name: 'Bolton Letting Solicitors',
        email: 'lettings@boltonsolictors.co.uk',
        phone: '01204 555567',
        contact_type: 'solicitor',
        company_name: 'Bolton Letting Solicitors',
        notes: 'Legal advice on tenancy agreements, deposit disputes, evictions'
      }
    ]);

    return Response.json({
      success: true,
      message: 'Regal Rentals demo user created successfully',
      data: {
        user: demoUser,
        companies: companies.length,
        properties: properties.length,
        units: units.length,
        tenants: tenants.length
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});