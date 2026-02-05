---
name: job-status
description: "Sigma ops command: job-status"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# job-status

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

---
version: "1.0.0"
last_updated: "2025-12-28"
changelog:
  - "1.0.0: Initial release - quick PRD status query"
description: "Quick status check for PRDs with color-coded terminal output"
allowed-tools:
  # OTHER TOOLS
  - read_file
  - list_dir
  - glob_file_search
parameters:
  - --prd-id
  - --all
  - --sprint
  - --json
---

# /job-status

**Quick status query for PRDs with actionable insights**

## 🎯 Purpose

**Role Context:** You are a **Project Dashboard** providing instant visibility into work status. Show what matters: current status, blockers, and next actions.

This command:
- Displays PRD status in readable format
- Shows progress, blockers, and metrics
- Suggests next actions
- Supports single PRD or bulk queries
- Outputs in human-readable or JSON format

**Business Impact:**
- **Instant visibility** - no digging through files
- **Actionable** - tells you what to do next
- **Flexible** - query one or all PRDs
- **Scriptable** - JSON output for automation

---

## 📋 Command Usage

```bash
# Status for specific PRD
/job-status --prd-id=F1

# Status for all PRDs
/job-status --all

# Status for current sprint PRDs only
/job-status --sprint

# JSON output (for scripting)
/job-status --prd-id=F1 --json
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--prd-id` | PRD identifier (e.g., F1, F1-auth) | Required if not --all |
| `--all` | Show all PRDs | false |
| `--sprint` | Show only sprint PRDs | false |
| `--json` | Output in JSON format | false (human-readable) |

---

## 🔄 Execution Flow

### Mode 1: Single PRD Status

**Command:** `/job-status --prd-id=F1`

1. **Load PRD tracking JSON**
   ```bash
   Read: .tracking-db/prds/F1-*.json
   # Try variants: F1.json, F1-auth.json, etc.
   ```

2. **Display status card**

```
┌──────────────────────────────────────────────────────────────────┐
│ F1: Authentication System                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Status:      🟡 IN PROGRESS                                     │
│ Priority:    P0 (Critical)                                      │
│ Sprint:      sprint-2025-01                                     │
│ Assigned:    Cursor Agent                                       │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ PROGRESS                                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ [████████░░░░░░░░] 37% complete                               │
│                                                                  │
│ Time:        6h / 16h estimated                                 │
│ Started:     2025-12-27 10:00                                   │
│ ETA:         2025-12-29 (2 days)                                │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ IMPLEMENTATION                                                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Files:       15 changed                                         │
│ Lines:       +890 -45                                           │
│ Commits:     8                                                  │
│ Build:       ✅ Passing                                         │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ QUALITY                                                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Tests:       ⚠️ 45/48 passing (94%)                            │
│ Coverage:    87% (target: 80%)                                  │
│ PRD Score:   9.2/10 ✅                                          │
│ QA Status:   ❌ Not started                                     │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ BLOCKERS                                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ⚠️ 3 test failures:                                             │
│   • auth.test.ts:45 - Session timeout not working              │
│   • auth.test.ts:67 - Login redirect broken                    │
│   • session.test.ts:12 - Token refresh fails                   │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ DEPENDENCIES                                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Depends on:  None                                               │
│ Blocks:      F2 (Dashboard), F3 (Settings), F4 (Profile)       │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ NEXT ACTIONS                                                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 1. ❗ Fix 3 failing tests (2h estimated)                        │
│    npm test src/auth/auth.test.ts --watch                       │
│                                                                  │
│ 2. Complete implementation (10h remaining)                      │
│    /implement-prd --prd-id=F1-auth                             │
│                                                                  │
│ 3. Run QA after implementation                                  │
│    /qa-run --prd-id=F1 --mode=full                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

📁 Files:
   PRD:      /docs/prds/F1-auth.md
   Tracking: .tracking-db/prds/F1-auth.json
   Sprint:   .tracking-db/sprints/sprint-2025-01.json

⏰ Last Updated: 2025-12-28 09:30 (1 hour ago)
```

---

### Mode 2: All PRDs Status

**Command:** `/job-status --all`

1. **Load all PRD tracking JSONs**
   ```bash
   Read: .tracking-db/prds/*.json
   ```

2. **Group by status**

3. **Display summary table**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        ALL PRDS STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Summary:
   Total PRDs:       15
   In Progress:      2
   Ready:            3
   Backlog:          7
   Done:             2
   Blocked:          1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 IN PROGRESS (2)

