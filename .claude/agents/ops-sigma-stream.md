---
name: sigma-stream
description: "DEPRECATED: This command has been renamed to @stream. All functionality preserved."
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# sigma-stream

**Source:** Sigma Protocol ops module
**Version:** 1.1.0

---


# @sigma-stream — DEPRECATED

> **This command has been renamed to `@stream`**
>
> All functionality has been preserved. Please use `@stream` going forward.

---

## Migration

The `@sigma-stream` command is now `@stream`:

| Old Command | New Command |
|-------------|-------------|
| `@sigma-stream --name=A` | `@stream --name=A` |
| `@sigma-stream --name=B --auto-register=true` | `@stream --name=B --auto-register=true` |
| `@sigma-stream --verify-stories=false` | `@stream --verify-stories=false` |

---

## Why the Change?

We're standardizing command names to be more direct and intuitive:

- The command runs a stream worker, so it's called `@stream`
- No need for the "sigma-" prefix on operation commands

This makes commands easier to remember and type.

---

## Action

**Please run `@stream --name=X` instead.**

The new command has identical functionality with improved documentation.

