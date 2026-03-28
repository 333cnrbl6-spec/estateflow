/**
 * Entity Knowledge Base - Information about all backend entities for the helper bot
 */

export const entityKnowledge = {
  Company: {
    description: 'Manage property management and investment companies',
    fields: ['name', 'company_number', 'status', 'category', 'region'],
    actions: ['View details', 'Edit company info', 'Check registration status'],
    helpText: 'Companies represent legal entities managing properties. Track their status, SIC codes, and account filings.'
  },
  Property: {
    description: 'Track buildings and residential developments',
    fields: ['name', 'address', 'property_type', 'ownership_type', 'total_units'],
    actions: ['View property details', 'Manage units', 'Check compliance'],
    helpText: 'Properties are physical buildings or developments. Each can contain multiple units and service charge records.'
  },
  Unit: {
    description: 'Manage individual flats, apartments and commercial spaces',
    fields: ['unit_reference', 'floor', 'bedrooms', 'tenure', 'current_tenant_id'],
    actions: ['Assign tenant', 'View lease details', 'Update rent'],
    helpText: 'Units are individual lettable spaces within a property. Track tenancy status, lease terms, and rent amounts.'
  },
  Tenant: {
    description: 'Manage leaseholders and residential tenants',
    fields: ['full_name', 'email', 'phone', 'tenant_type', 'status'],
    actions: ['Create tenancy', 'View agreements', 'Track arrears'],
    helpText: 'Tenants can be leaseholders or assured shorthold tenants. Track contact info, tenancy status, and deposits.'
  },
  Maintenance: {
    description: 'Log and track maintenance orders and repairs',
    fields: ['title', 'priority', 'status', 'category', 'assigned_contractor'],
    actions: ['Create order', 'Assign contractor', 'Track progress'],
    helpText: 'Create maintenance orders for repairs. Track contractor assignments, completion dates, and costs.'
  },
  MaintenanceOrder: {
    description: 'Individual maintenance and repair tasks',
    fields: ['title', 'priority', 'status', 'category', 'assigned_contractor_id'],
    actions: ['Update status', 'Add notes', 'Request quote'],
    helpText: 'Each maintenance order tracks a specific repair or service needed at a property.'
  },
  ServiceCharge: {
    description: 'Manage service charge accounts and leaseholder costs',
    fields: ['property_id', 'year', 'total_estimated_cost', 'status', 'cost_breakdown'],
    actions: ['View breakdown', 'Issue statements', 'Handle disputes'],
    helpText: 'Service charges cover common areas. Track budgeted vs actual costs, disputes, and leaseholder payments.'
  },
  OutOfHoursCall: {
    description: 'Log and manage after-hours emergency calls',
    fields: ['caller_name', 'caller_phone', 'call_type', 'severity', 'action_taken'],
    actions: ['Log call', 'Validate caller', 'Dispatch contractor'],
    helpText: 'Track emergency calls received out of business hours. Validate property details and record actions taken.'
  },
  OutOfHoursService: {
    description: 'Configure out-of-hours call handling services',
    fields: ['service_tier', 'monthly_cost', 'emergency_contractors', 'call_handling_options'],
    actions: ['Set service tier', 'Manage contractors', 'Configure escalation'],
    helpText: 'Configure emergency call service tiers (basic, standard, premium, enterprise) and contractor availability.'
  },
  Invoice: {
    description: 'Manage billing and invoices for services',
    fields: ['invoice_number', 'amount', 'status', 'billing_period', 'payment_method'],
    actions: ['Create invoice', 'Send to customer', 'Record payment'],
    helpText: 'Invoices track billing for out-of-hours services and other charges. Monitor payment status and arrears.'
  },
  FinancialTransaction: {
    description: 'Record all income and expense transactions',
    fields: ['description', 'amount', 'direction', 'status', 'transaction_type'],
    actions: ['Record income', 'Log expense', 'View ledger'],
    helpText: 'Log all financial movements: rent, service charges, maintenance costs, fees, and refunds.'
  },
  RentLedger: {
    description: 'Track tenant rent payments and arrears',
    fields: ['unit_id', 'monthly_rent', 'due_date', 'payment_status', 'arrears'],
    actions: ['Record payment', 'Chase arrears', 'Generate statement'],
    helpText: 'Monitor rent collection. Track payments received, arrears, and tenant payment history.'
  },
  EmergencyCallout: {
    description: 'Manage emergency repairs and callouts',
    fields: ['call_type', 'severity', 'status', 'assigned_contractor', 'response_time'],
    actions: ['Log callout', 'Assign contractor', 'Track resolution'],
    helpText: 'Track emergency repairs (water leaks, heating failures, etc). Monitor response times and resolution.'
  },
  SafetyCertificate: {
    description: 'Track compliance certificates (Gas, Electrical, Fire)',
    fields: ['certificate_type', 'issue_date', 'expiry_date', 'status', 'document_url'],
    actions: ['Upload certificate', 'Set alerts', 'Renew certificate'],
    helpText: 'Track Gas Safety, EICR, Fire Safety, Asbestos and other compliance certificates. Get expiry alerts.'
  },
  BuildingSafety: {
    description: 'Manage building safety and structural compliance',
    fields: ['building_classification', 'fire_safety', 'structural_safety', 'health_hazards'],
    actions: ['Log defects', 'Track remediation', 'File assessments'],
    helpText: 'High-rise residential buildings must comply with Building Safety Act. Track defects and remediation.'
  },
  RTMManagement: {
    description: 'Track Right to Manage claim progress',
    fields: ['rtm_status', 'leaseholder_eligibility', 'claim_process', 'handover_process'],
    actions: ['Initiate claim', 'Track dispute period', 'Manage handover'],
    helpText: 'Right to Manage allows leaseholders to take control. Track claim status and acquisition process.'
  },
  TenancyPipeline: {
    description: 'Manage tenancy lifecycle from applicant to checkout',
    fields: ['stage', 'applicant_name', 'property_address', 'tenancy_dates'],
    actions: ['Progress stage', 'Check compliance', 'Generate notices'],
    helpText: 'Track tenancy stages: applicant → referencing → signed → occupied → notice → vacant.'
  },
  Workflow: {
    description: 'Automate recurring property management tasks',
    fields: ['trigger_type', 'days_before', 'actions', 'is_active'],
    actions: ['Create workflow', 'Set triggers', 'Configure actions'],
    helpText: 'Automate tasks like certificate reminders, rent overdue notices, or maintenance orders.'
  },
  DocumentTemplate: {
    description: 'Store and manage document templates',
    fields: ['name', 'template_type', 'file_url', 'merge_fields'],
    actions: ['Upload template', 'Generate document', 'Preview'],
    helpText: 'Store templates for tenancy agreements, notices, and service charge statements with merge fields.'
  },
  Contact: {
    description: 'Manage contractors, agents, and service providers',
    fields: ['name', 'contact_type', 'phone', 'email', 'specialties'],
    actions: ['Add contact', 'View jobs assigned', 'Track performance'],
    helpText: 'Store contact details for emergency contractors, managing agents, and service providers.'
  },
  LeaseholderRights: {
    description: 'Track leaseholder legal rights and protections',
    fields: ['lease_details', 'lease_extension', 'statutory_rights', 'complaint_handling'],
    actions: ['Log complaint', 'Track extension claim', 'View rights'],
    helpText: 'Monitor leaseholder protections: lease extensions, enfranchisement rights, and dispute resolution.'
  },
};

