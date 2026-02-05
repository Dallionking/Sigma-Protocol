# PRD: Self-Learning Agent System (SLAS)

> **Status**: Draft
> **Author**: Claude Code + Dallion King
> **Created**: 2026-01-31
> **Origin**: Extracted from SigmaVue session optimization work

---

## Executive Summary

A framework for AI coding agents (Claude Code, Cursor, OpenCode, Droid) to **self-learn user preferences** from session history and **automatically generate/optimize** hooks, skills, agents, and rules. This creates a continuous improvement loop where the agent becomes more effective with each session.

**One-liner**: "An agent that learns how you work and optimizes itself accordingly."

---

## Problem Statement

### Current Pain Points

1. **Context Loss**: Every new session starts fresh - Claude doesn't remember your preferences, patterns, or project context
2. **Repetitive Corrections**: Users repeatedly correct the same behaviors ("don't ask, just do it", "use live data", etc.)
3. **Manual Configuration**: Users manually write CLAUDE.md, .cursorrules, skills - tedious and often incomplete
4. **No Learning Loop**: Agents don't improve based on feedback patterns across sessions
5. **Platform Fragmentation**: Different config formats for Claude Code, Cursor, OpenCode, Droid

### What We Built for SigmaVue (Proof of Concept)

| Component | What It Does |
|-----------|--------------|
| Session Distiller | Analyzed 277+ sessions → extracted developer preferences |
| Hook System | Auto-triggers for SessionStart, SessionEnd, UserPromptSubmit, PostToolUseFailure |
| Developer Preferences Skill | Codified communication style, autonomy level, frustration patterns |
| Session Continuity Skill | Context loading, session logging, memory workarounds |
| Optimized CLAUDE.md | Auto-generated from learned preferences |

**Result**: Agent now knows to execute without asking, use live data, spawn sub-agents, etc. - without being told each session.

---

## Proposed Solution: Self-Learning Agent System (SLAS)

### Core Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    SLAS CONTINUOUS LOOP                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   [1] SESSION CAPTURE                                        │
│       └─ SessionEnd hook logs: branch, changes, decisions    │
│                         │                                    │
│                         ▼                                    │
│   [2] SESSION ANALYSIS (periodic or on-demand)               │
│       └─ /session-distill command                           │
│       └─ Analyze N sessions for patterns                     │
│       └─ Extract: preferences, frustrations, corrections     │
│                         │                                    │
│                         ▼                                    │
│   [3] PREFERENCE SYNTHESIS                                   │
│       └─ Generate developer-preferences.md                   │
│       └─ Identify autonomy level, tone, quality bars         │
│       └─ Detect anti-patterns to avoid                       │
│                         │                                    │
│                         ▼                                    │
│   [4] ARTIFACT GENERATION                                    │
│       └─ Create/update hooks (SessionStart, etc.)            │
│       └─ Create/update skills (domain-specific)              │
│       └─ Create/update agents (sub-agents for delegation)    │
│       └─ Create/update rules (path-specific)                 │
│       └─ Optimize CLAUDE.md / .cursorrules                   │
│                         │                                    │
│                         ▼                                    │
│   [5] SESSION START (next session)                           │
│       └─ SessionStart hook loads context                     │
│       └─ Agent operates with learned preferences             │
│       └─ Loop continues...                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Session Capture System

#### A. Basic Hook: `session-end-summary.sh`

Runs at session end, logs metadata only:
- Session ID + timestamp
- Git branch + last commit
- Files changed

**Limitation**: Shell hooks **cannot access conversation content** - they only receive basic session metadata via stdin.

**Output**: `docs/sessions/logs/{date}.md`

```markdown
### Session: abc123 | 2026-01-31T22:58:41Z
**Branch**: `feature/auth`
**Last Commit**: feat: Add OAuth flow
**Changes**:
- src/auth/oauth.ts
- src/auth/callback.ts
```

#### B. Enhanced Exit: `/sigma-exit` Skill (RECOMMENDED)

Since hooks can't access conversation, use an **in-session skill** that generates a comprehensive summary **while Claude still has context**, then writes to the log.

