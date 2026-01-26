---
description: "Run Sigma steps/step-11b-prd-swarm"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /step-11b-prd-swarm

Invoke the **step-11b-prd-swarm** agent from Sigma Protocol.

This command runs the full step-11b-prd-swarm workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/step-11b-prd-swarm [your input here]`

---

# step-11b-prd-swarm

**Source:** Sigma Protocol steps module
**Version:** 1.1.0

---


# /step-11b-prd-swarm — PRD Swarm Orchestration for Parallel Implementation

**Mission**
Analyze PRD dependencies and organize them into parallelizable "swarms" (subfolders) that can be worked on simultaneously in multiple terminal instances (Cursor, Claude Code, Open Code, etc.).

**Why This Step Exists:**
For projects with many PRDs (10+), sequential implementation is slow. By analyzing the dependency graph and grouping independent chains, you can:
- **Run multiple coding agents in parallel** — Each terminal works on a swarm
- **Avoid dependency conflicts** — PRDs in different swarms don't depend on each other
- **Maximize throughput** — 4 terminals = up to 4x faster implementation

**This step ensures you can safely parallelize implementation without stepping on dependencies.**

---

## When to Use This Step

### Automatically Suggested After Step 11 When:
- `docs/prds/` contains 5+ PRD files
- User has access to multiple terminal instances
- Project complexity warrants parallel development

### Skip This Step If:
- Fewer than 5 PRDs (sequential is fine)
- All PRDs have linear dependencies (can't parallelize)
- Single developer working sequentially (no benefit)

---

## Command Usage

```bash
# Run as step (after Step 11)
@step-11b-prd-swarm

# Run standalone (any time after PRDs exist)
@prd-orchestrate

# Specify terminal count
@prd-orchestrate --terminals=4

# Preview without moving files
@prd-orchestrate --dry-run=true

# Skip gap analysis
@prd-orchestrate --run-gap-analysis=false

# Different grouping strategies
@prd-orchestrate --strategy=complexity

# RALPH MODE: Convert PRDs to JSON backlog for autonomous loop
@prd-orchestrate --ralph-mode=true

# RALPH MODE: Generate JSON backlog + start Ralph loop
@prd-orchestrate --ralph-mode=true --start-loop=true

# ORCHESTRATE MODE: Generate config for multi-agent orchestration
@prd-orchestrate --orchestrate=true

# ORCHESTRATE + AUTO-LAUNCH: Generate config and spawn tmux workspace
@prd-orchestrate --orchestrate=true --auto-launch=true
```

### Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `--terminals` | 1-8 | `4` | Number of parallel terminals to plan for |
| `--dry-run` | boolean | `true` | Preview swarm plan without moving files |
| `--run-gap-analysis` | boolean | `true` | Run @gap-analysis on each swarm after grouping |
| `--min-swarm-size` | 1-10 | `2` | Minimum PRDs per swarm (smaller swarms get merged) |
| `--strategy` | `balanced`, `complexity`, `dependency-depth` | `balanced` | How to distribute PRDs across swarms |
| `--visualize` | boolean | `false` | Generate Mermaid dependency graph visualization |
| `--emit-confidence` | boolean | `true` | Emit Epistemic Confidence artifact to .sigma/confidence/ |
| `--ralph-mode` | boolean | `false` | Convert PRDs to Ralph JSON backlog instead of folder structure |
| `--start-loop` | boolean | `false` | If ralph-mode, also start the sigma-ralph.sh loop |
| `--ralph-engine` | `auto`, `claude`, `opencode` | `auto` | Engine for Ralph loop (auto-detects) |
| `--orchestrate` | boolean | `false` | Generate multi-agent orchestration config for tmux streams |
| `--auto-launch` | boolean | `false` | If orchestrate, auto-launch tmux workspace |

### Strategy Options

| Strategy | Description | Best For |
|----------|-------------|----------|
| `balanced` | Distribute PRDs evenly by count | General use |
| `complexity` | Group by estimated complexity (Appetite) | Mixed complexity projects |
| `dependency-depth` | Group by dependency chain depth | Deep dependency trees |

---

## Preflight (auto)

1. Get date
2. Check for PRD directory (`docs/prds/`)
3. Scan for PRD files (top-level and flow-based)
4. Check for existing swarm structure
5. Load existing status from `.prd-status.json`
6. Display context summary
7. Validate minimum PRD count (warn if < 3)

---

## Task Execution Flow

```
Phase A: Context Loading
  [ ] A1: Scan docs/prds/ for all PRD files
  [ ] A2: Load existing .prd-status.json
  [ ] A3: Check for existing swarm folders
  CHECKPOINT: Confirm PRD inventory

