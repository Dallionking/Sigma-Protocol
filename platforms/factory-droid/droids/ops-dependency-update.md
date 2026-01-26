---
name: dependency-update
description: "Intelligent dependency update workflow with AI-guided migration, changelog integration, peer dependency intelligence, automated testing, and safe rollback"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# dependency-update

**Source:** Sigma Protocol ops module
**Version:** 3.0.0

---


# @dependency-update

**Intelligent dependency update workflow with AI-guided migration and safety checks**

## 🎯 Purpose

Eliminate the risk and tedium of manual dependency updates. Research shows that **manual updates fail 40% of the time** due to breaking changes, while **outdated dependencies cause 30% of security incidents**. This command provides AI-guided updates with automated testing and safe rollback.

**For agencies:** Keeps projects secure and current without breaking production, reduces maintenance burden, and prevents security vulnerabilities.

---

## 📋 Command Usage

```bash
@dependency-update
@dependency-update --severity=critical
@dependency-update --dry-run
@dependency-update --auto-test
@dependency-update --rollback
@dependency-update --staged              # Update in batches by risk level
@dependency-update --include-changelogs  # Fetch and display changelogs
@dependency-update --check-peers         # Validate peer dependencies
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--severity` | Update priority: `critical`, `high`, `medium`, `all` | `high` |
| `--dry-run` | Preview changes without applying | `false` |
| `--auto-test` | Run tests automatically after update | `true` |
| `--rollback` | Rollback to previous package.json | `false` |
| `--staged` | Update in batches by risk level with testing between batches | `false` |
| `--include-changelogs` | Auto-fetch and display changelogs for updates | `false` |
| `--check-peers` | Detect and resolve peer dependency conflicts | `true` |

---

## 📁 File Management (CRITICAL)

**File Strategy**: `append-dated` - Track dependency update history

**Output**: `/docs/dependencies/DEPENDENCY-UPDATE-2025-11-06.md`

**Manifest**: `updateManifest('@dependency-update', filePath, 'append-dated')`

---

## 🎯 Update Severity Levels

### Critical (Security Vulnerabilities)
**What:** CVEs with known exploits, breaking security  
**When:** Immediately  
**Example:** `next@14.1.0` → `next@14.2.5` (XSS vulnerability)

```bash
@dependency-update --severity=critical
```

---

### High (Major Security + Breaking Bugs)
**What:** Security issues + critical bug fixes  
**When:** Within 1 week  
**Example:** `react@18.2.0` → `react@18.3.1` (memory leak fix)

```bash
@dependency-update --severity=high
```

---

### Medium (Minor/Patch Updates)
**What:** Bug fixes, performance improvements  
**When:** Monthly  
**Example:** `drizzle-orm@0.28.0` → `drizzle-orm@0.28.6` (bug fixes)

```bash
@dependency-update --severity=medium
```

---

### All (Including Major Versions)
**What:** All available updates including breaking changes  
**When:** Quarterly (with thorough testing)  
**Example:** `next@14.2.5` → `next@15.0.0` (major version)

```bash
@dependency-update --severity=all
```

---

## 📦 What Gets Updated

### Dependency Categories

1. **Framework** (Next.js, React)
2. **Database** (Drizzle ORM, Postgres drivers)
3. **UI Libraries** (shadcn/ui, Radix, Tailwind)
4. **Auth/Security** (Supabase, bcrypt, jose)
5. **API/Network** (Axios, fetch polyfills)
6. **Development** (TypeScript, ESLint, Prettier)
7. **Testing** (Vitest, Playwright, Testing Library)
8. **Build Tools** (Turbopack, SWC)

---

## 📄 Update Process Flow

```
1. Scan Dependencies
   ↓
2. Check for Updates
   ↓
3. Analyze Breaking Changes (AI)
   ↓
4. Preview Changes
   ↓
5. User Approval
   ↓
6. Apply Updates
   ↓
7. Run Tests
   ↓
8. Generate Migration Guide
   ↓
9. Commit Changes (or Rollback)
```

---

## 📊 Update Report Format

