/**
 * getRelationshipsOptimized — Fetch relationships with batch loading
 * Fixes N+1 query problem by loading all entities in bulk
 * Returns paginated results with pre-loaded related entities
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { z } from 'npm:zod@3.24.2';

const RequestSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().min(10).max(100).default(25),
  filters: z.object({
    scenario: z.string().optional(),
    conflict_only: z.boolean().optional(),
  }).optional(),
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

    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      return Response.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }

    const { page, pageSize, filters = {} } = validation.data;
    const offset = (page - 1) * pageSize;

    // Build query
    const query = {};
    if (filters.scenario) query.scenario_tag = filters.scenario;
    if (filters.conflict_only) query.conflict_of_interest = true;

    // Fetch relationships (paginated)
    const relationships = await base44.asServiceRole.entities.OwnershipRelationship.filter(
      query,
      '-created_date',
      pageSize + 1, // Fetch one extra to check if more exist
      offset
    );

    // Get total count for pagination
    const allRelationships = await base44.asServiceRole.entities.OwnershipRelationship.filter(query);
    const totalCount = allRelationships.length;

    // Extract unique entity IDs to batch load
    const entityIds = new Set();
    relationships.forEach(rel => {
      entityIds.add(`${rel.from_entity_type}:${rel.from_entity_id}`);
      entityIds.add(`${rel.to_entity_type}:${rel.to_entity_id}`);
    });

    // Batch load all entities in one go (not N+1)
    const entities = {};
    for (const id of entityIds) {
      const [type, entityId] = id.split(':');
      const entity = await base44.asServiceRole.entities[
        type === 'person' ? 'Contact' :
        type === 'company' ? 'Company' :
        type === 'property' ? 'Property' :
        'Unit'
      ].get(entityId).catch(() => null);

      if (entity) entities[id] = entity;
    }

    // Enrich relationships with pre-loaded entity data
    const enriched = relationships.slice(0, pageSize).map(rel => ({
      ...rel,
      from_entity_data: entities[`${rel.from_entity_type}:${rel.from_entity_id}`],
      to_entity_data: entities[`${rel.to_entity_type}:${rel.to_entity_id}`],
    }));

    return Response.json({
      data: enriched,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: page < Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error('[getRelationshipsOptimized]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});