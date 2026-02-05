---
name: continue
description: "Find the most recent unfinished PRD/task and resume work. Integrates with Ralph loop for autonomous continuation."
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# continue

**Source:** Sigma Protocol ops module
**Version:** 1.2.0

---


# @continue — Find and Resume Unfinished Work

**Pick up where you left off. Find pending tasks and continue implementation.**

> **Note:** This command was previously named `@sigma-continue`. The old name still works for backward compatibility.

## 🎯 Mission

You are a **workflow continuation specialist**. Your job is to:

1. Find unfinished work (PRDs, stories, tasks)
2. Present the most relevant options to resume
3. Help the user continue seamlessly

## 🧭 Usage

```bash
@continue                           # Interactive - find and show options
@continue --mode=auto               # Auto-continue most recent task
@continue --source=prd-map          # Check Ralph prd-map.json
@continue --source=manifest         # Check .sigma-manifest.json
@continue --limit=5                 # Show top 5 pending tasks
@continue --ralph                   # After selection, invoke Ralph loop
```

### Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `--source` | `prd-map`, `manifest`, `git`, `all` | `all` | Where to look for pending work |
| `--mode` | `interactive`, `auto` | `interactive` | How to handle task selection |
| `--limit` | number | `10` | Maximum tasks to display |
| `--ralph` | boolean | `false` | Invoke Ralph loop after selection |

---

## ⚡ Preflight (auto)

1. **Get current date and time**
```bash
date +"%Y-%m-%d %H:%M"
```

2. **Check for .sigma directory**
```bash
ls -la .sigma/ 2>/dev/null || echo "No .sigma directory"
```

3. **Check for Ralph prd-map files**
```bash
find . -name "prd-map.json" -o -name "prd.json" 2>/dev/null | head -5
```

4. **Check recent git activity**
```bash
git log --oneline -5 2>/dev/null || echo "Not a git repo"
```

5. **Check for Step 5b prototype PRDs**
```bash
find . -path "./docs/ralph/prototype/*.json" 2>/dev/null | head -5
```

6. **Check for Step 11a implementation PRDs**
```bash
find . -path "./docs/ralph/implementation/*.json" 2>/dev/null | head -5
```

7. **Check for unconverted markdown PRDs**
```bash
find . -path "./docs/prds/*.md" -type f 2>/dev/null | head -5
```

---

## 🔄 Core Workflow

### Phase A — Gather Pending Work Sources

#### Source 1: Ralph PRD Map (`.sigma/ralph/prd-map.json`)

```typescript
interface PRDMap {
  version: string;
  generated: string;
  prds: Array<{
    original_prd: string;
    json_backlog: string;
    status: "pending" | "in_progress" | "completed";
    stories: {
      total: number;
      completed: number;
      pending: number;
    };
  }>;
}
```

**Check for:**
- PRDs with `status: "in_progress"` (highest priority - resume these first)
- PRDs with `status: "pending"` and `stories.pending > 0`

#### Source 2: Individual prd.json Files

Search for Ralph backlog files:
```bash
find . -path "./docs/ralph/**/prd.json" -o -path "./.sigma/ralph/**/prd.json" 2>/dev/null
```

**Parse each prd.json for pending stories:**
```typescript
interface RalphStory {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "blocked";
  acceptanceCriteria: string[];
}
```

#### Source 3: Sigma Manifest (`.sigma-manifest.json`)

```typescript
interface SigmaManifest {
  active_work?: {
    current_prd: string;
    current_story_id: string;
    last_activity: string;
  };
  commands_run: Record<string, {
    ran_at: string;
    output_files: string[];
  }>;
}
```

**Check for:**
- `active_work` field (explicit continuation point)
- Recent `commands_run` with incomplete outputs

#### Source 4: Git Status

```bash
# Check for in-progress work branches
git branch --list "feat/*" "feature/*" "wip/*" 2>/dev/null

# Check for uncommitted changes
git status --porcelain 2>/dev/null

# Check recent commits for context
git log --oneline -10 2>/dev/null
```

#### Source 5: Step 5b Prototype PRDs

Check for prototype PRDs created by `@step-5b-prd-to-json`:

```bash
find . -path "./docs/ralph/prototype/*.json" 2>/dev/null
```

**Note:** These are early-stage PRDs from wireframing/prototyping. Lower priority than implementation PRDs.

#### Source 6: Step 11a Implementation PRDs

Check for implementation PRDs created by `@step-11a-prd-to-json`:

```bash
find . -path "./docs/ralph/implementation/*.json" 2>/dev/null
```

**Note:** These are production-ready PRDs. Should be prioritized for implementation.

#### Source 7: Unconverted Markdown PRDs

Check for markdown PRDs that haven't been converted to JSON:

```bash
find docs/prds -name "*.md" -type f 2>/dev/null
```

**If found, suggest conversion:**
```markdown
Found unconverted PRD: docs/prds/auth.md

Convert to Ralph format with:
  @step-11a-prd-to-json --input=docs/prds/auth.md

Or for prototype PRDs:
  @step-5b-prd-to-json --input=docs/prds/auth.md
```

