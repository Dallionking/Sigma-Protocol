---
name: cleanup-repo
description: "DEPRECATED: This command has been renamed to @maid. All functionality preserved."
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# cleanup-repo

**Source:** Sigma Protocol ops module
**Version:** 3.1.0

---


# @cleanup-repo — DEPRECATED

> ⚠️ **This command has been renamed to `@maid`**
>
> All functionality has been preserved. Please use `@maid` going forward.

---

## Migration

The `/cleanup-repo` command is now `@maid` with additional features:

| Old Command | New Command |
|-------------|-------------|
| `@cleanup-repo --analyze` | `@maid --analyze` |
| `@cleanup-repo --confirm-delete` | `@maid --confirm-delete` |
| `@cleanup-repo --check-worktrees` | `@maid --check-worktrees` |

### New Features in @maid

- `@maid --simplify` - Code simplification via `@simplify`
- `@maid --all` - Full maintenance suite (cleanup + simplify)

---

## Automatic Redirect

<goal>
When this command is invoked, inform the user about the rename and then execute `@maid` with the same parameters.

1. Display: "ℹ️ @cleanup-repo has been renamed to @maid. Redirecting..."
2. Run the equivalent @maid command with all passed parameters
</goal>

---

*This alias exists for backward compatibility. Please update your workflows to use `@maid`.*
