---
name: using-sigma-skills
description: "Meta-skill for proper skill discovery, invocation, composition, and CSO optimization. Learn how to find and use skills effectively."
version: "1.0.0"
tags: [meta, discovery, invocation, composition, cso, search]
triggers:
  - skill discovery
  - find skill
  - which skill
  - how to use skills
  - skill composition
  - chain skills
---

# Using Sigma Skills

This meta-skill teaches **how to discover, invoke, compose, and optimize skills** within the Sigma Protocol. Think of skills as specialized tools in a workshop - knowing which tool to reach for and how to combine them is as important as having them.

## Overview

Skills are encapsulated expertise modules that enhance agent capabilities. This skill covers:

1. **Skill Discovery** - Finding the right skill for your task
2. **CSO (Claude Search Optimization)** - Making skills findable
3. **Invocation Patterns** - When and how to invoke skills
4. **Composition Strategies** - Combining skills effectively
5. **Anti-Patterns** - Common mistakes to avoid

---

## When to Use This Skill

Invoke this skill when:

- Starting a new task and unsure which skills apply
- Creating new skills that need to be discoverable
- Optimizing skill search/matching behavior
- Designing multi-skill workflows
- Debugging skill invocation issues
- Training team members on skill usage

---

## Skill Discovery Patterns

### Pattern 1: Keyword Matching

Skills activate based on **triggers** defined in frontmatter. Search by:

```markdown
## Finding by Trigger
"debugging" → systematic-debugging, root-cause-tracing
"react" → react-performance, frontend-design
"test" → verification-before-completion, tdd-skill-creation
"marketing" → marketing-copywriting, launch-strategy
```

### Pattern 2: Task-Based Discovery

Match your task type to skill categories:

| Task Type | Skill Category | Examples |
|-----------|----------------|----------|
| Planning | Research & Planning | deep-research, brainstorming |
| Building | Frontend/Backend | frontend-design, react-performance |
| Debugging | Quality & Debug | systematic-debugging, root-cause-tracing |
| Shipping | Verification | verification-before-completion |
| Writing | Communication | writing-clearly, marketing-copywriting |

### Pattern 3: Context-Based Discovery

Let context guide discovery:

```markdown
## Error in component?
→ systematic-debugging + root-cause-tracing

## Slow React app?
→ react-performance

## Writing PRD?
→ brainstorming + writing-clearly

## Security concerns?
→ defense-in-depth + security-audit
```

### Pattern 4: Skill Registry Search

Use the skill registry for programmatic discovery:

```bash
# List all skills
ls .claude/skills/*.md | head -20

# Search by keyword in description
grep -l "performance" .claude/skills/*.md

# Search by trigger
grep -l "debug" .claude/skills/*.md
```

---

## CSO (Claude Search Optimization)

Make your skills **findable** by optimizing for discovery:

### 1. Description Optimization

The `description` field is the primary search target:

```yaml
# ❌ BAD: Vague, doesn't describe capability
description: "A helpful debugging skill"

# ✅ GOOD: Specific, action-oriented, keyword-rich
description: "Trace bugs to root cause using 5 Whys methodology. Separate symptoms from causes, verify fixes systematically."
```

**CSO Best Practices:**
- Lead with action verb (trace, optimize, validate, generate)
- Include 2-3 key methodologies or techniques
- Mention primary use case
- Keep under 200 characters for quick scanning

### 2. Trigger Optimization

Triggers should capture all invocation scenarios:

```yaml
# ❌ BAD: Too narrow
triggers:
  - debugging

# ✅ GOOD: Covers variations and related terms
triggers:
  - debug
  - debugging
  - bug-fix
  - error-investigation
  - test-failure
  - exception
  - crash
```

**Trigger Rules:**
- Use lowercase, hyphenated format
- Include verb forms (debug, debugging)
- Include related concepts (error, crash, exception)
- Include Sigma command triggers (implement-prd, ui-healer)

### 3. Tag Optimization

Tags enable categorical discovery:

```yaml
# ✅ GOOD: Hierarchical and searchable
tags: [debugging, root-cause, testing, quality, backend, frontend]
```

---

## Skill Invocation Patterns

### Direct Invocation

Use when you know the exact skill needed:

```markdown
## Direct Invocation
Agent: "Applying react-performance skill for this optimization..."

## With Explicit Loading
Agent: Use Skill tool with skill: "react-performance"
```

### Conditional Invocation

Check context before invoking:

```markdown
## Conditional Pattern
IF task contains "debug" OR error detected:
  → Invoke systematic-debugging

IF implementing React component:
  → Invoke frontend-design + react-performance

IF task marked "done" OR "complete":
  → Invoke verification-before-completion
```

### Cascading Invocation

One skill triggers another:

```markdown
## Cascade Example
1. systematic-debugging finds root cause
2. → Triggers fix-review for solution review
3. → Triggers verification for fix validation
```

---

## Composition vs Direct Invocation

### When to Use Single Skill

Use direct invocation when:
- Task is narrowly scoped
- Skill is self-contained
- Speed is priority
- No cross-cutting concerns

```markdown
## Single Skill Example
Task: "Optimize this slow React list"
→ Invoke: react-performance only
```

### When to Compose Skills

