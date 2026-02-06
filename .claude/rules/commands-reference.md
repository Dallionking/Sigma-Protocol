# Sigma Protocol - Commands Reference

## Core Steps
| Command | Description |
|---------|-------------|
| `/step-1-ideation` | Product Ideation with Hormozi Value Equation |
| `/step-2-architecture` | System Architecture Design |
| `/step-3-ux-design` | UX/UI Design & User Flows |
| `/step-4-flow-tree` | Navigation Flow & Screen Inventory |
| `/step-5-wireframe-prototypes` | Wireframe Prototypes |
| `/step-5b-prd-to-json` | **Ralph-Mode:** Convert prototype PRDs to JSON |
| `/step-6-design-system` | Design System & Tokens |
| `/step-7-interface-states` | Interface State Specifications |
| `/step-8-technical-spec` | Technical Specifications |
| `/step-9-landing-page` | Landing Page Design |
| `/step-10-feature-breakdown` | Feature Breakdown |
| `/step-11-prd-generation` | PRD Generation |
| `/step-11a-prd-to-json` | **Ralph-Mode:** Convert implementation PRDs to JSON |
| `/step-11b-prd-swarm` | PRD Swarm Orchestration (supports Ralph-mode) |
| `/step-12-context-engine` | Context Engine Setup |
| `/step-13-skillpack-generator` | Generate project skillpack |

## Ralph Loop (Autonomous Implementation)
| Command | Description |
|---------|-------------|
| `./scripts/ralph/sigma-ralph.sh` | Run Ralph loop on prd.json backlog |

**Ralph Mode Usage:**
```bash
# 1. Convert PRDs to JSON
claude "Run step-5b-prd-to-json --all-prds"

# 2. Run Ralph loop (in terminal)
./scripts/ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code
```

## Audit Commands
| Command | Description |
|---------|-------------|
| `/security-audit` | Security vulnerability assessment (spawns security-lead + team) |
| `/threat-model` | STRIDE/PASTA threat analysis via security-lead |
| `/compliance-check` | Regulatory compliance audit (`--framework SOC2\|GDPR\|HIPAA`) via security-compliance agent |
| `/dependency-audit` | Supply chain and dependency security scan via security-infra agent |
| `/accessibility-audit` | WCAG compliance check |
| `/performance-check` | Performance analysis |
| `/gap-analysis` | PRD coverage analysis |

## Dev Commands
| Command | Description |
|---------|-------------|
| `/implement-prd` | Implement a PRD feature |
| `/plan` | Create implementation plan |

## Review Commands
| Command | Description |
|---------|-------------|
| `/greptile-pr-review` | AI-powered PR review via Greptile MCP (codebase-aware) |
| `/pr-review` | Sigma structural PR review (PRD/architecture/design compliance) |

## Ops Commands
| Command | Description |
|---------|-------------|
| `/sprint-plan` | Sprint planning |
| `/status` | Project status check |
| `/daily-standup` | Daily standup report |
| `/backlog-groom` | Backlog grooming |
| `/platform-sync` | Sync with platform changelogs (run weekly) |

## Deploy Commands
| Command | Description |
|---------|-------------|
| `/ship-stage` | Deploy to staging |
| `/ship-prod` | Deploy to production |
| `/ship-check` | Pre-deployment validation |
| `/client-handoff` | Generate client handoff docs |

## Generator Commands
| Command | Description |
|---------|-------------|
| `/new-feature` | Create new feature PRD |
| `/new-project` | Scaffold new project |
| `/scaffold` | Scaffold feature code |
| `/proposal` | Generate client proposal |
| `/contract` | Generate contract |

## Marketing Commands
| Command | Description |
|---------|-------------|
| `/01-market-research` | Market research & competitive analysis |
| `/02-customer-avatar` | Customer avatar development |
| `/04-offer-architect` | Hormozi offer architecture |
| `/07-landing-page-copy` | Landing page copywriting |
| `/08-ads-strategy` | Multi-platform ad strategy |

> **Note:** 185+ total commands available. Run `/help` to see all commands.