### Phase B — Prioritize and Rank Tasks

Create a ranked list of continuation options:

```typescript
interface ContinuationOption {
  id: string;
  title: string;
  source: "ralph" | "manifest" | "git" | "prd";
  priority: number;  // 1 = highest
  context: {
    lastActivity?: string;
    progress?: string;  // "3/10 stories"
    location?: string;  // file path
  };
  action: string;  // what to do to continue
}
```

**Priority Ranking:**
1. **P1** - Explicit `active_work` in manifest
2. **P2** - `in_progress` stories in Ralph prd.json
3. **P3** - PRDs with partial completion (some stories done)
4. **P4** - Step 11a implementation PRDs (production-ready)
5. **P5** - Pending PRDs (no stories started)
6. **P6** - Step 5b prototype PRDs (early-stage)
7. **P7** - Git work-in-progress branches
8. **P8** - Unconverted markdown PRDs (need conversion first)

### Phase C — Present Options (Interactive Mode)

```markdown
## 🔄 Unfinished Work Found

### Currently In Progress (Resume First)

| # | Task | Progress | Last Activity | Source |
|---|------|----------|---------------|--------|
| 1 | User Authentication Flow | 3/10 stories | 2 hours ago | Ralph |
| 2 | Dashboard Components | 1/5 stories | Yesterday | Ralph |

### Pending (Ready to Start)

| # | Task | Stories | PRD Location |
|---|------|---------|--------------|
| 3 | Payment Integration | 8 stories | docs/ralph/payment/prd.json |
| 4 | Settings Page | 4 stories | docs/ralph/settings/prd.json |

---

**Enter number to continue, or:**
- `r` - Run Ralph loop on selection
- `a` - Show all (including completed)
- `q` - Quit
```

### Phase D — Execute Continuation

Based on user selection:

#### Option: Direct Implementation
```markdown
## Continuing: [Task Title]

**PRD:** [path to prd.json]
**Story:** [current story]
**Status:** [X/Y completed]

### Current Story Details

**ID:** story-003
**Title:** Implement password reset flow

**Acceptance Criteria:**
- [ ] Reset email sends within 30 seconds
- [ ] Token expires after 1 hour
- [ ] User can set new password

### Implementation Notes

[Read progress.txt for context]

---

Ready to implement. Starting with:
1. [First acceptance criterion]
```

#### Option: Invoke Ralph Loop (`--ralph`)
```markdown
## Starting Ralph Loop

**Target:** [path to prd.json]
**Mode:** Claude Code

### Command

\`\`\`bash
./scripts/ralph/sigma-ralph.sh . [prd.json path] claude-code
\`\`\`

Starting Ralph loop...
```

### Phase E — Update Tracking

After selection, update `.sigma-manifest.json`:

```json
{
  "active_work": {
    "current_prd": "docs/ralph/auth/prd.json",
    "current_story_id": "story-003",
    "last_activity": "2026-01-11T10:30:00Z"
  }
}
```

---

## 📁 Output

No separate output file. Updates:
- `.sigma-manifest.json` (active_work tracking)
- Console output with continuation options

---

## 🧠 Auto Mode Behavior

When `--mode=auto`:

1. Find highest priority unfinished task
2. Skip interactive menu
3. Immediately begin implementation OR invoke Ralph loop (if `--ralph`)

**Use Case:** Continuing work after a break without decision fatigue.

```bash
# "Just continue where I left off"
@continue --mode=auto

# "Run Ralph loop on whatever's next"
@continue --mode=auto --ralph
```

---

## 🔗 Integration with Ralph Loop

When `--ralph` flag is set:

1. Select the target prd.json
2. Verify sigma-ralph.sh exists
3. Prompt user to confirm
4. Execute:

```bash
./scripts/ralph/sigma-ralph.sh . [selected-prd.json] claude-code
```

The Ralph loop will:
- Read prd.json
- Find next pending story
- Implement with verification
- Update story status
- Commit changes
- Continue to next story

---

## 🚫 Edge Cases

### No Pending Work Found
```markdown
## ✅ All caught up!

No pending work found in:
- Ralph prd.json files
- .sigma-manifest.json
- Git branches

**Ready to start something new?**
- Run `@step-11-prd-generation` to create new PRDs
- Run `@step-5-wireframe-prototypes` for early prototyping
```

### Multiple Active Work Items
```markdown
## ⚠️ Multiple items in progress

You have 3 items marked "in_progress". This may indicate:
- Interrupted work sessions
- Parallel implementation

**Recommendation:** Complete one before starting another.

Pick one to focus on, or mark others as "paused".
```

---

## 🔗 Related Commands

- `@simplify` — Clean up code after implementation
- `@gap-analysis` — Verify implementation completeness
- `@status` — Full workflow status check
- `@dev-loop` — Development iteration cycle

---

## 💡 Tips

1. **Run at session start** - Quick way to pick up where you left off
2. **Use `--ralph` for long sessions** - Let Ralph loop handle multiple stories
3. **Check `--source=git`** - Find work-in-progress branches you forgot about
4. **Update manifest** - Keep `active_work` current for better continuity



