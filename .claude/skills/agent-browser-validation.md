---
name: agent-browser-validation
description: "UI validation using Vercel Agent Browser CLI. Use for visual verification of components, Ralph Loop acceptance criteria, and lightweight browser testing. Triggers: ui-validation, agent-browser, visual check, render test, ralph validation."
version: "1.0.0"
triggers:
  - ui-validation
  - agent-browser
  - visual check
  - render test
  - ralph validation
  - browser test
  - component validation
---

# Agent Browser Validation Skill

Lightweight, context-efficient UI validation using the Vercel Agent Browser CLI. Designed specifically for Ralph Loop autonomous implementation where token efficiency is critical.

## Why Agent Browser?

- **93% less context** than Playwright MCP (ref-based vs full DOM)
- **CLI-native** - works with any terminal-based AI agent
- **Session isolation** - parallel testing with isolated browser instances
- **Fast startup** - no heavy browser automation framework

---

## Installation

```bash
npm install -g agent-browser
```

**Verify installation:**
```bash
agent-browser --version
```

---

## Core Commands

### Open URL

```bash
agent-browser open http://localhost:3000/route
```

Opens the specified URL in the browser session.

### Get Interactive Elements (Returns @refs)

```bash
agent-browser snapshot -i
```

Returns a list of interactive elements with reference IDs:
```
@e1: button "Sign In"
@e2: input "Email" type="email"
@e3: input "Password" type="password"
@e4: button "Submit"
@e5: link "Forgot Password"
```

### Interact with Elements

```bash
# Click by reference
agent-browser click @e1

# Fill input field
agent-browser fill @e2 "test@example.com"

# Select from dropdown
agent-browser select @e4 "option-value"

# Press key
agent-browser press Enter
```

### Take Screenshot

```bash
agent-browser screenshot validation-[feature].png
```

### Session Management (Isolated)

```bash
# Create isolated session
agent-browser session create feature-test

# Use session
agent-browser session use feature-test

# List sessions
agent-browser session list

# Destroy session
agent-browser session destroy feature-test
```

---

## Ralph Loop Validation Patterns

### Pattern 1: Basic Page Render Check

```bash
#!/bin/bash
# Validates that a page renders without errors

ROUTE="$1"  # e.g., /dashboard

# Open the route
agent-browser open "http://localhost:3000${ROUTE}"

# Get snapshot
SNAPSHOT=$(agent-browser snapshot -i 2>&1)

# Check for error indicators
if echo "$SNAPSHOT" | grep -qi "error\|exception\|500\|404"; then
  echo "RALPH_UI_VALIDATION_FAILED: Error detected on page"
  exit 1
fi

# Check page has interactive elements (not blank)
ELEMENT_COUNT=$(echo "$SNAPSHOT" | grep -c "^@e")
if [ "$ELEMENT_COUNT" -lt 1 ]; then
  echo "RALPH_UI_VALIDATION_FAILED: No interactive elements found"
  exit 1
fi

echo "RALPH_UI_VALIDATION_PASSED: $ELEMENT_COUNT elements found"
exit 0
```

### Pattern 2: Component Verification

```bash
#!/bin/bash
# Validates specific component exists and is interactive

ROUTE="$1"         # e.g., /settings
EXPECTED_TEXT="$2" # e.g., "Save Changes"

agent-browser open "http://localhost:3000${ROUTE}"
SNAPSHOT=$(agent-browser snapshot -i 2>&1)

if echo "$SNAPSHOT" | grep -qi "$EXPECTED_TEXT"; then
  echo "RALPH_UI_VALIDATION_PASSED: Found '$EXPECTED_TEXT'"
  exit 0
else
  echo "RALPH_UI_VALIDATION_FAILED: '$EXPECTED_TEXT' not found"
  exit 1
fi
```

### Pattern 3: Form Interaction Test

```bash
#!/bin/bash
# Tests form fill and submit flow

ROUTE="$1"

# Open page
agent-browser open "http://localhost:3000${ROUTE}"

# Fill form fields
agent-browser fill @e1 "Test User"
agent-browser fill @e2 "test@example.com"

# Submit
agent-browser click @e3

# Wait for response
sleep 2

# Verify success (check for success message or redirect)
SNAPSHOT=$(agent-browser snapshot -i 2>&1)

if echo "$SNAPSHOT" | grep -qi "success\|saved\|created"; then
  echo "RALPH_UI_VALIDATION_PASSED: Form submitted successfully"
  exit 0
else
  echo "RALPH_UI_VALIDATION_FAILED: No success indicator found"
  exit 1
fi
```