```markdown
# Dependency Update Report
**Date:** November 6, 2025  
**Severity:** High  
**Total Updates:** 8 packages

---

## 📊 Summary

**Security Fixes:** 2 critical, 1 high  
**Bug Fixes:** 3  
**Performance Improvements:** 2  
**Breaking Changes:** 0

**Status:** ✅ All updates applied successfully  
**Tests:** ✅ Passed (148/148)

---

## 🔒 Security Updates

### 1. next: 14.1.0 → 14.2.5 (CRITICAL)

**Vulnerability:** CVE-2024-XXXX (XSS in server components)  
**Severity:** Critical (CVSS 9.1)  
**Impact:** Remote code execution possible  
**Exploited:** Yes (in the wild)

**Fix:**
\`\`\`bash
pnpm update next@14.2.5
\`\`\`

**Breaking Changes:** None  
**Migration Required:** No

---

### 2. jose: 4.14.0 → 4.15.4 (HIGH)

**Vulnerability:** CVE-2024-YYYY (JWT signature bypass)  
**Severity:** High (CVSS 7.5)  
**Impact:** Authentication bypass possible  
**Exploited:** No (proof-of-concept exists)

**Fix:**
\`\`\`bash
pnpm update jose@4.15.4
\`\`\`

**Breaking Changes:** None  
**Migration Required:** No

---

## 🐛 Bug Fixes

### 3. drizzle-orm: 0.28.0 → 0.28.6

**Changes:**
- Fixed connection pool leak
- Improved query performance (20% faster)
- Fixed TypeScript inference for nested relations

**Breaking Changes:** None

---

### 4. @supabase/supabase-js: 2.38.0 → 2.39.3

**Changes:**
- Fixed real-time subscription memory leak
- Improved error messages
- Added retry logic for failed requests

**Breaking Changes:** None

---

## ⚡ Performance Improvements

### 5. sharp: 0.32.0 → 0.33.5

**Improvements:**
- 30% faster image processing
- Reduced memory usage by 40%
- Added WebP optimization

**Breaking Changes:** None

---

## 📚 All Updates

| Package | From | To | Type | Breaking |
|---------|------|-----|------|----------|
| next | 14.1.0 | 14.2.5 | Security | No |
| jose | 4.14.0 | 4.15.4 | Security | No |
| drizzle-orm | 0.28.0 | 0.28.6 | Bug Fix | No |
| @supabase/supabase-js | 2.38.0 | 2.39.3 | Bug Fix | No |
| sharp | 0.32.0 | 0.33.5 | Performance | No |
| @radix-ui/react-dialog | 1.0.5 | 1.1.1 | Bug Fix | No |
| zod | 3.22.0 | 3.23.8 | Feature | No |
| typescript | 5.3.2 | 5.3.3 | Bug Fix | No |

---

## 🧪 Testing Results

**Tests Run:** 148  
**Passed:** 148 ✅  
**Failed:** 0  
**Skipped:** 0

**Test Suites:**
- Unit Tests: ✅ 87/87 passed
- Integration Tests: ✅ 42/42 passed
- E2E Tests: ✅ 19/19 passed

**Coverage:** 94% (unchanged)

---

## 🔄 Migration Guide

### No Breaking Changes

All updates are backward-compatible. No code changes required.

### Recommended Actions

1. **Clear cache** (optional):
   \`\`\`bash
   rm -rf .next
   pnpm build
   \`\`\`

2. **Test authentication** (jose updated):
   - Verify login/logout works
   - Check JWT token validation
   - Test API authentication

3. **Monitor image processing** (sharp updated):
   - Verify image uploads work
   - Check thumbnail generation
   - Monitor memory usage

---

## 📝 Changelog

**Generated changelog for commit:**

\`\`\`
chore(deps): update dependencies (security fixes)

Security Updates:
- next@14.2.5 (CVE-2024-XXXX - Critical XSS fix)
- jose@4.15.4 (CVE-2024-YYYY - JWT bypass fix)

Bug Fixes:
- drizzle-orm@0.28.6 (connection pool leak)
- @supabase/supabase-js@2.39.3 (memory leak fix)

Performance:
- sharp@0.33.5 (30% faster image processing)

Other:
- @radix-ui/react-dialog@1.1.1
- zod@3.23.8
- typescript@5.3.3

All tests passing (148/148).
\`\`\`

---

## 🔗 References

- [Next.js Security Advisory](https://github.com/vercel/next.js/security/advisories/...)
- [Jose Security Advisory](https://github.com/panva/jose/security/advisories/...)
- [Drizzle ORM Changelog](https://github.com/drizzle-team/drizzle-orm/releases/...)

---

## 💾 Rollback Instructions

If issues arise, rollback with:

\`\`\`bash
@dependency-update --rollback
\`\`\`

Or manually:
\`\`\`bash
git checkout HEAD~1 package.json pnpm-lock.yaml
pnpm install
\`\`\`

**Backup saved:** `/tmp/package-backup-2025-11-06.json`

---

**Next Update Check:** December 6, 2025 (monthly)

$END$
```

