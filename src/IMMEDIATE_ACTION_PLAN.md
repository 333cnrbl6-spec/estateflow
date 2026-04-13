# 🎯 PREMISO - IMMEDIATE ACTION PLAN (Next 7 Days)

## Current Status Assessment

### ✅ What's Already Done
- **Product**: Fully functional compliance-driven property management platform
- **Compliance Features**: 65% coverage (15 compliance areas tracked)
- **Entities**: 20+ entities with proper relationships
- **Automations**: Certificate expiry alerts, compliance checking
- **Dashboard**: Unified compliance dashboard with penalty tracking
- **Payment Infrastructure**: Stripe integration exists (test mode)

### ⚠️ What's Missing for Commercial Launch
1. **Legal**: No Terms of Service, Privacy Policy, or DPA
2. **Domain**: Using Base44 subdomain, no custom domain
3. **Payments**: Stripe in test mode, no live pricing configured
4. **Support**: No help docs, ticketing system, or support email
5. **Monitoring**: No uptime monitoring or error tracking
6. **Marketing**: No landing page, pricing page, or launch plan

---

## 📅 7-DAY SPRINT TO LAUNCH READINESS

### **Day 1 (Today): Legal Foundation** ⚖️

#### Morning (9:00-12:00)
**Task**: Engage solicitor for legal documents

**Action Steps**:
1. Search for "SaaS solicitor UK" or "tech lawyer UK"
2. Contact 3 firms for quotes (expect £150-300/hour)
3. Brief them on:
   - Premiso is a property management SaaS
   - Need: ToS, Privacy Policy (GDPR), DPA template
   - Timeline: 3-5 business days
   - Budget: £2,000-3,000

**Recommended Firms**:
- **Harper James** (fixed-fee packages for startups)
- **LawBite** (online legal services, £1,500-3,000 packages)
- **Freelance solicitors** on Lexoo (£100-200/hour)

**Alternative (DIY if budget tight)**:
- Use **TermsFeed** (£100-300 one-time)
- Use **PrivacyPolicies.com** (£50-100)
- Use **GDPR- compliant template** from ICO website (free)
- **Risk**: Less customized, but faster/cheaper

#### Afternoon (14:00-17:00)
**Task**: Company setup (if not done)

**Action Steps**:
1. Register limited company at Companies House (£12, same-day)
   - Or use Companies Made Simple (£25-50 with registered office)
2. Open business bank account:
   - **Starling/Monzo** (free, instant setup)
   - **High street banks** (Barclays, HSBC - may take 1-2 weeks)
3. Register for VAT (optional if <£85k expected turnover)

**Deliverables by End of Day 1**:
- [ ] Solicitor engaged OR DIY templates ordered
- [ ] Company registered
- [ ] Business bank account opened

---

### **Day 2: Domain & Branding** 🌐

#### Morning (9:00-12:00)
**Task**: Secure domain and email

**Action Steps**:
1. Check domain availability:
   - **Namecheap.com** or **GoDaddy.com**
   - Try: `premiso.co.uk`, `getpremiso.com`, `premiso.io`
   - Cost: £10-15/year

2. Purchase domain
3. Set up Google Workspace (£6/month):
   - Create emails: `hello@`, `support@`, `yourname@`
   - Configure DNS at domain registrar
   - Wait 2-4 hours for email activation

#### Afternoon (14:00-17:00)
**Task**: Branding basics

**Action Steps**:
1. Finalize logo:
   - Use existing Premiso logo
   - Or create on **Canva** (free) in 30 minutes
