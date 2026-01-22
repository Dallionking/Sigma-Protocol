# SSS Quick Reference Card

**Version:** 3.0 (Agentic Layer)  
**Last Updated:** 2025-12-29

---

## Workflow Paths

### New Project (Full)
```
@step-0 → @step-1 → [@step-1.5 if monetized] → @step-2 → @step-3 → @step-4 → @step-5 → @step-6 → @step-7 → @step-8 → @step-9 → @step-10 → @step-11 → [@step-11b if parallel] → @step-12
```

### New Project (Minimal)
```
@step-0 → @step-1 → [@step-1.5 if monetized] → @step-2 → @step-3 → @step-4 → @step-6 → @step-8 → @step-10 → @step-11 → @step-12
```

**Notes:** 
- Step 1.5 (Offer Architecture) is conditional - required only for monetized projects.
- Step 11b (PRD Swarm) is optional - for parallel multi-terminal implementation (5+ PRDs).

### Existing Project (Retrofit)
```
@analyze → @retrofit-analyze → @retrofit-generate → @verify-prd → @ship-check
```

### Daily Development
```
@implement-prd F[N] → @verify-prd F[N] → @ship-check
```

---

## Commands by Task

| Task | Command | Description |
|------|---------|-------------|
| **Start new project** | `@step-1-ideation` | Define vision & tech stack |
| **Offer design** | `@step-1.5-offer-architecture` | *(Monetized only)* Hormozi framework pricing |
| **Design architecture** | `@step-2-architecture` | System design & data models |
| **Design UX** | `@step-3-ux-design` | User flows & wireframes |
| **Flow tree** | `@step-4-flow-tree` | Screen architecture & navigation + bulletproof gates |
| **Visual prototypes** | `@step-5-wireframe-prototypes` | Runnable UI prototypes + wireframe tracker |
| **Design system** | `@step-6-design-system` | Tokens & components |
| **Interface states** | `@step-7-interface-states` | All UI states |
| **Technical spec** | `@step-8-technical-spec` | Full implementation spec |
| **Landing page** | `@step-9-landing-page` | Conversion copywriting |
| **Break down features** | `@step-10-feature-breakdown` | Feature roadmap |
| **Generate PRDs** | `@step-11-prd-generation` | Executable PRDs |
| **Swarm PRDs** | `@step-11b-prd-swarm` | Parallel implementation groups |
| **AI context** | `@step-12-context-engine` | .cursorrules generation |

---

## Development Commands

| Task | Command | Description |
|------|---------|-------------|
| **Plan implementation** | `@plan` | Turn a PRD into an Exa-researched, skill-driven implementation plan (no assumptions) |
| **Implement feature** | `@implement-prd F[N]` | Code from PRD |
| **Scaffold code** | `@scaffold --type=feature` | Boilerplate generation |
| **DB migration** | `@db-migrate --action=generate` | Schema changes |
| **Run dev loop** | `@dev-loop` | Grade 4 self-correcting implementation |
| **Resume dev loop** | `@dev-loop --from=F[N]` | Resume from active task |

---

## Audit & Quality

| Task | Command | Description |
|------|---------|-------------|
| **Verify step** | `@step-verify --step=N` | 100-point step scoring |
| **Fix step gaps** | `@step-verify --step=N --fix` | Auto-fill missing items |
| **Verify PRD** | `@verify-prd F[N]` | Quality check (8+/10) |
| **Gap analysis (post-implementation)** | `@gap-analysis` | Full gap analysis + auto-fill; runs UI Healer validation when UI is involved |
| **Analyze codebase** | `@analyze` | Health report |
| **UI testing** | `@ui-healer` | Fix UI issues |
| **Security check** | `@security-audit` | Vulnerability scan |
| **Pre-deploy** | `@ship-check` | Deployment checklist |

---

## Operations

| Task | Command | Description |
|------|---------|-------------|
| **Check status** | `@status` | Workflow progress |
| **Orchestrate PRDs** | `@prd-orchestrate` | Swarm PRDs for parallel dev |
| **Retrofit existing** | `@retrofit-analyze` | Analyze for SSS adoption |
| **Generate SSS docs** | `@retrofit-generate` | Create missing docs |
| **Clean repo** | `@maid` | Content-aware cleanup + code simplification |
| **Update docs** | `@docs-update` | Sync documentation |
| **Client handoff** | `@client-handoff` | Handoff package |

---

## Thread-Based Engineering

| Task | Command | Description |
|------|---------|-------------|
| **Thread wizard** | `sigma thread` | Choose the right thread type |
| **Thread status** | `sigma thread status` | View active threads |
| **Track improvement** | `sigma thread metrics` | 4 dimensions of improvement |
| **Fusion thread** | `sigma f-thread` | Same prompt to multiple agents |
| **P-Thread (parallel)** | `sigma orchestrate` | Multiple parallel streams |
| **Launch mprocs** | `sigma orchestrate --tui mprocs` | Best TUI for orchestration |

---

## Common Workflows

### Start a New Feature
```bash
@step-10-feature-breakdown  # Plan the feature
@step-11-prd-generation     # Generate PRD
@verify-prd F[N]            # Check quality
@plan --prd-id=F[N]          # Create an implementation plan (Exa-researched, no assumptions)
@implement-prd F[N]         # Write code
@verify-prd F[N]            # Final check
```

