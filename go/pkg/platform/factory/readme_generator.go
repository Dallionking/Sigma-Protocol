package factory

import (
	"fmt"
	"time"
)

// ReadmeGenerator generates the platforms/factory-droid/README.md file.
type ReadmeGenerator struct {
	version     string
	droidCount  int
	lastUpdated string
}

// NewReadmeGenerator creates a new README generator.
func NewReadmeGenerator(version string, droidCount int) *ReadmeGenerator {
	return &ReadmeGenerator{
		version:     version,
		droidCount:  droidCount,
		lastUpdated: time.Now().Format("2006-01-02"),
	}
}

// Generate creates the README content with all required sections.
//
// README content template:
// - Platform overview (Factory Droid description)
// - Directory structure
// - Configuration section (.droid.yaml)
// - Factory Droid updates (7M token sessions, reasoningEffort)
// - Droid template format (YAML frontmatter example)
// - Available models table
// - Integration with Sigma Protocol (sync commands)
// - Best practices (reasoningEffort, tool selection)
// - Resources (links to docs)
func (g *ReadmeGenerator) Generate() (string, error) {
	return fmt.Sprintf(`# Factory Droid Platform Configuration

**Version:** %s
**Generated:** %s
**Droids:** %d

## Overview

Factory Droid is an AI-powered code review and automation platform with 7M token session support, model routing via %%reasoningEffort%%, and GitHub workflow integration. This directory contains the Factory Droid configuration generated from Sigma Protocol skills.

## Directory Structure

%%bash
platforms/factory-droid/
├── README.md                # This file
└── droids/                  # Droid definitions (Markdown + YAML)
    ├── steps-step-1-ideation.md
    ├── audit-security-audit.md
    └── ...

.factory/
└── .droid.yaml              # Factory Droid config
%%

## Configuration

The %%.factory/.droid.yaml%% file configures Factory Droid's review behavior:

%%yaml
review:
  auto_review:
    enabled: true            # Enable automatic PR review
    draft: false             # Review draft PRs
    bot: false               # Review bot PRs
  pr_summary: true           # Generate PR summary
  file_summaries: true       # Generate file-level summaries
  tips: true                 # Include improvement tips
  github_action_repair: true # Auto-repair failing actions
%%

## Factory Droid Features

### 7M Token Sessions

Factory Droid supports 7M token context windows, enabling:
- Full codebase analysis
- Multi-file refactoring
- Complex architecture reviews
- Deep security audits

### Model Routing (reasoningEffort)

Factory Droid routes requests to appropriate Claude models based on %%reasoningEffort%%:

| reasoningEffort | Token Budget | Use Case |
|-----------------|--------------|----------|
| %%low%%         | < 100 tokens | Quick tasks, formatting, linting |
| %%medium%%      | 100-500 tokens | General development, feature implementation |
| %%high%%        | 500+ tokens | Architecture, security, complex analysis |

## Droid Format

Droids are Markdown files with YAML frontmatter:

%%markdown
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

[Droid content here...]
%%

## Available Models

| Model | Use Case | Selection Criteria |
|-------|----------|-------------------|
| %%claude-opus-4-5-20251101%% | Complex analysis, architecture | Tags: ARCHITECTURE, PLANNING, SECURITY, REVIEW |
| %%claude-sonnet-4-5-20241022%% | General development | Workflow steps (step-*), default |
| %%claude-haiku-3-5-20250114%% | Quick tasks, formatting | Tags: QUICK, FORMATTING |

## Available Tools

| Tool | Description | Added When |
|------|-------------|-----------|
| %%Read%% | Read files | Always (base tool) |
| %%Bash%% | Execute shell commands | Always (base tool) |
| %%Write%% | Write/create files | Skill mentions "write" or "create" |
| %%Edit%% | Edit existing files | Skill mentions "edit" or "modify" |
| %%Glob%% | Find files by pattern | Skill has globs field |
| %%Grep%% | Search file contents | Skill mentions "search" or "find" |
| %%WebFetch%% | Fetch web content (MCP) | Skill mentions "web" or "fetch" |

## Integration with Sigma Protocol

Factory Droid is generated from Sigma Protocol skills using the Go CLI:

%%bash
# Build Factory Droid configuration
sigma build factory

# Validate generated droids
sigma validate factory

# Sync all platforms
sigma sync
%%

## Best Practices

### reasoningEffort Selection

- **High**: Use for architecture decisions, security audits, complex refactoring
- **Medium**: Use for feature implementation, bug fixes, testing
- **Low**: Use for formatting, linting, simple updates

### Tool Selection

- **Minimize tools**: Only enable tools the droid actually needs
- **Security surface**: Fewer tools = smaller attack surface
- **Performance**: Tool loading has overhead, keep it minimal

### Droid Design

- **Single responsibility**: Each droid should do one thing well
- **Clear descriptions**: Description should explain what the droid does
- **Consistent naming**: Use kebab-case for droid names

## Resources

- [Factory Droid Documentation](https://factorydroid.com/docs)
- [Sigma Protocol](https://github.com/dallionking/sigma-protocol)
- [Claude API Documentation](https://docs.anthropic.com/claude/reference)

---

*Generated by Sigma Protocol CLI v%s*
`, g.version, g.lastUpdated, g.droidCount, g.version), nil
}
