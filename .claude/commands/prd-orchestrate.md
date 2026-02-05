---
name: prd-orchestrate
description: "Analyze PRD dependencies and organize into parallelizable swarms for multi-terminal implementation (standalone alias for @step-11b-prd-swarm)"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# prd-orchestrate

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---


# @prd-orchestrate — PRD Swarm Orchestration

**Standalone command for organizing PRDs into parallelizable swarms.**

This is an alias for `@step-11b-prd-swarm` that can be run at any time after PRDs exist.

---

## 🎯 Purpose

Organize your PRDs into parallel "swarms" that can be implemented in separate terminal instances without dependency conflicts.

**Use Case:** You have 70 PRDs and 4 terminals (Cursor, Claude Code, Open Code). This command groups PRDs so each terminal works on an independent set.

---

## 📋 Quick Start

```bash
# Analyze PRDs and recommend swarm structure
@prd-orchestrate

# Create swarms for 4 terminals
@prd-orchestrate --terminals=4 --dry-run=false

# Preview without making changes
@prd-orchestrate --terminals=4 --dry-run=true

# Check current swarm status
@prd-orchestrate --status

# Reset and re-analyze
@prd-orchestrate --reset
```

---

## 📋 Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `--terminals` | 1-8 | `4` | Number of parallel terminals/instances |
| `--dry-run` | boolean | `true` | Preview without moving files |
| `--run-gap-analysis` | boolean | `true` | Run @gap-analysis on each swarm after grouping |
| `--min-swarm-size` | 1-10 | `2` | Minimum PRDs per swarm |
| `--strategy` | see below | `balanced` | Grouping strategy |
| `--status` | boolean | `false` | Show current swarm status only |
| `--reset` | boolean | `false` | Remove existing swarms and re-analyze |
| `--visualize` | boolean | `false` | Generate Mermaid dependency graph |
| `--emit-confidence` | boolean | `true` | Emit Epistemic Confidence artifact |

### Strategy Options

| Strategy | Description | Best For |
|----------|-------------|----------|
| `balanced` | Distribute PRDs evenly by count | General use, default |
| `complexity` | Group by Appetite (Big Batch first) | Mixed complexity projects |
| `dependency-depth` | Group by chain depth | Deep dependency trees |

---

## 🔄 What It Does

### 1. Scans PRDs
- Reads all `docs/prds/F*.md` files
- Reads flow-based PRDs from `docs/prds/flows/`
- Extracts dependency info from SECTION 0

### 2. Builds Dependency Graph
- Creates directed acyclic graph (DAG)
- Detects circular dependencies (error)
- Calculates dependency depth

### 3. Groups into Swarms
- Finds independent dependency chains
- Groups chains into N swarms (terminals)
- Balances by selected strategy

### 4. Reorganizes Files
- Creates `docs/prds/swarm-N/` folders
- Moves PRDs to appropriate swarms
- Generates execution order READMEs

### 5. Updates Status
- Creates `docs/prds/SWARM-PLAN.md`
- Updates `.prd-status.json` with swarm assignments

---

## 📁 Output Structure

```
docs/prds/
├── _shared/                  # PRDs used by multiple swarms
│   └── F00-core-utils.md
├── swarm-1/
│   ├── _SWARM-README.md      # Execution guide
│   ├── F01-auth.md
│   ├── F05-user-profile.md
│   └── F12-settings.md
├── swarm-2/
│   ├── _SWARM-README.md
│   ├── F02-dashboard.md
│   └── F08-charts.md
├── swarm-3/
│   └── ...
├── swarm-4/
│   └── ...
├── SWARM-PLAN.md             # Master orchestration
├── DEPENDENCY-GRAPH.md       # Mermaid visualization (if --visualize)
└── .prd-status.json          # Updated with swarm field
```

---

## 🐝 Interactive Flow

When you run `@prd-orchestrate`:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 PRD SWARM ORCHESTRATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scanning PRDs...
Found: 72 PRDs in docs/prds/

