# 🚀 PREMISO LAUNCH - 14-DAY FAST TRACK PLAN

## Executive Summary

**Goal**: Launch Premiso commercially in 14 days with minimum viable setup  
**Budget**: £3,000-5,000 one-time + £50-100/month recurring  
**Target**: 5-10 paying customers in first 30 days

---

## 📅 DAY-BY-DAY ACTION PLAN

### **Days 1-2: Legal Foundation** (£2,000-3,000)

#### Day 1: Hire Solicitor
- [ ] Contact 3 SaaS/tech solicitors (compare quotes)
- [ ] Engage solicitor for:
  - Terms of Service
  - Privacy Policy (GDPR-compliant)
  - Data Processing Agreement template
- [ ] Provide them with:
  - Feature list
  - Data flows (what data you collect)
  - Third-party services (Base44, Stripe)
- **Cost**: £150-300/hour, expect 10-15 hours total
- **Deliverable**: Draft legal documents

#### Day 2: Company Setup
- [ ] Register limited company (if not done) - £12 (Companies House)
- [ ] Open business bank account (Starling, Monzo, or traditional)
- [ ] Register for VAT (if expecting >£85k/year turnover)
- [ ] Get company insurance quotes:
  - Professional indemnity (£1-2M)
  - Cyber liability
- **Cost**: £500-1,000/year for insurance

---

### **Days 3-4: Domain & Branding** (£50-100)

#### Day 3: Domain & Email
- [ ] Check domain availability:
  - premiso.co.uk (preferred)
  - getpremiso.com
  - premiso.io
- [ ] Purchase domain (£10-15/year)
- [ ] Set up Google Workspace (£6/month):
  - hello@premiso.co.uk
  - support@premiso.co.uk
  - your.name@premiso.co.uk
- [ ] Configure DNS records (will use later for Base44)

#### Day 4: Branding Basics
- [ ] Finalize logo (use existing or create on Canva - free)
- [ ] Create brand guidelines (colors, fonts, tone)
- [ ] Set up social media profiles:
  - LinkedIn company page
  - Twitter/X (@premiso)
- [ ] Create email signature template

---

### **Days 5-6: Payment Infrastructure** (Critical!)

#### Day 5: Stripe Live Setup
- [ ] Log into Stripe dashboard
- [ ] Switch from test mode → live mode
- [ ] Complete verification:
  - Company registration number
  - Director details
  - Bank account for payouts
- [ ] Generate live API keys:
  - Publishable key
  - Secret key
- [ ] Update Base44 secrets:
  - Replace `STRIPE_SECRET_KEY` with live key
- [ ] Configure Stripe Billing:
  - Create 3 subscription products (Starter/Pro/Enterprise)
  - Set prices (£49/£99/£199 recommended)
  - Enable 14-day free trial

#### Day 6: Stripe Webhooks
- [ ] Create webhook endpoint in Base44:
  - Function: `handleStripeWebhook.js`
  - Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
- [ ] Get webhook URL from Base44 function
- [ ] Add webhook in Stripe dashboard:
  - URL: [your-base44-function-url]
  - Events: select relevant ones
- [ ] Copy webhook secret → add to Base44 secrets as `STRIPE_WEBHOOK_SECRET`
- [ ] Test webhook with Stripe CLI or dashboard

---

### **Days 7-8: Production Infrastructure**

#### Day 7: Base44 Setup
- [ ] Upgrade Base44 to Builder plan (£25/month)
  - Required for custom domain
- [ ] Configure custom domain in Base44:
  - Add domain (premiso.co.uk)
  - Get DNS records from Base44
  - Update DNS at domain registrar:
    - A record or CNAME
    - Wait 24-48 hours for propagation
- [ ] Set up production secrets:
  - STRIPE_SECRET_KEY (live)
  - STRIPE_WEBHOOK_SECRET
  - Any other API keys

#### Day 8: Monitoring & Analytics
- [ ] Set up UptimeRobot (free):
  - Add your app URL
  - 5-minute checks
  - Email alerts for downtime
- [ ] Set up Sentry (free tier):
  - Create project
  - Add Sentry SDK to app
  - Configure error tracking
