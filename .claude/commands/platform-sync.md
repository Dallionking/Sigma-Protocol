---
description: "Sync Sigma Protocol with latest platform updates from Claude Code, OpenCode, Cursor, Factory Droid, and Antigravity changelogs"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  - WebSearch
  - Glob
  - Grep
  - Task
---

# /platform-sync — Platform Changelog Scout & Sync

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
| Breaking change | All configs | Immediate fix required |

### 2.2 Generate Recommendations

Output a structured recommendation list:

```markdown
## Platform Sync Recommendations

### Critical (Apply Immediately)
1. [BREAKING] Claude Code v2.2.0 removed `OldTool` — update 3 skills
2. [DEPRECATION] Cursor rules format changing — migrate to skills

### High Priority (This Week)
3. [NEW_FEATURE] Claude Code added `TaskDependency` tool — enhance orchestration skills
4. [ENHANCEMENT] Factory Droid 7M token support — update docs

### Medium Priority (This Sprint)
5. [NEW_FEATURE] OpenCode plugin system — create integration guide
6. [ENHANCEMENT] Cursor Browser subagent improvements — update testing skills

### Low Priority (Backlog)
7. [DOCS] Antigravity updated SKILL.md spec — review for compliance
```

---

## Phase 3: Apply Updates (HITL)

### 3.1 Update Application Modes

**Mode 1: Report Only (Default)**
```
Generate recommendations without making changes.
Output: docs/platform-sync-report-{DATE}.md
```

**Mode 2: Interactive Apply**
```
Present each recommendation with options:
[A]pply | [S]kip | [D]efer | [M]anual
```

**Mode 3: Auto-Apply Safe**
```
Automatically apply:
- Documentation updates
- New feature additions (additive)
- Non-breaking enhancements

Require approval for:
- Breaking changes
- Deprecation handling
- Config modifications
```

### 3.2 Update Templates

**For NEW_FEATURE:**
1. Read the feature documentation
2. Identify which skills should reference it
3. Add section to relevant skills
4. Update PLATFORMS.md

**For DEPRECATION:**
1. Find all references to deprecated feature
2. Identify replacement (if any)
3. Update references or add migration notes
4. Set reminder for removal

**For BREAKING:**
1. Immediately fix affected configs
2. Update skills that reference changed APIs
3. Run verification to ensure nothing broken

---

## Phase 4: Verification & Report

### 4.1 Post-Update Verification

```bash
# Verify no broken references
grep -r "DEPRECATED" .claude/skills/ --include="*.md" | wc -l

# Check skill count didn't decrease
ls .claude/skills/*.md | wc -l

# Validate JSON configs
python3 -c "import json; json.load(open('.claude/settings.json'))"
```

### 4.2 Generate Sync Report

**Output: `docs/platform-sync-report-{DATE}.md`**

```markdown
# Platform Sync Report — {DATE}

## Summary
- **Platforms Checked:** 5
- **Changes Detected:** 12
- **Updates Applied:** 8
- **Deferred:** 2
- **Skipped:** 2

## Platform Versions

| Platform | Previous | Current | Changes |
|----------|----------|---------|---------|
| Claude Code | 2.1.4 | 2.2.0 | 3 |
| OpenCode | 1.1.2 | 1.1.5 | 2 |
| Cursor | 2.4.0 | 2.5.0 | 4 |
| Factory Droid | 0.5.0 | 0.5.2 | 2 |
| Antigravity | 0.1.0 | 0.1.0 | 0 |

## Changes Applied

### Claude Code
- [x] Added TaskDependency documentation to orchestration skills
- [x] Updated PLATFORMS.md with v2.2.0 features
- [ ] DEFERRED: PreCompact hook examples (needs research)

### Cursor
- [x] Updated subagent documentation
- [x] Added Browser subagent skill section

## Next Sync
Recommended: {DATE + 2 weeks}

## Manual Actions Required
1. Review PreCompact hook for potential skill enhancements
2. Test new Cursor Browser subagent patterns
```

### 4.3 Update Version Tracking

Update `docs/.platform-versions.json` with new versions and sync date.

---

## Usage

### Basic Sync (Report Only)
```
/platform-sync
```

### Sync Specific Platform
```
/platform-sync --platform claude-code
```

### Interactive Apply Mode
```
/platform-sync --apply
```

### Auto-Apply Safe Changes
```
/platform-sync --auto-apply-safe
```

### Check Since Specific Date
```
/platform-sync --since 2026-01-15
```

---

## Integration with Sigma Workflow

**When to Run:**
- Weekly maintenance (recommended)
- Before major releases
- After noticing deprecated warnings
- When starting new projects

**Pairs Well With:**
- `/status` — Check overall project health
- `/gap-analysis` — Verify skill coverage
- `/validate-methodology` — Ensure step compliance

---

## Changelog Sources Reference

### Claude Code
- **GitHub:** https://github.com/anthropics/claude-code
- **Releases:** https://github.com/anthropics/claude-code/releases
- **Docs:** https://docs.anthropic.com/claude-code

### OpenCode
- **GitHub:** https://github.com/opencode-ai/opencode
- **Releases:** https://github.com/opencode-ai/opencode/releases

### Cursor
- **Changelog:** https://www.cursor.com/changelog
- **Docs:** https://docs.cursor.com

### Factory Droid
- **GitHub:** https://github.com/factory-ai/factory-droid
- **Docs:** Factory Droid documentation

### Antigravity
- **GitHub:** https://github.com/ArcadeLabsInc/antigravity
- **Skills.sh:** https://skills.sh

---

## Appendix: Change Detection Patterns

### Claude Code Patterns to Watch
```
- "TaskCreate" / "TaskUpdate" / "TaskList" / "TaskGet"
- "PreToolUse" / "PostToolUse" / "PreCompact"
- "SubagentStart" / "SubagentStop"
- "permissions" / "mcpAutoEnable"
- "Plugin" / ".claude/plugins/"
```

### Cursor Patterns to Watch
```
- "Agent Skills" / ".cursor/skills/"
- "Rules" / ".cursor/rules/"
- "Subagents" / "Explore" / "Bash" / "Browser"
- "MCP" / "mcp.json"
```

### Factory Droid Patterns to Watch
```
- "reasoningEffort"
- "Specification Mode"
- "Anchor-point compression"
- "7M token"
```

---

<verification>
## Platform Sync Verification Schema

### Required Outputs (20 points)
| Output | Path | Points |
|--------|------|--------|
| Sync Report | docs/platform-sync-report-*.md | 10 |
| Version Tracking | docs/.platform-versions.json | 5 |
| PLATFORMS.md Updated | docs/PLATFORMS.md (if changes) | 5 |

### Process Quality (40 points)
| Check | Description | Points |
|-------|-------------|--------|
| Platforms Checked | All 5 platforms queried | 10 |
| Changes Categorized | Each change has category | 10 |
| Impact Analyzed | Skills checked for impact | 10 |
| HITL Respected | User approved changes | 10 |

### Output Quality (40 points)
| Check | Description | Points |
|-------|-------------|--------|
| Report Complete | Summary, details, next steps | 15 |
| Versions Updated | .platform-versions.json current | 10 |
| Recommendations Clear | Actionable items listed | 10 |
| No Regressions | Skill count stable or increased | 5 |

</verification>
