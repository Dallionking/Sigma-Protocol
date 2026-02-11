# OpenCode Platform Builder

OpenCode is an open-source alternative to Claude Code with multi-provider model support. This package implements the `PlatformBuilder` interface to generate OpenCode-compatible platform configurations.

## Key Differences from Claude Code

| Aspect | Claude Code | OpenCode |
|--------|-------------|----------|
| Skills directory | `.claude/skills/` (plural) | `.opencode/skill/` (singular) |
| Skill structure | Flat `.md` files | Folder with `SKILL.md` |
| Agents directory | `.claude/agents/` (plural) | `.opencode/agent/` (singular) |
| Config file | `.claude/settings.json` (JSON) | `.opencode/config.yaml` (YAML) |
| Model support | Claude only | Multi-provider |

## Usage

### Via Sigma CLI

```bash
# Install OpenCode platform from canonical .claude/ source
sigma install --platform opencode

# Output: .opencode/ directory with 167+ skills
```

### Programmatic Usage

```go
import "github.com/dallionking/sigma-protocol/pkg/platform/opencode"

builder := opencode.NewBuilder()
err := builder.Build(ctx, sourceDir, destDir)
if err != nil {
    log.Fatal(err)
}

// Validate generated structure
result, err := builder.Validate(destDir)
if !result.Valid {
    for _, verr := range result.Errors {
        log.Printf("Error: %s - %s", verr.Code, verr.Message)
    }
}

// Get metrics
metrics := builder.GetMetrics()
log.Printf("Generated %d skills, %d commands, %d agents",
    metrics.Skills, metrics.Commands, metrics.Agents)
```

## Directory Structure

```
.opencode/
├── skill/                          # Singular (not "skills")
│   ├── frontend-design/
│   │   └── SKILL.md                # All caps
│   ├── react-performance/
│   │   └── SKILL.md
│   └── ... (167+ skills)
├── agent/                          # Singular (not "agents")
│   ├── sigma-frontend.md
│   ├── sigma-backend.md
│   └── ... (20+ agents)
├── commands/
│   ├── step-1-ideation.md
│   ├── implement-prd.md
│   └── ... (120+ commands)
└── config.yaml                     # YAML (not JSON)
```

## Configuration Schema

The generated `config.yaml` follows OpenCode v1.1.x schema:

```yaml
# .opencode/config.yaml
model: claude-sonnet-4-20250514

skills:
  enabled: true
  path: .opencode/skill/

agents:
  enabled: true
  path: .opencode/agent/

commands:
  enabled: true
  path: .opencode/commands/

features:
  plugins: true
  compaction_hooks: true
```

### Required Fields
- `model` (string) - Model identifier (e.g., `claude-sonnet-4-20250514`, `gpt-4o`)
- `skills.enabled` (bool) - Enable skill loading
- `skills.path` (string) - Path to skills directory

### Optional Fields
- `agents` - Agent configuration
- `commands` - Command configuration
- `features` - Feature flags

## Validation

The builder performs comprehensive validation:

### Directory Structure Checks
- ✓ `.opencode/` directory exists
- ✓ Singular directory names (`skill/`, `agent/`)
- ✓ Required subdirectories present

### Skill Structure Checks
- ✓ Skills organized in folders (not flat files)
- ✓ Folder names are kebab-case (`^[a-z0-9-]+$`)
- ✓ Each folder contains `SKILL.md` (exact filename, all caps)

### Configuration Checks
- ✓ `config.yaml` exists and is valid YAML
- ✓ Required field `model` is present and non-empty

### Example Validation Error

```go
result, _ := builder.Validate(dir)
if !result.Valid {
    for _, err := range result.Errors {
        fmt.Printf("[%s] %s (%s)\n", err.Code, err.Message, err.File)
    }
}
// Output:
// [INVALID_SKILL_STRUCTURE] validation error: expected folder, found file: flat-skill.md (all skills must be in folders) (.opencode/skill/flat-skill.md)
```

## Implementation Details

### Skill Transformation

The builder transforms flat Claude Code skills to OpenCode's folder structure:

```
Source (.claude/skills/):
  frontend-design.md

Destination (.opencode/skill/):
  frontend-design/
    └── SKILL.md
```

**Preservation guarantees:**
- YAML frontmatter preserved exactly (byte-for-byte)
- Markdown content preserved exactly
- No format transformations applied

### Context Cancellation

All build operations respect context cancellation:

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

err := builder.Build(ctx, src, dest)
if err == context.DeadlineExceeded {
    log.Println("Build timed out")
}
```

### Metrics Tracking

The builder tracks comprehensive metrics:

```go
type PlatformMetrics struct {
    Platform    string        // "opencode"
    Skills      int           // Number of skills processed
    Agents      int           // Number of agents processed
    Commands    int           // Number of commands processed
    TotalFiles  int           // Total files generated
    TotalBytes  int64         // Total bytes written
    GeneratedAt time.Time     // Generation timestamp
}
```

## Testing

Run the test suite:

```bash
cd go/
go test -v ./pkg/platform/opencode/...

# With coverage
go test -cover ./pkg/platform/opencode/...
# Output: coverage: 82.0% of statements
```

### Test Coverage

The test suite covers:
- ✓ Successful build with skills, commands, agents
- ✓ Directory structure creation (singular names)
- ✓ Skill folder structure transformation
- ✓ YAML config generation
- ✓ Validation success and failure cases
- ✓ Context cancellation handling
- ✓ Optional directories (missing commands/agents)
- ✓ Kebab-case folder name validation
- ✓ Missing SKILL.md detection
- ✓ Flat file detection (invalid structure)
- ✓ Invalid YAML config detection
- ✓ Missing required config fields

## Platform Registration

The builder auto-registers with the platform registry via `init()`:

```go
func init() {
    platform.DefaultRegistry.Register(NewBuilder())
}
```

This enables discovery by the Sigma CLI:

```bash
sigma install --list-platforms
# Output:
# Available platforms:
#   - claude
#   - opencode
#   - codex
#   - factory
```

## Compatibility

- **OpenCode Version:** v1.1.x
- **Go Version:** 1.23.0+
- **Source Format:** Claude Code `.claude/` structure
- **Output Format:** OpenCode `.opencode/` structure

## Development

### Adding New Features

1. Update `OpenCodeConfig` struct for new config fields
2. Implement feature in `Build()` method
3. Add validation in `Validate()` method
4. Write comprehensive tests
5. Update this README

### Debugging

Enable verbose output:

```go
builder := opencode.NewBuilder()
// Set up logging...
err := builder.Build(ctx, src, dest)

// Check detailed file list
for _, file := range builder.GetFiles() {
    log.Printf("Generated: %s (%d bytes)", file.Path, file.Size)
}
```

## References

- [OpenCode GitHub](https://github.com/opencode-ai/opencode) (hypothetical)
- [Sigma Protocol Documentation](https://github.com/dallionking/sigma-protocol)
- [Platform Builder Interface](../platform.go)

## License

Part of the Sigma Protocol project. See repository root for license details.
