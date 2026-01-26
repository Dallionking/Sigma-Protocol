---
name: backlog-groom
description: "Sigma ops command: backlog-groom"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# backlog-groom

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

---
version: "1.0.0"
last_updated: "2025-12-28"
changelog:
  - "1.0.0: Initial release - backlog grooming with WSJF scoring"
description: "Create and maintain product backlog from feature breakdown and PRDs with intelligent prioritization"
allowed-tools:
  # OTHER TOOLS
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep
parameters:
  - --refresh
  - --prd-id
---

# /backlog-groom

**Transform feature breakdown and PRDs into a prioritized, actionable backlog**

## 🎯 Purpose

**Role Context:** You are a **Senior Product Manager** responsible for backlog hygiene. You apply **Weighted Shortest Job First (WSJF)** prioritization and ensure every PRD has clear acceptance criteria, dependencies, and effort estimates.

This command:
- Reads Step 10 (Feature Breakdown) and Step 11 (PRD files)
- Creates tracking database entries for each PRD
- Applies WSJF scoring for intelligent prioritization
- Generates human-readable `BACKLOG.md`
- Identifies dependencies and blockers
- Prepares PRDs for sprint planning

**Business Impact:**
- **Maximize value delivery** through WSJF prioritization
- **Eliminate surprises** with explicit dependencies
- **Accelerate planning** with pre-estimated work
- **Enable sprint planning** with ready-to-commit items

---

## 📋 Command Usage

```bash
# Initial backlog creation (reads Step 10 + Step 11 PRDs)
/backlog-groom

# Refresh backlog with latest PRD changes
/backlog-groom --refresh

# Add specific PRD to backlog
/backlog-groom --prd-id=F1-auth
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--refresh` | Re-scan PRDs and update existing entries | `false` |
| `--prd-id` | Add/update specific PRD only | All PRDs |

---

## 🎯 WSJF Prioritization Framework

### WSJF Formula

```
WSJF = (User-Business Value + Time Criticality + Risk Reduction) / Job Size

Where:
- User-Business Value: 1-10 (how much value to users/business)
- Time Criticality: 1-10 (urgency, market timing)
- Risk Reduction: 1-10 (reduces technical/business risk)
- Job Size: Estimated hours (smaller = higher WSJF)
```

### Priority Mapping

| WSJF Score | Priority | Meaning |
|------------|----------|---------|
| 5.0+ | P0 | Critical - must have for launch |
| 3.0-4.9 | P1 | High priority - needed soon |
| 1.5-2.9 | P2 | Medium priority |
| <1.5 | P3 | Low priority - nice to have |

---

## 🔄 Execution Flow

### Phase 1: Discovery (Auto)

**Task:** Discover all PRDs and existing tracking data

1. Check if `.tracking-db/` exists
   - If not: create structure
   - If yes: load existing entries

2. Read Step 10 Feature Breakdown (`/docs/implementation/FEATURE-BREAKDOWN.md`)
   - Extract feature list
   - Extract estimated complexity
   - Extract dependencies

3. Scan for Step 11 PRDs (`/docs/prds/F*.md` or `/docs/prds/flows/**/*.md`)
   - Collect all PRD files
   - Extract title, description, acceptance criteria
   - Determine if tracking JSON exists

**Output:**
```
📊 Discovery Complete:
   - Found 15 PRDs in /docs/prds/
   - 5 already tracked
   - 10 new PRDs to process
   - Feature breakdown loaded
```

**⏸️ CHECKPOINT:** Show PRD list, wait for approval to continue

---

### Phase 2: PRD Analysis

**Task:** Extract metadata from each PRD and estimate effort

For each PRD:

1. **Read PRD content**
   - Parse frontmatter if exists
   - Extract sections: Overview, Requirements, Acceptance Criteria, Screens, Dependencies

2. **Estimate effort (if not already set)**
   ```
   Effort estimation heuristics:
   - Count acceptance criteria (1-3 = 4h, 4-7 = 8h, 8-12 = 16h, 13+ = 24h+)
   - Count screens/components (1 screen ≈ 4-8h depending on complexity)
   - Adjust for dependencies (each dependency +2h risk buffer)
   - Adjust for technical complexity keywords:
     * "integration", "API", "auth" = +25%
     * "real-time", "websocket" = +50%
     * "migration", "data transform" = +40%
   ```

3. **Calculate WSJF scores**
   - Prompt for value/criticality/risk if not already set
   - Apply formula
   - Assign priority (P0-P3)

