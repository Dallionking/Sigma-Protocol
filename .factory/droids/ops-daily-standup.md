---
name: daily-standup
description: "Sigma ops command: daily-standup"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# daily-standup

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

---
version: "1.0.0"
last_updated: "2025-12-28"
changelog:
  - "1.0.0: Initial release - git-aware daily standup automation"
description: "Automated daily standup with git diff analysis, progress tracking, and blocker detection"
allowed-tools:
  # OTHER TOOLS
  - read_file
  - write
  - list_dir
  - glob_file_search
  - grep
  - run_terminal_cmd
parameters:
  - --date
  - --sprint-id
---

# /daily-standup

**Git-aware automated standup that tracks progress, identifies blockers, and suggests next actions**

## 🎯 Purpose

**Role Context:** You are a **Scrum Master** conducting daily standups. You analyze git activity, test results, and tracking data to provide accurate progress updates without manual reporting overhead.

This command:
- Analyzes git commits since last standup
- Updates PRD statuses based on file changes
- Detects blockers (failing tests, missing deps, etc.)
- Generates standup report
- Updates sprint board
- Suggests next PRD to implement

**Business Impact:**
- **Zero manual reporting overhead** - automated from git
- **Real-time accuracy** - based on actual code changes
- **Proactive blocker detection** - before they derail sprint
- **Data-driven prioritization** - suggests optimal next task

---

## 📋 Command Usage

```bash
# Daily standup (uses today's date, active sprint)
/daily-standup

# Standup for specific date
/daily-standup --date=2025-12-28

# Standup for specific sprint
/daily-standup --sprint-id=2025-01
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--date` | Date for standup (YYYY-MM-DD) | Today |
| `--sprint-id` | Sprint ID to track | Active sprint |

---

## 🔄 Execution Flow

### Phase 1: Context Loading (Auto)

**Task:** Load active sprint and last standup

1. **Find active sprint**
   ```bash
   # Search for sprint with "active" status
   # Read: .tracking-db/sprints/*.json
   ```

2. **Load last standup**
   ```bash
   # Read: docs/tracking/history/standups/YYYY-MM-DD.md
   # Find most recent date
   ```

3. **Calculate time range**
   ```
   Last Standup: 2025-12-27 09:00
   Current Time: 2025-12-28 09:30
   Delta: 24.5 hours
   ```

**Output:**
```
📊 Standup Context:
   Sprint: sprint-2025-01 (Day 2/14)
   Last Standup: 2025-12-27 09:00
   Time Since: 24.5 hours
   PRDs in Sprint: 4
```

---

### Phase 2: Git Analysis (Auto)

**Task:** Analyze git activity since last standup

1. **Get git log**
   ```bash
   git log --since="24 hours ago" --pretty=format:"%h|%an|%ar|%s" --stat
   ```

2. **Parse commits**
   ```
   Commits: 8
   Files Changed: 23
   Lines Added: 1,245
   Lines Removed: 145
   
   Commit Breakdown:
   - f1a2b3c: "feat: implement login form" (12 files, +450 -20)
   - a3b4c5d: "test: add auth tests" (3 files, +120 -0)
   - ...
   ```

3. **Map files to PRDs**
   ```
   Changed files:
   - src/auth/login.tsx          → F1-auth
   - src/auth/session.ts         → F1-auth
   - tests/auth.test.ts          → F1-auth
   - src/components/ErrorBoundary.tsx → F5-error-handling
   ```

4. **Detect activity patterns**
   ```
   F1 (Auth): 
     - 15 files changed
     - 890 lines added
     - 8 commits
     - Status: Heavy activity → likely "in_progress"
   
   F5 (Error Handling):
     - 3 files changed
     - 120 lines added
     - 1 commit
     - Status: Some activity → possibly started
   ```

**Output:**
```
📝 Git Activity (last 24h):
   Commits: 8
   Files: 23 changed (+1,245 -145)
   
   PRD Activity:
   - F1 (Auth): 🔥 Heavy (15 files, 8 commits)
   - F5 (Error): ⚡ Light (3 files, 1 commit)
   - F6 (Design): 💤 None
   - F9 (Landing): 💤 None
```

---

### Phase 3: Test & Build Status (Auto)

**Task:** Check latest test and build results

1. **Run tests (if available)**
   ```bash
   npm test -- --passWithNoTests --json --outputFile=.test-results.json
   # or
   pytest --json-report --json-report-file=.test-results.json
   ```

