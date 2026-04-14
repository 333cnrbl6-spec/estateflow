/**
 * Data Validation & Quality Scoring System
 */

// ─── Form Validation Rules ────────────────────────────────────────────────

export const validateCompanyName = (name) => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Company name is required' };
  }
  if (name.length < 2) {
    return { valid: false, error: 'Company name must be at least 2 characters' };
  }
  if (name.length > 160) {
    return { valid: false, error: 'Company name must be under 160 characters' };
  }
  return { valid: true };
};

export const validateCompanyNumber = (number) => {
  if (!number || number.trim().length === 0) {
    return { valid: true }; // Optional field
  }
  const cleaned = number.replace(/\D/g, '');
  if (cleaned.length !== 8) {
    return { valid: false, error: 'Company number must be 8 digits (e.g., 12345678)' };
  }
  return { valid: true, cleaned };
};

export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return { valid: true }; // Optional field
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
};

// ─── Data Quality Scoring ────────────────────────────────────────────────

/**
 * Score CompaniesHouseProfile data completeness & accuracy
 * Returns 0-100 score with breakdown
 */
export const scoreDataQuality = (profile) => {
  if (!profile) return { score: 0, breakdown: {}, issues: ['No data'] };

  const metrics = {
    basicInfo: 0,
    directors: 0,
    filings: 0,
    compliance: 0,
    psControl: 0,
  };

  const issues = [];
  let totalWeight = 0;

  // Basic company info (20%)
  if (profile.company_name && profile.company_status && profile.incorporation_date) {
    metrics.basicInfo = 100;
  } else if (profile.company_name) {
    metrics.basicInfo = 50;
    if (!profile.company_status) issues.push('Missing company status');
  } else {
    issues.push('Missing basic company information');
  }
  totalWeight += 20;

  // Directors/officers (25%)
  if (profile.directors && profile.directors.length > 0) {
    const currentDirectors = profile.directors.filter(d => !d.resigned_on);
    if (currentDirectors.length > 0) {
      metrics.directors = 100;
    } else {
      metrics.directors = 50;
      issues.push('No current directors found');
    }
  } else {
    metrics.directors = 0;
    issues.push('No director information');
  }
  totalWeight += 25;

  // Filing deadlines (20%)
  if (profile.accounts_filing_due || profile.confirmation_statement_due) {
    if (profile.accounts_filing_due && profile.confirmation_statement_due) {
      metrics.filings = 100;
    } else {
      metrics.filings = 70;
      if (!profile.accounts_filing_due) issues.push('Missing accounts filing due date');
      if (!profile.confirmation_statement_due) issues.push('Missing confirmation statement due date');
    }
  } else {
    metrics.filings = 20;
    issues.push('Missing filing deadline information');
  }
  totalWeight += 20;

  // Compliance status (20%)
  if (profile.company_status === 'active') {
    metrics.compliance = 100;
  } else if (profile.company_status === 'dissolved' || profile.company_status === 'liquidation') {
    metrics.compliance = 0;
    issues.push(`Company status is ${profile.company_status}`);
  } else {
    metrics.compliance = 50;
    issues.push(`Company status is ${profile.company_status || 'unknown'}`);
  }
  totalWeight += 20;

  // PSC data (15%) - nice to have
  if (profile.persons_with_significant_control && profile.persons_with_significant_control.length > 0) {
    metrics.psControl = 100;
  } else {
    metrics.psControl = 30;
    if (!profile.persons_with_significant_control) issues.push('Missing PSC information');
  }
  totalWeight += 15;

  // Calculate weighted score
  const score = Math.round(
    (metrics.basicInfo * 0.2 +
     metrics.directors * 0.25 +
     metrics.filings * 0.2 +
     metrics.compliance * 0.2 +
     metrics.psControl * 0.15) / totalWeight * 100
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: metrics,
    issues,
    timestamp: new Date().toISOString()
  };
};

// ─── Quality Status Helper ────────────────────────────────────────────────

export const getQualityStatus = (score) => {
  if (score >= 85) return { status: 'excellent', color: 'green', label: 'Excellent' };
  if (score >= 70) return { status: 'good', color: 'blue', label: 'Good' };
  if (score >= 50) return { status: 'fair', color: 'amber', label: 'Fair' };
  if (score >= 30) return { status: 'poor', color: 'orange', label: 'Poor' };
  return { status: 'critical', color: 'red', label: 'Critical' };
};

// ─── Bulk validation ─────────────────────────────────────────────────────

export const validateFormData = (data) => {
  const errors = {};

  const nameValidation = validateCompanyName(data.company_name);
  if (!nameValidation.valid) errors.company_name = nameValidation.error;

  const numberValidation = validateCompanyNumber(data.company_number);
  if (!numberValidation.valid) errors.company_number = numberValidation.error;

  if (data.team_email) {
    const emailValidation = validateEmail(data.team_email);
    if (!emailValidation.valid) errors.team_email = emailValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};