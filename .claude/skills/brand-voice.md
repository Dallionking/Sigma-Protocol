---
name: brand-voice
description: "Define, extract, or apply a consistent brand voice across all content. Creates brand voice guidelines from examples or applies existing guidelines to new content."
version: "1.0.0"
triggers:
  - brand
  - voice
  - tone
  - copywriting
  - content
---

# Brand Voice Skill

Define, extract, or apply a consistent brand voice across all content. Whether you need to discover a brand's voice from existing content or apply established guidelines to new writing.

## When to Invoke

Invoke this skill when:
- Defining a new brand's voice and tone
- Extracting voice guidelines from existing content
- Writing content that must match brand voice
- Auditing content for brand consistency
- Training team members on brand voice

---

## 🎯 Core Concepts

### Voice vs. Tone

| Concept | Definition | Example |
|---------|------------|---------|
| **Voice** | WHO you are. Consistent personality. | Friendly, Expert, Rebellious |
| **Tone** | HOW you express voice in context. Varies by situation. | Celebratory (success), Empathetic (support) |

Think: **Voice is constant, Tone adapts.**

---

## 📋 Mode 1: Define Brand Voice

Create a comprehensive brand voice guide from scratch.

### Brand Voice Canvas

```markdown
## Brand Voice Definition

### 1. Brand Personality Traits
Pick 3-5 adjectives that define WHO you are:

| Trait | What it means for us | What it's NOT |
|-------|---------------------|---------------|
| **[Trait 1]** | [Description] | [Opposite/Avoid] |
| **[Trait 2]** | [Description] | [Opposite/Avoid] |
| **[Trait 3]** | [Description] | [Opposite/Avoid] |

### 2. Voice Spectrum

Rate your brand on each spectrum (1-10):

| Spectrum | 1 | 5 | 10 | Our Score |
|----------|---|---|-----|-----------|
| Formal ← → Casual | Corporate | Professional | Chatty | [X] |
| Serious ← → Playful | No humor | Witty | Silly | [X] |
| Reserved ← → Enthusiastic | Understated | Confident | Exclamatory! | [X] |
| Technical ← → Simple | Jargon-heavy | Balanced | ELI5 | [X] |
| Traditional ← → Innovative | Classic | Modern | Cutting-edge | [X] |

### 3. Audience

| Aspect | Details |
|--------|---------|
| **Primary Audience** | [Who they are] |
| **Their Pain Points** | [What frustrates them] |
| **Their Aspirations** | [What they want to achieve] |
| **How They Talk** | [Communication style] |
| **Trust Triggers** | [What builds credibility] |

### 4. Brand Pillars
The key messages we consistently reinforce:

1. **[Pillar 1]**: [Supporting message]
2. **[Pillar 2]**: [Supporting message]
3. **[Pillar 3]**: [Supporting message]

### 5. Do's and Don'ts

| DO ✅ | DON'T ❌ |
|-------|---------|
| [Good practice] | [Bad practice] |
| [Good practice] | [Bad practice] |
| [Good practice] | [Bad practice] |

### 6. Vocabulary Guide

| Use These | Avoid These |
|-----------|-------------|
| [Preferred word] | [Avoided word] |
| [Preferred phrase] | [Avoided phrase] |
```

### Voice Archetypes

Choose a starting archetype:

| Archetype | Description | Examples |
|-----------|-------------|----------|
| **The Expert** | Authoritative, knowledgeable, trusted | McKinsey, IBM |
| **The Friend** | Warm, approachable, supportive | Mailchimp, Slack |
| **The Rebel** | Bold, challenging, disruptive | Apple, Harley-Davidson |
| **The Innovator** | Visionary, forward-thinking, excited | Tesla, SpaceX |
| **The Teacher** | Patient, clear, educational | Khan Academy, Notion |
| **The Coach** | Motivating, empowering, action-oriented | Nike, Peloton |
| **The Sage** | Wise, thoughtful, philosophical | Patagonia |
| **The Jester** | Witty, entertaining, irreverent | Old Spice, Dollar Shave Club |

---

## 📋 Mode 2: Extract Brand Voice

Analyze existing content to extract voice guidelines.

### Analysis Framework

Given sample content, extract:

```markdown
## Voice Analysis Report

### Content Analyzed
- [List of content pieces reviewed]

### Detected Voice Traits

**Primary Traits:**
1. [Trait]: Evidence: "[quote from content]"
2. [Trait]: Evidence: "[quote from content]"
3. [Trait]: Evidence: "[quote from content]"

**Voice Spectrum Scores:**
- Formality: [1-10] — [justification]
- Seriousness: [1-10] — [justification]
- Enthusiasm: [1-10] — [justification]
- Technicality: [1-10] — [justification]

### Language Patterns

**Sentence Structure:**
- Average length: [short/medium/long]
- Complexity: [simple/compound/complex]
- Use of fragments: [yes/no]

**Word Choice:**
- Formality level: [casual/neutral/formal]
- Jargon usage: [none/light/heavy]
- Power words: [examples]
- Avoided words: [examples]

**Punctuation Style:**
- Exclamation points: [frequency]
- Question marks: [frequency]
- Ellipses: [frequency]
- Em dashes: [frequency]

### Consistent Phrases
Phrases that appear repeatedly:
- "[phrase 1]"
- "[phrase 2]"

### Tonal Variations
How tone shifts by context:
- Marketing: [description]
- Support: [description]
- Social: [description]

### Recommendations
To maintain this voice:
1. [Recommendation]
2. [Recommendation]
3. [Recommendation]
```