**Command**: `/sigma-exit` (replaces raw `/exit`)

**What it captures** (because Claude has full conversation context):

| Category | Content |
|----------|---------|
| **Executive Summary** | Goal + outcome in 2-3 sentences |
| **Accomplishments** | Concrete tasks completed, files modified |
| **Work In Progress** | Incomplete tasks, next steps |
| **Agents Used** | Which agents were spawned, success/failure |
| **Skills Invoked** | Which `/skill-name` commands were used |
| **What Worked** | Successful patterns, approaches |
| **What Didn't Work** | Issues encountered → how resolved |
| **User Behavior Patterns** | Tone, preferences, frustration markers |
| **Key Decisions** | Architectural choices + rationale |
| **Next Session Context** | What future sessions should know |
| **Git State** | Branch, commit, uncommitted changes |

**Output Format**:

```markdown
---

## Session: fab48946 | 2026-02-01T00:10:50Z

### Executive Summary
User wanted to verify session-end hook was working. Discovered hook works
but only logs git metadata, not conversation content. Designed enhanced
exit workflow with `/sigma-exit` skill.

### Accomplishments
- [x] Investigated session-end hook configuration
- [x] Verified hook IS working (8 sessions logged)
- [x] Created `/sigma-exit` skill for comprehensive logging

### Agents & Skills
**Agents**: None spawned (direct investigation)
**Skills**: None invoked

### Learnings
| Type | Observation | Action |
|------|-------------|--------|
| ✅ Worked | Direct file investigation | Use Read tool for quick checks |
| ❌ Failed | SessionEnd hook content access | Use in-session skill instead |
| 👤 User | Said "lol bet" - casual tone | Match casual but professional |
| 👤 User | Expects session continuity | Always save context at exit |

### Next Session Context
- User wants session summaries for learning continuity
- `/sigma-exit` skill now available
- Use instead of raw `/exit`

### Git Snapshot
- Branch: `dev`
- Commit: `5b843d0d`
- Changes: 282 files modified

---
```

**Implementation**:

```markdown
# .claude/skills/sigma-exit/SKILL.md
---
name: sigma-exit
trigger: /sigma-exit
user_invocable: true
---

When invoked:
1. Claude reflects on entire session (has full context)
2. Generates structured summary per template
3. Appends to docs/sessions/logs/{date}.md
4. Confirms save and prompts user to /exit
```

**Why This Works**:
- Hook limitation: Can only access metadata (session_id, basic info)
- Skill advantage: Claude generates summary WHILE it has conversation context
- Result: Rich, learning-focused session logs for continuity

---

### 2. Session Distillation Command

**Command: `/session-distill`**

Analyzes session history and extracts patterns:

```bash
/session-distill --sessions=50 --output=.claude/skills/developer-preferences/
```

**Analysis Categories:**

| Category | What to Extract |
|----------|-----------------|
| **Communication Style** | Tone, verbosity, input style (voice vs typed) |
| **Autonomy Level** | When to ask vs execute, confirmation patterns |
| **Quality Standards** | Code style, testing requirements, documentation |
| **Frustration Patterns** | Repeated corrections, explicit complaints |
| **Domain Expertise** | Which topics need more/less explanation |
| **Tool Preferences** | Preferred MCPs, agents, workflows |

**Output**:
- `developer-preferences/SKILL.md` - Codified preferences
- `session-continuity/SKILL.md` - Context management rules
- Recommendations for hooks, agents, rules

---

### 3. Hook System

| Hook | Trigger | Purpose |
|------|---------|---------|
| `SessionStart` | Session begins | Load context, recent commits, project state |
| `SessionEnd` | Session ends | Log session summary for continuity |
| `UserPromptSubmit` | Every user message | Reminders, countdowns, focus enforcement |
| `PostToolUseFailure` | Tool fails | Loop detection, approach change guidance |
| `PreToolUse` | Before tool runs | Validation rules (no hardcoded data, etc.) |

