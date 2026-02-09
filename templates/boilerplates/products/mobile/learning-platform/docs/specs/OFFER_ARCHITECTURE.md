# Learning Platform — Offer Architecture

**Version:** 1.0 | **Date:** 2025-12-17 | **Status:** Approved  
**Offer Name:** The the subject Confidence System™

---

## 🎯 Offer Summary

> **"Learn effectively confidently in 90 days — order at restaurants in 30 days, hold full conversations in 90 days — or we extend your access FREE until you do."**

This is a **Grand Slam Offer** designed using Alex Hormozi's $100M framework, combining:
- The only the subject app with a **real human teacher** students connect with
- **AI-powered practice** available 24/7 in AI Tutor's voice
- **Community accountability** that keeps you engaged
- **Results guarantee** that removes all purchase risk

---

## 💰 COGS Analysis (Cost of Goods Sold)

### Variable Costs Per User (Monthly)

| Cost Center | Service | Calculation | Monthly Cost |
|-------------|---------|-------------|--------------|
| **AI - LLM** | OpenAI GPT-4o | 50 chats × 2,000 tokens avg = 100K tokens/mo | $0.35 |
| **AI - TTS** | ElevenLabs | 15 min audio × $0.18/min (Creator tier) | $2.70 |
| **AI - STT** | OpenAI Whisper | 20 min transcription × $0.006/min | $0.12 |
| **Database** | Supabase Pro | $25/mo ÷ 500 users = $0.05/user | $0.05 |
| **Storage** | Supabase | 100MB avg × $0.021/GB | $0.002 |
| **Video Calls** | LiveKit | 2 hrs/mo × $0.004/min (voice) | $0.48 |
| **Push Notifications** | Expo | Included in free tier | $0.00 |
| **Payment Processing** | RevenueCat + Stripe | 2.9% + $0.30 per transaction (amortized) | $2.50 |
| **TOTAL COGS/USER** | | | **$6.22** |

### Pricing Floor Calculation

| Margin Target | Calculation | Minimum Price |
|---------------|-------------|---------------|
| Break-even | $6.22 | $6.22/month |
| 3x margin (sustainable) | $6.22 × 3 | **$18.66/month** |
| 5x margin (healthy SaaS) | $6.22 × 5 | **$31.10/month** |
| 10x margin (premium value) | $6.22 × 10 | **$62.20/month** |

### Tier-Specific COGS Estimates

| Tier | AI Usage | Video | Est. COGS | Target Price | Margin |
|------|----------|-------|-----------|--------------|--------|
| **Essential** | Medium | None | $4.50 | $29/mo | 6.4x |
| **Pro** | High | Group calls | $7.50 | $79/mo | 10.5x |
| **VIP** | Very High | 1:1 priority | $15.00 | $199/mo | 13.3x |

**✅ All tiers exceed 5x margin — healthy unit economics confirmed.**

---

## Target Avatar

*(Refined for Offer)*

### Primary Avatar: "The Frozen Duolingo User"

**Who:** English-speaking professionals (28-45), urban/suburban U.S., college-educated, some disposable income

**Current State:**
- Has used 2-3 language apps (Duolingo, Babbel, Rosetta Stone)
- Maintains occasional streaks but can't hold a conversation
- Understands the subject when written but freezes when spoken to
- Embarrassed to practice with native speakers

**Dream State:**
- Confidently orders at Mexican restaurants
- Holds casual conversations with the subject speakers
- Impresses family/friends with fluency
- Feels authentic when engaging with Latin culture

**Trigger Event:**
- Upcoming trip to the subject-speaking country
- New the subject-speaking neighbors/colleagues
- Heritage reconnection moment (visiting family)
- Career opportunity requiring the subject

### Avatar Score (Hormozi's 4 Indicators)