---

## 📋 Mode 3: Apply Brand Voice

Transform content to match brand voice guidelines.

### Voice Application Process

1. **Review Guidelines** — Read brand voice documentation
2. **Analyze Source** — Understand original content's message
3. **Identify Gaps** — Where does source deviate from brand voice?
4. **Transform** — Rewrite while preserving meaning
5. **Verify** — Check against brand guidelines

### Transformation Example

```markdown
## Original (Generic)
"Our product helps businesses manage their operations more efficiently."

## Brand Voice: The Friend (Casual, Warm, Supportive)
"Running a business is hard enough—let us handle the boring stuff so you can focus on what you love."

## Brand Voice: The Expert (Authoritative, Precise)
"Our platform delivers a 34% improvement in operational efficiency through automated workflow optimization."

## Brand Voice: The Rebel (Bold, Challenging)
"Spreadsheets are broken. We fixed them. Your operations will never be the same."

## Brand Voice: The Coach (Motivating, Action-oriented)
"You've got the vision. We've got the tools. Let's build something incredible together."
```

---

## 🔧 Tone Matrix

Map appropriate tones to contexts:

| Context | Recommended Tone | Example |
|---------|-----------------|---------|
| **Welcome/Onboarding** | Warm, Excited, Helpful | "Welcome aboard! Let's get you set up." |
| **Error Messages** | Clear, Calm, Solutions-focused | "Something went wrong. Here's how to fix it." |
| **Success Moments** | Celebratory, Encouraging | "You did it! Your first campaign is live." |
| **Support/Help** | Patient, Empathetic, Thorough | "I understand this is frustrating. Let me help." |
| **Feature Announcements** | Excited, Clear, Benefit-focused | "You asked, we delivered. Introducing..." |
| **Pricing/Sales** | Confident, Transparent, Value-focused | "Simple pricing. No surprises." |
| **Legal/Terms** | Clear, Direct, Respectful | "Here's what this means for you..." |
| **Social Media** | Conversational, Engaging, Timely | Platform-specific variations |

---

## 📝 Voice Guidelines Template

```markdown
# [Brand Name] Voice Guidelines

## Our Voice in a Nutshell
[One-paragraph summary of brand voice]

## Brand Personality
We are: **[Trait 1], [Trait 2], [Trait 3]**

### [Trait 1]
- What this means: [Description]
- How it sounds: "[Example quote]"
- We avoid: [What contradicts this trait]

### [Trait 2]
- What this means: [Description]
- How it sounds: "[Example quote]"
- We avoid: [What contradicts this trait]

### [Trait 3]
- What this means: [Description]
- How it sounds: "[Example quote]"
- We avoid: [What contradicts this trait]

## How We Sound

### Headlines
- [Guidelines for headlines]
- Example: "[Example headline]"

### Body Copy
- [Guidelines for body copy]
- Example: "[Example paragraph]"

### CTAs
- [Guidelines for calls-to-action]
- Examples: [List of on-brand CTAs]

### Microcopy
- [Guidelines for UI text, buttons, labels]
- Example: "[Example microcopy]"

## Word Bank

### Power Words We Use
[List of preferred words and phrases]

### Words We Avoid
[List of words and phrases to avoid, with alternatives]

## Grammar & Style

### Punctuation
- Oxford comma: [Yes/No]
- Exclamation points: [Guidelines]
- Emoji: [When/Where appropriate]

### Capitalization
- Headlines: [Title Case/Sentence case]
- Product names: [Rules]
- Features: [Rules]

### Numbers
- [Style for numbers, dates, percentages]

## Examples by Channel

### Website
[Examples and guidelines]

### Email
[Examples and guidelines]

### Social Media
[Platform-specific examples and guidelines]

### Product/App
[Examples and guidelines]
```

---

## 🔗 Integration with Sigma Protocol

### Step 9 Landing Page
Apply brand voice to landing page copy.

### @direct-response-copy
Use brand voice as foundation for conversion copy.

### @content-atomizer
Maintain brand voice when adapting content across formats.

### Step 8 Branding
Brand voice is a key deliverable of branding phase.

---

## ✅ Quality Checklist

Before publishing content, verify:

- [ ] Matches brand personality traits
- [ ] Falls within voice spectrum scores
- [ ] Uses preferred vocabulary
- [ ] Avoids banned words/phrases
- [ ] Tone is appropriate for context
- [ ] Follows grammar/style rules
- [ ] Would be recognizable as brand without logo

---

*Consistent brand voice builds trust, recognition, and loyalty. Every piece of content is an opportunity to reinforce who you are.*


