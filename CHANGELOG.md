# Changelog

All notable changes to Sigma Protocol are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-alpha.2] - 2026-02-05

### Added
- **Claude Code-first architecture**: Claude Code is now the primary platform. All skills, commands, and agents are authored in `.claude/` and synced outward.
- **Agent Teams support**: Native multi-agent collaboration using Claude Code v2.1.32 `TeammateTool` and `SendMessage`.
- **CLAUDE.md.example template**: Users copy this to create project-specific `CLAUDE.md` (now gitignored).
- **CHANGELOG.md**: This file, following Keep a Changelog format.
- **GitHub issue/PR templates**: Bug reports, feature requests, and PR checklists.
- **CODE_OF_CONDUCT.md**: Contributor Covenant v2.1.
- **Troubleshooting section** in README for common issues (MCP tools, step verification, CLI setup).
- **Codex platform** configuration (`.codex/`, `.agents/skills/`) with SKILL.md folder format.
- **Antigravity platform** experimental support (`.agent/` + `SKILL.md`).
- **SLAS (Self-Learning Agent System)**: Session hooks, developer preference distillation, cross-platform sync.
- **`/platform-sync` command**: Weekly changelog scout across all supported platforms.
- **12 new skills** including `marketing-copywriting`, `launch-strategy`, `seo-audit`, and more.
- **Research-First Planning**: `deep-research` skill auto-invoked before planning sessions.
- **Ralph Loop enhancements**: PRD-to-JSON conversion steps (5b, 11a), swarm orchestration (11b).
- **Boilerplate templates**: `nextjs-saas`, `nextjs-ai`, `expo-mobile`, `tanstack-saas`, `nextjs-portable`.

### Changed
- **README.md** rewritten for open-source readiness: git clone install, lowercase repo URLs, "What's New" section, badges, troubleshooting.
- **Platform support table** updated: Claude Code = Primary, Cursor = Secondary, OpenCode/Codex = Planned, Antigravity = Experimental.
- **docs/PLATFORMS.md** updated with accurate deployment status and skill counts.
- **Step commands** refactored to be Claude Code-first (removing Cursor-specific assumptions).
- **Version badge** updated from 1.0.0-alpha.1 to 1.0.0-alpha.2.
- **Step 12 (Context Engine)** refactored to generate platform-agnostic context, not just `.cursorrules`.

### Deprecated
- **`.agents/skills/` directory** for Codex: Use `.codex/skills/` instead (legacy path still supported).
- **`npm install -g sigma-protocol`**: Package is not published; use `git clone` instead.

### Removed
- **Legacy agent files** from `.claude/agents-legacy/`.
- **Tracked CLAUDE.md**: Now gitignored; use `CLAUDE.md.example` as starting template.

## [1.0.0-alpha.1] - 2026-02-04

### Added
- **13-step workflow** from ideation to deployment with quality gates.
- **185+ commands** across 7 categories: steps, dev, ops, audit, deploy, generators, marketing.
- **151 skills** for Claude Code (canonical source).
- **Platform support**: Claude Code, OpenCode, Codex, Cursor, Factory Droid.
- **Ralph Loop** autonomous implementation (`sigma-ralph.sh`).
- **CLI** (`sigma` command) with interactive menu, project wizard, retrofit, doctor, search.
- **Quality gates** with 100-point verification scoring (target: 80+).
- **HITL checkpoints** at critical decision points in every step.
- **Hormozi Value Equation** integration in ideation and feature evaluation.
- **Multi-agent orchestration** via Sigma Streams and Ralph Loop.
- **Cross-platform sync script** (`sync-skills-to-platforms.sh`).
- **27 Cursor rules** (.mdc format, condensed from full skills).
- **163 Factory Droid skills** with droid subagent support.

### Changed
- **Renamed from SSS-Protocol** to Sigma Protocol globally.
- **Unified platform structure** under `platforms/` directory.

## [0.5.0] - 2026-01-28

### Added
- **Platform unification** (`v5.0`): Consolidated all platform configs under consistent structure.
- **Factory Droid integration**: Full skill and droid configuration.
- **OpenCode support**: Config designed with singular `skill/` and `agent/` directories.
- Initial **PLATFORMS.md** and **platform-versions.json** for tracking.

### Changed
- Comprehensive cleanup of duplicate and legacy files.
- Standardized skill format across all platforms (YAML frontmatter + markdown body).

[1.0.0-alpha.2]: https://github.com/dallionking/sigma-protocol/compare/v1.0.0-alpha.1...HEAD
[1.0.0-alpha.1]: https://github.com/dallionking/sigma-protocol/compare/v0.5.0...v1.0.0-alpha.1
[0.5.0]: https://github.com/dallionking/sigma-protocol/releases/tag/v0.5.0
