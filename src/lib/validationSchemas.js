import { z } from 'zod';

/**
 * Validation schemas for backend functions
 * All API inputs must pass through these schemas before processing
 */

export const AddRelationshipSchema = z.object({
  from_entity_id: z.string().min(1, 'Source entity ID required'),
  from_entity_type: z.enum(['person', 'company', 'property', 'unit']),
  from_label: z.string().min(1).max(255),
  to_entity_id: z.string().min(1, 'Target entity ID required'),
  to_entity_type: z.enum(['person', 'company', 'property', 'unit']),
  to_label: z.string().min(1).max(255),
  relationship_type: z.enum([
    'director_of', 'psc_of', 'owns_freehold', 'holds_leasehold',
    'manages_block', 'collects_ground_rent', 'letting_agent_for',
    'rtm_company_for', 'tenant_of', 'beneficial_owner_of',
    'shareholder_of', 'secretary_of', 'service_charge_vehicle_for',
    'nominee_director_of', 'offshore_owner_of', 'ground_rent_fund_for'
  ]),
  conflict_of_interest: z.boolean().optional(),
  conflict_description: z.string().optional(),
  verified: z.boolean().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export const COIScanSchema = z.object({
  action: z.enum(['scan', 'fix']),
  dry_run: z.boolean().default(true),
});

export const MaintenanceOrderSchema = z.object({
  title: z.string().min(1, 'Title required').max(255),
  description: z.string().optional(),
  property_id: z.string().optional(),
  priority: z.enum(['emergency', 'urgent', 'standard', 'low']).default('standard'),
  status: z.enum(['reported', 'assigned', 'in_progress', 'completed', 'cancelled']).default('reported'),
  category: z.string().optional(),
  scheduled_date: z.string().optional(),
  estimated_cost: z.number().optional(),
  assigned_contractor_id: z.string().optional(),
});

export const SalesDemoDataSchema = z.object({
  dry_run: z.boolean().optional().default(false),
});

export const PropertySchema = z.object({
  name: z.string().min(1, 'Property name required').max(255),
  address_line_1: z.string().optional(),
  postcode: z.string().optional(),
  property_type: z.string().optional(),
  status: z.enum(['active', 'archived']).default('active'),
});

export const InspectionSchema = z.object({
  property_id: z.string().min(1, 'Property ID required'),
  inspection_type: z.enum(['general', 'routine', 'move_in', 'move_out', 'safety']),
  scheduled_date: z.string().min(1, 'Schedule date required'),
});

/**
 * Safe validation wrapper — returns { valid: boolean, data?: T, errors?: ZodError[] }
 */
export function safeValidate(schema, data) {
  try {
    const validated = schema.parse(data);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error.errors };
    }
    return { valid: false, errors: [{ message: 'Validation failed' }] };
  }
}