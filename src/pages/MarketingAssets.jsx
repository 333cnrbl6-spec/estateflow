import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

const sections = [
  {
    id: 'hero',
    label: '1. Landing Page Hero Copy',
    color: 'bg-blue-50 border-blue-200',
    badge: 'Landing Page',
    badgeColor: 'bg-blue-100 text-blue-800',
    content: `# Landing Page Hero Copy

## Headline
**Stop Chasing Compliance. Start Growing Your Portfolio.**

## Sub-Headline
Premiso gives UK landlords and letting agencies a single platform to automate tenancy paperwork, stay ahead of compliance deadlines, and track every penny — so you can focus on what matters.

## Supporting Bullets
- ✅ AI-drafted tenancy agreements and Section 21 notices in minutes
- ✅ Never miss a gas safety certificate, EPC expiry, or deposit deadline again
- ✅ Real-time portfolio analytics and Stripe-powered rent collection
`,
  },
  {
    id: 'features',
    label: '2. Feature Section Copy',
    color: 'bg-green-50 border-green-200',
    badge: 'Website Copy',
    badgeColor: 'bg-green-100 text-green-800',
    content: `# Feature Section Copy

---

## Feature 1: AI Document Drafting
**Generate legally compliant tenancy documents in minutes, not hours.**

Premiso's AI drafts tenancy agreements, Section 21 notices, Section 8 notices, and inspection reports that are fully aligned with the Housing Act 1988, Deregulation Act 2015, and the Tenant Fees Act 2019. Stop paying solicitor fees for routine paperwork — one AI-drafted agreement saves the average landlord two hours and over £150 in professional fees.

---

## Feature 2: Compliance Dashboard
**Your compliance status, at a glance — before it becomes a problem.**

A single dashboard tracks every gas safety certificate, EPC, electrical inspection (EICR), deposit protection deadline, and right-to-rent check across your entire portfolio. Colour-coded red, amber, and green alerts mean you always know where you stand — and automated reminders ensure nothing slips through the cracks.

---

## Feature 3: Portfolio Analytics
**Understand your portfolio's performance without opening a spreadsheet.**

Premiso pulls together rent collection rates, occupancy trends, maintenance costs, and yield metrics into a clear, actionable dashboard. Spot underperforming properties, forecast income, and produce landlord-ready monthly statements — all without exporting a single CSV.
`,
  },
  {
    id: 'pricing',
    label: '3. Pricing Page Copy',
    color: 'bg-purple-50 border-purple-200',
    badge: 'Pricing',
    badgeColor: 'bg-purple-100 text-purple-800',
    content: `# Pricing Page Copy

**Simple, transparent pricing. No hidden fees. Cancel any time.**

---

## Starter — £49/month
**Perfect for independent landlords managing up to 5 properties.**

- ✅ Up to 5 properties
- ✅ Tenant and unit management
- ✅ Compliance deadline tracker (gas, EPC, EICR)
- ✅ Rent ledger and basic financial overview
- ✅ Secure document storage

**CTA: Start Free Trial →**

---

## ⭐ Professional — £129/month *(Most Popular)*
**Built for serious landlords and growing letting agencies who need to work smarter, not harder.**

This is where Premiso pays for itself. One avoided compliance penalty or a single AI-drafted agreement typically covers your monthly subscription cost.

- ✅ Unlimited properties
- ✅ AI document drafting (tenancy agreements, Section 21/8, inspection reports)
- ✅ Advanced compliance dashboard with action alerts
- ✅ Portfolio analytics, yield metrics, and forecasting
- ✅ PDF report export and team access (up to 5 users)

**CTA: Get Professional — Start Free →**

---

## Enterprise — £299/month
**For property management companies, large HMO operators, and estate managers.**

- ✅ Everything in Professional
- ✅ Unlimited team users and role-based access controls
- ✅ API access for custom integrations
- ✅ White-label branded client reports
- ✅ Dedicated onboarding support and priority response

**CTA: Book a Demo →**
`,
  },
  {
    id: 'emails',
    label: '4. Email Outreach Sequence',
    color: 'bg-amber-50 border-amber-200',
    badge: 'Email',
    badgeColor: 'bg-amber-100 text-amber-800',
    content: `# Email Outreach Sequence

---

## Email 1 — Problem-Focused (Compliance Risk)

**Subject:** Your gas certificate expired 3 weeks ago. Do you know which one?

Hi [First Name],

Most landlords managing 3+ properties don't realise they have a compliance gap until it becomes an expensive one — an invalid gas safety certificate can void a Section 21 notice entirely, leaving you unable to recover your property.

Add in deposit scheme deadlines, EPC requirements (properties must be E-rated or above to let legally), and the looming right-to-rent audit trail — and it's easy to see how even careful landlords end up exposed.

Premiso is a UK property management platform that tracks every compliance deadline across your portfolio, sends you alerts before expiry, and keeps a full audit trail — so you're always protected.

Worth a look?

[First Name] at Premiso
[Book a 15-minute call →]

---

## Email 2 — Feature Proof Follow-Up (AI Document Drafting)

**Subject:** Re: Your Section 21 — did it include the prescribed information?

Hi [First Name],

A quick follow-up. One thing that's caught out a number of landlords recently: a Section 21 notice is invalid if the prescribed information wasn't served correctly at the start of the tenancy — meaning you'd need to start the process again from scratch.

Premiso's AI document engine drafts tenancy agreements, Section 21 and Section 8 notices, and inventory reports that are checked against current UK legislation — Housing Act 1988, Deregulation Act 2015, Tenant Fees Act 2019 — every time.

It takes about 3 minutes. Most solicitors charge upwards of £150 for the same document.

Happy to show you a live demo?

[First Name] at Premiso
[See It in Action →]

---

## Email 3 — Free Trial Nudge

**Subject:** 14 days free — no card required

Hi [First Name],

Just a quick note — we've opened up a free 14-day trial of Premiso's Professional tier, which includes the AI document drafting and full compliance dashboard.

No credit card. No commitment. If it doesn't save you time in the first fortnight, you walk away with nothing lost.

Takes about 5 minutes to set up your portfolio.

[Start Your Free Trial →]

Speak soon,
[First Name] at Premiso
`,
  },
  {
    id: 'linkedin',
    label: '5. LinkedIn Posts',
    color: 'bg-sky-50 border-sky-200',
    badge: 'Social Media',
    badgeColor: 'bg-sky-100 text-sky-800',
    content: `# LinkedIn Posts (3 Variations)

---

## Post 1 — Landlord Pain Point Story

A landlord I spoke to last month had been managing 7 properties for 11 years. Diligent, experienced, knew his tenants well.

He served a Section 21 last autumn. Open and shut, he thought.

His solicitor came back to say it was invalid — because the prescribed information hadn't been served correctly back when the tenancy started in 2019. He had to start again. Six months of delays. Legal costs he hadn't budgeted for.

The frustrating thing? He'd done everything else right.

This isn't a rare story. UK tenancy law is a moving target — the Deregulation Act, the Tenant Fees Act, upcoming Renters' Rights Bill changes — and the paperwork requirements have only got more complex.

That's exactly why we built Premiso.

AI-drafted documents checked against current UK legislation. Compliance alerts before deadlines hit. Everything in one place, with a full audit trail.

If you're managing 3 or more properties, it's worth 15 minutes of your time.

Link in comments. 👇

#UKLandlord #PropertyManagement #LettingAgency #Section21 #PropertyTech

---

## Post 2 — Product Announcement

Introducing Premiso — UK property management software built for how landlords and agencies actually work.

Here's what's in the platform:

🏠 **Portfolio management** — properties, units, tenants, all in one place
📋 **AI document drafting** — tenancy agreements, Section 21/8 notices, inspection reports in minutes
🛡️ **Compliance dashboard** — gas certs, EPCs, EICRs, deposit protection, right-to-rent, all tracked
💰 **Rent collection** — Stripe-powered recurring payments with automated reminders
📊 **Portfolio analytics** — occupancy rates, yield metrics, income forecasting
📄 **PDF exports** — branded reports for you, your accountant, or your clients

Pricing starts at £49/month. Professional tier (the one most agencies use) is £129/month — and typically pays for itself within the first month.

Free 14-day trial. No card required.

Genuinely built for the UK market — not a US product with a Union Jack slapped on it.

Thoughts? Questions? Drop them below — always happy to talk property.

#UKLandlord #PropertyManagement #HMO #LettingAgency #PropertyTech

---

## Post 3 — Compliance Tip with Product Mention

📋 UK landlord compliance checklist for 2026 — save this.

✅ **Gas Safety Certificate** — annual renewal, must be given to tenants within 28 days
✅ **EPC** — minimum E rating, must be provided before marketing
✅ **EICR** (Electrical Installation Condition Report) — every 5 years for private rentals
✅ **Deposit protection** — must be protected within 30 days and prescribed information served within 30 days
✅ **Right to Rent** — checks must be repeated if a tenant's visa has a time limit
✅ **HMO Licence** — mandatory if 5+ people in 2+ households; local authority mandatory licensing may apply from 3+
✅ **Section 21 validity** — prescribed information, deposit protection, and EPC/Gas cert all affect enforceability

Missing any one of these doesn't just mean a fine. It can invalidate a Section 21, delay possession proceedings by months, and expose you to a Rent Repayment Order.

We built Premiso to track all of this automatically — alerts before anything expires, documents drafted to current legislation, full audit trail.

What's the one compliance area you find hardest to keep on top of? Drop it below — curious what the community is struggling with most.

#UKLandlord #PropertyManagement #LettingAgency #HMO #ComplianceTip #PropertyTech

`,
  },
  {
    id: 'salessheet',
    label: '6. One-Page Sales Sheet',
    color: 'bg-rose-50 border-rose-200',
    badge: 'Sales',
    badgeColor: 'bg-rose-100 text-rose-800',
    content: `# One-Page Sales Sheet

---

[PREMISO LOGO]

---

## Stop Chasing Compliance. Start Growing Your Portfolio.

**UK property management software for landlords, letting agencies, and estate managers.**

---

### The Problem

Managing UK property in 2026 means navigating an ever-growing web of compliance obligations — gas safety, EPCs, EICRs, deposit protection, right-to-rent, HMO licensing — while handling tenants, maintenance, and finances simultaneously.

One missed deadline doesn't just cause admin headaches. It can invalidate a Section 21, trigger a rent repayment order, or expose you to a £30,000+ fine.

Most landlords and agencies are still tracking this in spreadsheets. That's the problem we solve.

---

### The Solution

**Premiso** is an all-in-one UK property management platform that automates the paperwork, tracks every compliance deadline, and gives you a real-time view of your portfolio's financial performance.

---

### 3 Key Benefits

**1. AI Document Drafting**
Tenancy agreements, Section 21/8 notices, and inspection reports generated in minutes — checked against current UK legislation.

**2. Compliance Dashboard**
Red, amber, green tracking of every certificate, licence, and legal deadline across your entire portfolio. Automated alerts before anything expires.

**3. Portfolio Analytics**
Rent collection rates, yield metrics, occupancy trends, and income forecasts — without a single spreadsheet.

---

### Pricing

| Tier | Price | Best For |
|------|-------|----------|
| Starter | £49/month | Independent landlords, up to 5 properties |
| Professional | £129/month | Serious landlords & growing agencies |
| Enterprise | £299/month | Property companies & large HMO operators |

*14-day free trial. No credit card required.*

---

### Get Started Today

📧 hello@premiso.co.uk
🌐 www.premiso.co.uk
📞 Book a 15-minute demo: [calendar link]

---

*[Social proof placeholder: "Trusted by X landlords managing X properties across the UK"]*

*[Logo placeholder: RICS affiliate | ICO registered | Investors in People]*
`,
  },
  {
    id: 'objections',
    label: '7. Objection Handling Guide',
    color: 'bg-orange-50 border-orange-200',
    badge: 'Sales Enablement',
    badgeColor: 'bg-orange-100 text-orange-800',
    content: `# Objection Handling Guide

---

## Objection 1: "I only have a few properties — is it worth it?"

**Response:**
That's exactly who Premiso is built for. If you have 3 properties, you still have 3 sets of gas certificates, 3 EPC obligations, 3 deposit protection deadlines, and potentially 3 right-to-rent audits.

The risk doesn't scale down with the portfolio size — a missed compliance deadline on a single property can still invalidate a Section 21 and cost you months. At £49/month, Premiso costs less than one hour of a solicitor's time. Most landlords make that back in the first document they draft.

---

## Objection 2: "My accountant handles everything."

**Response:**
Your accountant handles your accounts — and they're brilliant at it. But compliance deadlines (gas certs, EPCs, deposit schemes, right-to-rent checks) typically fall outside their scope, and most accountants won't tell you when a certificate has expired or flag that your Section 21 has been served incorrectly.

Premiso fills that gap — it's the layer between day-to-day property management and year-end financials. It also produces clean, structured reports that make your accountant's job much easier.

---

## Objection 3: "What about GDPR?"

**Response:**
A fair concern, and one we take seriously. Premiso is ICO registered, stores all data on UK/EU servers, and gives you full control over what's retained and for how long. Every tenant record can be deleted on request.

In fact, Premiso helps you stay GDPR compliant — it maintains an audit trail of documents served, keeps consent records, and manages data retention automatically. Using spreadsheets and email chains for tenant data is typically a bigger GDPR exposure than a dedicated, compliant platform.

---

## Objection 4: "I don't trust cloud software with tenancy data."

**Response:**
That's a completely reasonable instinct, and the question worth asking is: where is your data now?

If it's in a shared email inbox, a local spreadsheet, or a filing cabinet — that's a single point of failure with no backup, no access control, and no audit trail.

Premiso uses bank-grade encryption, role-based access controls, daily automated backups, and full activity logging. Your data is safer here than in most alternatives — and you can export everything at any time.

---

## Objection 5: "I already use Rightmove / Zoopla."

**Response:**
Rightmove and Zoopla are excellent marketing portals for listing properties. Premiso is what happens after the viewing — once a tenant is in place.

There's no overlap. Rightmove doesn't track gas safety certificates, draft tenancy agreements, manage rent collection, or alert you when a deposit protection deadline is approaching. Premiso does all of that, and many agencies use both in tandem.

---

## Objection 6: "It's too expensive — I manage this myself."

**Response:**
Let's break it down. Professional tier is £129/month — that's the cost of roughly one hour with a property solicitor.

Consider what Premiso replaces in a typical month: manual compliance tracking (2–4 hours), document drafting (1–2 hours per document), chasing rent arrears manually, and compiling financial reports. Most landlords managing 5+ properties save well over £129/month in time alone — before you account for avoided fines, invalid notices, or deposit disputes.

The trial is free and takes 5 minutes to set up. The risk is low; the upside is real.
`,
  },
  {
    id: 'demoscript',
    label: '8. Demo Script (5 Minutes)',
    color: 'bg-teal-50 border-teal-200',
    badge: 'Demo',
    badgeColor: 'bg-teal-100 text-teal-800',
    content: `# Demo Script — 5 Minutes

---

## HOOK (30 seconds)

*[Open with a brief story — confident, conversational tone]*

"Before I show you the platform, let me share something that happened to a landlord earlier this year. He'd been renting out properties for over a decade. Experienced, careful, knew his tenants. He served a Section 21 in September. His solicitor came back and told him it was invalid — because the prescribed information hadn't been served correctly when the tenancy started four years ago. He had to start again from scratch. Six months of delays, legal costs he hadn't planned for, and a tenant who knew exactly what had happened.

That's what Premiso is built to prevent. Let me show you how."

---

## THE PROBLEM (45 seconds)

*[Screen: blank slide or whiteboard view]*

"The challenge for anyone managing UK property today is that the compliance landscape has become genuinely complex. You've got gas safety renewals, EPC ratings, EICR certificates, deposit protection deadlines, right-to-rent checks — all on different schedules, all with different consequences if they're missed.

And the documents that go with them — tenancy agreements, Section 21 notices, inventory reports — have to be drafted correctly against current legislation, or they can be challenged.

Most landlords and agencies are still tracking this across spreadsheets, email chains, and memory. The risk exposure is significant, and the admin burden is substantial. That's the problem we solve."

---

## FEATURE WALKTHROUGH (2 minutes 30 seconds)

### AI Document Drafting (50 seconds)
*[Screen: Document Drafting interface]*

"Let's start with AI document drafting. I'm going to create a tenancy agreement from scratch. I'll enter the property address, the tenant details, the rent amount and start date — and the AI generates a fully compliant tenancy agreement in about 30 seconds.

What's important here is that this isn't just a template. The document is checked against the Housing Act 1988, the Deregulation Act 2015, and the Tenant Fees Act 2019 — so the prescribed information, the deposit clauses, the notice periods — all of it is current.

You can export it as a PDF instantly, email it directly to the tenant, and it's saved to the property record with a timestamp. The same engine handles Section 21 notices, Section 8 notices, and inspection reports."

### Compliance Dashboard (50 seconds)
*[Screen: Compliance Dashboard]*

"Now let's look at the compliance dashboard. This is the view that landlords tell us they'd wished they had years ago.

Every property in your portfolio is listed here. The colour coding is simple — green means you're covered, amber means something is due within 90 days, red means action is required now.

You can see across the whole portfolio: gas safety certificates, EPCs, EICRs, deposit protection status, right-to-rent checks, HMO licence validity. Click into any property and you see the full history — what was issued, when it was served, to whom, and when the next renewal is due.

When something goes amber, the system automatically alerts you by email. You don't need to remember anything — Premiso holds the audit trail."

### Portfolio Analytics (50 seconds)
*[Screen: Analytics Dashboard]*

"Finally, portfolio analytics. This is the financial performance view — occupancy rates, rent collection rates, yield by property, maintenance costs, income forecasting.

This dashboard is pulling live data. You can see at a glance which properties are performing well and which might need attention. The rent ledger tracks every payment, flags arrears automatically, and triggers reminder emails to tenants.

At the bottom here, you can generate a monthly statement for any property — branded PDF, ready to send to the property owner or your accountant. No spreadsheets, no formatting, no manual work."

---

## PRICING + CTA (45 seconds)

"So — three tiers. Starter at £49/month for independent landlords up to 5 properties. Professional at £129/month, which is what most agencies and serious landlords use — that includes the AI drafting, the full compliance dashboard, and the analytics. Enterprise at £299 for larger operations needing API access, unlimited users, and white-label reporting.

There's a 14-day free trial on the Professional tier — no credit card required. It takes about 5 minutes to add your first property and connect your tenants. We also offer a 30-minute guided onboarding call if you'd like a hand getting started.

The way I'd put it: one avoided compliance issue or one AI-drafted document typically covers the first month's cost. The trial is risk-free — what would you like to do?"

---

## Q&A PROMPT (30 seconds)

"Before we wrap up — a couple of questions I'd love your honest thoughts on:

Which of the three features I showed you would be most valuable for how you work today?

And is there anything in your current process — a specific compliance area, a document you draft regularly, a reporting task — where you'd want to see Premiso in action?

I'm happy to dig deeper into anything, or I can send you a login to explore on your own. What would be most useful?"
`,
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5">
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}

function Section({ section }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className={`border ${section.color}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Badge className={section.badgeColor}>{section.badge}</Badge>
            <CardTitle className="text-base font-semibold">{section.label}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={section.content} />
            <Button size="sm" variant="ghost" onClick={() => setOpen(!open)}>
              {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent>
          <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed bg-white/70 rounded-lg p-4 border border-white">
            {section.content}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}

export default function MarketingAssets() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Premiso — Marketing Assets</h1>
        <p className="text-muted-foreground text-sm mt-1">All sales and marketing copy, ready to use. Click any section to expand, then copy.</p>
      </div>
      {sections.map(s => <Section key={s.id} section={s} />)}
    </div>
  );
}