# SSS Generator Commands

Code and document generation commands.

## Overview

Generator commands create boilerplate code, tests, documentation, and project structures.

## Command List

| Command | Description | Output |
|---------|-------------|--------|
| `@scaffold` | Generate project scaffolding | Files, directories |
| `@new-feature` | Create new feature structure | Feature files |
| `@new-project` | Initialize new SSS project | Full project structure |
| `@new-command` | Create new SSS command | Command file |
| `@test-gen` | Generate tests from PRD | Test files |
| `@api-docs-gen` | Generate API documentation | OpenAPI spec |
| `@wireframe` | Generate wireframe spec | Wireframe markdown |
| `@changelog` | Generate changelog | CHANGELOG.md |
| `@contract` | Generate contract template | Contract document |
| `@nda` | Generate NDA template | NDA document |
| `@proposal` | Generate project proposal | Proposal document |
| `@prototype-proposal` | Generate prototype proposal | Proposal document |
| `@estimation-engine` | Estimate project scope | Estimation report |
| `@cost-optimizer` | Optimize project costs | Cost analysis |
| `@notebooklm-format` | Format for NotebookLM | Formatted documents |

## Usage

### Scaffolding

```bash
# Scaffold a feature from PRD
@scaffold --prd-id=F1

# The command will:
# 1. Read PRD specifications
# 2. Create directory structure
# 3. Generate component files
# 4. Create test stubs
# 5. Update imports
```

### Test Generation

```bash
# Generate tests for a PRD
@test-gen --prd-id=F1 --framework=vitest

# Creates:
# - Unit tests from acceptance criteria
# - Integration tests for API
# - E2E test stubs
```

### API Documentation

```bash
# Generate API docs from implementation
@api-docs-gen --output=openapi.yaml
```

## Related

- [implement-prd](../dev/implement-prd) - Uses generators
- [QA-SYSTEM.md](../docs/qa/QA-SYSTEM.md) - Test generation

