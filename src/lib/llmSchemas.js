/**
 * LLM response schemas for onboarding flows
 * Centralized schema definitions to avoid duplication and ensure consistency
 */

export const SCHEMAS = {
  companiesHouseSearch: {
    type: 'object',
    properties: {
      results: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            company_name: { type: 'string' },
            company_number: { type: 'string' },
            status: { type: 'string' },
            registered_address: { type: 'string' },
            incorporation_date: { type: 'string' },
          },
        },
      },
    },
  },

  fetchDirectors: {
    type: 'object',
    properties: {
      directors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            role: { type: 'string' },
            appointed_date: { type: 'string' },
          },
        },
      },
    },
  },

  findAssociatedCompanies: {
    type: 'object',
    properties: {
      associated: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            company_name: { type: 'string' },
            company_number: { type: 'string' },
          },
        },
      },
    },
  },

  businessProfile: {
    type: 'object',
    properties: {
      services: { type: 'array', items: { type: 'string' } },
      portfolio_estimate: { type: 'string' },
      locations: { type: 'array', items: { type: 'string' } },
      tech_stack: { type: 'array', items: { type: 'string' } },
      reputation: { type: 'string' },
    },
  },

  complianceStatus: {
    type: 'object',
    properties: {
      fca_regulated: { type: 'boolean' },
      redress_scheme: { type: 'string' },
      client_money_protection: { type: 'boolean' },
      gdpr_status: { type: 'string' },
    },
  },

  dataProfilePrediction: {
    type: 'object',
    properties: {
      estimated_properties: { type: 'number' },
      estimated_tenants: { type: 'number' },
      financial_period: { type: 'string' },
      likely_storage: { type: 'array', items: { type: 'string' } },
      import_complexity: { type: 'string' },
      estimated_hours: { type: 'number' },
    },
  },

  environmentSummary: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      next_steps: { type: 'array', items: { type: 'string' } },
    },
  },
};