Analyzing dependencies...
├── PRDs with no dependencies: 8
├── PRDs with 1+ dependency: 64
├── Dependency chains: 8
└── Circular dependencies: None ✅

Recommendation: 4 terminals
Reason: 8 chains balanced across 4 swarms

How many terminals do you want to use?
  [1] 2 terminals
  [2] 3 terminals
  [3] 4 terminals ⭐ RECOMMENDED
  [4] 5 terminals
  [5] 6 terminals
  [C] Custom

> 3

Creating swarm plan for 4 terminals...
[Shows proposed assignments]

Reply `approve` to create swarms or `adjust: [feedback]`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 Status Mode

Check current swarm assignments:

```bash
@prd-orchestrate --status
```

Output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 SWARM STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Swarm | PRDs | Complete | In Progress | Pending |
|-------|------|----------|-------------|---------|
| swarm-1 | 18 | 5 (28%) | 2 | 11 |
| swarm-2 | 16 | 8 (50%) | 1 | 7 |
| swarm-3 | 19 | 0 (0%) | 0 | 19 |
| swarm-4 | 19 | 12 (63%) | 3 | 4 |

Overall: 25/72 complete (35%)

Next recommended:
  Terminal 1: F05 (swarm-1)
  Terminal 2: F15 (swarm-2)
  Terminal 3: F03 (swarm-3) — START HERE
  Terminal 4: F41 (swarm-4)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔄 Reset Mode

Remove existing swarms and re-analyze:

```bash
@prd-orchestrate --reset
```

This will:
1. Move all PRDs back to `docs/prds/` root
2. Remove `swarm-*/` folders
3. Re-run dependency analysis
4. Create new swarm structure

---

## ⚠️ Important Notes

### Cross-Swarm Dependencies

Some PRDs may depend on work in other swarms. The `SWARM-PLAN.md` lists these explicitly. Coordinate with other terminals when encountering cross-swarm deps.

### Execution Order

Each swarm has a `_SWARM-README.md` with the correct execution order. Follow this order to avoid dependency issues.

### Status Tracking

Update PRD status as you complete them:
- Run `@status --prds` to see overall progress
- The `.prd-status.json` tracks per-PRD and per-swarm status

---

## 🔗 Related Commands

| Command | Relationship |
|---------|--------------|
| `@step-11b-prd-swarm` | Full step version with HITL checkpoints |
| `@implement-prd --swarm=N` | Implement all PRDs in a swarm |
| `@status --prds` | Show PRD completion status |
| `@gap-analysis` | Post-implementation gap analysis per swarm (with Epistemic Confidence) |

---

## 💡 Pro Tips

1. **Start with dry-run:** Always preview with `--dry-run=true` first
2. **Match terminals to team:** If you have 3 team members, use `--terminals=3`
3. **Use complexity strategy:** For projects with mixed Big/Small Batch, use `--strategy=complexity`
4. **Check status regularly:** Run `@prd-orchestrate --status` to track progress
5. **Re-organize if needed:** Use `--reset` if swarm balance becomes uneven

---

## 🎯 Core Algorithm Reference

This command implements the same algorithm as `@step-11b-prd-swarm`:

1. **Scan** all PRDs and extract Section 0 metadata
2. **Parse** dependencies from each PRD
3. **Build** directed acyclic graph (DAG)
4. **Detect** circular dependencies (fails if found)
5. **Find** independent dependency chains
6. **Identify** shared PRDs (used by multiple swarms → `_shared/`)
7. **Group** chains into N swarms
8. **Balance** by selected strategy
9. **Sort** execution order within each swarm (topological)
10. **Move** files to swarm folders
11. **Generate** SWARM-PLAN.md and per-swarm READMEs
12. **Visualize** dependency graph (if `--visualize`)
13. **Emit** Epistemic Confidence artifact (if `--emit-confidence`)

---

*For the full step with all HITL checkpoints, use `@step-11b-prd-swarm`*


