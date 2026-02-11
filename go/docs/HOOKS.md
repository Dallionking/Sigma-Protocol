# Hook Management

## Overview

Hooks are shell/Python scripts that execute at specific Claude Code lifecycle events. The Go CLI manages hook installation and registration, but hooks remain as editable scripts.

Hooks provide integration points for:
- Environment validation (SessionStart)
- File validation (PostToolUse)
- Session context management (SLAS)
- Team coordination (SubagentStart, TeammateIdle)
- Custom workflows and automation

## Hook Directory Structure

```
.claude/hooks/
├── setup-check.sh              # Root-level hooks
├── ralph-skill-enforcement.sh
├── greptile-pr-hook.sh
├── task-completed-handler.sh
├── teammate-idle-handler.sh
├── orchestrator-stop.sh
├── team-iterm-launcher.sh
├── team-pane-watcher.sh
├── validators/                 # Validation hooks
│   ├── validate-file.sh
│   ├── ui-validation.sh
│   ├── typescript-validator.sh
│   ├── design-tokens-validator.sh
│   ├── csv-validator.sh
│   ├── prd-validator.sh
│   └── bdd-validator.sh
├── slas/                       # SLAS session hooks
│   ├── session-start-context.sh
│   ├── session-end-summary.sh
│   └── lib/
│       └── session-utils.sh
└── lib/                        # Helper libraries (not hooks)
    └── iterm-applescript-helpers.sh
```

## Hook Events

| Event | Trigger | Use Case | Example Hooks |
|-------|---------|----------|---------------|
| `SessionStart` | Claude Code session starts | Environment setup, SLAS context injection | setup-check.sh, session-start-context.sh |
| `SessionEnd` | Claude Code session ends | Session metadata logging | session-end-summary.sh |
| `PreToolUse` | Before tool execution | Skill routing enforcement | ralph-skill-enforcement.sh |
| `PostToolUse` | After tool execution | File validation, PR review trigger | validate-file.sh, greptile-pr-hook.sh |
| `Stop` | User stops agent | Orchestrator cleanup | orchestrator-stop.sh |
| `SubagentStart` | Subagent spawns | iTerm2 pane creation | team-iterm-launcher.sh |
| `TaskCompleted` | Task marked done | Unblocking dependent tasks | task-completed-handler.sh |
| `TeammateIdle` | Teammate idle timeout | Team coordination | teammate-idle-handler.sh |

## Hook Metadata Format

Hooks can include structured metadata in header comments:

```bash
#!/bin/bash
# ============================
# Event: SessionStart
# Required: true
# Matcher: Edit|Write
# Description: Verifies environment and dependencies are ready
# ============================

# Hook implementation here
```

### Metadata Fields

- **Event**: Hook event type (SessionStart, PostToolUse, etc.)
- **Required**: Whether this hook must exist for installation to succeed
- **Matcher**: Optional glob pattern for conditional execution (e.g., `Edit|Write`, `*.tsx`)
- **Description**: Human-readable purpose of the hook

If metadata is not provided, the CLI will infer the event type from the filename and directory location.

## Installation

### Install All Hooks

```bash
sigma install --hooks-only
```

This will:
1. Discover all hooks in `.claude/hooks/`
2. Copy hooks to `.claude/hooks/` with executable permissions
3. Generate `settings.json` with hook entries
4. Validate hook installation

### Platform-Specific Installation

The CLI automatically detects which platforms are present and registers hooks accordingly:

- **Claude Code**: Updates `.claude/settings.json`
- **Codex**: Updates `platforms/codex/config.toml`
- **Factory Droid**: Updates `.factory/config.yaml`

## Validation

### Check Hook Installation

```bash
sigma doctor --hooks
```

This validates:
- Hook files exist
- Hooks have executable permissions (0755)
- Hooks have valid shebangs
- Hook syntax is valid (bash -n for .sh, py_compile for .py)

### Auto-Fix Common Issues

```bash
sigma doctor --hooks --fix
```

