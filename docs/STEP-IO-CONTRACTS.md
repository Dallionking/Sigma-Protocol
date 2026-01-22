# Step Input/Output Contracts

This document defines the required inputs and expected outputs for each step in the Sigma Protocol workflow. Use this as a reference when debugging step failures or understanding dependencies.

## Contract Format

Each step has:
- **Requires**: Files/artifacts that must exist before running
- **Produces**: Files/artifacts created by the step
- **Optional Inputs**: Files that enhance the step if present
- **Verification**: How to check if the step completed successfully

---

## Step 0: Environment Setup

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `package.json` | Project manifest |
| **Produces** | `.sigma-manifest.json` | Sigma installation marker |
| **Produces** | `.claude/` or `.cursor/` | Platform configuration |
| **Produces** | `docs/` directory | Documentation root |

### Verification
```bash
sigma doctor
```

---

## Step 1: Ideation

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | Product idea (user input) | What you want to build |
| **Optional** | Competitor URLs | For market analysis |
| **Produces** | `docs/specs/MASTER_PRD.md` | Master product requirements |
| **Produces** | `.sigma/context/project.json` | Project metadata |

### Key Outputs in MASTER_PRD.md
- Product vision
- Target audience
- Value equation analysis
- Core features (prioritized)
- Success metrics

### Verification
```bash
# Check file exists and has required sections
grep -l "## Value Equation" docs/specs/MASTER_PRD.md
```

---

## Step 1.5: Offer Architecture (Optional)

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/specs/MASTER_PRD.md` | From Step 1 |
| **Produces** | `docs/specs/OFFER.md` | Offer structure |
| **Produces** | `docs/specs/PRICING.md` | Pricing tiers |

### When to Run
Only if product is monetized. Skip for internal tools.

---

## Step 2: Architecture

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/specs/MASTER_PRD.md` | From Step 1 |
| **Produces** | `docs/specs/ARCHITECTURE.md` | System architecture |
| **Produces** | `docs/specs/DECISIONS.md` | Architecture Decision Records |

### Key Outputs in ARCHITECTURE.md
- System overview diagram (Mermaid)
- Component breakdown
- Data flow
- Technology stack
- Integration points

### Verification
```bash
# Check for architecture diagram
grep -l "```mermaid" docs/specs/ARCHITECTURE.md
```

---

## Step 3: UX Design

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/specs/MASTER_PRD.md` | From Step 1 |
| **Requires** | `docs/specs/ARCHITECTURE.md` | From Step 2 |
| **Produces** | `docs/specs/UX-DESIGN.md` | UX specification |
| **Produces** | `docs/design/ui-profile.json` | Design system constraints |

### Key Outputs
- User personas
- User journey maps
- UI profile with design dials
- Accessibility requirements

### Verification
```bash
# Check UI profile exists
cat docs/design/ui-profile.json | jq '.preset'
```

---

## Step 4: Flow Tree

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/specs/UX-DESIGN.md` | From Step 3 |
| **Produces** | `docs/specs/FLOW-TREE.md` | Navigation structure |
| **Produces** | `docs/specs/SCREEN-INVENTORY.md` | List of all screens |

### Key Outputs
- Navigation tree (Mermaid)
- Route definitions
- Screen-to-feature mapping
- Gate definitions

---

## Step 5: Wireframe Prototypes

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/specs/FLOW-TREE.md` | From Step 4 |
| **Requires** | `docs/design/ui-profile.json` | From Step 3 |
| **Produces** | `docs/prds/flows/*.md` | Flow-level PRDs |
| **Produces** | Wireframe images | Visual prototypes |

### Key Outputs
- One PRD per user flow
- Wireframe sketches
- Interaction notes

---

