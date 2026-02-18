---
description: "Convert PRDs to Ralph backlog JSON (replaces step-5b-prd-to-json and step-11a-prd-to-json)"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /prd-json

**Unified command to convert Sigma Protocol PRDs to Ralph backlog JSON.**

Replaces: `step-5b-prd-to-json`, `step-11a-prd-to-json`

## Overview

This command intelligently detects whether you're working with:
- **Prototype PRDs** (from Step 5 - wireframes/flows)
- **Implementation PRDs** (from Step 11 - full-stack features)

...and converts them to the machine-readable Ralph backlog format (`docs/ralph/{prototype|implementation}/prd.json`).

## Usage

```bash
# Auto-detect mode based on path
/prd-json docs/prds/flows/                    # -> prototype mode
/prd-json docs/prds/                           # -> implementation mode
/prd-json docs/prds/swarm-1/                   # -> implementation mode

# Explicit mode override
/prd-json docs/prds/flows/ --mode=prototype
/prd-json docs/prds/ --mode=implementation

# Custom output path
/prd-json docs/prds/flows/ --output=custom-backlog.json

# Preview without writing files
/prd-json docs/prds/ --dry-run
```

## Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `<prd-path-or-dir>` | path/dir | required | Path to single PRD file or directory of PRDs |
| `--mode` | `prototype`, `implementation`, `auto` | `auto` | Conversion mode (auto-detects if not specified) |
| `--output` | path | auto | Output JSON path (defaults based on mode) |
| `--dry-run` | boolean | `false` | Preview output without writing files |
| `--use-taskmaster` | boolean | `false` | Use Taskmaster MCP for AI-powered parsing |
| `--verification-strict` | boolean | `true` | Require machine-verifiable acceptance criteria |
| `--max-story-size` | `small`, `medium`, `large` | `small` (prototype) or `medium` (implementation) | Max story complexity |

## Auto-Detection Logic

The command inspects the input path and applies these rules:

| Path Contains | Auto-Detected Mode | Default Output |
|---------------|-------------------|----------------|
| `flows/` or `prototype` | `prototype` | `docs/ralph/prototype/prd.json` |
| `swarm-` | `implementation` | `docs/ralph/implementation/prd.json` |
| `docs/prds/F*.md` | `implementation` | `docs/ralph/implementation/prd.json` |
| Otherwise | `implementation` | `docs/ralph/implementation/prd.json` |

**Ambiguous paths:** If a path contains both `flows/` AND `swarm-`, the command emits a warning and requires explicit `--mode`.

## Mode Differences

### Prototype Mode (Step 5b)

- **Source:** `docs/prds/flows/**/*.md` (screen PRDs from wireframing)
- **Output:** `docs/ralph/prototype/prd.json`
- **Story granularity:** Small (1-3 acceptance criteria per story)
- **Acceptance criteria:** UI-focused (visual validation, component rendering)
- **Journeys:** Organized by flow/user-journey
- **Use case:** Early prototyping, UI implementation

### Implementation Mode (Step 11a)

- **Source:** `docs/prds/F*.md` or `docs/prds/swarm-*/F*.md` (full-stack PRDs)
- **Output:** `docs/ralph/implementation/prd.json`
- **Story granularity:** Medium (4-6 acceptance criteria per story)
- **Acceptance criteria:** Full-stack (db, api, ui, integration)
- **Streams:** Organized by swarm assignments (if Step 11b ran)
- **Use case:** Production implementation

## What Gets Created

Both modes create:

1. **prd.json** - Ralph backlog with stories and acceptance criteria
2. **prd-map.json** - Traceability map from PRDs to stories
3. **progress.txt** - Ralph loop progress log
4. **Epistemic Confidence artifact** - `.sigma/confidence/prd-json-*.json`

## Workflow

```
Phase A: Context Loading
  [ ] A1: Scan input path for PRD files
  [ ] A2: Detect mode (prototype vs implementation)
  [ ] A3: Load flow-tree.json or SWARM-PLAN.md
  [ ] A4: Check for existing backlog
  CHECKPOINT: Confirm PRD inventory

Phase B: PRD Parsing
  [ ] B1: Parse PRD markdown (frontmatter, sections, BDD)
  [ ] B2: Extract acceptance criteria
  [ ] B3: Extract metadata (dependencies, components, routes)
  [ ] B4: Identify journeys/streams
  CHECKPOINT: Review parsed structure

Phase C: Story Generation
  [ ] C1: Convert PRDs to atomic stories
  [ ] C2: Apply story-splitting rules
  [ ] C3: Generate verifiable acceptance criteria
  [ ] C4: Map Sigma verification commands (@gap-analysis, @verify-prd, @ui-healer)
  [ ] C5: Assign priority/dependencies
  CHECKPOINT: Review generated stories

Phase D: Backlog Assembly
  [ ] D1: Validate all stories have verifiable criteria
  [ ] D2: Build prd.json with ralph-backlog.schema.json
  [ ] D3: Generate prd-map.json
  [ ] D4: Initialize progress.txt
  CHECKPOINT: Verify backlog structure

Phase E: Output & Validation
  [ ] E1: Write prd.json, prd-map.json, progress.txt
  [ ] E2: Emit Epistemic Confidence artifact
  [ ] E3: Validate against schema
  FINAL: Ready for Ralph loop
```