Compose multiple skills when:
- Task spans multiple domains
- Quality requires multiple perspectives
- Task has phases (research → implement → verify)

```markdown
## Composition Example
Task: "Debug and fix slow dashboard"

Phase 1 - Diagnosis:
  → systematic-debugging (identify issue)
  → root-cause-tracing (find actual cause)

Phase 2 - Solution:
  → react-performance (apply optimizations)

Phase 3 - Verification:
  → verification-before-completion (confirm fix)
```

### Skill Chains

Predefined sequences for common workflows:

```markdown
## Research Chain
deep-research → brainstorming → executing-plans

## Quality Chain
systematic-debugging → verification-before-completion

## Implementation Chain
frontend-design → react-performance → verification-before-completion

## Marketing Chain
marketing-psychology → marketing-copywriting → launch-strategy
```

---

## Workflow: Skill Selection Decision Tree

```
START: What is the task?
    │
    ├─► Planning/Research?
    │       └─► deep-research + brainstorming
    │
    ├─► Building UI?
    │       └─► frontend-design + react-performance
    │
    ├─► Debugging?
    │       └─► systematic-debugging + root-cause-tracing
    │
    ├─► Writing?
    │       └─► writing-clearly (+ marketing-* if promotional)
    │
    ├─► Testing/Verification?
    │       └─► verification-before-completion
    │
    └─► Shipping?
            └─► verification + quality-gates
```

---

## Examples

### Example 1: Bug Fix Request

```markdown
User: "The checkout form is crashing on submit"

## Skill Selection Process

1. IDENTIFY: Error/crash → debugging domain
2. SELECT PRIMARY: systematic-debugging
3. SELECT SUPPORTING: root-cause-tracing (for 5 Whys)
4. SELECT VERIFICATION: verification-before-completion

## Invocation Order
1. systematic-debugging → Reproduce, gather evidence
2. root-cause-tracing → Trace crash to root cause
3. [Apply fix]
4. verification-before-completion → Confirm fix works
```

### Example 2: New Feature Implementation

```markdown
User: "Implement the user dashboard from PRD-042"

## Skill Selection Process

1. IDENTIFY: React UI → frontend + performance domain
2. IDENTIFY: New feature → needs verification
3. SELECT: frontend-design, react-performance, verification-before-completion

## Invocation Order
1. frontend-design → Component architecture
2. react-performance → Apply optimizations proactively
3. verification-before-completion → Before marking done
```

### Example 3: Performance Optimization

```markdown
User: "Dashboard loads slowly, users complaining"

## Skill Selection Process

1. IDENTIFY: Performance issue → react-performance
2. IDENTIFY: Unknown cause → debugging needed
3. SELECT: systematic-debugging → react-performance → verification

## Invocation Order
1. systematic-debugging → Profile and identify bottleneck
2. react-performance → Apply appropriate optimization
3. verification-before-completion → Measure improvement
```

---

## Anti-Patterns

### 1. Skill Overload

```markdown
# ❌ BAD: Invoking too many skills
Task: "Fix typo in button text"
Skills: systematic-debugging, frontend-design, react-performance,
        verification-before-completion, writing-clearly

# ✅ GOOD: Minimal skill set for task
Task: "Fix typo in button text"
Skills: None needed - simple edit
```

### 2. Wrong Skill Category

```markdown
# ❌ BAD: Using debugging skill for feature work
Task: "Add new payment method"
Skill: systematic-debugging  # Wrong!

# ✅ GOOD: Match skill to task type
Task: "Add new payment method"
Skills: frontend-design, verification-before-completion
```

### 3. Skipping Verification

```markdown
# ❌ BAD: No verification after fix
1. systematic-debugging → Found issue
2. Applied fix
3. Marked done  # Missing verification!

# ✅ GOOD: Always verify
1. systematic-debugging → Found issue
2. Applied fix
3. verification-before-completion → Confirmed fix
4. Marked done
```

### 4. Serial When Parallel Works

```markdown
# ❌ BAD: Sequential invocation for independent checks
1. Run security-audit
2. Wait...
3. Run accessibility-audit
4. Wait...
5. Run performance-check

# ✅ GOOD: Parallel invocation for independent tasks
1. Run security-audit | accessibility-audit | performance-check
2. Aggregate results
```

---

## Checklist: Before Invoking a Skill

- [ ] Is this the right skill for the task type?
- [ ] Have I identified all necessary supporting skills?
- [ ] Am I invoking minimum required skills (not overloading)?
- [ ] Is verification included in the skill chain?
- [ ] Can any skills run in parallel?
- [ ] Have I considered the skill's prerequisites?

---

## Creating Discoverable Skills

When creating new skills, ensure discoverability:

```yaml
---
name: my-new-skill           # lowercase-hyphenated
description: "Action verb + capability + methodology + use case"
version: "1.0.0"
tags: [category, subcategory, related-concepts]
triggers:
  - primary-keyword
  - alternate-keyword
  - related-command
  - use-case-trigger
---
```

**Discoverability Checklist:**
- [ ] Description starts with action verb
- [ ] Description mentions key methodology
- [ ] Triggers include all variations
- [ ] Tags cover category and related concepts
- [ ] Name is intuitive and searchable

---

*Remember: Skills are tools, not crutches. Use the right skill for the job, compose them thoughtfully, and always include verification in your workflow.*
