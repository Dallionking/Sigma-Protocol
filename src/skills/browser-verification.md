---
name: browser-verification
description: "Platform-adaptive browser testing and verification. Automatically routes to Cursor Browser, Playwright MCP, or Claude Browser based on availability."
version: "1.0.0"
triggers:
  - browser
  - verify
  - test
  - screenshot
  - ui-test
  - ralph-mode
---

# Browser Verification Skill

Platform-adaptive browser testing that automatically routes to the best available browser engine. Critical for UI acceptance criteria verification in Ralph loop and general UI testing.

## When to Invoke

Invoke this skill when:
- Verifying UI changes visually
- Running acceptance criteria tests
- Testing user interactions
- Capturing screenshots for documentation
- Ralph loop needs browser verification

---

## 🎯 Browser Engine Detection

The skill automatically detects and uses the best available browser:

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER ENGINE PRIORITY                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. AGENT BROWSER (Recommended for Ralph Loop) ⭐ NEW       │
│     └─ 93% less context than Playwright                     │
│     └─ Ref-based element selection (@e1, @e2, @e3)          │
│     └─ CLI: agent-browser (npm install -g agent-browser)    │
│                                                              │
│  2. CURSOR BROWSER (Cursor IDE users)                       │
│     └─ Most capable, full interaction support               │
│     └─ Tools: mcp_cursor-ide-browser_*                      │
│                                                              │
│  3. PLAYWRIGHT MCP (Claude Code / OpenCode)                 │
│     └─ Full automation, headless or headed                  │
│     └─ Tools: playwright MCP server                         │
│                                                              │
│  4. CLAUDE BROWSER (Claude Code native)                     │
│     └─ Built-in browsing capability                         │
│     └─ Limited interaction, good for viewing                │
│                                                              │
│  5. MANUAL FALLBACK                                         │
│     └─ Prompt user to verify manually                       │
│     └─ Provides checklist of what to verify                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Engine Capabilities

| Capability | Agent Browser | Cursor Browser | Playwright MCP | Claude Browser | Manual |
|------------|--------------|---------------|----------------|----------------|--------|
| Navigate | ✅ Full | ✅ Full | ✅ Full | ✅ Basic | ❌ |
| Screenshot | ✅ Full | ✅ Full | ✅ Full | ❌ | ❌ |
| Click | ✅ Ref-based | ✅ Full | ✅ Full | ❌ | ❌ |
| Type/Fill | ✅ Ref-based | ✅ Full | ✅ Full | ❌ | ❌ |
| Hover | ❌ | ✅ Full | ✅ Full | ❌ | ❌ |
| DOM Snapshot | ✅ Interactive | ✅ Full | ✅ Full | ✅ Basic | ❌ |
| Wait for element | ✅ Basic | ✅ Full | ✅ Full | ❌ | ❌ |
| Multi-tab | ❌ | ✅ Full | ✅ Full | ❌ | ❌ |
| Console logs | ❌ | ✅ Full | ✅ Full | ❌ | ❌ |
| Network requests | ❌ | ✅ Full | ✅ Full | ❌ | ❌ |
| Context efficiency | ⭐ 93% less | Medium | High | Low | N/A |
| Session isolation | ✅ | ✅ | ✅ | ❌ | N/A |

---

## 📋 Platform-Specific Usage

### Agent Browser (Recommended for Ralph Loop) ⭐

Agent Browser by Vercel provides 93% less context than Playwright MCP, making it ideal for autonomous Ralph Loop execution.

**Installation:**
```bash
npm install -g agent-browser
```

**Key Commands:**

```bash
# Open a URL
agent-browser open http://localhost:3000/dashboard

# Get interactive elements with ref IDs
agent-browser snapshot -i
# Returns: @e1: button "Sign In", @e2: input "Email", @e3: input "Password"

# Click an element by ref
agent-browser click @e1

# Fill a form field
agent-browser fill @e2 "test@example.com"

# Select from dropdown
agent-browser select @e4 "option-value"

# Take screenshot
agent-browser screenshot validation-feature.png

# Session management (isolated browser instances)
agent-browser session create feature-test
agent-browser session use feature-test
agent-browser session destroy feature-test
```

**Ralph Loop Validation Pattern:**

```bash
#!/bin/bash
# UI Validation for Ralph Loop

# 1. Open the route
agent-browser open http://localhost:3000/feature

# 2. Get interactive elements
SNAPSHOT=$(agent-browser snapshot -i)

# 3. Verify expected elements exist
if echo "$SNAPSHOT" | grep -q "Sign In"; then
  echo "✅ Sign In button found"
else
  echo "❌ Sign In button NOT found"
  exit 1
fi

# 4. Take screenshot for evidence
agent-browser screenshot validation-feature-$(date +%s).png

# 5. Return success
echo "RALPH_UI_VALIDATION_PASSED"
```

**Advantages for Ralph Loop:**
- ✅ 93% less token usage than full DOM
- ✅ Ref-based selection eliminates selector brittleness
- ✅ Session isolation for parallel testing
- ✅ CLI-native (works with any terminal agent)
- ✅ Fast startup time

---

### Cursor IDE

```typescript
// Cursor browser tools are automatically available
// Use the mcp_cursor-ide-browser_* tools directly

// Navigate to page
mcp_cursor-ide-browser_browser_navigate({ url: "http://localhost:3000" })

// Take snapshot for accessibility tree
mcp_cursor-ide-browser_browser_snapshot()

// Click element
mcp_cursor-ide-browser_browser_click({ 
  element: "Sign In button",
  ref: "[button with text 'Sign In']"
})

// Type text
mcp_cursor-ide-browser_browser_type({
  element: "Email input field",
  ref: "[input type='email']",
  text: "test@example.com"
})

// Take screenshot
mcp_cursor-ide-browser_browser_take_screenshot({
  filename: "screenshot.png",
  fullPage: true
})
```

