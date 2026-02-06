# Sigma Protocol - Self-Learning Agent System (SLAS)

SLAS enables AI agents to learn from session history and adapt to developer preferences.

## SLAS Commands

| Command | Description |
|---------|-------------|
| `/sigma-exit` | Capture rich session context before ending |
| `/session-distill` | Analyze session history for patterns |
| `sigma slas init` | Initialize SLAS in project |
| `sigma slas bootstrap` | Learn from existing sessions |
| `sigma slas distill` | Run pattern distillation |
| `sigma slas status` | Check SLAS health |
| `sigma slas sync` | Sync to all platforms |

## SLAS Session Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `session-start-context.sh` | SessionStart | Inject preferences + recent context |
| `session-end-summary.sh` | SessionEnd | Log session metadata |

## SLAS Workflow

```
1. Session Start -> Inject developer preferences
2. Work Session -> Normal development
3. Session End -> Run /sigma-exit for rich capture
4. Periodically -> Run sigma slas distill to update preferences
```

## SLAS Directory Structure

```
.claude/hooks/slas/           # Session hooks
.claude/skills/developer-preferences/  # Auto-generated preferences
docs/sessions/logs/           # Session summaries
docs/sessions/preferences/    # Developer profile
docs/sessions/patterns/       # Pattern cache
```

## Auto-Generated Artifacts

SLAS generates:
- **Developer Preferences Skill**: Communication style, autonomy level
- **Platform Rules**: Cursor rules, OpenCode hooks
- **CLAUDE.md Section**: Injected preferences summary
- **Hook Recommendations**: Based on frustration patterns
