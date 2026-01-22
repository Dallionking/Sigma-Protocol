---
name: sigma-simplify
description: "DEPRECATED: This command has been renamed to @simplify. All functionality preserved."
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# sigma-simplify

**Source:** Sigma Protocol audit module
**Version:** 1.1.0

---


# @sigma-simplify — DEPRECATED

> **This command has been renamed to `@simplify`**
>
> All functionality has been preserved. Please use `@simplify` going forward.

---

## Migration

The `@sigma-simplify` command is now `@simplify`:

| Old Command | New Command |
|-------------|-------------|
| `@sigma-simplify` | `@simplify` |
| `@sigma-simplify --scope=file` | `@simplify --scope=file` |
| `@sigma-simplify --dry-run` | `@simplify --dry-run` |

---

## Why the Change?

We're standardizing command names to be more direct and intuitive:

- The command simplifies code, so it's called `@simplify`
- No need for the "sigma-" prefix on utility commands

This makes commands easier to remember and type.

---

## Action

**Please run `@simplify` instead.**

The new command has identical functionality with improved documentation.