**Configuration**: `.claude/settings.local.json` or equivalent

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{ "type": "command", "command": ".sss/hooks/session-start.sh" }]
    }],
    "SessionEnd": [{
      "hooks": [{ "type": "command", "command": ".sss/hooks/session-end.sh" }]
    }]
  }
}
```

---

### 4. Artifact Generation

Based on session analysis, auto-generate:

#### A. Skills (Domain Knowledge)

```
.claude/skills/
├── developer-preferences/SKILL.md   # Communication + autonomy rules
├── session-continuity/SKILL.md      # Memory workarounds
├── {domain}-patterns/SKILL.md       # Project-specific patterns
```

#### B. Agents (Sub-agents for Delegation)

```
.claude/agents/
├── {project}-executor.md    # Implementation agent
├── {project}-reviewer.md    # Code review agent
├── {project}-researcher.md  # Research agent
```

#### C. Hooks (Automated Triggers)

```
.claude/hooks/
├── session-start-context.sh    # Load project context
├── session-end-summary.sh      # Log session
├── ship-reminder.sh            # Focus enforcement (optional)
├── loop-detector.sh            # Prevent retry loops
├── validate-{rule}.sh          # Custom validation
```

#### D. Rules (Path-Specific)

```
.claude/rules/
├── live-data-only.md           # Block hardcoded dates in trading/
├── api-patterns.md             # API conventions in api/
├── frontend-conventions.md     # React patterns in *.tsx
```

#### E. Platform Config

| Platform | Config File |
|----------|-------------|
| Claude Code | `CLAUDE.md` + `.claude/settings.local.json` |
| Cursor | `.cursorrules` + `.cursor/rules/` |
| OpenCode | `AGENTS.md` + `.opencode/` |
| Droid | `.factory/droids/` |

---

## Installation Flow

### For New Projects

```bash
# 1. Install SSS-Protocol
npx sss-protocol init

# 2. Run initial session analysis (if history exists)
/session-distill --bootstrap

# 3. Review generated artifacts
# - .claude/skills/developer-preferences/
# - .claude/hooks/
# - CLAUDE.md (or .cursorrules)