┌─────┬────────────────────┬──────┬────────┬──────────┬─────────┐
│ ID  │ Title              │ Pri  │ Sprint │ Progress │ Issues  │
├─────┼────────────────────┼──────┼────────┼──────────┼─────────┤
│ F1  │ Auth System        │ P0   │ 2025-01│ 37% (6h) │ ⚠️ 3 tests│
│ F5  │ Error Handling     │ P0   │ 2025-01│ 25% (2h) │ ✅ None  │
└─────┴────────────────────┴──────┴────────┴──────────┴─────────┘

⚪ READY (3)

┌─────┬────────────────────┬──────┬────────┬──────────┬─────────┐
│ ID  │ Title              │ Pri  │ Sprint │ Estimate │ Depends │
├─────┼────────────────────┼──────┼────────┼──────────┼─────────┤
│ F6  │ Design System      │ P1   │ 2025-01│ 12h      │ None    │
│ F9  │ Landing Page       │ P1   │ 2025-01│ 16h      │ None    │
│ F10 │ Analytics          │ P2   │ -      │ 16h      │ F2      │
└─────┴────────────────────┴──────┴────────┴──────────┴─────────┘

🔴 BLOCKED (1)

┌─────┬────────────────────┬──────┬─────────────────────────────┐
│ ID  │ Title              │ Pri  │ Blocked By                  │
├─────┼────────────────────┼──────┼─────────────────────────────┤
│ F2  │ Dashboard          │ P1   │ F1 (Auth System)            │
└─────┴────────────────────┴──────┴─────────────────────────────┘

✅ DONE (2)

┌─────┬────────────────────┬──────┬────────┬───────────────────┐
│ ID  │ Title              │ Pri  │ Sprint │ Completed         │
├─────┼────────────────────┼──────┼────────┼───────────────────┤
│ F0  │ Environment Setup  │ P0   │ 2024-12│ 2024-12-20        │
│ F11 │ Footer Component   │ P3   │ 2025-01│ 2025-12-27        │
└─────┴────────────────────┴──────┴────────┴───────────────────┘

📋 BACKLOG (7)

┌─────┬────────────────────┬──────┬──────────┬──────────────────┐
│ ID  │ Title              │ Pri  │ Estimate │ WSJF             │
├─────┼────────────────────┼──────┼──────────┼──────────────────┤
│ F7  │ Analytics View     │ P2   │ 16h      │ 0.88             │
│ F8  │ Reports            │ P2   │ 20h      │ 0.75             │
│ F12 │ Dark Mode          │ P3   │ 8h       │ 0.38             │
│ ... │ ...                │ ...  │ ...      │ ...              │
└─────┴────────────────────┴──────┴──────────┴──────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Recommended Next Actions:

1. Fix F1 blockers (3 test failures) - unblocks F2, F3, F4
2. Continue F5 (Error Handling) - 6h remaining
3. Start F6 (Design System) in parallel - no dependencies

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Mode 3: Sprint PRDs Only

**Command:** `/job-status --sprint`

Similar to `--all` but filters to only PRDs in the active sprint.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SPRINT 2025-01 STATUS (Day 2/14)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Sprint Progress: [██░░░░░░░░░░░░] 15.4% (8h/52h)

┌─────┬────────────────────┬──────────┬──────────┬─────────────┐
│ ID  │ Title              │ Status   │ Progress │ Issues      │
├─────┼────────────────────┼──────────┼──────────┼─────────────┤
│ F1  │ Auth System        │ 🟡 Active│ 37% (6h) │ ⚠️ 3 tests  │
│ F5  │ Error Handling     │ 🟡 Active│ 25% (2h) │ ✅ None     │
│ F6  │ Design System      │ ⚪ Ready │ 0%       │ -           │
│ F9  │ Landing Page       │ ⚪ Ready │ 0%       │ -           │
└─────┴────────────────────┴──────────┴──────────┴─────────────┘

🚨 Blockers: 1
   • F1: 3 failing tests

📈 Velocity: 4.0h/day (target: 3.71h/day) ✅ On Track

🎯 Next: Fix F1 test failures, then continue F5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Mode 4: JSON Output

**Command:** `/job-status --prd-id=F1 --json`