- [ ] Set up Google Analytics 4:
  - Create GA4 property
  - Add tracking code to `index.html`
  - Configure conversion events (sign-ups, payments)
- [ ] Create monitoring dashboard (Google Sheets or Notion)

---

### **Days 9-10: Support Infrastructure**

#### Day 9: Help Documentation
- [ ] Create knowledge base (Notion - free):
  - Getting Started Guide
  - Feature tutorials (10-15 articles)
  - FAQ section
  - Publish as public website
- [ ] Record onboarding videos (Loom - free):
  - Welcome video (2 mins)
  - How to add properties (5 mins)
  - Compliance dashboard walkthrough (5 mins)
  - Payment/billing setup (3 mins)
- [ ] Create in-app help tooltips

#### Day 10: Support System
- [ ] Set up support email forwarding:
  - support@premiso.co.uk → your inbox
- [ ] Create support ticket template (Google Forms - free):
  - Issue type
  - Priority
  - Description
  - Screenshot upload
- [ ] Draft email templates:
  - Welcome email
  - Support response templates
  - Bug acknowledgment
- [ ] Set up auto-responder for support email

---

### **Days 11-12: Marketing & Launch Prep**

#### Day 11: Website Content
- [ ] Create landing page sections:
  - Hero: "Premiso - Compliance-Driven Property Management"
  - Problem: "Managing compliance is complex and risky"
  - Solution: "Automated tracking, real-time alerts, zero stress"
  - Features: 6-8 key features with icons
  - Pricing: 3 tiers with clear value
  - Testimonials: Get 2-3 beta user quotes
  - CTA: "Start 14-Day Free Trial"
- [ ] Write about us page (your story, mission)
- [ ] Create contact page

#### Day 12: Launch Announcement
- [ ] Draft press release:
  - Headline: "Premiso Launches First Compliance-Driven Property Management Platform"
  - Key points: 65% compliance coverage, penalty tracking, automated alerts
  - Quote from founder
  - Contact info
- [ ] Schedule social media posts (Buffer - free tier):
  - LinkedIn: Launch announcement, feature highlights
  - Twitter: Thread on compliance challenges
- [ ] Prepare email campaign:
  - Write email to waitlist/contacts
  - Schedule for launch day

---

### **Day 13: Final Testing**

#### Full User Journey Testing
- [ ] Test complete flow:
  1. Visit website → click "Start Free Trial"
  2. Sign up (new user registration)
  3. Onboarding flow
  4. Add sample property
  5. View compliance dashboard
  6. Upgrade to paid plan (test payment)
  7. Receive invoice email
  8. Contact support (test ticket)
- [ ] Fix any critical bugs found
- [ ] Test on multiple devices:
  - Desktop (Chrome, Firefox, Safari)
  - Mobile (iOS Safari, Android Chrome)
  - Tablet
- [ ] Check page load speeds (aim for <3 seconds)

---

### **Day 14: LAUNCH DAY! 🚀**

#### Morning (9:00 AM)
- [ ] Publish final version on Base44
- [ ] Verify custom domain is working
- [ ] Test payment flow one more time
- [ ] Send launch email to waitlist/contacts
- [ ] Post on LinkedIn/Twitter

#### Midday (12:00 PM)
- [ ] Share press release with:
  - Local business journals
  - Property industry publications
  - Tech blogs
- [ ] Post in relevant Facebook/LinkedIn groups:
  - Landlord associations
  - Property investor groups
  - Letting agent forums

#### Afternoon (3:00 PM)
- [ ] Monitor website traffic (Google Analytics)
- [ ] Watch for sign-ups
- [ ] Respond to inquiries immediately
- [ ] Track issues/bugs in real-time

#### Evening (6:00 PM)
- [ ] Review day 1 metrics:
  - Website visitors
  - Sign-ups
  - Trial activations
  - Paid conversions
- [ ] Celebrate! 🎉

---

## 📊 LAUNCH DAY METRICS TO TRACK

| Metric | Target | Actual |
|--------|--------|--------|
| Website visitors | 50-100 | ___ |
| Sign-ups (trial) | 10-20 | ___ |
| Trial activations | 5-10 | ___ |
| Paid conversions | 2-5 | ___ |
| MRR (Monthly Recurring Revenue) | £100-250 | ___ |
| Support tickets | 0-5 | ___ |