# 4. Start working - system learns as you go
```

### For Existing Projects

```bash
# 1. Point to existing session transcripts
/session-distill --transcripts=~/.claude/projects/{project}/*.jsonl --sessions=100

# 2. Generate optimized config
# System analyzes patterns and creates:
# - Hooks for context loading
# - Skills for learned preferences
# - Rules for project conventions

# 3. Review and activate
```

---

## Key Features

### 1. Preference Learning

**Input**: Raw session transcripts
**Output**: Structured preference profile

```yaml
# developer-preferences/SKILL.md
autonomy_level: maximum
communication:
  tone: direct
  verbosity: minimal
  input_style: voice_transcription
quality:
  code_style: strict_typescript
  testing: required_for_changes
  documentation: minimal_unless_asked
frustration_triggers:
  - repeated_confirmation_requests
  - over_explanation
  - not_following_rules
```

### 2. Context Continuity

**Problem**: Claude forgets everything between sessions
**Solution**: SessionStart hook injects:
- Recent commits
- Current branch
- Uncommitted changes
- In-progress work items
- Key reminders from preferences

### 3. Focus Enforcement

**Problem**: Scope creep, feature drift
**Solution**: UserPromptSubmit hook can inject:
- Ship countdown ("14 days to launch")
- Current sprint goals
- "Focus on PRDs only" reminders

### 4. Loop Prevention

**Problem**: Agent retries failing approach indefinitely
**Solution**: PostToolUseFailure hook:
- Tracks consecutive failures
- After N failures, injects "CHANGE APPROACH" guidance
- Forces pivot instead of endless retry

### 5. Rule Enforcement

**Problem**: Agent violates project conventions (hardcoded dates, etc.)
**Solution**: PreToolUse hooks validate before execution:
- Block hardcoded dates in trading code
- Enforce API naming conventions
- Require tests for certain paths

### 6. Session Exit with Learning (NEW)

**Problem**: Sessions end without capturing what was learned
**Solution**: `/sigma-exit` skill that captures before context is lost:

```
┌─────────────────────────────────────────────────────────────┐
│                    SESSION EXIT FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   User: /sigma-exit                                          │
│            │                                                 │
│            ▼                                                 │
│   [Claude has full conversation context]                     │
│            │                                                 │
│            ▼                                                 │
│   Generate Summary:                                          │
│   ├─ Executive summary (what was accomplished)               │
│   ├─ Agents/skills used                                      │
│   ├─ What worked / what failed → learnings                   │
│   ├─ User behavior patterns observed                         │
│   ├─ Key decisions made                                      │
│   ├─ Recommendations for next session                        │
│   └─ Git state snapshot                                      │
│            │                                                 │
│            ▼                                                 │
│   Write to: docs/sessions/logs/{date}.md                     │
│            │                                                 │
│            ▼                                                 │
│   User: /exit (normal exit)                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Insight**: Shell hooks (SessionEnd) only receive metadata - they can't access conversation content. The skill runs BEFORE exit while Claude still has context.

**Learning Categories Captured**:

| Category | Example | Purpose |
|----------|---------|---------|
| ✅ What Worked | "Direct file reads for investigation" | Replicate in future |
| ❌ What Failed | "Hook can't access conversation" | Avoid in future |
| 👤 User Patterns | "Casual tone, expects autonomy" | Adapt behavior |
| 🎯 Decisions | "Chose skill over hook for richness" | Preserve rationale |
| 🔧 Agents Used | `sigma-executor`, `sigma-quant` | Track delegation |
| 📦 Skills Invoked | `/trading-strategies`, `/api-endpoints` | Track domain usage |

---

## Platform Adapters

### Claude Code

```
.claude/
├── settings.local.json    # Hook configuration
├── hooks/                 # Shell scripts
├── skills/                # SKILL.md files
├── agents/                # Agent .md files
├── rules/                 # Path-specific rules
CLAUDE.md                  # Main instruction file
```

### Cursor

```
.cursor/
├── rules/                 # .mdc rule files
.cursorrules               # Main instruction file (equivalent to CLAUDE.md)
```

### OpenCode / Droid

```
.factory/
├── droids/               # YAML droid definitions
├── skills/               # Skill definitions
├── commands/             # Slash commands
AGENTS.md                 # Main instruction file
```

---

## Success Metrics

| Metric | Before SLAS | After SLAS |
|--------|-------------|------------|
| Repeated corrections per session | 5-10 | < 2 |
| Context re-explanation | Every session | Never (auto-loaded) |
| Time to productive state | 5-10 min | < 30 sec |
| Rule violations | Frequent | Rare (hooks block) |
| Agent autonomy alignment | Manual tuning | Auto-learned |

---

## Implementation Phases

### Phase 1: Core Infrastructure
- [x] Session logging hook (`session-end-summary.sh`) ✅ Implemented
- [x] Session loading hook (`session-start-context.sh`) ✅ Implemented
- [x] **Session exit skill (`/sigma-exit`)** ✅ NEW - Comprehensive learning capture
- [ ] Basic preference extraction from transcripts
- [ ] CLAUDE.md generator

### Phase 1.5: Session Exit with Learning (NEW - Implemented in SigmaVue)
- [x] `/sigma-exit` skill creation
- [x] Summary template with learning categories
- [x] Append to daily log file (`docs/sessions/logs/{date}.md`)
- [x] Skills/agents usage tracking
- [x] User behavior pattern capture
- [x] What worked / what failed analysis
- [x] Next session recommendations

### Phase 2: Distillation Engine
- [ ] `/session-distill` command
- [ ] Pattern recognition for preferences
- [ ] Frustration pattern detection
- [ ] Autonomy level classification

### Phase 3: Artifact Generation
- [ ] Skill generator (from preferences)
- [ ] Hook generator (from patterns)
- [ ] Rule generator (from corrections)
- [ ] Agent generator (from delegation patterns)

### Phase 4: Platform Adapters
- [ ] Claude Code adapter (primary)
- [ ] Cursor adapter (.cursorrules)
- [ ] OpenCode adapter
- [ ] Droid adapter

### Phase 5: Continuous Learning
- [ ] Incremental learning (update on each session)
- [ ] A/B testing of generated artifacts
- [ ] Feedback loop for artifact effectiveness

---

## Example: What We Built for SigmaVue

### Session Analysis Output

From 277+ sessions, we extracted:

```markdown
## Developer Profile: Dallion

### Communication
- Input: Voice transcription (natural speech patterns)
- Tone: Direct, no pleasantries
- Feedback: Quick ("No"/"Good"), expects immediate adjustment

### Autonomy: Maximum
- Execute without asking
- Only ask before: major architecture, new dependencies, breaking changes

### Anti-Patterns Detected
- "Would you like me to...?" → NEVER SAY THIS
- Long explanations before action → SKIP
- Waiting for confirmation on routine tasks → JUST DO IT

### Quality Standards
- TypeScript strict mode
- Type hints on all Python
- Live data only (no hardcoded dates/mock data)
- Risk checks before trade execution
```

### Generated Artifacts

| Artifact | Purpose |
|----------|---------|
| `developer-preferences/SKILL.md` | Full preference codification |
| `session-continuity/SKILL.md` | Memory workarounds |
| **`sigma-exit/SKILL.md`** | **Session exit with comprehensive learning capture** (NEW) |
| `session-start-context.sh` | Load branch, commits, PRDs |
| `session-end-summary.sh` | Log basic session metadata |
| `ship-reminder.sh` | "14 days to ship" on every prompt |
| `loop-detector.sh` | Warn after 3 consecutive failures |
| `validate-no-hardcoded-dates.sh` | Block hardcoded dates |
| Optimized CLAUDE.md | 37.9k chars, all key rules |

### Session Exit Learning Flow (NEW)

```
User: /sigma-exit

Claude generates (while it still has context):
┌─────────────────────────────────────────────────────────┐
│ ## Session: 8e794265 | 2026-02-01T00:30:00Z            │
│                                                         │
│ ### Executive Summary                                   │
│ Implemented session-exit skill for cross-session        │
│ learning. SessionEnd hooks can't access conversation,   │
│ so we use in-session skill to capture learnings.        │
│                                                         │
│ ### Accomplishments                                     │
│ - [x] Created /sigma-exit skill                         │
│ - [x] Updated PRD-SELF-LEARNING-AGENT-SYSTEM.md         │
│                                                         │
│ ### Agents & Skills                                     │
│ **Agents**: None (direct implementation)                │
│ **Skills**: None invoked                                │
│                                                         │
│ ### Learnings                                           │
│ | Type | Observation           | Action               │
│ |------|----------------------|----------------------|
│ | ✅   | In-session capture   | Use skill not hook   │
│ | 👤   | Quick feedback style | Keep responses brief │
│                                                         │
│ ### Next Session Context                                │
│ - /sigma-exit now available                             │
│ - Update SSS-Protocol to use same pattern               │
└─────────────────────────────────────────────────────────┘

Saved to: docs/sessions/logs/2026-02-01.md
```

---

## Open Questions

1. **Privacy**: How to handle sensitive info in session transcripts?
2. **Sharing**: Can preference profiles be shared across projects?
3. **Versioning**: How to handle preference drift over time?
4. **Conflicts**: What if learned preferences conflict with project rules?
5. **Onboarding**: How to bootstrap for new users with no history?

---

## Related Work

- Claude Code native hooks (12 types available)
- Cursor rules system (.cursorrules, .mdc)
- OpenCode/Droid factory system
- mem0 / memgpt (external memory systems)
- SSS-Protocol methodology (this project)

---

## Next Steps

1. Review this PRD in SSS-Protocol repo
2. Implement Phase 1 (core hooks) as part of `sss-protocol init`
3. Build `/session-distill` command
4. Test on 2-3 different projects
5. Document patterns for artifact generation

---

**Document Version**: 1.1.0
**Last Updated**: 2026-02-01
**Origin Project**: SigmaVue-Mono (proof of concept implementation)
**New in 1.1.0**: Added `/sigma-exit` skill for comprehensive session exit with learning capture
