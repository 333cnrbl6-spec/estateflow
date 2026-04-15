import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const InspectionSchema = z.object({
  property_id: z.string().min(1, 'Property ID required'),
  unit_id: z.string().optional(),
  inspection_type: z.enum(['general', 'routine', 'move_in', 'move_out', 'safety']).default('general'),
  scheduled_date: z.string().min(1, 'Scheduled date required'),
  recurrence: z.enum(['once', 'recurring']).optional().default('once'),
  recurrence_interval: z.number().positive().optional(),
  recurrence_unit: z.enum(['weeks', 'months', 'years']).optional(),
  notes: z.string().optional(),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Validate input
    const validation = InspectionSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return Response.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { property_id, unit_id, inspection_type, scheduled_date, recurrence, recurrence_interval, recurrence_unit, notes } = validation.data;

    const inspections = [];

    // Create initial inspection
    const inspection = await base44.asServiceRole.entities.InspectionRecord.create({
      property_id,
      unit_id: unit_id || null,
      inspection_type,
      scheduled_date,
      status: 'scheduled',
      created_by: user.email,
      notes
    });

    inspections.push(inspection);
    console.log(`[Schedule Inspection] Created inspection ${inspection.id}`);

    // Trigger notification
    await base44.functions.invoke('notifyTenantOfInspection', {
      inspection_id: inspection.id
    });

    // Handle recurring inspections
    if (recurrence === 'recurring') {
      let currentDate = new Date(scheduled_date);
      const maxRecurrences = 12; // Limit to 12 future occurrences

      for (let i = 0; i < maxRecurrences; i++) {
        // Calculate next date based on recurrence
        if (recurrence_unit === 'weeks') {
          currentDate.setDate(currentDate.getDate() + (7 * recurrence_interval));
        } else if (recurrence_unit === 'months') {
          currentDate.setMonth(currentDate.getMonth() + recurrence_interval);
        } else if (recurrence_unit === 'years') {
          currentDate.setFullYear(currentDate.getFullYear() + recurrence_interval);
        }

        // Stop if date is too far in future
        if (currentDate.getFullYear() > new Date().getFullYear() + 2) break;

        const nextInspection = await base44.asServiceRole.entities.InspectionRecord.create({
          property_id,
          unit_id: unit_id || null,
          inspection_type,
          scheduled_date: currentDate.toISOString().split('T')[0],
          status: 'scheduled',
          created_by: user.email,
          recurrence_parent_id: inspection.id,
          notes
        });

        inspections.push(nextInspection);
        console.log(`[Schedule Inspection] Created recurring inspection ${nextInspection.id}`);
      }
    }

    return Response.json({
      success: true,
      inspection_id: inspection.id,
      total_scheduled: inspections.length
    });
  } catch (error) {
    console.error('[Schedule Inspection] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});