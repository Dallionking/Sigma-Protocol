---
name: doctor-fix
description: "Execute health check fixes identified by sigma doctor. Interprets fix requirements and applies them systematically."
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# doctor-fix

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---


# @doctor-fix — Health Check Auto-Repair

## Purpose

This command receives a list of health check issues from `sigma doctor` and systematically fixes each one.

---

## Execution Strategy

### 1. Parse the Issue List

When invoked, you'll receive issues in this format:
```
- Issue Name: Suggested Fix Command
```

### 2. Fix Categories

**Installation Issues:**
- "No Sigma Protocol installation detected" → Run installation workflow
- "No .sigma-manifest.json found" → Create manifest file
- "Missing .sigma directory" → Create directory structure

**Platform Issues:**
- "CLAUDE.md missing" → Generate CLAUDE.md orchestrator
- "AGENTS.md missing" → Generate AGENTS.md orchestrator
- "Commands directory empty" → Install commands

**Documentation Issues:**
- "No docs directory" → Create docs structure
- "Missing standard directories" → Create specs, prds subdirs

**Schema Issues:**
- "JSON schemas not found" → Copy schemas to platform dirs

**Ralph Issues:**
- "Ralph loop script not executable" → chmod +x the script
- "Schemas not installed" → Copy from package

---

## Fix Implementations

### Create .sigma-manifest.json

```json
{
  "sigma_version": "1.0.0",
  "installed_at": "<current_timestamp>",
  "platforms": ["<detected_platforms>"],
  "project_name": "<from_package.json_or_dirname>"
}
```

### Create CLAUDE.md

```markdown
# CLAUDE.md - Sigma Protocol Orchestrator

This file serves as the central orchestration point for Claude Code.

## Quick Start

Run these commands to work with Sigma Protocol:

- `@continue` - Find and work on the next task
- `@status` - Show project status overview
- `@gap-analysis` - Verify implementation completeness

## Active PRDs

Check `.sigma/prds/` or `docs/prds/` for active PRDs.

## Workflow Commands

See `docs/COMMANDS.md` for full command reference.
```

### Create AGENTS.md

```markdown
# AGENTS.md - Sigma Protocol Orchestrator

This file serves as the central orchestration point for OpenCode agents.

## Quick Start

- `@continue` - Find and work on the next task
- `@status` - Show project status overview
- `@gap-analysis` - Verify implementation completeness

## Active PRDs

Check `.sigma/prds/` or `docs/prds/` for active PRDs.
```

### Create .sigma Directory Structure

```
.sigma/
├── context/
│   └── README.md
├── rules/
│   └── README.md
├── prds/
│   └── README.md
└── orchestration/
    └── README.md
```

### Create docs Structure

```
docs/
├── specs/
│   └── README.md
├── prds/
│   └── README.md
└── README.md
```

---

## Execution Flow

1. **Read the issue list** from the prompt
2. **Categorize each issue** by type
3. **Execute fixes in order:**
   - Directory structure first
   - Manifest file second
   - Platform configs third
   - Optional components last
4. **Verify each fix** worked
5. **Report progress** after each fix
6. **Run sigma doctor again** to confirm all issues resolved

---

## Progress Reporting

After each fix, report:
```
✅ Fixed: [Issue Name]
   Action: [What was done]
   Verified: [How it was confirmed]
```

If a fix fails:
```
❌ Failed: [Issue Name]
   Error: [What went wrong]
   Manual fix: [Command to run manually]
```

---

## Post-Completion

After all fixes are applied:

1. Run `sigma doctor` equivalent checks to verify
2. Summarize what was fixed
3. Note any remaining issues that need manual attention
4. Suggest next steps (e.g., "Run @step-1-ideation to start your project")

---

## Safety Notes

- **Never delete files** unless explicitly part of a cleanup
- **Create backups** before modifying existing files
- **Ask for confirmation** before major changes (platform installs)
- **Preserve existing content** when enhancing files
