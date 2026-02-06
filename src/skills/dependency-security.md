---
name: dependency-security
description: "Supply chain and dependency security skill. Covers npm audit, Snyk integration, Dependabot configuration, license compliance, typosquatting detection, SBOM generation with CycloneDX, and transitive dependency analysis."
version: "1.0.0"
source: "sigma-security"
triggers:
  - security-audit
  - dependency-update
  - implement-prd
  - step-8-technical-spec
  - pr-review
---

# Dependency Security Skill

Comprehensive supply chain security covering **npm audit**, **SBOM generation**, **license compliance**, **typosquatting detection**, and **dependency analysis**. Use this skill when managing dependencies, running security audits, or reviewing pull requests with dependency changes.

## When to Invoke

Invoke this skill when:

- Running security audits (`/security-audit`)
- Updating dependencies (`/dependency-update`)
- Reviewing PRs with dependency changes
- Setting up CI/CD security checks
- Auditing license compliance
- Investigating supply chain risks

---

## npm Audit Integration

### CI Pipeline Setup

```yaml
# .github/workflows/security.yml
name: Security Audit
on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 6 * * 1' # Weekly Monday 6am

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit (production)
        run: npm audit --production --audit-level=high
        continue-on-error: false

      - name: Check for known vulnerabilities
        run: npx better-npm-audit audit --level high

      - name: Check unused dependencies
        run: npx depcheck --ignores="@types/*"

      - name: Check outdated packages
        run: npm outdated || true
```

### Interpreting npm Audit Results

| Severity | Action | Timeline |
|----------|--------|----------|
| **Critical** | Fix immediately, block deployment | Same day |
| **High** | Fix before next release | Within 1 week |
| **Moderate** | Schedule fix | Within 1 month |
| **Low** | Track in backlog | Next quarter |

**Priority order:**
1. Critical/High in **direct production** dependencies - fix immediately
2. High in dev dependencies or moderate in production - fix soon
3. Low severity or moderate in dev - track and batch update

---

## Dependabot Configuration

```yaml
# .github/dependabot.yml - Complete configuration
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
      timezone: "America/New_York"
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
    labels:
      - "dependencies"
      - "security"
    groups:
      development-dependencies:
        dependency-type: "development"
        update-types:
          - "minor"
          - "patch"
      production-dependencies:
        dependency-type: "production"
        update-types:
          - "patch"
    ignore:
      - dependency-name: "aws-sdk"
        update-types: ["version-update:semver-major"]

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "ci"
      - "dependencies"

  # Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
```

---

## SBOM Generation (CycloneDX)

### Setup

```json
{
  "scripts": {
    "sbom:generate": "npx @cyclonedx/cyclonedx-npm --output-file sbom.json --spec-version 1.5",
    "sbom:validate": "npx @cyclonedx/cyclonedx-cli validate --input-file sbom.json",
    "sbom:diff": "npx @cyclonedx/cyclonedx-cli diff --old sbom-previous.json --new sbom.json"
  }
}
```

### CI SBOM Pipeline

```yaml
# .github/workflows/sbom.yml
name: SBOM Generation
on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: npm ci

      - name: Generate SBOM
        run: npx @cyclonedx/cyclonedx-npm --output-file sbom.json --spec-version 1.5

      - name: Upload SBOM artifact
        uses: actions/upload-artifact@v4
        with:
          name: sbom-${{ github.sha }}
          path: sbom.json
```

### SBOM Analysis Script

```typescript
// scripts/analyze-sbom.ts
import fs from 'fs';

interface SBOMComponent {
  type: string;
  name: string;
  version: string;
  purl: string;
  licenses?: { id: string }[];
  externalReferences?: { type: string; url: string }[];
}

function analyzeSBOM(sbomPath: string) {
  const sbom = JSON.parse(fs.readFileSync(sbomPath, 'utf8'));
  const components: SBOMComponent[] = sbom.components || [];

  return {
    totalDependencies: components.length,
    directDependencies: components.filter(c => c.type === 'library').length,
    withoutLicense: components.filter(c => !c.licenses?.length),
    copyleftLicenses: components.filter(c =>
      c.licenses?.some(l => ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0'].includes(l.id))
    ),
    withoutRepository: components.filter(c =>
      !c.externalReferences?.some(r => r.type === 'vcs')
    ),
  };
}
```

---

## License Compliance

### Allowed and Denied Licenses

| Category | Licenses | Usage |
|----------|----------|-------|
| **Permissive (Safe)** | MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD | Use freely |
| **Weak Copyleft** | MPL-2.0, LGPL-2.1, LGPL-3.0 | Review required |
| **Strong Copyleft (Blocked)** | GPL-2.0, GPL-3.0, AGPL-3.0 | Do not use in proprietary apps |
| **Unknown** | Unlicensed packages | Review and get legal approval |

### CI License Check

```yaml
# In CI pipeline
- name: License compliance check
  run: npx license-checker --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC;0BSD;CC0-1.0;Unlicense" --production
```

### License Override Configuration

```json
// .licensecheckrc
{
  "allowedLicenses": [
    "MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause",
    "ISC", "0BSD", "CC0-1.0", "Unlicense"
  ],
  "deniedLicenses": [
    "GPL-2.0", "GPL-3.0", "AGPL-3.0"
  ],
  "exceptions": {
    "some-gpl-package": "Used only as CLI tool in dev, not linked into production"
  }
}
```

---

## Typosquatting Detection

### Common Typosquatting Techniques

