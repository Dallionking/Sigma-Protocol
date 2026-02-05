# Codex Platform Configuration

**Platform:** OpenAI Codex
**Status:** Production
**Last Updated:** 2026-02-04

## Overview

Codex uses **project-scoped config** under `.codex/`, and **skills** under `.codex/skills/` in a repo (legacy fallback: `.agents/skills/`). It also auto-discovers `AGENTS.md` for project-wide instructions.

## Directory Structure

```
.codex/
├── config.toml         # Project config (optional)
└── rules/
    └── *.rules         # Starlark rules (optional)

.codex/
└── skills/
    └── <skill-name>/
        └── SKILL.md

.agents/
└── skills/
    └── <skill-name>/
        └── SKILL.md

AGENTS.md               # Project-wide instructions
```

## Official References

- Config basics: `.codex/config.toml` (project) + `~/.codex/config.toml` (user).
- Rules: `.codex/rules/*.rules` (Starlark).
- Skills: `.codex/skills/<skill>/SKILL.md` (repo + home; legacy: `.agents/skills/<skill>/SKILL.md`).
- AGENTS.md discovery order.

## Sigma Installation

```bash
# Install Sigma commands as Codex skills
sigma install --platform codex

# Install foundation skills (shared across platforms)
sigma install-skills --platform codex
```

## Notes

- **Steps remain full prompts.** Codex uses skills to preserve full step content.
- **No subagent indirection.** Steps are installed as direct skills (no wrapper commands).

## Related Documentation

- [PLATFORMS.md](../../docs/PLATFORMS.md)
- [COMMANDS.md](../../docs/COMMANDS.md)
- [FOUNDATION-SKILLS.md](../../docs/FOUNDATION-SKILLS.md)
