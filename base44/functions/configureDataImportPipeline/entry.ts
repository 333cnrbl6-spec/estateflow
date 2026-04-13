import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      software_integrations,
      data_types,
      data_counts,
      company_number,
      company_name
    } = await req.json();

    const pipelines = [];
    const mappings = {};
    const estimatedRecords = {};

    // Map software to import capabilities
    const softwareMappings = {
      xero: {
        supports: ['properties', 'tenants', 'landlords', 'rent_ledger', 'banking'],
        extractors: ['invoices', 'contacts', 'accounts', 'bank_transactions'],
        mappingTime: '15-30 mins'
      },
      quickbooks: {
        supports: ['properties', 'rent_ledger', 'banking', 'expenses'],
        extractors: ['invoices', 'customers', 'bank_transactions', 'journal_entries'],
        mappingTime: '20-35 mins'
      },
      sage: {
        supports: ['properties', 'rent_ledger', 'banking', 'expenses'],
        extractors: ['invoices', 'customers', 'bank_data', 'nominal_ledger'],
        mappingTime: '25-40 mins'
      },
      propertyware: {
        supports: ['properties', 'tenants', 'landlords', 'maintenance', 'rent_ledger'],
        extractors: ['properties', 'units', 'tenants', 'leases', 'rent_roll'],
        mappingTime: '10-20 mins'
      },
      reapit: {
        supports: ['properties', 'tenants', 'landlords', 'rent_ledger', 'documents'],
        extractors: ['properties', 'tenancies', 'contacts', 'transactions'],
        mappingTime: '15-25 mins'
      },
      fixflo: {
        supports: ['maintenance', 'contractors'],
        extractors: ['jobs', 'contractors', 'invoices'],
        mappingTime: '10-15 mins'
      },
      open_rent: {
        supports: ['properties', 'tenants', 'rent_ledger'],
        extractors: ['listings', 'applicants', 'tenancies'],
        mappingTime: '10-20 mins'
      }
    };

    // Calculate import pipelines based on selected software
    (software_integrations || []).forEach(software => {
      const config = softwareMappings[software];
      if (!config) return;

      pipelines.push({
        software,
        status: 'pending',
        data_types: config.supports.filter(dt => (data_types || []).includes(dt)),
        extractors: config.extractors,
        mapping_time: config.mappingTime,
        estimated_records: calculateEstimatedRecords(software, data_types, data_counts),
        potential_conflicts: detectPotentialConflicts(software),
        actions: [
          'authenticate_with_api',
          'fetch_data_schema',
          'map_to_premiso_entities',
          'validate_data_integrity',
          'import_records'
        ]
      });
    });

    // Estimate records per data type
    (data_types || []).forEach(dtype => {
      const count = parseInt(data_counts?.[dtype] || 0);
      if (count > 0) {
        estimatedRecords[dtype] = {
          user_input: count,
          with_related: estimateRelatedRecords(dtype, count),
          total_import_size: estimateImportSize(dtype, count)
        };
      }
    });

    // Create conflict detection report
    const conflicts = detectDataConflicts(
      software_integrations,
      data_types,
      data_counts
    );

    const response = {
      success: true,
      pipelines,
      estimatedRecords,
      conflicts,
      timeline: {
        total_estimated_time: `${Math.min(...pipelines.map(p => parseInt(p.mapping_time.split('-')[0]))) + 10}-${Math.max(...pipelines.map(p => parseInt(p.mapping_time.split('-')[1]))) + 20} minutes`,
        phases: [
          { name: 'Authentication & Connection', duration: '2-5 mins', status: 'pending' },
          { name: 'Data Schema Fetch', duration: '3-8 mins', status: 'pending' },
          { name: 'Entity Mapping', duration: '5-15 mins', status: 'pending' },
          { name: 'Data Validation', duration: '5-10 mins', status: 'pending' },
          { name: 'Import & Reconciliation', duration: '10-30 mins', status: 'pending' }
        ]
      },
      recommendations: generateRecommendations(software_integrations, data_types, conflicts)
    };

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateEstimatedRecords(software, dataTypes, dataCounts) {
  const records = {};
  (dataTypes || []).forEach(dtype => {
    const count = parseInt(dataCounts?.[dtype] || 0);
    if (count > 0) {
      records[dtype] = count;
    }
  });
  return records;
}

