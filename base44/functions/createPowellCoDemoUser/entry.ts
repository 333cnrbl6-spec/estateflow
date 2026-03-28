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

    // Create Companies (All 38 Powell & Co group companies)
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
        directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2001-06-18' }, { name: 'Tania Powell', role: 'Director', appointed_date: '2002-01-16' }],
        accounts_next_due: '2027-03-07',
        accounts_last_made_up: '2026-03-07',
        confirmation_next_due: '2027-03-07',
        confirmation_last_dated: '2026-03-07',
        region: 'brighton'
      },
      { name: 'Powell & Co Property Freeholds Limited', company_number: '10764568', status: 'active', category: 'freehold', registered_address: 'PO Box 79039, Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporation_date: '2017-04-20', sic_code: '68100', sic_description: 'Buying, selling and renting of own or leased real estate', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2017-04-20' }], accounts_next_due: '2027-04-20', accounts_last_made_up: '2026-04-20', confirmation_next_due: '2027-04-20', confirmation_last_dated: '2026-04-20', region: 'london' },
      { name: 'Powell & Co Property (London) Ltd', company_number: '09976213', status: 'active', category: 'management', registered_address: 'PO Box 79039, Cumberland Basin, Prince Albert Road, London, NW1 7SS', incorporation_date: '2015-10-23', sic_code: '68320', sic_description: 'Renting and operating of real estate property', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2015-10-23' }], accounts_next_due: '2027-10-23', accounts_last_made_up: '2026-10-23', confirmation_next_due: '2027-10-23', confirmation_last_dated: '2026-10-23', region: 'london' },
      { name: 'Brighton Property Trading Limited', company_number: '07692699', status: 'active', category: 'investment', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2011-02-18', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2011-02-18' }], region: 'brighton' },
      { name: '4 Quarry Terrace Limited', company_number: '10994060', status: 'active', category: 'investment', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2017-09-11', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2017-09-11' }], region: 'brighton' },
      { name: 'PowellandCo RTM Company Limited', company_number: '08132494', status: 'active', category: 'rtm_management', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2013-03-15', sic_code: '68320', directors: [{ name: 'Tania Powell', role: 'Director', appointed_date: '2013-03-15' }], region: 'london' },
      { name: 'JD Property (Blackpool) Limited', company_number: '05256027', status: 'active', category: 'core_property', registered_address: 'Sean Powell, Ivebury Court, 325 Latimer Road, London, United Kingdom, W10 6RA', incorporation_date: '1996-07-22', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '1996-07-22' }], region: 'blackpool' },
      { name: 'North Avenue Limited', company_number: '10653744', status: 'active', category: 'investment', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2017-01-09', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2017-01-09' }], region: 'london' },
      { name: '24 Charles Road Limited', company_number: '10398602', status: 'active', category: 'investment', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2016-10-03', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2016-10-03' }], region: 'london' },
      { name: 'London Sailors Ltd', company_number: '12852077', status: 'active', category: 'investment', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2020-02-14', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2020-02-14' }], region: 'london' },
      { name: 'Harold Road Ltd', company_number: '13433757', status: 'active', category: 'investment', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2021-04-09', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2021-04-09' }], region: 'london' },
      { name: 'Harehills Land Ltd', company_number: '16496661', status: 'active', category: 'investment', registered_address: 'C/O Coots & Co, Cumberland Basin, Prince Albert Road, London, United Kingdom, NW1 7SS', incorporation_date: '2023-07-21', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2023-07-21' }], region: 'leeds' },
      { name: '11 Rancorn Rd Freehold Ltd', company_number: '13379255', status: 'active', category: 'freehold', registered_address: 'Coots And Co, Cumberland Basin Prince Albert Road, London, NW1 7SS', incorporation_date: '2021-02-01', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2021-02-01' }], region: 'london' },
      { name: '22 Meteor Road Freehold Ltd', company_number: '13075231', status: 'active', category: 'freehold', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2020-09-18', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2020-09-18' }], region: 'london' },
      { name: '105 Courthill Road Freehold Limited', company_number: '13044670', status: 'active', category: 'freehold', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2020-08-07', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2020-08-07' }], region: 'london' },
      { name: 'Admiral Point RTM Company Limited', company_number: '06597661', status: 'active', category: 'rtm_management', registered_address: 'First Floor 195-199, Ansdell Road, Blackpool, Lancashire, United Kingdom, FY1 6PE', incorporation_date: '2008-03-12', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2008-03-12' }], region: 'blackpool' },
      { name: 'Brookshaw Court Management Limited', company_number: '04629390', status: 'strike_off_pending', category: 'rtm_management', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2002-08-20', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2002-08-20' }], region: 'london' },
      { name: 'Broken Banks Management Limited', company_number: '01627345', status: 'active', category: 'rtm_management', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '1985-01-14', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2010-05-03' }], region: 'london' },
      { name: '7 North Avenue RTM Company Limited', company_number: '05708178', status: 'active', category: 'rtm_management', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2005-12-02', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2005-12-02' }], region: 'london' },
      { name: '128 Grosvenor Place RTM Company Limited', company_number: '05853898', status: 'active', category: 'rtm_management', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2006-04-07', sic_code: '68320', directors: [{ name: 'Tania Powell', role: 'Director', appointed_date: '2006-04-07' }], region: 'london' },
      { name: '23 Belgrave Road RTM Company Limited', company_number: '06583386', status: 'active', category: 'rtm_management', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2008-06-13', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2008-06-13' }], region: 'london' },
      { name: 'Majestic Court Management Company Limited', company_number: '01258091', status: 'active', category: 'rtm_management', registered_address: 'Coots And Co Cumberland Basin, Prince Albert Road, London, United Kingdom, NW1 7SS', incorporation_date: '1976-10-29', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2015-06-18' }], region: 'london' },
      { name: 'Enfield Island Village Phase 1 Management & Tenants Association Limited', company_number: '03537063', status: 'active', category: 'rtm_management', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '1998-02-19', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2012-07-20' }], region: 'london' },
      { name: '11 Rancorn Road RTM Company Limited', company_number: '13061798', status: 'active', category: 'rtm_management', registered_address: 'Coots And Co, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2020-07-17', sic_code: '68320', directors: [{ name: 'Tania Powell', role: 'Director', appointed_date: '2020-07-17' }], region: 'london' },
      { name: '46 Surrey Rd RTM Company Limited', company_number: '15496575', status: 'dissolved', category: 'rtm_management', registered_address: 'Flat 5, 7 Cleveland Gardens, Coots And Co, Cumberland Basin, London, United Kingdom, W2 6HA', incorporation_date: '2024-03-08', sic_code: '68320', region: 'london' },
      { name: 'Powell and Co Property (London) Ltd', company_number: '09976213', status: 'active', category: 'core_property', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2015-10-23', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2015-10-23' }], region: 'london' },
      { name: 'Powell & Co Property (Brighton) Limited', company_number: '05826387', status: 'active', category: 'core_property', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '1997-03-07', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2001-06-18' }], region: 'brighton' },
      { name: 'Powell & Co Property Limited', company_number: '05826347', status: 'active', category: 'core_property', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '1997-03-06', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2001-06-18' }], region: 'brighton' },
      { name: 'Powell and Co (Blackpool) Ltd', company_number: '13992328', status: 'active', category: 'core_property', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2021-11-12', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2021-11-12' }], region: 'blackpool' },
      { name: 'Powell and Co Associates Ltd', company_number: '14346745', status: 'active', category: 'core_property', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2022-05-06', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2022-05-06' }, { name: 'Tania Powell', role: 'Director', appointed_date: '2022-05-06' }], region: 'london' },
      { name: 'Powell & Co Assets Limited', company_number: '10833646', status: 'active', category: 'investment', registered_address: 'C/O Coots And Co, Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2017-06-23', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2017-06-23' }], region: 'london' },
      { name: 'Powell & Co Management Limited', company_number: '06030136', status: 'active', category: 'management', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2007-12-14', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2007-12-14' }], region: 'london' },
      { name: 'Powell and Carvalho International Ltd', company_number: '13696161', status: 'active', category: 'international', registered_address: 'Cumberland Basin, Prince Albert Road, London, England, NW1 7SS', incorporation_date: '2021-08-27', sic_code: '68100', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2021-08-27' }], region: 'london' },
      { name: 'Carvalho Concept Limited', company_number: '06173925', status: 'active', category: 'service_charge_vehicle', registered_address: 'Coots And Co, Cumberland Basin, Prince Albert Road, London, United Kingdom, NW1 7SS', incorporation_date: '2007-04-20', sic_code: '68320', directors: [{ name: 'Sean Powell', role: 'Director', appointed_date: '2007-04-20' }], region: 'london' }
    ]);

    // Create Properties (Powell & Co portfolio across England and Wales - major holdings)
    const properties = await base44.entities.Property.bulkCreate([
      { name: 'Brighton Seafront Apartments', address_line_1: '324 Queens Road', city: 'Brighton', postcode: 'BN1 3WB', region: 'brighton', property_type: 'leasehold_block', ownership_type: 'leasehold', owning_company: companies[0].id, management_company: companies[0].id, total_units: 28, year_built: 1995 },
      { name: '7 North Avenue', address_line_1: '7 North Avenue', city: 'London', postcode: 'SW19 7QD', region: 'london', property_type: 'leasehold_block', ownership_type: 'leasehold', owning_company: companies[7].id, management_company: companies[32].id, total_units: 24, year_built: 2001 },
      { name: '128 Grosvenor Place', address_line_1: '128 Grosvenor Place', city: 'London', postcode: 'SW1X 8QH', region: 'london', property_type: 'leasehold_block', ownership_type: 'leasehold', owning_company: companies[0].id, management_company: companies[19].id, total_units: 32, year_built: 2003 },
      { name: '23 Belgrave Road', address_line_1: '23 Belgrave Road', city: 'London', postcode: 'SW1X 8QA', region: 'london', property_type: 'leasehold_block', ownership_type: 'leasehold', owning_company: companies[0].id, management_company: companies[20].id, total_units: 18, year_built: 1998 },
      { name: '11 Rancorn Road', address_line_1: '11 Rancorn Road', city: 'London', postcode: 'NW1 8QP', region: 'london', property_type: 'leasehold_block', ownership_type: 'leasehold', owning_company: companies[0].id, management_company: companies[12].id, total_units: 16, year_built: 2000 },
      { name: '24 Charles Road', address_line_1: '24 Charles Road', city: 'London', postcode: 'N4 3JH', region: 'london', property_type: 'leasehold_block', ownership_type: 'leasehold', owning_company: companies[8].id, management_company: companies[0].id, total_units: 20, year_built: 2002 },
      { name: 'Majestic Court', address_line_1: 'Majestic Court', city: 'London', postcode: 'E1 6AN', region: 'london', property_type: 'leasehold_block', ownership_type: 'leasehold', owning_company: companies[0].id, management_company: companies[21].id, total_units: 28, year_built: 2004 },
      { name: 'Enfield Island Village Phase 1', address_line_1: 'Enfield Island Village', city: 'London', postcode: 'EN3 7XB', region: 'london', property_type: 'leasehold_block', ownership_type: 'leasehold', owning_company: companies[0].id, management_company: companies[22].id, total_units: 35, year_built: 1999 },
      { name: 'Admiral Point', address_line_1: 'Admiral Point', city: 'Blackpool', postcode: 'FY1 6PE', region: 'blackpool', property_type: 'leasehold_block', ownership_type: 'leasehold', owning_company: companies[6].id, management_company: companies[15].id, total_units: 26, year_built: 2000 },
      { name: 'Powell & Co Holdings - Leeds', address_line_1: 'City Centre', city: 'Leeds', postcode: 'LS1 5AE', region: 'leeds', property_type: 'leasehold_block', ownership_type: 'leasehold', owning_company: companies[11].id, management_company: companies[0].id, total_units: 22, year_built: 2005 },
      { name: 'North Avenue Freehold', address_line_1: 'North Avenue Freehold', city: 'London', postcode: 'SW19 7QE', region: 'london', property_type: 'freehold_block', ownership_type: 'freehold', owning_company: companies[1].id, management_company: companies[7].id, total_units: 19, year_built: 2002 },
      { name: '22 Meteor Road Freehold', address_line_1: '22 Meteor Road', city: 'London', postcode: 'N22 8TU', region: 'london', property_type: 'freehold_block', ownership_type: 'freehold', owning_company: companies[1].id, management_company: companies[13].id, total_units: 15, year_built: 2001 },
      { name: '105 Courthill Road Freehold', address_line_1: '105 Courthill Road', city: 'London', postcode: 'SE27 9AY', region: 'london', property_type: 'freehold_block', ownership_type: 'freehold', owning_company: companies[1].id, management_company: companies[14].id, total_units: 12, year_built: 2003 }
    ]);

    // Create Units (~120 across portfolio)
    const unitData = [];
    const unitTemplates = [
      { bedrooms: 1, rent: 2000, service: 2500 },
      { bedrooms: 2, rent: 2800, service: 3000 },
      { bedrooms: 3, rent: 3800, service: 3500 },
      { bedrooms: 2, rent: 2500, service: 2800 }
    ];
    
    // Generate units for each property
    for (let p = 0; p < properties.length; p++) {
      const unitsPerProperty = p < 3 ? 9 : 8;
      for (let u = 1; u <= unitsPerProperty; u++) {
        const template = unitTemplates[u % 4];
        unitData.push({
          unit_reference: `Unit ${p * 10 + u}`,
          property_id: properties[p].id,
          floor: `${Math.ceil(u / 3)}`,
          bedrooms: template.bedrooms,
          unit_type: 'flat',
          tenure: 'leasehold',
          status: u % 12 === 0 ? 'vacant' : 'occupied',
          monthly_rent: template.rent,
          annual_service_charge: template.service,
          lease_start_date: `202${3 + Math.floor(Math.random() * 2)}-${String(Math.floor(Math.random() * 11) + 1).padStart(2, '0')}-01`,
          lease_end_date: `202${5 + Math.floor(Math.random() * 2)}-${String(Math.floor(Math.random() * 11) + 1).padStart(2, '0')}-31`,
          lease_term_years: 10,
          lease_remaining_years: 7
        });
      }
    }
    
    const units = await base44.entities.Unit.bulkCreate(unitData);

    // Create Tenants (60+ across portfolio)
    const tenantNames = [
      'Christopher Martin-Smith', 'Dr. and Mrs. Williamson', 'Sir Anthony Richardson', 'Victoria Chen',
      'Isabella & Marco Rossi', 'James & Sophie Anderson', 'Natasha Volkov', 'Lord and Lady Pemberton',
      'Michael Johnson', 'Sarah Thompson', 'David Williams', 'Emma Brown', 'Oliver Martinez',
      'Sophia Garcia', 'Liam Singh', 'Ava Kumar', 'Noah Patel', 'Isabella Rodriguez',
      'Elijah Lee', 'Charlotte White', 'James Harris', 'Amelia Clark', 'Benjamin Lewis',
      'Mia Robinson', 'Lucas Walker', 'Harper Hall', 'Mason Allen', 'Evelyn Young',
      'Logan Hernandez', 'Abigail King', 'Ethan Wright', 'Elizabeth Lopez', 'Alexander Hill',
      'Sofia Scott', 'Michael Green', 'Emily Adams', 'Daniel Nelson', 'Avery Carter',
      'Matthew Mitchell', 'Harper Perez', 'Andrew Roberts', 'Scarlett Phillips', 'Zachary Campbell',
      'Aria Parker', 'Alexander Evans', 'Layla Edwards', 'Ryan Collins', 'Penelope Stewart',
      'Brandon Morris', 'Brooklyn Rogers', 'Samuel Reed', 'Chloe Cook', 'Joseph Morgan',
      'Violet Bell', 'Gabriel Murphy', 'Grace Bailey', 'Jayden Riviera', 'Violet Smith',
      'Caleb Thompson', 'Nora Jones', 'Luke William'
    ];
    
    const tenantData = [];
    for (let i = 0; i < units.length * 0.8; i++) {
      const unitIdx = Math.floor(i % units.length);
      const unit = units[unitIdx];
      const name = tenantNames[i % tenantNames.length];
      tenantData.push({
        full_name: name,
        email: name.toLowerCase().replace(/[^a-z]/g, '') + '@email.co.uk',
        phone: `020 ${7900 + Math.floor(Math.random() * 99)} ${Math.floor(Math.random() * 10000)}`,
        tenant_type: i % 3 === 0 ? 'assured' : 'assured_shorthold',
        unit_id: unit.id,
        property_id: unit.property_id,
        tenancy_start_date: `202${3 + Math.floor(Math.random() * 2)}-${String(Math.floor(Math.random() * 11) + 1).padStart(2, '0')}-01`,
        tenancy_end_date: `202${5 + Math.floor(Math.random() * 2)}-${String(Math.floor(Math.random() * 11) + 1).padStart(2, '0')}-31`,
        deposit_amount: 3000 + Math.floor(Math.random() * 7000),
        deposit_scheme: ['dps', 'mydeposits', 'tds'][i % 3],
        status: i % 15 === 0 ? 'in_arrears' : 'active'
      });
    }
    
    const tenants = await base44.entities.Tenant.bulkCreate(tenantData);

    // Create Financial Transactions (200+ across portfolio)
    const financialData = [];
    
    // Monthly rent for each tenant
    for (let i = 0; i < tenants.length; i++) {
      const unit = units.find(u => u.id === tenants[i].unit_id);
      if (unit) {
        for (let month = 0; month < 3; month++) {
          const date = new Date(2026, 3 - month - 1, 1);
          financialData.push({
            description: `Monthly rent - Tenant ${i + 1}`,
            transaction_type: 'rent_payment',
            amount: unit.monthly_rent,
            direction: 'income',
            status: Math.random() > 0.1 ? 'paid' : 'pending',
            due_date: date.toISOString().split('T')[0],
            paid_date: Math.random() > 0.1 ? date.toISOString().split('T')[0] : null,
            property_id: tenants[i].property_id,
            unit_id: tenants[i].unit_id,
            tenant_id: tenants[i].id,
            reference: `RENT-${i}-${date.getMonth()}`
          });
        }
      }
    }
    
    // Service charges
    for (let p = 0; p < properties.length; p++) {
      for (let month = 0; month < 3; month++) {
        const date = new Date(2026, 3 - month - 1, 15);
        financialData.push({
          description: `Service charge - ${properties[p].name}`,
          transaction_type: 'service_charge',
          amount: 2500 + Math.floor(Math.random() * 4000),
          direction: 'income',
          status: 'paid',
          due_date: date.toISOString().split('T')[0],
          paid_date: date.toISOString().split('T')[0],
          property_id: properties[p].id,
          reference: `SC-P${p}-${date.getMonth()}`
        });
      }
    }
    
    // Operating expenses
    const expenses = [
      { desc: 'Building maintenance', amount: 2000 },
      { desc: 'Professional cleaning', amount: 1500 },
      { desc: 'Management fees', amount: 3500 },
      { desc: 'Insurance premium', amount: 2500 },
      { desc: 'Utilities coordination', amount: 800 },
      { desc: 'Legal services', amount: 1200 },
      { desc: 'Compliance inspection', amount: 950 }
    ];
    
    for (let i = 0; i < 15; i++) {
      const exp = expenses[i % expenses.length];
      financialData.push({
        description: exp.desc,
        transaction_type: 'maintenance_cost',
        amount: exp.amount + Math.floor(Math.random() * 500),
        direction: 'expense',
        status: 'paid',
        paid_date: `2026-0${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        reference: `EXP-${i}`
      });
    }
    
    await base44.entities.FinancialTransaction.bulkCreate(financialData);

    // Create Maintenance Orders (40+ across portfolio)
    const maintenanceData = [];
    const categories = ['electrical', 'plumbing', 'structural', 'roofing', 'decorating', 'cleaning', 'general'];
    const statuses = ['reported', 'assessed', 'in_progress', 'completed'];
    const priorities = ['standard', 'urgent'];
    const contractors = [
      { name: 'London Certified Electricians', phone: '020 7946 0888' },
      { name: 'London Heating Solutions', phone: '020 7946 0777' },
      { name: 'Grade II Listed Specialist Roofers', phone: '020 7946 0666' },
      { name: 'London Interiors & Design', phone: '020 7946 0555' },
      { name: 'Brighton Maintenance Services', phone: '01273 555234' },
      { name: 'South Coast Electrical', phone: '01273 555345' },
      { name: 'General Building Solutions', phone: '020 7946 0500' }
    ];
    
    for (let i = 0; i < 40; i++) {
      const prop = properties[i % properties.length];
      const contractor = contractors[i % contractors.length];
      const category = categories[i % categories.length];
      const status = statuses[Math.floor(i / 10) % statuses.length];
      
      maintenanceData.push({
        title: `${category.charAt(0).toUpperCase() + category.slice(1)} maintenance - ${prop.name}`,
        description: `Routine ${category} inspection and maintenance`,
        property_id: prop.id,
        reported_by: 'Sean Powell',
        priority: i % 5 === 0 ? 'urgent' : 'standard',
        status: status,
        category: category,
        contractor_name: contractor.name,
        contractor_phone: contractor.phone,
        estimated_cost: 1000 + Math.floor(Math.random() * 4000),
        actual_cost: status === 'completed' ? 1000 + Math.floor(Math.random() * 4000) : null,
        scheduled_date: `2026-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        completed_date: status === 'completed' ? `2026-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` : null,
        notes: `Standard ${category} work for property maintenance`
      });
    }
    
    await base44.entities.MaintenanceOrder.bulkCreate(maintenanceData);

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