---

## 🛠️ Implementation Phases

### Phase 1: Scan Current Dependencies

**Read package.json:**
```typescript
interface Package {
  name: string;
  currentVersion: string;
  latestVersion: string;
  type: 'dependencies' | 'devDependencies';
  category: string;
}

async function scanDependencies(): Promise<Package[]> {
  const packageJson = JSON.parse(await readFile('package.json'));
  const packages: Package[] = [];
  
  // Scan dependencies
  for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
    const latest = await getLatestVersion(name);
    packages.push({
      name,
      currentVersion: version,
      latestVersion: latest,
      type: 'dependencies',
      category: categorizeDependency(name),
    });
  }
  
  // Scan devDependencies
  for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
    const latest = await getLatestVersion(name);
    packages.push({
      name,
      currentVersion: version,
      latestVersion: latest,
      type: 'devDependencies',
      category: categorizeDependency(name),
    });
  }
  
  return packages;
}

function categorizeDependency(name: string): string {
  if (name === 'next' || name === 'react') return 'framework';
  if (name.includes('drizzle') || name.includes('pg')) return 'database';
  if (name.includes('radix') || name === 'tailwindcss') return 'ui';
  if (name.includes('supabase') || name === 'jose') return 'auth';
  if (name.includes('test') || name === 'vitest') return 'testing';
  if (name === 'typescript' || name === 'eslint') return 'development';
  return 'other';
}
```

---

### Phase 2: Check for Security Vulnerabilities

**Run npm audit:**
```bash
pnpm audit --json > /tmp/audit-results.json
```

**Parse vulnerabilities:**
```typescript
interface Vulnerability {
  package: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cve: string;
  title: string;
  description: string;
  recommendation: string;
}

async function checkVulnerabilities(): Promise<Vulnerability[]> {
  const auditResults = JSON.parse(await readFile('/tmp/audit-results.json'));
  
  return auditResults.vulnerabilities.map(vuln => ({
    package: vuln.name,
    severity: vuln.severity,
    cve: vuln.cve,
    title: vuln.title,
    description: vuln.overview,
    recommendation: vuln.recommendation,
  }));
}
```

---

### Phase 3: Enhanced AI Analysis of Breaking Changes

**Use Exa MCP + Perplexity + Context7 for comprehensive migration research:**

