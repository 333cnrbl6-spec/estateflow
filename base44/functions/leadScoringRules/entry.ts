/**
 * Lead scoring utilities (shared logic for captureMarketingLead)
 * Inlined into function since backends can't import from lib
 */

export const SCORE_THRESHOLDS = {
  HOT: 75,
  WARM: 55,
  COLD: 0,
};

export function calculateLeadScore(data) {
  let score = 50;
  if (data.portfolio_size?.includes('500+')) score += 20;
  else if (data.portfolio_size?.includes('151')) score += 15;
  else if (data.portfolio_size?.includes('51')) score += 10;
  if (data.pain_points && data.pain_points.length > 0) score += 5;
  if (data.current_software && !data.current_software.includes('Nothing')) score += 10;
  if (data.demo_intelligence?.officers?.length > 0) score += 5;
  if (data.demo_intelligence?.files_uploaded?.length > 0) score += 10;
  if (data.marketing_consent) score += 5;
  return Math.min(score, 100);
}

export function getPriorityTier(score) {
  if (score >= SCORE_THRESHOLDS.HOT) return 'hot';
  if (score >= SCORE_THRESHOLDS.WARM) return 'warm';
  return 'cold';
}

export function getTierEmoji(score) {
  if (score >= SCORE_THRESHOLDS.HOT) return '🔥';
  if (score >= SCORE_THRESHOLDS.WARM) return '⚡';
  return '❄';
}

export function getTierLabel(score) {
  if (score >= SCORE_THRESHOLDS.HOT) return 'HOT';
  if (score >= SCORE_THRESHOLDS.WARM) return 'WARM';
  return 'COLD';
}