Automatically repairs:
- Missing executable permissions (chmod +x)
- Other common configuration issues

## Adding a New Hook

### Step 1: Create Hook Script

Create your hook in the appropriate directory:
- Root-level: `.claude/hooks/`
- Validators: `.claude/hooks/validators/`
- SLAS: `.claude/hooks/slas/`

```bash
touch .claude/hooks/my-hook.sh
chmod +x .claude/hooks/my-hook.sh
```

### Step 2: Add Metadata Header

```bash
#!/bin/bash
# ============================
# Event: PostToolUse
# Required: false
# Matcher: *.ts
# Description: Custom TypeScript validation
# ============================

# Your hook logic here
FILE_PATH="$1"
echo "Validating $FILE_PATH"
```

### Step 3: Test Locally

```bash
bash .claude/hooks/my-hook.sh /path/to/test.ts
```

### Step 4: Install Hook

```bash
sigma install --hooks-only
```

### Step 5: Validate

```bash
sigma doctor --hooks
```

## Hook Development Guidelines

### Best Practices

1. **Always include a shebang**: `#!/bin/bash` or `#!/usr/bin/env python3`
2. **Use explicit paths**: Reference `$CLAUDE_PROJECT_DIR` for project files
3. **Exit codes matter**:
   - Exit 0: Hook succeeded
   - Exit non-zero: Hook failed (blocks operation if Required: true)
4. **Logging**: Write to stderr for errors, stdout for info
5. **Performance**: Keep hooks fast (< 100ms ideal, < 500ms acceptable)

### Environment Variables

Hooks have access to:
- `$CLAUDE_PROJECT_DIR`: Project root directory
- `$CLAUDE_FILE_PATH`: File path (for PostToolUse hooks)
- `$CLAUDE_TOOL_NAME`: Tool name (for PreToolUse/PostToolUse hooks)

### Matcher Patterns

For conditional hooks (PostToolUse):
- `Edit|Write`: Only trigger for Edit or Write tools
- `*.tsx`: Only trigger for TypeScript React files
- `*.{ts,tsx}`: Multiple extensions

## Troubleshooting

### Hook Not Executing

**Symptom**: Hook doesn't run when expected

**Diagnosis**:
```bash
sigma doctor --hooks
```

**Common Causes**:
1. Hook not registered in `settings.json`
   - **Fix**: Run `sigma install --hooks-only`
2. Missing executable permissions
   - **Fix**: Run `sigma doctor --hooks --fix` or `chmod +x <hook>`
3. Wrong event type
   - **Fix**: Update metadata header or filename

### Syntax Error

**Symptom**: Hook fails with syntax error

**Diagnosis**:
```bash
bash -n .claude/hooks/my-hook.sh
```

**Common Causes**:
1. Missing shebang
   - **Fix**: Add `#!/bin/bash` as first line
2. Shell syntax error
   - **Fix**: Check with shellcheck: `shellcheck <hook>`
3. Wrong interpreter
   - **Fix**: Ensure shebang matches script language

### Permission Denied

**Symptom**: Hook execution fails with "Permission denied"

**Diagnosis**:
```bash
ls -l .claude/hooks/my-hook.sh
```

**Fix**:
```bash
chmod +x .claude/hooks/my-hook.sh
sigma install --hooks-only
```

### Hook Runs Too Slowly

**Symptom**: Claude Code UI feels sluggish

**Diagnosis**:
Add timing to your hook:
```bash
#!/bin/bash
START_TIME=$(date +%s%N)
# ... your hook logic ...
END_TIME=$(date +%s%N)
ELAPSED=$((($END_TIME - $START_TIME) / 1000000))
echo "Hook took ${ELAPSED}ms" >&2
```

**Optimization Tips**:
1. Cache expensive operations
2. Run long operations in background (`&`)
3. Use `PreToolUse` instead of `PostToolUse` for non-blocking work
4. Consider moving logic to scheduled tasks instead of hooks

