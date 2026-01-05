# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in SSS Protocol, please report it responsibly:

### Do NOT

- Open a public GitHub issue for security vulnerabilities
- Post about the vulnerability publicly before it's fixed
- Exploit the vulnerability beyond what's needed to demonstrate it

### Do

1. **Email**: Send details to [security@sss-protocol.dev] (or open a private security advisory on GitHub)
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution Target**: Within 30 days for critical issues

## Security Considerations for Users

### Sensitive Files

The following files should **never** be committed to version control:

- `.env` and `.env.*` files
- OAuth credential JSON files
- API keys and secrets
- Database connection strings
- Service account keys

SSS Protocol's `.gitignore` excludes these by default.

### Command Execution

SSS Protocol commands may execute shell commands and access the filesystem. When using commands:

- Review generated code before running
- Be cautious with `@implement-prd` and `@scaffold` in production
- Use `--dry-run` flags where available

### MCP Tool Access

Commands use MCP tools that may:
- Make web requests (Exa, Perplexity)
- Access documentation (Ref)
- Control browser instances (for UI testing)

Ensure MCP servers are from trusted sources.

## Best Practices

1. **Review AI-generated code** before committing
2. **Use environment variables** for secrets, never hardcode
3. **Keep dependencies updated** with `@dependency-update`
4. **Run security audits** regularly with `@security-audit`
5. **Validate inputs** in generated API endpoints

## Acknowledgments

We appreciate security researchers who help keep SSS Protocol safe. Responsible reporters will be acknowledged (with permission) in release notes.

