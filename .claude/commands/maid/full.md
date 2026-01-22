---
description: Run full maintenance suite (cleanup + simplify)
---

# /maid/full

Run `@maid --all` for the complete repository maintenance experience.

## What This Does

Runs both cleanup and simplification in sequence:

### Phase 1: File Cleanup
1. Creates Git backup tag
2. Detects stale git worktrees
3. Content-aware file analysis
4. Cross-reference validation
5. Organizes files into review folders

### Phase 2: Code Simplification
1. Scans recently modified code
2. Identifies complexity issues
3. Finds redundancy patterns
4. Suggests clarity improvements

### Phase 3: Unified Report
- Combined results from both phases
- Prioritized action items
- Quick wins highlighted

## When to Use

**Sunday Maintenance**: Run this command during low-stakes times to clean up accumulated cruft and simplify code that's gotten complex.

## Usage

```bash
# Full maintenance suite
@maid --all

# Preview what would change
@maid --all --dry-run

# Full suite with deep analysis
@maid --all --deep-analysis
```

## After Running

1. Review files in `.deleted/review/`
2. Confirm deletions if satisfied
3. Run `@maid --confirm-delete` to finalize
4. Commit the cleanup: `git add -A && git commit -m "chore: repository maintenance"`

**Pro Tip:** Run this weekly or before major releases to keep your codebase lean.


