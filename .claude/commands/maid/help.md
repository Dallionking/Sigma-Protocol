---
description: Get help with maid commands
---

# /maid/help

Repository maintenance commands overview.

## Available Commands

| Command | Description |
|---------|-------------|
| `/maid/cleanup` | Content-aware file cleanup |
| `/maid/simplify` | Code simplification via @sigma-simplify |
| `/maid/full` | Full suite (cleanup + simplify) |
| `/maid/help` | This help message |

## Core @maid Flags

```bash
@maid                        # Show maintenance options
@maid --analyze              # Deep analysis only
@maid --cleanup              # File cleanup mode
@maid --simplify             # Code simplification
@maid --all                  # Full maintenance suite
@maid --confirm-delete       # Finalize pending deletions
@maid --dry-run              # Preview without changes
```

## CLI Alternative

You can also use the Sigma CLI:

```bash
sigma maid                   # Interactive maid wizard
sigma maid --quick           # Quick scan (no AI, finds obvious cruft)
```

## Safety Features

- **Git backup** before any file operations
- **Two-stage deletion** (review → confirmed → delete)
- **Protected files** whitelist
- **Content-aware** analysis (reads files to understand purpose)
- **Cross-reference** validation (checks if files are used)
- **Dry-run mode** for previews

## Related Commands

- `@sigma-simplify` - Standalone code simplification
- `@cleanup-repo` - Legacy name (redirects to @maid)

## Documentation

See the full documentation at:
- [ops/maid](../../ops/maid) - Full command reference
- [audit/sigma-simplify](../../audit/sigma-simplify) - Code simplification details


