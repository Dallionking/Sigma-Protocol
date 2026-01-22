---
name: brainstorming
description: "Explore user intent, requirements and design before implementation. Use this skill before any creative work - creating features, building components, adding functionality, or modifying behavior."
version: "1.0.0"
source: "@obra/superpowers"
triggers:
  - step-1-ideation
  - step-3-ux-design
  - step-10-feature-breakdown
  - new-feature
  - design-discussion
---

# Brainstorming Skill

You **MUST** use this skill before any creative work - creating features, building components, adding functionality, or modifying behavior. This skill explores user intent, requirements, and design before implementation.

## When to Invoke

Invoke this skill when:

- Starting any new feature development
- Beginning design work on components or pages
- Planning architectural decisions
- Exploring solutions to complex problems
- User says "let's brainstorm" or "help me think through"

---

## The Brainstorming Framework

### Phase 1: Intent Clarification

Before proposing solutions, understand what the user actually wants:

```markdown
## Intent Clarification

1. **What is the core problem?**
   - What pain point are we solving?
   - What triggers this need?

2. **Who is affected?**
   - Primary users
   - Secondary stakeholders
   - Edge case users

3. **What does success look like?**
   - Measurable outcomes
   - User emotions after using
   - Business impact
```

### Phase 2: Constraint Discovery

Identify boundaries before exploring solutions:

```markdown
## Constraints

1. **Technical Constraints**
   - Existing architecture limits
   - Performance requirements
   - Platform/browser support
   - Dependencies and integrations

2. **Business Constraints**
   - Timeline
   - Budget
   - Team capabilities
   - Compliance/legal requirements

3. **User Constraints**
   - Accessibility requirements
   - Device limitations
   - User skill level
   - Context of use
```

### Phase 3: Divergent Thinking

Generate multiple options without judgment:

```markdown
## Solution Exploration

### Option A: [Name]

- **Approach:** [Brief description]
- **Pros:** [List]
- **Cons:** [List]
- **Effort:** [Low/Medium/High]

### Option B: [Name]

- **Approach:** [Brief description]
- **Pros:** [List]
- **Cons:** [List]
- **Effort:** [Low/Medium/High]

### Option C: [Name] (Wild card - unconventional)

- **Approach:** [Brief description]
- **Pros:** [List]
- **Cons:** [List]
- **Effort:** [Low/Medium/High]
```

**Rules for Divergent Thinking:**

- Generate at least 3 options
- Include at least one unconventional/"wild card" option
- No criticism during generation
- Quantity over quality initially

### Phase 4: Convergent Analysis

Evaluate options against criteria:

```markdown
## Evaluation Matrix

| Criteria              | Weight | Option A | Option B | Option C |
| --------------------- | ------ | -------- | -------- | -------- |
| Solves core problem   | 30%    | 8/10     | 7/10     | 9/10     |
| Implementation effort | 20%    | 6/10     | 8/10     | 4/10     |
| Maintainability       | 15%    | 7/10     | 8/10     | 5/10     |
| User experience       | 20%    | 8/10     | 6/10     | 9/10     |
| Scalability           | 15%    | 7/10     | 9/10     | 6/10     |
| **Weighted Total**    | 100%   | 7.25     | 7.45     | 6.85     |
```

### Phase 5: Decision & Next Steps

Document the decision and action plan:

```markdown
## Decision

**Selected Approach:** Option B
**Rationale:** [Why this option best balances constraints and goals]

## Next Steps

1. [ ] [Immediate action]
2. [ ] [Follow-up action]
3. [ ] [Validation step]

## Open Questions

- [Question that needs answers before proceeding]
- [Risk that needs mitigation plan]
```

---

## Quick Brainstorm Template

For faster sessions, use this condensed format:

```markdown
## Quick Brainstorm: [Topic]

**Problem:** [One sentence]
**Constraints:** [Bullet list]

**Options:**

1. [Option] - [Pros/Cons in one line]
2. [Option] - [Pros/Cons in one line]
3. [Option] - [Pros/Cons in one line]

**Recommendation:** [Option #] because [reason]
**Next step:** [Action]
```

---

## Integration with SSS Protocol

### Step 1 (Ideation)

Use full brainstorming framework for product direction.

### Step 3 (UX Design)

Brainstorm user flows, interaction patterns, information architecture.

### Step 10 (Feature Breakdown)

Brainstorm feature decomposition strategies.

### @new-feature

Always brainstorm before implementing new features.

---

## Anti-Patterns

**DON'T:**

- Jump to the first solution that comes to mind
- Skip constraint discovery
- Evaluate options while generating them
- Dismiss "wild card" options too quickly
- Forget to document the decision rationale

**DO:**

- Take time to understand intent
- Generate multiple options
- Include unconventional ideas
- Use structured evaluation
- Document for future reference

---

## Example Session

```markdown
User: "I need to add user notifications to the app"

## Intent Clarification

**Core problem:** Users miss important updates because there's no notification system.
**Who's affected:** All users, but especially power users who need real-time updates.
**Success:** Users see relevant notifications within 5 seconds, engagement increases by 20%.

## Constraints

- Must work with existing React/Next.js stack
- Real-time requirement (WebSocket or polling)
- Mobile-responsive
- Accessible (WCAG 2.1 AA)
- Timeline: 2 weeks

## Solution Exploration

### Option A: Toast Notifications

- **Approach:** In-app toast messages using react-hot-toast
- **Pros:** Simple, familiar UX, quick to implement
- **Cons:** Users might miss them, no persistence
- **Effort:** Low (3 days)

### Option B: Notification Center

- **Approach:** Dropdown panel with notification history
- **Pros:** Persistent, scannable, professional
- **Cons:** More complex, needs backend storage
- **Effort:** Medium (1 week)

### Option C: Ambient Notifications (Wild Card)

- **Approach:** Subtle UI changes (badge colors, sidebar highlights) instead of popups
- **Pros:** Non-intrusive, always visible, unique UX
- **Cons:** Learning curve, might be missed initially
- **Effort:** Medium (1 week)

## Recommendation

**Option B (Notification Center)** with toast support for urgent items.

Rationale: Balances user needs (persistent, scannable) with technical constraints (2-week timeline). Toast layer handles urgent notifications while center provides history.

## Next Steps

1. Design notification center wireframe
2. Define notification types and priorities
3. Plan backend storage schema
4. Implement toast layer first (quick win)
```

---

_Remember: The best solutions emerge from understanding the problem deeply, not from jumping to implementation._
