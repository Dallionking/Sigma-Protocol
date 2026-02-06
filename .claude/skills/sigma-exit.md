---
name: sigma-exit
description: Capture rich session context before ending a Claude session
allowed-tools: Read, Write, Bash, Glob
disable-model-invocation: true
---

# Sigma Exit - Session Context Capture

You are ending a session with `sigma-exit`. Your task is to capture rich context about what happened during this session for future sessions.

## Execution Steps

### 1. Generate Session Summary

Create a comprehensive session summary with the following sections:

```markdown
# Session: {DATE} {TIME}

## Executive Summary
- **Goal**: [What the user wanted to accomplish]
- **Outcome**: [Success/Partial/Blocked - brief description]
- **Duration**: [Estimated session length]

## Accomplishments
<!-- List completed work with file references -->
- [x] [Task 1] - `path/to/file.ts`
- [x] [Task 2] - `path/to/other.ts`

## Work in Progress
<!-- List incomplete work for next session -->
- [ ] [WIP Task 1] - [Current state, next steps]
- [ ] [WIP Task 2] - [What's blocking]

## Files Modified
<!-- Git-style summary -->
| File | Changes |
|------|---------|
| `path/to/file.ts` | Added X, modified Y |

## Agents/Skills Used
<!-- Track what worked -->
- `deep-research` - [Used for X, effective]
- `frontend-design` - [Used for Y]

## What Worked
- [Pattern or approach that was effective]
- [Tool combination that saved time]

## What Failed / Frustrations
- [Approach that didn't work]
- [Repeated issue or confusion]

## User Behavior Patterns Observed
<!-- For learning system -->
- [Preference: e.g., "Prefers direct execution over confirmation"]
- [Style: e.g., "Uses voice transcription, tolerates typos"]
- [Frustration: e.g., "Repeated correction about X"]

## Key Decisions Made
| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| [Decision 1] | [Why] | [What else was possible] |

## Git State
- **Branch**: [Current branch]
- **Last Commit**: [Commit hash and message]
- **Uncommitted Changes**: [Yes/No - summary]

## Next Session Recommendations
<!-- Actionable items for future Claude -->
1. [Start by doing X]
2. [Remember that Y is important]
3. [User prefers Z approach]

## Tags
`#topic` `#technology` `#status`
```

### 2. Capture Git State

Run these commands to capture current state:

```bash
# Get current branch
git branch --show-current

# Get last commit
git log -1 --oneline

# Check for uncommitted changes
git status --short

# Get diff stats if there are changes
git diff --stat HEAD 2>/dev/null || echo "No changes"
```

### 3. Append to Session Log

Write the summary to `docs/sessions/logs/{YYYY-MM-DD}.md`, appending if the file exists.

If multiple sessions happen on the same day, append with a `---` separator.

### 4. Update Pattern Cache (Optional)

If you observed significant user behavior patterns, update `docs/sessions/patterns/detected-patterns.json`:

```json
{
  "last_updated": "YYYY-MM-DDTHH:mm:ss",
  "patterns": {
    "autonomy_level": {
      "score": 0.0-1.0,
      "evidence": ["Session quote 1", "Session quote 2"]
    },
    "communication_style": {
      "verbosity": "minimal|standard|detailed",
      "tone": "direct|friendly|formal"
    },
    "frustration_triggers": [
      {"trigger": "description", "count": N, "last_seen": "date"}
    ]
  }
}
```

## Output Format

After completing:

```
## Session Captured

**File**: docs/sessions/logs/{date}.md
**Summary**: {one-line outcome}
**Next Steps**: {key recommendation}

---
Session context saved. Ready for next session.
```

## Important Notes

- Be honest about what failed - this helps future learning
- Capture user frustrations without judgment
- Include specific file paths for easy navigation
- Tag sessions for searchability
- Keep the summary actionable, not just documentary
