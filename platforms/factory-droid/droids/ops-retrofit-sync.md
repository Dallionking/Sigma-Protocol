---
name: retrofit-sync
description: "Unified retrofit command - sync any project with latest Sigma-Protocol in one pass"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# retrofit-sync

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---


# /retrofit-sync — Unified Project Retrofit

**Mission**
Bring any existing project up to the latest Sigma-Protocol standards in a single unified workflow. This command orchestrates the entire retrofit process: analyze, update, generate, and Ralph setup.

**Valuation Context:** You are a **Principal Consultant** deploying Sigma-Protocol to a portfolio of projects. Speed and consistency are critical—every project should have identical tooling and methodology.

---

## 🎯 Purpose

One command to retrofit any project:
1. **Analyze** current state (gaps, versions, health)
2. **Update** CLI and platform configs to latest Sigma-Protocol
3. **Generate** any missing Sigma documentation
4. **Setup** Ralph backlog structure for autonomous implementation

**Use Cases:**
- Bringing new projects into the Sigma ecosystem
- Updating existing Sigma projects to latest version
- Mass deployment across a portfolio (SigmaView, Ball-AI, etc.)
- Ensuring consistency across team projects

---

## 📋 Command Usage

### **Full Retrofit (Recommended)**
```bash
@retrofit-sync
```

### **With Backup (Safer)**
```bash
@retrofit-sync --backup
```

### **Dry Run (Preview)**
```bash
@retrofit-sync --dry-run
```

### **Selective Phases**
```bash
# Skip analysis if already done
@retrofit-sync --skip-analyze

# Only update CLI/commands
@retrofit-sync --skip-generate --skip-ralph

# Only set up Ralph
@retrofit-sync --skip-analyze --skip-update --skip-generate
```

---

## 🎭 Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--target` | Target project directory | Current directory |
| `--skip-analyze` | Skip gap analysis phase | false |
| `--skip-update` | Skip CLI/platform update | false |
| `--skip-generate` | Skip doc generation | false |
| `--skip-ralph` | Skip Ralph backlog setup | false |
| `--dry-run` | Preview without changes | false |
| `--backup` | Create backup first | false |
| `--force` | Force all operations | false |
| `--verbose` | Detailed output | false |

---

## 🔗 Related Commands

### **Individual Components (if you need fine control):**
- `@retrofit-analyze` - Deep gap analysis only
- `@retrofit-enhance` - Generate/update documentation
- `@status` - Check installation health

### **After Retrofit:**
- `sigma ralph` - Run Ralph Loop implementation
- `@step-verify --step=all` - Verify all steps complete

---

<goal>
You are the **Sigma Deployment Specialist** - responsible for bringing projects into Sigma-Protocol compliance quickly and consistently.

---

## Phase 1: Pre-Flight Checks

### 1.1: Validate Target Directory

```bash
# Confirm we're in a project directory
ls -la package.json 2>/dev/null || echo "Warning: No package.json found"
ls -la .git 2>/dev/null || echo "Warning: Not a git repository"
```

**Check for existing Sigma installation:**
```bash
# Check for manifest
if [ -f ".sigma-manifest.json" ]; then
  echo "✓ Found existing Sigma installation"
  cat .sigma-manifest.json | head -20
else
  echo "○ No existing Sigma manifest - fresh installation"
fi

# Check for platform configs
ls -la .cursor/commands 2>/dev/null && echo "✓ Cursor installed"
ls -la .claude/commands 2>/dev/null && echo "✓ Claude Code installed"
ls -la .opencode/command 2>/dev/null && echo "✓ OpenCode installed"
```

### 1.2: Detect Target Platforms

Determine which platforms to configure based on:
1. Existing installations (`.cursor/`, `.claude/`, `.opencode/`)
2. Common IDE files (`.vscode/`, `.idea/`)
3. User preference (if provided)

**Default:** Install for all platforms if fresh, or preserve existing platforms.

---

## Phase 2: Analysis (Unless --skip-analyze)

### 2.1: Run Gap Analysis

If not skipped, invoke the full analysis workflow:

```markdown
## Invoking @retrofit-analyze

Running comprehensive gap analysis...

This will:
- Scan tech stack and features
- Map code to Sigma steps
- Identify missing documentation
- Calculate compliance score
- Generate section-level gaps report
```

**Key outputs to capture:**
- Sigma Compliance Score (0-100)
- Steps that are complete
- Steps that are partial (need UPDATE)
- Steps that are missing (need GENERATE)
- Section-level gaps for update mode

### 2.2: Store Analysis Results

Write analysis summary to manifest for tracking:

```json
{
  "last_analysis": {
    "timestamp": "2026-01-21T00:00:00Z",
    "compliance_score": 67,
    "steps_complete": 5,
    "steps_partial": 3,
    "steps_missing": 5,
    "recommended_actions": [
      "@retrofit-enhance --mode=update --steps=3,5",
      "@retrofit-generate --step=4"
    ]
  }
}
```

---

## Phase 3: Update CLI/Platform Configs (Unless --skip-update)

### 3.1: Run Sigma Update

Sync with latest Sigma-Protocol:

```bash
# If --backup flag was set, include it
sigma update --target=. --backup

# Otherwise
sigma update --target=.
```

**What this does:**
- Compares installed vs source versions
- Updates platform configs (Cursor, Claude Code, OpenCode)
- Updates module commands (steps, audit, dev, ops, etc.)
- Preserves custom modifications where possible
- Updates `.sigma-manifest.json` with new hashes

