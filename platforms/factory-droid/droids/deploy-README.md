---
name: README.md
description: "Sigma deploy command: README.md"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# README.md

**Source:** Sigma Protocol deploy module
**Version:** 1.0.0

---

# Sigma Deploy Commands

Deployment and shipping commands.

## Overview

Deploy commands handle the shipping process: pre-deployment checks, staging, production, and client handoff.

## Command List

| Command | Description | When to Use |
|---------|-------------|-------------|
| `@ship-check` | Pre-deployment validation | Before any deployment |
| `@ship-stage` | Deploy to staging | When ready for QA |
| `@ship-prod` | Deploy to production | When approved for release |
| `@client-handoff` | Client delivery documentation | When handing off to client |

## Usage

### Standard Deployment Flow

```bash
# 1. Run pre-deployment checks
@ship-check

# 2. Deploy to staging
@ship-stage

# 3. QA on staging
@qa-run --environment=staging

# 4. If QA passes, deploy to production
@ship-prod
```

### Ship Check Validations

`@ship-check` validates:
- All PRD verification scores ≥ 8/10
- All tests passing
- No critical security issues
- No accessibility violations
- Performance budgets met
- Database migrations ready
- Environment variables configured

### Client Handoff

```bash
# Generate handoff documentation
@client-handoff --project=MyProject

# Creates:
# - Deployment instructions
# - Credentials summary (sanitized)
# - Maintenance guide
# - Support contacts
```

## Related

- [QA-SYSTEM.md](../docs/qa/QA-SYSTEM.md)
- [REVIEW-SYSTEM.md](../docs/reviews/REVIEW-SYSTEM.md)