---

## 🎯 POST-LANCH WEEKS 2-4

### Week 2: Customer Feedback
- [ ] Onboard first customers personally (offer 1:1 setup call)
- [ ] Collect feedback on:
  - Ease of use
  - Missing features
  - Pricing perception
  - Compliance value
- [ ] Fix top 3 issues reported
- [ ] Create case study from first happy customer

### Week 3: Marketing Push
- [ ] Start Google Ads (£20-50/day):
  - Keywords: "property management software", "landlord compliance software"
  - Landing page: Dedicated PPC landing page
- [ ] LinkedIn outreach:
  - Connect with 50-100 property managers/landlords
  - Share valuable compliance content
- [ ] Content marketing:
  - Publish 2 blog posts (compliance topics)
  - Share on social media

### Week 4: Optimization
- [ ] Analyze conversion funnel:
  - Website → Sign-up conversion rate
  - Trial → Paid conversion rate
- [ ] A/B test pricing page (if possible)
- [ ] Improve onboarding based on feedback
- [ ] Plan next 30 days based on learnings

---

## 💰 BUDGET BREAKDOWN (14-Day Fast Track)

### One-Time Costs
| Item | Cost |
|------|------|
| Legal (ToS, Privacy, DPA) | £2,000-3,000 |
| Company registration | £12 |
| Domain (1 year) | £15 |
| Insurance (annual) | £500-1,000 |
| **Total** | **£2,527-4,027** |

### Monthly Recurring
| Item | Cost |
|------|------|
| Base44 Builder plan | £25 |
| Google Workspace | £6 |
| UptimeRobot + Sentry | £0 (free tiers) |
| Stripe fees | 1.4% + 20p/transaction |
| **Total** | **£31/month** |

### Optional (Month 2+)
| Item | Cost |
|------|------|
| Google Ads | £500-2,000/month |
| Support ticketing (Zendesk) | £15-50/month |
| Marketing tools (Buffer, Canva Pro) | £20-40/month |

---

## ⚠️ CRITICAL SUCCESS FACTORS

### Must-Haves Before Launch
1. ✅ Legal documents (ToS, Privacy Policy)
2. ✅ Working payment system (Stripe live)
3. ✅ Custom domain configured
4. ✅ Support system ready
5. ✅ Monitoring in place

### Nice-to-Haves (Can Add Post-Launch)
- ⏳ Advanced analytics dashboard
- ⏳ Full help center (50+ articles)
- ⏳ Mobile app
- ⏳ Advanced integrations (Xero, QuickBooks)
- ⏳ Referral program

---

## 🆘 CONTINGENCY PLAN

### If Launch is Delayed:
- **Legal takes too long**: Use template services (TermsFeed, PrivacyPolicies.com) - £100-300, 1-2 days
- **Stripe verification delayed**: Use Stripe's instant activation for UK companies
- **Domain issues**: Use Base44 subdomain temporarily (premiso.base44.app)
- **Critical bugs**: Delay launch by 3-5 days, fix, then launch

### If No Customers in Week 1:
- Reach out to personal network (landlords, agents you know)
- Offer 50% discount for first 10 customers (limited time)
- Post in landlord forums/Facebook groups
- Run £100 Google Ads test

---

## 📞 YOUR ACTION RIGHT NOW

**Choose your launch strategy:**

**Option A: 14-Day Fast Track** (this document)
- Launch quickly, iterate based on feedback
- Best if: You have budget (£3-5k), want to validate fast

**Option B: 30-Day Methodical Launch**
- Complete full checklist from LAUNCH_CHECKLIST.md
- Best if: You want more preparation, lower budget

**Option C: Validate First (1-2 weeks)**
- Talk to 20 potential customers BEFORE building/launching
- Validate pricing, features, willingness to pay
- Then proceed with Option A or B
- Best if: You're unsure about product-market fit

---

**Which option do you choose?** I'll then create a detailed day-by-day calendar with specific tasks, deadlines, and accountability checkpoints.