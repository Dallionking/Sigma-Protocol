# Antigravity Commands Directory

This directory contains executable commands for Google's Antigravity platform.

## Directory Structure

```
commands/
├── README.md                    # This file
├── <command-name>.md            # Command definition
└── ...
```

## Command Format

Commands use markdown files with YAML frontmatter:

```yaml
---
name: command-name               # Required: command identifier
description: "What this does"    # Required: brief description
category: dev                    # Optional: dev|ops|audit|deploy|generators|marketing
invoke: skill                    # Optional: skill|bash|composite
skill: skill-name                # Optional: skill to invoke (if invoke: skill)
args:                            # Optional: argument configuration
  prd: $ARGUMENTS
---

# Command Name

Command instructions or content...
```

## Command Types

### 1. Skill-Invoking Commands

Invoke a skill with arguments:

```yaml
---
name: implement-feature
description: "Implement a feature from PRD"
invoke: skill
skill: executing-plans
---

Implement the feature described in the provided PRD.
```

### 2. Bash Commands

Execute shell commands:

```yaml
---
name: run-tests
description: "Run test suite"
invoke: bash
---

npm test
```

### 3. Composite Commands

Chain multiple actions:

```yaml
---
name: deploy-staging
description: "Build and deploy to staging"
invoke: composite
steps:
  - command: run-tests
  - command: build
  - bash: npm run deploy:staging
---

Deploy pipeline: test, build, deploy.
```

## Available Commands

Commands are synchronized from Sigma Protocol. Run sync to populate:

```bash
./scripts/sync-platforms.sh antigravity --commands
```

## Creating Custom Commands

1. Create a new `.md` file in this directory
2. Add proper frontmatter
3. Write command instructions

Example:

```bash
touch commands/my-command.md
```

## Command Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `dev` | Development tasks | implement-prd, plan, db-migrate |
| `ops` | Operations | pr-review, sprint-plan, status |
| `audit` | Quality audits | security-audit, accessibility-audit |
| `deploy` | Deployment | ship-stage, ship-prod, ship-check |
| `generators` | Code generation | scaffold, new-feature, new-project |
| `marketing` | Marketing | market-research, landing-page-copy |

## Usage in Antigravity

```bash
# List available commands
antigravity commands list

# Run a command
antigravity run <command-name>

# Run with arguments
antigravity run implement-prd "Add user authentication"
```

## Related Documentation

- [Antigravity README](../README.md) - Platform overview
- [Skills Directory](../skills/README.md) - Available skills
- [WORKFLOW-OVERVIEW.md](../../../docs/WORKFLOW-OVERVIEW.md) - Full methodology
