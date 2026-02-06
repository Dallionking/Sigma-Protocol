---
name: secrets-detection
description: "Secrets management and detection skill. Covers gitleaks configuration, pre-commit hooks, .env best practices, cloud secrets managers, API key rotation patterns, and git history scanning for leaked credentials."
version: "1.0.0"
source: "sigma-security"
triggers:
  - security-audit
  - step-0-environment-setup
  - implement-prd
  - pr-review
  - new-project
---

# Secrets Detection Skill

Comprehensive secrets management covering **gitleaks**, **pre-commit hooks**, **environment variable best practices**, **cloud secrets managers**, and **credential rotation**. Use this skill when setting up projects, running security audits, or reviewing code for leaked secrets.

## When to Invoke

Invoke this skill when:

- Setting up new projects (Step 0)
- Running security audits (`/security-audit`)
- Reviewing PRs for potential secrets exposure
- Configuring CI/CD pipelines
- Implementing environment variable management
- Investigating potential credential leaks

---

## Gitleaks Configuration

### Installation and Setup

```bash
# Install gitleaks
brew install gitleaks

# Scan current state
gitleaks detect --source . --verbose

# Scan entire git history
gitleaks detect --source . --verbose --log-opts="--all"

# Scan staged changes only (pre-commit)
gitleaks protect --staged --verbose
```

### Custom Configuration

```toml
# .gitleaks.toml - Project-specific configuration
title = "Project Gitleaks Configuration"

# Extend default rules (gitleaks has 160+ built-in patterns)
[extend]
useDefault = true

# Custom rules for project-specific patterns
[[rules]]
id = "project-api-key"
description = "Project API Key"
regex = '''PROJECT_API_KEY\s*=\s*['"][a-zA-Z0-9]{32,}['"]'''
tags = ["key", "api"]

[[rules]]
id = "supabase-service-key"
description = "Supabase Service Role Key"
regex = '''eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+'''
tags = ["key", "supabase"]

# Allowlist for known false positives
[allowlist]
description = "Allowlisted patterns"
paths = [
  '''\.gitleaks\.toml$''',
  '''\.env\.example$''',
  '''docs/.*\.md$''',
  '''test/fixtures/.*''',
]

# Known test/example values
regexes = [
  '''sk_test_[a-zA-Z0-9]+''',
  '''pk_test_[a-zA-Z0-9]+''',
  '''EXAMPLE_[A-Z_]+''',
]

# Specific commits with known false positives (rotated secrets)
commits = [
  "abc123def456",
]
```

---

## Pre-commit Hook Setup

### Using pre-commit framework

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: detect-private-key
      - id: check-added-large-files
        args: ['--maxkb=500']
