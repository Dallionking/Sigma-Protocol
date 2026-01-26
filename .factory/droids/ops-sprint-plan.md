---
name: sprint-plan
description: "Sigma ops command: sprint-plan"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# sprint-plan

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

---
version: "1.0.0"
last_updated: "2025-12-28"
changelog:
  - "1.0.0: Initial release - sprint planning with capacity management"
description: "Plan sprints from backlog with intelligent capacity allocation and risk assessment"
allowed-tools:
  # OTHER TOOLS
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep
parameters:
  - --sprint-id
  - --capacity
  - --duration
  - --auto
---

# /sprint-plan

**Create executable sprint plans from the backlog with capacity-aware allocation**

## 🎯 Purpose

**Role Context:** You are a **Scrum Master / Engineering Manager** planning sprints. You balance capacity constraints, dependency ordering, and risk management to create achievable sprint goals.

This command:
- Reads the groomed backlog
- Allocates PRDs based on capacity and dependencies
- Creates sprint tracking JSON
- Generates sprint board markdown
- Identifies risks and mitigation strategies
- Sets up sprint tracking for `/daily-standup`

**Business Impact:**
- **Predictable delivery** through capacity planning
- **Reduce mid-sprint chaos** with dependency-aware planning
- **Increase velocity** by optimizing work allocation
- **Enable tracking** with automated sprint boards

---

## 📋 Command Usage

```bash
# Interactive sprint planning (recommended)
/sprint-plan

# Create sprint with specific capacity
/sprint-plan --sprint-id=2025-01 --capacity=80h --duration=14d

# Auto-plan sprint (fills to capacity with highest WSJF)
/sprint-plan --sprint-id=2025-01 --capacity=80h --auto
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--sprint-id` | Sprint identifier (e.g., 2025-01, sprint-5) | Auto-generated |
| `--capacity` | Total capacity in hours (e.g., 80h, 120h) | Prompt user |
| `--duration` | Sprint duration in days (e.g., 7d, 14d) | 14 days |
| `--auto` | Auto-allocate PRDs to fill capacity | false (interactive) |

---

## 🎯 Sprint Planning Principles

### Capacity Calculation

```
Team Capacity = (Team Size × Days × Hours per Day × Utilization)

Where:
- Team Size: Number of developers
- Days: Sprint duration (typically 7-14 days)
- Hours per Day: Working hours (typically 6-8h)
- Utilization: % available for sprint work (typically 70-80%)

Example:
- 1 developer × 14 days × 6 hours/day × 75% = 63 hours capacity
```

### Allocation Rules

1. **Never exceed capacity** (leave 10-20% buffer)
2. **Respect dependencies** (blocked PRDs cannot be selected)
3. **Prioritize by WSJF** (highest value first)
4. **Consider risk** (high-risk PRDs need buffer time)
5. **Balance work** (avoid all complex or all simple)

---

## 🔄 Execution Flow

### Phase 1: Sprint Setup (Auto)

**Task:** Gather sprint parameters

1. Generate sprint ID if not provided
   ```
   Format: sprint-YYYY-MM (e.g., sprint-2025-01)
   Or sequential: sprint-1, sprint-2, etc.
   ```

2. Determine capacity
   - If `--capacity` provided: use it
   - Else: prompt user for capacity in hours
   - Validate: must be > 0 and < 1000 hours

3. Set sprint duration
   - Default: 14 days
   - Or use `--duration` parameter

4. Calculate dates
   ```
   Start Date: Today
   End Date: Today + Duration
   ```

**Output:**
```
📅 Sprint Setup:
   ID: sprint-2025-01
   Start: 2025-12-28
   End: 2026-01-11
   Duration: 14 days
   Capacity: 80 hours
   Buffer: 16 hours (20%)
   Available: 64 hours
```

**⏸️ CHECKPOINT:** Confirm sprint parameters before continuing

---

### Phase 2: Backlog Loading

**Task:** Load and validate backlog

1. Read `/docs/tracking/BACKLOG.md`
   - Verify file exists
   - Parse PRD table

2. Load all PRD tracking JSONs from `.tracking-db/prds/`
   - Filter for "Ready" status (not blocked)
   - Exclude PRDs already in active sprints
   - Sort by priority (P0 first) then WSJF (descending)

