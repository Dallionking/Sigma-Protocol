# Factory Droid Platform Builder

## Overview

The Factory Droid platform builder transforms Sigma Protocol skills into Factory Droid "droid" files (Markdown with YAML frontmatter) and generates the `.factory/` configuration directory and `platforms/factory-droid/` output directory.

Factory Droid is an AI-powered code review and automation platform with:
- 7M token session support
- Model routing via `reasoningEffort` (low/medium/high)
- GitHub workflow integration
- Automated PR reviews and fixes

## Architecture

The Factory Droid builder consists of 7 core components:

```
┌─────────────────────────────────────────────────────────────────┐
│                         Builder                                  │
│  Main orchestrator for droid generation workflow                │
└────────┬────────────────────────────────────────────────────────┘
         │
         ├──> Transformer ──┬──> ModelMapper
         │                  ├──> EffortAssigner
         │                  └──> ToolSelector
         │
         ├──> Validator
         │
         ├──> Writer
         │
         ├──> ConfigGenerator
         │
         └──> ReadmeGenerator
```

### Component Descriptions

| Component | Purpose | Key Logic |
|-----------|---------|-----------|
| **Builder** | Main orchestrator | Coordinates all components, manages build workflow |
| **Transformer** | Skill → Droid conversion | Transforms skill metadata + content to droid YAML + Markdown |
| **ModelMapper** | Complexity → Model mapping | `opus` for ARCHITECTURE/SECURITY, `haiku` for QUICK/FORMATTING, `sonnet` default |
| **EffortAssigner** | Complexity → reasoningEffort | `high` for architecture/security, `low` for formatting, `medium` default |
| **ToolSelector** | Requirements → Tool selection | Minimal tools based on skill globs and content keywords |
| **Validator** | Schema validation | Validates droid frontmatter against Factory Droid schema |
| **Writer** | File generation | Writes droids to `platforms/factory-droid/droids/` with proper formatting |

## Usage

### Basic Usage

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/dallionking/sigma-protocol/pkg/platform/factory"
)

func main() {
    // Create builder
    builder := factory.NewBuilder()

    // Build Factory Droid configuration
    // src: directory containing .claude/skills/
    // dest: output directory for .factory/ and platforms/factory-droid/
    err := builder.Build(context.Background(), ".", ".")
    if err != nil {
        log.Fatal(err)
    }

    // Get build metrics
    metrics := builder.GetMetrics()
    fmt.Printf("Generated %d droid files\n", metrics.Skills)
}
```

### Advanced Usage with Validation

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/dallionking/sigma-protocol/pkg/platform/factory"
)

func main() {
    builder := factory.NewBuilder()

    // Validate before building
    result, err := builder.Validate(".")
    if err != nil {
        log.Fatal(err)
    }

    if !result.Valid {
        fmt.Println("Validation errors:")
        for _, err := range result.Errors {
            fmt.Printf("  [%s] %s\n", err.Code, err.Message)
        }
        return
    }

    // Build
    if err := builder.Build(context.Background(), ".", "."); err != nil {
        log.Fatal(err)
    }

    // Get file list
    files := builder.GetFiles()
    fmt.Printf("Generated %d files:\n", len(files))
    for _, f := range files {
        fmt.Printf("  - %s (%s)\n", f.Path, f.Type)
    }
}
```

### Using via Platform Registry

```go
package main

import (
    "context"
    "log"

    "github.com/dallionking/sigma-protocol/pkg/platform"
    _ "github.com/dallionking/sigma-protocol/pkg/platform/factory" // Import for side effect (registration)
)

func main() {
    // Get builder from registry
    builder := platform.DefaultRegistry.Get("factory")
    if builder == nil {
        log.Fatal("Factory builder not found in registry")
    }

    // Build
    if err := builder.Build(context.Background(), ".", "."); err != nil {
        log.Fatal(err)
    }
}
```

## Model Mapping Rules

