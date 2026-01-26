# Marketing Copywriting Command

Generate persuasion-driven copy using research-backed frameworks.

## Usage

```
/marketing/copywriting
/marketing/copywriting --type=landing-page
/marketing/copywriting --type=email-sequence
/marketing/copywriting --type=video-script
```

## Parameters

- `--type`: landing-page | email-sequence | video-script | headline | cta (default: landing-page)
- `--awareness`: unaware | problem | solution | product | most (default: problem)
- `--sophistication`: 1-5 (default: 3)

---

## MANDATORY: Apply All 5 Persuasion Frameworks

### Framework 1: Market Awareness (Eugene Schwartz)

Before writing, classify your audience:

| Level | State | Messaging Strategy |
|-------|-------|-------------------|
| **Unaware** | Don't know problem exists | Lead with story/identity |
| **Problem Aware** | Know problem, not solutions | Agitate problem, introduce solution |
| **Solution Aware** | Know solutions exist | Differentiate your mechanism |
| **Product Aware** | Know your product | Overcome objections, add proof |
| **Most Aware** | Ready to buy | Simple CTA, best offer |

### Framework 2: NESB Triggers (Kyle Milligan)

Every piece of copy must score 3+ triggers:

| Trigger | Question | If Missing... |
|---------|----------|---------------|
| **NEW** | Does this feel like fresh discovery? | Add unique mechanism name |
| **EASY** | Does this feel achievable? | Add time estimate, steps count |
| **SAFE** | Have you removed risk? | Add guarantee, testimonials |
| **BIG** | Is the outcome significant? | Add specific numbers, transformation |

### Framework 3: Five Drivers (Blair Warren)

Map to specific copy sections:

| Driver | Copy Section | Template |
|--------|-------------|----------|
| **Encourage Dreams** | Hero, CTA | "Yes, you CAN [dream] even if [objection]" |
| **Justify Failures** | Problem section | "If you've tried before, it wasn't your fault..." |
| **Allay Fears** | Guarantee, FAQ | "Worried about [fear]? Here's why..." |
| **Confirm Suspicions** | Agitation | "You suspected [thing] was wrong. You were right..." |
| **Throw Rocks** | Problem/Agitation | "The [gurus/industry] don't want you to know..." |

### Framework 4: Cialdini's 7 Principles

| Principle | Implementation |
|-----------|---------------|
| **Reciprocity** | Free value before ask |
| **Commitment** | Small yes → big yes |
| **Social Proof** | Testimonials, user counts |
| **Authority** | Credentials, logos |
| **Liking** | Story, shared identity |
| **Scarcity** | Limited time/quantity |
| **Unity** | "We" language, tribe |

### Framework 5: Loss Framing (Yes! 50 Ways)

Loss-framed messages are 2x more powerful:

| Gain Frame (Weaker) | Loss Frame (Stronger) |
|---------------------|----------------------|
| "Save 10 hours/week" | "Stop losing 10 hours every week" |
| "Get more leads" | "Stop losing leads to competitors" |
| "Access this bonus" | "Don't miss your bonus" |

---

## Output Templates

### Landing Page Copy

```markdown
# [Headline: NESB + Five Driver]

## [Subheadline: Specific Outcome + Timeframe]

[Hero paragraph: Problem → Agitation → Promise]

### The Problem (Justify Failures + Confirm Suspicions)
[Why what they've tried hasn't worked]

### The Solution (NEW + EASY)
[Unique mechanism introduction]

### What You Get (SAFE + BIG)
[Benefit stack with specific outcomes]

### Social Proof (Authority + Social Proof)
[Testimonials matched by similarity]

### The Guarantee (SAFE + Allay Fears)
[Risk reversal]

### [CTA: Encourage Dreams]
[Loss-framed urgency]
```

### Email Sequence Copy

```markdown
## Email 1: Welcome (Commitment: Micro)
Subject: [Curiosity hook]
Body: [Encourage Dreams + deliver lead magnet]
CTA: [Micro commitment - click/reply]

## Email 2: Story (Commitment: Small)
Subject: [Loss-framed hook]
Body: [Justify Failures - your story]
CTA: [Small commitment - reply YES/NO]

## Email 3: Proof (Commitment: Medium)
Subject: [Specific result]
Body: [Allay Fears with case study]
CTA: [Medium commitment - quiz/survey]

## Email 4: Mechanism (Commitment: Medium)
Subject: [NEW + EASY hook]
Body: [How it works - NESB throughout]
CTA: [Medium commitment - consider offer]

## Email 5: Objection (Commitment: Large)
Subject: [Confirm Suspicions]
Body: [Allay Fears - FAQ style]
CTA: [Large commitment - view offer]

## Email 6: Urgency (Commitment: Large)
Subject: [Loss Frame - "Don't lose..."]
Body: [Throw Rocks at Enemies + Scarcity]
CTA: [Purchase consideration]

## Email 7: Close (Commitment: Conversion)
Subject: [Final - Loss Frame]
Body: [All Five Drivers summary]
CTA: [Purchase with guarantee reminder]
```

---

## Quality Gates

Before finalizing any copy:

- [ ] Market Awareness level identified
- [ ] NESB score ≥ 3/4
- [ ] All Five Drivers addressed somewhere
- [ ] Loss framing used for urgency
- [ ] At least 3 Cialdini principles applied
- [ ] Specificity added (numbers, timeframes)
- [ ] CTA is outcome-focused, not generic

---

## Related Commands

- `/marketing/offer-design` - Design the offer first
- `/marketing/avatar` - Understand your customer
- `/marketing/help` - All marketing commands
