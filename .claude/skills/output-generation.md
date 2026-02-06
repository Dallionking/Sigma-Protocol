---
name: output-generation
description: "Standard output generation patterns for Sigma Protocol artifacts"
version: "1.0.0"
triggers:
  - document-creation
  - artifact-generation
  - report-writing
disable-model-invocation: true
---

# Output Generation Skill

This skill defines standard patterns for generating Sigma Protocol artifacts with consistent structure and quality.

## Document Templates

### PRD Template (Step 11)

```markdown
# PRD: [Feature ID] - [Feature Name]

**Version:** 1.0.0
**Created:** [DATE]
**Author:** AI Agent + [Human Reviewer]
**Status:** Draft | In Review | Approved | Implemented

---

## Overview

### User Story
As a [user type], I want to [action] so that [benefit].

### Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| [KPI 1] | [Target] | [How measured] |

---

## Acceptance Criteria

- [ ] AC1: [Specific, testable criterion]
- [ ] AC2: [Specific, testable criterion]
- [ ] AC3: [Specific, testable criterion]
- [ ] AC4: [Specific, testable criterion]
- [ ] AC5: [Specific, testable criterion]

---

## UI/UX Specifications

### Screens
| Screen | Route | Description |
|--------|-------|-------------|
| [Name] | /path | [Purpose] |

### Components
- [Component 1]: [Description]
- [Component 2]: [Description]

### States
- **Loading**: [Description]
- **Empty**: [Description]
- **Error**: [Description]
- **Success**: [Description]

---

## Technical Requirements

### API Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/v1/... | [Purpose] | Required |
| POST | /api/v1/... | [Purpose] | Required |

### Data Model
\`\`\`typescript
interface [EntityName] {
  id: string;
  // ... fields
}
\`\`\`

---

## BDD Scenarios

### Scenario 1: [Happy Path]
\`\`\`gherkin
Given [precondition]
When [action]
Then [expected result]
\`\`\`

### Scenario 2: [Error Case]
\`\`\`gherkin
Given [precondition]
When [action with error]
Then [error handling]
\`\`\`

### Scenario 3: [Edge Case]
\`\`\`gherkin
Given [edge condition]
When [action]
Then [expected behavior]
\`\`\`

---

## Edge Cases

| Case | Expected Behavior | Notes |
|------|-------------------|-------|
| [Edge case 1] | [Behavior] | |
| [Edge case 2] | [Behavior] | |

---

## Out of Scope

- [Explicitly excluded feature 1]
- [Explicitly excluded feature 2]

---

## Dependencies

- [PRD-XX]: [Dependency description]
- [External Service]: [Why needed]

---

## Open Questions

- [ ] [Question 1]?
- [ ] [Question 2]?
```

---

## Artifact Naming Conventions

### File Naming

| Artifact Type | Pattern | Example |
|--------------|---------|---------|
| PRD | `F[##]-[kebab-case-name].md` | `F01-user-authentication.md` |
| Architecture | `ARCHITECTURE.md` | - |
| Design System | `DESIGN-SYSTEM.md` | - |
| Flow Tree | `FLOW-TREE.md` | - |
| Analysis | `[TYPE]-YYYY-MM-DD.md` | `GAP-ANALYSIS-2026-01-04.md` |

### Directory Structure

```
docs/
├── specs/
│   └── MASTER_PRD.md
├── architecture/
│   └── ARCHITECTURE.md
├── ux/
│   └── UX-DESIGN.md
├── flows/
│   ├── FLOW-TREE.md
│   ├── SCREEN-INVENTORY.md
│   └── TRACEABILITY-MATRIX.md
├── design/
│   ├── DESIGN-SYSTEM.md
│   ├── UI-PROFILE.md
│   └── ui-profile.json
├── states/
│   └── STATE-SPEC.md
├── technical/
│   └── TECHNICAL-SPEC.md
├── prds/
│   ├── PRD-INDEX.md
│   ├── F01-auth.md
│   ├── F02-dashboard.md
│   └── ...
├── landing/
│   └── LANDING-PAGE.md
├── features/
│   └── FEATURE-BREAKDOWN.md
└── analysis/
    └── GAP-ANALYSIS-YYYY-MM-DD.md
```

---

## Quality Checklist

Before finalizing any document:

### Content Quality
- [ ] No ambiguous language (should, maybe, probably, TBD)
- [ ] All placeholders replaced with actual content
- [ ] Version and date are current
- [ ] Author attribution is correct

### Technical Quality
- [ ] Code snippets are syntactically correct
- [ ] API endpoints follow REST conventions
- [ ] Data models use correct TypeScript types
- [ ] BDD scenarios follow Gherkin syntax

### Completeness
- [ ] All required sections are present
- [ ] Acceptance criteria are testable
- [ ] Edge cases are documented
- [ ] Out of scope is explicit

### Traceability
- [ ] Links to related documents work
- [ ] Feature IDs are consistent
- [ ] Dependencies are accurate

---

## HITL Checkpoint Format

When requesting human review:

```markdown
---
## 🛑 HITL Checkpoint: [Checkpoint Name]

**What's Complete:**
- [Item 1]
- [Item 2]

**What Needs Your Review:**
1. [Specific question or decision needed]
2. [Another item requiring input]

**Proposed Next Steps:**
- [ ] [Action 1] (after your approval)
- [ ] [Action 2]

**Your Options:**
- ✅ **Approve**: Type "approved" or "continue"
- 🔧 **Revise**: Provide specific feedback
- ❌ **Reject**: Explain concerns

---
```

---

## Report Generation

### Analysis Report Template

```markdown
# [Analysis Type] Report

**Generated:** [TIMESTAMP]
**Command:** @[command-name]
**Parameters:** [params used]

---

## Executive Summary

[2-3 sentence summary of findings]

## Key Findings

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | [Finding] | Critical/High/Medium/Low | Fixed/Open |

## Detailed Analysis

### [Section 1]
[Content]

### [Section 2]
[Content]

## Recommendations

1. **[Recommendation 1]**: [Details]
2. **[Recommendation 2]**: [Details]

## Next Steps

- [ ] [Action item 1]
- [ ] [Action item 2]

---

*Generated by Sigma Protocol v1.0.0*
```

---

## Confidence Artifacts

### Epistemic Confidence Block

```markdown
<!-- EPISTEMIC-GATE-START -->
## Epistemic Confidence Report

**Confidence:** [X]% [✅ | ⚠️ | ⛔]
**Computed:** [TIMESTAMP]
**Command:** @[command]
**Tier:** [1-4]

### Evidence Ledger
| # | Claim | Source | Citation |
|---|-------|--------|----------|
| 1 | [Claim] | [Ref/Exa/Perplexity] | [URL] |

### Uncertainties
- **CRITICAL:** [List or "None"]
- **NON-CRITICAL:** [List]
<!-- EPISTEMIC-GATE-END -->
```

