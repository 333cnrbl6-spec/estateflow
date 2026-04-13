import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { tier = 'small', includeRelationships = true } = await req.json();

    // Configuration for different tiers
    const tierConfig = {
      small: { companies: 2, properties: 10, units: 30, tenants: 50, contacts: 15 },
      medium: { companies: 5, properties: 50, units: 200, tenants: 500, contacts: 50 },
      large: { companies: 10, properties: 200, units: 1000, tenants: 2000, contacts: 150 }
    };

    const config = tierConfig[tier] || tierConfig.small;
    const results = {
      companies: 0,
      properties: 0,
      units: 0,
      tenants: 0,
      contacts: 0,
      csv_files: []
    };

    // Helper functions
    const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomDate = (start, end) => {
      const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return date.toISOString().split('T')[0];
    };

    const ukCities = ['London', 'Brighton', 'Manchester', 'Birmingham', 'Leeds', 'Bristol', 'Liverpool', 'Sheffield'];
    const ukPostcodes = ['SW1A', 'E1', 'N1', 'W1', 'SE1', 'BN1', 'M1', 'B1', 'LS1', 'BS1'];
    const propertyTypes = ['freehold_block', 'leasehold_block', 'house', 'mixed_use'];
    const firstNames = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Emma', 'Olivia', 'Ava', 'Isabella', 'Sophia', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White'];
    const streetNames = ['High Street', 'Main Road', 'Church Lane', 'Station Road', 'Victoria Street', 'King Street', 'Queen Street', 'Mill Lane', 'Park Avenue', 'London Road'];

    // Generate Companies
    const companies = [];
    for (let i = 0; i < config.companies; i++) {
      companies.push({
        name: `Test Company ${i + 1} Ltd`,
        company_number: `TC${randomInt(100000, 999999)}`,
        company_type: randomElement(['property_management', 'landlord', 'rtm_company']),
        registration_date: randomDate(new Date(2020, 0, 1), new Date(2024, 11, 31)),
        status: 'active',
        email: `company${i + 1}@testcompany.co.uk`,
        phone: `020 ${randomInt(1000, 9999)} ${randomInt(1000, 9999)}`,
        address_line_1: `${randomInt(1, 200)} Business Park`,
        city: randomElement(ukCities),
        postcode: `${randomElement(ukPostcodes)} ${randomInt(1, 99)}AB`
      });
    }

    // Generate Properties
    const properties = [];
    for (let i = 0; i < config.properties; i++) {
      const company = randomElement(companies);
      properties.push({
        name: `${randomElement(['Admiral', 'Reed', 'Victoria', 'Kings', 'Queens', 'Park', 'River', 'Garden'])} ${randomElement(['Point', 'Close', 'House', 'Court', 'Mansions', 'Gardens'])}`,
        address_line_1: `${randomInt(1, 500)} ${randomElement(streetNames)}`,
        address_line_2: '',
        city: randomElement(ukCities),
        postcode: `${randomElement(ukPostcodes)} ${randomInt(1, 99)}AB`,
        region: randomElement(['london', 'brighton', 'leeds', 'bolton', 'other']),
        property_type: randomElement(propertyTypes),
        ownership_type: randomElement(['freehold', 'leasehold']),
        owning_company: company.name,
        management_company: company.name,
        total_units: randomInt(4, 50),
        year_built: randomInt(1960, 2023)
      });
    }

    // Generate Units
    const units = [];
    for (let i = 0; i < config.units; i++) {
      const property = randomElement(properties);
      units.push({
        property_id: property.name,
        unit_number: `Flat ${randomInt(1, 50)}`,
        bedrooms: randomInt(1, 4),
        bathrooms: randomInt(1, 3),
        floor_area_sqft: randomInt(400, 1500),
        rent_amount: randomInt(800, 3000),
        rent_frequency: 'monthly',
        status: randomElement(['occupied', 'vacant', 'maintenance']),
        available_from: randomDate(new Date(2024, 0, 1), new Date(2026, 11, 31))
      });
    }

    // Generate Tenants
    const tenants = [];
    for (let i = 0; i < config.tenants; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      tenants.push({
        full_name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 999)}@email.com`,
        phone: `07${randomInt(100000000, 999999999)}`,
        date_of_birth: randomDate(new Date(1970, 0, 1), new Date(2000, 11, 31)),
        ni_number: `${randomElement(['AB', 'CD', 'EF', 'GH', 'JK', 'LM', 'NO', 'PQ', 'RS', 'ST'])}${randomInt(10, 99)}${randomInt(10, 99)}${randomInt(10, 99)}${randomElement(['A', 'B', 'C', 'D'])}`,
        occupation: randomElement(['Software Engineer', 'Teacher', 'Nurse', 'Accountant', 'Designer', 'Manager', 'Consultant']),
        employer: `${randomElement(['Tech', 'Finance', 'Healthcare', 'Education', 'Retail'])} Corp Ltd`,
        annual_income: randomInt(25000, 120000),
        previous_address: `${randomInt(1, 200)} ${randomElement(streetNames)}, ${randomElement(ukCities)}`,
        emergency_contact_name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
        emergency_contact_phone: `07${randomInt(100000000, 999999999)}`,
        move_in_date: randomDate(new Date(2024, 0, 1), new Date(2026, 11, 31)),
        tenancy_end_date: randomDate(new Date(2026, 0, 1), new Date(2028, 11, 31))
      });
    }

    // Generate Contacts
    const contacts = [];
    for (let i = 0; i < config.contacts; i++) {
      contacts.push({
        full_name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
        email: `contact${i + 1}@business.com`,
        phone: `020 ${randomInt(1000, 9999)} ${randomInt(1000, 9999)}`,
        contact_type: randomElement(['contractor', 'solicitor', 'surveyor', 'agent', 'managing_agent']),
        company_name: `${randomElement(['ABC', 'XYZ', 'Premier', 'Elite', 'Professional'])} Services Ltd`,
        address: `${randomInt(1, 200)} ${randomElement(streetNames)}, ${randomElement(ukCities)}`
      });
    }

    // Generate CSV content
    const generateCSV = (data, columns) => {
      const header = columns.join(',');
      const rows = data.map(item => 
        columns.map(col => {
          const value = item[col] || '';
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(',')
      );
      return [header, ...rows].join('\n');
    };

    // Create CSV files
    const csvFiles = [
      {
        filename: 'companies_test.csv',
        content: generateCSV(companies, ['name', 'company_number', 'company_type', 'registration_date', 'status', 'email', 'phone', 'address_line_1', 'city', 'postcode']),
        record_count: companies.length
      },
      {
        filename: 'properties_test.csv',
        content: generateCSV(properties, ['name', 'address_line_1', 'address_line_2', 'city', 'postcode', 'region', 'property_type', 'ownership_type', 'owning_company', 'management_company', 'total_units', 'year_built']),
        record_count: properties.length
      },
      {
        filename: 'units_test.csv',
        content: generateCSV(units, ['property_id', 'unit_number', 'bedrooms', 'bathrooms', 'floor_area_sqft', 'rent_amount', 'rent_frequency', 'status', 'available_from']),
        record_count: units.length
      },
      {
        filename: 'tenants_test.csv',
        content: generateCSV(tenants, ['full_name', 'email', 'phone', 'date_of_birth', 'ni_number', 'occupation', 'employer', 'annual_income', 'previous_address', 'emergency_contact_name', 'emergency_contact_phone', 'move_in_date', 'tenancy_end_date']),
        record_count: tenants.length
      },
      {
        filename: 'contacts_test.csv',
        content: generateCSV(contacts, ['full_name', 'email', 'phone', 'contact_type', 'company_name', 'address']),
        record_count: contacts.length
      }
    ];

    // Log test data generation
    await base44.entities.WorkflowExecution.create({
      workflow_name: 'Bulk Import Test Data Generator',
      entity_type: 'Test',
      status: 'success',
      execution_date: new Date().toISOString(),
      result: {
        tier,
        config,
        generated: {
          companies: companies.length,
          properties: properties.length,
          units: units.length,
          tenants: tenants.length,
          contacts: contacts.length
        }
      }
    });

    return Response.json({
      success: true,
      message: `Generated test data for ${tier} tier`,
      summary: {
        companies: companies.length,
        properties: properties.length,
        units: units.length,
        tenants: tenants.length,
        contacts: contacts.length,
        total_records: companies.length + properties.length + units.length + tenants.length + contacts.length
      },
      csv_files: csvFiles,
      download_instructions: 'Copy the CSV content from each file object and save as .csv files for import testing'
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      success: false
    }, { status: 500 });
  }
});