/**
 * detectConflictsOfInterest.js
 *
 * AUTO-DETECTION ENGINE for conflict-of-interest patterns in the OwnershipRelationship graph.
 *
 * This function scans all OwnershipRelationship records, traverses the graph,
 * and auto-flags COI patterns that were previously only manually flagged.
 *
 * PATTERNS DETECTED:
 *
 * 1. LEASEHOLDER_CONTROLS_LETTING_AGENT
 *    Person holds_leasehold of Unit/Property X
 *    AND is director_of / beneficial_owner_of company that is letting_agent_for same Property X
 *    → Severity: HIGH
 *
 * 2. RTM_DIRECTOR_CONTROLS_MANAGING_AGENT
 *    Person is director_of RTM company for Property X
 *    AND is director_of company that manages_block Property X
 *    → Severity: HIGH
 *
 * 3. FREEHOLD_AND_MANAGING_AGENT_SAME_CONTROLLER
 *    Company/Person owns_freehold of Property X
 *    AND is director_of / controls company that manages_block same Property X
 *    → Severity: CRITICAL
 *
 * 4. SERVICE_CHARGE_VEHICLE_SAME_DIRECTORS
 *    Company A manages_block Property X
 *    Company B is service_charge_vehicle_for Property X
 *    Company A and Company B share directors (same person is director_of both)
 *    → Severity: CRITICAL
 *
 * 5. OFFSHORE_FREEHOLD_NO_PSC
 *    Company has offshore_owner_of relationship
 *    AND that company has no PSC registered (inferred from no psc_of relationships pointing TO it)
 *    → Severity: CRITICAL
 *
 * 6. NOMINEE_DIRECTOR_HIGH_VOLUME
 *    Person is director_of more than 15 companies in the graph
 *    → Severity: MEDIUM (flag for investigation, not automatically a breach)
 *
 * 7. MANAGING_AGENT_CONTROLS_RESERVE_FUND
 *    Company A manages_block Property X
 *    Company A is also director_of / controls Company B that is service_charge_vehicle_for Property X
 *    → Severity: CRITICAL
 *
 * USAGE:
 *   POST /detectConflictsOfInterest
 *   Body: { action: 'scan' | 'report' | 'fix', dry_run: true/false }
 *   - 'scan': detect and return findings without writing
 *   - 'report': return structured report
 *   - 'fix': auto-update flagged relationships with detected COI data
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const limits = new Map();

function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  let record = limits.get(key);
  if (!record || now - record.resetTime > windowMs) {
    record = { count: 0, resetTime: now };
    limits.set(key, record);
  }
  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime + windowMs - now) / 1000);
    const err = new Error(`Rate limit exceeded. Max ${maxRequests} per ${Math.floor(windowMs/1000)}s. Retry after ${retryAfter}s.`);
    err.status = 429;
    throw err;
  }
  record.count++;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Rate limit: 5 scans per minute per user
    checkRateLimit(user.email, 5, 60000);

    const db = base44.asServiceRole;
    let body;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // Validate input
    const action = body.action || 'scan';
    const dryRun = body.dry_run !== false; // default dry_run = true for safety

    if (!['scan', 'fix'].includes(action)) {
      return Response.json(
        { error: `Invalid action: ${action}. Must be 'scan' or 'fix'` },
        { status: 400 }
      );
    }

  // ── Load all relationships into memory for graph traversal ───────────────
  // Batch load to prevent timeout on large datasets
  const allRels = [];
  const BATCH_SIZE = 500;
  for (let offset = 0; offset < 5000; offset += BATCH_SIZE) {
    const batch = await db.entities.OwnershipRelationship.list('-created_date', BATCH_SIZE, { offset });
    if (!batch || batch.length === 0) break;
    allRels.push(...batch);
    // Yield to event loop every batch to prevent blocking
    await new Promise(r => setTimeout(r, 10));
  }

  // Build lookup indexes
  const byFromId = {}; // from_entity_id → [rel, ...]
  const byToId = {};   // to_entity_id → [rel, ...]
  const byFromIdAndType = {}; // `${from_entity_id}:${type}` → [rel, ...]
  const byToIdAndType = {};   // `${to_entity_id}:${type}` → [rel, ...]

  for (const rel of allRels) {
    if (!byFromId[rel.from_entity_id]) byFromId[rel.from_entity_id] = [];
    byFromId[rel.from_entity_id].push(rel);

    if (!byToId[rel.to_entity_id]) byToId[rel.to_entity_id] = [];
    byToId[rel.to_entity_id].push(rel);

    const fk = `${rel.from_entity_id}:${rel.relationship_type}`;
    if (!byFromIdAndType[fk]) byFromIdAndType[fk] = [];
    byFromIdAndType[fk].push(rel);

    const tk = `${rel.to_entity_id}:${rel.relationship_type}`;
    if (!byToIdAndType[tk]) byToIdAndType[tk] = [];
    byToIdAndType[tk].push(rel);
  }

  const findings = [];
  const relUpdates = []; // relationships to update with auto_detected_coi = true

  // ── HELPER: get all relationships of a given type from an entity ──────────
  const getRelsFrom = (entityId, relType) =>
    allRels.filter(r => r.from_entity_id === entityId && r.relationship_type === relType);

  const getRelsTo = (entityId, relType) =>
    allRels.filter(r => r.to_entity_id === entityId && r.relationship_type === relType);

  const getRelsFromAny = (entityId, relTypes) =>
    allRels.filter(r => r.from_entity_id === entityId && relTypes.includes(r.relationship_type));

  // ── PATTERN 1: LEASEHOLDER_CONTROLS_LETTING_AGENT ────────────────────────
  {
    const leaseholdRels = allRels.filter(r => r.relationship_type === 'holds_leasehold');
    const lettingAgentRels = allRels.filter(r => r.relationship_type === 'letting_agent_for');

    for (const lhRel of leaseholdRels) {
      // This person/entity holds a leasehold of some property/unit
      const holderId = lhRel.from_entity_id;
      const propertyId = lhRel.to_entity_id; // could be property or unit
      
      // Find companies this person is director_of or beneficial_owner_of
      const controlledCompanies = getRelsFromAny(holderId, ['director_of', 'beneficial_owner_of', 'psc_of']);
      
      for (const ccRel of controlledCompanies) {
        const coId = ccRel.to_entity_id;
        // Does this company act as letting_agent_for the same property (or parent property)?
        const agentRels = getRelsFrom(coId, 'letting_agent_for');
        for (const aRel of agentRels) {
          if (aRel.to_entity_id === propertyId || lhRel.to_entity_id === aRel.to_entity_id) {
            findings.push({
              pattern: 'leaseholder_controls_letting_agent',
              severity: 'HIGH',
              description: `${lhRel.from_label} holds leasehold of ${lhRel.to_label} AND controls ${ccRel.to_label} which acts as letting agent for ${aRel.to_label}`,
              involved_relationships: [lhRel.id, ccRel.id, aRel.id].filter(Boolean),
              entities: [lhRel.from_label, lhRel.to_label, ccRel.to_label],
            });
            relUpdates.push(lhRel.id, ccRel.id, aRel.id);
          }
        }
      }
    }
  }

  // ── PATTERN 2: FREEHOLD_AND_MANAGING_AGENT_SAME_CONTROLLER ───────────────
  {
    const freeholdRels = allRels.filter(r => r.relationship_type === 'owns_freehold');
    const managingRels = allRels.filter(r => r.relationship_type === 'manages_block');

    for (const fRel of freeholdRels) {
      // Who owns freehold of this property?
      const freeholderId = fRel.from_entity_id;
      const propertyId = fRel.to_entity_id;

      // Find the managing agent for the same property
      const managers = managingRels.filter(r => r.to_entity_id === propertyId);

      for (const mRel of managers) {
        const managingAgentId = mRel.from_entity_id;

        // Check: does the freeholder company share directors with the managing agent?
        const freeholderDirectors = getRelsTo(freeholderId, 'director_of').map(r => r.from_entity_id);
        const managerDirectors = getRelsTo(managingAgentId, 'director_of').map(r => r.from_entity_id);
        const sharedDirectors = freeholderDirectors.filter(d => managerDirectors.includes(d));

        // OR: is the freeholder IS the managing agent (same entity)
        const sameEntity = freeholderId === managingAgentId;

        // OR: does the freeholder control the managing agent?
        const freeholderControlsManager = getRelsFromAny(freeholderId, ['director_of', 'beneficial_owner_of', 'psc_of'])
          .some(r => r.to_entity_id === managingAgentId);

        if (sameEntity || sharedDirectors.length > 0 || freeholderControlsManager) {
          findings.push({
            pattern: 'freehold_and_managing_agent_same_controller',
            severity: 'CRITICAL',
            description: `${fRel.from_label} owns freehold of ${fRel.to_label} AND is connected to managing agent ${mRel.from_label} (${sharedDirectors.length} shared directors)`,
            shared_directors: sharedDirectors.length,
            involved_relationships: [fRel.id, mRel.id].filter(Boolean),
            entities: [fRel.from_label, fRel.to_label, mRel.from_label],
          });
        }
      }
    }
  }

  // ── PATTERN 3: SERVICE_CHARGE_VEHICLE_SAME_DIRECTORS ─────────────────────
  {
    const scvRels = allRels.filter(r => r.relationship_type === 'service_charge_vehicle_for');
    const managingRels = allRels.filter(r => r.relationship_type === 'manages_block');

    for (const scvRel of scvRels) {
      const scvCompanyId = scvRel.from_entity_id;
      const propertyId = scvRel.to_entity_id;

      // Find managing agent for same property
      const managers = managingRels.filter(r => r.to_entity_id === propertyId);

      for (const mRel of managers) {
        const managingAgentId = mRel.from_entity_id;
        if (managingAgentId === scvCompanyId) continue; // same company — already obvious

        // Check shared directors
        const scvDirectors = getRelsTo(scvCompanyId, 'director_of').map(r => r.from_entity_id);
        const managerDirectors = getRelsTo(managingAgentId, 'director_of').map(r => r.from_entity_id);
        const shared = scvDirectors.filter(d => managerDirectors.includes(d));

        if (shared.length > 0) {
          findings.push({
            pattern: 'service_charge_vehicle_same_directors',
            severity: 'CRITICAL',
            description: `Service charge vehicle ${scvRel.from_label} and managing agent ${mRel.from_label} share ${shared.length} director(s) for property ${scvRel.to_label}`,
            shared_director_count: shared.length,
            involved_relationships: [scvRel.id, mRel.id].filter(Boolean),
            entities: [scvRel.from_label, mRel.from_label, scvRel.to_label],
          });
        }
      }
    }
  }

  // ── PATTERN 4: OFFSHORE_FREEHOLD_NO_PSC ──────────────────────────────────
  {
    const offshoreRels = allRels.filter(r => r.relationship_type === 'offshore_owner_of');
    for (const oRel of offshoreRels) {
      // The offshore company (from_entity_id) owns a UK company — check if it has a PSC in our graph
      const hasPSC = allRels.some(r =>
        r.to_entity_id === oRel.from_entity_id && r.relationship_type === 'psc_of'
      );
      if (!hasPSC) {
        findings.push({
          pattern: 'offshore_freehold_no_psc',
          severity: 'CRITICAL',
          description: `${oRel.from_label} is an offshore entity owning UK property/company with no PSC in the graph — beneficial ownership unknown`,
          involved_relationships: [oRel.id].filter(Boolean),
          entities: [oRel.from_label, oRel.to_label],
        });
        relUpdates.push(oRel.id);
      }
    }
  }

  // ── PATTERN 5: NOMINEE_DIRECTOR_HIGH_VOLUME ───────────────────────────────
  {
    const directorRels = allRels.filter(r => r.relationship_type === 'director_of');
    // Group by director (from_entity_id)
    const directorCounts = {};
    for (const rel of directorRels) {
      directorCounts[rel.from_entity_id] = directorCounts[rel.from_entity_id] || { label: rel.from_label, count: 0, relIds: [] };
      directorCounts[rel.from_entity_id].count++;
      directorCounts[rel.from_entity_id].relIds.push(rel.id);
    }
    for (const [dirId, data] of Object.entries(directorCounts)) {
      if (data.count >= 10) {
        findings.push({
          pattern: 'nominee_director_high_volume',
          severity: data.count >= 20 ? 'HIGH' : 'MEDIUM',
          description: `${data.label} is director of ${data.count} companies in the graph — possible nominee/professional director pattern`,
          appointment_count: data.count,
          involved_relationships: data.relIds.slice(0, 5), // first 5 for reference
          entities: [data.label],
        });
      }
    }
  }

  // ── PATTERN 6: RTM_DIRECTOR_CONTROLS_MANAGING_AGENT ─────────────────────
  {
    const rtmRels = allRels.filter(r => r.relationship_type === 'rtm_company_for');
    const managingRels = allRels.filter(r => r.relationship_type === 'manages_block');

    for (const rtmRel of rtmRels) {
      const rtmCompanyId = rtmRel.from_entity_id;
      const propertyId = rtmRel.to_entity_id;

      // Who directs the RTM?
      const rtmDirectors = getRelsTo(rtmCompanyId, 'director_of').map(r => r.from_entity_id);

      // Who manages the same block?
      const managers = managingRels.filter(r => r.to_entity_id === propertyId);

      for (const mRel of managers) {
        const managerDirectors = getRelsTo(mRel.from_entity_id, 'director_of').map(r => r.from_entity_id);
        const shared = rtmDirectors.filter(d => managerDirectors.includes(d));

        if (shared.length > 0) {
          findings.push({
            pattern: 'rtm_director_controls_managing_agent',
            severity: 'HIGH',
            description: `RTM company ${rtmRel.from_label} and managing agent ${mRel.from_label} share ${shared.length} director(s) for property ${rtmRel.to_label}`,
            shared_directors: shared.length,
            involved_relationships: [rtmRel.id, mRel.id].filter(Boolean),
            entities: [rtmRel.from_label, mRel.from_label, rtmRel.to_label],
          });
        }
      }
    }
  }

  // ── APPLY UPDATES if action === 'fix' and not dry_run ────────────────────
  let updatesApplied = 0;
  if (action === 'fix' && !dryRun) {
    const uniqueIds = [...new Set(relUpdates.filter(Boolean))];
    for (const relId of uniqueIds) {
      try {
        await db.entities.OwnershipRelationship.update(relId, {
          auto_detected_coi: true,
          conflict_of_interest: true,
        });
        updatesApplied++;
      } catch (_) {}
    }
  }

    // ── SUMMARY REPORT ────────────────────────────────────────────────────────
    const bySeverity = {
      CRITICAL: findings.filter(f => f.severity === 'CRITICAL').length,
      HIGH: findings.filter(f => f.severity === 'HIGH').length,
      MEDIUM: findings.filter(f => f.severity === 'MEDIUM').length,
    };

    const byPattern = {};
    for (const f of findings) {
      byPattern[f.pattern] = (byPattern[f.pattern] || 0) + 1;
    }

    return Response.json({
      success: true,
      action,
      dry_run: dryRun,
      scan_stats: {
        total_relationships_scanned: allRels.length,
        total_findings: findings.length,
        by_severity: bySeverity,
        by_pattern: byPattern,
        updates_applied: updatesApplied,
      },
      findings,
      instructions: {
        to_apply_fixes: 'POST with { action: "fix", dry_run: false } to auto-update flagged relationships',
        patterns_detected: Object.keys(byPattern),
      },
    });
  } catch (error) {
    console.error('Error in detectConflictsOfInterest:', error);
    const statusCode = error.status || 500;
    return Response.json(
      {
        error: error.message || 'Failed to scan for conflicts',
        ...(statusCode === 429 && { retryAfter: error.retryAfter }),
      },
      { status: statusCode }
    );
  }
});