/**
 * getPerformanceStats — Aggregate performance metrics for dashboard
 * Returns p50, p95, p99 latencies and error rates by metric type
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch last 1000 metrics
    const metrics = await base44.asServiceRole.entities.PerformanceMetric.list('-recorded_at', 1000);

    // Group by metric type
    const grouped = {};
    metrics.forEach(m => {
      if (!grouped[m.metric_type]) {
        grouped[m.metric_type] = {
          durations: [],
          statuses: { success: 0, error: 0, timeout: 0 },
          total: 0,
        };
      }
      grouped[m.metric_type].durations.push(m.duration_ms);
      grouped[m.metric_type].statuses[m.status] = (grouped[m.metric_type].statuses[m.status] || 0) + 1;
      grouped[m.metric_type].total += 1;
    });

    // Calculate percentiles
    const calculatePercentile = (arr, p) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const idx = Math.ceil(sorted.length * (p / 100)) - 1;
      return sorted[Math.max(0, idx)] || 0;
    };

    const stats = {};
    Object.entries(grouped).forEach(([type, data]) => {
      const durations = data.durations;
      stats[type] = {
        total_operations: data.total,
        p50: calculatePercentile(durations, 50),
        p95: calculatePercentile(durations, 95),
        p99: calculatePercentile(durations, 99),
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        error_rate: ((data.statuses.error + data.statuses.timeout) / data.total * 100).toFixed(2),
        success_count: data.statuses.success,
      };
    });

    // Slowest operations
    const slowest = metrics
      .filter(m => m.status === 'success')
      .sort((a, b) => b.duration_ms - a.duration_ms)
      .slice(0, 10)
      .map(m => ({
        name: m.name,
        duration_ms: m.duration_ms,
        entity: m.entity_name,
        operation: m.operation,
      }));

    // Error summary
    const errors = metrics
      .filter(m => m.status === 'error')
      .slice(0, 10)
      .map(m => ({
        name: m.name,
        error: m.error_message,
        recorded_at: m.recorded_at,
      }));

    return Response.json({
      stats,
      slowest,
      errors,
      total_metrics: metrics.length,
      time_period: '1000 most recent',
    });
  } catch (error) {
    console.error('[Performance Stats Error]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});