| Indicator | Score | Evidence |
|-----------|-------|----------|
| **Massive Pain** | 9/10 | "I've tried for years and still can't speak" — deeply frustrating |
| **Purchasing Power** | 8/10 | Professional income, already spending on apps/tutors |
| **Easy to Target** | 9/10 | TikTok language learning content, Facebook groups, app store search |
| **Growing Market** | 10/10 | $24.8B market by 2033, 14.4% CAGR |
| **TOTAL** | **36/40** | Excellent avatar — proceed with confidence |

### Dream Outcome Statement

> "We help English speakers who've tried apps but still can't speak achieve conversational skills confidence in 90 days — without boring drills, robotic apps, or expensive tutors — through the only the subject learning system built around a real human teacher you'll actually connect with."

---

## 🔧 Problem → Solution Matrix

### Problem 1: "I understand the subject but can't produce it"

- **Pain Statement:** "I can read the subject and recognize words, but when someone speaks to me, my mind goes blank."
- **Solution:** "Speaking-first methodology — you'll speak from Day 1 with AI-powered practice and pronunciation feedback."
- **Delivery:** AI Tutor (Chat + Voice modes), Speaking exercises with Whisper
- **Value Driver:** ↑ Dream Outcome + ↑ Likelihood

### Problem 2: "Apps feel robotic and fake"

- **Pain Statement:** "I hate the gamification. It feels like I'm playing a game, not learning a language."
- **Solution:** "Learn from AI Tutor — a real human teacher with authentic charisma and cultural fluency."
- **Delivery:** Video lessons, "Talk to AI Tutor Mode" (ElevenLabs voice clone), Content Feed
- **Value Driver:** ↑ Dream Outcome + ↓ Effort

### Problem 3: "I can't relate to textbook the subject"

- **Pain Statement:** "I learned 'proper' the subject but can't apply it in real-world situations."
- **Solution:** "Advanced topic modules — practical applications, real-world context, and varied difficulty levels."
- **Delivery:** Advanced modules, Contextual lessons, Varied narration audio
- **Value Driver:** ↑ Dream Outcome + ↑ Likelihood

### Problem 4: "I always quit after a few weeks"

- **Pain Statement:** "I start strong but lose motivation. No one holds me accountable."
- **Solution:** "Community + human accountability — weekly group calls, VIP community, homework reminders."
- **Delivery:** Content Feed, Group calls (Pro), VIP Community (Pro/VIP), Streak system
- **Value Driver:** ↓ Effort + ↑ Likelihood

### Problem 5: "Tutors are too expensive for consistent practice"

- **Pain Statement:** "I can't afford $35-50/hour for regular 1:1 lessons."
- **Solution:** "Unlimited access to AI practice + AI Tutor's content for a flat monthly fee."
- **Delivery:** Subscription model, AI Tutor available 24/7, Priority 1:1 booking (VIP)
- **Value Driver:** ↓ Sacrifice + ↓ Effort

---

## Pricing Tiers

*(Pricing Architecture)*

### Tier Structure

| Tier | Name | Monthly | Annual | Target Segment | Conversion Goal |
|------|------|---------|--------|----------------|-----------------|
| 0 | **Free** | $0 | $0 | Trial users | Anchor — show value |
| 1 | **Essential** | $29 | $290/yr | Self-learners | Entry point |
| 2 | **Pro** ⭐ | $79 | $790/yr | Committed learners | Primary revenue driver |
| 3 | **VIP** | $199 | $1,990/yr | Premium learners | High-value accounts |

### Decoy Pricing Psychology

```
Free → Essential ($29) → Pro ($79) ⭐ → VIP ($199)
       ↑ Anchor low        ↑ BEST VALUE      ↑ Premium
       
Pro is the "obvious choice" because:
- Only $50 more than Essential for 3x the features
- Group calls + Community = $1,200/year value alone
- VIP is for "serious" learners (creates aspiration)
```

## Feature Matrix