2. **Parse test results**
   ```json
   {
     "total": 48,
     "passed": 45,
     "failed": 3,
     "skipped": 0,
     "coverage": 87.2
   }
   ```

3. **Check build status**
   ```bash
   npm run build 2>&1 | tee .build-log.txt
   # Check exit code
   ```

4. **Map failures to PRDs**
   ```
   Failed tests:
   - auth.test.ts:45 → F1-auth
   - auth.test.ts:67 → F1-auth  
   - session.test.ts:12 → F1-auth
   
   All failures in F1 → mark as "blocked" or "at risk"
   ```

**Output:**
```
🧪 Test Status:
   ✅ Passed: 45/48 (94%)
   ❌ Failed: 3 (auth.test.ts)
   📊 Coverage: 87.2% (target: 80%)
   
   Failures:
   - F1 (Auth): 3 failing tests ⚠️
```

---

### Phase 4: PRD Status Updates (Auto)

**Task:** Update PRD tracking JSONs based on evidence

For each PRD in sprint:

1. **Determine new status**
   ```
   Rules:
   - If git activity >50 lines AND status=ready → "in_progress"
   - If tests all pass AND impl complete → "review"
   - If QA approved → "done"
   - If test failures → "blocked" or stay "in_progress"
   - If no activity for 3+ days → "at_risk"
   ```

2. **Update tracking JSON**
   ```json
   // .tracking-db/prds/F1-auth.json
   {
     "status": "in_progress",  // Was "ready", now active
     "updated": "2025-12-28T09:30:00Z",
     "implementation": {
       "files_changed": 15,
       "lines_added": 890,
       "lines_removed": 45,
       "commits": 8,
       "tests_passing": false,  // 3 failures
       "test_coverage": 87,
       "last_build": "success",
       "last_build_time": "2025-12-28T09:00:00Z"
     },
     "timeline": {
       "estimated_hours": 16,
       "actual_hours": 6,  // Based on commit timestamps
       "started": "2025-12-27T10:00:00Z",
       "completed": null
     },
     "notes": [
       {
         "timestamp": "2025-12-28T09:30:00Z",
         "author": "daily-standup",
         "text": "Heavy git activity. 3 test failures need attention."
       }
     ]
   }
   ```

3. **Detect blockers**
   ```
   Blockers:
   - F1: 3 failing tests (blocker)
   - F6: No activity for 2 days (at_risk if continues)
   ```

**Output:**
```
📊 PRD Status Updates:
   F1 (Auth): ready → in_progress
      - 15 files changed, 8 commits
      - ⚠️ Blocker: 3 failing tests
   
   F5 (Error): ready → in_progress
      - 3 files changed, 1 commit
      - ✅ No issues
   
   F6 (Design): ready (no change)
      - No activity
   
   F9 (Landing): ready (no change)
      - No activity
```

---

### Phase 5: Sprint Progress Calculation (Auto)

**Task:** Update sprint velocity metrics

1. **Calculate hours completed**
   ```
   F1: 6h / 16h = 37.5% complete → 6h done
   F5: 2h / 8h = 25% complete → 2h done
   F6: 0h / 12h = 0% complete → 0h done
   F9: 0h / 16h = 0% complete → 0h done
   
   Total: 8h / 52h = 15.4% complete
   ```

2. **Update sprint JSON**
   ```json
   // .tracking-db/sprints/sprint-2025-01.json
   {
     "velocity": {
       "planned_hours": 52,
       "completed_hours": 8,
       "remaining_hours": 44,
       "hours_per_day": 4.0,  // Actual burn rate
       "completion_percentage": 15.4,
       "days_elapsed": 2,
       "days_remaining": 12,
       "on_track": true,  // 15.4% done in 2/14 days = 14.3% expected ✅
       "burn_rate": 4.0
     },
     "blockers": [
       {
         "prd": "F1-auth",
         "issue": "3 failing tests",
         "severity": "medium",
         "detected": "2025-12-28T09:30:00Z"
       }
     ]
   }
   ```

3. **Calculate "on track" status**
   ```
   Expected Progress: (Days Elapsed / Total Days) × 100
                    = (2 / 14) × 100 = 14.3%
   
   Actual Progress: 15.4%
   
   Delta: +1.1% → ✅ On Track (within ±5%)
   ```