2. Create brand guidelines (1-page doc):
   - Colors: Navy blue (#1E3A8A), gold accent (#F59E0B)
   - Fonts: Inter (sans-serif), Playfair Display (serif) - already in use
   - Tone: Professional, trustworthy, compliance-focused
3. Set up social profiles (30 mins each):
   - **LinkedIn Company Page**: Upload logo, description, website
   - **Twitter/X**: @premiso, bio, profile image
   - **Facebook Page** (optional)

**Deliverables by End of Day 2**:
- [ ] Domain purchased
- [ ] Email addresses active
- [ ] Logo finalized
- [ ] Social profiles created

---

### **Day 3: Stripe Live Configuration** 💳

#### Morning (9:00-12:00)
**Task**: Upgrade Stripe to live mode

**Action Steps**:
1. Log into **Stripe Dashboard** (dashboard.stripe.com)
2. Switch from "Test Mode" → "Live Mode" (toggle in top-right)
3. Complete verification:
   - Company details (name, registration number, address)
   - Director details (name, DOB, address)
   - Bank account for payouts (sort code, account number)
   - Business description (property management SaaS)
4. Wait for verification (usually instant for UK companies)

#### Afternoon (14:00-17:00)
**Task**: Configure Stripe Billing

**Action Steps**:
1. Create subscription products in Stripe:
   - **Starter Plan**: £49/month
     - Up to 10 units
     - Basic compliance tracking
     - Email support
   - **Professional Plan**: £99/month
     - Up to 50 units
     - Full compliance dashboard
     - Priority email support
     - Automated alerts
   - **Enterprise Plan**: £199/month
     - Unlimited units
     - All features
     - Phone support
     - Custom onboarding
2. Enable 14-day free trial (no credit card required)
3. Generate live API keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)
4. Update Base44 secrets:
   - Go to Base44 dashboard → Settings → Secrets
   - Replace `STRIPE_SECRET_KEY` with live key
   - Save

**Deliverables by End of Day 3**:
- [ ] Stripe verified and in live mode
- [ ] 3 pricing tiers created
- [ ] Live API keys configured in Base44

---

### **Day 4: Stripe Webhooks & Payment Flow** 🔗

#### Morning (9:00-12:00)
**Task**: Create webhook handler function

**Action Steps**:
1. Create backend function in Base44:
   - File: `functions/handleStripeWebhook.js`
   - Purpose: Listen for Stripe events (payment success, subscription changes)
2. Implement webhook handler:
   ```javascript
   import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
   import Stripe from 'npm:stripe@14.0.0';

   const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

   Deno.serve(async (req) => {
     try {
       const base44 = createClientFromRequest(req);
       const body = await req.text();
       const signature = req.headers.get("stripe-signature");

       // Verify webhook signature
       const event = await stripe.webhooks.constructEventAsync(
         body,
         signature,
         Deno.env.get("STRIPE_WEBHOOK_SECRET")
       );

       // Handle different event types
       switch (event.type) {
         case "checkout.session.completed":
           // Activate user subscription
           break;
         case "invoice.paid":
           // Send receipt email
           break;
         case "customer.subscription.deleted":
           // Downgrade user account
           break;
       }

       return Response.json({ received: true });
     } catch (error) {
       return Response.json({ error: error.message }, { status: 400 });
     }
   });
   ```
3. Deploy function and get URL (e.g., `https://your-app.base44.app/functions/handleStripeWebhook`)

#### Afternoon (14:00-17:00)
**Task**: Configure Stripe webhooks