```typescript
interface BreakingChangeAnalysis {
  hasBreakingChanges: boolean;
  migrationSteps: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  codeChanges: CodeChange[];
  changelog: ChangelogEntry[];
}

async function analyzeBreakingChanges(pkg: Package): Promise<BreakingChangeAnalysis> {
  const platform = detectPlatform();
  
  // Primary: Use Exa MCP for code context (Cursor only)
  let codeContext = '';
  if (platform === 'cursor') {
    codeContext = await mcp_exa_get_code_context_exa({
      query: `${pkg.name} migration guide ${pkg.currentVersion} to ${pkg.latestVersion} breaking changes`,
      tokensNum: 5000,
    });
  }
  
  // Secondary: Query Context7 for official migration guide
  let officialDocs = '';
  try {
    const libId = await mcp_context7_resolve_library_id(pkg.name);
    officialDocs = await mcp_context7_get_library_docs(libId, {
      topic: `migration from ${pkg.currentVersion} to ${pkg.latestVersion}`
    });
  } catch (e) {
    // Fallback if Context7 fails
  }
  
  // Tertiary: Query Perplexity for community experience
  const communityInsights = await mcp_perplexity_ask([{
    role: 'user',
    content: `What breaking changes exist when upgrading ${pkg.name} from ${pkg.currentVersion} to ${pkg.latestVersion}? Provide specific migration steps with code examples.`
  }]);
  
  // Fetch changelog if requested
  const changelog = params.includeChangelogs ? 
    await fetchChangelog(pkg.name, pkg.currentVersion, pkg.latestVersion) : [];
  
  // Parse and combine insights
  return {
    hasBreakingChanges: detectBreakingChanges(codeContext, officialDocs, communityInsights),
    migrationSteps: extractMigrationSteps(codeContext, officialDocs, communityInsights),
    estimatedEffort: estimateEffort(codeContext, officialDocs, communityInsights),
    riskLevel: assessRisk(codeContext, officialDocs, communityInsights),
    codeChanges: extractCodeChanges(codeContext, officialDocs, communityInsights),
    changelog,
  };
}

function detectBreakingChanges(...sources: string[]): boolean {
  const keywords = ['breaking', 'BREAKING', 'removed', 'deprecated', 'renamed', 'major version', 'no longer supported'];
  return sources.some(source => 
    keywords.some(kw => source.toLowerCase().includes(kw.toLowerCase()))
  );
}

function extractCodeChanges(...sources: string[]): CodeChange[] {
  const changes: CodeChange[] = [];
  
  // Look for code block patterns
  const codeBlockPattern = /```(?:typescript|javascript|ts|js)?\n([\s\S]*?)```/g;
  
  for (const source of sources) {
    const matches = source.matchAll(codeBlockPattern);
    for (const match of matches) {
      const code = match[1];
      // Detect common breaking change patterns
      if (code.includes('import') || code.includes('require')) {
        changes.push({
          type: 'import-change',
          before: extractBeforeCode(code),
          after: extractAfterCode(code),
          file: 'auto-detected',
        });
      }
    }
  }
  
  return changes;
}
```

### Phase 3.1: Changelog Integration

```typescript
interface ChangelogEntry {
  version: string;
  date: string;
  type: 'security' | 'breaking' | 'feature' | 'bugfix' | 'performance';
  title: string;
  description: string;
  migrationNote?: string;
}

async function fetchChangelog(
  packageName: string,
  fromVersion: string,
  toVersion: string
): Promise<ChangelogEntry[]> {
  // Try multiple sources
  const sources = [
    `https://github.com/${getGitHubRepo(packageName)}/releases`,
    `https://www.npmjs.com/package/${packageName}`,
    `https://unpkg.com/${packageName}@${toVersion}/CHANGELOG.md`,
  ];
  
  const entries: ChangelogEntry[] = [];
  
  for (const source of sources) {
    try {
      if (platform === 'cursor') {
        const content = await mcp_exa_crawling_exa({ url: source, maxCharacters: 10000 });
        const parsed = parseChangelog(content, fromVersion, toVersion);
        entries.push(...parsed);
        break; // Use first successful source
      } else {
        // Fallback: Use web_search or curl
        const content = await fetchChangelogFallback(source);
        const parsed = parseChangelog(content, fromVersion, toVersion);
        entries.push(...parsed);
        break;
      }
    } catch (e) {
      continue; // Try next source
    }
  }
  
  return entries;
}

function parseChangelog(content: string, fromVersion: string, toVersion: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  
  // Common changelog patterns
  const versionPattern = /##?\s*\[?v?(\d+\.\d+\.\d+)\]?/g;
  const securityPattern = /security|vulnerability|cve|CVE/gi;
  const breakingPattern = /breaking|BREAKING|removed|deprecated/gi;
  
  const versions = extractVersionsBetween(content, fromVersion, toVersion);
  
  for (const version of versions) {
    const section = extractVersionSection(content, version);
    
    entries.push({
      version,
      date: extractDate(section),
      type: securityPattern.test(section) ? 'security' :
            breakingPattern.test(section) ? 'breaking' :
            section.includes('feat') ? 'feature' :
            section.includes('fix') ? 'bugfix' : 'performance',
      title: extractTitle(section),
      description: section,
      migrationNote: extractMigrationNote(section),
    });
  }
  
  return entries;
}
```

### Phase 3.2: Peer Dependency Intelligence

```typescript
interface PeerDependencyConflict {
  package: string;
  required: string;
  installed: string;
  conflict: boolean;
  resolution: string;
}

