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
 *
 * After seeding, runs detectConflictsOfInterest in 'fix' mode to auto-flag all COIs.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const db = base44.asServiceRole;
  const results = {};

  const seeders = [
    'seedReedCloseFarnworth',
    'seedOffshoreFreeholdScenario',
    'seedServiceChargeVehicleScenario',
    'seedNomineeDirectorScenario',
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
});