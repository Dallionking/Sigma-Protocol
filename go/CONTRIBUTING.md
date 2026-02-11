# Contributing to Sigma CLI

Thank you for your interest in contributing to Sigma CLI! This guide will help you get started.

## Development Setup

### Prerequisites

- Go 1.23 or later
- Make
- golangci-lint (for linting)

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/dallionking/sigma-protocol.git
   cd sigma-protocol/go
   ```

2. Install dependencies:
   ```bash
   go mod download
   ```

3. Build the CLI:
   ```bash
   make build
   ```

4. Run tests:
   ```bash
   make test
   ```

## Project Structure

```
go/
├── cmd/sigma/          # CLI commands (Cobra)
│   ├── root.go         # Root command and global flags
│   ├── doctor.go       # Health check command
│   ├── install.go      # Hook installation command
│   └── version.go      # Version command
├── pkg/                # Public packages
│   ├── config/         # Configuration management
│   ├── errors/         # Error handling utilities
│   ├── hooks/          # Hook discovery and management
│   ├── schema/         # JSON schema validation
│   └── skill/          # Skill parsing
├── internal/           # Private packages
├── tests/              # Integration tests
│   └── integration/
└── docs/               # Documentation
```

## Making Changes

### Code Style

- Run `make fmt` before committing to format code
- Run `make lint` to check for issues
- Follow standard Go conventions

### Testing

- Add unit tests for new functionality in `*_test.go` files
- Add integration tests in `tests/integration/` for cross-package behavior
- Run `make test` to execute all tests
- Run `make coverage` to check test coverage

### Commit Messages

Follow conventional commits:

```
feat: add new feature
fix: resolve bug
docs: update documentation
test: add or update tests
refactor: code refactoring
chore: maintenance tasks
```

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Run `make all` to format, lint, and test
4. Push and create a PR
5. Ensure CI passes

## Package Guidelines

### Adding a New Package

1. Create directory under `pkg/` for public packages or `internal/` for private
2. Add a `README.md` explaining the package purpose
3. Include comprehensive tests
4. Export only necessary types and functions

### Error Handling

Use the `pkg/errors` package for consistent error handling:

```go
import "github.com/dallionking/sigma-protocol/pkg/errors"

// Wrap errors with context
if err != nil {
    return errors.Wrap(err, errors.ErrCodeFileRead, "failed to read config")
}

// Create new errors with codes
return errors.New(errors.ErrCodeHookNotFound, "hook not found")
```

### Security

- Never trust user input without validation
- Use `sanitizeDestPath()` for file paths
- Validate paths against allowed patterns
- Check for path traversal attacks

## Release Process

Releases are automated via GoReleaser when a tag is pushed:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Getting Help

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide reproduction steps for bugs

## Code of Conduct

Be respectful and constructive in all interactions.