async function checkPeerDependencies(pkg: Package): Promise<PeerDependencyConflict[]> {
  if (!params.checkPeers) return [];
  
  const packageJson = JSON.parse(await readFile('package.json'));
  const conflicts: PeerDependencyConflict[] = [];
  
  // Get peer dependencies for the package
  const peerDeps = await getPeerDependencies(pkg.name, pkg.latestVersion);
  
  for (const [peerName, peerVersion] of Object.entries(peerDeps)) {
    const installedVersion = packageJson.dependencies?.[peerName] || 
                           packageJson.devDependencies?.[peerName];
    
    if (!installedVersion) {
      conflicts.push({
        package: peerName,
        required: peerVersion as string,
        installed: 'not installed',
        conflict: true,
        resolution: `Install ${peerName}@${peerVersion}`,
      });
    } else if (!satisfiesVersion(installedVersion, peerVersion as string)) {
      conflicts.push({
        package: peerName,
        required: peerVersion as string,
        installed: installedVersion,
        conflict: true,
        resolution: `Update ${peerName} to ${peerVersion}`,
      });
    }
  }
  
  return conflicts;
}

async function getPeerDependencies(packageName: string, version: string): Promise<Record<string, string>> {
  // Fetch package.json from npm registry
  const registryUrl = `https://registry.npmjs.org/${packageName}/${version}`;
  const response = await fetch(registryUrl);
  const data = await response.json();
  
  return data.peerDependencies || {};
}

function satisfiesVersion(installed: string, required: string): boolean {
  // Use semver library logic
  // Simplified: check if installed version satisfies required range
  if (required.startsWith('^') || required.startsWith('~')) {
    const [major, minor] = required.replace(/[^0-9.]/g, '').split('.');
    const [instMajor, instMinor] = installed.replace(/[^0-9.]/g, '').split('.');
    
    if (required.startsWith('^')) {
      return instMajor === major;
    } else if (required.startsWith('~')) {
      return instMajor === major && instMinor === minor;
    }
  }
  
  return installed === required;
}
```

### Phase 3.3: Staged Rollout Support

```typescript
interface UpdateBatch {
  batch: number;
  riskLevel: 'low' | 'medium' | 'high';
  packages: Package[];
  estimatedTime: number;
}

async function createStagedRollout(updates: Package[]): Promise<UpdateBatch[]> {
  if (!params.staged) {
    return [{ batch: 1, riskLevel: 'low', packages: updates, estimatedTime: 0 }];
  }
  
  // Group by risk level
  const batches: UpdateBatch[] = [];
  
  // Batch 1: Low risk (patch versions, no breaking changes)
  const lowRisk = updates.filter(p => 
    !p.analysis.hasBreakingChanges && 
    isPatchUpdate(p) &&
    p.vulnerabilities.length === 0
  );
  if (lowRisk.length > 0) {
    batches.push({
      batch: 1,
      riskLevel: 'low',
      packages: lowRisk,
      estimatedTime: estimateBatchTime(lowRisk),
    });
  }
  
  // Batch 2: Medium risk (minor versions, security fixes)
  const mediumRisk = updates.filter(p => 
    !p.analysis.hasBreakingChanges &&
    (isMinorUpdate(p) || p.vulnerabilities.length > 0)
  );
  if (mediumRisk.length > 0) {
    batches.push({
      batch: 2,
      riskLevel: 'medium',
      packages: mediumRisk,
      estimatedTime: estimateBatchTime(mediumRisk),
    });
  }
  
  // Batch 3: High risk (major versions, breaking changes)
  const highRisk = updates.filter(p => 
    p.analysis.hasBreakingChanges || isMajorUpdate(p)
  );
  if (highRisk.length > 0) {
    batches.push({
      batch: 3,
      riskLevel: 'high',
      packages: highRisk,
      estimatedTime: estimateBatchTime(highRisk),
    });
  }
  
  return batches;
}