**Output:**
```
📈 Sprint Velocity:
   Completed: 8h / 52h (15.4%)
   Expected: 7.4h (14.3%)
   Status: ✅ On Track (+1.1%)
   
   Burn Rate: 4.0 hours/day
   Target: 3.71 hours/day
   Projection: Will complete in 11 days (3 days ahead)
```

---

### Phase 6: Blocker Detection (Auto)

**Task:** Identify all blockers and risks

**Detection Rules:**

1. **Test Failures**
   ```
   IF any PRD has failing tests → Blocker
   ```

2. **Build Failures**
   ```
   IF build fails → Critical Blocker (all PRDs affected)
   ```

3. **No Activity**
   ```
   IF PRD in progress AND no commits for 48h → At Risk
   ```

4. **Dependency Issues**
   ```
   IF PRD depends on blocked PRD → Blocked
   ```

5. **Capacity Overrun**
   ```
   IF actual hours > estimated hours × 1.5 → At Risk
   ```

**Output:**
```
🚨 Blockers & Risks:

❌ BLOCKERS:
   F1 (Auth): 3 failing tests
      - auth.test.ts:45 - Session timeout not working
      - auth.test.ts:67 - Login redirect broken
      - session.test.ts:12 - Token refresh fails
      Action: Fix tests before continuing

⚠️ AT RISK:
   None detected

✅ ON TRACK:
   F5 (Error Handling): Progressing well
```

---

### Phase 7: Next Actions Suggestion (Auto)

**Task:** Suggest optimal next PRD to work on

**Prioritization Logic:**

1. **Resolve blockers first**
   ```
   IF any blocker → Suggest fixing it
   ```

2. **Continue in-progress work**
   ```
   IF PRD in_progress AND not blocked → Continue it
   ```

3. **Start next priority PRD**
   ```
   IF no in-progress → Suggest highest WSJF ready PRD
   ```

4. **Parallel work opportunities**
   ```
   IF multiple PRDs with no dependencies → Suggest parallel work
   ```

**Output:**
```
🎯 Suggested Next Actions:

Priority 1: Fix F1 blockers
   - 3 test failures need attention
   - Run: npm test src/auth
   - Expected: 2 hours to fix

Priority 2: Continue F5 (Error Handling)
   - In progress, no blockers
   - 6h remaining (~1.5 days)
   - Run: /implement-prd --prd-id=F5

Priority 3: Start F6 (Design System) in parallel
   - No dependencies, can work alongside F5
   - 12h estimated (~3 days)
   - Run: /implement-prd --prd-id=F6
```

---

### Phase 8: Report Generation (Auto)

**Task:** Create standup markdown report

**File:** `/docs/tracking/history/standups/2025-12-28.md`

```markdown
# Daily Standup: 2025-12-28

**Sprint:** sprint-2025-01 (Day 2/14)  
**Status:** 🟢 On Track  
**Attendance:** Cursor Agent

---

## 📊 Sprint Progress

```
Day 2  [██░░░░░░░░░░░░] 15.4%
```

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Completed | 8h | 7.4h | ✅ +1.1% |
| Remaining | 44h | 44.6h | ✅ |
| Burn Rate | 4.0h/day | 3.71h/day | ✅ |
| Days Remaining | 12 days | 12 days | ✅ |

---

## 👨‍💻 Yesterday (Last 24h)

### Completed
- ✅ F1 (Auth): Login form implementation (6h)
  - Login component with validation
  - Session management hooks
  - Unit tests (3 failing, need fixes)
- ✅ F5 (Error): Started error boundary (2h)
  - Global ErrorBoundary component
  - Error logging setup

### Git Activity
- **Commits:** 8
- **Files:** 23 changed (+1,245 -145)
- **Contributors:** Cursor Agent

---

## 🎯 Today

### Plan
1. **Fix F1 test failures** (2h estimated)
   - Fix session timeout handling
   - Fix login redirect
   - Fix token refresh logic

2. **Continue F5 (Error Handling)** (4h estimated)
   - Complete error state UI
   - Add toast notifications
   - Test error scenarios

3. **Start F6 (Design System)** if time permits
   - Set up tokens
   - Create base components

---

## 🚨 Blockers

### ❌ Active Blockers
- **F1 (Auth):** 3 failing tests
  - `auth.test.ts:45` - Session timeout not working
  - `auth.test.ts:67` - Login redirect broken
  - `session.test.ts:12` - Token refresh fails
  - **Action Required:** Fix before marking F1 complete
  - **ETA:** 2 hours

### ⚠️ Risks
None detected

---

## 📋 PRD Status

| ID | Title | Status | Progress | Tests | Issues |
|----|-------|--------|----------|-------|--------|
| F1 | Auth System | 🟡 In Progress | 37% (6h/16h) | ⚠️ 45/48 pass | 3 failures |
| F5 | Error Handling | 🟡 In Progress | 25% (2h/8h) | ✅ All pass | None |
| F6 | Design System | ⚪ Ready | 0% (0h/12h) | - | None |
| F9 | Landing Page | ⚪ Ready | 0% (0h/16h) | - | None |

---

## 📈 Metrics

| Metric | Value |
|--------|-------|
| **Test Pass Rate** | 94% (45/48) |
| **Code Coverage** | 87% |
| **Build Status** | ✅ Passing |
| **QA Approved** | 0/4 PRDs |

---

## 🎯 Next Actions

1. ❗ **Fix F1 test failures** (highest priority)
   ```bash
   npm test src/auth/auth.test.ts --watch
   ```

2. **Continue F5 implementation**
   ```bash
   /implement-prd --prd-id=F5-error-handling
   ```

3. **Consider starting F6 in parallel** (no dependencies)
   ```bash
   /implement-prd --prd-id=F6-design-system
   ```

---

## 📅 Sprint Forecast

Based on current velocity:
- **Projected Completion:** Day 11 (3 days early) ✅
- **Risk Level:** Low
- **Recommendation:** Continue current pace

---

*Generated by /daily-standup on 2025-12-28 09:30*  
*Sprint: .tracking-db/sprints/sprint-2025-01.json*  
*Next standup: Run /daily-standup tomorrow*
```

