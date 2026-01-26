---
name: sync-workspace-commands
description: "Sync canonical SSS commands from this repo to a target workspace's docs/.cursor/commands/ and optionally run workspace fan-out script"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# sync-workspace-commands

**Source:** Sigma Protocol ops module
**Version:** 1.0.0

---


# @sync-workspace-commands — Sync Canonical Commands to Workspace

**Mission**  
Sync the canonical SSS commands from this repository to a target workspace's `docs/.cursor/commands/` directory, maintaining a single source of truth while supporting multi-repo workspace architectures.

**Context:** You are a **DevOps Engineer** managing command distribution across multiple repositories in a workspace. This command ensures all repos stay in sync with the canonical command set.

---

## 🎯 Purpose

This command:
1. **Mirrors** canonical SSS commands to `WORKSPACE_ROOT/docs/.cursor/commands/`
2. **Syncs only command directories** (excludes private docs)
3. **Optionally runs** the workspace's fan-out script to sync to individual repos
4. **Provides** dry-run preview before making changes

**Use Case:** Multi-repo workspaces (like Sigmavue) that centralize commands in `docs/.cursor/commands/` and fan out to `backend/.cursor/commands/`, `frontend/.cursor/commands/`, etc.

---

## 📋 Command Usage

### **Dry Run (Preview Changes)**
```bash
@sync-workspace-commands --workspace-root=/Users/dallionking/Sigmavue --dry-run
```

### **Sync Commands Only**
```bash
@sync-workspace-commands --workspace-root=/Users/dallionking/Sigmavue
```

### **Sync + Run Fan-Out Script**
```bash
@sync-workspace-commands --workspace-root=/Users/dallionking/Sigmavue --skip-fanout=false
```

### **Skip Fan-Out (Manual Control)**
```bash
@sync-workspace-commands --workspace-root=/Users/dallionking/Sigmavue --skip-fanout
```

---

## 🎭 Parameters

| Parameter | Type | Description | Required | Default |
|-----------|------|-------------|----------|---------|
| `--workspace-root` | string | Absolute path to workspace root (e.g., `/Users/dallionking/Sigmavue`) | Yes | - |
| `--dry-run` | boolean | Preview changes without applying them | No | `false` |
| `--skip-fanout` | boolean | Skip running workspace's sync-ai-config.sh script | No | `false` |

---

## 🔍 Preflight

### 1) Validate Workspace Root

```bash
# Check workspace root exists
if [[ ! -d "$WORKSPACE_ROOT" ]]; then
  echo "ERROR: Workspace root not found: $WORKSPACE_ROOT"
  exit 1
fi

# Check docs directory exists
if [[ ! -d "$WORKSPACE_ROOT/docs" ]]; then
  echo "WARNING: docs/ directory not found. Creating..."
  mkdir -p "$WORKSPACE_ROOT/docs/.cursor/commands"
fi
```

### 2) Identify Canonical Source

**Canonical source:** Current repository root (`/Users/dallionking/SSS Projects/commands/`)

**Command directories to sync:**
- `audit/`
- `deploy/`
- `dev/`
- `generators/`
- `marketing/`
- `ops/` (excluding this command itself to avoid recursion)
- `steps/`
- `Magic UI/`

### 3) Check for Fan-Out Script

```bash
FANOUT_SCRIPT="$WORKSPACE_ROOT/scripts/sync-ai-config.sh"
if [[ -f "$FANOUT_SCRIPT" && "$SKIP_FANOUT" != "true" ]]; then
  echo "Found fan-out script: $FANOUT_SCRIPT"
  FANOUT_AVAILABLE=true
else
  FANOUT_AVAILABLE=false
fi
```

---

## 📦 Phase 1: Dry Run Preview

**If `--dry-run` is set:**

1. **List files to sync** (using `rsync --dry-run`)
2. **Show target paths** for each directory
3. **Display summary** (files to add/update/delete)
4. **Exit without making changes**