async function executeStagedRollout(batches: UpdateBatch[]): Promise<void> {
  for (const batch of batches) {
    console.log(`\n📦 Processing Batch ${batch.batch} (${batch.riskLevel} risk): ${batch.packages.length} packages`);
    
    // Apply updates for this batch
    for (const pkg of batch.packages) {
      await applyUpdate(pkg);
    }
    
    // Install dependencies
    await runTerminalCmd('pnpm install');
    
    // Run tests
    console.log(`🧪 Testing batch ${batch.batch}...`);
    const testResult = await runTerminalCmd('pnpm test');
    
    if (testResult.exitCode !== 0) {
      console.error(`❌ Tests failed for batch ${batch.batch}. Rolling back...`);
      await rollbackBatch(batch);
      throw new Error(`Batch ${batch.batch} failed tests`);
    }
    
    console.log(`✅ Batch ${batch.batch} passed tests`);
    
    // Commit this batch
    await commitBatch(batch);
    
    // Wait for user approval before next batch (if high risk)
    if (batch.riskLevel === 'high' && batch.batch < batches.length) {
      console.log(`\n⏸️  Pausing before next batch. Review changes and continue?`);
      // In real implementation, wait for user input
    }
  }
}

function isPatchUpdate(pkg: Package): boolean {
  const [cMajor, cMinor, cPatch] = pkg.currentVersion.split('.').map(Number);
  const [lMajor, lMinor, lPatch] = pkg.latestVersion.split('.').map(Number);
  return cMajor === lMajor && cMinor === lMinor && cPatch < lPatch;
}

function isMinorUpdate(pkg: Package): boolean {
  const [cMajor, cMinor] = pkg.currentVersion.split('.').map(Number);
  const [lMajor, lMinor] = pkg.latestVersion.split('.').map(Number);
  return cMajor === lMajor && cMinor < lMinor;
}

function isMajorUpdate(pkg: Package): boolean {
  const [cMajor] = pkg.currentVersion.split('.').map(Number);
  const [lMajor] = pkg.latestVersion.split('.').map(Number);
  return cMajor < lMajor;
}
```

---

### Phase 4: Filter by Severity

**Prioritize updates:**
```typescript
function filterBySeverity(
  packages: Package[],
  vulnerabilities: Vulnerability[],
  severity: string
): Package[] {
  // Critical: Only security vulnerabilities
  if (severity === 'critical') {
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    return packages.filter(p => criticalVulns.some(v => v.package === p.name));
  }
  
  // High: Security + critical bugs
  if (severity === 'high') {
    const highVulns = vulnerabilities.filter(v => 
      v.severity === 'critical' || v.severity === 'high'
    );
    return packages.filter(p => 
      highVulns.some(v => v.package === p.name) ||
      hasKnownCriticalBugs(p)
    );
  }
  
  // Medium: Patch and minor updates
  if (severity === 'medium') {
    return packages.filter(p => !isMajorUpdate(p));
  }
  
  // All: Everything
  return packages;
}

function isMajorUpdate(pkg: Package): boolean {
  const [currentMajor] = pkg.currentVersion.split('.');
  const [latestMajor] = pkg.latestVersion.split('.');
  return currentMajor !== latestMajor;
}
```

---

### Phase 5: Generate Preview

**Show changes before applying:**
```typescript
function generatePreview(updates: Package[]): string {
  let preview = '📦 Dependency Updates Preview\n\n';
  
  // Group by category
  const byCategory = groupBy(updates, u => u.category);
  
  for (const [category, pkgs] of Object.entries(byCategory)) {
    preview += `## ${capitalize(category)}\n\n`;
    
    for (const pkg of pkgs) {
      const breakingChange = pkg.analysis.hasBreakingChanges ? ' ⚠️ BREAKING' : '';
      const security = pkg.vulnerabilities.length > 0 ? ' 🔒 SECURITY' : '';
      
      preview += `- ${pkg.name}: ${pkg.currentVersion} → ${pkg.latestVersion}${breakingChange}${security}\n`;
      
      if (pkg.vulnerabilities.length > 0) {
        for (const vuln of pkg.vulnerabilities) {
          preview += `  - ${vuln.cve}: ${vuln.title}\n`;
        }
      }
      
      if (pkg.analysis.hasBreakingChanges) {
        preview += `  - Migration effort: ${pkg.analysis.estimatedEffort}\n`;
      }
    }
    
    preview += '\n';
  }
  
  return preview;
}
```

---

### Phase 6: Apply Updates

**If `--dry-run` not set:**

```bash
# Backup current package.json
cp package.json /tmp/package-backup-$(date +%Y-%m-%d).json
cp pnpm-lock.yaml /tmp/pnpm-lock-backup-$(date +%Y-%m-%d).yaml

