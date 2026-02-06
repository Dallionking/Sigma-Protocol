---
name: greptile-pr-review
description: "AI-powered PR review using Greptile's deep codebase understanding. Auto-triggers after PR creation to provide architecture-aware code review with full repo context. Uses Greptile MCP tools to query, index, and analyze repositories."
version: "1.0.0"
source: "greptile-integration"
platform: claude-code
triggers:
  - pr-review
  - greptile
  - review pr
  - merge request
  - pull request
  - code review
---

# Greptile PR Review

AI-powered code review using Greptile's full codebase understanding via MCP.

## Core Principles

1. **Codebase-Aware**: Greptile indexes your entire repo — reviews understand architecture, not just the diff
2. **Complementary**: Enhances (not replaces) the existing `/pr-review` command with AI-powered analysis
3. **Auto-Trigger**: Runs automatically after PR creation or on-demand
4. **Fix-Forward**: Every comment includes a click-to-copy fix prompt with full context

---

## Quick Reference

### Greptile MCP Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `greptile_query` | Ask natural language questions about the codebase | Analyzing PR changes in context |
| `greptile_index` | Index a repository for Greptile analysis | First-time setup or after major restructuring |
| `greptile_repo_info` | Check indexing status | Verify repo is ready for review |

### Workflow Modes

| Mode | Trigger | Description |
|------|---------|-------------|
| **Post-PR** | After `gh pr create` | Full review of PR diff with codebase context |
| **Pre-Merge** | Before merge approval | Final check with Greptile + local `/pr-review` |
| **On-Demand** | `/greptile-pr-review` | Manual invocation for any branch/PR |
| **Auto-Resolve** | After Greptile bot comments | Fetch and fix Greptile's GitHub comments |

---

## Integration with Sigma Workflow

### When This Skill Activates

This skill should be invoked in these scenarios:

1. **After PR creation** — Run Greptile review as a quality gate
2. **During `/pr-review`** — Augment the standard review with Greptile insights
3. **Before merge** — Final automated check
4. **When user mentions "greptile"** — Direct invocation

### Complementing `/pr-review`

The existing `/pr-review` command does structural analysis against Sigma artifacts (PRDs, architecture specs, design system). Greptile adds:

- **Cross-file impact analysis** — understands how changes ripple through the codebase
- **Historical context** — knows why code was written a certain way
- **Pattern detection** — identifies deviations from established codebase patterns
- **Dependency awareness** — flags breaking changes in internal APIs

### Recommended Flow

```
1. Developer creates PR
   ↓
2. /greptile-pr-review --pr=<number>     ← Greptile AI review
   ↓
3. /pr-review --prd-id=<id>              ← Sigma structural review
   ↓
4. Combine findings into unified report
   ↓
5. Fix issues → re-review → merge
```

---

## Decision Tree

```
├─ Creating a new PR?
│  └─ Run /greptile-pr-review --pr=<number> after gh pr create
│
├─ Greptile bot left comments on GitHub?
│  └─ Run /greptile-pr-review --auto-resolve --pr=<number>
│     (Fetches comments, implements fixes, pushes)
│
├─ Want codebase-wide impact analysis?
│  └─ Use greptile_query: "What would break if [change description]?"
│
├─ First time using Greptile on this repo?
│  └─ Run /greptile-pr-review --index first
│
└─ Quick review of current branch?
   └─ Run /greptile-pr-review (auto-detects branch and PR)
```

---

## Quality Checklist

Before delivering Greptile review results:

- [ ] Repository is indexed (check with greptile_repo_info)
- [ ] PR number or branch identified
- [ ] Greptile query results analyzed
- [ ] Findings cross-referenced with Sigma specs (if available)
- [ ] Critical issues flagged with severity levels
- [ ] Fix suggestions included for each finding
- [ ] Review report generated at `/docs/reviews/`

---

## Tips for Best Results

**Do:**
- Index the repo before first review (`--index` flag)
- Combine with `/pr-review` for comprehensive coverage
- Use `--auto-resolve` to fix Greptile bot comments automatically
- Ask Greptile about cross-file impacts for large PRs
- Re-run after fixing issues to verify

**Don't:**
- Skip indexing (Greptile needs full repo context)
- Rely solely on Greptile (use alongside structural `/pr-review`)
- Ignore Greptile's historical context insights
- Auto-merge without human review of Greptile findings

---

## Example Queries for Greptile

### Architecture Impact
```
"What functions call the authentication middleware and would be affected by this change?"
```

### Pattern Compliance
```
"Does this PR follow the same error handling pattern used in the rest of the codebase?"
```

### Breaking Changes
```
"Are there any consumers of this API endpoint that would break with these parameter changes?"
```

### Security Review
```
"Are there any security concerns with the changes in this PR, considering the existing auth flow?"
```
