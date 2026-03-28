import React, { useState } from 'react';
import {
  BookOpen, ExternalLink, AlertTriangle, CheckCircle2, Scale, Home, Shield,
  Building2, MapPin, Globe, ChevronDown, ChevronUp, Clock, Info, FileText,
  Phone, Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

const S21_ABOLITION_DATE = '2026-05-01';
const daysToS21 = differenceInDays(parseISO(S21_ABOLITION_DATE), new Date());

const SECTIONS = [
  {
    id: 'renters_rights',
    icon: AlertTriangle,
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
    badge: { label: '1 May 2026', cls: 'bg-red-100 text-red-700 border-red-300' },
    title: "Renters' Rights Act 2025",
    subtitle: "Royal Assent 27 Oct 2025 · In force 1 May 2026",
    urgency: 'critical',
    items: [
      {
        heading: "Section 21 Abolished — 1 May 2026",
        body: `No new Section 21 'no fault' eviction notices can be served from 1 May 2026. Any notice served on or after that date is invalid and exposes the landlord to a civil penalty of up to £7,000. The last valid date to serve is 30 April 2026. If a S21 was served before 1 May, possession proceedings must be issued by 31 July 2026.`,
        action: { label: "NRLA — S21 Abolition Guide", url: "https://www.nrla.org.uk/resources/renters-rights/section-21-abolition" }
      },
      {
        heading: "All ASTs become periodic tenancies",
        body: "From 1 May 2026, all assured shorthold tenancies end. Every tenancy (new and existing) automatically becomes an open-ended periodic assured tenancy. Fixed-term ASTs cannot be granted. Tenants can end by giving 2 months' notice; landlords must use Section 8 grounds.",
      },
      {
        heading: "Revised Section 8 Possession Grounds",
        body: "Mandatory Ground 1A (sale of property — 4 months' notice, no order during first 12 months of tenancy). Ground 1 (landlord/family occupation — 4 months' notice). Ground 8 threshold raised to 3 months' arrears. Ground 4A (student HMOs). Anti-social behaviour grounds strengthened. Civil penalties up to £40,000 for repeat breaches.",
        action: { label: "Section 8 Grounds Guide", url: "https://theindependentlandlord.com/rrb-grounds/" }
      },
      {
        heading: "Rent Increases — new rules",
        body: "From 1 May 2026, landlords can only increase rent once per year via a prescribed procedure: 2 months' written notice using a new statutory form. Tenants can challenge any increase at the First-tier Tribunal. No above-market increases. Landlords cannot accept upfront rent payments exceeding 1 month.",
      },
      {
        heading: "Tenant Information Sheet — by 31 May 2026",
        body: "Landlords must provide all existing tenants with the government's statutory information sheet by 31 May 2026. The government published the sheet in March 2026. Landlords with oral tenancy agreements must also provide a written summary of the main terms.",
        action: { label: "GOV.UK — Private Renting", url: "https://www.gov.uk/private-renting" }
      },
      {
        heading: "Pets & Anti-Discrimination",
        body: "Landlords must fairly consider pet requests and cannot unreasonably refuse. It becomes illegal to discriminate against tenants in receipt of benefits or with children. Landlords may require pet insurance as a condition.",
      },
      {
        heading: "Landlord Redress Scheme (late 2026)",
        body: "A mandatory ombudsman scheme for private landlords will be established in late 2026 — funded by landlords. Registration will be required. The Decent Homes Standard is expected to extend to the PRS in 2035–37.",
      },
    ]
  },
  {
    id: 'tpo',
    icon: Scale,
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    badge: { label: 'Mandatory Code', cls: 'bg-blue-100 text-blue-700 border-blue-300' },
    title: "The Property Ombudsman (TPO)",
    subtitle: "Code of Practice for Residential Letting Agents",
    urgency: 'info',
    items: [
      {
        heading: "Membership & Redress",
        body: "All letting agents must belong to a government-approved redress scheme. TPO membership is mandatory for agents marketing or managing residential property in England & Wales. Complaints must be acknowledged within 3 working days and resolved within 8 weeks before escalation.",
        action: { label: "TPO — Codes of Practice", url: "https://www.tpos.co.uk/about-us/codes-of-practice/" }
      },
      {
        heading: "Client Money Protection (CMP)",
        body: "Mandatory for all agents holding client money (rent, deposits, service charges). Agents must be registered with an approved CMP scheme and display their membership. Failure is a criminal offence with fines up to £30,000.",
      },
      {
        heading: "Transparency & Fee Disclosure",
        body: "All fees payable by tenants and landlords must be displayed clearly in marketing materials and on the website. The Tenant Fees Act 2019 (England) caps permitted payments to: rent, deposit (≤5 weeks), holding deposit (≤1 week), default fees (unpaid rent, lost keys), and novation charges.",
      },
      {
        heading: "Handling Deposits",
        body: "Deposits must be protected in a government-approved scheme (DPS, myDeposits, TDS) within 30 days of receipt. Prescribed information must be served on the tenant within the same 30-day window. Failure prevents serving a valid S21 notice and exposes the landlord to 1–3× deposit penalty.",
      },
      {
        heading: "Complaints Procedure",
        body: "Agents must have a written, internal complaints procedure. If unresolved after 8 weeks, the tenant/landlord may escalate to TPO. TPO can award up to £25,000 compensation. Members must comply with TPO decisions or face expulsion.",
        action: { label: "TPO — Make a Complaint", url: "https://www.tpos.co.uk/consumers/raise-a-complaint/" }
      },
    ]
  },
  {
    id: 'arla',
    icon: Shield,
    color: 'bg-violet-50 border-violet-200',
    iconColor: 'text-violet-600',
    badge: { label: 'ARLA / Propertymark', cls: 'bg-violet-100 text-violet-700 border-violet-300' },
    title: "ARLA Propertymark Standards",
    subtitle: "Professional standards for letting agents",
    urgency: 'info',
    items: [
      {
        heading: "Qualification Requirements",
        body: "ARLA members must hold at least a Propertymark Qualifications Level 2 Award in Residential Lettings. Branch managers should hold Level 3+. CPD is mandatory — members must complete continuous professional development to maintain membership.",
        action: { label: "Propertymark Best Practice Guides", url: "https://www.propertymark.co.uk/membership/knowledge-hub/best-practice-guides.html" }
      },
      {
        heading: "Conduct & Membership Rules",
        body: "Members must: act with integrity, maintain client confidentiality, not enter transactions with conflicts of interest, keep accurate records for 6 years minimum, and comply with all UK property legislation. Client money must be held in separate client accounts.",
      },
      {
        heading: "Pre-Tenancy Obligations (Best Practice)",
        body: "Before a tenancy starts: Right to Rent checks (England), EPC ≥ E (MEES), Gas Safety Certificate (CP12), EICR, smoke/CO alarms tested, Legionella risk assessment, How to Rent guide (England), inventory with schedule of condition signed by tenant.",
      },
      {
        heading: "Periodic Management Standards",
        body: "Recommended inspection intervals: every 3–6 months. Written notice must be given before access (24 hours minimum). All inspections should be documented with a written report provided to landlord and file. Maintenance should be actioned within defined SLAs: emergency 4h, urgent 24h, standard 5 working days.",
      },
      {
        heading: "Mid-Tenancy & End of Tenancy",
        body: "Rent reviews must be market-based and properly documented. Check-out report must be compared against check-in inventory. Deposit deductions must be itemised and evidenced. Any dispute should be referred to the deposit scheme's ADR service within the scheme's timeframes.",
      },
    ]
  },
  {
    id: 'tribunal',
    icon: Scale,
    color: 'bg-slate-50 border-slate-200',
    iconColor: 'text-slate-600',
    badge: { label: 'First-tier Tribunal', cls: 'bg-slate-100 text-slate-600 border-slate-300' },
    title: "First-tier Tribunal (Property Chamber)",
    subtitle: "England — residential property disputes",
    urgency: 'info',
    items: [
      {
        heading: "What the Tribunal handles",
        body: "Rent increases (fair / market rent disputes), leasehold disputes (service charges, administration charges, lease variations), leasehold enfranchisement, HMO licensing disputes, improvement notices & prohibition orders (Housing Act 2004), right to buy refusals, rent repayment orders (RROs), financial penalty appeals, Building Safety Act applications.",
        action: { label: "GOV.UK — Housing Tribunals", url: "https://www.gov.uk/housing-tribunals" }
      },
      {
        heading: "Service Charge Disputes (Leasehold)",
        body: "Leaseholders can apply to the Tribunal to determine whether service charges are reasonable. The Tribunal can also determine whether works were necessary and whether contractors were properly procured. Applications must be made before the charges are paid OR within 6 years of payment. No fee for most leaseholder applications.",
        action: { label: "Lease Advice — Applying to FTT", url: "https://www.lease-advice.org/disputes/tribunal/applying-to-the-first-tier-tribunal/" }
      },
      {
        heading: "Section 20 Consultation — Major Works",
        body: "Works costing more than £250 per leaseholder require prior S20 consultation. Failure to consult limits recovery to £250 per leaseholder per set of works unless the Tribunal grants dispensation. Three stages: Notice of Intention, Notification of Estimates, Notice of Award. Each stage has a 30-day observation period.",
        action: { label: "LEASE Advice — S20", url: "https://www.lease-advice.org/costs-and-charges/section-20-consultation/" }
      },
      {
        heading: "Rent Repayment Orders (RROs)",
        body: "Tenants (and local authorities) can apply for a Rent Repayment Order if the landlord has committed a relevant offence: unlicensed HMO, HHSRS improvement notice breach, illegal eviction, harassment, breach of banning order, S21 served after 1 May 2026. Awards can be up to 12 months' rent.",
      },
      {
        heading: "Contact Details",
        body: "London: London.Rap@justice.gov.uk | 0207 446 7730\nNorthern: rpnorthern@justice.gov.uk | 0161 237 9491\nSouthern: rpsouthern@justice.gov.uk | 01243 779 394\nEastern: rpeastern@justice.gov.uk | 01223 841 524\nMidlands: rpmidland@justice.gov.uk | 0121 600 7888\nMarket Rents: marketrents@justice.gov.uk | 0300 303 5857",
        action: { label: "First-tier Tribunal (Property Chamber)", url: "https://www.gov.uk/courts-tribunals/first-tier-tribunal-property-chamber" }
      },
    ]
  },
  {
    id: 'rsw',
    icon: MapPin,
    color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
    badge: { label: 'Wales Only', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    title: "Rent Smart Wales",
    subtitle: "Housing (Wales) Act 2014 · Renting Homes (Wales) Act 2016",
    urgency: 'info',
    items: [
      {
        heading: "Landlord Registration — Mandatory",
        body: "All landlords with privately rented property in Wales must register with Rent Smart Wales. Registration is valid for 5 years. Online registration: £60 (new), £48 (renewal). Paper: £102 (new), £87 (renewal). Renewal must be made within 84 days before expiry to qualify for the lower fee. Failure to register: fixed penalty up to £150 or prosecution.",
        action: { label: "Rent Smart Wales — Register", url: "https://rentsmart.gov.wales/en/landlord/landlord-registration/" }
      },
      {
        heading: "Landlord Licensing",
        body: "Landlords who undertake letting or management activities at their properties must also obtain a licence (in addition to registration). Licensed landlords must complete Rent Smart Wales approved training. The licence covers all Wales properties managed by that landlord. Agents conducting letting/management must also be licensed.",
        action: { label: "Rent Smart Wales — Licensing", url: "https://rentsmart.gov.wales/en/licensing/" }
      },
      {
        heading: "Renting Homes (Wales) Act 2016",
        body: "Replaced assured shorthold tenancies in Wales with 'occupation contracts'. Two types: (1) Fixed-term standard contract, (2) Periodic standard contract. Written statement of occupation contract must be provided to the occupier within 14 days of the contract start date. Non-compliance prohibits service of a valid possession notice.",
      },
      {
        heading: "Fitness for Human Habitation (FFHH) — Wales",
        body: "All rented properties in Wales must meet the FFHH standard. Includes: structural stability, damp, drainage, heating, hot water, gas/electrical safety, fire hazards, security, sanitation. Landlords must carry out repairs promptly when notified. Occupiers can apply to the Tribunal if standard is not met.",
      },
      {
        heading: "Notice Periods — Wales",
        body: "Occupation contract (Wales): minimum 6 months' notice for 'no fault' possession (occupation contract notice). For breach, 1 month's notice with ground stated. No equivalent of S21 — landlord always needs a contractual reason to end contract after the occupation date. Compare: England — S21 abolished 1 May 2026.",
      },
    ]
  },
  {
    id: 'local_authority',
    icon: Building2,
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
    badge: { label: 'Local Authority', cls: 'bg-amber-100 text-amber-700 border-amber-300' },
    title: "Local Authority & Licensing",
    subtitle: "HMO, selective licensing, HHSRS enforcement",
    urgency: 'info',
    items: [
      {
        heading: "Mandatory HMO Licensing",
        body: "Required for properties occupied by 5 or more people forming 2 or more households. Licence is property-specific, issued by the local authority, typically 5 years. Application includes: EPC, gas safety, electrical certificates, floor plan, fire safety evidence. Failure to licence: unlimited fine, RRO exposure, banning order risk.",
      },
      {
        heading: "Additional & Selective Licensing",
        body: "Councils can designate areas requiring selective licensing for all private lets (regardless of size), or additional licensing for smaller HMOs. Check with each borough/council for active designation areas. Blackpool, Brighton, parts of London (Newham, Haringey, Waltham Forest etc.) have active selective licensing schemes.",
        action: { label: "Check your council's licensing", url: "https://www.gov.uk/find-your-local-council" }
      },
      {
        heading: "HHSRS — Housing Health & Safety Rating System",
        body: "Local authorities inspect properties using HHSRS to assess 29 categories of hazard. Category 1 hazards (high risk) trigger a duty to serve an improvement notice. Category 2 hazards allow but don't require action. Landlords can appeal improvement notices to the First-tier Tribunal. Awaab's Law (damp/mould) will extend to PRS from 2035–37.",
      },
      {
        heading: "Decent Homes Standard (future)",
        body: "Currently applies to social housing. The government has committed to extending it to the PRS — likely 2035 or 2037. This will mandate minimum standards for: heating, hot water, insulation, structural condition. Agents should begin baseline property assessments now.",
      },
      {
        heading: "Energy Performance & MEES",
        body: "Minimum Energy Efficiency Standards (MEES): England & Wales require EPC band E or above for all new and existing tenancies. Proposed upgrade to EPC band C by 2030 (England — subject to legislation). EPCs are valid for 10 years. Exemptions available via PRS Exemptions Register for properties where improvements are not cost-effective or consent is withheld.",
        action: { label: "MEES Exemptions Register", url: "https://prsregister.beis.gov.uk/NdsBeisUi/used-service-before" }
      },
    ]
  },
  {
    id: 'nrla',
    icon: CheckCircle2,
    color: 'bg-teal-50 border-teal-200',
    iconColor: 'text-teal-600',
    badge: { label: 'NRLA Best Practice', cls: 'bg-teal-100 text-teal-700 border-teal-300' },
    title: "NRLA Compliance Checklist",
    subtitle: "National Residential Landlords Association — 28 key compliance points",
    urgency: 'info',
    items: [
      {
        heading: "Before Marketing",
        body: "✓ EPC ≥ E obtained and valid\n✓ MEES exemption registered if applicable\n✓ Council tax band confirmed\n✓ Selective/HMO licensing checked with local authority\n✓ Insurance: landlord buildings, contents, liability confirmed",
      },
      {
        heading: "Referencing & Pre-Tenancy",
        body: "✓ Right to Rent checks (England): original documents verified, copies taken, dates recorded\n✓ Rent Smart Wales: landlord registered + licensed (Wales)\n✓ Credit, employment and previous landlord references obtained\n✓ Guarantor agreement obtained if needed\n✓ Holding deposit capped at 1 week's rent",
        action: { label: "NRLA Tenancy Checklist", url: "https://www.nrla.org.uk/resources/creating-your-tenancy/assured-shorthold-tenancy-checklist" }
      },
      {
        heading: "Safety Certificates — move-in",
        body: "✓ Gas Safety Certificate (CP12) — annual, issued before occupation, copy provided to tenant before move-in\n✓ EICR — every 5 years (England mandatory since 2020), copy to tenant within 28 days\n✓ Smoke alarm: tested on day 1, working on every floor\n✓ CO alarm: in every room with solid fuel or gas appliance\n✓ Legionella risk assessment completed and documented",
      },
      {
        heading: "Documentation to Serve at Tenancy Start",
        body: "✓ Signed tenancy agreement\n✓ How to Rent guide (latest version — England only)\n✓ Gas Safety Certificate\n✓ EICR\n✓ EPC\n✓ Deposit protection certificate + prescribed information (within 30 days)\n✓ Written statement of occupation contract (Wales — within 14 days)",
      },
      {
        heading: "During Tenancy",
        body: "✓ Annual gas safety renewal — give tenant copy within 28 days of renewal\n✓ EICR renewal before 5-year expiry\n✓ Rent increase: once per year max, 2 months' notice (from 1 May 2026)\n✓ Periodic inspections every 3–6 months with written report\n✓ Respond to repair requests promptly: emergency 24h, urgent 5 days, routine 28 days",
      },
      {
        heading: "End of Tenancy",
        body: "✓ Check-out inspection vs check-in inventory\n✓ Itemised deposit deductions agreed within 10 days\n✓ ADR referral if deposit disputed\n✓ Final utility meter readings taken\n✓ Keys returned and recorded\n✓ Council tax end-of-tenancy notification to council",
      },
    ]
  },
];

function Section({ section, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const SectionIcon = section.icon;

  return (
    <div className={cn('rounded-xl border overflow-hidden', section.color)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-black/5 transition-colors"
      >
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-white shrink-0 mt-0.5 shadow-sm')}>
          <SectionIcon className={cn('w-4 h-4', section.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-semibold text-foreground">{section.title}</span>
            <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', section.badge.cls)}>
              {section.badge.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{section.subtitle}</p>
        </div>
        <div className="shrink-0 text-muted-foreground mt-1">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 bg-white/60 border-t border-current/10 space-y-4">
          {section.items.map((item, idx) => (
            <div key={idx} className="pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-1.5">{item.heading}</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{item.body}</p>
              {item.action && (
                <a
                  href={item.action.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {item.action.label}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RegulatoryHub() {
  const [search, setSearch] = useState('');

  const filtered = SECTIONS.filter(s =>
    !search ||
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.subtitle.toLowerCase().includes(search.toLowerCase()) ||
    s.items.some(i => i.heading.toLowerCase().includes(search.toLowerCase()) || i.body.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 max-w-[960px] mx-auto">
      <PageHeader
        title="Regulatory Hub"
        subtitle="ARLA · TPO · Renters' Rights Act · First-tier Tribunal · Rent Smart Wales · NRLA · Local Authority"
      />

      {/* S21 Countdown Alert */}
      {daysToS21 > 0 && daysToS21 <= 60 && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Section 21 abolished in {daysToS21} day{daysToS21 !== 1 ? 's' : ''} — 1 May 2026
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Last day to serve a valid S21: <strong>30 April 2026</strong>. After that date, attempting to serve S21 carries a civil penalty up to <strong>£7,000</strong>.
              All existing ASTs automatically convert to periodic assured tenancies. Possession must be sought via Section 8 grounds only.
            </p>
            <a href="https://www.nrla.org.uk/resources/renters-rights/section-21-abolition" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-red-700 hover:underline">
              <ExternalLink className="w-3 h-3" /> NRLA S21 Guide ↗
            </a>
          </div>
        </div>
      )}

      {daysToS21 <= 0 && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Section 21 has been abolished</p>
            <p className="text-xs text-red-700 mt-0.5">
              The Renters' Rights Act is in force. All ASTs are now periodic assured tenancies. Use Section 8 grounds for possession only.
            </p>
          </div>
        </div>
      )}

      {/* Tenant information sheet alert — due 31 May 2026 */}
      {daysToS21 <= 35 && daysToS21 >= 0 && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Action required: Tenant Information Sheet — by 31 May 2026</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Landlords must provide all existing tenants with the government's statutory information sheet by 31 May 2026. The sheet was published in March 2026.
              Check GOV.UK for the latest version and distribute to all tenants.
            </p>
            <a href="https://www.gov.uk/private-renting" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-amber-700 hover:underline">
              <ExternalLink className="w-3 h-3" /> GOV.UK — Private Renting ↗
            </a>
          </div>
        </div>
      )}

      {/* Quick-reference tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "TPO Complaint Form", url: "https://www.tpos.co.uk/consumers/raise-a-complaint/", color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "FTT — Apply Online", url: "https://www.gov.uk/housing-tribunals", color: "text-slate-700 bg-slate-50 border-slate-200" },
          { label: "Rent Smart Wales", url: "https://rentsmart.gov.wales/", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          { label: "NRLA Resources", url: "https://www.nrla.org.uk/resources", color: "text-teal-700 bg-teal-50 border-teal-200" },
          { label: "MEES Exemptions", url: "https://prsregister.beis.gov.uk/NdsBeisUi/used-service-before", color: "text-orange-700 bg-orange-50 border-orange-200" },
          { label: "How to Rent Guide", url: "https://www.gov.uk/government/publications/how-to-rent", color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
          { label: "Deposit Schemes (DPS)", url: "https://www.depositprotection.com/", color: "text-purple-700 bg-purple-50 border-purple-200" },
          { label: "Companies House Filing", url: "https://find-and-update.company-information.service.gov.uk", color: "text-primary bg-primary/5 border-primary/20" },
        ].map(link => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium hover:shadow-sm transition-shadow', link.color)}
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            {link.label}
          </a>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search regulations, obligations, deadlines..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {filtered.map((section, idx) => (
          <Section key={section.id} section={section} defaultOpen={idx === 0} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No results for "{search}"</div>
        )}
      </div>

      <p className="mt-8 text-xs text-muted-foreground text-center">
        This hub provides guidance summaries only — always verify current legislation and seek professional legal advice.
        Last reviewed: March 2026.
      </p>
    </div>
  );
}