# SSS Protocol Command Catalog

**Version:** 1.0.0  
**Last Updated:** 2026-01-04

Complete index of all SSS Protocol commands, organized by category.

---

## Quick Reference

| Category | Commands | Purpose |
|----------|----------|---------|
| **Steps** | 14 | Core 13-step workflow |
| **Audit** | 14 | Quality assurance |
| **Dev** | 3 | Development workflow |
| **Ops** | 22 | Operations & management |
| **Deploy** | 4 | Shipping & handoff |
| **Generators** | 15 | Code & doc generation |
| **Marketing** | 17 | GTM workflow |
| **Total** | **89** | |

---

## Platform Support

| Platform | Command Style | Configuration |
|----------|---------------|---------------|
| **Cursor** | `@command-name` | `.cursor/commands/` |
| **Claude Code** | `/command-name` | `.claude/` + `CLAUDE.md` |
| **OpenCode** | `/command-name` | `.opencode/` + `AGENTS.md` |

**Install for your platform:**
```bash
npx sss-protocol install
```

---

## Steps Commands (`steps/`)

The core 13-step product development methodology.

| Command | Description | Key Output |
|---------|-------------|------------|
| `step-0-environment-setup` | Environment validation | None (validation) |
| `step-1-ideation` | Product ideation with Hormozi frameworks | MASTER_PRD.md |
| `step-1.5-offer-architecture` | Offer design (monetized products) | OFFER-SPEC.md |
| `step-2-architecture` | System architecture design | ARCHITECTURE.md |
| `step-3-ux-design` | UX/UI design | UX-DESIGN.md |
| `step-4-flow-tree` | Navigation flow design | FLOW-TREE.md |
| `step-5-wireframe-prototypes` | Wireframe prototypes | WIREFRAME-SPEC.md |
| `step-6-design-system` | Design system & tokens | DESIGN-SYSTEM.md |
| `step-7-interface-states` | Interface state specs | STATE-SPEC.md |
| `step-8-technical-spec` | Technical specification | TECHNICAL-SPEC.md |
| `step-9-landing-page` | Landing page design | LANDING-PAGE-COPY.md |
| `step-10-feature-breakdown` | Feature breakdown | FEATURE-BREAKDOWN.md |
| `step-11-prd-generation` | PRD generation | /docs/prds/*.md |
| `step-12-cursor-rules` | Context engine setup | .cursorrules |
| `step-13-skillpack-generator` | Platform configuration | Skills/rules |

---

## Audit Commands (`audit/`)

Quality assurance and verification.

| Command | Description | Score? |
|---------|-------------|--------|
| `holes` | Pre-implementation gap analysis | ✅ |
| `gap-analysis` | Post-implementation verification | ✅ |
| `verify-prd` | PRD implementation scoring | ✅ |
| `step-verify` | Step completion verification | ✅ |
| `ui-healer` | Browser-based UI testing | ❌ |
| `security-audit` | Security vulnerability scan | ✅ |
| `accessibility-audit` | WCAG compliance check | ✅ |
| `performance-check` | Performance analysis | ✅ |
| `code-quality-report` | Code quality metrics | ✅ |
| `tech-debt-audit` | Technical debt analysis | ✅ |
| `analyze` | General analysis | ❌ |
| `license-check` | Dependency license audit | ❌ |
| `load-test` | Load testing | ✅ |
| `seo-audit` | SEO analysis | ✅ |

---

## Dev Commands (`dev/`)

Development workflow.

| Command | Description |
|---------|-------------|
| `implement-prd` | Implement a PRD feature |
| `plan` | Create implementation plan |
| `db-migrate` | Database migration assistance |

---

## Ops Commands (`ops/`)

Operations and project management.

### Tracking & Planning

| Command | Description |
|---------|-------------|
| `backlog-groom` | Create/update product backlog |
| `sprint-plan` | Plan and commit sprint |
| `daily-standup` | Daily standup with git awareness |
| `job-status` | Query PRD/sprint status |
| `status` | Project health overview |

### Quality Assurance

| Command | Description |
|---------|-------------|
| `qa-plan` | Generate QA test plan |
| `qa-run` | Execute QA tests |
| `qa-report` | Generate QA report |

### Code Reviews

| Command | Description |
|---------|-------------|
| `pr-review` | Code review with scoring |
| `test-review` | Test quality review |
| `release-review` | Final go/no-go decision |

### Maintenance

| Command | Description |
|---------|-------------|
| `dependency-update` | Update dependencies safely |
| `maintenance-plan` | Create maintenance schedule |
| `cleanup-repo` | Repository cleanup |
| `lint-commands` | Lint SSS command files |
| `docs-update` | Update documentation |
| `onboard` | Onboard new team member |
| `prompt-handoff` | Handoff context to another session |
| `repair-manifest` | Repair module manifests |
| `sync-workspace-commands` | Sync commands in workspace |

### Retrofit

| Command | Description |
|---------|-------------|
| `retrofit-analyze` | Analyze existing codebase |
| `retrofit-enhance` | Enhance existing code |
| `retrofit-generate` | Generate from existing patterns |

---

## Deploy Commands (`deploy/`)

Deployment and shipping.

| Command | Description |
|---------|-------------|
| `ship-check` | Pre-deployment validation |
| `ship-stage` | Deploy to staging |
| `ship-prod` | Deploy to production |
| `client-handoff` | Client delivery documentation |

---

## Generator Commands (`generators/`)

Code and document generation.

| Command | Description |
|---------|-------------|
| `scaffold` | Generate project scaffolding |
| `new-feature` | Create new feature structure |
| `new-project` | Initialize new SSS project |
| `new-command` | Create new SSS command |
| `test-gen` | Generate tests from PRD |
| `api-docs-gen` | Generate API documentation |
| `wireframe` | Generate wireframe spec |
| `changelog` | Generate changelog |
| `contract` | Generate contract template |
| `nda` | Generate NDA template |
| `proposal` | Generate project proposal |
| `prototype-proposal` | Generate prototype proposal |
| `estimation-engine` | Estimate project scope |
| `cost-optimizer` | Optimize project costs |
| `notebooklm-format` | Format for NotebookLM |

---

## Marketing Commands (`marketing/`)

Go-to-market workflow.

| Command | Description |
|---------|-------------|
| `01-market-research` | Market research analysis |
| `02-customer-avatar` | Customer persona creation |
| `03-brand-voice` | Brand voice guidelines |
| `04-offer-architect` | Offer design |
| `05-sales-strategy` | Sales strategy |
| `06-email-sequences` | Email sequence creation |
| `07-landing-page-copy` | Landing page copywriting |
| `08-ads-strategy` | Advertising strategy |
| `09-retargeting-strategy` | Retargeting strategy |
| `10-launch-playbook` | Launch planning |
| `11-partnership-outreach` | Partnership outreach |
| `12-content-ideation` | Content ideation |
| `13-content-matrix` | Content matrix |
| `14-video-script` | Video script writing |
| `15-thumbnail-prompts` | Thumbnail prompt generation |
| `16-seo-content` | SEO content creation |
| `17-community-update` | Community update posts |

---

## Installation

### Interactive (Recommended)

```bash
npx sss-protocol install
```

### Manual

See [README.md](../README.md) for manual installation instructions.

---

## Related Documentation

- [WORKFLOW-OVERVIEW.md](WORKFLOW-OVERVIEW.md) - Complete workflow guide
- [FILE-PATH-REFERENCE.md](FILE-PATH-REFERENCE.md) - Output file locations
- [QUICK-REFERENCE.md](QUICK-REFERENCE.md) - Quick command reference
- [SCORING-SYSTEM.md](SCORING-SYSTEM.md) - Quality scoring details

