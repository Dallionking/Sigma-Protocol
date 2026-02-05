---
name: platform-sync
description: "Sync Sigma Protocol with latest platform updates from Claude Code, OpenCode, Codex, Cursor, Factory Droid, and Antigravity changelogs"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# platform-sync

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---

# @platform-sync — Platform Changelog Scout & Sync

**Mission:** Keep Sigma Protocol (or any repo) up-to-date with the latest platform capabilities by monitoring changelogs, identifying relevant updates, and generating actionable enhancement recommendations.

**Frequency:** Run weekly or bi-weekly to catch platform updates before skills/agents become stale.

---

## Overview

This command:
1. **Fetches changelogs** from supported AI coding platforms
2. **Identifies** new features, deprecations, breaking changes
3. **Analyzes impact** on existing skills, commands, and configurations
4. **Generates recommendations** for updates
5. **Optionally applies** updates (with HITL approval)

---

## Supported Platforms

| Platform | Changelog Source | Config Location | Priority |
|----------|------------------|-----------------|----------|
| **Claude Code** | GitHub releases + CHANGELOG.md | `.claude/` | Critical |
| **OpenCode** | GitHub releases | `.opencode/` | High |
| **Codex** | OpenAI Codex changelog | `.codex/` + `.codex/skills/` (legacy: `.agents/skills/`) | High |
| **Cursor** | cursor.com/changelog | `.cursor/` | High |
| **Factory Droid** | GitHub releases | `.factory/` | Medium |
| **Antigravity** | GitHub releases | `.agent/` | Medium |

---

## HITL Checkpoint Flow

```
Platform Sync Start
    ↓
1.1: Detect Current Versions
    ↓
1.2: Fetch Latest Changelogs (parallel)
    ↓
1.3: Parse & Categorize Changes
    ↓
CHECKPOINT 1: "Review detected changes?" [Y/N]
    ↓
2.1: Impact Analysis on Skills/Commands
    ↓
2.2: Generate Recommendations
    ↓
CHECKPOINT 2: "Apply updates?" [Select which]
    ↓
3.1: Apply Selected Updates
    ↓
3.2: Verify Changes
    ↓
FINAL: Generate Sync Report
```

---

## Phase 1: Changelog Discovery

### 1.1 Detect Current Platform Versions

Check what versions we last synced to:

```bash
# Check for version tracking file
cat docs/.platform-versions.json 2>/dev/null || echo '{"last_sync": "never"}'
```

**Version Tracking File** (`docs/.platform-versions.json`):
```json
{
  "last_sync": "2026-01-28",
  "platforms": {
    "claude-code": {
      "version": "2.1.4",
      "last_checked": "2026-01-28"
    },
    "opencode": {
      "version": "1.1.2",
      "last_checked": "2026-01-28"
    },
    "cursor": {
      "version": "2.4.0",
      "last_checked": "2026-01-28"
    },
    "factory-droid": {
      "version": "0.5.0",
      "last_checked": "2026-01-28"
    },
    "antigravity": {
      "version": "0.1.0",
      "last_checked": "2026-01-28"
    }
  }
}
```

### 1.2 Fetch Latest Changelogs

**Claude Code (Critical):**
```
Source: https://github.com/anthropics/claude-code
Files: CHANGELOG.md, releases
Search: "Claude Code changelog {YEAR}" OR "anthropics/claude-code releases"
```

**OpenCode:**
```
Source: https://github.com/opencode-ai/opencode
Files: CHANGELOG.md, releases
Search: "OpenCode AI changelog {YEAR}"
```

**Codex:**
```
Source: https://developers.openai.com/codex/changelog
Search: "OpenAI Codex changelog {YEAR}"
```

**Cursor:**
```
Source: https://www.cursor.com/changelog
Search: "Cursor IDE changelog {YEAR}" OR "Cursor AI updates"
```

**Factory Droid:**
```
Source: https://github.com/factory-ai/factory-droid
Files: CHANGELOG.md, releases
Search: "Factory Droid AI changelog"
```

**Antigravity:**
```
Source: https://github.com/ArcadeLabsInc/antigravity
Files: CHANGELOG.md, releases
Search: "Antigravity AI IDE updates"
```

### 1.3 Parse & Categorize Changes

For each changelog, categorize entries:

| Category | Description | Impact Level |
|----------|-------------|--------------|
| **NEW_FEATURE** | New tool, hook, or capability | High |
| **ENHANCEMENT** | Improvement to existing feature | Medium |
| **DEPRECATION** | Feature being phased out | Critical |
| **BREAKING** | Breaking change requiring updates | Critical |
| **BUGFIX** | Bug fix (usually no action needed) | Low |
| **DOCS** | Documentation update | Low |

**Change Entry Format:**
```markdown
### [CATEGORY] Platform Name vX.X.X (YYYY-MM-DD)

**What Changed:**
[Description of the change]

**Impact on Sigma Protocol:**
- [ ] Affects skills: [list or "none"]
- [ ] Affects commands: [list or "none"]
- [ ] Affects configs: [list or "none"]

**Recommended Action:**
[What we should do about it]
```

---

## Phase 2: Impact Analysis

### 2.1 Skill Impact Assessment

For each detected change, check affected skills:

```bash
# Search skills for platform-specific patterns
grep -r "TaskCreate\|TaskUpdate" .claude/skills/  # Claude Code task tools
grep -r "reasoningEffort" .factory/droids/        # Factory Droid
grep -r "subagent" .claude/skills/                # Subagent patterns
```

**Impact Matrix:**

| Change Type | Check These Files | Action |
|-------------|-------------------|--------|
| New Claude tool | `.claude/skills/*.md` | Add to relevant skills |
| New hook | `CLAUDE.md`, skills | Document in capabilities |
| Deprecation | All skills using feature | Update or remove references |

---

## Phase 3: Recommendations & Apply

### 3.1 Generate Recommendations

For each platform change, output:
- Affected files
- Suggested changes
- Risk level
- Effort estimate

### 3.2 Apply (Optional)

If `--apply` is set, implement selected changes and update:
- `docs/.platform-versions.json`
- Relevant `.claude/`, `.cursor/`, `.opencode/`, `.factory/` files
- Any affected skill/command docs

---

## Output Artifacts

- `docs/.platform-versions.json` (updated)
- `docs/analysis/PLATFORM-SYNC-REPORT-YYYY-MM-DD.md`

---

## Verification

- Re-run platform-specific tests or lint if configs change
- Ensure no deprecated commands remain in docs