## Platform-Specific Notes

### Claude Code (JSON)

Hooks registered in `.claude/settings.json`:
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/setup-check.sh\""
          }
        ]
      }
    ]
  }
}
```

### Codex (TOML)

Hooks registered in `platforms/codex/config.toml`:
```toml
[[hooks]]
event = "SessionStart"
script = ".claude/hooks/setup-check.sh"
required = true
```

### Factory Droid (YAML)

Hooks registered in `.factory/config.yaml`:
```yaml
hooks:
  - event: SessionStart
    script: .claude/hooks/setup-check.sh
    required: true
```

## Advanced: Conditional Hooks

For hooks that should only run on specific file types or tools:

### File Type Matchers

```bash
# ============================
# Event: PostToolUse
# Matcher: *.{ts,tsx}
# ============================
```

Registered in settings.json as:
```json
{
  "matcher": "*.{ts,tsx}",
  "hooks": [...]
}
```

### Tool Name Matchers

```bash
# ============================
# Event: PostToolUse
# Matcher: Edit|Write
# ============================
```

Only triggers after Edit or Write tool use.

## Example Hooks

### Environment Validation (SessionStart)

```bash
#!/bin/bash
# ============================
# Event: SessionStart
# Required: true
# Description: Verify required tools are installed
# ============================

REQUIRED_TOOLS=("git" "node" "npm")

for tool in "${REQUIRED_TOOLS[@]}"; do
  if ! command -v "$tool" &> /dev/null; then
    echo "Error: Required tool '$tool' not found" >&2
    exit 1
  fi
done

echo "✓ Environment validated"
exit 0
```

### File Validation (PostToolUse)

```bash
#!/bin/bash
# ============================
# Event: PostToolUse
# Matcher: Edit|Write
# Description: Run linter on modified files
# ============================

FILE_PATH="$1"

# Skip if not a TypeScript file
if [[ ! "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

# Run ESLint
if ! npx eslint "$FILE_PATH" 2>&1; then
  echo "Warning: ESLint found issues in $FILE_PATH" >&2
  # Don't fail the operation, just warn
  exit 0
fi
```

### Session Summary (SessionEnd)

```bash
#!/bin/bash
# ============================
# Event: SessionEnd
# Description: Log session metadata for SLAS
# ============================

SESSION_LOG="$CLAUDE_PROJECT_DIR/.claude/sessions/$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$(dirname "$SESSION_LOG")"

echo "Session ended at $(date)" >> "$SESSION_LOG"
echo "Duration: $CLAUDE_SESSION_DURATION" >> "$SESSION_LOG"
echo "Commands: $CLAUDE_COMMAND_COUNT" >> "$SESSION_LOG"
```

## FAQ

### Q: Can hooks modify files?

**A**: Yes, but be careful. PostToolUse hooks can modify files, but this may interfere with Claude Code's file tracking. Prefer validation/reporting over modification.

### Q: Can hooks call other tools?

**A**: Yes. Hooks can invoke any CLI tool or script. Use `command -v` to check tool availability first.

### Q: How do I debug a hook?

**A**:
1. Add `set -x` after shebang to trace execution
2. Write debug output to a log file
3. Test hook independently: `bash .claude/hooks/my-hook.sh`

### Q: Can I disable a specific hook?

**A**: Yes. Either:
1. Remove hook from `.claude/hooks/` and run `sigma install --hooks-only`
2. Manually edit `settings.json` to remove the hook entry

### Q: Do hooks work in subagents?

**A**: Yes. Each subagent inherits the hook configuration. Use `SubagentStart` event to set up per-subagent state.

## Further Reading

- [Claude Code Hooks Documentation](https://docs.anthropic.com/claude-code/hooks)
- [Sigma Protocol Workflow](../WORKFLOW-OVERVIEW.md)
- [SLAS System](../.claude/rules/slas-system.md)

---

For questions or issues, run `sigma doctor --hooks` or open an issue on GitHub.