3. Calculate available work
   ```
   Total Ready Hours = Sum of all ready PRD estimates
   Sprint Capacity = 80h
   Can Fill = Yes/No
   ```

**Output:**
```
📊 Backlog Status:
   Ready PRDs: 8 (104 hours)
   Blocked PRDs: 5 (72 hours)
   Sprint Capacity: 80 hours
   
   ✅ Enough work available to fill sprint
```

---

### Phase 3: PRD Selection

**Task:** Select PRDs for sprint (interactive or auto)

#### Interactive Mode (Default)

For each ready PRD (sorted by WSJF):

1. Show PRD details
   ```
   ┌─────────────────────────────────────────────┐
   │ F1: Authentication System                   │
   ├─────────────────────────────────────────────┤
   │ Priority:     P0 (WSJF: 1.50)              │
   │ Effort:       16 hours                      │
   │ Dependencies: None                          │
   │ Risk:         Medium                        │
   │ Notes:        Auth flow + session mgmt      │
   └─────────────────────────────────────────────┘
   
   Remaining Capacity: 64 hours
   
   [Include] [Skip] [Details] [Stop Planning]
   ```

2. User chooses:
   - **Include** → Add to sprint, reduce capacity
   - **Skip** → Move to next PRD
   - **Details** → Show full PRD file
   - **Stop** → Finish planning with current selection

3. Track capacity
   ```
   Committed: 16h / 64h (25%)
   Remaining: 48h
   ```

4. Repeat until capacity filled or user stops

#### Auto Mode (--auto)

Automatically select PRDs:
1. Start with highest WSJF
2. Add PRD if it fits remaining capacity
3. Skip if it doesn't fit
4. Continue until capacity filled or no more PRDs

**Output:**
```
✅ Sprint Planning Complete:
   
   Committed PRDs:
   - F1: Authentication (16h) - P0, WSJF 1.50
   - F5: Error Handling (8h) - P0, WSJF 1.47
   - F6: Design System (12h) - P1, WSJF 1.35
   - F9: Landing Page (16h) - P1, WSJF 1.28
   
   Total Committed: 52h / 64h (81%)
   Remaining Buffer: 12h (19%)
   
   Not Included (capacity):
   - F10: Analytics (16h) - Would exceed capacity
```

**⏸️ CHECKPOINT:** Review sprint allocation before finalizing

---

### Phase 4: Risk Assessment

**Task:** Identify sprint risks and mitigation

For committed PRDs, analyze:

1. **Dependency Risk**
   - Are any PRDs dependent on each other?
   - Should ordering be enforced?

2. **Estimate Risk**
   - Any PRDs with "low" estimate confidence?
   - Any PRDs >24 hours (too large)?

3. **Technical Risk**
   - PRDs with "integration", "migration", "real-time"?
   - PRDs touching critical systems?

4. **Capacity Risk**
   - Is sprint >90% committed? (too aggressive)
   - Is sprint <50% committed? (under-utilizing)

**Generate Risk Report:**

```markdown
## 🚨 Sprint Risks

### High Risk
- **F1 (Auth)**: Touches security-critical code, estimate confidence: medium
  - Mitigation: Add 2h buffer, start early in sprint

### Medium Risk
- **F6 (Design System)**: Large scope (12h), might balloon
  - Mitigation: Break into phases if needed

### Low Risk
- **F5 (Error Handling)**: Well-defined, low complexity

## 📊 Capacity Risk
- Committed: 81% ✅ (healthy range 70-85%)
- Buffer: 19% ✅ (sufficient for unknowns)
```

**⏸️ CHECKPOINT:** Acknowledge risks before finalizing

---

### Phase 5: Sprint Creation

**Task:** Create sprint tracking files

#### 1. Create Sprint JSON

**File:** `.tracking-db/sprints/sprint-2025-01.json`