function estimateRelatedRecords(dataType, count) {
  const multipliers = {
    properties: 15, // properties + units + tenancies
    tenants: 5,    // tenant + contacts + leases
    landlords: 3,  // landlord + accounts + bank details
    rent_ledger: 2, // rent records + payments
    banking: 1.5,
    maintenance: 4, // jobs + invoices + payments
    service_charges: 8, // charges + invoices + payments + disputes
    documents: 1
  };
  return Math.ceil(count * (multipliers[dataType] || 1));
}

function estimateImportSize(dataType, count) {
  const sizePerRecord = {
    properties: 50,
    tenants: 30,
    landlords: 20,
    rent_ledger: 15,
    banking: 25,
    maintenance: 40,
    service_charges: 60,
    documents: 500
  };
  const bytes = count * (sizePerRecord[dataType] || 20);
  if (bytes > 1000000) return `${(bytes / 1000000).toFixed(1)}MB`;
  if (bytes > 1000) return `${(bytes / 1000).toFixed(1)}KB`;
  return `${bytes}B`;
}

function detectPotentialConflicts(software) {
  const conflicts = [];
  
  switch(software) {
    case 'xero':
      conflicts.push({
        type: 'duplicate_contacts',
        severity: 'medium',
        description: 'Xero may have duplicate contact records - manual review recommended'
      });
      conflicts.push({
        type: 'tax_codes',
        severity: 'low',
        description: 'Tax codes in Xero may need reconfiguration for Premiso'
      });
      break;
    case 'quickbooks':
      conflicts.push({
        type: 'customer_class',
        severity: 'medium',
        description: 'QuickBooks customer classification may not map to Premiso hierarchy'
      });
      break;
    case 'propertyware':
      conflicts.push({
        type: 'lease_overlap',
        severity: 'high',
        description: 'Overlapping lease dates detected - may cause tenancy conflicts'
      });
      break;
  }
  
  return conflicts;
}

function detectDataConflicts(softwareList, dataTypes, dataCounts) {
  const issues = [];

  if ((softwareList || []).length > 1) {
    issues.push({
      type: 'multi_source_accounts',
      severity: 'medium',
      description: 'Multiple accounting systems selected - bank transactions may duplicate',
      resolution: 'Select primary accounting system for financial imports'
    });
  }

  if ((dataTypes || []).includes('rent_ledger') && (dataCounts?.rent_ledger || 0) > 10000) {
    issues.push({
      type: 'large_dataset',
      severity: 'low',
      description: 'Large rent ledger import may take longer',
      resolution: 'Consider staggering imports or archiving historical data'
    });
  }

  if ((dataTypes || []).includes('banking') && (dataTypes || []).includes('rent_ledger')) {
    issues.push({
      type: 'reconciliation_required',
      severity: 'medium',
      description: 'Bank and rent ledger data will need reconciliation',
      resolution: 'Allow extra time for manual reconciliation after import'
    });
  }

  return issues;
}

function generateRecommendations(softwareList, dataTypes, conflicts) {
  const recs = [];

  if (conflicts.length > 0) {
    recs.push('Review detected conflicts before proceeding with import');
  }

  if ((softwareList || []).length > 2) {
    recs.push('Multiple integrations selected - import may take 45+ minutes total');
  }

  if ((dataTypes || []).includes('documents') || (dataTypes || []).includes('banking')) {
    recs.push('Large file imports detected - ensure stable internet connection');
  }

  if (!(softwareList || []).some(s => ['xero','quickbooks','sage'].includes(s))) {
    recs.push('No primary accounting system selected - financial reports may be limited');
  }

  recs.push('You can cancel and reconfigure imports at any time during the process');

  return recs;
}