```

```bash
# Install and configure
pip install pre-commit
pre-commit install
pre-commit autoupdate
pre-commit run --all-files  # Initial scan
```

### Using Husky (Node.js projects)

```json
{
  "scripts": {
    "prepare": "husky install",
    "secrets:check": "gitleaks protect --staged --verbose",
    "secrets:scan": "gitleaks detect --source . --verbose"
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run gitleaks on staged files
npx gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
  echo ""
  echo "ERROR: Secrets detected in staged files!"
  echo "Remove the secrets and try again."
  echo "To skip (NOT recommended): SKIP=gitleaks git commit ..."
  exit 1
fi
```

---

## .env Best Practices

### File Structure

```bash
# .env.example - Committed to repo (template with placeholder values)
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
DIRECT_URL=postgresql://user:password@localhost:5432/mydb

# Authentication
JWT_PRIVATE_KEY=generate-with-openssl
JWT_PUBLIC_KEY=generate-with-openssl
SESSION_SECRET=generate-random-string-min-32-chars

# Third-party APIs
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...

# Feature flags
ENABLE_BETA_FEATURES=false
```

```gitignore
# .gitignore - CRITICAL: Never commit real .env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.*.local

# Keep the example
!.env.example
```

### Environment Variable Validation at Startup

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  PORT: z.string().default('3000').transform(Number),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  OPENAI_API_KEY: z.string().startsWith('sk-'),
});

function validateEnvironment() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Environment validation failed:');
    for (const error of result.error.errors) {
      console.error(`  ${error.path.join('.')}: ${error.message}`);
    }
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnvironment();
```

---

## Cloud Secrets Managers

### AWS Secrets Manager

```typescript
// src/config/secrets-aws.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

const secretCache = new Map<string, { value: string; expiresAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getSecret(secretName: string): Promise<string> {
  const cached = secretCache.get(secretName);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);

  const value = response.SecretString!;
  secretCache.set(secretName, {
    value,
    expiresAt: Date.now() + CACHE_TTL,
  });

  return value;
}

// Usage
const dbPassword = await getSecret('prod/database/password');
```

### HashiCorp Vault

```typescript
// src/config/secrets-vault.ts
import Vault from 'node-vault';

const vault = Vault({
  endpoint: process.env.VAULT_ADDR!,
  token: process.env.VAULT_TOKEN!,
});

async function getVaultSecret(path: string): Promise<Record<string, string>> {
  const result = await vault.read(path);
  return result.data.data;
}

// Usage
const dbSecrets = await getVaultSecret('secret/data/database');
```

### Secrets Manager Selection Guide

| Manager | Best For | Cost |
|---------|----------|------|
| **AWS Secrets Manager** | AWS-native apps | $0.40/secret/month |
| **HashiCorp Vault** | Multi-cloud, on-prem | Self-hosted or HCP |
| **Google Secret Manager** | GCP-native apps | $0.06/10k access ops |
| **Azure Key Vault** | Azure-native apps | $0.03/10k operations |
| **Doppler** | Developer-friendly SaaS | Free tier available |
| **1Password Secrets** | Small teams | Part of 1Password plan |

---

## API Key Rotation Patterns

### Dual-Key Rotation (Zero Downtime)

```typescript
// SECURE: Dual-key rotation pattern
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// Step 1: Generate new key as secondary
async function initiateRotation(clientId: string) {
  const newKey = crypto.randomBytes(32).toString('hex');
  const hashedKey = await bcrypt.hash(newKey, 10);

  await db.apiClient.update({
    where: { id: clientId },
    data: {
      secondaryKeyHash: hashedKey,
      secondaryKeyCreatedAt: new Date(),
    },
  });

  return newKey; // Return to client securely
}

// Step 2: Both keys valid during transition
async function validateAPIKey(key: string, clientId: string): Promise<boolean> {
  const client = await db.apiClient.findUnique({ where: { id: clientId } });
  if (!client) return false;

  const isPrimary = await bcrypt.compare(key, client.primaryKeyHash);
  const isSecondary = client.secondaryKeyHash
    ? await bcrypt.compare(key, client.secondaryKeyHash)
    : false;

  return isPrimary || isSecondary;
}

// Step 3: Promote secondary to primary
async function completeRotation(clientId: string) {
  const client = await db.apiClient.findUnique({ where: { id: clientId } });

  await db.apiClient.update({
    where: { id: clientId },
    data: {
      primaryKeyHash: client!.secondaryKeyHash!,
      primaryKeyCreatedAt: client!.secondaryKeyCreatedAt!,
      secondaryKeyHash: null,
      secondaryKeyCreatedAt: null,
    },
  });
}
```

### Rotation Schedule

| Secret Type | Rotation Frequency | Method |
|-------------|-------------------|--------|
| API keys | Every 90 days | Dual-key rotation |
| Database passwords | Every 90 days | Vault auto-rotation |
| JWT signing keys | Every 180 days | Key set rotation (JWKS) |
| Session secrets | Every 90 days | Rolling deployment |
| Webhook secrets | On compromise only | Regenerate + notify |

---

## Detecting Hardcoded Credentials

### Common Secret Patterns

| Type | Pattern | Example |
|------|---------|---------|
| AWS Access Key | `AKIA[0-9A-Z]{16}` | AKIAIOSFODNN7EXAMPLE |
| Stripe Secret | `sk_live_[a-zA-Z0-9]{24,}` | sk_live_abc123... |
| OpenAI Key | `sk-[a-zA-Z0-9]{48}` | sk-abc123... |
| GitHub Token | `gh[ps]_[a-zA-Z0-9]{36}` | ghp_abc123... |
| Slack Token | `xox[bpors]-[...]` | xoxb-abc123... |
| SendGrid Key | `SG\.[...]{22}\.[...]{43}` | SG.abc123... |
| RSA Private Key | `-----BEGIN RSA PRIVATE KEY-----` | PEM format |
| PostgreSQL URL | `postgresql://user:pass@host/db` | Connection string |
| Generic Password | `password\s*[:=]\s*'...'` | Assignment pattern |

---

## Git History Scanning

### Commands

```bash
# Scan full git history
gitleaks detect --source . --verbose --log-opts="--all" --report-path=gitleaks-report.json

# Scan specific commit range
gitleaks detect --source . --log-opts="HEAD~100..HEAD"

# Scan a specific branch
gitleaks detect --source . --log-opts="origin/main..feature-branch"
```

### Remediation for Leaked Secrets

**Step 1: ROTATE IMMEDIATELY** - The secret is compromised. Generate a new one.

**Step 2: Update code** - Replace the leaked secret with the new one (via env vars).

**Step 3: Add to allowlist** - Add the rotated secret's commit to `.gitleaks.toml` allowlist.

**Step 4: Consider history rewriting** (severe cases only):
- Use `git filter-repo` to remove the file from all history
- WARNING: This rewrites commit hashes and requires all collaborators to re-clone
- Only do this for extremely sensitive secrets (private keys, master credentials)

**Critical rule:** If a secret was pushed to a public repository, assume it was scraped by automated bots. Rotation is the only reliable remediation.

---

## CI/CD Secrets Audit

```yaml
# .github/workflows/secrets-audit.yml
name: Secrets Audit
on:
  pull_request:

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  env-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check for .env files
        run: |
          if find . -name '.env' -not -name '.env.example' -not -path '*/node_modules/*' | grep -q .; then
            echo "ERROR: .env files found in repository!"
            exit 1
          fi

      - name: Verify .env.example exists
        run: test -f .env.example || echo "WARNING: No .env.example"
```

---

## Secrets Detection Checklist

### Pre-commit
- [ ] Gitleaks pre-commit hook installed
- [ ] Private key detection hook active
- [ ] Large file detection hook active

### Repository
- [ ] `.env` files in `.gitignore`
- [ ] `.env.example` committed with placeholder values
- [ ] No hardcoded credentials in source code
- [ ] Custom `.gitleaks.toml` configured

### CI/CD
- [ ] Gitleaks action runs on every PR
- [ ] Secrets stored in GitHub Secrets / Vault
- [ ] Build logs reviewed for secret leakage

### Operations
- [ ] API keys rotated every 90 days
- [ ] Cloud secrets manager in use
- [ ] Environment variables validated at startup
- [ ] Rotation procedure documented

### Incident Response
- [ ] Credential rotation procedure documented
- [ ] Team knows: rotate FIRST, clean history SECOND
- [ ] Allowlist maintained for rotated secrets
- [ ] Security team notified on exposure

---

## Integration with Sigma Protocol

### Step 0 (Environment Setup)
Configure gitleaks and pre-commit hooks during project setup.

### /security-audit
Include secrets scanning in security audit workflows.

### /new-project
Set up `.env.example`, `.gitignore`, and gitleaks config.

### /pr-review
Flag any new files that might contain secrets.

---

_A leaked secret is compromised forever in git history. Prevention through pre-commit hooks is infinitely cheaper than remediation after exposure._
