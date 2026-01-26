# Contributing to Sigma Protocol

Thank you for your interest in contributing to Sigma Protocol! This document provides guidelines for contributing.

## Code of Conduct

Be respectful, inclusive, and constructive. We're all here to build something great.

## How to Contribute

### Reporting Issues

1. **Search existing issues** to avoid duplicates
2. **Use issue templates** when available
3. **Provide context**: OS, platform (Cursor/Claude Code/OpenCode), command used
4. **Include reproduction steps** if reporting a bug

### Suggesting Enhancements

1. Open an issue with the `enhancement` label
2. Describe the use case and expected behavior
3. Consider if it fits the Sigma methodology philosophy

### Submitting Changes

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a Pull Request**

## Development Guidelines

### Command File Structure

All commands follow this structure:

```yaml
---
version: "X.Y.Z"
last_updated: "YYYY-MM-DD"
changelog:
  - "X.Y.Z: Description of changes"
description: "Brief description of command purpose"
allowed-tools:
  - tool_name
parameters:
  - --param-name
---

# @command-name — Title

**Purpose statement**

## 🎯 Mission

[Persona and context]

## 📋 Usage

[Usage examples]

## 🔄 Workflow

[Step-by-step workflow]

## ✅ Quality Gates

[Verification criteria]
```

### Version Bumping

- **PATCH** (0.0.X): Bug fixes, typo corrections
- **MINOR** (0.X.0): New features, non-breaking changes
- **MAJOR** (X.0.0): Breaking changes, major rewrites

### Command Categories

Place commands in the appropriate directory:

| Directory | Purpose |
|-----------|---------|
| `steps/` | Core methodology steps |
| `audit/` | Quality and verification |
| `dev/` | Development workflow |
| `ops/` | Operations and management |
| `deploy/` | Deployment and shipping |
| `generators/` | Code/doc generation |
| `marketing/` | GTM workflow |

### Testing Commands

Before submitting:

1. Test in at least one platform (Cursor, Claude Code, or OpenCode)
2. Verify all HITL checkpoints work
3. Check that outputs match expected format
4. Run `@holes` on your changes if applicable

### Documentation

- Update relevant docs in `docs/`
- Add changelog entry in command frontmatter
- Update `docs/COMMANDS.md` if adding new commands

## Pull Request Process

1. **Title**: Use conventional commits format
   - `feat: add new command`
   - `fix: correct output format`
   - `docs: update README`
   
2. **Description**: Include
   - What changed and why
   - How to test
   - Related issues

3. **Review**: Wait for maintainer review
   - Address feedback promptly
   - Keep PR focused (one feature/fix per PR)

## Architecture Decisions

For significant changes, consider:

1. Does this fit the Sigma philosophy?
2. Does it work across all platforms?
3. Does it maintain backward compatibility?
4. Is it consistent with existing patterns?

If unsure, open a discussion issue first.

## Local Development

```bash
# Clone the repo
git clone https://github.com/your-org/sigma-protocol.git
cd sigma-protocol

# Install dependencies
npm install

# Test the CLI
node tools/sss-cli.js --help

# Build platform outputs
node tools/sss-cli.js build --platform cursor --target ./test-output
```

## Questions?

- Open a discussion on GitHub
- Check existing documentation
- Review closed issues for similar questions

---

Thank you for contributing to Sigma Protocol! 🎉