| Feature | Free | Essential | Pro ⭐ | VIP |
|---------|------|-----------|--------|-----|
| **Lessons & Content** | 5 lessons | ✅ Full library | ✅ Full library | ✅ Full library |
| **AI Tutor Chat** | 10 msgs/day | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| **AI Voice ("Talk to AI Tutor")** | ❌ | 30 min/mo | ✅ Unlimited | ✅ Unlimited |
| **Speaking Exercises** | ❌ | ✅ Basic | ✅ Advanced + Scoring | ✅ Advanced + Coaching |
| **Worksheets** | ❌ | ✅ All | ✅ All | ✅ All |
| **Slang Modules** | ❌ | 1 region | ✅ All regions | ✅ All regions |
| **Content Feed** | ✅ View only | ✅ Full access | ✅ Full access | ✅ Full access |
| **Weekly Group Calls** | ❌ | ❌ | ✅ Weekly | ✅ Weekly |
| **VIP Community** | ❌ | ❌ | ✅ Access | ✅ Priority access |
| **1:1 Booking with AI Tutor** | ❌ | ❌ | At regular rates | ✅ Priority + Discounted |
| **Pronunciation Coaching** | ❌ | ❌ | ❌ | ✅ Personalized |
| **Direct Messaging with AI Tutor** | ❌ | ❌ | ❌ | ✅ |
| **Support** | Community | Email | Priority Email | Dedicated |

### Annual Discount Strategy

| Tier | Monthly | Annual | Savings | Effective Monthly |
|------|---------|--------|---------|-------------------|
| Essential | $29/mo | $290/yr | 17% off | $24.17/mo |
| Pro | $79/mo | $790/yr | 17% off | $65.83/mo |
| VIP | $199/mo | $1,990/yr | 17% off | $165.83/mo |

---

## Bonus Stack

| Bonus | Description | Perceived Value | Actual Cost | Tier |
|-------|-------------|-----------------|-------------|------|
| **Bonus 1: AI Tutor's Complete Worksheet Library** | 50+ printable worksheets used in real classes | $297 | $0 (existing content) | Essential+ |
| **Bonus 2: Quick-Start Conversation Cards** | 100 most-used phrases for immediate use | $47 | $0 | Essential+ |
| **Bonus 3: Advanced Topic Guides** | Beginner, intermediate, and advanced reference guides | $97 | $0 | Pro+ |
| **Bonus 4: VIP Community Access** | Private community with fellow serious learners | $297/yr | $0 | Pro+ |
| **Bonus 5: Weekly Live Group Coaching** | Live Q&A and practice sessions with AI Tutor | $1,200/yr | AI Tutor's time | Pro+ |
| **Bonus 6: Priority Booking Access** | First access to AI Tutor's 1:1 calendar | $497/yr | $0 | VIP |
| **Bonus 7: Personalized Learning Path** | Custom curriculum based on your goals | $197 | $0 | VIP |
| **Bonus 8: 90-Day Success Guarantee** | Extended access if you don't hit your goal | PRICELESS | Low risk | All Paid |

### Value Stack Summary

```
THE LEARNING CONFIDENCE SYSTEM™ (VIP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Core App + AI Tutor (24/7 practice)        $2,400/yr value
+ Complete Lesson Library                    $500/yr value
+ Worksheets + Textbook Access               $297 value
+ Quick-Start Conversation Cards             $47 value
+ Regional Slang Phrasebooks                 $97 value
+ All Slang Modules                          $200/yr value
+ AI "Talk to AI Tutor Mode" (Unlimited)         $500/yr value
+ Weekly Live Group Calls                    $1,200/yr value
+ VIP Community Access                       $297/yr value
+ Priority 1:1 Booking                       $497/yr value
+ Personalized Learning Path                 $197 value
+ Pronunciation Coaching                     $800/yr value
+ Direct Messaging with AI Tutor                 $600/yr value
+ 90-Day Success Guarantee                   PRICELESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL VALUE:                               $7,632/year
YOUR PRICE:                                $1,990/year (VIP Annual)

🔥 That's 74% OFF the total value
```