4. **Identify dependencies**
   - Check if PRD references other PRDs
   - Check Step 10 feature breakdown for explicit dependencies
   - Validate dependency PRDs exist

5. **Create/update tracking JSON**
   ```json
   {
     "id": "F1-auth",
     "title": "Authentication System",
     "prd_path": "/docs/prds/F1-auth.md",
     "status": "backlog",
     "priority": "P0",
     "sprint": null,
     "assignee": null,
     "created": "2025-12-28T16:00:00Z",
     "updated": "2025-12-28T16:00:00Z",
     "timeline": {
       "estimated_hours": 16,
       "actual_hours": 0,
       "started": null,
       "completed": null
     },
     "wsjf": {
       "user_business_value": 9,
       "time_criticality": 8,
       "risk_reduction": 7,
       "job_size": 16,
       "score": 1.5,
       "calculated": "2025-12-28T16:00:00Z"
     },
     "dependencies": [],
     "blocked_by": null,
     "blocks": [],
     "tags": ["auth", "security", "mvp"],
     "estimate_confidence": "medium"
   }
   ```

**Output:**
```
🔍 PRD Analysis:

F1: Authentication System
   Priority: P0 (WSJF: 1.5)
   Effort: 16 hours
   Dependencies: None
   Status: Ready to plan

F2: User Dashboard
   Priority: P1 (WSJF: 1.2)
   Effort: 24 hours
   Dependencies: F1 (auth)
   Status: Blocked by F1

... (continue for all PRDs)
```

**⏸️ CHECKPOINT:** Show WSJF scores and priorities, allow adjustments

---

### Phase 3: Backlog Generation

**Task:** Create human-readable backlog markdown

1. Sort PRDs by priority (P0 first) then WSJF score (descending)
2. Group by status (Ready → Blocked → Backlog)
3. Generate markdown table

**Generate:** `/docs/tracking/BACKLOG.md`

```markdown
# Product Backlog

**Last Updated:** 2025-12-28 16:00  
**Total Items:** 15  
**Total Estimated Hours:** 192  

---

## 📊 Summary

| Status | Count | Hours |
|--------|-------|-------|
| Ready | 5 | 64 |
| Blocked | 3 | 48 |
| Backlog | 7 | 80 |

---

## 🚀 P0 - Critical (Must Have)

| ID | Title | Effort | WSJF | Dependencies | Status | Notes |
|----|-------|--------|------|--------------|--------|-------|
| F1 | Authentication System | 16h | 1.50 | - | ✅ Ready | Auth flow + session mgmt |
| F5 | Error Handling | 8h | 1.47 | - | ✅ Ready | Global error boundaries |

## 📈 P1 - High Priority

| ID | Title | Effort | WSJF | Dependencies | Status | Notes |
|----|-------|--------|------|--------------|--------|-------|
| F2 | User Dashboard | 24h | 1.21 | F1 | 🔒 Blocked | Main dashboard screens |
| F3 | Settings Page | 12h | 1.17 | F1 | 🔒 Blocked | User preferences |

## 📊 P2 - Medium Priority

| ID | Title | Effort | WSJF | Dependencies | Status | Notes |
|----|-------|--------|------|--------------|--------|-------|
| F7 | Analytics Dashboard | 16h | 0.88 | F2 | 📋 Backlog | Charts and metrics |

## 🎁 P3 - Nice to Have

| ID | Title | Effort | WSJF | Dependencies | Status | Notes |
|----|-------|--------|------|--------------|--------|-------|
| F12 | Dark Mode | 8h | 0.38 | F6 | 📋 Backlog | Theme switcher |

---

## 🔗 Dependency Graph

```
F1 (Auth) 
├─ F2 (Dashboard)
│  ├─ F7 (Analytics)
│  └─ F8 (Reports)
├─ F3 (Settings)
└─ F4 (Profile)

F5 (Error Handling) [No dependencies]

F6 (Design System)
└─ F12 (Dark Mode)
```

---

## 📊 Sprint Readiness

**Ready for Sprint Planning:** 5 PRDs (64 hours)
- F1, F5, F6, F9, F10

**Blocked (Dependencies):** 3 PRDs (48 hours)
- F2 (blocked by F1)
- F3 (blocked by F1)
- F4 (blocked by F1)

**Not Estimated:** 0 PRDs

---

## 🎯 Next Actions

1. Run `/sprint-plan` to create a sprint from ready items
2. Start with F1 (highest WSJF, unblocks 3 others)
3. Consider F5 and F6 in parallel (no dependencies)

---

*Generated by /backlog-groom on 2025-12-28 16:00*  
*PRD tracking data: .tracking-db/prds/*  
*Feature breakdown: /docs/implementation/FEATURE-BREAKDOWN.md*
```