# Apply updates
for pkg in $updates; do
  pnpm update $pkg@latest
done
```

**Or use npm-check-updates:**
```bash
npx npm-check-updates -u --filter "$package_list"
pnpm install
```

---

### Phase 7: Automated Testing

**If `--auto-test` enabled (default):**

```bash
# Type check
echo "🔍 Type checking..."
pnpm tsc --noEmit || exit 1

# Linting
echo "🧹 Linting..."
pnpm lint || exit 1

# Unit tests
echo "🧪 Running tests..."
pnpm test || exit 1

# Build check
echo "🏗️ Building..."
pnpm build || exit 1

echo "✅ All checks passed!"
```

**If tests fail → Automatic rollback:**
```typescript
async function handleTestFailure(): Promise<void> {
  console.error('❌ Tests failed. Rolling back...');
  
  await runCommand('git checkout HEAD -- package.json pnpm-lock.yaml');
  await runCommand('pnpm install');
  
  console.log('✅ Rollback complete. System restored to previous state.');
  
  // Generate failure report
  await generateFailureReport({
    failedTests: getFailedTests(),
    likelyBreakingChange: identifyBreakingChange(),
    recommendation: 'Update one package at a time to isolate issue',
  });
}
```

---

### Phase 8: Generate Migration Guide

**For breaking changes:**

```typescript
async function generateMigrationGuide(updates: Package[]): Promise<string> {
  const breakingUpdates = updates.filter(u => u.analysis.hasBreakingChanges);
  
  if (breakingUpdates.length === 0) {
    return '### No Breaking Changes\n\nAll updates are backward-compatible. No code changes required.';
  }
  
  let guide = '### Migration Guide\n\n';
  
  for (const update of breakingUpdates) {
    guide += `#### ${update.name}: ${update.currentVersion} → ${update.latestVersion}\n\n`;
    guide += `**Breaking Changes:**\n`;
    
    for (const step of update.analysis.migrationSteps) {
      guide += `1. ${step}\n`;
    }
    
    guide += `\n**Estimated Effort:** ${update.analysis.estimatedEffort}\n\n`;
    
    // Find affected files
    const affectedFiles = await findAffectedFiles(update.name);
    if (affectedFiles.length > 0) {
      guide += `**Files to Update:**\n`;
      for (const file of affectedFiles) {
        guide += `- \`${file}\`\n`;
      }
      guide += '\n';
    }
  }
  
  return guide;
}

async function findAffectedFiles(packageName: string): Promise<string[]> {
  // Search for import statements
  const result = await runCommand(`grep -r "from '${packageName}" --include="*.ts" --include="*.tsx" .`);
  return result.split('\n').map(line => line.split(':')[0]).filter(Boolean);
}
```

---

### Phase 9: Commit Changes

**Generate semantic commit message:**

```typescript
function generateCommitMessage(updates: Package[]): string {
  const security = updates.filter(u => u.vulnerabilities.length > 0);
  const breaking = updates.filter(u => u.analysis.hasBreakingChanges);
  
  let type = 'chore';
  if (security.length > 0) type = 'security';
  if (breaking.length > 0) type = 'BREAKING';
  
  let message = `${type}(deps): update dependencies`;
  
  if (security.length > 0) {
    message += ' (security fixes)';
  }
  
  message += '\n\n';
  
  // List security updates
  if (security.length > 0) {
    message += 'Security Updates:\n';
    for (const pkg of security) {
      const vuln = pkg.vulnerabilities[0];
      message += `- ${pkg.name}@${pkg.latestVersion} (${vuln.cve} - ${vuln.title})\n`;
    }
    message += '\n';
  }
  
  // List breaking changes
  if (breaking.length > 0) {
    message += 'Breaking Changes:\n';
    for (const pkg of breaking) {
      message += `- ${pkg.name}@${pkg.latestVersion}\n`;
    }
    message += '\n';
  }
  
  // List other updates
  const other = updates.filter(u => 
    !u.vulnerabilities.length && !u.analysis.hasBreakingChanges
  );
  if (other.length > 0) {
    message += 'Other Updates:\n';
    for (const pkg of other) {
      message += `- ${pkg.name}@${pkg.latestVersion}\n`;
    }
  }
  
  message += '\nAll tests passing.';
  
  return message;
}
```

**Commit:**
```bash
git add package.json pnpm-lock.yaml
git commit -m "$commit_message"
```

---

### Phase 10: Validation & Output

**Final checks:**
- [ ] Updates applied successfully
- [ ] Tests passed
- [ ] No linter errors
- [ ] Build succeeds
- [ ] Migration guide generated
- [ ] Commit created

**Output summary:**
```
✅ Dependency Updates Complete

