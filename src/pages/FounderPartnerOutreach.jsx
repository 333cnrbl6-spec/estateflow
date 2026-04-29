import React, { useState } from 'react';
import { Copy, Check, FileText, Handshake, Gift, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const sections = [
  { id: 'pitch', label: 'Sales Pitch', icon: Handshake },
  { id: 'offer', label: 'The Offer', icon: Gift },
  { id: 'nda', label: 'NDA', icon: Shield },
  { id: 'tcs', label: 'Terms & Conditions', icon: FileText },
];

function CopyBlock({ title, text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 text-xs h-7">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
        {text}
      </div>
    </div>
  );
}

const PITCH_EMAIL = `Subject: A personal invitation — be part of something we're building for agents like you

Hi [Name],

I wanted to reach out to you directly because we think RBM Block Management / Regency Estates is exactly the kind of agency we've built Premiso for.

Premiso is a property management platform I've been building to solve the exact problems I know agencies like yours deal with every day — compliance tracking, block management, sales, lettings, maintenance, financials, and contractor coordination — all in one place, without the price tag of the big enterprise systems.

Right now, we're looking for a small number of founder partner agencies to join us before we go to market. We want real agents, real properties, real workflows. Not test data.

Here's what that looks like for you:

✅ Free access — full platform, no subscription fee, for as long as you remain a founder partner
✅ Sales, lettings, and block management modules — all included
✅ Your feedback shapes the product — you tell us what's missing, we build it
✅ Priority support — direct line to our team, not a ticketing queue
✅ Founder Partner status — recognised on the platform and in our go-to-market

What we ask in return is simple:
→ Use the platform genuinely for day-to-day work (not just a log-in once)
→ Give us honest feedback each month (15 minutes, no more)
→ Let us reference you as a founding partner (anonymised if preferred)

This is not a beta test. The platform works. We just want to grow it with people who know the industry inside out — and RBM / Regency Estates fits that perfectly.

I'd love to have a quick 20-minute call to show you around the platform and answer any questions.

Are you free this week or next?

Best,
[Your name]
Premiso
[Phone number]`;

const VERBAL_PITCH = `------- FOR IN-PERSON / PHONE USE -------

Opening:
"We're building a property management platform specifically for UK agents — sales, lettings, block management, compliance — everything in one place. We're looking for a handful of agencies to use it for free in exchange for feedback. I thought of you because you tick every box."

The hook:
"Right now, you probably use separate tools for block management, compliance, maintenance, financials — maybe a spreadsheet or two. Premiso pulls all of that into one dashboard. Gas certs, EICRs, service charges, contractor management, rent collection — it's all there."

The offer:
"We're not charging you anything. Full platform access, free. We just need you to actually use it and tell us what's working and what isn't. That's it."

Handling hesitation:
"I know agents are busy. This isn't about adding work — it's about removing it. We'll onboard you, set everything up with you, and be on hand if anything's not working. Think of us as part of your team."

Close:
"Can I come in for 30 minutes and show you around the platform? You don't need to commit to anything — just take a look and tell me if it makes sense for how you work."`;

const OFFER_EXPLANATION = `PREMISO FOUNDER PARTNER PROGRAMME
What We're Offering & What We're Asking For

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT YOU GET (FREE, FOR AS LONG AS YOU'RE A PARTNER)

1. Full Platform Access
   Sales pipeline, lettings, block management, compliance, maintenance,
   financials, document automation, tenant portals, contractor management,
   inspection reports, AI document drafting — everything included.

2. Sales Module
   Manage listings, viewings, offers, buyer portals, sales pipelines,
   agent performance tracking, and market reports.

3. Lettings Module
   Tenant onboarding, rent collection, tenancy pipelines, arrears tracking,
   document management, tenant self-service portal.

4. Block Management Module
   Service charge management, leaseholder portals, RTM management,
   building safety register, fire safety compliance, Companies House
   integration, conflict of interest detection.

5. Compliance & Certificates
   Gas safety, electrical (EICR), EPC, fire risk — all tracked with
   proactive alerts before expiry. Smart RAG (Red/Amber/Green) dashboard.

6. Your Feedback Directly Shapes the Product
   We build what you ask for. Founder partners get direct access to our
   product team. Your workflow becomes part of the platform.

7. Priority Support
   Direct WhatsApp or email line to our team. We respond same day.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT WE ASK IN RETURN

1. Genuine Day-to-Day Use
   We ask that you use Premiso as a real working tool — not just log in once.
   Even 2–3 properties to start. We need real usage to learn what works.

2. Monthly Feedback (15 Minutes)
   Once a month, a quick call or written response: what's working, what's
   missing, what we should prioritise. That's it.

3. A Testimonial or Case Study (When You're Ready)
   Once you've found value, we'd love a short quote or anonymised case study
   to share with other agencies. This is optional and always agreed with you first.

4. Reference as a Founding Partner
   We may name RBM Block Management / Regency Estates as a founding partner
   in our marketing. We'll always ask permission before doing so. Anonymisation
   is available if preferred.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT THIS IS NOT

✗ We will not sell your data to third parties
✗ We will not lock you in with a contract
✗ We will not pressure you into a paid plan
✗ There is no catch — if you stop finding value, you stop. Simple.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHEN DO YOU START PAYING?

You don't — for as long as you remain an active Founder Partner.

If and when the programme ends (and we'll give at least 90 days' notice),
you'll move to a preferential rate as a founding agency. Current indicative
pricing starts at £250/month for smaller portfolios. Founder partners receive
a minimum 30% lifetime discount from whatever our published pricing is at the time.`;

const NDA_TEXT = `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of [DATE] between:

Disclosing Party: Premiso Ltd (or trading name), registered in England and Wales ("Premiso")

Receiving Party: [AGENCY LEGAL NAME], trading as [TRADING NAME], of [ADDRESS] ("Partner Agency")

1. PURPOSE
The parties wish to explore a commercial relationship under the Premiso Founder Partner Programme. In connection with this, Premiso may disclose confidential information to the Partner Agency.

2. CONFIDENTIAL INFORMATION
"Confidential Information" means any non-public information disclosed by Premiso relating to:
(a) Product features, roadmaps, and technical architecture
(b) Pricing structures and commercial terms
(c) Business strategy, investor materials, and financial projections
(d) Customer data, user data, or platform analytics
(e) Any information marked "confidential" or which a reasonable person would understand to be confidential

3. OBLIGATIONS
The Partner Agency agrees to:
(a) Keep all Confidential Information strictly confidential
(b) Use it only for evaluating or participating in the Founder Partner Programme
(c) Not disclose it to any third party without Premiso's prior written consent
(d) Take reasonable steps to protect it from unauthorised disclosure

4. EXCLUSIONS
These obligations do not apply to information that:
(a) Is or becomes publicly available through no fault of the Partner Agency
(b) Was already known to the Partner Agency before disclosure
(c) Is required to be disclosed by law or court order (with prior notice to Premiso where possible)

5. RETURN OF INFORMATION
On request, the Partner Agency will return or destroy all Confidential Information.

6. DURATION
These obligations remain in force for 3 years from the date of this Agreement.

7. NO LICENCE
Nothing in this Agreement grants the Partner Agency any rights in Premiso's intellectual property.

8. GOVERNING LAW
This Agreement is governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of the English courts.

Signed for and on behalf of Premiso:

Name: _______________________
Title: _______________________
Date: _______________________
Signature: ___________________


Signed for and on behalf of [AGENCY NAME]:

Name: _______________________
Title: _______________________
Date: _______________________
Signature: ___________________`;

const TCS_TEXT = `PREMISO FOUNDER PARTNER PROGRAMME
Terms & Conditions

Effective Date: [DATE]
Between: Premiso ("we", "us") and [AGENCY NAME] ("you", "Partner Agency")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. THE PROGRAMME

1.1 Premiso invites you to join the Premiso Founder Partner Programme ("Programme") under which you receive free access to the Premiso property management platform ("Platform") in exchange for feedback and participation as described in these terms.

1.2 Participation is voluntary. You may exit the Programme at any time with 30 days' written notice.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. WHAT YOU RECEIVE

2.1 Free Access: Full access to the Platform at no charge for the duration of your active participation in the Programme.

2.2 Modules: Access includes all modules available at the time, currently including sales, lettings, block management, compliance, maintenance, document automation, and portals. New modules are added at Premiso's discretion and will be available to active Founder Partners.

2.3 Support: Priority support via direct channel with a same-day response target on business days.

2.4 Influence: Your feedback directly informs product development. We commit to reviewing all Partner feedback monthly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. WHAT WE ASK OF YOU

3.1 Genuine Use: You agree to use the Platform in good faith for day-to-day property management activity, using at least a representative portion of your portfolio.

3.2 Monthly Feedback: You agree to provide honest feedback on the Platform once per calendar month, either via written form or a brief call (approximately 15 minutes).

3.3 Testimonial: When and if you find value in the Platform, we may request a short testimonial or anonymised case study. This is optional and will only be used with your explicit prior approval.

3.4 Reference: You consent to Premiso referencing [AGENCY NAME] as a Founder Partner in marketing materials. You may request anonymisation at any time and we will comply within 5 business days.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. DATA & PRIVACY

4.1 Your Data Belongs to You: All data you enter into the Platform (properties, tenants, financials, documents) remains your data at all times.

4.2 No Third-Party Sale: We will never sell your data or your clients' data to any third party.

4.3 Data Processing: By using the Platform you agree to Premiso's Privacy Policy [link], which governs how we process personal data in compliance with UK GDPR.

4.4 Data Portability: On request or on exit from the Programme, we will provide a full export of your data in a standard format within 10 business days.

4.5 Deletion: On exit, you may request deletion of all your data from our systems. We will confirm deletion within 30 days, subject to any legal retention obligations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. INTELLECTUAL PROPERTY

5.1 The Platform and all associated software, design, and content is the intellectual property of Premiso. Nothing in this Agreement transfers any IP rights to you.

5.2 Your feedback, suggestions, and feature requests may be incorporated into the Platform. You grant Premiso a royalty-free licence to use such feedback for product development. You will not receive compensation for feedback incorporated.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. LIMITATION OF LIABILITY

6.1 The Platform is provided "as is" during the Founder Partner Programme. As a free-access participant, you acknowledge the Platform is in active development.

6.2 Premiso's total liability to you under this Agreement shall not exceed £500.

6.3 Premiso is not liable for any loss of data, revenue, or business resulting from use of the Platform, except in cases of gross negligence or wilful misconduct.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. ENDING THE ARRANGEMENT

7.1 Either party may end participation in the Programme with 30 days' written notice.

7.2 If the Programme itself closes, Premiso will give at least 90 days' notice. Active partners at that time will be offered a minimum 30% lifetime discount on standard subscription pricing.

7.3 Premiso may suspend access with immediate effect if there is evidence of misuse, data breach, or breach of these terms.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. GENERAL

8.1 These terms are governed by English law and subject to the jurisdiction of the English courts.

8.2 These terms, together with the NDA signed between the parties, constitute the entire agreement relating to the Founder Partner Programme.

8.3 If any part of these terms is found to be unenforceable, the remaining terms continue in force.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AGREED AND ACCEPTED

For Premiso:
Name: _______________________ Date: _______________________
Signature: ___________________

For [AGENCY NAME]:
Name: _______________________ Date: _______________________
Title: _______________________ Signature: ___________________`;

const content = {
  pitch: [
    { title: 'Email / Written Pitch', text: PITCH_EMAIL },
    { title: 'Verbal / Phone / In-Person Pitch', text: VERBAL_PITCH },
  ],
  offer: [{ title: 'Full Offer Explanation (to send alongside email)', text: OFFER_EXPLANATION }],
  nda: [{ title: 'Non-Disclosure Agreement', text: NDA_TEXT }],
  tcs: [{ title: 'Founder Partner Terms & Conditions', text: TCS_TEXT }],
};

export default function FounderPartnerOutreach() {
  return (
    <div className="p-8 max-w-[900px] mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Founder Partner Outreach Pack</h1>
          <Badge className="bg-amber-100 text-amber-800">RBM / Regency Estates / Horwich</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Ready-to-use copy for outreach, the offer document, NDA, and T&Cs. Click "Copy" on any block to paste straight into email or Word.
        </p>
      </div>

      <Tabs defaultValue="pitch">
        <TabsList className="grid grid-cols-4 w-full">
          {sections.map(s => (
            <TabsTrigger key={s.id} value={s.id} className="gap-1.5">
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(content).map(([key, blocks]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {key === 'pitch' && 'Sales Pitch — Email & Verbal'}
                  {key === 'offer' && 'The Offer — What We Give & What We Ask'}
                  {key === 'nda' && 'Non-Disclosure Agreement'}
                  {key === 'tcs' && 'Founder Partner Terms & Conditions'}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {key === 'pitch' && 'Customise [Name], [Your name] and [Phone number] before sending.'}
                  {key === 'offer' && 'Send this alongside or after the pitch email as a one-pager.'}
                  {key === 'nda' && 'Fill in [DATE], [AGENCY LEGAL NAME], [TRADING NAME], [ADDRESS] before signing.'}
                  {key === 'tcs' && 'Fill in [DATE] and [AGENCY NAME] throughout before presenting.'}
                </p>
              </CardHeader>
              <CardContent className="pt-2">
                {blocks.map(b => (
                  <CopyBlock key={b.title} title={b.title} text={b.text} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}