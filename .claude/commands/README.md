---
name: README.md
description: "Sigma audit command: README.md"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# README.md

**Source:** Sigma Protocol audit module
**Version:** 1.0.0

---

# SSS Audit Commands

Quality assurance and verification commands.

## Overview

Audit commands validate implementations, find gaps, and ensure quality before shipping.

## Command List

| Command | Description | When to Use |
|---------|-------------|-------------|
| `@holes` | Pre-implementation gap analysis | Before starting implementation |
| `@gap-analysis` | Post-implementation verification | After completing features |
| `@verify-prd` | PRD implementation scoring | After implementing a PRD |
| `@step-verify` | Step completion verification | After completing a step |
| `@ui-healer` | Browser-based UI testing | When UI has issues |
| `@security-audit` | Security vulnerability scan | Before deployment |
| `@accessibility-audit` | WCAG compliance check | Before deployment |
| `@performance-check` | Performance analysis | Before deployment |
| `@code-quality-report` | Code quality metrics | During code review |
| `@tech-debt-audit` | Technical debt analysis | Sprint planning |
| `@analyze` | General analysis | As needed |
| `@license-check` | Dependency license audit | Before deployment |
| `@load-test` | Load testing | Before production |
| `@seo-audit` | SEO analysis | For marketing sites |

## Usage

```bash
# Verify a PRD implementation
@verify-prd --prd-id=F1

# Run gap analysis
@gap-analysis --scope=feature --target=F1

# Run pre-ship checks
@security-audit
@accessibility-audit
@performance-check
```

## Scoring

Most audit commands use a scoring system:
- **90-100**: Excellent
- **80-89**: Good (passing)
- **70-79**: Needs improvement
- **<70**: Failing

## Related

- [SCORING-SYSTEM.md](../docs/SCORING-SYSTEM.md)
- [QA-SYSTEM.md](../docs/qa/QA-SYSTEM.md)