**Action Steps**:
1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint:
   - URL: Your Base44 function URL from above
   - Events to listen for:
     - `checkout.session.completed`
     - `invoice.paid`
     - `payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
3. Copy **webhook signing secret** (starts with `whsec_`)
4. Add to Base44 secrets as `STRIPE_WEBHOOK_SECRET`
5. Test webhook:
   - Use "Send test notification" in Stripe
   - Check Base44 function logs for successful receipt

**Deliverables by End of Day 4**:
- [ ] Webhook handler function deployed
- [ ] Webhook configured in Stripe
- [ ] Webhook secret stored in Base44
- [ ] Test webhook successful

---

### **Day 5: Production Infrastructure** 🏗️

#### Morning (9:00-12:00)
**Task**: Upgrade Base44 and configure custom domain

**Action Steps**:
1. Upgrade Base44 plan:
   - Go to Base44 dashboard → Settings → Billing
   - Upgrade to **Builder Plan** (£25/month)
   - Required for custom domain support
2. Configure custom domain:
   - Base44 Dashboard → Settings → Custom Domain
   - Add domain: `premiso.co.uk` or `app.premiso.co.uk`
   - Get DNS records from Base44 (CNAME or A record)
3. Update DNS at domain registrar:
   - Log into Namecheap/GoDaddy
   - Add CNAME record:
     - Host: `www` or `app`
     - Value: Base44-provided domain
   - Or A record:
     - Host: `@`
     - Value: Base44 IP address
4. Wait 24-48 hours for DNS propagation

#### Afternoon (14:00-17:00)
**Task**: Set up monitoring and analytics

**Action Steps**:
1. **UptimeRobot** (free):
   - Sign up at uptimerobot.com
   - Add monitor: Your app URL
   - Check interval: 5 minutes
   - Alerts: Email when down
2. **Sentry** (free tier - 5k errors/month):
   - Sign up at sentry.io
   - Create project (React)
   - Add Sentry SDK to `main.jsx`:
     ```javascript
     import * as Sentry from "@sentry/react";

     Sentry.init({
       dsn: "your-dsn-from-sentry",
       integrations: [new Sentry.BrowserTracing()],
       tracesSampleRate: 1.0,
     });
     ```
   - Test error tracking
3. **Google Analytics 4** (free):
   - Create GA4 property at analytics.google.com
   - Add tracking code to `index.html` (before `</head>`)
   - Configure conversion events:
     - `sign_up`: When user registers
     - `start_trial`: When trial starts
     - `purchase`: When payment succeeds

**Deliverables by End of Day 5**:
- [ ] Base44 upgraded to Builder plan
- [ ] Custom domain configured (DNS updated)
- [ ] Uptime monitoring active
- [ ] Error tracking configured
- [ ] Analytics tracking installed

---

### **Day 6: Support & Documentation** 📚

#### Morning (9:00-12:00)
**Task**: Create help documentation

**Action Steps**:
1. Set up **Notion** knowledge base (free):
   - Create workspace: "Premiso Help Center"
   - Make pages public
   - Structure:
     - Getting Started (5 articles)
     - Features (10 articles)
     - Compliance (5 articles)
     - Billing & Account (3 articles)
     - FAQ (10 questions)
2. Write core articles (2-3 hours):
   - "How to add your first property"
   - "Understanding compliance dashboard"
   - "Setting up certificate alerts"
   - "Managing subscriptions and billing"
3. Publish as website:
   - Notion → Share → Publish to web
   - Custom domain: `help.premiso.co.uk` (optional)

#### Afternoon (14:00-17:00)
**Task**: Record onboarding videos

**Action Steps**:
1. Use **Loom** (free tier - 25 videos):
   - Install Loom Chrome extension
2. Record 5 core videos (5-10 mins each):
   - **Welcome to Premiso** (2 mins): Overview, value prop
   - **Adding Properties** (5 mins): Step-by-step demo
   - **Compliance Dashboard** (7 mins): How to use, alerts
   - **Managing Tenants** (5 mins): Add, track, communicate
   - **Billing Setup** (3 mins): Subscription, payment methods
3. Upload to Loom → Get shareable links
4. Embed in Notion help docs or create video library page

**Deliverables by End of Day 6**:
- [ ] Help center with 20+ articles
- [ ] 5 onboarding videos recorded
- [ ] Support email configured (`support@premiso.co.uk`)

---

### **Day 7: Final Testing & Launch Prep** 🚀

#### Morning (9:00-12:00)
**Task**: Full user journey testing

**Action Steps**:
1. Test complete flow (fresh browser, incognito mode):
   - Visit website → Click "Start Free Trial"
   - Register new account
   - Complete onboarding
   - Add sample property
   - View compliance dashboard
   - Upgrade to paid plan (use real card in live Stripe)
   - Receive invoice email
   - Contact support (send test email)
2. Test on multiple devices:
   - Desktop (Chrome, Firefox, Safari, Edge)
   - Mobile (iOS Safari, Android Chrome)
   - Tablet (if available)
3. Check page load speeds:
   - Use **PageSpeed Insights** (aim for >80 score)
   - Use **WebPageTest** for detailed analysis
4. Fix any critical bugs found

#### Afternoon (14:00-17:00)
**Task**: Launch announcement prep

**Action Steps**:
1. Draft press release:
   - Headline: "Premiso Launches First Compliance-Driven Property Management Platform"
   - Subhead: "Automated tracking of 15 compliance areas prevents £500k+ in potential penalties"
   - Body: 300-400 words on problem, solution, features
   - Quote: Your quote as founder
   - Contact: Your email/phone
2. Prepare social media posts:
   - **LinkedIn**: Launch announcement + link
   - **Twitter**: Thread on compliance challenges (5-7 tweets)
   - **Facebook**: Post with app screenshot
3. Write launch email:
   - Subject: "Premiso is Live - Start Your 14-Day Free Trial"
   - Body: Welcome, key features, CTA to trial
   - Recipients: Your contacts, waitlist (if any)

#### Evening (18:00-19:00)
**Task**: Final checklist review

**Review**:
- [ ] Legal documents received/created
- [ ] Domain working (premiso.co.uk loads app)
- [ ] Stripe live mode + webhooks working
- [ ] Support email active
- [ ] Help docs published
- [ ] Monitoring configured
- [ ] Analytics tracking
- [ ] All critical bugs fixed

**Deliverables by End of Day 7**:
- [ ] Launch readiness confirmed
- [ ] Press release ready
- [ ] Social posts scheduled
- [ ] Launch email drafted
- [ ] **READY TO LAUNCH TOMORROW!** 🎉

---

## 🎯 SUCCESS CRITERIA (After 7 Days)

### Must-Have (Non-Negotiable)
- ✅ Legal: ToS + Privacy Policy published
- ✅ Domain: Custom domain working
- ✅ Payments: Stripe live, can accept payments
- ✅ Support: Email + help docs available
- ✅ Monitoring: Uptime + error tracking active

### Nice-to-Have (Can Add Later)
- ⏳ Full video library (10+ videos)
- ⏳ Advanced analytics dashboard
- ⏳ Live chat support
- ⏳ Mobile app
- ⏳ Integrations (Xero, QuickBooks)

---

## 💰 7-DAY SPRINT BUDGET

| Item | Cost |
|------|------|
| Legal (solicitor) | £2,000-3,000 |
| Company registration | £12 |
| Domain (1 year) | £15 |
| Base44 Builder (monthly) | £25 |
| Google Workspace (monthly) | £6 |
| Insurance (annual) | £500-1,000 |
| **Total One-Time** | **£2,552-4,052** |
| **Total Monthly** | **£31/month** |

**DIY Legal Alternative**:
- TermsFeed + PrivacyPolicies.com: £150-400 one-time
- **Total One-Time**: £677-1,427 (saves £1,600-2,600)

---

## 🆘 IF YOU GET STUCK

### Common Blockers & Solutions:

**Problem**: Solicitor too expensive/slow
- **Solution**: Use TermsFeed (£100, instant)

**Problem**: Stripe verification delayed
- **Solution**: UK companies usually get instant approval. If delayed, contact Stripe support

**Problem**: DNS not propagating
- **Solution**: Use Base44 subdomain temporarily (premiso.base44.app), switch domain later

**Problem**: Critical bug found on Day 7
- **Solution**: Fix within 24 hours, delay launch by 1 day max. Don't delay more than 48 hours.

**Problem**: No customers signing up
- **Solution**: Reach out to personal network, offer 50% founding customer discount

---

## 📞 YOUR NEXT ACTION (Right Now)

**Choose your path:**

### Path A: 7-Day Sprint (Recommended)
- Follow this exact plan
- Launch in 7 days
- Budget: £2,500-4,000

### Path B: 14-Day Relaxed Launch
- Follow LAUNCH_FAST_TRACK.md
- More time for each task
- Budget: £3,000-5,000

### Path C: Validate First (Lowest Risk)
- Spend 1 week talking to 20 potential customers
- Validate pricing, features, demand
- Then proceed with Path A or B
- Budget: £0-500 (before full launch)

---

**Which path do you choose?** I'll then:
1. Create a detailed hourly calendar for your chosen path
2. Set up accountability checkpoints
3. Provide templates (emails, press release, social posts)
4. Help you execute day-by-day

**Let me know and we'll start immediately!** 🚀