/**
 * usePerformanceTracking — Hook to auto-track query and function call timings
 */

import { useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export function usePerformanceTracking() {
  const performanceObserverRef = useRef(null);

  // Record a custom metric
  const recordMetric = async (metricType, name, durationMs, status = 'success', metadata = {}) => {
    try {
      await base44.functions.invoke('recordPerformanceMetric', {
        metric_type: metricType,
        name,
        duration_ms: durationMs,
        status,
        metadata,
      });
    } catch (err) {
      console.warn('[Perf Track] Failed to record metric:', err);
    }
  };

  // Track wrapped function call
  const trackFunction = async (functionName, fn) => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = Math.round(performance.now() - start);
      await recordMetric('function_call', functionName, duration, 'success');
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      await recordMetric('function_call', functionName, duration, 'error', {
        error: error.message,
      });
      throw error;
    }
  };

  // Auto-track page load
  useEffect(() => {
    const onPageLoad = () => {
      if (typeof window.performance !== 'undefined') {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;

        if (pageLoadTime > 0) {
          recordMetric(
            'page_load',
            window.location.pathname,
            pageLoadTime,
            'success',
            {
              dns: perfData.domainLookupEnd - perfData.domainLookupStart,
              tcp: perfData.connectEnd - perfData.connectStart,
              ttfb: perfData.responseStart - perfData.navigationStart,
              dom_interactive: perfData.domInteractive - perfData.navigationStart,
            }
          );
        }
      }
    };

    if (document.readyState === 'complete') {
      onPageLoad();
    } else {
      window.addEventListener('load', onPageLoad);
      return () => window.removeEventListener('load', onPageLoad);
    }
  }, []);

  return { recordMetric, trackFunction };
}