Phase B: Dependency Analysis
  [ ] B1: Parse SECTION 0 from each PRD
  [ ] B2: Extract dependency lists
  [ ] B3: Build dependency graph (DAG)
  [ ] B4: Detect circular dependencies
  [ ] B5: Calculate dependency depth per PRD
  CHECKPOINT: Review dependency graph

Phase C: Swarm Planning (Interactive)
  [ ] C1: Recommend terminal count based on graph
  [ ] C2: Ask user for terminal preference
  [ ] C3: Apply grouping algorithm
  [ ] C4: Balance swarms by strategy
  [ ] C5: Generate swarm assignments
  CHECKPOINT: Approve swarm assignments

Phase D: Swarm Execution
  [ ] D1: Create swarm subfolders
  [ ] D2: Move PRD files to swarms
  [ ] D3: Create per-swarm README
  [ ] D4: Generate SWARM-PLAN.md
  [ ] D5: Update .prd-status.json
  CHECKPOINT: Verify file moves

Phase E: Validation
  [ ] E1: Run @gap-analysis on each swarm (if enabled)
  [ ] E2: Verify no broken cross-references
  [ ] E3: Generate handoff summary
  FINAL: Ready for parallel implementation
```

---

## Phase A: Context Loading

### A1: Scan PRD Files

Scan both top-level PRDs (`docs/prds/F*.md`) and flow-based PRDs (`docs/prds/flows/**/*.md`).

Extract from each PRD:
- ID (e.g., "F01", "F02")
- Filename
- Path
- Title (from # heading)
- Dependencies (from Section 0)
- Appetite (Small Batch or Big Batch)
- Priority (P0, P1, P2, P3)
- Status (pending, in_progress, complete)

### A2: Load Existing Status

Load from `docs/prds/.prd-status.json`:
- Feature statuses (pending, in_progress, implemented, verified)
- Swarm assignments
- Last updated timestamps

### A3: Check Existing Swarms

If existing swarm folders detected, prompt:
1. Keep existing swarms, add new PRDs only
2. Re-analyze and create new swarm structure
3. Cancel and keep current structure

**CHECKPOINT A:** Display PRD inventory and ask for confirmation.

---

## Phase B: Dependency Analysis

### B1-B2: Parse Section 0 Dependencies

Parse dependencies from multiple patterns:
- Table format: `| **Dependencies** | [F01, F03, F07] |`
- Markdown list format: `### Dependencies\n- F01\n- F03`
- Inline format: `Depends on: [F01, F03]`

### B3: Build Dependency Graph

Build a directed acyclic graph (DAG) with:
- Nodes: All PRD files
- Edges: Dependencies (id -> dependencies)
- Reverse edges: Dependents (who depends on me)

### B4: Detect Circular Dependencies

Use DFS to detect cycles. If cycles found:
- Report the cycle path
- Suggest resolution (break dependency or merge PRDs)

### B5: Calculate Dependency Depth

For each PRD, calculate max depth from root (no dependencies = depth 0).

**CHECKPOINT B:** Display dependency graph visualization and any issues.

```
DEPENDENCY ANALYSIS COMPLETE

PRDs Analyzed: 72
Root PRDs (no deps): 8
Max Dependency Depth: 5
Circular Dependencies: None

Dependency Chains:
  Chain 1: F01 -> F05 -> F12 -> F18 (depth: 4)
  Chain 2: F02 -> F08 -> F15 (depth: 3)
  Chain 3: F03 -> F09 (depth: 2)
  ... (5 more chains)

Reply `continue` to proceed with swarm planning.
```

---

## Phase C: Swarm Planning (Interactive)

### C1: Recommend Terminal Count

Based on independent chain count:
- 2 or fewer chains: 2 terminals
- 3-4 chains: Match chain count
- 5-8 chains: 4 terminals
- 9+ chains: min(6, ceil(chainCount/2))

### C2: Interactive Terminal Selection

```
SWARM PLANNING

Based on your PRD structure, I recommend:
  -> 4 terminals (8 chains balanced across swarms)

Reason: Multiple chains can be grouped into 4 balanced swarms

How many terminals do you want to use?

  [1] 2 terminals (larger batches, fewer context switches)
  [2] 3 terminals
  [3] 4 terminals (RECOMMENDED)
  [4] 5 terminals
  [5] 6 terminals (smaller batches, more parallelism)
  [C] Custom number (enter after selection)

Enter selection (1-5 or C):
```