```json
{
  "id": "sprint-2025-01",
  "name": "Sprint 2025-01: Auth & Core UI",
  "start_date": "2025-12-28",
  "end_date": "2026-01-11",
  "duration_days": 14,
  "capacity_hours": 80,
  "committed_hours": 52,
  "buffer_hours": 12,
  "status": "active",
  
  "goal": "Complete authentication system, error handling, design system foundation, and landing page",
  
  "committed_prds": [
    {
      "id": "F1-auth",
      "title": "Authentication System",
      "hours": 16,
      "priority": "P0",
      "wsjf": 1.50,
      "status": "ready",
      "order": 1
    },
    {
      "id": "F5-error-handling",
      "title": "Error Handling",
      "hours": 8,
      "priority": "P0",
      "wsjf": 1.47,
      "status": "ready",
      "order": 2
    },
    {
      "id": "F6-design-system",
      "title": "Design System",
      "hours": 12,
      "priority": "P1",
      "wsjf": 1.35,
      "status": "ready",
      "order": 3
    },
    {
      "id": "F9-landing-page",
      "title": "Landing Page",
      "hours": 16,
      "priority": "P1",
      "wsjf": 1.28,
      "status": "ready",
      "order": 4
    }
  ],
  
  "velocity": {
    "planned_hours": 52,
    "completed_hours": 0,
    "remaining_hours": 52,
    "hours_per_day": 3.71,
    "completion_percentage": 0,
    "days_elapsed": 0,
    "days_remaining": 14,
    "on_track": true,
    "burn_rate": 0
  },
  
  "metrics": {
    "prds_committed": 4,
    "prds_completed": 0,
    "prds_in_progress": 0,
    "prds_ready": 4,
    "tests_passing": 0,
    "tests_total": 0,
    "test_pass_rate": 0,
    "qa_approved": 0,
    "code_coverage": 0
  },
  
  "risks": [
    {
      "prd": "F1-auth",
      "level": "high",
      "description": "Security-critical code, medium estimate confidence",
      "mitigation": "Add 2h buffer, start early in sprint"
    }
  ],
  
  "blockers": [],
  
  "notes": [
    {
      "date": "2025-12-28",
      "author": "sprint-plan",
      "text": "Sprint created with 4 PRDs, 81% capacity utilization"
    }
  ],
  
  "created": "2025-12-28T16:30:00Z",
  "updated": "2025-12-28T16:30:00Z"
}
```

#### 2. Update PRD JSONs

For each committed PRD, update `.tracking-db/prds/[ID].json`:

```json
{
  "status": "ready",           // Change from "backlog" to "ready"
  "sprint": "sprint-2025-01",  // Assign to sprint
  "updated": "2025-12-28T16:30:00Z"
}
```

#### 3. Create Sprint Board Markdown

**File:** `/docs/tracking/SPRINT-CURRENT.md`

```markdown
# Sprint 2025-01: Auth & Core UI

**Start Date:** 2025-12-28  
**End Date:** 2026-01-11  
**Duration:** 14 days  
**Status:** 🟢 Active

---

## 📊 Capacity

| Metric | Value |
|--------|-------|
| Total Capacity | 80 hours |
| Committed | 52 hours (65%) |
| Buffer | 12 hours (15%) |
| Available | 16 hours (20%) |

---

## 🎯 Sprint Goal

Complete authentication system, error handling, design system foundation, and landing page.

This sprint establishes the core infrastructure for user auth and sets up the design system for consistent UI development.

---

## 📋 Committed PRDs

| Order | ID | Title | Effort | Priority | Status | QA | Progress |
|-------|----|----|--------|----------|--------|----|----|
| 1 | F1 | Authentication System | 16h | P0 | ⚪ Ready | ❌ | 0% |
| 2 | F5 | Error Handling | 8h | P0 | ⚪ Ready | ❌ | 0% |
| 3 | F6 | Design System | 12h | P1 | ⚪ Ready | ❌ | 0% |
| 4 | F9 | Landing Page | 16h | P1 | ⚪ Ready | ❌ | 0% |

**Legend:**
- ⚪ Ready - Not started
- 🟡 In Progress - Currently working
- 🟢 Done - Completed & tested
- 🔴 Blocked - Waiting on dependency
- ⚠️ At Risk - Behind schedule or issues

---

## 📈 Progress

```
Day 1  [░░░░░░░░░░░░░░] 0%
```

- **Velocity:** 0h completed / 52h planned (0%)
- **Burn Rate:** 0 hours/day (target: 3.71 hours/day)
- **Days Elapsed:** 0 / 14
- **On Track:** ✅ Yes

---

## 🚨 Risks

### 🔴 High Risk
- **F1 (Auth)**: Security-critical code, medium estimate confidence
  - **Mitigation:** Add 2h buffer, start early in sprint

### 🟡 Medium Risk  
- **F6 (Design System)**: Large scope (12h), might balloon
  - **Mitigation:** Break into phases if needed

---

## 🚧 Blockers

None

---

## 📊 Quality Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Tests Passing | 0/0 | 100% |
| Code Coverage | 0% | >80% |
| QA Approved | 0/4 | 4/4 |

---

## 🎯 Next Actions

1. Start F1 (Authentication) - highest priority, unblocks future work
2. Consider F5 (Error Handling) in parallel - no dependencies
3. Run `/implement-prd --prd-id=F1-auth` to begin

---

## 📝 Daily Standups

*Run `/daily-standup` to update progress*

---

*Created by /sprint-plan on 2025-12-28 16:30*  
*Sprint tracking: .tracking-db/sprints/sprint-2025-01.json*  
*Next: /daily-standup*
```

