# SSS Protocol Versioning

**Version:** 5.0
**Last Updated:** 2026-01-25
**Maintainer:** Sigma Protocol Team

---

## Overview

SSS Protocol follows semantic versioning with major releases representing significant methodology changes, new platform support, or architectural improvements.

---

## Version History

| Version | Release Date | Highlights |
|---------|--------------|------------|
| **5.0** | 2026-01-25 | Ralph Loop v3 with native tasks, Factory Droid platform, 163 total skills, sandbox execution (Docker/E2B/Daytona), PostToolUse hooks |
| **4.0** | 2026-01-15 | Ralph-Mode autonomous implementation, PRD-to-JSON conversion, Agent Browser UI validation, Taskmaster MCP integration |
| **3.0** | 2025-12-29 | Agentic layer with tracking system, QA commands, review system, Thread-Based Engineering framework |
| **2.0** | 2025-11-01 | Multi-platform support (Cursor, Claude Code, OpenCode), P-Thread orchestration, swarm-based parallel development |
| **1.0** | 2025-09-01 | Initial 13-step methodology, Hormozi Value Equation integration, foundation skills |

---

## Step Registry

The SSS Protocol consists of 18 steps (13 core + 5 auxiliary).

### Core Steps

| Step | ID | Command | Description |
|------|------|---------|-------------|
| 0 | `step-0` | `/step-0-environment-setup` | Environment validation and skill installation |
| 1 | `step-1` | `/step-1-ideation` | Product ideation with Hormozi Value Equation |
| 1.5 | `step-1.5` | `/step-1.5-offer-architecture` | Offer design for monetized products |
| 2 | `step-2` | `/step-2-architecture` | System architecture design |
| 3 | `step-3` | `/step-3-ux-design` | UX/UI design and user flows |
| 4 | `step-4` | `/step-4-flow-tree` | Navigation flow and screen inventory |
| 5 | `step-5` | `/step-5-wireframe-prototypes` | Wireframe prototypes |
| 5a | `step-5a` | `/step-5a-prototype-prep` | Prototype preparation for Ralph |
| 5b | `step-5b` | `/step-5b-prd-to-json` | Convert prototype PRDs to Ralph JSON |
| 6 | `step-6` | `/step-6-design-system` | Design system and tokens |
| 7 | `step-7` | `/step-7-interface-states` | Interface state specifications |
| 8 | `step-8` | `/step-8-technical-spec` | Technical specifications |
| 9 | `step-9` | `/step-9-landing-page` | Landing page design (optional) |
| 10 | `step-10` | `/step-10-feature-breakdown` | Feature breakdown |
| 11 | `step-11` | `/step-11-prd-generation` | PRD generation |
| 11a | `step-11a` | `/step-11a-prd-to-json` | Convert implementation PRDs to Ralph JSON |
| 11b | `step-11b` | `/step-11b-prd-swarm` | PRD swarm orchestration |
| 12 | `step-12` | `/step-12-context-engine` | Context engine setup (.cursorrules) |
| 13 | `step-13` | `/step-13-skillpack-generator` | Generate project skillpack |

---

## Semantic Versioning

SSS Protocol follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

### Version Components

| Component | When to Increment | Examples |
|-----------|------------------|----------|
| **MAJOR** | Breaking changes to methodology, new platforms, architectural shifts | 4.0 -> 5.0 (Ralph v3, Factory Droid) |
| **MINOR** | New features, commands, skills (backward compatible) | 5.0 -> 5.1 (new audit command) |
| **PATCH** | Bug fixes, documentation updates, minor improvements | 5.0.0 -> 5.0.1 (typo fix) |

### Pre-release Identifiers

For development versions:

- `5.1.0-alpha.1` - Early development
- `5.1.0-beta.1` - Feature complete, testing
- `5.1.0-rc.1` - Release candidate

### Build Metadata

Optional build metadata for CI/CD:

- `5.0.0+20260125` - Build date
- `5.0.0+commit.abc1234` - Git commit

---

## Compatibility Matrix

| SSS Version | Claude Code | OpenCode | Cursor | Factory Droid |
|-------------|-------------|----------|--------|---------------|
| 5.0 | 1.0+ | 1.0+ | 0.40+ | 1.0+ |
| 4.0 | 1.0+ | 1.0+ | 0.38+ | - |
| 3.0 | 0.9+ | 0.9+ | 0.35+ | - |
| 2.0 | 0.8+ | - | 0.30+ | - |
| 1.0 | 0.7+ | - | 0.25+ | - |

---

## Migration Guides

### Upgrading from 4.x to 5.0

1. **Run environment setup**: `@step-0-environment-setup`
2. **Update skill files**: `npx sigma-protocol install-skills --upgrade`
3. **Migrate Ralph backlogs**: Existing `prd.json` files are compatible
4. **Optional**: Set up Factory Droid with `./scripts/convert-to-factory.sh`

### Upgrading from 3.x to 4.x

1. **Convert PRDs to Ralph format**: `@step-11a-prd-to-json --all-prds`
2. **Install Taskmaster MCP** (recommended): `claude mcp add taskmaster-ai -- npx -y task-master-ai`
3. **Update workflow**: Use Ralph Loop for autonomous implementation

---

## Related Documentation

- [WORKFLOW-OVERVIEW.md](./WORKFLOW-OVERVIEW.md) - Complete workflow guide
- [PLATFORMS.md](./PLATFORMS.md) - Platform configurations
- [RALPH-MODE.md](./RALPH-MODE.md) - Ralph Loop documentation
- [COMMANDS.md](./COMMANDS.md) - Full command catalog