**Output:**
```
✅ Backlog generated: /docs/tracking/BACKLOG.md
✅ Tracking database updated: .tracking-db/prds/ (15 files)
```

---

### Phase 4: Validation

**Task:** Ensure backlog quality

1. **Check for circular dependencies**
   ```
   F1 depends on F2
   F2 depends on F3
   F3 depends on F1  ← CIRCULAR!
   ```

2. **Validate all dependency PRDs exist**
   ```
   F2 depends on F1  ← Does F1 exist? ✅
   F2 depends on F99 ← Does F99 exist? ❌ WARNING
   ```

3. **Check for orphaned PRDs**
   - PRDs in tracking DB but no markdown file
   - PRDs in markdown but not in tracking DB

4. **Estimate confidence check**
   - Warn if >30% of PRDs have "low" confidence estimates
   - Suggest running `/estimate-engine` for better estimates

**Output:**
```
⚠️ Validation Warnings:
   - F2 depends on F99 which doesn't exist
   - 5 PRDs have low estimate confidence (run /estimate-engine)

✅ Validation Passed:
   - No circular dependencies
   - All PRDs have tracking entries
```

---

## 📤 Outputs

### Files Created/Updated

1. `/docs/tracking/BACKLOG.md` - Human-readable backlog
2. `/.tracking-db/prds/[ID].json` - One per PRD (at repo root)
3. `/.tracking-db/config.json` - Backlog config (at repo root)
4. `/.tracking-db/metrics.json` - Initial metrics (at repo root)

### Tracking DB Structure

```
.tracking-db/
├── prds/
│   ├── F1-auth.json
│   ├── F2-dashboard.json
│   └── ... (one per PRD)
├── config.json
└── metrics.json
```

---

## 🎯 Success Criteria

- ✅ All PRDs from Step 11 are in backlog
- ✅ Every PRD has priority and effort estimate
- ✅ WSJF scores calculated for all items
- ✅ Dependencies mapped and validated
- ✅ No circular dependencies
- ✅ "Ready" vs "Blocked" status clear
- ✅ Tracking JSONs created for all PRDs
- ✅ `BACKLOG.md` is comprehensive and sorted

---

## 🔄 Integration Points

### Inputs (Files Read)

- `/docs/implementation/FEATURE-BREAKDOWN.md` (Step 10)
- `/docs/prds/**/*.md` (Step 11)
- `.tracking-db/prds/*.json` (existing tracking data)

### Outputs (Files Written)

- `/docs/tracking/BACKLOG.md`
- `.tracking-db/prds/[ID].json` (multiple)
- `.tracking-db/metrics.json`
- `.tracking-db/config.json`

### Downstream Commands

After `/backlog-groom`, run:
- `/sprint-plan` - Create a sprint from ready items
- `/job-status --all` - View backlog status
- `/estimate-engine` - Improve estimates

---

## 💡 Tips

### Re-grooming the Backlog

Run `/backlog-groom --refresh` when:
- New PRDs added to `/docs/prds/`
- Priorities change
- Dependencies change
- Effort estimates need updating

### Adding Single PRD

```bash
/backlog-groom --prd-id=F1-auth
# Adds/updates only F1, faster than full refresh
```

### Manual WSJF Override

Edit `.tracking-db/prds/F1-auth.json`:
```json
{
  "wsjf": {
    "user_business_value": 10,  // ← Change this
    "time_criticality": 9,       // ← or this
    "risk_reduction": 8,          // ← or this
    "job_size": 16,
    "score": 1.69                 // ← Will recalculate
  }
}
```

Then run `/backlog-groom --refresh` to regenerate BACKLOG.md

---

## 🚨 Common Issues

### "No PRDs found"
- Check Step 11 was run: `/docs/prds/` should have F*.md files
- Run `/step-11-prd-generation` first

### "Circular dependency detected"
- Review dependency graph in BACKLOG.md
- Fix PRD files to remove circular references

### "WSJF scores seem wrong"
- Validate WSJF inputs in tracking JSONs
- Consider business context when scoring

---

*Part of Sigma Tracking System - see /docs/tracking/TRACKING-SYSTEM.md*