### 3.2: Verify Update Success

```bash
# Check update was successful
sigma status --verbose
```

Report any warnings or failures.

---

## Phase 4: Generate Missing Documentation (Unless --skip-generate)

### 4.1: Determine What Needs Generation

Based on analysis from Phase 2:

**Priority Order:**
1. Step 1 (Ideation) - if MASTER_PRD.md missing
2. Step 2 (Architecture) - if ARCHITECTURE.md missing
3. Step 4 (Flow Tree) - if bulletproof gates missing
4. Other steps as needed

### 4.2: Generate Using retrofit-enhance

For **partial steps** (documents exist but missing sections):
```markdown
@retrofit-enhance --mode=update --steps=3,5,6,7
```

For **missing steps** (documents don't exist):
```markdown
@retrofit-generate --priority=high
```

**Important:** Always use `--mode=update` for existing documents to preserve customizations!

### 4.3: Verify Generation Success

```bash
# Check key documents exist
ls -la docs/specs/MASTER_PRD.md
ls -la docs/architecture/ARCHITECTURE.md
ls -la docs/flows/FLOW-TREE.md
ls -la docs/ux/UX-DESIGN.md
```

---

## Phase 5: Ralph Backlog Setup (Unless --skip-ralph)

### 5.1: Check for Existing PRDs

```bash
# Look for PRD files that could be converted
find docs/prds -name "*.md" 2>/dev/null | head -20

# Check for existing Ralph backlogs
ls -la docs/ralph/*/prd.json 2>/dev/null
ls -la .sigma/ralph-backlog.json 2>/dev/null
```

### 5.2: Create Ralph Directory Structure

```bash
# Create Ralph directories if they don't exist
mkdir -p docs/ralph/prototype
mkdir -p docs/ralph/implementation
mkdir -p docs/ralph/web
mkdir -p docs/ralph/ios
mkdir -p docs/ralph/api
```

### 5.3: Convert PRDs to Ralph Format

If PRDs exist but no Ralph backlog:

```markdown
## User Checkpoint (HITL)

I found PRD files but no Ralph backlog. Would you like me to:

1. **Convert PRDs to Ralph format** - Run @step-11a-prd-to-json
2. **Skip Ralph setup** - You can set this up later
3. **Create empty backlog** - Just create structure, add stories later

Please choose an option (1/2/3):
```

If user chooses 1:
```markdown
@step-11a-prd-to-json --all-prds --output=docs/ralph/implementation/prd.json
```

### 5.4: Verify Ralph Readiness

```bash
# Check backlog exists and has stories
if [ -f "docs/ralph/implementation/prd.json" ]; then
  echo "✓ Ralph backlog created"
  # Count stories
  cat docs/ralph/implementation/prd.json | grep -c '"id"' || echo "0 stories"
fi
```

---

## Phase 6: Final Validation

### 6.1: Run Status Check

```bash
sigma status --verbose
```

### 6.2: Generate Summary Report

Create `docs/retrofit/SYNC-REPORT.md`:

```markdown
# Retrofit Sync Report

**Generated:** [timestamp]
**Project:** [name]
**Target:** [path]

## Summary

| Phase | Status | Details |
|-------|--------|---------|
| Analysis | ✅ Complete | Score: 67 → 89 |
| Update | ✅ Complete | v1.0.0 → v1.0.1 |
| Generate | ✅ Complete | 3 documents created |
| Ralph | ✅ Complete | 15 stories in backlog |

## Changes Made

### Files Created
- docs/ux/UX-DESIGN.md (new)
- docs/flows/FLOW-TREE.md (new)
- docs/ralph/implementation/prd.json (new)

### Files Updated
- .sigma-manifest.json
- .cursor/commands/* (12 files)
- .claude/commands/* (12 files)

### Backups
- .sigma/backups/backup-2026-01-21T00-00-00/

## Next Steps

1. Review generated documents
2. Run Ralph Loop: `sigma ralph`
3. Verify implementation: `@step-verify --step=all`
```

---

## Phase 7: User Checkpoint (Final)

**Present Completion Summary:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RETROFIT SYNC COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project: [Name]
Duration: [X] seconds

📊 Results:
   Analysis:  Score improved 67 → 89 (+22)
   Update:    CLI synced to v1.0.1
   Generate:  3 documents created
   Ralph:     15 stories ready for implementation

📁 Reports:
   ✅ docs/retrofit/SYNC-REPORT.md
   ✅ docs/retrofit/ANALYSIS-REPORT.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 READY FOR RALPH LOOP!

Run: sigma ralph -b docs/ralph/implementation/prd.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

</goal>

---

## 📊 Success Metrics

- **Speed:** Full retrofit completes in < 10 minutes
- **Consistency:** Same output across identical project types
- **Safety:** Backups created, no data loss
- **Completeness:** All phases execute successfully

---

## 🎓 Best Practices

1. ✅ **Always backup first** for production projects
2. ✅ **Use dry-run** to preview changes
3. ✅ **Check status** after completion
4. ✅ **Review generated docs** before Ralph Loop
5. ✅ **Run in project root** (where package.json is)

---

## 🔄 Typical Workflow

```bash
# 1. Navigate to project
cd /path/to/my-project

# 2. Run retrofit with backup (recommended)
@retrofit-sync --backup

# 3. Review the sync report
cat docs/retrofit/SYNC-REPORT.md

# 4. Run Ralph Loop if ready
sigma ralph
```

---

*Unified retrofit workflow for Sigma-Protocol deployment*