Models are selected based on skill tags and name patterns (priority order):

| Rule | Matcher | Model | Use Case |
|------|---------|-------|----------|
| 1 | Tag: `ARCHITECTURE` or `PLANNING` | `claude-opus-4-5-20251101` | System design, technical architecture, strategic planning |
| 2 | Tag: `SECURITY` or `REVIEW` | `claude-opus-4-5-20251101` | Security audits, threat modeling, code review |
| 3 | Tag: `QUICK` or `FORMATTING` | `claude-haiku-3-5-20250114` | Formatting, linting, simple tasks |
| 4 | Name contains `step-` | `claude-sonnet-4-5-20241022` | Workflow step commands |
| 5 | **Default** | `claude-sonnet-4-5-20241022` | General development tasks |

**Note:** Tag matching is case-insensitive. `architecture`, `Architecture`, and `ARCHITECTURE` all match.

## reasoningEffort Assignment

Reasoning effort determines token budget for extended thinking (priority order):

| Rule | Matcher | Effort | Token Budget | Use Case |
|------|---------|--------|--------------|----------|
| 1 | Tag: `ARCHITECTURE` or `PLANNING` | `high` | 500+ tokens | System design, strategic planning |
| 2 | Tag: `SECURITY` or `REVIEW` | `high` | 500+ tokens | Security analysis, code review |
| 3 | Tag: `RESEARCH` or `ANALYSIS` | `high` | 500+ tokens | Research, data analysis |
| 4 | Tag: `QUICK` or `FORMATTING` | `low` | < 100 tokens | Quick tasks, formatting |
| 5 | Tag: `SIMPLE` or `UTILITY` | `low` | < 100 tokens | Simple utilities |
| 6 | Name contains `step-` | `medium` | 100-500 tokens | Workflow steps |
| 7 | **Default** | `medium` | 100-500 tokens | General development |

## Tool Selection Logic

Tools are selected based on skill requirements (keyword matching in name/description/content):

| Tool | Always Included | Added When |
|------|----------------|-----------|
| `Read` | ✅ Yes | Always (base tool) |
| `Bash` | ✅ Yes | Always (base tool) |
| `Glob` | ❌ No | Skill has `globs` field (e.g., `*.go`, `*.tsx`) |
| `Grep` | ❌ No | Skill mentions "search" or "find" |
| `Write` | ❌ No | Skill mentions "write" or "create" |
| `Edit` | ❌ No | Skill mentions "edit" or "modify" |
| `WebFetch` | ❌ No | Skill mentions "web" or "fetch" |

**Design principle:** Minimize tool surface to reduce security risk and loading overhead.

## Testing

### Run All Tests

```bash
# Unit tests + integration tests
go test ./pkg/platform/factory/...

# With coverage
go test -cover ./pkg/platform/factory/...

# Verbose output
go test -v ./pkg/platform/factory/...
```

### Run Specific Test Suite

```bash
# Model mapper tests
go test -run TestModelMapper ./pkg/platform/factory/

# Effort assigner tests
go test -run TestEffortAssigner ./pkg/platform/factory/

# Tool selector tests
go test -run TestSelectTools ./pkg/platform/factory/

# Integration tests
go test -run TestFactoryDroidBuild ./pkg/platform/factory/
```

### Test Coverage Requirements

- **Target:** ≥ 85% coverage for all files
- **Critical paths:** Builder, Transformer, Validator should have ≥ 90%

```bash
# Generate coverage report
go test -coverprofile=coverage.out ./pkg/platform/factory/...
go tool cover -html=coverage.out
```

## Generated Directory Structure

The builder generates the following structure:

```
project/
├── .factory/
│   └── .droid.yaml              # Factory Droid config
└── platforms/factory-droid/
    ├── README.md                # Platform documentation
    └── droids/                  # Droid definitions (Markdown + YAML)
        ├── steps-step-1-ideation.md
        ├── audit-security-audit.md
        ├── dev-implement-prd.md
        └── ... (186 skills total)
```

