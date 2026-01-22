---
name: sigma-orchestrate
description: "DEPRECATED: This command has been renamed to @orchestrate. All functionality preserved."
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch

---

# sigma-orchestrate

**Source:** Sigma Protocol ops module
**Version:** 1.1.0

---


# @sigma-orchestrate — DEPRECATED

> **This command has been renamed to `@orchestrate`**
>
> All functionality has been preserved. Please use `@orchestrate` going forward.

---

## Migration

The `@sigma-orchestrate` command is now `@orchestrate`:

| Old Command | New Command |
|-------------|-------------|
| `@sigma-orchestrate` | `@orchestrate` |
| `@sigma-orchestrate --mode=semi-auto` | `@orchestrate --mode=semi-auto` |
| `@sigma-orchestrate --auto-merge=true` | `@orchestrate --auto-merge=true` |

---

## Why the Change?

We're standardizing command names to be more direct and intuitive:

- The command orchestrates multi-agent workflows, so it's called `@orchestrate`
- No need for the "sigma-" prefix on operation commands

This makes commands easier to remember and type.

---

## Action

**Please run `@orchestrate` instead.**

The new command has identical functionality with improved documentation.

