# Step 11b: PRD Swarm Execution (Worker Mode)

**Role:** Swarm Worker
**Context:** Implement PRDs assigned by orchestrator
**Skill Invocation Mode:** OpenCode / Claude Code
**Supports:** Traditional Mode + Ralph-Mode (v3.0)

---

## Mission

Implement PRDs as a worker agent, following the completion protocol. 
Now supports **Ralph-mode** for autonomous implementation loops with fresh context per story.

---

## Implementation Mode Selection

Before starting, the orchestrator will offer you a choice:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🐝 IMPLEMENTATION MODE SELECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Choose how to implement PRD swarms:

[1] TRADITIONAL MODE
    - Orchestrator assigns PRDs to you
    - You implement in current context
    - Best for: 1-5 PRDs, simple features

[2] RALPH MODE (AUTONOMOUS)
    - PRDs converted to prd.json backlog
    - Fresh Claude Code session per story
    - Verifiable acceptance criteria
    - Best for: 5+ PRDs, complex features, 
      autonomous overnight runs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Ralph-Mode Setup (If Selected)

If Ralph-mode is selected:

1. **Run Step 11.25 first:**
   ```bash
   @step-11a-prd-to-json --include-swarms=true
   ```
   This converts PRDs to `docs/ralph/implementation/prd.json`

2. **Start Ralph loop:**
   ```bash
   sss-ralph.sh --workspace=$(pwd) --mode=implementation --stream=[your-stream-id]
   ```

3. **Monitor progress:**
   ```bash
   # Check progress
   jq '.meta.passedStories + "/" + .meta.totalStories' docs/ralph/implementation/prd.json
   
   # View progress log
   cat docs/ralph/implementation/progress.txt
   ```

---

## Phase 1: Initialize as Worker (Traditional Mode)

### Declare Worker Role
```
@swarm:init-worker --stream=[stream-id]
```

### Load Protocols
```
@swarm:worker-protocol
@swarm:completion-protocol
```

---

## Phase 2: Await Assignment

Wait for orchestrator to send PRD assignment with:
- PRD content
- Relevant context
- Completion instructions

---

## Phase 3: PRD-First Implementation

### 3.1 Read PRD Completely
Understand every requirement.

### 3.2 Ask Clarifying Questions
If anything unclear, ask orchestrator before proceeding.

### 3.3 Create Implementation Plan
```
@step-11b:create-implementation-plan
```

Map acceptance criteria to tasks.

### 3.4 Implement
Execute one criterion at a time.
Track all files changed.

### 3.5 Verify Locally
Run tests, check each criterion.

---

## Phase 4: Report Completion

### Use Completion Protocol
```
[TASK_COMPLETE]
```json
{
  "taskId": "[assigned-task-id]",
  "prdPath": "[path-to-prd]",
  "streamId": "[your-stream-id]",
  "summary": "[what you did]",
  "filesChanged": ["file1.ts", "file2.tsx"],
  "linesChanged": { "added": 100, "removed": 20 },
  "acceptanceCriteriaMet": [
    { "criterion": "...", "met": true, "details": "..." }
  ],
  "nextSteps": ["..."],
  "confidenceScore": 0.9
}
```
```

---

## Phase 5: Respond to Orchestrator

### If Approved
```bash
git add .
git commit -m "feat(FEAT-XXX): [description]"
git push origin [branch]
mv docs/prds/features/FEAT-XXX.md docs/prds/completed/
```

### If Corrections Needed
1. Review feedback
2. Implement fixes
3. Re-submit completion

---

## Completion Protocol

```
[STEP_COMPLETE]
step: 11b
name: PRD Swarm Worker
role: worker
outputs:
  - implemented features
  - pushed branches
  - moved PRDs
status: awaiting_next_assignment
```

---

## Next Assignment

Await next PRD from orchestrator or confirm queue empty.

---

## Ralph-Mode Completion Protocol

**If operating in Ralph-mode, use these markers instead of the traditional completion protocol:**

### Story Complete (Success)

When all acceptance criteria pass:

```
RALPH_STORY_COMPLETE: [story-id]
```

The Ralph loop will:
1. Parse this marker from output
2. Update `prd.json` with `passes: true`
3. Append to `progress.txt`
4. Spawn fresh session for next story

### Story Blocked (Cannot Complete)

If you cannot complete the story:```
RALPH_STORY_BLOCKED: [story-id]
REASON: [explain why - missing dependency, unclear requirement, etc.]
```

The Ralph loop will:
1. Record the failure in `prd.json`
2. Append to `progress.txt` with reason
3. Move to next story (if available)
4. Stop after 3 consecutive failures

### Verification Commands

In Ralph-mode, your acceptance criteria include commands to run:

```json
{
  "acceptanceCriteria": [
    {
      "type": "command",
      "command": "@gap-analysis",
      "expectedScore": 85
    },
    {
      "type": "file-exists",
      "filePath": "components/feature/MyComponent.tsx"
    },
    {
      "type": "ui-validation",
      "uiValidation": {
        "mode": "any",
        "route": "/feature",
        "checks": [{ "type": "content-exists", "expectedText": "Feature" }]
      }
    }
  ]
}
```

**Run all verification commands before outputting `RALPH_STORY_COMPLETE`.**

### Example Ralph Worker Session

```
[Claude Code Session Start]

You are implementing a single story from a Ralph-style backlog.

## STORY: F01: Database Schema
**ID:** f01-db
**Description:** Create database tables and RLS policies for Auth feature
**Source PRD:** docs/prds/F01-auth.md

## INSTRUCTIONS

1. READ the source PRD first
2. IMPLEMENT only this story
3. VERIFY against acceptance criteria:
   - [ac-1] Database migration file created
   - [ac-2] Drizzle schema file created
   - [ac-3] RLS policies defined
   - [ac-4] Gap analysis passes >= 85%4. RUN verification commands
5. REPORT completion with:
   RALPH_STORY_COMPLETE: f01-db

---

[Agent implements, verifies, and outputs:]

RALPH_STORY_COMPLETE: f01-db

[Session ends, loop continues with next story]
```