📦 Updated: 8 packages
🔒 Security Fixes: 2 critical, 1 high
🐛 Bug Fixes: 3
⚡ Performance: 2
⚠️ Breaking Changes: 0

🧪 Tests: ✅ Passed (148/148)
📄 Report: /docs/updates/DEPENDENCY-UPDATE-2025-11-06.md
💾 Backup: /tmp/package-backup-2025-11-06.json

📝 Commit: 7a8b9c2 "chore(deps): update dependencies (security fixes)"

🎯 Recommendations:
  1. Deploy to staging for validation
  2. Test authentication (jose updated)
  3. Monitor image processing (sharp updated)

Next Update Check: December 6, 2025 (monthly)
```

---

## 🎯 Success Metrics

**Update Quality Indicators:**
- All tests passing ✅
- No regressions introduced ✅
- Security vulnerabilities fixed ✅
- Migration guide provided (if breaking changes) ✅
- Rollback available ✅

**Safety Indicators:**
- Backup created ✅
- Changes committed to Git ✅
- Dry-run option available ✅
- Automated testing ✅

---

## 🔄 Maintenance

**This command should be run:**
- **Weekly:** Critical security updates
- **Monthly:** High-priority updates
- **Quarterly:** All updates (including major versions)
- **Ad-hoc:** When vulnerabilities disclosed

**Automated scheduling:**
```bash
# GitHub Action (weekly)
name: Dependency Updates
on:
  schedule:
    - cron: '0 0 * * 1'  # Every Monday
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: @dependency-update --severity=high --auto-test
```

---

## 💡 Pro Tips

1. **Start small** - Update one package at a time for complex changes
2. **Test thoroughly** - Always run full test suite
3. **Read changelogs** - Use `--include-changelogs` to see what changed
4. **Staged updates** - Use `--staged` for safer major version updates
5. **Check peers** - Use `--check-peers` to avoid dependency conflicts
6. **Staging first** - Never update production directly
7. **Monitor errors** - Watch error tracking after updates
8. **Keep backups** - Git is your friend
9. **Automate checks** - CI/CD prevents broken updates from merging
10. **AI guidance** - Review migration steps from AI analysis before applying

---

## 🛠️ Technical Implementation Notes

**For Cursor AI implementing this command:**

1. **Use package manager API** - pnpm, npm, or yarn
2. **Parse semver correctly** - Use `semver` package
3. **Query vulnerability databases** - npm audit, Snyk, GitHub Security
4. **AI for migration** - Exa MCP (primary) + Perplexity + Context7 for breaking changes
5. **Changelog fetching** - Multiple sources (GitHub releases, npm, unpkg)
6. **Peer dependency resolution** - Check npm registry for peer deps
7. **Staged rollout** - Group by risk, test between batches
8. **Automated testing** - Must pass before committing
9. **Safe rollback** - Always create backups, rollback per batch if needed
10. **Semantic commits** - Follow conventional commits
11. **Cross-platform** - Fallback patterns for Claude Code/Open Code

**Performance:**
- Scan time: ~30 seconds
- Update time: ~2 minutes
- Test time: ~3 minutes
- Total: ~5-6 minutes

**Error Handling:**
- If tests fail → Auto-rollback
- If migration complex → Warn user, require manual approval
- If package manager fails → Retry once, then fail gracefully
- If AI queries fail → Fallback to changelog parsing

---

$END$