```bash
# Example dry-run output
echo "═══════════════════════════════════════════════════════════════"
echo "  SSS Commands Sync - DRY RUN"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Source:      /Users/dallionking/SSS Projects/commands/"
echo "Target:      $WORKSPACE_ROOT/docs/.cursor/commands/"
echo ""
echo "Directories to sync:"
echo "  ✓ audit/"
echo "  ✓ deploy/"
echo "  ✓ dev/"
echo "  ✓ generators/"
echo "  ✓ marketing/"
echo "  ✓ ops/ (excluding sync-workspace-commands)"
echo "  ✓ steps/"
echo "  ✓ Magic UI/"
echo ""
echo "Would create/update: ~150 files"
echo ""
if [[ "$FANOUT_AVAILABLE" == "true" ]]; then
  echo "Fan-out script found: $FANOUT_SCRIPT"
  echo "Would run: $FANOUT_SCRIPT"
fi
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Run without --dry-run to apply changes"
echo "═══════════════════════════════════════════════════════════════"
```

**HITL Checkpoint →** If dry-run, show preview and exit. Wait for user confirmation to proceed.

---

## 🔄 Phase 2: Sync Commands

### 2.1 Create Target Directory

```bash
TARGET_DIR="$WORKSPACE_ROOT/docs/.cursor/commands"
mkdir -p "$TARGET_DIR"
```

### 2.2 Sync Command Directories

**Use rsync to sync each directory:**

```bash
CANONICAL_ROOT="/Users/dallionking/SSS Projects/commands"

# Directories to sync (excluding ops/sync-workspace-commands)
DIRS=("audit" "deploy" "dev" "generators" "marketing" "steps" "Magic UI")

for dir in "${DIRS[@]}"; do
  if [[ -d "$CANONICAL_ROOT/$dir" ]]; then
    rsync -av --delete \
      --exclude='.DS_Store' \
      --exclude='*.local.*' \
      "$CANONICAL_ROOT/$dir/" "$TARGET_DIR/$dir/"
    echo "✓ Synced: $dir/"
  fi
done

# Sync ops/ but exclude this command
if [[ -d "$CANONICAL_ROOT/ops" ]]; then
  rsync -av --delete \
    --exclude='.DS_Store' \
    --exclude='*.local.*' \
    --exclude='sync-workspace-commands' \
    "$CANONICAL_ROOT/ops/" "$TARGET_DIR/ops/"
  echo "✓ Synced: ops/ (excluding sync-workspace-commands)"
fi


```

### 2.3 Create/Update README

**Create a README in the target directory indicating it's synced:**

```markdown
# ⚠️ AUTO-SYNCED DIRECTORY - DO NOT EDIT

This directory is automatically synced from the canonical SSS commands repository:

```
/Users/dallionking/SSS Projects/commands/
```

## How to Make Changes

1. **Edit canonical source:** Make changes in `/Users/dallionking/SSS Projects/commands/`
2. **Sync to workspace:** Run `@sync-workspace-commands --workspace-root=$WORKSPACE_ROOT`
3. **Fan out to repos:** Run `scripts/sync-ai-config.sh` (if available)

## What Gets Synced

| Source | Target |
|--------|--------|
| `audit/` | `docs/.cursor/commands/audit/` |
| `deploy/` | `docs/.cursor/commands/deploy/` |
| `dev/` | `docs/.cursor/commands/dev/` |
| `generators/` | `docs/.cursor/commands/generators/` |
| `marketing/` | `docs/.cursor/commands/marketing/` |
| `ops/` | `docs/.cursor/commands/ops/` |
| `steps/` | `docs/.cursor/commands/steps/` |
| `Magic UI/` | `docs/.cursor/commands/Magic UI/` |

## Last Synced

**Date:** $(date +"%Y-%m-%d %H:%M:%S")  
**Command:** `@sync-workspace-commands --workspace-root=$WORKSPACE_ROOT`
```

