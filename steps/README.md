# Sigma Protocol — Steps

The core 13-step product development methodology. Each step is a self-contained prompt injection that guides an AI coding assistant through a structured phase sequence with human-in-the-loop checkpoints.

## Step Files

| Step | File | Description | Lines |
|------|------|-------------|-------|
| 0 | `step-0-environment-setup` | Environment validation & setup | ~1,500 |
| 1 | `step-1-ideation` | Product Ideation (Hormozi Value Equation) | ~1,150 |
| 1.5 | `step-1.5-offer-architecture` | Offer design (if monetized) | ~720 |
| 2 | `step-2-architecture` | System Architecture | ~1,250 |
| 3 | `step-3-ux-design` | UX/UI Design & User Flows | ~1,590 |
| 4 | `step-4-flow-tree` | Navigation Flow & Screen Inventory | ~1,860 |
| 5 | `step-5-wireframe-prototypes` | Wireframe Prototypes | ~2,980 |
| 6 | `step-6-design-system` | Design System & Tokens | ~1,650 |
| 7 | `step-7-interface-states` | Interface State Specifications | ~1,320 |
| 8 | `step-8-technical-spec` | Technical Specification | ~1,210 |
| 9 | `step-9-landing-page` | Landing Page (optional) | ~1,670 |
| 10 | `step-10-feature-breakdown` | Feature Breakdown | ~1,160 |
| 11 | `step-11-prd-generation` | PRD Generation | ~2,940 |
| 12 | `step-12-context-engine` | Context Engine | ~1,270 |
| 13 | `step-13-skillpack-generator` | Platform Configuration | ~950 |

**Utility files:** `dev-loop` (iterative development), `validate-methodology` (step verification)

## Structure

Every step follows a consistent structure:

1. **YAML Frontmatter** — Version, allowed tools, parameters
2. **Mission** — Role and objective
3. **`<goal>` Block** — Phase roadmap table, execution order, quality gate threshold
4. **Frameworks** — Domain-specific reference material (inline, not extracted)
5. **Phases A–N** — Sequential execution with `>>> CHECKPOINT` markers
6. **Final Review Gate** — Output checklist and blocking approval
7. **`<verification>` Block** — 100-point scoring rubric

## Platform Support

Steps are designed for both **Claude Code** and **Codex (GPT-5.3)**:
- `<goal>` blocks provide upfront execution maps
- `>>> CHECKPOINT` markers use dual-format for attention on both platforms
- Blocking gates validate previous step outputs before proceeding

## Ralph Integration

After Steps 5 and 11, you can optionally enter the Ralph Loop for autonomous implementation:

1. Run `/prd-json` to convert PRDs to JSON backlog
2. Run `./ralph/sigma-ralph.sh` with `--mode=prototype` or `--mode=implementation`

See `ralph/README.md` for setup and usage.

## Related

- [WORKFLOW-OVERVIEW.md](../docs/WORKFLOW-OVERVIEW.md)
- [FILE-PATH-REFERENCE.md](../docs/FILE-PATH-REFERENCE.md)
- [ralph/README.md](../ralph/README.md)
