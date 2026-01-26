---
name: README.md
description: "Sigma ops command: README.md"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# README.md

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

# SSS Ops Commands

Operations and project management commands.

## Overview

Ops commands provide "senior engineering team" workflows: sprint planning, standups, reviews, QA, and status tracking.

## Command Categories

### Tracking & Planning

| Command | Description |
|---------|-------------|
| `@backlog-groom` | Create/update product backlog |
| `@sprint-plan` | Plan and commit sprint |
| `@daily-standup` | Daily standup with git-aware progress |
| `@job-status` | Query PRD/sprint status |
| `@status` | Project health overview |

### Quality Assurance

| Command | Description |
|---------|-------------|
| `@qa-plan` | Generate QA test plan from PRD |
| `@qa-run` | Execute QA tests (E2E, visual, manual) |
| `@qa-report` | Generate comprehensive QA report |

### Code Reviews

| Command | Description |
|---------|-------------|
| `@pr-review` | Code review with scoring |
| `@test-review` | Test quality review |
| `@release-review` | Final go/no-go decision |

### Maintenance

| Command | Description |
|---------|-------------|
| `@dependency-update` | Update dependencies safely |
| `@maintenance-plan` | Create maintenance schedule |
| `@cleanup-repo` | Repository cleanup |
| `@lint-commands` | Lint SSS command files |

## Usage

### Sprint Workflow

```bash
# 1. Groom backlog
@backlog-groom

# 2. Plan sprint
@sprint-plan --capacity=80

# 3. Daily standups
@daily-standup

# 4. Check status
@job-status --prd-id=F1
```

### Review Workflow

```bash
# After implementation
@pr-review --prd-id=F1
@test-review --prd-id=F1

# Before release
@release-review
```

## Tracking Database

All ops commands use `/.tracking-db/` for state:
- `/.tracking-db/prds/*.json` - PRD tracking
- `/.tracking-db/sprints/*.json` - Sprint data
- `/.tracking-db/metrics.json` - Velocity metrics

## Related

- [TRACKING-SYSTEM.md](../docs/tracking/TRACKING-SYSTEM.md)
- [QA-SYSTEM.md](../docs/qa/QA-SYSTEM.md)
- [REVIEW-SYSTEM.md](../docs/reviews/REVIEW-SYSTEM.md)
