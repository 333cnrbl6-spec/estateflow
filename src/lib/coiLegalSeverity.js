/**
 * coiLegalSeverity.js
 *
 * Comprehensive UK Legal Severity Reference for Conflict of Interest Patterns
 * Covering: Property Law England & Wales, Company Law, Local Government, Leasehold Reform
 *
 * Research basis:
 * - Landlord and Tenant Act 1985 (ss.18-30 service charges)
 * - Commonhold and Leasehold Reform Act 2002 (RTM)
 * - Leasehold and Freehold Reform Act 2024
 * - Economic Crime (Transparency and Enforcement) Act 2022
 * - Companies Act 2006 (PSC, nominee directors, fiduciary duty)
 * - Housing Act 2004 (licensing, HMO)
 * - RICS Service Charge Residential Management Code (4th ed.)
 * - Common law: fiduciary duty, breach of agency (Foxtons v leaseholders precedent)
 * - First-tier Tribunal (Property Chamber) enforcement powers
 * - Renters' Rights Act 2025
 */

export const COI_LEGAL_SEVERITY = {

  // ─────────────────────────────────────────────────────────────────────────
  leaseholder_controls_letting_agent: {
    pattern_name: 'Leaseholder Controls Letting Agent',
    severity: 'HIGH',
    risk_score_range: [55, 75],
    headline: 'Fiduciary duty breach — agent acting against principal interest',
    summary: 'Where a leaseholder also controls or owns the letting agent acting on their behalf or on other leaseholders\' behalf, a conflict of interest arises under agency law. The agent owes a fiduciary duty of undivided loyalty to the landlord/leaseholder client — any undisclosed profit or dual role breaches this duty.',

    legal_basis: [
      {
        legislation: 'Common Law — Fiduciary Duty',
        jurisdiction: 'England & Wales',
        detail: 'Letting agents owe fiduciary duties including (1) a duty not to make any profit or income from the agency relationship without the landlord\'s fully informed consent, and (2) a duty of loyalty — the agent must not let their interests conflict with those of the landlord without fully informed consent. (Confirmed: Leigh Day v Foxtons — group action re undisclosed contractor commissions of 25-33%.)',
        consequence: 'Agent may be ordered to: repay all undisclosed commissions and fees; repay inflated contractor charges vs market rate; forfeit primary agreed fees if breach is serious.',
        severity: 'HIGH',
      },
      {
        legislation: 'Consumer Rights Act 2015',
        jurisdiction: 'England & Wales',
        detail: 'Letting agents must publish a full list of fees and charges transparently. Hidden fees or charges without informed consent breach transparency obligations.',
        consequence: 'Financial penalty for failing to publish fees. Civil liability for unlawful charges.',
        severity: 'MEDIUM',
      },
      {
        legislation: 'RICS Service Charge Residential Management Code (4th Edition)',
        jurisdiction: 'England & Wales',
        detail: 'Code requires managing agents to disclose any commission received from third parties at the time estimates are provided. Agents must not place themselves in a position where personal interest conflicts with client interest without disclosure.',
        consequence: 'RICS disciplinary proceedings. FTT may take non-compliance into account when assessing reasonableness of service charges.',
        severity: 'MEDIUM',
      },
      {
        legislation: 'Leasehold and Freehold Reform Act 2024',
        jurisdiction: 'England & Wales',
        detail: 'Introduces mandatory transparency requirements for managing agents and estate managers regarding fees, charges, and relationships. Service charge demands must include greater financial disclosure.',
        consequence: 'Charges may be challenged at FTT as unreasonably incurred if agent relationship is undisclosed.',
        severity: 'MEDIUM',
      },
    ],

    tribunal_route: 'First-tier Tribunal (Property Chamber) — challenge service charges under LTA 1985 s.27A. Can order repayment of charges found unreasonable.',
    regulator: 'RICS / Trading Standards / NTSEAT (National Trading Standards Estate & Letting Agent Team)',
    leaseholder_remedies: [
      'Apply to FTT to challenge service charges under LTA 1985 s.27A',
      'Report to RICS if agent is RICS-regulated',
      'Civil claim for breach of fiduciary duty — recovery of undisclosed profits',
      'Report to Trading Standards for Consumer Rights Act breach',
    ],
    recommended_action: 'Disclose full relationship in writing to all parties. Obtain informed written consent. Consider whether independent agent should be appointed.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  rtm_director_controls_managing_agent: {
    pattern_name: 'RTM Director Controls Managing Agent',
    severity: 'CRITICAL',
    risk_score_range: [75, 95],
    headline: 'Defeats the purpose of RTM — CLRA 2002 + fiduciary breach + FTT exposure',
    summary: 'The entire purpose of RTM under CLRA 2002 is to give leaseholders independent control of their building\'s management, free from freeholder/agent control. Where an RTM director also controls the managing agent appointed by the RTM company, the independence is illusory. This is one of the most serious patterns in leasehold law.',

    legal_basis: [
      {
        legislation: 'Commonhold and Leasehold Reform Act 2002 (CLRA 2002)',
        jurisdiction: 'England & Wales',
        detail: 'RTM companies exist to allow leaseholders to exercise management functions independently. An RTM director has a fiduciary duty to act in the best interests of all leaseholders as members of the RTM company. Appointing a managing agent in which the director has an undisclosed financial interest is a breach of this duty and arguably defeats the statutory purpose of RTM.',
        consequence: 'FTT application for manager appointment under LTA 1987 s.24 — court can appoint an independent manager, stripping the RTM company of management control entirely.',
        severity: 'CRITICAL',
      },
      {
        legislation: 'Landlord and Tenant Act 1987, Section 24',
        jurisdiction: 'England & Wales',
        detail: 'Where a manager is not performing their functions (including where conflicts make proper management impossible), any qualifying tenant can apply to the FTT for appointment of an independent manager.',
        consequence: 'Independent manager appointed by tribunal — complete loss of management control for conflicted party.',
        severity: 'CRITICAL',
      },
      {
        legislation: 'Landlord and Tenant Act 1985, Sections 18–30',
        jurisdiction: 'England & Wales',
        detail: 'Service charges paid to a managing agent controlled by an RTM director may be challenged as unreasonably incurred under s.19, since the appointment was not made at arm\'s length.',
        consequence: 'FTT can disallow service charges found unreasonable or not reasonably incurred. Repayment ordered.',
        severity: 'HIGH',
      },
      {
        legislation: 'Companies Act 2006, Section 175',
        jurisdiction: 'England & Wales',
        detail: 'Directors must avoid conflicts of interest. An RTM company director who profits from appointing their own managing agent without disclosure and shareholder approval breaches s.175.',
        consequence: 'Civil liability — director personally liable to account for profits made. Potential disqualification under Company Directors Disqualification Act 1986.',
        severity: 'HIGH',
      },
    ],

    tribunal_route: 'First-tier Tribunal (Property Chamber) — LTA 1987 s.24 manager appointment; LTA 1985 s.27A service charge challenge.',
    regulator: 'Companies House / RICS / FTT',
    leaseholder_remedies: [
      'Apply to FTT for independent manager under LTA 1987 s.24',
      'Challenge service charges at FTT under LTA 1985 s.27A',
      'Requisition extraordinary general meeting of RTM company — pass resolution to remove director',
      'Report director to Companies House for s.175 breach',
      'Instruct solicitors to seek account of profits from director',
    ],
    recommended_action: 'Director must either resign from RTM board or divest interest in managing agent. All past charges paid to conflicted agent should be reviewed.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  freehold_and_managing_agent_same_controller: {
    pattern_name: 'Freeholder Controls Managing Agent',
    severity: 'CRITICAL',
    risk_score_range: [70, 90],
    headline: 'Classic leasehold abuse — LTA 1985 ss.18-30, RICS Code, LFRA 2024',
    summary: 'Where the same person or company controls both the freehold and the managing agent, there is no arm\'s-length check on service charges or management decisions. This is the archetypal leasehold exploitation pattern that drove the Leasehold and Freehold Reform Act 2024.',

    legal_basis: [
      {
        legislation: 'Landlord and Tenant Act 1985, Section 19',
        jurisdiction: 'England & Wales',
        detail: 'Service charges are only payable to the extent they are (1) reasonably incurred and (2) of a reasonable standard. Where the managing agent is controlled by the freeholder, tribunal scrutiny of reasonableness is heightened — there is no competitive tendering or arm\'s-length appointment.',
        consequence: 'FTT can disallow service charges. Freeholder/agent may be ordered to repay historic charges found unreasonable.',
        severity: 'HIGH',
      },
      {
        legislation: 'Landlord and Tenant Act 1985, Section 21 (Right to Demand Summary)',
        jurisdiction: 'England & Wales',
        detail: 'Leaseholders have the right to demand a summary of service charge costs and to inspect documents. Failure by a connected managing agent to provide adequate accounts increases FTT exposure.',
        consequence: 'Criminal offence (summary conviction) for failure to comply with s.21 demand. Fine up to level 4 on standard scale (£2,500).',
        severity: 'MEDIUM',
      },
      {
        legislation: 'Leasehold and Freehold Reform Act 2024',
        jurisdiction: 'England & Wales',
        detail: 'Significantly strengthens leaseholder rights. Introduces: mandatory service charge demands in prescribed form; right to challenge administration charges; transparency requirements for agent relationships; restrictions on freeholders using connected agents without disclosure.',
        consequence: 'Charges not complying with prescribed form may be uncollectable. Tribunal can award costs against freeholder in FTT proceedings.',
        severity: 'HIGH',
      },
      {
        legislation: 'RICS Service Charge Residential Management Code (4th Edition)',
        jurisdiction: 'England & Wales',
        detail: 'Mandatory disclosure of any relationship between freeholder and managing agent. Non-compliance is a breach of professional standards.',
        consequence: 'RICS disciplinary action. FTT weighs compliance when assessing charges.',
        severity: 'MEDIUM',
      },
    ],

    tribunal_route: 'First-tier Tribunal (Property Chamber) — LTA 1985 s.27A; LTA 1987 s.24 (manager appointment). Upper Tribunal on appeal.',
    regulator: 'RICS / FTT / NTSEAT',
    leaseholder_remedies: [
      'Right to Manage under CLRA 2002 — leaseholders can take management away from conflicted freeholder',
      'FTT service charge challenge under LTA 1985 s.27A',
      'FTT manager appointment under LTA 1987 s.24',
      'Right to Acquire Freehold (collective enfranchisement) under LRHUDA 1993',
    ],
    recommended_action: 'Appoint independent managing agent or disclose relationship in full to leaseholders in writing. Ensure service charges are competitively tendered.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  service_charge_vehicle_same_directors: {
    pattern_name: 'Service Charge Vehicle — Shared Directors',
    severity: 'CRITICAL',
    risk_score_range: [75, 95],
    headline: 'LTA 1985 s.19 unreasonableness + Companies Act s.175 + potential s.423 IA 1986',
    summary: 'Where the company responsible for collecting and managing service charges shares directors with the managing agent or freeholder, the structural independence required for proper service charge administration is absent. This creates a vehicle for fee extraction and overcharging that is directly challengeable at the FTT.',

    legal_basis: [
      {
        legislation: 'Landlord and Tenant Act 1985, Section 19',
        jurisdiction: 'England & Wales',
        detail: 'Service charges managed by a connected vehicle must still satisfy the reasonableness test. The FTT applies heightened scrutiny where there is no independence between the charge-collecting entity and the managing agent/freeholder. Charges for services provided by connected companies at above-market rates are routinely disallowed.',
        consequence: 'FTT disallows unreasonable charges. Orders repayment. May appoint independent manager.',
        severity: 'CRITICAL',
      },
      {
        legislation: 'Landlord and Tenant Act 1985, Section 42 — Service Charge Trust Fund',
        jurisdiction: 'England & Wales',
        detail: 'Service charges held by a landlord or their agent must be held in a designated trust account. Where a connected service charge vehicle commingles these funds or uses them for purposes beyond the lease, this is a breach of trust.',
        consequence: 'Civil liability for breach of trust. Potential criminal liability if funds misappropriated.',
        severity: 'CRITICAL',
      },
      {
        legislation: 'Companies Act 2006, Section 175',
        jurisdiction: 'England & Wales',
        detail: 'Directors of the service charge vehicle who also serve as directors of the managing agent or freeholder company must avoid conflicts of interest. Unauthorised profits from the connected relationship must be disclosed and approved by shareholders.',
        consequence: 'Director personally liable to account for profits. Disqualification risk under CDDA 1986.',
        severity: 'HIGH',
      },
      {
        legislation: 'Insolvency Act 1986, Section 423',
        jurisdiction: 'England & Wales',
        detail: 'Where a service charge vehicle is used to transfer assets (e.g. reserve fund) at undervalue or to defraud creditors (including leaseholders), the court can set aside such transactions.',
        consequence: 'Court order to restore position. Leaseholders may recover amounts transferred.',
        severity: 'HIGH',
      },
    ],

    tribunal_route: 'First-tier Tribunal (Property Chamber) — LTA 1985 s.27A; if reserve fund misused, High Court injunction / breach of trust claim.',
    regulator: 'FTT / Companies House / Insolvency Service (if fraud)',
    leaseholder_remedies: [
      'FTT challenge to all service charges paid to connected vehicle',
      'Demand full accounts and inspection rights under LTA 1985 s.21-22',
      'Apply for independent manager under LTA 1987 s.24',
      'If reserve fund misused — High Court breach of trust claim',
      'Right to Manage to replace connected management structure',
    ],
    recommended_action: 'Directors of service charge vehicle must resign from connected entities or obtain written informed consent from all leaseholders. Service charges should be independently reviewed and competitively tendered.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  offshore_freehold_no_psc: {
    pattern_name: 'Offshore Freehold — No PSC / Beneficial Owner',
    severity: 'CRITICAL',
    risk_score_range: [80, 100],
    headline: 'Criminal offence — Economic Crime Act 2022 + Register of Overseas Entities',
    summary: 'Since January 1999 (retrospectively applied), overseas entities owning UK freehold must register beneficial ownership with Companies House under the Register of Overseas Entities. Failure is a criminal offence. Additionally, any offshore freehold with no identifiable PSC is a structural red flag for money laundering and leaseholder exploitation under UK AML and property law.',

    legal_basis: [
      {
        legislation: 'Economic Crime (Transparency and Enforcement) Act 2022',
        jurisdiction: 'England & Wales (retrospective to 1 January 1999)',
        detail: 'ALL overseas entities that own UK freehold or leasehold (>7 years) must register at Companies House with full beneficial ownership details. Applies retrospectively to all ownership registered since 1 January 1999. 6-month transitional period expired January 2023. Failure to register = criminal offence.',
        consequence: 'Criminal offence: fines of up to £2,500 PER DAY of non-compliance + up to 5 years imprisonment for officers. HMLR restriction placed on title — entity CANNOT sell, mortgage or lease the property until registered. Effectively freezes the asset.',
        severity: 'CRITICAL',
      },
      {
        legislation: 'Companies Act 2006 — Register of People with Significant Control (PSC)',
        jurisdiction: 'England & Wales',
        detail: 'UK companies holding freeholds must maintain an accurate PSC register. A company with no identifiable PSC and no explanation filed is in breach of the PSC regime.',
        consequence: 'Criminal offence — company and officers liable. Fine and/or imprisonment.',
        severity: 'HIGH',
      },
      {
        legislation: 'Proceeds of Crime Act 2002 (POCA)',
        jurisdiction: 'England & Wales',
        detail: 'Where beneficial ownership of a freehold is deliberately concealed through offshore structures, this may constitute a money laundering offence under POCA 2002 if the property represents proceeds of crime.',
        consequence: 'Criminal prosecution. Unexplained Wealth Orders (UWO) can be used to seize UK property where beneficial ownership cannot be explained.',
        severity: 'CRITICAL',
      },
      {
        legislation: 'Leasehold and Freehold Reform Act 2024',
        jurisdiction: 'England & Wales',
        detail: 'Offshore freeholders must now comply with the same transparency obligations as UK freeholders regarding service charges and leaseholder communications. Lack of identifiable beneficial owner does not exempt from compliance.',
        consequence: 'Service charges unenforceable if demands do not comply with LFRA 2024 prescribed forms.',
        severity: 'HIGH',
      },
    ],

    tribunal_route: 'Companies House enforcement / HMLR restriction / Crown Prosecution Service for criminal offences. FTT for service charge challenges.',
    regulator: 'Companies House (ROE enforcement) / HMRC / National Crime Agency / FTT',
    leaseholder_remedies: [
      'Report to Companies House if overseas entity not registered on ROE',
      'Challenge service charges at FTT — offshore status does not protect from LTA 1985',
      'Right to Manage — leaseholders can take management regardless of offshore freeholder',
      'Collective enfranchisement — leaseholders can compulsorily purchase the freehold from the offshore entity',
      'Report to National Crime Agency if beneficial ownership appears deliberately concealed',
    ],
    recommended_action: 'URGENT: Register on Register of Overseas Entities immediately. File PSC details. Seek legal advice on historic non-compliance. Note: HMLR restriction may already be in place blocking disposals.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  nominee_director_high_volume: {
    pattern_name: 'Nominee Director — High Volume / Day-1 Resignation',
    severity: 'MEDIUM',
    risk_score_range: [25, 65],
    headline: 'Legal but opacity risk — control_type must be verified; risk escalates when combined with offshore/no PSC',
    summary: 'Nominee directors are legal under UK company law. Formation agents like Duport Director Ltd (17,054 appointments) provide nominees as a standard company formation service. The nominee is appointed at incorporation, signs paperwork, then resigns — often the same day. The LEGAL status is unambiguous. The RISK arises when nominees are combined with offshore ownership, no PSC registration, or property assets where beneficial control needs to be transparent.',

    legal_basis: [
      {
        legislation: 'Companies Act 2006, Section 251',
        jurisdiction: 'England & Wales',
        detail: '"Shadow director" provisions — a person whose instructions directors are accustomed to following is treated as a director. A nominee who acts as directed by the beneficial owner without independent judgment may be a shadow director. However, standard formation-agent nominees who resign same day are not shadow directors in practice.',
        consequence: 'If treated as shadow director — full director liability including s.175 conflicts, s.172 duty to act in company\'s best interests.',
        severity: 'LOW',
      },
      {
        legislation: 'Companies Act 2006 — PSC Register',
        jurisdiction: 'England & Wales',
        detail: 'The nominee director structure is legal, but the underlying beneficial owner MUST be registered on the PSC register within 14 days of becoming a PSC. The "PSC gap window" between incorporation (with nominee) and PSC registration is a significant transparency gap — especially for property held between 2015 (incorporation) and April 2016 (PSC regime start).',
        consequence: 'Failure to register PSC within 14 days = criminal offence for both company and officers. Fine and/or imprisonment.',
        severity: 'HIGH',
      },
      {
        legislation: 'HMRC Guidance — Beneficial Ownership',
        jurisdiction: 'England & Wales',
        detail: 'HMRC anti-avoidance provisions look through nominee structures to identify the true beneficial owner for tax purposes. Nominee arrangements used to conceal taxable income or capital gains = tax evasion.',
        consequence: 'HMRC investigation, backdated tax liability, penalties, potential criminal prosecution.',
        severity: 'HIGH',
      },
      {
        legislation: 'Economic Crime Act 2022 — Enhanced due diligence',
        jurisdiction: 'England & Wales',
        detail: 'Where a nominee director structure is used in combination with an overseas entity owning UK property, the full ROE registration requirements apply regardless of nominal directorship.',
        consequence: 'As per offshore_freehold_no_psc — criminal offence if ROE not complied with.',
        severity: 'CRITICAL',
      },
    ],

    risk_escalation: {
      standalone_nominee: { severity: 'LOW', note: 'Standard formation practice — no action needed if PSC registered within 14 days' },
      nominee_plus_no_psc: { severity: 'HIGH', note: 'Failure to register PSC is criminal offence' },
      nominee_plus_offshore: { severity: 'CRITICAL', note: 'Must comply with ROE — daily £2,500 fine + possible asset freeze' },
      nominee_plus_offshore_plus_no_psc: { severity: 'CRITICAL', note: 'Multiple criminal offences — immediate legal advice required' },
    },

    tribunal_route: 'Companies House / HMRC / Crown Prosecution Service. No FTT route for nominee issue itself — but related service charge issues can be FTT.',
    regulator: 'Companies House / HMRC / NCA',
    leaseholder_remedies: [
      'Search ROE for beneficial ownership of offshore freeholder',
      'Report to Companies House if PSC not registered',
      'Service charge challenge at FTT unaffected by nominee structure',
    ],
    recommended_action: 'Ensure PSC registered within 14 days of becoming beneficial owner. Retain evidence of nominee appointment and resignation. If offshore — complete ROE registration immediately.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  managing_agent_controls_reserve_fund: {
    pattern_name: 'Managing Agent Controls Reserve / Sinking Fund',
    severity: 'CRITICAL',
    risk_score_range: [75, 95],
    headline: 'Breach of trust — LTA 1985 s.42 + potential fraud + FTT mandatory challenge',
    summary: 'Service charge reserve funds (sinking funds) must be held in trust for leaseholders under LTA 1985 s.42. Where the managing agent controls these funds without adequate segregation and oversight — particularly when the agent is connected to the freeholder — this is a structural breach of trust and creates serious risk of fund misappropriation.',

    legal_basis: [
      {
        legislation: 'Landlord and Tenant Act 1985, Section 42',
        jurisdiction: 'England & Wales',
        detail: 'Where a service charge is collected in advance, the landlord or agent must hold it in a designated trust account. The money is held on trust for leaseholders. Agent/landlord cannot commingle, invest freely, or use for other purposes.',
        consequence: 'Criminal offence if funds misapplied. Civil liability for breach of trust — full repayment plus interest. FTT can order independent manager.',
        severity: 'CRITICAL',
      },
      {
        legislation: 'Landlord and Tenant Act 1985, Section 21 — Accounts',
        jurisdiction: 'England & Wales',
        detail: 'Leaseholders have the right to demand a summary of service charge costs within 1 month, and to inspect supporting documents within 6 months. A managing agent controlling the reserve fund must provide full transparency on request.',
        consequence: 'Criminal offence (summary conviction) for failure to comply. Fine up to level 4 (£2,500). FTT can disallow charges where accounts not provided.',
        severity: 'HIGH',
      },
      {
        legislation: 'RICS Service Charge Residential Management Code (4th Edition)',
        jurisdiction: 'England & Wales',
        detail: 'Reserve/sinking funds must be clearly identified, held separately, and reported annually in audited accounts. Any investment of reserve funds requires leaseholder consent per the lease terms.',
        consequence: 'RICS disciplinary proceedings. FTT weighs compliance. Charges may be disallowed.',
        severity: 'HIGH',
      },
    ],

    tribunal_route: 'First-tier Tribunal (Property Chamber) — LTA 1985 s.27A + s.42 enforcement. High Court for breach of trust / injunction to freeze funds.',
    regulator: 'FTT / RICS / Insolvency Service (if fraud)',
    leaseholder_remedies: [
      'Demand immediate accounts inspection under LTA 1985 s.21',
      'FTT application under s.27A to challenge all charges',
      'High Court application for injunction to freeze reserve fund',
      'Right to Manage to transfer fund control to independent RTM company',
      'Report to RICS if agent is regulated',
    ],
    recommended_action: 'Immediately segregate reserve fund into designated trust account. Provide full annual accounts to all leaseholders. Appoint independent accountant to review historic fund management.',
  },
};

