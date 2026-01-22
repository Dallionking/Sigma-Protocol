---
description: Run content-aware file cleanup and organization
---

# /maid/cleanup

Run `@maid --cleanup` for intelligent repository cleanup.

## What This Does

1. Creates a Git backup tag for safety
2. Detects forgotten git worktrees
3. Scans repository for cleanup opportunities
4. **Reads file contents** to understand purpose before categorizing
5. Validates cross-references to check if files are actually needed
6. Categorizes files:
   - **Category A:** Safe to delete → `.deleted/confirmed/`
   - **Category B:** Needs review → `.deleted/review/`
   - **Category C:** Protected → Never touched
7. Generates detailed, actionable report

## Flags

- `--dry-run` - Preview what would be organized without making changes
- `--deep-analysis` - Enable content reading and cross-reference validation (slower but smarter)
- `--check-worktrees` - Only check for stale git worktrees

## Usage

```bash
# Full cleanup analysis
@maid --cleanup --deep-analysis

# Preview only
@maid --cleanup --dry-run
```

**Related:** Run `@maid --simplify` after cleanup to improve code quality.