```json
{
  "id": "F1-auth",
  "title": "Authentication System",
  "prd_path": "/docs/prds/F1-auth.md",
  "status": "in_progress",
  "priority": "P0",
  "sprint": "sprint-2025-01",
  "assignee": "cursor-agent",
  "progress": {
    "percentage": 37,
    "hours_completed": 6,
    "hours_estimated": 16,
    "hours_remaining": 10,
    "eta": "2025-12-29"
  },
  "implementation": {
    "files_changed": 15,
    "lines_added": 890,
    "lines_removed": 45,
    "commits": 8,
    "build": "passing",
    "last_build_time": "2025-12-28T09:00:00Z"
  },
  "quality": {
    "tests_passing": 45,
    "tests_total": 48,
    "test_pass_rate": 93.75,
    "coverage": 87,
    "prd_verification_score": 9.2,
    "qa_status": "not_started"
  },
  "blockers": [
    {
      "type": "test_failure",
      "severity": "medium",
      "description": "3 failing tests in auth.test.ts",
      "files": ["auth.test.ts:45", "auth.test.ts:67", "session.test.ts:12"]
    }
  ],
  "dependencies": {
    "depends_on": [],
    "blocks": ["F2-dashboard", "F3-settings", "F4-profile"]
  },
  "next_actions": [
    {
      "priority": 1,
      "action": "Fix 3 failing tests",
      "estimated_hours": 2,
      "command": "npm test src/auth/auth.test.ts --watch"
    },
    {
      "priority": 2,
      "action": "Complete implementation",
      "estimated_hours": 10,
      "command": "/implement-prd --prd-id=F1-auth"
    }
  ],
  "updated": "2025-12-28T09:30:00Z",
  "updated_ago": "1 hour ago"
}
```

---

## 📤 Outputs

### Terminal Output (Default)

- Color-coded status cards
- Unicode box drawing
- Emoji indicators
- Progress bars
- Clear sections

### JSON Output (--json)

- Machine-readable
- Complete data structure
- Easy to parse in scripts
- Can be piped to jq

---

## 🎯 Status Icons & Colors

### Status Emoji

- 🟢 `done` - Completed and deployed
- 🟡 `in_progress` - Currently working
- ⚪ `ready` - Ready to start
- 🔴 `blocked` - Blocked by dependencies/issues
- ⚠️ `at_risk` - Behind schedule or issues
- 📋 `backlog` - Not yet scheduled
- ❌ `cancelled` - Will not implement

### Priority Colors

- P0: Red (Critical)
- P1: Yellow (High)
- P2: Cyan (Medium)
- P3: Gray (Low)

### Test Status

- ✅ All passing
- ⚠️ Some failing (show count)
- ❌ All failing or not run

---

## 💡 Tips

### Quick Daily Check

```bash
# Morning routine
/job-status --sprint
# See what's in your sprint and blockers
```

### Before Starting Work

```bash
# Check specific PRD before implementing
/job-status --prd-id=F1
# Know current state, blockers, next actions
```

### For Scripting

```bash
# Get JSON for automation
/job-status --all --json | jq '.[] | select(.status=="blocked")'
# Find all blocked PRDs
```

### Integration with Other Commands

```bash
# After implementation
/implement-prd --prd-id=F1
/job-status --prd-id=F1  # Check updated status

# After standup
/daily-standup
/job-status --sprint     # See updated sprint status
```

---

## 🔄 Integration Points

### Reads From

- `.tracking-db/prds/*.json` - PRD tracking
- `.tracking-db/sprints/*.json` - Sprint data
- `/docs/prds/*.md` - PRD files (for links)

### No Writes

This is a **read-only query command** - it never modifies data.

---

## 🚨 Common Issues

### "PRD not found: F1"

Try full ID:
```bash
/job-status --prd-id=F1-auth
```

Or list all:
```bash
/job-status --all
# Find correct ID
```

### "No tracking data"

Run backlog groom first:
```bash
/backlog-groom
```

### "Sprint not found"

Check active sprint:
```bash
/job-status --all
# See sprint assignments
```

---

## 📊 Example Use Cases

### 1. Morning Check-In

```bash
/job-status --sprint
# What's in my sprint today?
```

### 2. Before Standup

```bash
/daily-standup
/job-status --sprint
# Prepare for standup with current state
```

### 3. Check Specific Work

```bash
/job-status --prd-id=F1
# Detailed status before continuing work
```

### 4. Find Blockers

```bash
/job-status --all --json | jq '.[] | select(.blockers | length > 0)'
# Script to find all blocked PRDs
```

### 5. Sprint Health Check

```bash
/job-status --sprint
# Quick view of sprint progress and risks
```

---

*Part of SSS Tracking System - see /docs/tracking/TRACKING-SYSTEM.md*