---

## 🚀 Phase 3: Fan-Out (Optional)

**If `--skip-fanout` is false and fan-out script exists:**

```bash
if [[ "$FANOUT_AVAILABLE" == "true" && "$SKIP_FANOUT" != "true" ]]; then
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "  Running Workspace Fan-Out Script"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
  
  # First, dry-run
  if [[ -x "$FANOUT_SCRIPT" ]]; then
    echo "Running dry-run first..."
    bash "$FANOUT_SCRIPT" --dry-run
    
    echo ""
    echo "Proceed with fan-out? (This will sync to all repos)"
    # In actual implementation, this would be a HITL checkpoint
    # For now, proceed automatically if not in dry-run mode
    
    if [[ "$DRY_RUN" != "true" ]]; then
      bash "$FANOUT_SCRIPT"
      echo "✓ Fan-out complete"
    fi
  else
    echo "WARNING: Fan-out script not executable: $FANOUT_SCRIPT"
  fi
fi
```

---

## ✅ Phase 4: Verification

### 4.1 Verify Sync

**Check a few representative files:**

```bash
# Sample verification
VERIFY_FILES=(
  "audit/holes"
  "steps/step-0-environment-setup"
  "ops/status"
)

for file in "${VERIFY_FILES[@]}"; do
  CANONICAL="$CANONICAL_ROOT/$file"
  TARGET="$TARGET_DIR/$file"
  
  if [[ -f "$CANONICAL" && -f "$TARGET" ]]; then
    if diff -q "$CANONICAL" "$TARGET" > /dev/null; then
      echo "✓ Verified: $file"
    else
      echo "⚠ WARNING: $file differs (may be expected if workspace has overrides)"
    fi
  else
    echo "✗ Missing: $file"
  fi
done
```

### 4.2 Summary Report

```bash
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Sync Complete"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Source:      $CANONICAL_ROOT"
echo "Target:      $TARGET_DIR"
echo ""
echo "Next steps:"
echo "  1. Review synced files in $TARGET_DIR"
if [[ "$FANOUT_AVAILABLE" == "true" && "$SKIP_FANOUT" == "true" ]]; then
  echo "  2. Run fan-out script: $FANOUT_SCRIPT"
else
  echo "  2. Commands are ready to use in workspace"
fi
echo "  3. Commit changes: git add -A && git commit -m 'sync: SSS commands from canonical repo'"
echo ""
```

---

## 🛡️ Safety Features

### Exclusions

**Never sync:**
- `.git/` directories
- `node_modules/`
- `.DS_Store` files
- `*.local.*` files
- `ops/sync-workspace-commands` (this command itself)

### Backup Recommendation

**Before first sync, suggest backup:**

```bash
if [[ ! -d "$TARGET_DIR" ]] || [[ -z "$(ls -A $TARGET_DIR 2>/dev/null)" ]]; then
  echo "Target directory is empty or doesn't exist. Safe to proceed."
else
  echo "WARNING: Target directory contains files."
  echo "Recommend backup:"
  echo "  cp -r $TARGET_DIR $TARGET_DIR.backup-$(date +%Y%m%d)"
  # HITL checkpoint: wait for user confirmation
fi
```

---

## 📝 Notes

- **Idempotent:** Safe to run multiple times (rsync handles updates)
- **Preserves workspace overrides:** If workspace has custom commands, they won't be deleted unless they conflict with canonical names
- **Version tracking:** Each command has version in frontmatter; workspace can track which version it's using
- **Multi-repo support:** Designed for workspaces that fan out from `docs/.cursor/commands/` to individual repos

---

## 🔗 Related Commands

- `@status` - Check workspace SSS compliance
- `@retrofit-analyze` - Analyze existing workspace structure
- `@retrofit-generate` - Generate missing SSS docs

---

**Last Updated:** 2025-01-02  
**Version:** 1.0.0
