# SSS Steps Commands

The core 13-step product development methodology.

## Overview

These commands guide you through the complete SSS workflow, from ideation to deployment.

## Command List

| Command | Description | Outputs |
|---------|-------------|---------|
| `@step-0-environment-setup` | Environment validation | None (validation only) |
| `@step-1-ideation` | Product Ideation with Hormozi frameworks | MASTER_PRD.md, stack-profile.json |
| `@step-1.5-offer-architecture` | Offer design (if monetized) | OFFER-SPEC.md |
| `@step-2-architecture` | System Architecture | ARCHITECTURE.md |
| `@step-3-ux-design` | UX/UI Design | UX-DESIGN.md |
| `@step-4-flow-tree` | Navigation Flow | FLOW-TREE.md, SCREEN-INVENTORY.md |
| `@step-5-wireframe-prototypes` | Wireframe Prototypes | WIREFRAME-SPEC.md |
| `@step-6-design-system` | Design System & Tokens | DESIGN-SYSTEM.md |
| `@step-7-interface-states` | Interface States | STATE-SPEC.md |
| `@step-8-technical-spec` | Technical Specification | TECHNICAL-SPEC.md |
| `@step-9-landing-page` | Landing Page (optional) | LANDING-PAGE-COPY.md |
| `@step-10-feature-breakdown` | Feature Breakdown | FEATURE-BREAKDOWN.md |
| `@step-11-prd-generation` | PRD Generation | /docs/prds/*.md |
| `@step-12-context-engine` | Context Engine | .cursorrules, .cursor/rules/*.mdc |
| `@step-13-skillpack-generator` | Platform Configuration | Skills/rules per platform |

## Usage

Run commands in order:

```bash
@step-1-ideation
# ... complete each step before moving to next
@step-2-architecture
```

## HITL Checkpoints

Each step has human-in-the-loop checkpoints. Never skip these - they ensure quality.

## Related

- [WORKFLOW-OVERVIEW.md](../docs/WORKFLOW-OVERVIEW.md)
- [FILE-PATH-REFERENCE.md](../docs/FILE-PATH-REFERENCE.md)

