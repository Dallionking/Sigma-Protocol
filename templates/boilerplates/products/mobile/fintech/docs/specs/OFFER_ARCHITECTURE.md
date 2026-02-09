# Trading Platform - Offer Architecture

**Version:** 1.0  
**Date:** 2025-12-11  
**Status:** Approved  
**Offer Name:** The Trading Protocol

---

## Offer Summary

**Grand Slam Offer Statement:**
> "We help tech-savvy professionals achieve passive income growth in 24 hours without learning trading, analyzing charts, or making a single investment decision—and if you don't see your first AI-generated returns within 48 hours, you get your first month free."

**The Trading Protocol** transforms the intimidating world of investing into a futuristic, one-tap experience that feels like you're running a digital money vault from a sci-fi movie.

---

## 💰 COGS Analysis (Cost of Goods Sold)

### Variable Costs Per User (Monthly)

| Cost Center | Calculation | Monthly Cost |
|-------------|-------------|--------------|
| **Supabase Database** | 0.5 GB storage × $0.125 + 2M requests × $2/million | $0.25 |
| **Plaid Bank Linking** | $0.30 initial + $0 ongoing (token-based) | ~$0.05 amortized |
| **Render Backend** | Shared compute ($25 base ÷ 1000 users) | $0.025 |
| **Cloudflare Edge** | Free tier (generous) | $0.00 |
| **RevenueCat** | 1% of revenue (after $2.5K free tier) | $0.08-$0.25 |
| **Expo Push Notifications** | Free tier covers 100K/month | $0.00 |
| **Apple App Store Fee** | 15-30% of subscription revenue | Included in pricing |
| **Support Allocation** | ~0.1 tickets/user × $5/ticket | $0.50 |
| **TOTAL COGS/USER** | | **~$1.00-$1.50** |

### Apple App Store Pricing Impact

| User Price | Apple Cut (15%) | Net Revenue | COGS | Gross Margin |
|------------|-----------------|-------------|------|--------------|
| $7/month | $1.05 | $5.95 | $1.25 | **$4.70 (79%)** |
| $15/month | $2.25 | $12.75 | $1.25 | **$11.50 (90%)** |
| $29/month | $4.35 | $24.65 | $1.25 | **$23.40 (95%)** |

### Pricing Floor Calculation

- **COGS/user:** ~$1.25/month (conservative)
- **Minimum 3x margin:** $3.75/month
- **Target 5x margin (SaaS standard):** $6.25/month
- **Premium 10x margin:** $12.50/month

✅ **Current pricing ($7-$29) delivers 5x-20x margins—excellent unit economics.**

---

## 🎯 Target Avatar (Refined for Offer)

### Primary Avatar: "Tech-Savvy Tyler"

| Attribute | Detail |
|-----------|--------|
| **Who** | Software developers, designers, tech workers, 25-35 years old |
| **Income** | $60-150K annually |
| **Current State** | Knows they SHOULD invest but paralyzed by options. Hates boring finance apps. Money sitting in savings earning nothing. |
| **Dream State** | Wake up to notifications showing money grew overnight. Zero mental load. Feeling smart and futuristic. Early retirement on track. |
| **Trigger Event** | Sees friend's passive income post. Gets a raise and wonders where to put it. Reads about "AI investing" and gets curious. |

### Avatar Score (Hormozi's 4 Indicators)

| Indicator | Score | Evidence |
|-----------|-------|----------|
| **Massive Pain** | 9/10 | Analysis paralysis costs them thousands in opportunity cost yearly |
| **Purchasing Power** | 9/10 | $60-150K income, already pays for premium apps/subscriptions |
| **Easy to Target** | 8/10 | Reddit, Twitter tech circles, developer communities, Discord |
| **Growing Market** | 10/10 | Passive income interest exploding (2B+ TikTok views), AI hype peak |
| **TOTAL** | **36/40** | Excellent avatar fit |

### Dream Outcome Statement

> "We help **tech-savvy professionals** achieve **passive income growth** in **24 hours** without **learning trading** or **making investment decisions**."

---

## 🔧 Problem → Solution Matrix

### Problem 1: "I don't know where to start" (Analysis Paralysis)

