# Specialized Self-Validating Agents

**Skill for building agents that automatically validate and fix their own output.**

## Overview

This skill teaches the **Closed Loop Prompt** pattern - a technique for injecting deterministic validation into probabilistic LLM workflows. When an agent edits a file, PostToolUse hooks immediately validate the output and provide structured feedback for auto-correction.

### Core Concept

```
Traditional Flow (Slow, Manual):
Agent edits file → Marks complete → Later review → Finds errors → Manual fix

Closed Loop Flow (Fast, Automatic):
Agent edits file → Hook validates → Sees errors → Auto-fixes → Re-validates → Pass
```

**Key Insight:** Run validators DURING editing, not just AFTER completion.

---

## How PostToolUse Hooks Work

### Hook Configuration

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/validators/prd-validator.py\" \"$CLAUDE_FILE_PATH\"",
            "condition": {
              "glob": "**/prds/*.md"
            }
          }
        ]
      }
    ]
  }
}
```

### Execution Flow

1. **Agent uses Edit/Write tool** on a file matching the glob pattern
2. **Hook executes validator** with the file path as argument
3. **Validator returns JSON** with status, errors, and instructions
4. **Agent receives feedback** in the same conversation turn
5. **Agent auto-corrects** if validation failed
6. **Loop repeats** until validation passes

---

## Validator Output Contract

All validators return JSON with this structure:

```json
{
  "status": "pass|fail|warning|skip|error",
  "file_path": "/path/to/file",
  "errors": [
    {
      "line": 45,
      "severity": "error",
      "code": "MISSING_SECTION",
      "message": "Missing Section 2: Problem Space",
      "fix_suggestion": "Add ## Section 2: Problem Space"
    }
  ],
  "warnings": [...],
  "summary": {
    "total_errors": 1,
    "total_warnings": 0
  },
  "agent_instruction": "VALIDATION FAILED: 1 error(s) in file.md\n\nFIX these errors NOW..."
}
```

### Key Fields

| Field | Purpose |
|-------|---------|
| `status` | pass/fail/warning/skip/error |
| `errors[]` | List of issues with line numbers and fixes |
| `agent_instruction` | Direct instruction for the agent to follow |
| `fix_suggestion` | Specific fix for each error |

---

## Available Validators

### PRD Validator (`prd-validator.py`)

**Triggers:** `**/prds/*.md`

**Checks:**
- Required sections (Metadata, Problem Space, User Stories, BDD Scenarios)
- Given/When/Then BDD structure
- Red flags (TODO, TBD, FIXME, placeholders)
- YAML frontmatter fields
- Acceptance criteria presence

### TypeScript Validator (`typescript-validator.sh`)

**Triggers:** `**/*.{ts,tsx}`

**Checks:**
- ESLint errors (if available)
- TypeScript compilation errors (if available)
- console.log in production code
- @ts-ignore without justification
- eslint-disable without justification
- Hardcoded secrets

### Design Tokens Validator (`design-tokens-validator.py`)

**Triggers:** `**/*token*.json`, `**/*theme*.json`

**Checks:**
- Valid JSON syntax
- Required categories (colors, typography, spacing)
- Color format validation (hex, rgb, hsl, oklch)
- Token naming conventions
- Duplicate color detection

### BDD Validator (`bdd-validator.py`)

**Triggers:** `**/*.feature`, `**/prds/*.md` (BDD sections)

**Checks:**
- Gherkin syntax (Feature, Scenario, Given/When/Then)
- Step order (Given → When → Then)
- Vague step detection
- Implementation details in steps (anti-pattern)
- Duplicate scenario names

---

## Agent Behavior Guidelines

### When Validation Fails

1. **Read the `agent_instruction`** - it tells you exactly what to do
2. **Fix ALL listed errors** - don't leave any for later
3. **Use the `fix_suggestion`** - it provides the specific fix
4. **Re-edit the file** - the hook will re-validate automatically
5. **Repeat until pass** - don't mark complete until validation passes

### Retry Limits

If validation fails repeatedly (>3 attempts):
1. Report the issue to the user
2. Include the validator output
3. Ask for guidance or manual intervention
4. Don't get stuck in an infinite loop

### Anti-Patterns to Avoid

❌ **Ignoring validation errors** - Never proceed with incomplete fixes
❌ **Random fixes** - Use the `fix_suggestion`, don't guess
❌ **Bypassing validators** - Don't edit files to avoid validation
❌ **Partial fixes** - Fix ALL errors, not just some
❌ **Infinite loops** - Escalate after 3 failed attempts

---

## Creating Custom Validators

### Template

```python
#!/usr/bin/env python3
"""Custom Validator Template"""

import sys
import json
from pathlib import Path

def validate(file_path: str) -> dict:
    errors = []
    warnings = []

    content = Path(file_path).read_text()

    # Add your validation logic here
    if "BAD_PATTERN" in content:
        errors.append({
            "line": 0,
            "severity": "error",
            "code": "BAD_PATTERN",
            "message": "Found bad pattern",
            "fix_suggestion": "Replace with good pattern"
        })

    status = "pass" if not errors else "fail"

    return {
        "status": status,
        "file_path": file_path,
        "errors": errors,
        "warnings": warnings,
        "agent_instruction": "..." if errors else "VALIDATION PASSED"
    }

if __name__ == "__main__":
    result = validate(sys.argv[1])
    print(json.dumps(result, indent=2))
    sys.exit(0 if result["status"] == "pass" else 1)
```

### Registration

Add to `.claude/settings.json`:

```json
{
  "matcher": "Edit|Write",
  "hooks": [
    {
      "type": "command",
      "command": "python3 \"$CLAUDE_PROJECT_DIR/.claude/hooks/validators/my-validator.py\" \"$CLAUDE_FILE_PATH\"",
      "condition": {
        "glob": "**/*.my-extension"
      }
    }
  ]
}
```

---

## Benefits

### Trust Through Determinism

- Validation logic is deterministic (code, not LLM)
- Same input always produces same validation result
- No hallucinated "looks good to me" passes

### Speed Through Immediacy

- Errors caught in the same session
- No context switch between editing and review
- Fix while the context is fresh

### Scalability Through Parallelism

- Fork workers self-validate independently
- No bottleneck on review cycles
- Orchestrator only reviews passing work

### Focus Through Specialization

- PRD validator knows PRD structure
- TypeScript validator knows code quality
- Each validator is an expert in its domain

---

## Integration with Sigma Protocol

### Step 11 (PRD Generation)

When generating PRDs, the `prd-validator.py` automatically validates:
- All required sections present
- BDD scenarios have Given/When/Then
- No TODOs or placeholders remain

### Step 6 (Design System)

When creating design tokens, `design-tokens-validator.py` validates:
- Valid color formats
- Consistent naming conventions
- Required categories exist

### Fork Workers

Fork workers use Stop hooks to validate completion:
- Run `@gap-analysis` before marking complete
- Ensure quality gate threshold met
- Report structured completion status

---

## Troubleshooting

### Validator Not Running

1. Check glob pattern matches the file path
2. Verify validator script is executable (`chmod +x`)
3. Check for syntax errors in settings.json
4. Ensure Python 3 is available

### Agent Ignoring Errors

1. Check `agent_instruction` field is set
2. Make instructions explicit and actionable
3. Include specific line numbers and fixes
4. Test manually to verify output format

### Infinite Loop

1. Validator may be too strict
2. Check for conflicting requirements
3. Add escape hatch after N retries
4. Consider adding warning vs error severity

---

## Quick Reference

```bash
# Install validators
npx sigma-protocol install-validators

# Test a validator manually
python3 .claude/hooks/validators/prd-validator.py docs/prds/F1.md

# Check hook configuration
cat .claude/settings.json | jq '.hooks.PostToolUse'
```