**Rule Check:** Bonus value ($7,632) > VIP price ($1,990)? ✅ **YES — 3.8x value-to-price ratio**

---

## Guarantee

*(Risk Reversal)*

### Selected Guarantee Type: Conditional Outcome-Based

**Guarantee Statement:**
> **"The 90-Day the subject Confidence Guarantee"**
> 
> "Pass your first conversation test in 90 days, or we extend your access FREE until you do. No questions asked. No hoops to jump through. We believe in this system that much."

### Terms

| Element | Details |
|---------|---------|
| **Time Window** | 90 days from subscription start |
| **Conditions** | Complete at least 50% of recommended lessons |
| **"Conversation Test"** | 5-minute live conversation with AI Tutor or designated evaluator |
| **Claim Process** | Request in-app → schedule evaluation → pass = celebrate, fail = free extension |
| **Extension Duration** | 30-day increments until success |

### Risk Assessment

| Metric | Estimate | Rationale |
|--------|----------|-----------|
| **Claim Rate** | <5% | Students who engage with content succeed |
| **Average Extensions** | 1.2 | Most pass on first or second try |
| **Maximum Exposure** | $0 marginal (digital access) | No additional COGS for extension |
| **Abuse Prevention** | 50% lesson completion requirement | Filters out non-serious users |

### Why This Guarantee Works

1. **Authentic to brand:** AI Tutor is confident in his teaching — this proves it
2. **Outcome-based:** Tied to the result they actually want (conversation)
3. **Low risk for us:** Engaged users will succeed; disengaged users filtered out
4. **High perceived value:** "They must really believe in this" = trust boost

---

## ⏰ Scarcity & Urgency Triggers

### Active Triggers

| Trigger | Type | Authentic? | Implementation |
|---------|------|------------|----------------|
| **Founding Member Pricing** | Scarcity | ✅ Yes | First 100 VIP members locked at $149/mo (25% off) |
| **Annual Price Lock** | Urgency | ✅ Yes | "Lock in this year's pricing before next increase" |
| **Limited 1:1 Slots** | Scarcity | ✅ Yes | AI Tutor can only take 60 students max |
| **Cohort Start Dates** | Urgency | ✅ Yes | Group calls start monthly — join before cutoff |

### Trigger Statements

**Launch Phase:**
> "Founding Member pricing for the first 100 VIP members: $149/month (normally $199). This price is locked for life as long as you stay subscribed."

**Ongoing:**
> "Annual pricing is locked at today's rate. Monthly pricing may increase as we add more features and live access."

**Capacity:**
> "AI Tutor can only personally work with 60 VIP members at a time. Priority 1:1 access means you're guaranteed a spot when you need it."

---

## 📛 Offer Name

**Final Offer Name:** **The the subject Confidence System™**

**Tagline:** "From frozen to fluent in 90 days"

### Naming Criteria Check

- [x] **Easy to remember:** "the subject Confidence System" is clear and memorable
- [x] **Implies the outcome:** "Confidence" is the emotional result they want
- [x] **Differentiated:** No competitor uses "Confidence System"
- [x] **Sounds premium:** "System" implies methodology and structure
- [x] **Works as product name:** Can be used across all marketing

### Alternative Names Considered

| Name | Pros | Cons | Decision |
|------|------|------|----------|
| Learning Platform Pro | Brand consistency | Doesn't imply outcome | ❌ |
| AI Tutor's the subject Method | Personal brand | Less scalable | ❌ |
| The Fluency System | Clear outcome | Generic, used by others | ❌ |
| **The the subject Confidence System** | Unique, emotional, outcome-focused | None | ✅ **SELECTED** |

---

## Unit Economics

### Per-Tier Breakdown