/**
 * Module Guide for Each Page/Section
 */
export const moduleGuides = {
  Dashboard: {
    title: 'Dashboard Overview',
    description: 'View portfolio health at a glance with KPIs and compliance status',
    tips: [
      'Check occupancy rates and financial health',
      'Review pending compliance tasks',
      'Monitor maintenance activity',
      'Track out-of-hours support usage'
    ],
    relatedEntities: ['Company', 'Property', 'Unit', 'Tenant']
  },
  Properties: {
    title: 'Property Management',
    description: 'Manage all buildings, units, and tenant information',
    tips: [
      'Add new properties with full address and ownership details',
      'Link units to tenants',
      'Track property type and compliance',
      'Monitor total rental income'
    ],
    relatedEntities: ['Property', 'Unit', 'Tenant', 'SafetyCertificate']
  },
  Maintenance: {
    title: 'Maintenance & Repairs',
    description: 'Log and track maintenance orders and contractor work',
    tips: [
      'Create orders with priority levels',
      'Assign to contractors with relevant specialties',
      'Track completion and costs',
      'Log emergency callouts separately'
    ],
    relatedEntities: ['MaintenanceOrder', 'EmergencyCallout', 'Contact']
  },
  ServiceCharges: {
    title: 'Service Charge Management',
    description: 'Manage service charge accounts and leaseholder billing',
    tips: [
      'Create annual service charge accounts',
      'Break down costs by category',
      'Issue statements to leaseholders',
      'Handle disputes and payment plans'
    ],
    relatedEntities: ['ServiceCharge', 'Property', 'Unit', 'LeaseholderRights']
  },
  Pipeline: {
    title: 'Tenancy Pipeline',
    description: 'Track tenancy lifecycle and compliance checklist',
    tips: [
      'Monitor applicant screening progress',
      'Ensure all compliance checks completed',
      'Generate required documents automatically',
      'Track check-in and handover dates'
    ],
    relatedEntities: ['TenancyPipeline', 'Tenant', 'Unit', 'DocumentTemplate']
  },
  Compliance: {
    title: 'Compliance & Certificates',
    description: 'Track safety certificates and regulatory compliance',
    tips: [
      'Upload Gas Safety certificates annually',
      'Monitor EICR (electrical) certificates',
      'Track fire safety assessments',
      'Set alerts for expiring certificates'
    ],
    relatedEntities: ['SafetyCertificate', 'BuildingSafety', 'Property']
  },
  OutOfHours: {
    title: 'Out-of-Hours Call Center',
    description: 'Manage emergency calls and service requests',
    tips: [
      'Log calls with full caller and property details',
      'Validate property and tenant information',
      'Dispatch emergency contractors as needed',
      'Document actions and resolutions'
    ],
    relatedEntities: ['OutOfHoursCall', 'OutOfHoursService', 'Property', 'Tenant']
  },
  Financials: {
    title: 'Financial Management',
    description: 'Track income, expenses, and financial reporting',
    tips: [
      'Record all rent and service charge payments',
      'Log maintenance and operating expenses',
      'Monitor tenant arrears',
      'Generate financial reports and forecasts'
    ],
    relatedEntities: ['FinancialTransaction', 'Invoice', 'RentLedger', 'ServiceCharge']
  },
  Contacts: {
    title: 'Contact Management',
    description: 'Manage emergency contractors and service providers',
    tips: [
      'Store contact details with specialties',
      'Link contractors to properties',
      'Track performance and availability',
      'Maintain emergency contact list'
    ],
    relatedEntities: ['Contact', 'MaintenanceOrder', 'EmergencyCallout']
  },
  Workflows: {
    title: 'Workflow Automation',
    description: 'Set up automated tasks and reminders',
    tips: [
      'Create workflows for certificate renewals',
      'Automate rent reminder emails',
      'Schedule maintenance inspections',
      'Generate compliance notifications'
    ],
    relatedEntities: ['Workflow', 'SafetyCertificate', 'MaintenanceOrder']
  },
};

export function getModuleGuide(pageTitle) {
  return moduleGuides[pageTitle] || {
    title: 'Module Guide',
    description: 'Get started with this module',
    tips: ['Explore available features', 'Click on entity cards for more details'],
    relatedEntities: []
  };
}

export function getEntityInfo(entityName) {
  return entityKnowledge[entityName] || null;
}