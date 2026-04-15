/**
 * runAllRelationshipSeeders.js
 *
 * Master orchestrator — runs all relationship intelligence seeders in sequence
 * and then runs the COI auto-detection engine.
 *
 * Scenarios seeded:
  *   - Reed Close, Farnworth (RTM + self-dealing letting agent)
  *   - Offshore Freehold (Adriatic Land / Long Harbour)
  *   - Service Charge Vehicle (Meridian composite)
  *   - Nominee Director Web (Duport Director Ltd)
  *   - Sean Powell Major Works (£723k slashed to £158k)
  *   - Tchenguiz Ground Rent Empire (3000+ freeholds, 130k leaseholders)
 *
 * After seeding, runs detectConflictsOfInterest in 'fix' mode to auto-flag all COIs.
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
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Rate limit: 1 full seeding per hour per user
    checkRateLimit(user.email, 1, 3600000);

    const db = base44.asServiceRole;
  const results = {};

  const seeders = [
    'seedReedCloseFarnworth',
    'seedOffshoreFreeholdScenario',
    'seedServiceChargeVehicleScenario',
    'seedNomineeDirectorScenario',
    'seedSeanPowellMajorWorksScenario',
    'seedTchenguizGroundRentEmpire',
  ];

  for (const fn of seeders) {
    try {
      console.log(`[runAllSeeders] Running ${fn}...`);
      const res = await db.functions.invoke(fn, {});
      results[fn] = {
        success: res.success,
        summary: res.summary,
        errors: res.detail?.errors || [],
      };
      console.log(`[runAllSeeders] ${fn} complete: ${JSON.stringify(res.summary)}`);
    } catch (e) {
      results[fn] = { success: false, error: e.message };
      console.error(`[runAllSeeders] ${fn} failed: ${e.message}`);
    }
  }

  // Run COI detection in fix mode
  try {
    console.log('[runAllSeeders] Running COI detection...');
    const coiRes = await db.functions.invoke('detectConflictsOfInterest', {
      action: 'fix',
      dry_run: false,
    });
    results['detectConflictsOfInterest'] = {
      success: true,
      total_findings: coiRes.scan_stats?.total_findings,
      by_severity: coiRes.scan_stats?.by_severity,
      by_pattern: coiRes.scan_stats?.by_pattern,
      updates_applied: coiRes.scan_stats?.updates_applied,
    };
  } catch (e) {
    results['detectConflictsOfInterest'] = { success: false, error: e.message };
  }

  const totalErrors = Object.values(results)
    .flatMap(r => r.errors || []).length;

  return Response.json({
    success: totalErrors === 0,
    message: 'All relationship intelligence scenarios seeded and COI detection complete.',
    results,
    total_errors: totalErrors,
  });
  } catch (error) {
    console.error('Error in runAllRelationshipSeeders:', error);
    const statusCode = error.status || 500;
    return Response.json(
      { error: error.message || 'Failed to seed relationships', ...(statusCode === 429 && { retryAfter: error.retryAfter }) },
      { status: statusCode }
    );
  }
});