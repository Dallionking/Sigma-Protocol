---
description: Simplify code using @sigma-simplify
---

# /maid/simplify

Run `@sigma-simplify --scope=recent` to simplify recently modified code.

## What This Does

Invokes the existing `@sigma-simplify` command which:

1. **Scans for complexity issues:**
   - Nested ternaries and conditionals
   - Long functions (>50 lines)
   - Deep nesting (>3 levels)
   - Complex expressions

2. **Finds redundancy:**
   - Duplicate code patterns
   - Unused imports/variables
   - Dead code paths

3. **Improves clarity:**
   - Naming suggestions
   - Structure improvements
   - Documentation gaps

## Scope Options

- `--scope=recent` - Recently modified files (default)
- `--scope=file --file=<path>` - Specific file
- `--scope=directory --dir=<path>` - Specific directory

## Depth Options

- `--depth=quick` - Fast surface-level scan
- `--depth=standard` - Normal analysis (default)
- `--depth=deep` - Thorough analysis (slower)

## Usage

```bash
# Simplify recent changes
@sigma-simplify --scope=recent

# Deep analysis of specific file
@sigma-simplify --scope=file --file=src/utils/helpers.ts --depth=deep

# Preview without changes
@sigma-simplify --scope=recent --dry-run
```

**Related:** Run `@maid --cleanup` first to remove cruft files.


