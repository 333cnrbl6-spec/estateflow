// App knowledge base for Helper Bot
// This file contains comprehensive information about all modules, features, and capabilities

export const APP_KNOWLEDGE = {
  platform: {
    name: "Premiso",
    description: "Comprehensive UK property management platform for freehold blocks, leasehold properties, and lettings",
    version: "1.0",
    targetUsers: ["Property managers", "Freeholders", "RTM companies", "Managing agents", "Landlords"]
  },

  modules: {
    dashboard: {
      name: "Dashboard",
      route: "/",
      description: "Central overview of your entire property portfolio with key metrics and quick actions",
      features: [
        "Portfolio summary with companies, properties, units, and tenants count",
        "Financial overview showing income, expenses, and net balance",
        "Compliance alerts for expiring certificates",
        "Market intelligence widget with property trends",
        "Executive dashboard with actionable insights",
        "Quick actions for common tasks"
      ],
      useCases: [
        "Get instant overview of portfolio performance",
        "Monitor financial health and cash flow",
        "Track compliance status across all properties",
        "Access market reports and insights"
      ],
      suggestions: [
        "View portfolio performance",
        "Check compliance alerts",
        "Review financial metrics",
        "Access market reports",
        "See occupancy rates"
      ]
    },

    companies: {
      name: "Companies",
      route: "/companies",
      description: "Manage company structures, directors, and corporate entities with Companies House integration",
      features: [
        "Company registration and profile management",
        "Director and officer tracking",
        "Companies House API integration",
        "SIC code classification",
        "Filing deadline tracking",
        "Accounts and confirmation statement monitoring",
        "Company structure visualization"
      ],
      useCases: [
        "Set up new management company",
        "Track director appointments/resignations",
        "Monitor filing deadlines",
        "Manage RTM company structure"
      ],
      suggestions: [
        "Add a new company",
        "Update director information",
        "Check filing deadlines",
        "Review company structure",
        "Import from Companies House"
      ]
    },

    properties: {
      name: "Properties",
      route: "/properties",
      description: "Manage residential and commercial properties including freehold blocks and individual units",
      features: [
        "Property profile with address and details",
        "Unit/apartment breakdown",
        "Freehold and leasehold management",
        "Property images and documentation",
        "Ownership information tracking",
        "Regional classification",
        "Property type categorization"
      ],
      useCases: [
        "Add new property to portfolio",
        "Manage block of flats",
        "Track unit ownership",
        "Store property documents"
      ],
      suggestions: [
        "Add a new property",
        "View property details",
        "Manage units",
        "Update property information",
        "Upload property images"
      ]
    },

    units: {
      name: "Units",
      route: "/units",
      description: "Individual unit management within properties including leasehold flats and rental units",
      features: [
        "Unit reference and floor mapping",
        "Bedroom and configuration details",
        "Tenure type (leasehold, AST, etc.)",
        "Current tenant assignment",
        "Occupancy status tracking",
        "Rent and service charge allocation",
        "Lease term management"
      ],
      useCases: [
        "Configure unit layout",
        "Assign tenants to units",
        "Track leasehold ownership",
        "Manage rental units"
      ],
      suggestions: [
        "Add unit to property",
        "View unit details",
        "Assign tenant",
        "Update lease information",
        "Check occupancy status"
      ]
    },

    tenants: {
      name: "Tenants & Contacts",
      route: "/tenants",
      description: "Comprehensive tenant and contact relationship management",
      features: [
        "Tenant profile and contact details",
        "Tenancy type classification",
        "Lease start/end date tracking",
        "Deposit protection scheme registration",
        "Emergency contact information",
        "Tenancy status management",
        "Communication history"
      ],
      useCases: [
        "Onboard new tenant",
        "Manage tenancy renewals",
        "Track deposit protection",
        "Handle tenant communications"
      ],
      suggestions: [
        "Add a new tenant",
        "View lease details",
        "Send tenant communication",
        "Update contact information",
        "Check deposit status"
      ]
    },

    financials: {
      name: "Financials",
      route: "/financials",
      description: "Complete financial management including rent collection, service charges, and expense tracking",
      features: [
        "Rent payment processing",
        "Service charge calculation and collection",
        "Ground rent management",
        "Bank reconciliation",
        "Financial reporting and statements",
        "Stripe payment integration",
        "Recurring payment automation",
        "Income and expense tracking",
        "Tax summaries"
      ],
      useCases: [
        "Collect rent payments",
        "Calculate service charges",
        "Generate financial statements",
        "Reconcile bank transactions",
        "Process expenses"
      ],
      suggestions: [
        "View income statements",
        "Process rent payments",
        "Manage service charges",
        "Run financial reports",
        "Reconcile bank transactions",
        "Set up recurring payments"
      ]
    },

    maintenance: {
      name: "Maintenance",
      route: "/maintenance",
      description: "Maintenance request management, contractor coordination, and repair tracking",
      features: [
        "Maintenance request creation and tracking",
        "Priority classification (emergency, urgent, standard, low)",
        "Contractor assignment and management",
        "Cost estimation and tracking",
        "Status workflow management",
        "Category-based organization",
        "Completion monitoring",
        "Historical maintenance records"
      ],
      useCases: [
        "Report maintenance issue",
        "Dispatch contractor",
        "Track repair progress",
        "Manage emergency callouts"
      ],
      suggestions: [
        "Create maintenance request",
        "Assign contractor",
        "View pending repairs",
        "Track maintenance costs",
        "Update request status"
      ]
    },

    contacts: {
      name: "Contacts",
      route: "/contacts",
      description: "Centralized contact management for all stakeholders",
      features: [
        "Contact type classification (director, contractor, solicitor, etc.)",
        "Company affiliation tracking",
        "Address and contact details",
        "Role-based organization",
        "Notes and relationship history"
      ],
      useCases: [
        "Add service provider",
        "Manage professional contacts",
        "Track contractor details",
        "Store solicitor information"
      ],
      suggestions: [
        "Add new contact",
        "View contact details",
        "Update company affiliation",
        "Search contacts by type"
      ]
    },

    compliance: {
      name: "Compliance",
      route: "/compliance",
      description: "Regulatory compliance tracking, certificate management, and safety monitoring",
      features: [
        "Certificate upload and storage",
        "Expiry date tracking and alerts",
        "Gas Safety, EICR, EPC management",
        "HMO licensing monitoring",
        "Building Safety Act compliance",
        "Fire safety certification",
        "Compliance gap auditing",
        "Automated renewal reminders"
      ],
      useCases: [
        "Upload safety certificates",
        "Monitor compliance status",
        "Receive expiry alerts",
        "Generate compliance reports"
      ],
      suggestions: [
        "Upload certificates",
        "Check expiring compliance",
        "View safety requirements",
        "Generate compliance report",
        "Set renewal reminders"
      ]
    },

    pipeline: {
      name: "Tenancy Pipeline",
      route: "/pipeline",
      description: "Lettings workflow from initial inquiry through to tenant move-in",
      features: [
        "Inquiry tracking",
        "Viewing scheduling and management",
        "Application processing",
        "Referencing coordination",
        "Right to Rent checks",
        "Tenancy agreement generation",
        "Move-in inspection",
        "Pipeline stage visualization"
      ],
      useCases: [
        "Manage new lettings inquiry",
        "Schedule property viewings",
        "Process tenant applications",
        "Coordinate move-ins"
      ],
      suggestions: [
        "Add new inquiry",
        "Schedule viewing",
        "Process application",
        "Track referencing",
        "Generate tenancy agreement"
      ]
    },

    sales: {
      name: "Sales",
      route: "/sales",
      description: "Property sales management with lead tracking, listings, and transaction pipeline",
      features: [
        "Lead management and scoring",
        "Property listing creation",
        "Offer tracking and negotiation",
        "Transaction pipeline (STC to completion)",
        "AI-powered property valuations",
        "Buyer portal integration",
        "Viewing scheduling",
        "Communication thread management",
        "Agent performance analytics"
      ],
      useCases: [
        "Create sales listing",
        "Manage buyer leads",
        "Track offers and negotiations",
        "Monitor transaction progress",
        "Generate property valuations"
      ],
      suggestions: [
        "Create sales listing",
        "Manage leads",
        "Generate property valuation",
        "View transaction pipeline",
        "Schedule viewings",
        "Check agent performance"
      ]
    },

    "rent-ledger": {
      name: "Rent Ledger",
      route: "/rent-ledger",
      description: "Detailed rent payment history and arrears tracking",
      features: [
        "Payment history by tenant/property",
        "Arrears monitoring",
        "Payment allocation",
        "Outstanding balance tracking",
        "Payment method breakdown"
      ],
      useCases: [
        "View tenant payment history",
        "Track arrears",
        "Allocate payments",
        "Generate rent statements"
      ],
      suggestions: [
        "View payment history",
        "Check arrears",
        "Allocate payment",
        "Generate statement"
      ]
    },

    "service-charges": {
      name: "Service Charges",
      route: "/service-charges",
      description: "Service charge calculation, billing, and management for leasehold properties",
      features: [
        "Charge calculation by unit",
        "Budget planning",
        "Actual vs budget tracking",
        "Reserve fund management",
        "Section 20 compliance",
        "Invoice generation"
      ],
      useCases: [
        "Calculate service charges",
        "Plan annual budget",
        "Manage reserve funds",
        "Issue service charge demands"
      ],
      suggestions: [
        "Calculate charges",
        "View budget",
        "Track spending",
        "Generate invoices"
      ]
    },

    "ground-rent": {
      name: "Ground Rent",
      route: "/ground-rent",
      description: "Ground rent collection and leasehold management",
      features: [
        "Ground rent demand generation",
        "Payment tracking",
        "Lease term monitoring",
        "Arrears management"
      ],
      useCases: [
        "Collect ground rent",
        "Track payments",
        "Manage leasehold obligations"
      ],
      suggestions: [
        "Generate demands",
        "View payments",
        "Check arrears"
      ]
    },

    banking: {
      name: "Banking",
      route: "/banking",
      description: "Bank account management and transaction reconciliation",
      features: [
        "Bank account linking",
        "Transaction import",
        "Automated reconciliation",
        "Client money protection",
        "Bank statement generation"
      ],
      useCases: [
        "Reconcile transactions",
        "Import bank statements",
        "Monitor client accounts"
      ],
      suggestions: [
        "Import transactions",
        "Reconcile account",
        "View statements"
      ]
    },

    expenses: {
      name: "Expenses",
      route: "/expenses",
      description: "Expense tracking and management",
      features: [
        "Expense categorization",
        "Receipt upload",
        "Approval workflows",
        "Cost allocation",
        "Tax tracking"
      ],
      useCases: [
        "Record expenses",
        "Approve costs",
        "Allocate to properties"
      ],
      suggestions: [
        "Add expense",
        "Upload receipt",
        "View by category"
      ]
    },

    crm: {
      name: "CRM",
      route: "/crm",
      description: "Customer relationship management for all interactions",
      features: [
        "Interaction logging",
        "Communication history",
        "Task management",
        "Follow-up reminders",
        "Relationship tracking"
      ],
      useCases: [
        "Log client interaction",
        "Schedule follow-ups",
        "Track communications"
      ],
      suggestions: [
        "Log interaction",
        "View history",
        "Create task"
      ]
    },

    workflows: {
      name: "Workflows",
      route: "/workflows",
      description: "AI-powered workflow automation engine",
      features: [
        "Visual workflow builder",
        "Trigger-based automation",
        "AI decision making",
        "Task automation",
        "Integration hub",
        "Execution monitoring",
        "Pending execution management"
      ],
      useCases: [
        "Automate repetitive tasks",
        "Create approval workflows",
        "Set up notification rules",
        "Integrate with external systems"
      ],
      suggestions: [
        "Create new workflow",
        "View automation rules",
        "Set up triggers",
        "Monitor workflow execution"
      ]
    },

    "document-templates": {
      name: "Document Templates",
      route: "/document-templates",
      description: "Template library and document generation",
      features: [
        "Template creation and management",
        "AI document generation",
        "Bulk document creation",
        "Template variables",
        "Version control"
      ],
      useCases: [
        "Create tenancy agreements",
        "Generate compliance documents",
        "Produce letters",
        "Batch document generation"
      ],
      suggestions: [
        "Create template",
        "Generate document",
        "Bulk generate",
        "Upload template"
      ]
    },

    "financial-reporting": {
      name: "Financial Reporting",
      route: "/financial-reporting",
      description: "Comprehensive financial reports and analytics",
      features: [
        "Profit & Loss statements",
        "Balance sheets",
        "Cash flow reports",
        "Service charge statements",
        "Tax summaries",
        "Custom report builder"
      ],
      useCases: [
        "Generate monthly statements",
        "Prepare year-end accounts",
        "Report to stakeholders",
        "Tax planning"
      ],
      suggestions: [
        "View P&L",
        "Generate statements",
        "Export reports",
        "Create custom report"
      ]
    },

    "out-of-hours": {
      name: "Out of Hours",
      route: "/out-of-hours",
      description: "24/7 virtual call handling and emergency response",
      features: [
        "Virtual call center",
        "Emergency triage",
        "Contractor dispatch",
        "Case management",
        "Service tier configuration",
        "Call validation",
        "Communication threading",
        "Accessibility flags",
        "Phone number detection"
      ],
      useCases: [
        "Handle emergency calls",
        "Dispatch contractors",
        "Manage out-of-hours cases",
        "Configure service levels"
      ],
      suggestions: [
        "Configure call handling",
        "View emergency calls",
        "Dispatch contractor",
        "Review service tier",
        "Check case history"
      ]
    },

    integrations: {
      name: "Integrations",
      route: "/integrations",
      description: "Third-party integrations and API connections",
      features: [
        "Companies House API",
        "Land Registry",
        "Stripe payments",
        "QuickBooks/Xero sync",
        "Property portals",
        "SMS notifications",
        "Email integration"
      ],
      useCases: [
        "Connect external services",
        "Sync accounting software",
        "Enable payment processing",
        "Automate communications"
      ],
      suggestions: [
        "View integrations",
        "Configure API",
        "Test connection"
      ]
    }
  },

  commonTasks: [
    { task: "Add a new property", module: "properties", action: "/properties" },
    { task: "Create a sales listing", module: "sales", action: "/sales" },
    { task: "Process rent payment", module: "financials", action: "/financials" },
    { task: "Upload compliance certificate", module: "compliance", action: "/compliance" },
    { task: "Create maintenance request", module: "maintenance", action: "/maintenance" },
    { task: "Generate tenancy agreement", module: "document-templates", action: "/document-templates" },
    { task: "View financial reports", module: "financial-reporting", action: "/financial-reporting" },
    { task: "Schedule property viewing", module: "sales", action: "/viewings" },
    { task: "Add new tenant", module: "tenants", action: "/tenants" },
    { task: "Set up workflow automation", module: "workflows", action: "/workflows" },
    { task: "Configure out of hours", module: "out-of-hours", action: "/out-of-hours" },
    { task: "Reconcile bank transactions", module: "banking", action: "/banking" }
  ],

  faqs: [
    {
      question: "How do I add a new property?",
      answer: "Go to Properties module, click 'Add Property', fill in the address and details, then save. You can add multiple units to the property afterwards.",
      relatedModules: ["properties", "units"]
    },
    {
      question: "How do I generate a property valuation?",
      answer: "Navigate to Sales module, select a property listing, and click 'Valuation'. Our AI will analyze comparable sales and rental data to provide a comprehensive valuation.",
      relatedModules: ["sales"]
    },
    {
      question: "How do I process rent payments?",
      answer: "Go to Financials module, select the tenant or property, and click 'Process Payment'. You can set up recurring payments via Stripe for automated collection.",
      relatedModules: ["financials", "banking"]
    },
    {
      question: "How do I track compliance certificates?",
      answer: "Visit the Compliance module to view all certificates, upload new ones, and see expiry dates. You'll get automatic alerts for upcoming renewals.",
      relatedModules: ["compliance"]
    },
    {
      question: "How do I create a maintenance request?",
      answer: "Go to Maintenance module, click 'New Request', describe the issue, set priority, and assign a contractor. Track progress through completion.",
      relatedModules: ["maintenance"]
    },
    {
      question: "Can I automate document generation?",
      answer: "Yes! Use the Document Templates module to create templates, then generate documents individually or in bulk using the AI document engine.",
      relatedModules: ["document-templates", "workflows"]
    },
    {
      question: "How do I set up workflows?",
      answer: "Navigate to Workflows module, click 'Create Workflow', define triggers and actions. The AI assistant can help suggest automation rules based on your processes.",
      relatedModules: ["workflows"]
    },
    {
      question: "What is the Out of Hours service?",
      answer: "Out of Hours provides 24/7 virtual call handling for emergencies. Configure service tiers, set up contractor dispatch, and manage emergency calls automatically.",
      relatedModules: ["out-of-hours", "maintenance"]
    },
    {
      question: "How do I view financial reports?",
      answer: "Go to Financial Reporting module to access P&L statements, balance sheets, service charge reports, and custom financial analytics.",
      relatedModules: ["financial-reporting", "financials"]
    },
    {
      question: "How do I manage sales leads?",
      answer: "Use the Sales module to create leads, track their status, score them automatically, and manage the entire sales pipeline from inquiry to completion.",
      relatedModules: ["sales"]
    }
  ],

  gettingStarted: [
    {
      step: 1,
      title: "Set up your companies",
      description: "Add your management companies and link them to Companies House",
      action: "/companies"
    },
    {
      step: 2,
      title: "Add properties",
      description: "Create property profiles with addresses and unit breakdowns",
      action: "/properties"
    },
    {
      step: 3,
      title: "Configure contacts",
      description: "Add directors, contractors, and other key contacts",
      action: "/contacts"
    },
    {
      step: 4,
      title: "Set up financials",
      description: "Configure bank accounts, service charges, and payment methods",
      action: "/financials"
    },
    {
      step: 5,
      title: "Upload compliance documents",
      description: "Add safety certificates and set up expiry tracking",
      action: "/compliance"
    },
    {
      step: 6,
      title: "Create workflows",
      description: "Automate common processes with the workflow engine",
      action: "/workflows"
    }
  ]
};

// Helper functions
export function getModuleByRoute(route) {
  const moduleName = route.replace('/', '').toLowerCase();
  return APP_KNOWLEDGE.modules[moduleName] || APP_KNOWLEDGE.modules.dashboard;
}

export function searchKnowledge(query) {
  const lowerQuery = query.toLowerCase();
  
  // Search modules
  const matchingModules = Object.values(APP_KNOWLEDGE.modules).filter(mod => 
    mod.name.toLowerCase().includes(lowerQuery) ||
    mod.description.toLowerCase().includes(lowerQuery) ||
    mod.features.some(f => f.toLowerCase().includes(lowerQuery))
  );

  // Search FAQs
  const matchingFaqs = APP_KNOWLEDGE.faqs.filter(faq =>
    faq.question.toLowerCase().includes(lowerQuery) ||
    faq.answer.toLowerCase().includes(lowerQuery)
  );

  // Search common tasks
  const matchingTasks = APP_KNOWLEDGE.commonTasks.filter(task =>
    task.task.toLowerCase().includes(lowerQuery)
  );

  return {
    modules: matchingModules,
    faqs: matchingFaqs,
    tasks: matchingTasks
  };
}