---

### Phase 9: Sprint Board Update (Auto)

**Task:** Update SPRINT-CURRENT.md

Update these sections:
- PRD status table (emoji indicators)
- Progress bar
- Velocity metrics
- Blockers section
- Next actions

**Example update:**

```markdown
## 📋 Committed PRDs

| Order | ID | Title | Effort | Priority | Status | QA | Progress |
|-------|----|----|--------|----------|--------|----|----|
| 1 | F1 | Authentication System | 16h | P0 | 🟡 In Progress | ❌ | 37% ⚠️ |
| 2 | F5 | Error Handling | 8h | P0 | 🟡 In Progress | ❌ | 25% |
| 3 | F6 | Design System | 12h | P1 | ⚪ Ready | ❌ | 0% |
| 4 | F9 | Landing Page | 16h | P1 | ⚪ Ready | ❌ | 0% |
```

**Output:**
```
✅ Sprint board updated: /docs/tracking/SPRINT-CURRENT.md
```

---

## 📤 Outputs

### Files Created

- `/docs/tracking/history/standups/YYYY-MM-DD.md` - Daily report

### Files Updated

- `/docs/tracking/SPRINT-CURRENT.md` - Sprint board
- `.tracking-db/sprints/[sprint-id].json` - Sprint metrics
- `.tracking-db/prds/[ID].json` - PRD statuses (multiple)
- `.tracking-db/metrics.json` - Overall metrics

---

## 🎯 Success Criteria

- ✅ Git activity analyzed and mapped to PRDs
- ✅ Test results checked and failures mapped
- ✅ PRD statuses updated based on evidence
- ✅ Blockers identified and documented
- ✅ Sprint velocity calculated accurately
- ✅ Next actions suggested
- ✅ Standup report generated
- ✅ Sprint board updated

---

## 💡 Tips

### Best Practices

**Run daily:**
```bash
# Every morning at standup time
/daily-standup
```

**Review blockers immediately:**
```bash
# If blockers detected, address them first
```

**Track actual hours:**
- Use git commit timestamps
- Add manual notes if needed in PRD JSON

### Integration with Workflow

```bash
# Morning routine:
1. /daily-standup                    # See status
2. Read blockers, address if any
3. /implement-prd --prd-id=...      # Continue work
4. Git commit regularly (for tracking)
5. /daily-standup (next day)        # Repeat
```

---

## 🚨 Common Issues

### "No active sprint found"
- Run `/sprint-plan` to create a sprint first

### "Git log empty"
- No commits since last standup
- This is normal if no work done

### "Cannot determine PRD from files"
- File changes don't match any PRD
- This is OK (might be refactoring)
- Manually note if needed

---

*Part of Sigma Tracking System - see /docs/tracking/TRACKING-SYSTEM.md*

