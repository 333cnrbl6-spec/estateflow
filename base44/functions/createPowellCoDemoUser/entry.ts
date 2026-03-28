import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Create demo user for Powell & Co
    const demoUser = await base44.users.inviteUser('demo@powellandcoproperty.com', 'user');

    // Create Companies (Powell & Co group)
    const companies = await base44.entities.Company.bulkCreate([
      {
        name: 'Powell & Co Property (Brighton) Limited',
        company_number: '05826387',
        status: 'active',
        category: 'core_property',
        registered_address: '324 Queens Road, Brighton, BN1 3WB',
        incorporation_date: '1997-03-07',
        sic_code: '68320',
        sic_description: 'Renting and operating of real estate property',
        directors: [
          {
            name: 'Sean Powell',
            role: 'Director',
            appointed_date: '2001-06-18',
            resigned_date: null
          },
          {
            name: 'Tania Powell',
            role: 'Director',
            appointed_date: '2002-01-16',
            resigned_date: null
          }
        ],
        accounts_next_due: '2027-03-07',
        accounts_last_made_up: '2026-03-07',
        confirmation_next_due: '2027-03-07',
        confirmation_last_dated: '2026-03-07',
        region: 'brighton',
        notes: 'Established private landlord and property investor founded in 1994. Portfolio of residential properties across England and Wales.'
      },
      {
        name: 'Powell & Co Property Freeholds Limited',
        company_number: '10764568',
        status: 'active',
        category: 'freehold',
        registered_address: 'PO Box 79039, Cumberland Basin, Prince Albert Road, London, NW1 7SS',
        incorporation_date: '2017-04-20',
        sic_code: '68100',
        sic_description: 'Buying, selling and renting of own or leased real estate',
        directors: [
          {
            name: 'Sean Powell',
            role: 'Director',
            appointed_date: '2017-04-20',
            resigned_date: null
          }
        ],
        accounts_next_due: '2027-04-20',
        accounts_last_made_up: '2026-04-20',
        confirmation_next_due: '2027-04-20',
        confirmation_last_dated: '2026-04-20',
        region: 'london',
        notes: 'Freehold property holding company for Powell & Co group portfolio.'
      },
      {
        name: 'Powell & Co Property (London) Ltd',
        company_number: '09976213',
        status: 'active',
        category: 'management',
        registered_address: 'PO Box 79039, Cumberland Basin, Prince Albert Road, London, NW1 7SS',
        incorporation_date: '2015-10-23',
        sic_code: '68320',
        sic_description: 'Renting and operating of real estate property',
        directors: [
          {
            name: 'Sean Powell',
            role: 'Director',
            appointed_date: '2015-10-23',
            resigned_date: null
          }
        ],
        accounts_next_due: '2027-10-23',
        accounts_last_made_up: '2026-10-23',
        confirmation_next_due: '2027-10-23',
        confirmation_last_dated: '2026-10-23',
        region: 'london',
        notes: 'London-based property management company. Head office at Cumberland Basin with operations across England and Wales.'
      }
    ]);

    // Create Properties (Powell & Co portfolio across England and Wales)
    const properties = await base44.entities.Property.bulkCreate([
      {
        name: 'Brighton Seafront Apartments',
        address_line_1: '324 Queens Road',
        address_line_2: 'Brighton',
        city: 'Brighton',
        postcode: 'BN1 3WB',
        region: 'brighton',
        property_type: 'leasehold_block',
        ownership_type: 'leasehold',
        owning_company: companies[0].id,
        management_company: companies[0].id,
        total_units: 28,
        year_built: 1995,
        listed_building: false,
        notes: 'Premium seafront apartments. Strong rental demand. Company headquarters location.'
      },
      {
        name: 'London West Block Portfolio',
        address_line_1: '325 Latimer Road',
        address_line_2: 'West London',
        city: 'London',
        postcode: 'W10 6RA',
        region: 'london',
        property_type: 'leasehold_block',
        ownership_type: 'leasehold',
        owning_company: companies[2].id,
        management_company: companies[2].id,
        total_units: 22,
        year_built: 2000,
        listed_building: false,
        notes: 'Multi-unit leasehold block. Experienced management with strong landlord relations.'
      },
      {
        name: 'Freehold Mixed Use Portfolio',
        address_line_1: 'Cumberland Basin, Prince Albert Road',
        city: 'London',
        postcode: 'NW1 7SS',
        region: 'london',
        property_type: 'mixed_use',
        ownership_type: 'freehold',
        owning_company: companies[1].id,
        management_company: companies[2].id,
        total_units: 16,
        year_built: 2008,
        listed_building: false,
        notes: 'Freehold mixed-use development. Managed portfolio across residential and commercial leases.'
      },
      {
        name: 'South Coast Investment Property',
        address_line_1: '45 Marine Parade',
        city: 'Brighton',
        postcode: 'BN2 1AE',
        region: 'brighton',
        property_type: 'converted_building',
        ownership_type: 'freehold',
        owning_company: companies[1].id,
        management_company: companies[0].id,
        total_units: 12,
        year_built: 2006,
        listed_building: false,
        notes: 'Recently refurbished converted property. High-yield rental investment.'
      },
      {
        name: 'Wales Portfolio Block',
        address_line_1: '120 Cathays Park',
        city: 'Cardiff',
        postcode: 'CF10 3NQ',
        region: 'other',
        property_type: 'leasehold_block',
        ownership_type: 'leasehold',
        owning_company: companies[0].id,
        management_company: companies[0].id,
        total_units: 20,
        year_built: 1999,
        listed_building: false,
        notes: 'Wales portfolio expansion. Well-managed tenant base in Cardiff.'
      }
    ]);

    // Create Units
    const units = await base44.entities.Unit.bulkCreate([
      // Park Royal Apartments
      {
        unit_reference: 'Flat 101',
        property_id: properties[0].id,
        floor: 'First',
        bedrooms: 2,
        unit_type: 'flat',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 2500,
        annual_service_charge: 3000,
        lease_start_date: '2023-01-15',
        lease_end_date: '2033-01-14',
        lease_term_years: 10,
        lease_remaining_years: 7
      },
      {
        unit_reference: 'Flat 102',
        property_id: properties[0].id,
        floor: 'First',
        bedrooms: 3,
        unit_type: 'flat',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 3200,
        annual_service_charge: 3000,
        lease_start_date: '2022-06-01',
        lease_end_date: '2032-05-31',
        lease_term_years: 10,
        lease_remaining_years: 6
      },
      // Chelsea Mews Houses
      {
        unit_reference: 'House 1',
        property_id: properties[1].id,
        floor: 'All',
        bedrooms: 4,
        unit_type: 'house',
        tenure: 'freehold',
        status: 'occupied',
        monthly_rent: 4500,
        lease_start_date: '2023-09-01',
        lease_end_date: '2026-08-31',
        lease_term_years: 3,
        lease_remaining_years: 0
      },
      // Belgravia Plaza Residences
      {
        unit_reference: 'Apt 201',
        property_id: properties[2].id,
        floor: 'Second',
        bedrooms: 2,
        unit_type: 'apartment',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 3800,
        annual_service_charge: 4500,
        lease_start_date: '2024-03-01',
        lease_end_date: '2034-02-28',
        lease_term_years: 10,
        lease_remaining_years: 8
      },
      {
        unit_reference: 'Shop 01',
        property_id: properties[2].id,
        floor: 'Ground',
        bedrooms: 0,
        unit_type: 'commercial',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 2500,
        annual_service_charge: 1500,
        lease_start_date: '2023-05-01',
        lease_end_date: '2033-04-30',
        lease_term_years: 10,
        lease_remaining_years: 7
      },
      // South Kensington Studios
      {
        unit_reference: 'Studio 5',
        property_id: properties[3].id,
        floor: 'Ground',
        bedrooms: 0,
        unit_type: 'studio',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 1800,
        annual_service_charge: 1200,
        lease_start_date: '2024-01-15',
        lease_end_date: '2034-01-14',
        lease_term_years: 10,
        lease_remaining_years: 8
      },
      {
        unit_reference: 'Studio 6',
        property_id: properties[3].id,
        floor: 'Ground',
        bedrooms: 0,
        unit_type: 'studio',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 1800,
        annual_service_charge: 1200,
        lease_start_date: '2023-11-01',
        lease_end_date: '2033-10-31',
        lease_term_years: 10,
        lease_remaining_years: 7
      },
      // Westminster Court
      {
        unit_reference: 'Apt 1501',
        property_id: properties[4].id,
        floor: 'Fifteenth',
        bedrooms: 3,
        unit_type: 'apartment',
        tenure: 'leasehold',
        status: 'occupied',
        monthly_rent: 5000,
        annual_service_charge: 6000,
        lease_start_date: '2023-07-01',
        lease_end_date: '2033-06-30',
        lease_term_years: 10,
        lease_remaining_years: 7
      }
    ]);

    // Create Tenants
    const tenants = await base44.entities.Tenant.bulkCreate([
      {
        full_name: 'Christopher Martin-Smith',
        email: 'chris.martin@finance.uk',
        phone: '020 7946 0958',
        tenant_type: 'assured_shorthold',
        unit_id: units[0].id,
        property_id: properties[0].id,
        tenancy_start_date: '2023-01-15',
        tenancy_end_date: '2026-01-14',
        deposit_amount: 5000,
        deposit_scheme: 'dps',
        status: 'active',
        emergency_contact_name: 'Eleanor Martin-Smith',
        emergency_contact_phone: '020 7946 0959'
      },
      {
        full_name: 'Dr. and Mrs. Williamson',
        email: 'williamson@medical.co.uk',
        phone: '020 7589 2341',
        tenant_type: 'assured_shorthold',
        unit_id: units[1].id,
        property_id: properties[0].id,
        tenancy_start_date: '2022-06-01',
        tenancy_end_date: '2025-05-31',
        deposit_amount: 6400,
        deposit_scheme: 'mydeposits',
        status: 'active',
        emergency_contact_name: 'James Williamson Jr.',
        emergency_contact_phone: '020 7589 2342'
      },
      {
        full_name: 'Sir Anthony Richardson',
        email: 'arichardson@heritage.org.uk',
        phone: '020 7235 8765',
        tenant_type: 'assured_shorthold',
        unit_id: units[2].id,
        property_id: properties[1].id,
        tenancy_start_date: '2023-09-01',
        tenancy_end_date: '2026-08-31',
        deposit_amount: 9000,
        deposit_scheme: 'tds',
        status: 'active',
        emergency_contact_name: 'Catherine Richardson',
        emergency_contact_phone: '020 7235 8766'
      },
      {
        full_name: 'Victoria Chen',
        email: 'vchen@global-tech.com',
        phone: '020 7589 5432',
        tenant_type: 'assured_shorthold',
        unit_id: units[3].id,
        property_id: properties[2].id,
        tenancy_start_date: '2024-03-01',
        tenancy_end_date: '2027-02-28',
        deposit_amount: 7600,
        deposit_scheme: 'dps',
        status: 'active',
        emergency_contact_name: 'Wei Chen',
        emergency_contact_phone: '020 7589 5433'
      },
      {
        full_name: 'Isabella & Marco Rossi',
        email: 'irossi@belgravia-retail.co.uk',
        phone: '020 7589 6543',
        tenant_type: 'assured_shorthold',
        unit_id: units[4].id,
        property_id: properties[2].id,
        tenancy_start_date: '2023-05-01',
        tenancy_end_date: '2026-04-30',
        deposit_amount: 5000,
        deposit_scheme: 'mydeposits',
        status: 'active',
        emergency_contact_name: 'Antonio Rossi',
        emergency_contact_phone: '020 7589 6544'
      },
      {
        full_name: 'James & Sophie Anderson',
        email: 'janderson@kensington-living.com',
        phone: '020 7589 7654',
        tenant_type: 'assured_shorthold',
        unit_id: units[5].id,
        property_id: properties[3].id,
        tenancy_start_date: '2024-01-15',
        tenancy_end_date: '2027-01-14',
        deposit_amount: 3600,
        deposit_scheme: 'tds',
        status: 'active',
        emergency_contact_name: 'Robert Anderson',
        emergency_contact_phone: '020 7589 7655'
      },
      {
        full_name: 'Natasha Volkov',
        email: 'nvolkov@international-finance.ru',
        phone: '020 7589 8765',
        tenant_type: 'assured_shorthold',
        unit_id: units[6].id,
        property_id: properties[3].id,
        tenancy_start_date: '2023-11-01',
        tenancy_end_date: '2026-10-31',
        deposit_amount: 3600,
        deposit_scheme: 'dps',
        status: 'active',
        emergency_contact_name: 'Dimitri Volkov',
        emergency_contact_phone: '020 7589 8766'
      },
      {
        full_name: 'Lord and Lady Pemberton',
        email: 'pemberton@aristocratic-estates.co.uk',
        phone: '020 7235 9876',
        tenant_type: 'assured_shorthold',
        unit_id: units[7].id,
        property_id: properties[4].id,
        tenancy_start_date: '2023-07-01',
        tenancy_end_date: '2026-06-30',
        deposit_amount: 10000,
        deposit_scheme: 'mydeposits',
        status: 'active',
        emergency_contact_name: 'Lady Jane Pemberton',
        emergency_contact_phone: '020 7235 9877'
      }
    ]);

    // Create Financial Transactions
    await base44.entities.FinancialTransaction.bulkCreate([
      {
        description: 'Monthly rent - Park Royal Flat 101',
        transaction_type: 'rent_payment',
        amount: 2500,
        direction: 'income',
        status: 'paid',
        due_date: '2026-03-01',
        paid_date: '2026-03-01',
        property_id: properties[0].id,
        unit_id: units[0].id,
        tenant_id: tenants[0].id,
        reference: 'RENT-PRA-FL101-MAR26'
      },
      {
        description: 'Monthly rent - Chelsea Mews House 1',
        transaction_type: 'rent_payment',
        amount: 4500,
        direction: 'income',
        status: 'paid',
        due_date: '2026-03-01',
        paid_date: '2026-03-01',
        property_id: properties[1].id,
        unit_id: units[2].id,
        tenant_id: tenants[2].id,
        reference: 'RENT-CMH-HOU1-MAR26'
      },
      {
        description: 'Service charge - Park Royal Apartments',
        transaction_type: 'service_charge',
        amount: 3000,
        direction: 'income',
        status: 'paid',
        due_date: '2026-03-15',
        paid_date: '2026-03-15',
        property_id: properties[0].id,
        reference: 'SC-PRA-MAR26'
      },
      {
        description: 'Professional cleaning service - All properties',
        transaction_type: 'maintenance_cost',
        amount: 1500,
        direction: 'expense',
        status: 'paid',
        paid_date: '2026-03-05',
        reference: 'MAINT-CLEAN-MAR26'
      },
      {
        description: 'Management fee - March 2026',
        transaction_type: 'management_fee',
        amount: 5000,
        direction: 'expense',
        status: 'paid',
        paid_date: '2026-03-01',
        reference: 'MGMT-FEE-MAR26'
      },
      {
        description: 'Insurance premium - Annual',
        transaction_type: 'other',
        amount: 8500,
        direction: 'expense',
        status: 'paid',
        paid_date: '2026-03-10',
        reference: 'INS-ANNUAL-2026'
      }
    ]);

    // Create Maintenance Orders
    await base44.entities.MaintenanceOrder.bulkCreate([
      {
        title: 'Electrical safety inspection - Westminster Court',
        description: 'EICR electrical inspection for common areas',
        property_id: properties[4].id,
        reported_by: 'James Powell',
        priority: 'urgent',
        status: 'completed',
        category: 'electrical',
        contractor_name: 'London Certified Electricians',
        contractor_phone: '020 7946 0888',
        estimated_cost: 800,
        actual_cost: 850,
        scheduled_date: '2026-03-15',
        completed_date: '2026-03-18',
        notes: 'EICR completed. All common areas compliant. Certificate valid 5 years.'
      },
      {
        title: 'Boiler servicing - Park Royal Apartments',
        description: 'Annual boiler maintenance and safety certification',
        property_id: properties[0].id,
        reported_by: 'Margaret Powell',
        priority: 'standard',
        status: 'completed',
        category: 'plumbing',
        contractor_name: 'London Heating Solutions',
        contractor_phone: '020 7946 0777',
        estimated_cost: 2000,
        actual_cost: 2000,
        scheduled_date: '2026-03-10',
        completed_date: '2026-03-10',
        notes: 'All boilers serviced. CP12 certificates issued for all units.'
      },
      {
        title: 'Roof repairs - Chelsea Mews',
        description: 'Slate roof repairs and maintenance',
        property_id: properties[1].id,
        reported_by: 'Tenant - Sir Anthony Richardson',
        priority: 'urgent',
        status: 'in_progress',
        category: 'roofing',
        contractor_name: 'Grade II Listed Specialist Roofers',
        contractor_phone: '020 7946 0666',
        estimated_cost: 5500,
        scheduled_date: '2026-04-01',
        notes: 'Specialist Grade II roofer required. Using traditional materials and methods.'
      },
      {
        title: 'Decoration refresh - South Kensington Studios',
        description: 'Interior redecoration between tenancies',
        property_id: properties[3].id,
        reported_by: 'James Powell',
        priority: 'standard',
        status: 'completed',
        category: 'decorating',
        contractor_name: 'London Interiors & Design',
        contractor_phone: '020 7946 0555',
        estimated_cost: 3200,
        actual_cost: 3200,
        scheduled_date: '2026-02-15',
        completed_date: '2026-02-28',
        notes: 'High-spec interior refresh. Ready for next tenancy.'
      }
    ]);

    // Create Contacts
    await base44.entities.Contact.bulkCreate([
      {
        full_name: 'Sean Powell',
        email: 'sean@powellandcoproperty.com',
        phone: '020 7262 3885',
        contact_type: 'director',
        company_name: 'Powell & Co Property (Brighton) Limited',
        address: '324 Queens Road, Brighton, BN1 3WB',
        notes: 'Director of Powell & Co Group. Appointed 2001. Extensive experience in property investment and management.'
      },
      {
        full_name: 'Tania Powell',
        email: 'tania@powellandcoproperty.com',
        phone: '020 7262 3885',
        contact_type: 'director',
        company_name: 'Powell & Co Property (Brighton) Limited',
        address: '324 Queens Road, Brighton, BN1 3WB',
        notes: 'Director and Company Secretary. Appointed 2002. Manages operations and administration.'
      },
      {
        full_name: 'Brighton Maintenance Services',
        email: 'maintenance@brightonservices.co.uk',
        phone: '01273 555234',
        contact_type: 'contractor',
        company_name: 'Brighton Maintenance Services',
        notes: 'General maintenance, repairs, gas safety certificates'
      },
      {
        full_name: 'South Coast Electrical Solutions',
        email: 'quotes@scelectrical.co.uk',
        phone: '01273 555345',
        contact_type: 'contractor',
        company_name: 'South Coast Electrical Solutions',
        notes: 'EICR inspections, electrical repairs, testing and certification'
      },
      {
        full_name: 'Sussex Property Solicitors',
        email: 'tenancy@sussex-law.co.uk',
        phone: '01273 555456',
        contact_type: 'solicitor',
        company_name: 'Sussex Property Solicitors',
        notes: 'Tenancy agreements, compliance, deposit dispute resolution'
      },
      {
        full_name: 'London Property Accountants',
        email: 'accounts@lpaccountants.co.uk',
        phone: '020 7946 0550',
        contact_type: 'accountant',
        company_name: 'London Property Accountants',
        notes: 'Landlord tax services, accountancy, financial reporting'
      }
    ]);

    return Response.json({
      success: true,
      message: 'Powell & Co demo user created successfully with comprehensive test data',
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