### C3-C5: Apply Grouping Algorithm

1. Sort chains by strategy (balanced, complexity, or dependency-depth)
2. Distribute chains to swarms using round-robin
3. Generate execution order (topological sort within each swarm)
4. Identify ready-now PRDs (no pending deps) and blocked PRDs

**CHECKPOINT C:** Present swarm assignments for approval.

```
PROPOSED SWARM ASSIGNMENTS

SWARM 1 (18 PRDs) — Core Auth & User
-----------------------------------
Ready now:
  - F01-auth.md
  - F02-signup.md

Execute after F01:
  - F05-user-profile.md
  - F12-settings.md
  - F18-preferences.md

SWARM 2 (16 PRDs) — Dashboard & Charts
-----------------------------------
Ready now:
  - F03-dashboard-layout.md

Execute after F03:
  - F08-charts.md
  - F15-data-grid.md

...

Total: 72 PRDs across 4 swarms

Reply `approve` to create swarm folders
Reply `adjust: [feedback]` to modify assignments
```

---

## Phase D: Swarm Execution

### D1-D2: Create Folders and Move Files

For each swarm:
1. Create directory `docs/prds/swarm-N/`
2. Move PRD files to swarm directory
3. Update path references in memory

### D3: Create Per-Swarm README

Each swarm gets `_SWARM-README.md` with:
- Generation date
- PRD count
- Terminal assignment
- Execution order table (with dependencies and status)
- Quick start commands
- Ready now / Blocked PRDs lists

### D4: Generate SWARM-PLAN.md

Master plan document with:
- Executive summary
- Terminal assignments table
- Swarm details (PRDs, execution order)
- Quick start commands
- Cross-swarm dependencies
- Progress tracking instructions

### D5: Update .prd-status.json

Update status file with:
- Swarm assignments per feature
- Swarm metadata (count, created date, strategy)
- Last updated timestamps

**CHECKPOINT D:** Verify file moves completed successfully.

---

## Phase E: Validation

### E1: Run @gap-analysis on Each Swarm (Optional)

If `--run-gap-analysis=true`:
1. Run `@gap-analysis --spec=docs/prds/swarm-N/` for each swarm
2. Build requirements list from PRDs in swarm
3. Create traceability matrix
4. Identify implementation gaps
5. Emit Epistemic Confidence artifact

### E2-E3: Final Validation and Handoff

1. Verify all files moved successfully
2. Check for broken cross-references
3. Generate handoff summary

```
STEP 11b COMPLETE — SWARM ORCHESTRATION

PRDs Organized: 72
Swarms Created: 4

Folder Structure:
  docs/prds/swarm-1/ (18 PRDs)
  docs/prds/swarm-2/ (16 PRDs)
  docs/prds/swarm-3/ (19 PRDs)
  docs/prds/swarm-4/ (19 PRDs)
  docs/prds/SWARM-PLAN.md

Next Steps:
  1. Open 4 terminal windows
  2. Assign each terminal to a swarm
  3. Run: @implement-prd --swarm=N

Quick Start:
  Terminal 1: @implement-prd --swarm=1
  Terminal 2: @implement-prd --swarm=2
  ...

Reply `approve` to proceed to implementation
Reply `revise: [feedback]` to modify swarm structure
```

---

## Quality Gates

**Step 11b complete when:**

- [ ] All PRDs parsed with dependencies extracted
- [ ] No circular dependencies detected
- [ ] Swarms created with balanced distribution
- [ ] All PRD files moved to swarm folders
- [ ] Per-swarm README generated
- [ ] SWARM-PLAN.md created
- [ ] .prd-status.json updated with swarm assignments
- [ ] Human approved final structure

---

## Epistemic Confidence Gate (Tier 2)

**This is a Tier 2 (Analysis) command. Emits Swarm Score + Dependency Confidence.**

### Confidence Calculation

| Metric | Weight | Description |
|--------|--------|-------------|
| Dependency Resolution | 30% | All deps resolvable within swarm |
| Swarm Balance | 20% | How even are swarm sizes |
| Circular Dependencies | 30% | 0 if any, 100 if none |
| Cross-Swarm Dependencies | 20% | Fewer = better |

### Emit Epistemic Artifact