/**
 * Get legal severity info for a given COI pattern
 * @param {string} pattern - coi_pattern field value from OwnershipRelationship
 * @returns {object|null} Legal severity data
 */
export function getLegalSeverity(pattern) {
  return COI_LEGAL_SEVERITY[pattern] || null;
}

/**
 * Get a brief one-liner for display in badges/lists
 */
export function getLegalSeverityBrief(pattern) {
  const data = COI_LEGAL_SEVERITY[pattern];
  if (!data) return null;
  return {
    severity: data.severity,
    headline: data.headline,
    legislation_count: data.legal_basis?.length || 0,
    primary_legislation: data.legal_basis?.[0]?.legislation || null,
    tribunal_route: data.tribunal_route,
  };
}

/**
 * Severity colour mapping for UI
 */
export const SEVERITY_STYLES = {
  CRITICAL: {
    badge: 'bg-red-600 text-white',
    card:  'border-red-300 bg-red-50',
    text:  'text-red-800',
    dot:   'bg-red-600',
    icon_color: 'text-red-600',
  },
  HIGH: {
    badge: 'bg-orange-500 text-white',
    card:  'border-orange-300 bg-orange-50',
    text:  'text-orange-800',
    dot:   'bg-orange-500',
    icon_color: 'text-orange-600',
  },
  MEDIUM: {
    badge: 'bg-yellow-400 text-yellow-900',
    card:  'border-yellow-300 bg-yellow-50',
    text:  'text-yellow-800',
    dot:   'bg-yellow-400',
    icon_color: 'text-yellow-600',
  },
  LOW: {
    badge: 'bg-blue-100 text-blue-800',
    card:  'border-blue-200 bg-blue-50',
    text:  'text-blue-800',
    dot:   'bg-blue-400',
    icon_color: 'text-blue-500',
  },
};