## Step 5b: PRD to JSON (Ralph Mode)

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/prds/flows/*.md` | From Step 5 |
| **Produces** | `docs/ralph/prototype/prd.json` | Ralph backlog |

### Key Outputs
- JSON array of stories
- Acceptance criteria
- Dependencies mapped

---

## Step 6: Design System

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/design/ui-profile.json` | From Step 3 |
| **Produces** | `docs/specs/DESIGN-SYSTEM.md` | Token documentation |
| **Produces** | `src/styles/tokens.css` | CSS variables |
| **Produces** | `tailwind.config.*` | Tailwind config (if used) |

### Key Outputs
- Color tokens
- Typography scale
- Spacing scale
- Component variants

---

## Step 7: Interface States

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/specs/DESIGN-SYSTEM.md` | From Step 6 |
| **Requires** | `docs/specs/FLOW-TREE.md` | From Step 4 |
| **Produces** | `docs/specs/STATE-SPEC.md` | State definitions |

### Key Outputs
- Loading states
- Error states
- Empty states
- Edge cases

---

## Step 8: Technical Spec

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/specs/ARCHITECTURE.md` | From Step 2 |
| **Requires** | `docs/specs/STATE-SPEC.md` | From Step 7 |
| **Produces** | `docs/specs/TECHNICAL-SPEC.md` | Implementation guide |

### Key Outputs
- API contracts
- Database schemas
- Authentication flows
- Performance requirements

---

## Step 9: Landing Page (Optional)

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/specs/MASTER_PRD.md` | From Step 1 |
| **Optional** | `docs/specs/OFFER.md` | From Step 1.5 |
| **Produces** | `src/app/page.tsx` or similar | Landing page code |
| **Produces** | Marketing copy | Headlines, CTAs |

---

## Step 10: Feature Breakdown

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/specs/TECHNICAL-SPEC.md` | From Step 8 |
| **Produces** | `docs/specs/FEATURE-BREAKDOWN.md` | Feature list |

### Key Outputs
- Prioritized feature list
- Story point estimates
- Sprint planning suggestions

---

## Step 11: PRD Generation

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/specs/FEATURE-BREAKDOWN.md` | From Step 10 |
| **Requires** | `docs/specs/TECHNICAL-SPEC.md` | From Step 8 |
| **Produces** | `docs/prds/*.md` | Individual PRDs |

### Key Outputs
- One PRD per feature
- Acceptance criteria
- Test scenarios

---

## Step 11a: PRD to JSON (Ralph Mode)

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/prds/*.md` | From Step 11 |
| **Produces** | `docs/ralph/implementation/prd.json` | Ralph backlog |

---

## Step 11b: PRD Swarm

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | `docs/prds/*.md` | From Step 11 |
| **Produces** | `swarm-*/` | Swarm workspaces |

---

## Step 12: Context Engine

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | All docs from Steps 1-11 | Complete specifications |
| **Produces** | `.cursorrules` | Cursor context |
| **Produces** | `.sigma/context/` | Context files |

---

## Step 13: Skillpack Generator

### Contract
| Type | Artifact | Description |
|------|----------|-------------|
| **Requires** | Completed project | With working code |
| **Produces** | `.claude/skills/` | Project-specific skills |
| **Produces** | `docs/SKILLPACK.md` | Skill documentation |

---

## Dependency Graph

```
Step 1 ──────────────────────────────────────┐
   │                                         │
   ├── Step 1.5 (optional)                   │
   │                                         │
   ↓                                         │
Step 2 ←─────────────────────────────────────┤
   │                                         │
   ↓                                         │
Step 3 ←─────────────────────────────────────┤
   │                                         │
   ├── Step 4 ←──────────────────────────────┤
   │     │                                   │
   │     ↓                                   │
   │   Step 5 ── Step 5b (Ralph)             │
   │                                         │
   ↓                                         │
Step 6 ←─────────────────────────────────────┤
   │                                         │
   ↓                                         │
Step 7                                       │
   │                                         │
   ↓                                         │
Step 8 ←─────────────────────────────────────┘
   │
   ↓
Step 9 (optional)
   │
   ↓
Step 10
   │
   ↓
Step 11 ── Step 11a (Ralph) ── Step 11b (Swarm)
   │
   ↓
Step 12
   │
   ↓
Step 13
```

## Debugging Contract Violations

### Missing Input File

```bash
# Check what's missing
sigma doctor --step=5

# Output:
# ✗ Step 5 requires: docs/specs/FLOW-TREE.md (missing)
# Run Step 4 first: @step-4-flow-tree
```

### Incomplete Output

```bash
# Verify step outputs
sigma verify step-3

# Output:
# ✗ docs/design/ui-profile.json missing
# Re-run: @step-3-ux-design
```

### Contract Summary Command

```bash
sigma contract step-11
# Shows all inputs/outputs for Step 11
```