**Output:**
```
✅ Sprint created: sprint-2025-01
✅ Sprint board: /docs/tracking/SPRINT-CURRENT.md
✅ Sprint JSON: .tracking-db/sprints/sprint-2025-01.json
✅ Updated 4 PRD tracking files
```

---

### Phase 6: Sprint Validation

**Task:** Final validation before starting

1. **Verify all committed PRDs exist**
   - Check tracking JSONs
   - Check markdown files

2. **Validate capacity math**
   ```
   Committed (52h) + Buffer (12h) + Available (16h) = Capacity (80h) ✅
   ```

3. **Check for active sprints**
   - Warn if another sprint is already active
   - Suggest closing previous sprint

4. **Verify dependencies**
   - Ensure committed PRDs don't depend on non-committed PRDs

**Output:**
```
✅ Sprint Validation Passed:
   - All PRDs exist
   - Capacity math correct
   - No conflicting active sprints
   - Dependencies satisfied
```

---

## 📤 Outputs

### Files Created

1. `/docs/tracking/SPRINT-CURRENT.md` - Sprint board
2. `.tracking-db/sprints/sprint-2025-01.json` - Sprint tracking
3. Updated: `.tracking-db/prds/*.json` - PRD assignments

### Updated Files

- `/docs/tracking/BACKLOG.md` - PRDs moved to sprint marked differently
- `.tracking-db/metrics.json` - Active sprint set

---

## 🎯 Success Criteria

- ✅ Sprint created with valid ID and dates
- ✅ Capacity properly allocated (not over-committed)
- ✅ PRDs assigned to sprint in tracking DB
- ✅ Sprint board markdown generated
- ✅ Risks identified and documented
- ✅ No dependency violations
- ✅ Ready for `/daily-standup` tracking

---

## 🔄 Integration Points

### Inputs

- `/docs/tracking/BACKLOG.md` - Source of PRDs
- `.tracking-db/prds/*.json` - PRD details
- `.tracking-db/sprints/*.json` - Existing sprints

### Outputs

- `/docs/tracking/SPRINT-CURRENT.md`
- `.tracking-db/sprints/[sprint-id].json`
- Updated `.tracking-db/prds/*.json`

### Downstream Commands

- `/daily-standup` - Track sprint progress
- `/implement-prd` - Start implementing sprint PRDs
- `/job-status` - View sprint status

---

## 💡 Tips

### Optimal Capacity Planning

```
Ideal: 70-85% committed, 15-30% buffer
Too aggressive: >90% committed
Under-utilizing: <60% committed
```

### Suggested Work Order

Start with:
1. Highest priority (P0) items
2. Items that unblock others
3. Items with low estimate confidence (learn early)

Then:
4. P1 items
5. Quick wins (low effort, visible value)

### Mid-Sprint Adjustments

If mid-sprint, PRDs are blocked or cancelled:
```bash
/sprint-plan --sprint-id=2025-01 --refresh
# Allows adding more PRDs to fill capacity
```

---

## 🚨 Common Issues

### "No ready PRDs in backlog"
- Run `/backlog-groom` first
- Check PRD dependencies

### "Sprint capacity too small"
- Committed hours > capacity
- Remove some PRDs or increase capacity

### "Another sprint is active"
- Close previous sprint first
- Or mark it complete manually

---

*Part of Sigma Tracking System - see /docs/tracking/TRACKING-SYSTEM.md*