### Claude Code with Playwright MCP

```typescript
// Ensure Playwright MCP is configured in your Claude settings
// The MCP tools become available as mcp_playwright_*

// Or use the CLI directly:
// claude "Navigate to localhost:3000 and verify the dashboard loads"

// Playwright provides full browser automation:
// - Headless or headed mode
// - Multiple browsers (Chromium, Firefox, WebKit)
// - Mobile emulation
// - Network interception
```

### Claude Code with Native Browser

```typescript
// Claude Code has built-in web browsing capability
// Less capable than Playwright but works out of the box

// Simply ask Claude to:
// "Open http://localhost:3000 and describe what you see"
// "Verify the login form is present on the page"
```

### OpenCode with Playwright

```typescript
// OpenCode can use Playwright MCP similar to Claude Code
// Configure in your OpenCode MCP settings

// Then invoke via commands:
// "Use Playwright to navigate to localhost:3000 and take a screenshot"
```

---

## 🔄 Ralph Loop Integration

When running Ralph loop, acceptance criteria can include browser verification:

### Acceptance Criteria Format

```json
{
  "id": "US-001",
  "title": "User can sign in",
  "acceptanceCriteria": [
    {
      "type": "ui-validation",
      "description": "Sign in form displays correctly",
      "uiValidation": {
        "mode": "any",
        "route": "/login",
        "checks": [
          {
            "type": "content-exists",
            "expectedText": "Sign In"
          },
          {
            "type": "element-exists",
            "selector": "input[type='email']"
          },
          {
            "type": "element-exists",
            "selector": "input[type='password']"
          },
          {
            "type": "element-exists",
            "selector": "button[type='submit']"
          }
        ]
      }
    },
    {
      "type": "ui-validation",
      "description": "User can complete sign in flow",
      "uiValidation": {
        "mode": "any",
        "route": "/login",
        "checks": [
          {
            "type": "interaction",
            "action": "type",
            "selector": "input[type='email']",
            "value": "test@example.com"
          },
          {
            "type": "interaction",
            "action": "type",
            "selector": "input[type='password']",
            "value": "testpassword"
          },
          {
            "type": "interaction",
            "action": "click",
            "selector": "button[type='submit']"
          },
          {
            "type": "wait",
            "waitFor": "navigation",
            "expectedUrl": "/dashboard"
          }
        ]
      }
    }
  ]
}
```

### Mode Options

| Mode | Behavior |
|------|----------|
| `any` | Use whatever browser is available (recommended) |
| `agent-browser` | Use Vercel Agent Browser CLI (best for Ralph Loop) ⭐ |
| `cursor-browser` | Require Cursor browser, fail if unavailable |
| `playwright` | Require Playwright MCP, fail if unavailable |
| `claude-browser` | Require Claude native browser |
| `manual` | Skip automation, prompt for manual verification |

---

## 📸 Screenshot Workflows

### Capture for Documentation

```typescript
// Full page screenshot
mcp_cursor-ide-browser_browser_take_screenshot({
  filename: "docs/screenshots/dashboard.png",
  fullPage: true
})

// Element screenshot
mcp_cursor-ide-browser_browser_take_screenshot({
  filename: "docs/screenshots/header.png",
  element: "Site header",
  ref: "header"
})

// Multiple viewports
const viewports = [
  { width: 375, height: 667, name: "mobile" },
  { width: 768, height: 1024, name: "tablet" },
  { width: 1920, height: 1080, name: "desktop" }
];

for (const vp of viewports) {
  mcp_cursor-ide-browser_browser_resize({ width: vp.width, height: vp.height });
  mcp_cursor-ide-browser_browser_take_screenshot({
    filename: `docs/screenshots/dashboard-${vp.name}.png`,
    fullPage: true
  });
}
```

### Visual Regression

```typescript
// Take baseline screenshot
mcp_cursor-ide-browser_browser_take_screenshot({
  filename: "tests/screenshots/baseline/component.png"
})

// After changes, compare:
// Use image comparison library or visual diff tool
```

---

## ✅ Verification Checklist

When browser tools are not available, use this manual checklist:

```markdown
## Manual UI Verification Checklist

### Page: [URL]

**Layout:**
- [ ] Page loads without errors
- [ ] Layout matches design/wireframe
- [ ] No obvious visual bugs

**Responsive:**
- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)

**Functionality:**
- [ ] All buttons are clickable
- [ ] Forms accept input
- [ ] Navigation works
- [ ] No console errors

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast acceptable
- [ ] Screen reader friendly

**Performance:**
- [ ] Page loads in <3s
- [ ] No layout shift
- [ ] Images load

**Notes:**
[Add any observations]
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cursor browser not available | Ensure you're in Cursor IDE with browser tab enabled |
| Playwright MCP not found | Install and configure Playwright MCP in your AI settings |
| Claude browser fails | Try refreshing or use manual verification |
| Element not found | Check selector, wait for page load |
| Screenshot blank | Wait for content to render |
| Interaction fails | Verify element is visible and clickable |

---

## 🔗 Integration with Sigma Protocol

### @ui-healer
Full UI testing with browser verification and healing.

### @compound-engineering
Browser verification in the WORK and REVIEW phases.

### Ralph Loop
Acceptance criteria can include `ui-validation` checks.

### @gap-analysis
Browser verification for UI-related acceptance criteria.

---

*Browser verification is the final gate for UI quality. Automate when possible, fall back to manual when needed.*


