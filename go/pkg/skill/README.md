# Skill Package

Package `skill` provides parsing and loading functionality for Sigma Protocol skill files.

## Overview

Skill files are Markdown documents with YAML frontmatter containing metadata. They follow this structure:

```markdown
---
name: example-skill
description: Example skill description
version: 1.0.0
globs: ["*.go", "*.md"]
triggers: ["keyword1", "keyword2"]
agent: sigma-backend-engineer
skills: [dependency-skill-1, dependency-skill-2]
tags: [TAG1, TAG2]
---
# Skill Content

Markdown content goes here...
```

## Usage

### Parse a Single Skill File

```go
import "github.com/dallionking/sigma-protocol/pkg/skill"

skill, err := skill.Parse("/path/to/skill.md")
if err != nil {
    log.Fatalf("Failed to parse skill: %v", err)
}

fmt.Printf("Skill: %s\n", skill.Metadata.Name)
fmt.Printf("Description: %s\n", skill.Metadata.Description)
```

### Load All Skills from a Directory

```go
result, err := skill.LoadDirectory("/path/to/skills")
if err != nil {
    log.Fatalf("Failed to load skills: %v", err)
}

fmt.Printf("Loaded %d skills\n", len(result.Skills))
if len(result.Errors) > 0 {
    fmt.Printf("Encountered %d parse errors\n", len(result.Errors))
}
```

### Load Skills in Parallel (Faster)

```go
// Use 4 worker goroutines for parallel processing
result, err := skill.LoadDirectoryParallel("/path/to/skills", 4)
if err != nil {
    log.Fatalf("Failed to load skills: %v", err)
}

fmt.Printf("Loaded %d skills\n", len(result.Skills))
```

## API Reference

### Types

#### `SkillMetadata`

Contains the YAML frontmatter metadata:
- `Name` (string, required) - Unique skill identifier
- `Description` (string, required) - Brief description of the skill
- `Version` (string) - Semantic version
- `Globs` ([]string) - File patterns to trigger this skill
- `Triggers` ([]string) - Keywords to auto-invoke this skill
- `Agent` (string) - Recommended agent to use this skill
- `Skills` ([]string) - Dependencies on other skills
- `Tags` ([]string) - Category tags
- `Source` (string) - Source reference
- `Sources` ([]string) - Multiple source references

#### `Skill`

Represents a parsed skill file:
- `Metadata` (SkillMetadata) - Parsed frontmatter
- `Content` (string) - Markdown content after frontmatter
- `FilePath` (string) - Absolute path to the skill file

#### `LoadResult`

Contains results of batch loading:
- `Skills` ([]*Skill) - Successfully parsed skills
- `Errors` ([]error) - Parse errors encountered (partial success)

### Functions

#### `Parse(path string) (*Skill, error)`

Parses a single skill file and returns a `Skill` object.

**Error handling:**
- Missing frontmatter delimiters
- Invalid YAML syntax
- Missing required fields (name, description)
- File read errors

#### `LoadDirectory(dir string) (*LoadResult, error)`

Recursively loads all .skill and .md files from a directory. Collects parse errors without stopping, allowing partial success.

**Returns:**
- `LoadResult` with both successful skills and errors
- Fatal error only if directory cannot be walked

#### `LoadDirectoryParallel(dir string, workers int) (*LoadResult, error)`

Parallel version of `LoadDirectory` using a worker pool pattern. Significantly faster for large directories (100+ files).

**Parameters:**
- `dir` - Directory path to scan recursively
- `workers` - Number of goroutines (defaults to 4 if <= 0)

**Performance:**
- ~2-3x faster than serial loading on multi-core systems
- Identical results to `LoadDirectory()`

## Testing

Run tests with coverage:

```bash
go test -v ./pkg/skill/... -cover
```

Run benchmarks:

```bash
go test -bench=. ./pkg/skill/...
```

Test against real skills directory:

```bash
go run ./testdata/test_loader.go
```

## Current Status

**Tested against:** 186 skills in `.claude/skills/` directory
- ✅ 179 skills loaded successfully
- ⚠️ 7 parse errors (non-skill markdown files without frontmatter)
- ✅ 94.4% test coverage
- ✅ All edge cases handled gracefully

## Error Handling Philosophy

The loader uses a **partial success** pattern:
- Individual parse errors are collected but don't stop processing
- Always returns both successes and errors
- Enables resilient batch processing
- Makes debugging easier (see all errors at once)
