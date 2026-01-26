---
description: "Run Sigma steps/step-11a-prd-to-json"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /step-11a-prd-to-json

Invoke the **step-11a-prd-to-json** agent from Sigma Protocol.

This command runs the full step-11a-prd-to-json workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** `/step-11a-prd-to-json [your input here]`

---

# step-11a-prd-to-json

**Source:** Sigma Protocol steps module
**Version:** 1.2.0

---


# /step-11a-prd-to-json — Convert Implementation PRDs to Ralph Backlog

**Mission**
Convert Step 11 implementation PRDs (located in `docs/prds/` or `docs/prds/swarm-*/`) into a machine-readable JSON backlog (`docs/ralph/implementation/prd.json`) that enables Ralph-style autonomous implementation loops.

**Why This Step Exists:**
Step 11 produces comprehensive, implementation-ready PRDs (600-1000 lines each). These are excellent for human developers but need conversion to the Ralph format for:
- **Autonomous agent execution** — Each story is scoped for one context window
- **Full-stack verification** — Backend, frontend, and security criteria are machine-checkable
- **Stream/swarm integration** — Stories can be organized by Step 11b swarm assignments
- **Deterministic progress tracking** — `passes: true/false` state prevents "claimed done" failures

**This step ensures you can run the Ralph bash loop on your full implementation PRDs.**

---

## When to Use This Step

### Automatically Suggested After Step 11 (or 11b) When:
- `docs/prds/F*.md` files exist
- User wants autonomous multi-PRD implementation
- Complex backend + frontend PRDs need orchestration

### Skip This Step If:
- Implementing PRDs manually one-by-one
- PRDs are still being revised
- Project has < 3 PRDs (Ralph overhead not worth it)

---

## Command Usage

```bash
# Run as step (after Step 11 or 11b)
@step-11a-prd-to-json

# Include swarm assignments from Step 11b
@step-11a-prd-to-json --include-swarms=true

# Scope to specific feature
@step-11a-prd-to-json --scope=F01

# Dry run preview
@step-11a-prd-to-json --dry-run=true

# Stream-aware grouping (uses swarm folders)
@step-11a-prd-to-json --stream-aware=true
```

### Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `--dry-run` | boolean | `false` | Preview JSON output without writing files |
| `--scope` | string | `*` | Limit to specific PRD (e.g., `F01`) |
| `--stream-aware` | boolean | `true` | Organize stories by swarm/stream from Step 11b |
| `--emit-confidence` | boolean | `true` | Emit Epistemic Confidence artifact |
| `--max-story-size` | `small`, `medium`, `large` | `medium` | Max story complexity |
| `--verification-strict` | boolean | `true` | Require machine-verifiable criteria |
| `--include-swarms` | boolean | `true` | Read swarm assignments from Step 11b |
| `--use-taskmaster` | boolean | `false` | Use Taskmaster MCP for AI-powered parsing |
| `--taskmaster-model` | string | `claude-code/sonnet` | Model for Taskmaster (if using) |

---

## Taskmaster MCP Integration (Recommended for Claude Code)

