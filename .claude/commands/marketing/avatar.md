# Marketing Avatar Command

Create customer avatars with Market Awareness + Five Drivers analysis.

## Usage

```
/marketing/avatar
/marketing/avatar --depth=deep
/marketing/avatar --type=emotional-diary
```

## Parameters

- `--depth`: quick | standard | deep (default: standard)
- `--type`: profile | emotional-diary | five-drivers | full (default: full)

---

## Market Awareness Classification (Schwartz)

**First, classify where your customer sits:**

| Level | Description | Copy Strategy |
|-------|-------------|---------------|
| **1. Unaware** | Don't know problem exists | Story-first, identity-based |
| **2. Problem Aware** | Know problem, not solutions | Agitate pain, introduce category |
| **3. Solution Aware** | Know solutions, not yours | Differentiate mechanism |
| **4. Product Aware** | Know your product | Objection handling, proof |
| **5. Most Aware** | Ready to buy | Best offer, simple CTA |

**For each awareness level, answer:**
- What do they currently believe?
- What language do they use?
- What would make them take the next step?

---

## Five Drivers Deep Dive (Blair Warren)

### Driver 1: Dreams to Encourage

> "People will do anything for those who encourage their dreams"

**Questions to answer:**
- What secret dream do they have?
- What outcome do they fantasize about?
- What would "winning" look like to them?

**Avatar capture:** "[Name] dreams of _______________"

### Driver 2: Failures to Justify

> "People will do anything for those who justify their failures"

**Questions to answer:**
- What have they tried that didn't work?
- Why do they blame themselves?
- What external factor ACTUALLY explains the failure?

**Avatar capture:** "[Name] tried _____________ but failed because _____________"

### Driver 3: Fears to Allay

> "People will do anything for those who allay their fears"

**Questions to answer:**
- What specific fears hold them back from action?
- What's the worst case scenario in their mind?
- What keeps them up at night about this problem?

**Avatar capture:** "[Name]'s top 3 fears are:
1. _______________
2. _______________  
3. _______________"

### Driver 4: Suspicions to Confirm

> "People will do anything for those who confirm their suspicions"

**Questions to answer:**
- What do they secretly suspect is wrong?
- What "truth" have they been told that doesn't feel right?
- What inconsistency have they noticed?

**Avatar capture:** "[Name] suspects _______________"

### Driver 5: Enemies to Fight

> "People will do anything for those who help them throw rocks at their enemies"

**Questions to answer:**
- Who/what do they blame for their situation?
- What industry BS are they tired of?
- Who profits from their pain?

**Avatar capture:** "[Name]'s enemies are: _______________ (people/companies/concepts)"

---

## Similarity Markers (for Social Proof)

**From "Yes! 50 Ways":** People comply more with similar others.

Capture these markers for testimonial matching:

| Marker | Your Avatar |
|--------|-------------|
| **Role/Title** | |
| **Industry** | |
| **Company Stage** | |
| **Company Size** | |
| **Geography** | |
| **Experience Level** | |
| **Shared Struggle** | |
| **Shared Values** | |

---

## Emotional Diary Template

Create diary entries from your avatar's perspective:

### Entry 1: The Awakening
*When they first realized the problem existed*

```markdown
Dear Diary,

Today I realized that [problem statement]. I noticed when [specific moment].
I always suspected [suspicion], and now I know it's true.
I feel [emotion] because [reason].
```

### Entry 2: The Struggle
*Daily impact and frustration*

```markdown
Dear Diary,

Another day of [frustration]. I've tried [failed attempts] but nothing works.
Maybe I'm just not [self-doubt]. I keep thinking if only [desire].
The worst part is [specific pain].
```

### Entry 3: The Search
*Looking for solutions*

```markdown
Dear Diary,

I spent [time] looking for a solution. I found [what they found].
But [why it disappointed]. I'm starting to think [suspicion].
Why does everyone say [common advice] when it clearly [doesn't work]?
```

### Entry 4: The Hope
*Glimpse of possibility*

```markdown
Dear Diary,

What if I could actually [dream]? I saw [proof/example] and thought
maybe it's possible for me too. If I could just [desire], then [outcome].
I want to believe [hope].
```

---

## Avatar Output Format

```markdown
# Customer Avatar: [Name]

## Demographics
- **Age:** 
- **Role:** 
- **Industry:** 
- **Company Size:** 

## Market Awareness Level
**Level:** [1-5]
**Current Belief:** 
**Language They Use:** 

## Five Drivers Profile

### Dreams (Encourage)
[What they dream of achieving]

### Failures (Justify)
[What they've tried + external reason it failed]

### Fears (Allay)
1. [Fear 1]
2. [Fear 2]
3. [Fear 3]

### Suspicions (Confirm)
[What they secretly suspect is wrong]

### Enemies (Throw Rocks)
[Who/what they blame]

## Similarity Markers
[For testimonial matching]

## Key Language Patterns
[Exact phrases they use]

## Conversion Triggers
[What would make them buy]
```

---

## Quality Gates

- [ ] Market Awareness level identified (1-5)
- [ ] All Five Drivers documented
- [ ] Similarity markers captured
- [ ] Emotional diary entries created (if deep)
- [ ] Language patterns extracted
- [ ] Conversion triggers identified

---

## Related Commands

- `/marketing/copywriting` - Write copy for this avatar
- `/marketing/offer-design` - Design offer for this avatar
- `/marketing/help` - All marketing commands