| Technique | Legitimate | Typosquat |
|-----------|-----------|-----------|
| Character swap | `lodash` | `loadsh`, `lodahs` |
| Missing char | `express` | `expres` |
| Extra char | `express` | `expresss` |
| Separator change | `react-dom` | `reactdom`, `react_dom` |
| Scope removal | `@babel/core` | `babel-core` |

### Detection Checklist

When adding new dependencies:

- [ ] Verify the package name matches the official documentation
- [ ] Check npm page for download count (low downloads = suspicious)
- [ ] Verify the publisher/maintainer matches expected organization
- [ ] Check package age (very new packages are higher risk)
- [ ] Look for repository link and verify it points to expected source
- [ ] Check if package has a README with legitimate content

### Automated Detection Script

```typescript
// scripts/check-new-deps.ts
import fs from 'fs';

function checkNewDependencies(oldPkgPath: string, newPkgPath: string) {
  const oldPkg = JSON.parse(fs.readFileSync(oldPkgPath, 'utf8'));
  const newPkg = JSON.parse(fs.readFileSync(newPkgPath, 'utf8'));

  const oldDeps = new Set([
    ...Object.keys(oldPkg.dependencies || {}),
    ...Object.keys(oldPkg.devDependencies || {}),
  ]);

  const newDeps = [
    ...Object.keys(newPkg.dependencies || {}),
    ...Object.keys(newPkg.devDependencies || {}),
  ].filter(d => !oldDeps.has(d));

  if (newDeps.length > 0) {
    console.log('New dependencies added (review required):');
    newDeps.forEach(d => console.log(`  - ${d}`));
  }

  return newDeps;
}
```

---

## Lockfile Integrity

### Verification Checklist

```typescript
// scripts/verify-lockfile.ts
import fs from 'fs';

function verifyLockfileIntegrity() {
  const lockfile = fs.readFileSync('package-lock.json', 'utf8');
  const lock = JSON.parse(lockfile);
  const issues: string[] = [];

  // Check for packages with resolved URLs pointing to unexpected registries
  function checkPackage(name: string, pkg: any) {
    if (pkg.resolved && !pkg.resolved.startsWith('https://registry.npmjs.org/')) {
      issues.push(`${name}: Resolves to non-npmjs registry: ${pkg.resolved}`);
    }

    if (!pkg.integrity) {
      issues.push(`${name}: Missing integrity hash`);
    }

    if (pkg.resolved?.includes('github.com') || pkg.resolved?.includes('git+')) {
      issues.push(`${name}: Git dependency detected: ${pkg.resolved}`);
    }
  }

  if (lock.packages) {
    for (const [name, pkg] of Object.entries(lock.packages)) {
      if (name) checkPackage(name, pkg as any);
    }
  }

  return issues;
}
```

### Pre-commit Lockfile Check

```yaml
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Verify lockfile is in sync
npm ls --all > /dev/null 2>&1 || {
  echo "ERROR: package-lock.json is out of sync"
  echo "Run 'npm install' and commit the updated lockfile"
  exit 1
}
```

---

## Transitive Dependency Analysis

```typescript
// scripts/analyze-deps.ts
import fs from 'fs';

function analyzeTransitiveDeps() {
  const lockfile = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const directDeps = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ]);

  const allDeps = Object.keys(lockfile.packages || {})
    .filter(k => k.startsWith('node_modules/'))
    .map(k => k.replace('node_modules/', ''));

  const transitiveDeps = allDeps.filter(d => !directDeps.has(d));

  return {
    direct: directDeps.size,
    transitive: transitiveDeps.length,
    total: allDeps.length,
    ratio: (transitiveDeps.length / directDeps.size).toFixed(1),
    // High ratio means more supply chain exposure
  };
}
```

---

## Unmaintained Package Detection

When evaluating packages, check for:

| Signal | Threshold | Risk |
|--------|-----------|------|
| Last publish | > 1 year | Moderate - may miss security patches |
| Last publish | > 2 years | High - likely abandoned |
| Maintainer count | 0-1 | Bus factor risk |
| Open issues | > 100 unanswered | May be abandoned |
| No repository | Missing | Cannot audit source |
| Deprecated flag | Set | Replace immediately |

### Using npm to check package health

```bash
# Check package details
npm view <package-name> time --json | jq '.modified'
npm view <package-name> maintainers
npm view <package-name> repository

# Check if deprecated
npm view <package-name> deprecated
```

---

## Dependency Security Checklist

### CI Pipeline
- [ ] `npm audit --production` runs on every PR (fail on high/critical)
- [ ] `npm ci` used instead of `npm install` (respects lockfile)
- [ ] Lockfile integrity verification in CI
- [ ] SBOM generated on every release

### Automation
- [ ] Dependabot configured for npm, GitHub Actions, and Docker
- [ ] Security advisories subscription for critical packages
- [ ] Automated PR for security updates

### Compliance
- [ ] License compliance check passes (no GPL contamination)
- [ ] SBOM available for compliance requirements
- [ ] Unmaintained packages identified and tracked

### Supply Chain
- [ ] No git dependencies in production
- [ ] All packages resolve to npmjs.org registry
- [ ] Integrity hashes present for all packages
- [ ] New dependencies reviewed before adding
- [ ] Typosquatting check on new package additions

---

## Integration with Sigma Protocol

### /security-audit
Include dependency analysis in security audit reports.

### /dependency-update
Use this skill when running dependency updates.

### /pr-review
Flag dependency changes that introduce license or security risks.

### /license-check
Reference this skill for license compliance auditing.

---

_Your application is only as secure as its weakest dependency. Every package in your supply chain is a potential attack surface._