| Aspect | Detail |
|--------|--------|
| **Pain Statement** | "I want to invest but there are too many options. ETFs, stocks, bonds, crypto—I freeze and do nothing." |
| **Solution** | "One toggle, three risk levels. The AI does everything else." |
| **Delivery** | Auto-Invest activation with Safe/Balanced/Aggressive selector |
| **Value Driver** | ↓ Effort & Sacrifice (eliminate all decisions) |

### Problem 2: "Investment apps feel boring and intimidating"

| Aspect | Detail |
|--------|--------|
| **Pain Statement** | "Every finance app looks the same—corporate blue, confusing charts, makes me feel dumb." |
| **Solution** | "A wealth app that feels like you're in a sci-fi movie, not a bank." |
| **Delivery** | Cyberpunk UI: black OLED + indigo neon + zero charts |
| **Value Driver** | ↑ Dream Outcome (emotional experience, status, identity) |

### Problem 3: "I don't have time to learn trading"

| Aspect | Detail |
|--------|--------|
| **Pain Statement** | "I work 50+ hours a week. I can't add 'learn investing' to my plate." |
| **Solution** | "Your AI Trading Assistant works 24/7 so you don't have to." |
| **Delivery** | AI Engine Status dashboard showing active management |
| **Value Driver** | ↓ Time Delay + ↓ Effort (it's already running) |

### Problem 4: "I'm scared of losing money on wrong decisions"

| Aspect | Detail |
|--------|--------|
| **Pain Statement** | "What if I pick wrong? I could lose everything." |
| **Solution** | "Safe mode + AI confidence indicators + withdraw anytime." |
| **Delivery** | Risk slider with caps + real-time AI confidence display |
| **Value Driver** | ↑ Perceived Likelihood (trust signals + safety nets) |

### Problem 5: "Fees are confusing and feel predatory"

| Aspect | Detail |
|--------|--------|
| **Pain Statement** | "0.25% AUM? Per trade? Monthly? I never know what I'm paying." |
| **Solution** | "Simple monthly subscription. You always know the price." |
| **Delivery** | Clear tier pricing: $7 / $15 / $29 per month |
| **Value Driver** | ↑ Perceived Likelihood (transparency = trust) |

---

## 💰 Pricing Architecture

### Tier Structure (Decoy Strategy)

| Tier | Name | Monthly | Annual | Target Segment | Conversion Goal |
|------|------|---------|--------|----------------|-----------------|
| 1 | **Basic** | $7 | $70/yr | Testers, skeptics, small deposits | Anchor (make Pro look valuable) |
| 2 | **Pro** ⭐ | $15 | $150/yr | Core customers, engaged investors | **Primary revenue driver (target 60%)** |
| 3 | **Elite** | $29 | $290/yr | Power users, status seekers, high deposits | Premium positioning, identity play |

### Decoy Psychology

```
Basic ($7)     →  "This works, but I want more"
Pro ($15) ⭐         →  "Only $8 more for SO much more value" ← TARGET
Elite ($29)    →  "If I'm serious, this is for me"
```

### Feature Matrix

| Feature | Basic | Pro ⭐ | Elite |
|---------|---------------|----------|---------------|
| **Auto-Invest Engine** | ✅ Standard | ✅ Accelerated | ✅ Maximum Speed |
| **AI Cycle Frequency** | 1x/day | 4x/day | Real-time |
| **Balance Updates** | Daily | Hourly | Real-time |
| **Income Feed** | Last 7 days | Last 30 days | Full history |
| **AI Status Dashboard** | Basic (3 stats) | Enhanced (6 stats) | Full Dashboard |
| **Risk Customization** | 3 presets only | 3 presets + custom % | Full control + AI suggestions |
| **Notifications** | Daily summary | Customizable | Priority + Alerts |
| **Weekly Reports** | ❌ | ✅ Email summary | ✅ Detailed PDF |
| **Priority Support** | Community only | Email (24h response) | Priority (4h response) |
| **UI Experience** | Standard animations | Enhanced glows | Premium dashboard |
| **Deposit Limits** | $5,000/month | $25,000/month | Unlimited |
| **Founding Member Badge** | ❌ | ❌ | ✅ Exclusive |

### Annual Discount Strategy

| Tier | Monthly | Annual | Savings | Effective Monthly |
|------|---------|--------|---------|-------------------|
| Basic | $7 | $70 | $14 (17%) | $5.83 |
| Pro | $15 | $150 | $30 (17%) | $12.50 |
| Elite | $29 | $290 | $58 (17%) | $24.17 |

**Annual discount:** ~17% (2 months free) — industry standard, not excessive.

---

## 🎁 Bonus Stack

| Bonus | Description | Perceived Value | Actual Cost | Tier |
|-------|-------------|-----------------|-------------|------|
| **Bonus 1: Quick-Start Guide** | PDF: "Your First $100 in Passive Income" — 7-day activation blueprint | $47 | $0 | All tiers |
| **Bonus 2: AI Confidence Masterclass** | Video: Understanding your AI's decision signals (builds trust) | $97 | $0 | Pro |
| **Bonus 3: Weekly Performance Digest** | Automated email with earnings breakdown + AI insights | $29/mo value | $0 | Pro |
| **Bonus 4: Private Discord Community** | Access to "The Vault" — fellow Trading Platform users | $19/mo value | $0 | Elite |
| **Bonus 5: Priority Feature Voting** | Vote on upcoming features, early access to new modes | $49 value | $0 | Elite |
| **Bonus 6: "Modern Trading" Dashboard Skin** | Exclusive UI with advanced visualizations | $79 value | $0 | Elite |

### Bonus Value Stack

| Tier | Core Product | + Bonuses | Total Value | Price | Discount |
|------|--------------|-----------|-------------|-------|----------|
| Basic | $250/month | $47 | $297 | $7/mo | **97% off** |
| Pro | $450/month | $173 | $623 | $15/mo | **97% off** |
| Elite | $700/month | $393 | $1,093 | $29/mo | **97% off** |

✅ **Rule Check:** Bonus value > tier price at every level.

---

## 🛡️ Risk Reversal (Guarantee)

### Selected Guarantee Type: **Conditional + Outcome-Based**

**Guarantee Statement:**
> **"The 48-Hour AI Guarantee"**
> 
> Activate Auto-Invest and if you don't see your first AI-generated return within 48 hours, your first month is on us. No questions asked.
>
> Plus: Cancel anytime. Withdraw your funds anytime. We only win when you win.

### Guarantee Terms

| Aspect | Detail |
|--------|--------|
| **Time Window** | 48 hours for first return visibility |
| **Conditions** | Must deposit minimum $50, must activate Auto-Invest |
| **Process** | One-tap in app → "My AI hasn't generated returns" → Automatic credit |
| **Fallback** | 30-day full refund on subscription, no questions asked |

### Risk Assessment

| Factor | Estimate |
|--------|----------|
| **Estimated Claim Rate** | <2% (AI generates visible activity within 24h) |
| **Maximum Exposure** | $7-$29 per claim (one month's subscription) |
| **Abuse Mitigation** | Limit to first subscription; one per account; requires deposit |

### Additional Trust Signals

- ✅ No lock-up periods on funds
- ✅ Withdraw to bank anytime (1-3 business days)
- ✅ Apple/Google payment protection
- ✅ SOC 2 compliance (in progress)
- ✅ Biometric security (Face ID/Touch ID)

---

## ⏰ Scarcity & Urgency Triggers

### Active Triggers

| Trigger | Type | Authentic? | Implementation |
|---------|------|------------|----------------|
| **Founding Member Pricing** | Urgency | ✅ Yes | First 1,000 users get locked-in pricing forever |
| **Cohort Capacity** | Scarcity | ✅ Yes | "Beta limited to 1,000 users for infrastructure stability" |
| **Price Lock Guarantee** | Urgency | ✅ Yes | "Subscribe now, price never increases for your account" |
| **Waitlist Position** | Scarcity | ✅ Yes | "You're #X in line" — early access emails |

### Trigger Statements

**Launch Phase:**
> "Founding Member spots are limited to 1,000. These users get locked pricing forever—even when we raise prices after launch."

**Ongoing:**
> "Your subscription price is locked in. Start today at $7/month, and even when Basic goes to $12, you stay at $7."

**Upgrade Prompts:**
> "Pro members get 4x faster AI cycles. See returns update hourly instead of daily."

---

## 📛 Offer Name

**Final Offer Name:** **The Trading Protocol**

### Naming Criteria Check

- [x] Easy to remember — "Trading Protocol" is catchy, alliterative
- [x] Implies the outcome — "Protocol" suggests systematic, automated success
- [x] Differentiated from competitors — No one uses "Protocol" in investing apps
- [x] Sounds premium — Tech/cyberpunk connotation, not generic
- [x] Works as a product name — "Join the Trading Protocol"

### Tagline Variations

- **Primary:** "Trade Smarter. Execute Faster."
- **Secondary:** "Your AI-Powered Wealth Protocol"
- **CTA:** "Activate the Protocol"

---

## 📊 Unit Economics

### Cost Structure

| Component | Cost |
|-----------|------|
| COGS per user | $1.25/month |
| Apple App Store fee | 15% of revenue |
| Net margin (after Apple + COGS) | 75-80% |

### Revenue Projections (ARPU-based)

| Metric | Conservative | Target | Optimistic |
|--------|--------------|--------|------------|
| **Tier Distribution** | 50/40/10 | 30/55/15 | 20/50/30 |
| **ARPU** | $11.50 | $14.50 | $18.00 |
| **LTV (20 months avg)** | $230 | $290 | $360 |

### Unit Economics Targets

| Metric | Target | Justification |
|--------|--------|---------------|
| **CAC** | $25 | App Store ads, social, influencers |
| **LTV** | $290 | 20-month avg at $14.50 ARPU |
| **LTV:CAC** | 11.6:1 | Excellent (>10:1 = scale aggressively) |
| **Payback Period** | ~2 months | Very fast (target <3 months) |
| **Monthly Churn** | 5% | Standard for subscription apps |
| **Annual Churn** | ~46% | Conservative, improve with engagement |

### Break-Even Analysis

| Milestone | Users Needed | MRR |
|-----------|--------------|-----|
| Cover fixed costs (~$500/mo) | 35 | $500 |
| Ramen profitability | 200 | $2,900 |
| Full-time income ($10K/mo) | 700 | $10,150 |
| Scale phase ($100K MRR) | 6,900 | $100,000 |

---

## 🔧 Implementation Notes (For Dev Team)

### Database Schema Requirements

```sql
-- Subscription tiers
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL, -- 'basic', 'pro', 'elite'
  price_monthly INTEGER NOT NULL, -- cents
  price_annual INTEGER NOT NULL,
  features JSONB NOT NULL,
  limits JSONB NOT NULL
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tier_id UUID REFERENCES subscription_tiers(id),
  status TEXT NOT NULL, -- 'active', 'cancelled', 'past_due'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  revenuecat_id TEXT,
  is_founding_member BOOLEAN DEFAULT FALSE,
  locked_price INTEGER -- founding member price lock
);

-- Subscription events (for analytics)
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL, -- 'subscribed', 'upgraded', 'downgraded', 'cancelled', 'renewed'
  from_tier TEXT,
  to_tier TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Considerations

- **RevenueCat Webhooks:** Handle subscription lifecycle events
- **Tier-based rate limiting:** AI cycle frequency based on tier
- **Feature flags:** Gate features by subscription tier
- **Upgrade prompts:** Trigger based on usage patterns

### UI Components Needed

- **Pricing page:** Three-tier comparison (in-app + App Store)
- **Upgrade modal:** One-tap upgrade with Apple Pay
- **Subscription status:** Current tier, renewal date, features
- **Founding member badge:** Visual indicator for early adopters

---

## ✅ Document Sync Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| OFFER_ARCHITECTURE.md | ✅ Source of truth | 2025-12-11 |
| MASTER_PRD.md | 🔄 Needs sync | — |
| stack-profile.json | 🔄 Needs sync | — |
| pricing-config.json | 🆕 To create | — |

---

*This document is the source of truth for all pricing/offer references.*
*Last synced: 2025-12-11*



