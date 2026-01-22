---
name: sigma-continue
description: "DEPRECATED: This command has been renamed to @continue. All functionality preserved."
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# sigma-continue

**Source:** Sigma Protocol ops module
**Version:** 1.2.0

---


# @sigma-continue — DEPRECATED

> **This command has been renamed to `@continue`**
>
> All functionality has been preserved. Please use `@continue` going forward.

---

## Migration

The `@sigma-continue` command is now `@continue`:

| Old Command | New Command |
|-------------|-------------|
| `@sigma-continue` | `@continue` |
| `@sigma-continue --mode=auto` | `@continue --mode=auto` |
| `@sigma-continue --ralph` | `@continue --ralph` |

---

## Why the Change?

We're standardizing command names to be more direct and intuitive:

- Step commands keep their `step-` prefix (e.g., `@step-1-ideation`)
- Operation commands use direct names (e.g., `@continue`, `@orchestrate`)

This makes commands easier to remember and type.

---

## Action

**Please run `@continue` instead.**

The new command has identical functionality with improved documentation.