| Metric | Essential | Pro ⭐ | VIP |
|--------|-----------|--------|-----|
| Monthly Price | $29 | $79 | $199 |
| Monthly COGS | $4.50 | $7.50 | $15.00 |
| Gross Margin | 84% | 91% | 92% |
| Contribution/User | $24.50 | $71.50 | $184.00 |

### Blended Assumptions

| Metric | Target | Notes |
|--------|--------|-------|
| Free → Paid Conversion | 10-15% | Industry avg for freemium is 5-10%, premium content can exceed |
| Essential → Pro Upgrade | 30% | Within first 60 days |
| Pro → VIP Upgrade | 10% | After demonstrating value |
| Monthly Churn (Overall) | 5% | Target, with strong engagement |
| Average Lifetime | 12 months | Conservative estimate |

### LTV Calculations

| Tier | Monthly Price | Avg Lifetime | LTV |
|------|---------------|--------------|-----|
| Essential | $29 | 10 months | $290 |
| Pro | $79 | 14 months | $1,106 |
| VIP | $199 | 18 months | $3,582 |
| **Blended LTV** | — | — | **$750** (estimated) |

### CAC & Payback

| Metric | Target | Calculation |
|--------|--------|-------------|
| Target CAC | $50 | Social media + referral (low-cost channels) |
| LTV:CAC | 15:1 | $750 / $50 = excellent |
| Payback Period | <2 months | Recover CAC in first payment cycle |

---

## 🔧 Implementation Notes (for Step 2: Architecture)

### Database Schema Requirements

```sql
-- Subscription management
subscriptions (
  id, user_id, tier, status, billing_cycle, 
  current_period_start, current_period_end,
  stripe_subscription_id, revenuecat_subscriber_id
)

-- Usage tracking (for limits)
usage_events (
  id, user_id, event_type, quantity, created_at
)
-- event_type: 'ai_chat', 'ai_voice_minutes', 'lesson_completed'

-- Feature entitlements (derived from tier)
entitlements (
  tier, feature_key, limit_value, limit_period
)
```

### API Considerations

- **Rate Limiting:** Based on tier (Free: 10 AI chats/day, Essential: unlimited, etc.)
- **Feature Flags:** Check tier entitlements before feature access
- **Usage Metering:** Log all AI interactions for analytics and potential overage (future)

### UI Components Needed

- **Pricing Page:** Feature comparison table, tier cards, annual toggle
- **Paywall Screens:** Soft upgrade prompts when hitting limits
- **Usage Dashboard:** Show remaining AI voice minutes (Essential tier)
- **Upgrade Flow:** In-app upgrade with RevenueCat

### RevenueCat Product Setup

```json
{
  "products": {
    "essential_monthly": { "price": 2999, "currency": "USD" },
    "essential_annual": { "price": 29000, "currency": "USD" },
    "pro_monthly": { "price": 7900, "currency": "USD" },
    "pro_annual": { "price": 79000, "currency": "USD" },
    "vip_monthly": { "price": 19900, "currency": "USD" },
    "vip_annual": { "price": 199000, "currency": "USD" }
  },
  "offerings": {
    "default": {
      "packages": ["essential_monthly", "essential_annual", "pro_monthly", "pro_annual", "vip_monthly", "vip_annual"]
    }
  }
}
```

---

## ✅ Document Sync Status

| Document | Updated | Pricing Match | Status |
|----------|---------|---------------|--------|
| **OFFER_ARCHITECTURE.md** | 2025-12-17 | Source of truth | ✅ Created |
| **MASTER_PRD.md** | 2025-12-17 | Will sync | ⏳ Pending |
| **stack-profile.json** | 2025-12-17 | Will sync | ⏳ Pending |
| **pricing-config.json** | 2025-12-17 | Will create | ⏳ Pending |

---

*This document is the source of truth for all pricing/offer references.*  
*Last updated: 2025-12-17*