After completing swarm orchestration, emit to `.sigma/confidence/prd-swarm-*.json`:
- Overall confidence score
- Per-metric scores
- Swarm distribution
- Issues detected (circular, cross-swarm, unbalanced)
- Recommendations

---

## Orchestrate Mode (--orchestrate)

When `--orchestrate=true`, generate multi-agent orchestration config:

### Generate Orchestration Config

Creates `.sigma/orchestration/streams.json` with:
- Stream definitions (name, PRDs, worktree, description)
- Dependencies map
- Merge order based on dependency depth
- Settings (mode, notifications, auto-merge, verify stories)

### Auto-Launch Workspace

When `--auto-launch=true`:
1. Check for `spawn-streams.sh` script
2. Launch tmux workspace with configured terminals
3. Attach to orchestrator pane

### Orchestrate Output

```
ORCHESTRATION CONFIG GENERATED

Config: .sigma/orchestration/streams.json

Streams:
  Stream A: F001, F005 (Core Auth & User)
  Stream B: F002, F006 (Dashboard & Charts)
  Stream C: F003 (Backend Services)
  Stream D: F004 (Integrations)

Merge Order: A -> C -> D -> B

Next Steps:
  1. Launch workspace:
     npx sigma-protocol orchestrate --streams=4

  Or manually:
     ./scripts/orchestrator/spawn-streams.sh . 4

  2. In ORCHESTRATOR pane:
     @orchestrate

  3. In each STREAM pane:
     @stream --name=A
     @stream --name=B
     ...
```

---

## Shared PRDs (_shared/ folder)

When a PRD is depended upon by PRDs in multiple swarms, it goes to `_shared/`:

1. Map each dependency to which swarms need it
2. PRDs needed by 2+ swarms are "shared"
3. Move shared PRDs to `docs/prds/_shared/`

**Output Structure with Shared:**

```
docs/prds/
  _shared/                  # PRDs used by multiple swarms
    F00-core-utils.md
  swarm-1/
    ...
  swarm-2/
    ...
  SWARM-PLAN.md
  .prd-status.json
```

---

## Dependency Visualization (--visualize)

When `--visualize=true`, generate a Mermaid diagram:

1. Create subgraphs for each swarm
2. Add nodes for each PRD with truncated title
3. Add edges for dependencies
4. Save to `docs/prds/DEPENDENCY-GRAPH.md`

---

## Related Commands

| Command | Relationship |
|---------|--------------|
| `@step-11-prd-generation` | Prerequisite — creates PRDs to organize |
| `@prd-orchestrate` | Standalone alias for this step |
| `@implement-prd` | Next step — implements PRDs (supports --swarm) |
| `@status` | Shows swarm completion progress |
| `@gap-analysis` | Post-implementation gap analysis per swarm |

---

## Notes for @implement-prd

When proceeding to implementation with swarms:

1. **Use --swarm flag:**
   ```bash
   @implement-prd --swarm=1
   ```

2. **Respect execution order:**
   Each swarm's README lists PRDs in dependency order.

3. **Check cross-swarm deps:**
   Some PRDs may depend on work in other swarms.
   SWARM-PLAN.md lists these explicitly.

4. **Track progress:**
   Run `@status --prds` to see completion across all swarms.

---

<verification>
## Step 11b Verification Schema

### Required Files (25 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Swarm Plan | docs/prds/SWARM-PLAN.md | 1KB | 10 |
| At least 2 swarm folders | docs/prds/swarm-*/ | exists | 8 |
| Updated Status | docs/prds/.prd-status.json | 200B | 7 |

### Required Structure (25 points)

| Check | Description | Points |
|-------|-------------|--------|
| swarm_count | At least 2 swarm folders created | 10 |
| swarm_readme | Each swarm has _SWARM-README.md | 8 |
| prds_moved | All PRDs moved to swarm folders | 7 |

### Content Quality (30 points)

| Check | Description | Points |
|-------|-------------|--------|
| no_circular | No circular dependencies in graph | 10 |
| balanced_swarms | Swarms within 50% size of each other | 10 |
| execution_order | Each swarm has valid topological order | 10 |

### Integration (20 points)

| Check | Description | Points |
|-------|-------------|--------|
| status_updated | .prd-status.json has swarm field | 5 |
| plan_complete | SWARM-PLAN.md has all sections | 5 |
| confidence_emitted | .sigma/confidence/prd-swarm-*.json exists | 5 |
| shared_identified | _shared/ folder exists if multi-swarm deps | 5 |

</verification>