### Droid File Format

```markdown
---
name: step-1-ideation
description: "Step 1: Ideation → PRD - Interactive research-backed product requirements"
model: claude-sonnet-4-5-20241022
reasoningEffort: medium
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# step-1-ideation

[Skill content here...]
```

### Config File Format

`.factory/.droid.yaml`:

```yaml
review:
  auto_review:
    enabled: true
    draft: false
    bot: false
  pr_summary: true
  file_summaries: true
  tips: true
  github_action_repair: true
```

## Validation

The validator checks:

1. **Name:** Non-empty, kebab-case (`^[a-z0-9-]+$`)
2. **Description:** Non-empty, < 200 characters
3. **Model:** Valid Factory Droid model (`opus`, `sonnet`, `haiku`, `inherit`)
4. **ReasoningEffort:** Valid enum (`low`, `medium`, `high`) - case-sensitive
5. **Tools:** Valid Factory Droid tools, no duplicates
6. **Content:** Non-empty Markdown

### Validation Error Format

```
field <fieldName>: <issue>. Expected: <expected>, Got: <actual>
```

Example:
```
field name: invalid format. Expected: kebab-case (^[a-z0-9-]+$), Got: Invalid_Name
field reasoningEffort: invalid value. Expected: one of [low, medium, high] (case-sensitive), Got: Medium
```

## Performance

- **Build time:** < 2s for 186 skills (8 worker goroutines)
- **Parallel processing:** Skills, droids, and file writes use worker pools
- **Memory efficient:** Stream processing, no full codebase in memory

## Extending the Builder

### Add Custom Model Rule

```go
mapper := factory.NewModelMapper()

// Custom rule: "experimental" tag uses haiku
mapper.AddRule(func(s *skill.Skill) bool {
    return hasTagCI(s, "EXPERIMENTAL")
}, factory.ModelHaiku)
```

### Add Custom Effort Rule

```go
assigner := factory.NewEffortAssigner()

// Custom rule: "prototype" tag uses low effort
assigner.AddRule(func(s *skill.Skill) bool {
    return hasTagCI(s, "PROTOTYPE")
}, factory.EffortLow)
```

### Add Custom Tool Rule

```go
selector := factory.NewToolSelector()

// Custom rule: "deploy" skills get all tools
selector.AddRule(func(s *skill.Skill) bool {
    return strings.Contains(s.Metadata.Name, "deploy")
}, []string{
    factory.ToolRead,
    factory.ToolWrite,
    factory.ToolEdit,
    factory.ToolBash,
    factory.ToolGlob,
    factory.ToolGrep,
    factory.ToolWebFetch,
})
```

## Troubleshooting

### Build Fails with "No skills found"

**Cause:** Skills directory is empty or doesn't exist.

**Solution:** Ensure `.claude/skills/` contains at least one `.md` or `.skill` file with valid YAML frontmatter.

### Validation Error: "invalid format"

**Cause:** Skill name doesn't match kebab-case pattern.

**Solution:** Rename skill to use lowercase letters, numbers, and hyphens only (e.g., `my-skill-name`).

### Tool Selection Too Broad

**Cause:** Skill description contains many keywords.

**Solution:** Be specific in skill descriptions. Use tool-specific language only when necessary.

### Model/Effort Mismatch

**Cause:** Custom rules added in wrong order.

**Solution:** Rules are evaluated in order. Add custom rules before default rules or use rule priority carefully.

## Resources

- [Factory Droid Documentation](https://factorydroid.com/docs)
- [Sigma Protocol](https://github.com/dallionking/sigma-protocol)
- [Claude API Documentation](https://docs.anthropic.com/claude/reference)
- [Platform Interface](../platform.go)
- [Skill Parser](../../skill/parser.go)

---

**Generated by Sigma Protocol CLI**
**Package Version:** 1.0.0
**Skills Supported:** 186
