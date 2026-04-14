/**
 * Lead scoring rules and utilities
 * Centralized lead scoring logic for consistency across capture flows
 */

export const SCORE_THRESHOLDS = {
  HOT: 75,
  WARM: 55,
  COLD: 0,
};

export function calculateLeadScore(data) {
  let score = 50;

  // Portfolio size scoring
  if (data.portfolio_size?.includes('500+')) score += 20;
  else if (data.portfolio_size?.includes('151')) score += 15;
  else if (data.portfolio_size?.includes('51')) score += 10;

  // Pain points scoring
  if (data.pain_points && data.pain_points.length > 0) score += 5;

  // Software usage scoring
  if (data.current_software && !data.current_software.includes('Nothing')) score += 10;

  // Company intelligence scoring
  if (data.demo_intelligence?.officers?.length > 0) score += 5;
  if (data.demo_intelligence?.files_uploaded?.length > 0) score += 10;

  // Marketing consent scoring
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