### Pattern 4: Full Acceptance Criteria Check

```bash
#!/bin/bash
# Comprehensive UI validation for Ralph Loop acceptance criteria

FEATURE_ID="$1"
ROUTE="$2"
REQUIRED_ELEMENTS="$3"  # Comma-separated list

echo "=== Ralph UI Validation: $FEATURE_ID ==="

# Create isolated session
SESSION="ralph-${FEATURE_ID}-$(date +%s)"
agent-browser session create "$SESSION"
agent-browser session use "$SESSION"

# Open route
agent-browser open "http://localhost:3000${ROUTE}"

# Get snapshot
SNAPSHOT=$(agent-browser snapshot -i 2>&1)

# Check required elements
PASSED=0
FAILED=0
IFS=',' read -ra ELEMENTS <<< "$REQUIRED_ELEMENTS"
for element in "${ELEMENTS[@]}"; do
  if echo "$SNAPSHOT" | grep -qi "$element"; then
    echo "OK Found: $element"
    ((PASSED++))
  else
    echo "MISSING: $element"
    ((FAILED++))
  fi
done

# Take evidence screenshot
agent-browser screenshot "validation-${FEATURE_ID}.png"

# Cleanup
agent-browser session destroy "$SESSION"

# Return result
if [ "$FAILED" -eq 0 ]; then
  echo "RALPH_UI_VALIDATION_PASSED: $PASSED/$PASSED checks passed"
  exit 0
else
  echo "RALPH_UI_VALIDATION_FAILED: $PASSED/$(($PASSED + $FAILED)) checks passed"
  exit 1
fi
```

---

## PostToolUse Hook Integration

Agent Browser validation can be triggered automatically by PostToolUse hooks.

**Hook Configuration (`.claude/hooks/validators/ui-validation.js`):**

See the `ui-validation.js` hook file for the implementation that:
- Triggers after Write/Edit on component files
- Extracts route from file path
- Runs Agent Browser validation
- Returns pass/retry status to the agent

---

## Acceptance Criteria Mapping

| AC Type | Agent Browser Validation |
|---------|-------------------------|
| `ui-validation` | `agent-browser open [route] && agent-browser snapshot -i` |
| `content-exists` | `agent-browser snapshot -i \| grep "[text]"` |
| `interactive` | `agent-browser click @ref` |
| `form-submit` | `agent-browser fill @ref "[value]" && agent-browser click @submit` |
| `screenshot` | `agent-browser screenshot [filename].png` |

---

## Ralph Backlog Configuration

In `ralph-backlog.json`:

```json
{
  "acceptanceCriteria": [
    {
      "id": "ac-ui-001",
      "type": "ui-validation",
      "description": "Dashboard renders with navigation",
      "uiValidation": {
        "mode": "agent-browser",
        "route": "/dashboard",
        "checks": [
          { "type": "content-exists", "expectedText": "Dashboard" },
          { "type": "content-exists", "expectedText": "Settings" },
          { "type": "interaction", "action": "click", "ref": "@e1" }
        ]
      }
    }
  ]
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `agent-browser: command not found` | Run `npm install -g agent-browser` |
| No elements in snapshot | Wait for page load, check if JS-rendered |
| Session conflict | Use `agent-browser session destroy [name]` |
| Timeout errors | Increase timeout, check server is running |
| Cannot click element | Verify ref ID exists in snapshot |

---

## Integration Points

| Integration | Usage |
|------------|-------|
| Ralph Loop | UI acceptance criteria validation |
| PostToolUse Hooks | Auto-validate after component edits |
| Step 11 PRDs | `ui-validation` acceptance criteria type |
| CI/CD Pipeline | Headless validation in GitHub Actions |
| @gap-analysis | Verify UI coverage |

---

*Agent Browser validation is the recommended UI verification method for Ralph Loop autonomous implementation.*
