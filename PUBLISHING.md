# Publishing Policy

This document defines what is included in the public SSS Protocol repository vs what is excluded.

## Public Content (Committed to GitHub)

### Command Folders

| Folder | Description | Syncs to Boilerplates |
|--------|-------------|----------------------|
| `audit/` | Quality assurance commands | Yes |
| `deploy/` | Deployment workflows | Yes |
| `dev/` | Development commands | Yes |
| `generators/` | Code generators | Yes |
| `marketing/` | Marketing generators | Yes |
| `ops/` | Operations commands | Yes |
| `steps/` | 13-step methodology | Yes |
| `Magic UI/` | UI component library | Yes |

### Template Folder

| Folder | Description |
|--------|-------------|
| `boilerplates/` | Starter templates (nextjs-saas, expo-mobile, etc.) |

### Protocol Internals

| Folder | Description |
|--------|-------------|
| `src/` | Agent persona definitions |
| `schemas/` | JSON schemas for validation |
| `tools/` | CLI tools (sss-cli.js) |
| `scripts/` | Installation scripts |

### Documentation (Core Only)

| File | Description |
|------|-------------|
| `docs/COMMANDS.md` | Command reference |
| `docs/QUICK-REFERENCE.md` | Quick start guide |
| `docs/FILE-PATH-REFERENCE.md` | File path conventions |
| `docs/WORKFLOW-OVERVIEW.md` | Methodology overview |

### Root Files

| File | Description |
|------|-------------|
| `README.md` | Main documentation |
| `LICENSE` | MIT License |
| `SECURITY.md` | Security policy |
| `CONTRIBUTING.md` | Contribution guidelines |
| `PUBLISHING.md` | This file |
| `package.json` | NPM manifest |
| `.gitignore` | Git exclusions |
| `.boilerplate-ignore` | Boilerplate sync exclusions |

## Excluded Content (Never Committed)

### Via .gitignore

| Pattern | Reason |
|---------|--------|
| `node_modules/` | Dependencies |
| `*.env*` | Environment secrets |
| `**/OAuth*.json` | OAuth credentials |
| `**/credentials*.json` | API credentials |
| `*.zip` | Archives |
| `course/` | Private paid content |
| `claude-code/` | Internal tooling |
| `Inspo/` | Personal inspiration |
| `assets/` | Personal assets |
| `docs/notebooklm/` | Personal notes |
| `*-ANALYSIS-*.md` | Internal analyses |
| `*-SUMMARY*.md` | Internal summaries |
| `.cursor/plans/` | IDE plans |
| `*.code-workspace` | Workspace files |

### Via .boilerplate-ignore (Not Synced to Boilerplates)

| Pattern | Reason |
|---------|--------|
| `boilerplates/` | Prevents recursion |
| `tools/` | Protocol internals |
| `scripts/` | Protocol internals |
| `schemas/` | Protocol internals |
| `src/` | Protocol internals |
| `.github/` | CI/CD config |

## Verification

Run these commands to verify the public repo is clean:

```bash
# Check for secrets
grep -rn "sk-" . --include="*" 2>/dev/null | head -20
grep -rn "AIza" . --include="*" 2>/dev/null | head -20

# Check for private files
ls -la | grep -E "(OAuth|course|claude-code|Inspo|assets)"

# Verify only 4 docs
ls docs/
```

## Boilerplate Sync

When you push to `main`, the GitHub Action `.github/workflows/sync-boilerplates.yml` automatically syncs command folders to all boilerplate repos, respecting `.boilerplate-ignore`.

## Adding New Content

1. **Public command**: Add to appropriate folder (`audit/`, `dev/`, etc.)
2. **Private content**: Add pattern to `.gitignore`
3. **Protocol internals**: Add to appropriate folder + `.boilerplate-ignore`

