# Landing Page A/B Test Setup — Benefit Messaging

**Goal:** Validate that new hero messaging ("One dashboard. All your properties.") outperforms original.

**Timeline:** 2 weeks | **Sample size needed:** ~200–300 visitors per variant | **Success metric:** +15% CTR on "Start Free Trial"

---

## TEST STRUCTURE

### Variant A (CONTROL — Original Copy)
**What:** Current landing page messaging  
**Hero headline:** "Property management finally done right"  
**Subheading:** "Premiso is the all-in-one platform for everyone..."  
**CTA:** "Start Free Trial" + "See a Demo"

### Variant B (NEW — Benefit-Led Copy)
**What:** New messaging (shipped today)  
**Hero headline:** "One dashboard. All your properties."  
**Subheading:** "Compliance alerts, tenant management, maintenance scheduling, and financial reporting—all automatic, all in one place."  
**CTA:** "Start Free Trial" + "See a Demo" (same)

---

## SETUP IN GOOGLE OPTIMIZE (Free)

### Prerequisites
- [ ] Google Analytics 4 (GA4) installed on landing page
- [ ] Google Account

### Steps

**1. Go to Google Analytics → Google Optimize**
- Navigate to [optimize.google.com](https://optimize.google.com)
- Link to your GA4 property

**2. Create New Experiment**
- Click "+ Create Experiment"
- Name: "Landing Hero Copy Test"
- Select: A/B test

**3. Configure Pages**
- Enter landing page URL: `https://premiso.io` (or your domain)
- Traffic allocation: 50/50 split (both variants get equal traffic)

**4. Set Up Variant B**
- Clone the live page
- Edit HTML in the Optimize editor:
  - Find `<h1>` tag → Replace with "One dashboard.<br>All your properties."
  - Find main `<p>` → Replace with new subheading
  - Save

**5. Define Goal (Conversion)**
- Goal type: "Click element"
- Element: "Start Free Trial" button
- Track any clicks on this button as conversion

**6. Set Traffic %**
- 50% original, 50% variant B
- Let run for 2 weeks

**7. Launch**
- Click "Start experiment"

---

## SETUP IN UNBOUNCE (If You Use A/B Testing Tool)

**If you built landing page in Unbounce:**

1. Clone existing page
2. Edit headline + subheading
3. Set 50/50 split
4. Define conversion goal: "Click Start Free Trial"
5. Run for 14 days
6. Review results in Unbounce dashboard

---

## SETUP MANUALLY (If No A/B Tool)

**If you want to test without fancy tools:**

1. Create duplicate landing page: `premiso.io/landing-test` (Variant B)
2. Use URL parameters to track:
   - Original: Add `?variant=A` to all links
   - Test: Add `?variant=B` to test links
3. In Google Analytics:
   - Create segment: "Variant A" (UTM parameter = A)
   - Create segment: "Variant B" (UTM parameter = B)
4. Send 50% of traffic to each URL (flip a coin or use random redirector)
5. Compare conversion rates weekly

---

## GA4 EVENT TRACKING SETUP

**Important:** Make sure GA4 is tracking the CTA clicks.

### Option 1: Automatic (If Using GA4 + Google Tag Manager)
- GA4 automatically tracks "click" events on buttons
- No setup needed, just review in GA4 dashboard

### Option 2: Manual (Add to Your HTML)
```html
<!-- Add this to your "Start Free Trial" button -->
<button 
  id="cta-button" 
  onclick="gtag('event', 'cta_click', {'variant': 'A'});"
>
  Start Free Trial
</button>
```

For Variant B, change `'variant': 'B'`.

### Option 3: Google Tag Manager (Easiest)
1. Go to Google Tag Manager
2. Create new tag: "CTA Click Tracking"
3. Event name: "cta_click"
4. Add custom dimension: `variant = A` (or B)
5. Trigger on button click

---

## METRICS TO TRACK

| Metric | Target | Measurement |
|--------|--------|-------------|
| **CTR on "Start Free Trial"** | +15% from baseline | Sessions → Conversions |
| **Bounce rate** | -5% | Sessions that leave without clicking |
| **Avg session duration** | +10 seconds | Time spent on page (reads more content) |
| **Form completions** | +10% | Signups for free trial |
| **Cost per conversion** | -10% | (If running ads) |

---

## BASELINE TO COMPARE AGAINST

**Before launching test, document current performance:**

```
VARIANT A (ORIGINAL) — Week of [Date]
- Sessions: [X]
- CTA clicks: [Y]
- CTR: Y/X = [Z]%
- Form completions: [N]
- Bounce rate: [B]%
- Avg session duration: [T] seconds
```

**Paste real numbers here so you can compare vs Variant B after 2 weeks.**

---

## ANALYSIS AFTER 2 WEEKS

### Check Results In GA4

1. Go to GA4 dashboard
2. Create custom report:
   - Dimension: "Page title" or "UTM parameter"
   - Metric: "Click event count" (CTA clicks)
   - Metric: "Sessions"
3. Calculate CTR for each variant
4. Check bounce rate (Engagement → Overview)
5. Check conversion rate (Events → cta_click)

### Statistical Significance

**Questions to ask:**
- Is difference >15% (your target)? 
- Did Variant B win or tie?
- Does sample size look good (~200+ per variant)?

**If Variant B wins:**
- ✓ Make it live permanently
- ✓ Document the win (blog post: "A/B test results")
- ✓ Apply similar messaging to other pages

**If tie or Variant A wins:**
- Test different copy variations
- Run longer (extend to 3–4 weeks)
- Consider messaging may not be the bottleneck (could be design, CTA placement, etc.)

---

## OPTIONAL: TEST ADDITIONAL COPY VARIATIONS

**After 2 weeks, if Variant B is winning, try:**

### Variant C (Different Angle)
**Headline:** "Never miss a compliance deadline again"  
**Subheading:** "Built for UK landlords. Compliance alerts, tenant portal, financial reporting—everything automatic."

### Variant D (Pain-First)
**Headline:** "Stop juggling 5 systems"  
**Subheading:** "One platform for properties, tenants, compliance, and finances. Designed for UK property managers."

**Run C vs B vs A for 3 weeks, measure which wins.**

---

## WHAT TO TRACK LONG-TERM

Even after winning variant goes live, monitor:

- [ ] Weekly CTA click rate (did it improve?)
- [ ] Monthly form completions (more signups?)
- [ ] Quarterly: Do these signups convert to paying customers? (Check ChartMogul or Stripe)
- [ ] Quarterly: Is messaging consistent across all pages? (Update copy on other pages too)

---

## CTA ELEMENTS NOT TO TEST RIGHT NOW

**Focus on messaging only. Don't change:**
- ❌ Button color (already amber, good contrast)
- ❌ Button size (already prominent)
- ❌ Button placement (already above-fold)
- ❌ Form fields (keep it simple)

**Why?** Multiple changes = can't tell what drove the win. Change only copy this round.

---

## TIMELINE

| Week | Action |
|------|--------|
| Week 1 (Apr 16–22) | Set up test, launch Variant A vs B |
| Week 2 (Apr 23–29) | Monitor traffic, no changes |
| Week 3 (Apr 30–May 6) | Collect results, analyze, decide |
| Week 4 (May 7–13) | Implement winner, document findings |
| Week 5+ | Apply learnings to other pages |

---

## SUCCESS CRITERIA

| Outcome | Action |
|---------|--------|
| Variant B wins by >15% | 🎉 Make permanent, share results |
| Variant B wins by 5–15% | 📊 Extend test to 3 weeks |
| Tie (within 5%) | 🔄 Try different copy angles, extend test |
| Variant A wins | 🔎 Question messaging assumption, test other variables |

---

## QUICK REFERENCE

**GA4 Report Structure:**
1. Explore → Free Form → Custom Report
2. Dimensions: Page title, UTM parameter (for traffic source)
3. Metrics: Sessions, Events (filtered to cta_click), Conversion rate
4. Segment by variant (if using UTM params)

**Optimize Dashboard:**
1. Experiments → Your test name
2. Scroll to "Results" section
3. Look for:
   - Variant B conversion rate vs Variant A
   - Confidence level (should be >95% for significance)
   - Improvement % (your +15% target)

**Key Pages to Update (If B Wins):**
- [ ] Landing page hero
- [ ] Dashboard page (update value prop)
- [ ] Onboarding step 1
- [ ] Email welcome sequence
- [ ] All ad copy (Google Ads, LinkedIn, Facebook)

---

## QUESTIONS TO ANSWER

**Before launching:** 
- What's your current landing page CTR? (Document it)
- How much traffic hits landing page weekly? (Need 200+/week for meaningful test)
- Is GA4 properly installed? (Test by clicking button, check if event fires)

**After launching:**
- Which variant had higher click-through rate?
- Which variant had lower bounce rate?
- Did one variant drive more form completions?
- Is the difference statistically significant?

---

**Confidence Check:** If you can't answer "What's our current CTR?" before launching this test, spend 1 hour reviewing GA4 first. Baseline is critical.

Starting this test = validation that your market positioning hypothesis is correct. Do this first, then scale messaging everywhere else (ads, email, social).