When `--use-taskmaster=true`, this step leverages the [Taskmaster MCP](https://github.com/eyaltoledano/claude-task-master) for AI-powered PRD parsing instead of manual regex extraction.

### Why Use Taskmaster?

| Manual Parsing | Taskmaster MCP |
|----------------|----------------|
| Regex-based extraction | AI-powered understanding |
| Fixed parsing rules | Intelligent decomposition |
| May miss context | Understands dependencies |
| Basic story splitting | Smart task breakdown |
| No research capability | Can research best practices |

### Taskmaster Workflow

```bash
# Use Taskmaster for AI-powered parsing
@step-11a-prd-to-json --use-taskmaster=true

# With specific model
@step-11a-prd-to-json --use-taskmaster=true --taskmaster-model=claude-code/opus

# Combine with swarms
@step-11a-prd-to-json --use-taskmaster=true --include-swarms=true
```

### Taskmaster Integration Flow

```
Step 11 PRD (Markdown)
       |
       v
  TASKMASTER MCP (mcp_taskmaster_parse_prd)
  - AI understands PRD structure
  - Intelligent task decomposition
  - Dependency detection
  - Acceptance criteria generation
  - Complexity analysis
       |
       v
  .taskmaster/tasks/tasks.json (Taskmaster format)
       |
       v
  SIGMA TRANSFORMER (built-in)
  - Convert Taskmaster to Ralph format
  - Add Sigma-specific acceptance criteria
  - Map verification commands
  - Apply stream/swarm tags
       |
       v
  docs/ralph/implementation/prd.json (Ralph format)
```

### Taskmaster Phase (Alternative to Phase B)

When `--use-taskmaster=true`, Phase B is replaced with:

```
Phase B-TM: Taskmaster AI Parsing
  [ ] B1-TM: Initialize Taskmaster in project (if not exists)
  [ ] B2-TM: Parse PRD with mcp_taskmaster_parse_prd
  [ ] B3-TM: Analyze complexity with mcp_taskmaster_analyze_project_complexity
  [ ] B4-TM: Expand tasks with mcp_taskmaster_expand_task (for complex stories)
  [ ] B5-TM: Get tasks with mcp_taskmaster_get_tasks
  CHECKPOINT: Review Taskmaster output
```

### Prerequisites for Taskmaster Integration

**For Claude Code users:**
```bash
# Add Taskmaster MCP to Claude Code
claude mcp add taskmaster-ai -- npx -y task-master-ai
```

**For Cursor users:**
Add to `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "task-master-ai": {
      "command": "npx",
      "args": ["-y", "task-master-ai"],
      "env": {
        "ANTHROPIC_API_KEY": "YOUR_ANTHROPIC_API_KEY"
      }
    }
  }
}
```

---

## Preflight (auto)

1. Get date
2. Check for Step 11 PRD files in `docs/prds/F*.md` and `docs/prds/swarm-*/F*.md`
3. Check for Step 11b swarm structure (`docs/prds/SWARM-PLAN.md`)
4. Check for existing Ralph backlog
5. Check for UI Profile (Design System Enforcement - CRITICAL)
6. Display context summary

---

## Task Execution Flow

```
Phase A: Context Loading
  [ ] A1: Scan docs/prds/ for F*.md files
  [ ] A2: Load Step 11b swarm assignments
  [ ] A3: Load .prd-status.json
  [ ] A4: Check for Taskmaster MCP availability
  CHECKPOINT: Confirm PRD inventory

Phase B-TM: Taskmaster AI Parsing (if --use-taskmaster=true) RECOMMENDED
  [ ] B1-TM: Check Taskmaster MCP tools available
  [ ] B2-TM: Parse PRD with mcp_taskmaster_parse_prd
  [ ] B3-TM: Analyze complexity with mcp_taskmaster_analyze_project_complexity
  [ ] B4-TM: Expand tasks with mcp_taskmaster_expand_task (if complex)
  [ ] B5-TM: Get tasks with mcp_taskmaster_get_tasks
  [ ] B6-TM: Convert Taskmaster format to Sigma/Ralph format
  CHECKPOINT: Review Taskmaster output

--- OR ---

Phase B: Manual PRD Parsing (if --use-taskmaster=false)
  [ ] B1: Parse Section 0 (Shape Up metadata)
  [ ] B2: Parse Section 0.5 (Full Stack Overview)
  [ ] B3: Parse Section 4 (User Stories / BDD)
  [ ] B4: Parse Section 6 (Database Schema)
  [ ] B5: Parse Section 7 (Server Actions)
  [ ] B6: Parse Section 8 (UI Components)
  [ ] B7: Parse Section 15 (Agentic Implementation Guide)
  CHECKPOINT: Review parsed structure

Phase C: Story Generation
  [ ] C1: Generate database stories (from Section 6 / Taskmaster)
  [ ] C2: Generate server action stories (from Section 7 / Taskmaster)
  [ ] C3: Generate UI component stories (from Section 8 / Taskmaster)
  [ ] C4: Generate integration stories (from Section 4 / Taskmaster)
  [ ] C5: Apply story-splitting rules
  [ ] C6: Map verification commands to criteria
  [ ] C7: Add Sigma-specific acceptance criteria (gap-analysis, ui-healer)
  CHECKPOINT: Review generated stories

Phase D: Backlog Assembly
  [ ] D1: Validate all stories have verifiable criteria
  [ ] D2: Assign stream/swarm tags (if Step 11b ran)
  [ ] D3: Build prd.json with Sigma-Ralph schema
  [ ] D4: Generate prd-map.json
  [ ] D5: Initialize progress.txt
  [ ] D6: Sync with Taskmaster (if used) for status tracking
  CHECKPOINT: Verify backlog structure

Phase E: Output & Validation
  [ ] E1: Write docs/ralph/implementation/prd.json
  [ ] E2: Write docs/ralph/implementation/prd-map.json
  [ ] E3: Write docs/ralph/implementation/progress.txt
  [ ] E4: Emit Epistemic Confidence artifact
  FINAL: Ready for Ralph loop
```

---

## Phase B: PRD Parsing

### B1: Parse Section 0 (Shape Up Metadata)

Extract from Section 0 table:
- Feature ID (F01, F02, etc.)
- Appetite (Small Batch 1-2wk / Big Batch 4-6wk)
- Priority (P0, P1, P2, P3)
- Phase (0, 1, 2, 3)
- Dependencies ([F00, F03])
- Outcome Link

### B2: Parse Section 0.5 (Full Stack Overview)

Extract scope matrix:
- Database Tables
- Server Actions
- UI Pages
- UI Components
- Security requirements (Auth required, RLS policies needed)
- Environment variables

### B3: Parse Section 4 (BDD User Stories)

Find all Scenario blocks with:
- Given clauses
- When clause
- Then clauses
- Scenario type (happy-path, edge-case, error-handling, validation)

### B6-B7: Parse Sections 6, 7, 15 (Implementation Details)

Extract:
- Database schema (tables, RLS policies, indexes)
- Server actions (name, type, path, zodSchema)
- UI components (name, path, props)
- File manifest (path, action, layer, description)
- Implementation order

---

## Phase C: Story Generation

### C1-C4: Generate Stories by Layer

**Layer 1: Database stories** (must complete first)
- Migration file created
- Drizzle schema file created
- RLS policies defined
- Gap analysis passes

**Layer 2: Server Action stories**
- Server action file created
- Zod validation schema defined
- Auth check implemented
- Result type is explicit
- Gap analysis passes

**Layer 3: UI Component stories**
- UI files created
- UI renders without errors
- UI Healer passes

**Layer 4: Integration story** (all BDD scenarios)
- All happy-path scenarios pass
- Error handling scenarios pass
- Gap analysis achieves 95%+

---

## Phase C.5: Design System Injection (CRITICAL)

**This phase ensures UI tasks carry design constraints from the UI Profile.**

### Why This Matters

Without design system injection:
- UI tasks may produce inconsistent visuals
- Ralph loop cannot enforce design compliance
- Gap analysis cannot verify design adherence

### C.5.1: Load UI Profile

Load from `docs/design/ui-profile.json`:
- Profile ID and preset
- Allowed tokens (surfaces, text, borders, radii, shadows)
- Banned patterns
- Theme mode
- Dials (radius, density, motionIntensity)
- Rules (maxAccentColorsPerScreen, maxGradientsPerCard, minSpringDamping)

### C.5.2: Inject Design Constraints into UI Tasks

For each story with UI tasks:
- Inject design system reference
- Add allowed tokens
- Add banned patterns
- Add theme mode
- Add dials
- Add rules

### C.5.3: Validation Gate

- Warn if UI tasks exist but no design system
- Warn if some UI tasks missing design system

---

## Phase D: Backlog Assembly

### D2: Assign Stream/Swarm Tags

Map feature IDs to swarm IDs from `.prd-status.json`.

### D3: Build Implementation Backlog

Create backlog with:
- Schema reference
- Meta information (project name, mode, timestamps, story counts)
- Design system metadata
- Stories with design constraints
- Streams (if Step 11b ran)

Create PRD map with:
- Schema reference
- Meta information
- Mappings (PRD path, title, feature ID, story IDs, story count)

Create progress file with:
- Generation timestamp
- Mode (implementation)
- Story count
- Stream count
- Session log section

---

## Quality Gates

**Step 11a complete when:**

- [ ] All Step 11 PRDs parsed successfully (Section 0, 0.5, 4, 6, 7, 8, 15)
- [ ] Each PRD has layered stories (db -> api -> ui -> integration)
- [ ] All stories have machine-verifiable criteria
- [ ] Stream/swarm tags assigned (if Step 11b ran)
- [ ] prd.json validates against ralph-backlog.schema.json
- [ ] Epistemic Confidence >= 80%
- [ ] Human approved backlog structure

---

## Final Review Gate

```
STEP 11.25 COMPLETE — IMPLEMENTATION PRD -> RALPH

PRDs Processed: [X]
Stories Generated: [X] (db: [X], api: [X], ui: [X], integration: [X])
Streams: [X] from Step 11b
Epistemic Confidence: [X]%

Created:
- docs/ralph/implementation/prd.json
- docs/ralph/implementation/prd-map.json
- docs/ralph/implementation/progress.txt

Ready for Ralph Loop:
  sigma-ralph.sh --workspace=/path/to/project --mode=implementation

Or with streams:
  sigma-ralph.sh --workspace=/path/to/project --mode=implementation --stream=1

Reply `approve` to finalize
Reply `revise: [feedback]` to modify
```

---

## Related Commands

| Command | Relationship |
|---------|--------------|
| `@step-11-prd-generation` | Prerequisite — creates PRDs to convert |
| `@step-11b-prd-swarm` | Optional — provides stream/swarm assignments |
| `@step-5b-prd-to-json` | Sister command — converts prototype PRDs |
| `sigma-ralph.sh` | Next step — executes the Ralph loop |
| `@verify-prd` | Used in acceptance criteria |
| `@gap-analysis` | Used in acceptance criteria |
| `@ui-healer` | Used in UI validation criteria |
| **Taskmaster MCP** | Optional — AI-powered PRD parsing (recommended) |

### Taskmaster MCP Tools Reference

| Tool | Purpose |
|------|---------|
| `mcp_taskmaster_parse_prd` | AI-powered PRD parsing into tasks |
| `mcp_taskmaster_get_tasks` | Retrieve tasks with subtasks |
| `mcp_taskmaster_expand_task` | Break down complex tasks into subtasks |
| `mcp_taskmaster_analyze_project_complexity` | Assess project complexity |
| `mcp_taskmaster_set_task_status` | Update task status |
| `mcp_taskmaster_next_task` | Get next task to work on |

---

<verification>
## Step 11a Verification Schema

### Required Files (30 points)

| File | Path | Min Size | Points |
|------|------|----------|--------|
| Backlog | docs/ralph/implementation/prd.json | 1KB | 15 |
| PRD Map | docs/ralph/implementation/prd-map.json | 200B | 8 |
| Progress | docs/ralph/implementation/progress.txt | 50B | 7 |

### Schema Validation (25 points)

| Check | Description | Points |
|-------|-------------|--------|
| json_valid | prd.json is valid JSON | 10 |
| schema_valid | prd.json matches ralph-backlog.schema.json | 10 |
| map_valid | prd-map.json is valid JSON | 5 |

### Content Quality (25 points)

| Check | Description | Points |
|-------|-------------|--------|
| layered_stories | Each PRD has db/api/ui/integration stories | 10 |
| all_prds_covered | Every Step 11 PRD has stories | 10 |
| verifiable_criteria | All stories have machine-verifiable AC | 5 |

### Integration (20 points)

| Check | Description | Points |
|-------|-------------|--------|
| confidence_emitted | .sigma/confidence/step-11a-*.json exists | 5 |
| confidence_passed | Overall confidence >= 80% | 10 |
| streams_assigned | Stories have streamId if Step 11b ran | 5 |

</verification>