## Examples

### Example 1: Convert Prototype PRDs

```bash
# All flows at once
/prd-json docs/prds/flows/

# Single flow
/prd-json docs/prds/flows/01-auth/

# Preview first
/prd-json docs/prds/flows/ --dry-run
```

**Output:**
```
Created:
  docs/ralph/prototype/prd.json (15 stories)
  docs/ralph/prototype/prd-map.json
  docs/ralph/prototype/progress.txt

Epistemic Confidence: 92%
  Verifiability: 95%
  Coverage: 100%
  Atomicity: 87%

Ready for Ralph loop:
  ./ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code
```

### Example 2: Convert Implementation PRDs

```bash
# All implementation PRDs
/prd-json docs/prds/

# Include swarm assignments
/prd-json docs/prds/

# Single feature
/prd-json docs/prds/F01-user-auth.md
```

**Output:**
```
Created:
  docs/ralph/implementation/prd.json (42 stories across 3 streams)
  docs/ralph/implementation/prd-map.json
  docs/ralph/implementation/progress.txt

Epistemic Confidence: 88%
  Verifiability: 100%
  Coverage: 100%
  Atomicity: 75%
  Streams: 3 (from Step 11b)

Ready for Ralph loop:
  ./ralph/sigma-ralph.sh . docs/ralph/implementation/prd.json claude-code --stream=1
```

### Example 3: Ambiguous Path Handling

```bash
# This path has both "flows" and "swarm" - ambiguous!
/prd-json docs/prds/flows/swarm-1/

# Output:
# ⚠️ Ambiguous path detected: contains both 'flows/' and 'swarm-'
# Please specify --mode explicitly:
#   /prd-json docs/prds/flows/swarm-1/ --mode=prototype
#   /prd-json docs/prds/flows/swarm-1/ --mode=implementation
```

## Edge Cases

### Empty Directory

```bash
/prd-json docs/prds/empty-folder/

# Output:
# ❌ No PRD files found in docs/prds/empty-folder/
#
# Valid paths:
#   Prototype: docs/prds/flows/**/*.md
#   Implementation: docs/prds/F*.md or docs/prds/swarm-*/F*.md
```

### Non-Existent Path

```bash
/prd-json docs/prds/does-not-exist/

# Output:
# ❌ Path does not exist: docs/prds/does-not-exist/
#
# Valid paths:
#   docs/prds/flows/     (prototype PRDs)
#   docs/prds/           (implementation PRDs)
```

### Mixed Prototype + Implementation PRDs

```bash
# If both flows/ and F*.md exist in the same scan
/prd-json docs/prds/

# Output:
# ⚠️ Found both prototype (flows/) and implementation (F*.md) PRDs
# Processing implementation PRDs only (default behavior)
# To process prototype PRDs instead:
#   /prd-json docs/prds/flows/ --mode=prototype
```

## Integration with Ralph Loop

After generating the backlog, run:

```bash
# Prototype implementation
./ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code

# Implementation with streams
./ralph/sigma-ralph.sh . docs/ralph/implementation/prd.json claude-code --stream=1
```

## Quality Gates

**Command succeeds when:**

- [ ] All PRDs parsed successfully
- [ ] Each PRD has at least one story
- [ ] All stories have at least one machine-verifiable acceptance criterion
- [ ] prd.json validates against `schemas/ralph-backlog.schema.json`
- [ ] Epistemic Confidence >= 80%
- [ ] prd-map.json created for traceability
- [ ] progress.txt initialized

## Related Commands

| Command | Relationship |
|---------|--------------|
| `/step-5-wireframe-prototypes` | Creates prototype PRDs |
| `/step-11-prd-generation` | Creates implementation PRDs |
| `/step-11b-prd-swarm` | Creates swarm assignments (for stream-aware mode) |
| `sigma-ralph.sh` | Executes the Ralph loop on generated backlog |
| `/gap-analysis` | Used in acceptance criteria verification |
| `/ui-healer` | Used in UI validation criteria |

## Migration from Old Commands

| Old Command | New Command |
|-------------|-------------|
| `/step-5b-prd-to-json` | `/prd-json docs/prds/flows/ --mode=prototype` |
| `/step-11a-prd-to-json` | `/prd-json docs/prds/ --mode=implementation` |

**Backward compatibility:** The old commands still work as aliases but show deprecation notices.

---

**Schema Reference:** `schemas/ralph-backlog.schema.json`

**Version:** 2.0.0 (unified command)