### Fix a Bug
```bash
@analyze                   # Understand codebase
@implement-prd F[N]        # Fix using PRD
@verify-prd F[N]           # Verify fix
@ship-check                # Pre-deploy check
```

### Retrofit a Fork
```bash
@retrofit-analyze          # Analyze gaps
@retrofit-generate --priority=critical  # Generate critical docs
@retrofit-generate --step=11            # Generate PRDs
@retrofit-enhance          # Enhance existing docs with new frameworks ✨ NEW
@status                    # Check progress
```

### Parallel Implementation (P-Thread)
```bash
# Option 1: CLI Orchestration (Recommended)
sigma orchestrate --tui mprocs       # Best TUI experience
sigma orchestrate --agent=claude     # Specify Claude Code
sigma orchestrate --agent=opencode   # Or use OpenCode

# Option 2: Manual Swarm Setup
@step-11b-prd-swarm       # Analyze & group PRDs into swarms
@prd-orchestrate --terminals=4  # Standalone swarm orchestration

# TUI Options:
# - mprocs (brew install mprocs) - Sidebar navigation, recommended
# - overmind (brew install overmind) - Procfile-based
# - tmux (brew install tmux) - Classic panes
```

### Fusion Thread (F-Thread)
```bash
# Same prompt to multiple agents for best results
sigma f-thread --prompt="Review auth security" --count=5
sigma f-thread --aggregate=consensus  # Consensus mode
sigma f-thread --aggregate=best       # Pick the best
```

### Pre-Deployment
```bash
@status                    # Check all steps complete
@ship-check                # Run all checks
@security-audit            # Security scan
@client-handoff            # Generate handoff docs
```

---

## Scoring Thresholds

| Score | Grade | Status |
|-------|-------|--------|
| 9-10 | A | Production Ready |
| 8 | B+ | Production Ready (Minor Issues) |
| 7 | B | Needs Work |
| 6 | C | Significant Issues |
| <6 | D/F | Blocking Issues |

**Target:** All PRDs must score **8+/10** before implementation.

---

## File Paths (Canonical)

| Document | Path |
|----------|------|
| Master PRD | `docs/specs/MASTER_PRD.md` |
| Stack Profile | `docs/stack-profile.json` |
| **Offer Architecture** | `docs/specs/OFFER_ARCHITECTURE.md` *(Step 1.5)* |
| **Pricing Config** | `docs/specs/pricing-config.json` *(Step 1.5)* |
| Architecture | `docs/architecture/ARCHITECTURE.md` |
| UX Design | `docs/ux/UX-DESIGN.md` |
| Flow Tree | `docs/flows/FLOW-TREE.md` |
| Screen Inventory | `docs/flows/SCREEN-INVENTORY.md` |
| Transition Map | `docs/flows/TRANSITION-MAP.md` |
| **Traceability Matrix** | `docs/flows/TRACEABILITY-MATRIX.md` *(Bulletproof Gate)* |
| **Zero Omission Cert** | `docs/flows/ZERO-OMISSION-CERTIFICATE.md` *(Bulletproof Gate)* |
| Wireframes | `docs/wireframes/PROTOTYPE-SUMMARY.md` |
| **Wireframe Tracker** | `docs/prds/flows/WIREFRAME-TRACKER.md` *(Bulletproof Gate)* |
| Design System | `docs/design/DESIGN-SYSTEM.md` |
| Interface States | `docs/states/STATE-SPEC.md` |
| Technical Spec | `docs/technical/TECHNICAL-SPEC.md` |
| Landing Page | `docs/landing-page/LANDING-PAGE.md` |
| Feature Breakdown | `docs/implementation/FEATURE-BREAKDOWN.md` |
| PRDs | `docs/prds/F[N]-[NAME].md` |
| **Swarm Plan** | `docs/prds/SWARM-PLAN.md` *(Step 11b)* |
| **Swarm Folders** | `docs/prds/swarm-[N]/` *(Step 11b)* |
| **PRD Status** | `docs/prds/.prd-status.json` *(Step 11b)* |
| Cursor Rules | `.cursorrules` |
| **SSS Manifest** | `.sss-manifest.json` *(Version tracking)* |
| **Agentic Tools** | `.sigma/tools/` *(Grade 3 - typecheck, lint, test, build)* |
| **Active Task** | `.sigma/memory/active_task.md` *(Grade 4 - resume support)* |

---

## Emergency Commands

| Situation | Command |
|-----------|---------|
| "What step am I on?" | `@status` |
| "Is step X complete?" | `@step-verify --step=X` |
| "Fix step X gaps" | `@step-verify --step=X --fix` |
| "Is this PRD good?" | `@verify-prd F[N]` |
| "Did we miss anything in the implementation?" | `@gap-analysis` |
| "How do I run multiple terminals?" | `@prd-orchestrate` |
| "What swarm am I working on?" | `@prd-orchestrate --status` |
| "Can I deploy?" | `@ship-check` |
| "What's broken?" | `@analyze` |
| "Fix the UI" | `@ui-healer [route]` |

---

*Keep this card handy for quick reference!*
