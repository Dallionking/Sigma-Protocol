---
name: code-quality-report
description: "Generate client-friendly code quality report with visualizations - test coverage, complexity, security, performance, accessibility"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
  # MCP tools inherited from original command
---

# code-quality-report

**Source:** Sigma Protocol audit module
**Version:** 2.0.0

---


# @code-quality-report

**Generate comprehensive, client-friendly code quality report with visualizations**

## 🎯 Purpose

Create professional code quality reports that build trust with clients and demonstrate your agency's commitment to excellence. Research shows that **transparent quality metrics increase client satisfaction by 40%** and reduce post-delivery disputes.

**For agencies:** Use this to differentiate your work, justify pricing, and build long-term client relationships.

---

## 📋 Command Usage

```bash
@code-quality-report
@code-quality-report --format=pdf
@code-quality-report --compare=/docs/quality/CODE-QUALITY-2025-10-01.md
@code-quality-report --output=/client/quality-report.pdf
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--format` | Output format: `markdown`, `pdf`, or `both` | `both` |
| `--compare` | Compare with previous report (path to file) | - |
| `--output` | Custom output path | `/docs/quality/CODE-QUALITY-[DATE].md` |

---

## 📁 File Management (CRITICAL)

**File Strategy**: `append-dated` - Track quality improvements over time

**Output**: `/docs/quality/CODE-QUALITY-2025-11-06.md`

**Manifest**: `updateManifest('@code-quality-report', filePath, 'append-dated')`

---

## 🔄 Command Orchestration (Invokes Other Commands)

This command aggregates data from multiple quality sources:

1. **`@test-gen --coverage`** → Test coverage analysis
2. **`@tech-debt-audit --summary`** → Code complexity & debt metrics
3. **`@security-audit --score`** → Security vulnerability score
4. **`@performance-check --baseline`** → Performance benchmarks
5. **`@accessibility-audit`** → WCAG compliance score (if available)
6. **TypeScript** → Type safety percentage
7. **ESLint** → Code quality issues

**Why orchestration?** Clients care about holistic quality, not individual metrics. This command synthesizes everything into one digestible report.

---

## 📦 What Gets Generated

### Primary Output: Quality Report

```
/docs/quality/
  ├── CODE-QUALITY-2025-11-06.md           # Main report (start here)
  ├── CODE-QUALITY-2025-11-06.pdf          # Client-friendly PDF
  ├── quality-trends.json                   # Historical data for charting
  └── _history/
      ├── CODE-QUALITY-2025-10-01.md       # Previous reports
      └── CODE-QUALITY-2025-09-01.md
```

### Report Structure

```markdown
# Code Quality Report
**Project:** [Project Name]
**Generated:** November 6, 2025
**Overall Score:** 87/100 (Excellent)

---

## 📊 Executive Summary

**Quality Grade:** A (Excellent)
**Client-Safe:** ✅ Ready for production
**Key Strengths:**
- 94% test coverage (industry avg: 65%)
- Zero critical security vulnerabilities
- Excellent performance (avg response: 142ms)

**Areas for Improvement:**
- 3 medium-priority accessibility issues
- 12 TypeScript 'any' types (8% of codebase)

**Trend:** ↑ Quality improved 8% since last audit (Oct 1)

---

## 🎯 Quality Scorecard

| Metric | Score | Grade | Industry Avg | Status |
|--------|-------|-------|--------------|--------|
| Test Coverage | 94% | A+ | 65% | ✅ Excellent |
| Code Complexity | 88/100 | A | 75/100 | ✅ Excellent |
| Security | 95/100 | A+ | 80/100 | ✅ Excellent |
| Performance | 92/100 | A | 70/100 | ✅ Excellent |
| Accessibility | 78/100 | B+ | 65/100 | ⚠️ Good |
| Type Safety | 92% | A | 85% | ✅ Excellent |
| **Overall** | **87/100** | **A** | **70/100** | **✅ Excellent** |

**Grading Scale:**
- 90-100: A (Excellent)
- 80-89: B (Good)
- 70-79: C (Satisfactory)
- 60-69: D (Needs Improvement)
- <60: F (Critical Issues)

---

## 📈 Detailed Metrics

### 1. Test Coverage (94% - A+)

**What it means:** 94% of your code is verified by automated tests, reducing bugs and ensuring features work as expected.

**Coverage Breakdown:**
| File Type | Coverage | Files Tested | Files Untested |
|-----------|----------|--------------|----------------|
| Components | 96% | 87/90 | 3 |
| Server Actions | 92% | 45/49 | 4 |
| Utilities | 98% | 29/30 | 1 |
| API Routes | 88% | 22/25 | 3 |

**Untested Critical Files:**
- `actions/payments/process-payment.ts` (0% - HIGH PRIORITY)
- `actions/admin/delete-user.ts` (0% - MEDIUM PRIORITY)
- `components/checkout/PaymentForm.tsx` (45% - MEDIUM PRIORITY)

**Recommendation:** Add tests for payment processing (critical for security).

**Visual:**
```
Test Coverage: [████████████████████░] 94%
Industry Avg:  [█████████████░░░░░░░] 65%
```

---

### 2. Code Complexity (88/100 - A)

**What it means:** Code is well-structured and maintainable. Low complexity = easier to modify and debug.

**Complexity Breakdown:**
- **Simple functions** (<10 complexity): 87% (excellent)
- **Moderate functions** (10-20 complexity): 11% (acceptable)
- **Complex functions** (>20 complexity): 2% (needs refactoring)

**Most Complex Functions:**
| Function | Complexity | File | Action Needed |
|----------|-----------|------|---------------|
| `generatePRD()` | 28 | `actions/intake/generate-prd.ts` | Refactor (split into 3 functions) |
| `processVoiceInput()` | 24 | `lib/voice/processor.ts` | Refactor (extract validators) |
| `calculateComplexity()` | 22 | `lib/complexity/analyzer.ts` | Acceptable (well-tested) |

**Recommendation:** Refactor top 2 functions in next sprint (4-6 hours effort).

**Visual:**
```
Code Complexity Distribution:
Simple (87%)    [█████████████████░░]
Moderate (11%)  [██░░░░░░░░░░░░░░░░░]
Complex (2%)    [░░░░░░░░░░░░░░░░░░░]
```

---

### 3. Security (95/100 - A+)

**What it means:** Your application is well-protected against common vulnerabilities.

**Security Audit Results:**
- ✅ **Zero** critical vulnerabilities
- ✅ **Zero** high-priority vulnerabilities
- ⚠️ **2** medium-priority issues (non-blocking)
- ✅ **3** low-priority issues (cosmetic)

**Medium-Priority Issues:**
1. **Dependency:** `sharp@0.32.0` has known vulnerability (CVE-2024-XXXX)
   - **Fix:** Upgrade to `sharp@0.33.0` (5 minutes)
   - **Risk:** Low (not exploitable in current usage)

2. **Code Pattern:** 3 instances of `eval()` usage
   - **Location:** `lib/legacy/calculator.ts`
   - **Fix:** Replace with safe alternative (30 minutes)
   - **Risk:** Medium (if user input reaches eval)

**Low-Priority Issues:**
- Missing CSRF tokens on 3 forms (low risk, authenticated endpoints)
- X-Frame-Options header not set (low risk, not embedding)
- Content-Security-Policy could be stricter

**Recommendation:** Fix medium issues before next release (< 1 hour total).

**Visual:**
```
Security Score: [███████████████████░] 95/100
✅ Critical: 0
✅ High: 0
⚠️ Medium: 2
✅ Low: 3
```

---

### 4. Performance (92/100 - A)

**What it means:** Your application is fast and responsive, providing excellent user experience.

**Performance Benchmarks:**
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Homepage Load Time | 1.4s | <2s | ✅ Excellent |
| API Response (P95) | 142ms | <500ms | ✅ Excellent |
| Core Web Vitals | All Pass | All Pass | ✅ Excellent |
| Lighthouse Score | 94/100 | >90 | ✅ Excellent |
| Bundle Size | 287KB | <500KB | ✅ Excellent |

**Core Web Vitals:**
- **LCP (Largest Contentful Paint):** 1.2s (Good - target <2.5s)
- **FID (First Input Delay):** 45ms (Good - target <100ms)
- **CLS (Cumulative Layout Shift):** 0.02 (Good - target <0.1)

**Slowest Endpoints:**
1. `POST /api/prd/generate` - 2.8s avg (acceptable - AI processing)
2. `GET /api/crm/leads?search=*` - 680ms avg (optimize query)
3. `GET /dashboard` - 420ms avg (acceptable)

**Recommendation:** Add database index to `crm_leads` search query (10 minutes).

**Visual:**
```
Performance Score: [██████████████████░░] 92/100
LCP: [████████████████████░] 1.2s (Good)
FID: [████████████████████░] 45ms (Good)
CLS: [████████████████████░] 0.02 (Good)
```

---

### 5. Accessibility (78/100 - B+)

**What it means:** Your application is usable by people with disabilities, meeting most WCAG 2.2 AA standards.

**WCAG 2.2 AA Compliance:**
- ✅ **Level A:** 100% compliant (48/48 criteria)
- ⚠️ **Level AA:** 89% compliant (40/45 criteria)

**Accessibility Issues:**
| Severity | Count | Examples |
|----------|-------|----------|
| Critical | 0 | - |
| High | 0 | - |
| Medium | 3 | Missing alt text, insufficient contrast |
| Low | 7 | Minor ARIA improvements |

**Medium-Priority Issues:**
1. **Missing Alt Text:** 8 images without alt attributes
   - **Impact:** Screen readers can't describe images
   - **Fix:** Add descriptive alt text (20 minutes)

2. **Color Contrast:** 2 text elements below 4.5:1 ratio
   - **Location:** Footer links, disabled button text
   - **Fix:** Adjust colors (10 minutes)

3. **Keyboard Navigation:** 1 dropdown not keyboard-accessible
   - **Location:** Language selector in header
   - **Fix:** Add keyboard event handlers (15 minutes)

**Recommendation:** Fix all medium issues to achieve 98% compliance (45 minutes).

**Visual:**
```
Accessibility: [███████████████░░░░░] 78/100
Level A:  [████████████████████] 100%
Level AA: [█████████████████░░░] 89%
```

---

### 6. Type Safety (92% - A)

**What it means:** 92% of your code uses proper TypeScript types, reducing runtime errors.

**Type Safety Breakdown:**
- ✅ **Strongly typed:** 92% of codebase
- ⚠️ **Any types:** 8% of codebase (46 instances)
- ❌ **@ts-ignore:** 12 instances (code smell)

**Files with Most 'any' Usage:**
1. `lib/voice/realtime-client.ts` - 18 instances (third-party SDK)
2. `actions/intake/generate-prd.ts` - 12 instances (AI response parsing)
3. `components/crm/kanban-board.tsx` - 8 instances (drag-drop library)

**@ts-ignore Usage:**
1. `components/voice-intake/voice-intake-dialog.tsx` - 5 instances
2. `lib/prd/utils.ts` - 4 instances
3. `actions/admin/assess-build-complexity.ts` - 3 instances

**Recommendation:** 
- Replace `any` with `unknown` + type guards (safer)
- Replace `@ts-ignore` with `@ts-expect-error` + explanation
- Target: 95% type safety by next quarter (8 hours effort)

**Visual:**
```
Type Safety: [██████████████████░░] 92%
Strongly Typed:  [██████████████████░░]
Any Types:       [█░░░░░░░░░░░░░░░░░░░]
@ts-ignore:      [░░░░░░░░░░░░░░░░░░░░]
```

---

## 📉 Technical Debt Summary

**Total Debt Score:** 42/100 (Fair - from `@tech-debt-audit`)

**Quick Stats:**
- **TODO/FIXME comments:** 23 (3 high-priority)
- **Console.logs in production:** 17 (should be removed)
- **Duplicate code:** 6% (acceptable threshold: <5%)
- **Large files (>500 lines):** 4 files (2 need refactoring)

**Recommendation:** Allocate 1 sprint per quarter for debt reduction.

---

## 📊 Historical Trends

**Quality Score Over Time:**
```
100 ┤
 90 ┤     ●───●───● (Current: 87)
 80 ┤   ●           
 70 ┤ ●             
 60 ┤               
    └───────────────
   Aug Sep Oct Nov
```

**Analysis:**
- ↑ **+8 points** since October 1
- ↑ Test coverage improved from 86% → 94%
- ↑ Security score improved from 88 → 95
- → Performance stable at 92
- ↑ Type safety improved from 88% → 92%

**Trend:** Continuous improvement (excellent trajectory)

---

## 🎯 Recommendations

### High Priority (Fix Before Next Release)
1. ✅ Add tests for payment processing (2 hours)
2. ✅ Upgrade `sharp` dependency (5 minutes)
3. ✅ Fix 3 accessibility issues (45 minutes)

**Total effort:** ~3 hours

### Medium Priority (Plan for Next Sprint)
4. Refactor 2 complex functions (4-6 hours)
5. Add database index for search query (10 minutes)
6. Replace 15 critical `@ts-ignore` with proper types (2 hours)

**Total effort:** ~6-8 hours

### Low Priority (Backlog)
7. Remove console.logs (1 hour)
8. Reduce code duplication from 6% → 4% (2 hours)
9. Improve CSP headers (30 minutes)

**Total effort:** ~3-4 hours

---

## 🏆 Quality Certifications

Based on this audit, your project meets or exceeds:

✅ **Industry Standards**
- ✅ Test coverage >80% (yours: 94%)
- ✅ Security score >85 (yours: 95)
- ✅ Performance score >85 (yours: 92)

✅ **Best Practices**
- ✅ WCAG 2.2 Level A compliant (100%)
- ✅ Core Web Vitals passing (all green)
- ✅ Zero critical vulnerabilities

✅ **Agency Excellence**
- ✅ Overall score >85 (yours: 87)
- ✅ Continuous improvement trend
- ✅ Production-ready code

**Badge Earned:** 🏆 **Sigma Quality Certified** (87/100)

---

## 📝 Client Summary (Non-Technical)

**Dear Client,**

We're pleased to report that your application maintains **excellent quality standards**, scoring **87 out of 100** - well above the industry average of 70.

**What this means for you:**
- ✅ **Reliable:** 94% of code is tested, catching bugs before they reach users
- ✅ **Secure:** Zero critical vulnerabilities, bank-grade security practices
- ✅ **Fast:** Average load time of 1.4 seconds (faster than 90% of websites)
- ✅ **Accessible:** Usable by people with disabilities (meets legal requirements)

**Small improvements recommended:**
We've identified 3 minor accessibility improvements (45 minutes) and 1 security update (5 minutes) that we recommend completing before the next release. These are proactive enhancements, not urgent fixes.

**Your investment is protected:**
This quality audit demonstrates that your application is built to last, with clean code that's easy to maintain and extend. You're receiving enterprise-grade quality at a fair price.

**Questions?**
Contact us at support@sigmasoftware.com

---

## 🔗 Related Resources

**Automated Audits:**
- Full technical debt report: `/docs/tech-debt/DEBT-REPORT-2025-11-06.md`
- Security audit: `/docs/security/SECURITY-AUDIT-2025-11-06.md`
- Performance baseline: `/docs/performance/BASELINE-2025-11-06.md`

**Commands Used:**
- `@test-gen --coverage` - Test coverage analysis
- `@tech-debt-audit` - Code quality and complexity
- `@security-audit` - Vulnerability scanning
- `@performance-check` - Performance benchmarks

---

**Next Quality Audit:** December 6, 2025 (30 days)

$END$
```

---

## 🛠️ Implementation Phases

### Phase 1: Data Collection (Orchestrate Commands)

**Run quality checks in parallel:**

```bash
# Test coverage
@test-gen --coverage --output=/tmp/coverage.json

# Technical debt
@tech-debt-audit --summary --output=/tmp/debt.json

# Security
@security-audit --score --output=/tmp/security.json

# Performance
@performance-check --baseline --output=/tmp/performance.json

# Accessibility (if command exists)
@accessibility-audit --output=/tmp/accessibility.json || echo "Skipped"

# TypeScript check
pnpm tsc --noEmit --pretty false 2>&1 | tee /tmp/ts-errors.txt

# ESLint
pnpm lint --format json > /tmp/eslint.json 2>&1 || true
```

**Wait for all checks to complete** → Parse results.

---

### Phase 2: Calculate Overall Quality Score

**Weighted scoring algorithm:**

```typescript
interface QualityMetrics {
  testCoverage: number;      // 0-100
  codeComplexity: number;    // 0-100
  security: number;          // 0-100
  performance: number;       // 0-100
  accessibility: number;     // 0-100
  typeSafety: number;        // 0-100
}

function calculateOverallScore(metrics: QualityMetrics): number {
  // Weighted average (adjust weights based on project type)
  const weights = {
    testCoverage: 0.25,      // 25%
    codeComplexity: 0.15,    // 15%
    security: 0.25,          // 25%
    performance: 0.15,       // 15%
    accessibility: 0.10,     // 10%
    typeSafety: 0.10         // 10%
  };
  
  const score = 
    metrics.testCoverage * weights.testCoverage +
    metrics.codeComplexity * weights.codeComplexity +
    metrics.security * weights.security +
    metrics.performance * weights.performance +
    metrics.accessibility * weights.accessibility +
    metrics.typeSafety * weights.typeSafety;
  
  return Math.round(score);
}

function getGrade(score: number): string {
  if (score >= 90) return 'A (Excellent)';
  if (score >= 80) return 'B (Good)';
  if (score >= 70) return 'C (Satisfactory)';
  if (score >= 60) return 'D (Needs Improvement)';
  return 'F (Critical Issues)';
}
```

---

### Phase 3: Generate Visualizations

**ASCII charts for markdown:**

```typescript
function generateBarChart(value: number, max: number = 100, width: number = 20): string {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  return `[${('█'.repeat(filled))}${('░'.repeat(empty))}] ${value}%`;
}

function generateTrendChart(data: number[]): string {
  // Simple ASCII trend chart
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const lines = [];
  for (let y = 100; y >= 60; y -= 10) {
    let line = `${y.toString().padStart(3)} ┤`;
    for (let x = 0; x < data.length; x++) {
      if (Math.abs(data[x] - y) < 5) {
        line += '●───';
      } else {
        line += '    ';
      }
    }
    lines.push(line);
  }
  
  lines.push(`    └${'───'.repeat(data.length)}`);
  lines.push(`     ${['Aug', 'Sep', 'Oct', 'Nov'].join('  ')}`);
  
  return lines.join('\n');
}
```

---

### Phase 4: Compare with Previous Report (Optional)

**If `--compare` flag provided:**

```typescript
async function compareReports(
  current: QualityMetrics,
  previous: QualityMetrics
): Promise<Comparison> {
  return {
    overallChange: current.overall - previous.overall,
    testCoverageChange: current.testCoverage - previous.testCoverage,
    securityChange: current.security - previous.security,
    performanceChange: current.performance - previous.performance,
    trend: current.overall > previous.overall ? 'improving' : 
           current.overall < previous.overall ? 'degrading' : 'stable'
  };
}
```

---

### Phase 5: Generate Client-Friendly Summary

**Translate technical metrics into business language:**

```typescript
function generateClientSummary(metrics: QualityMetrics, score: number): string {
  const summary = [];
  
  // Opening
  summary.push(`We're pleased to report that your application maintains **${getGrade(score)}** quality standards, scoring **${score} out of 100** - well above the industry average of 70.`);
  
  // Benefits
  summary.push('\n**What this means for you:**');
  if (metrics.testCoverage > 80) {
    summary.push(`- ✅ **Reliable:** ${metrics.testCoverage}% of code is tested, catching bugs before they reach users`);
  }
  if (metrics.security > 90) {
    summary.push('- ✅ **Secure:** Zero critical vulnerabilities, bank-grade security practices');
  }
  if (metrics.performance > 85) {
    summary.push('- ✅ **Fast:** Average load time of 1.4 seconds (faster than 90% of websites)');
  }
  
  // Recommendations (non-technical)
  if (score < 90) {
    summary.push('\n**Small improvements recommended:**');
    summary.push('We've identified a few minor enhancements that we recommend completing before the next release. These are proactive improvements, not urgent fixes.');
  }
  
  // Closing
  summary.push('\n**Your investment is protected:**');
  summary.push('This quality audit demonstrates that your application is built to last, with clean code that's easy to maintain and extend. You're receiving enterprise-grade quality at a fair price.');
  
  return summary.join('\n');
}
```

---

### Phase 6: PDF Generation (Optional)

**If `--format=pdf` or `--format=both`:**

```bash
# Use markdown-pdf or similar tool
npx markdown-pdf /docs/quality/CODE-QUALITY-2025-11-06.md \
  --out /docs/quality/CODE-QUALITY-2025-11-06.pdf \
  --css-path /docs/quality/_styles/report.css
```

**Custom CSS for professional PDF:**
- Agency branding (logo, colors)
- Page numbers and footers
- Table of contents with page links
- Chart and graph styling

---

### Phase 7: Store Historical Data

**Save metrics to JSON for trend analysis:**

```typescript
interface QualityHistory {
  date: string;
  score: number;
  metrics: QualityMetrics;
}

async function storeHistoricalData(metrics: QualityMetrics, score: number): Promise<void> {
  const history: QualityHistory[] = await loadHistoryFile('/docs/quality/quality-trends.json');
  
  history.push({
    date: new Date().toISOString().split('T')[0],
    score,
    metrics
  });
  
  // Keep last 12 months only
  if (history.length > 12) {
    history.shift();
  }
  
  await saveHistoryFile('/docs/quality/quality-trends.json', history);
}
```

---

### Phase 8: Validation & Output

**Final checks:**
- [ ] All 6 metrics calculated
- [ ] Overall score computed
- [ ] Grade assigned
- [ ] Visualizations generated
- [ ] Client summary created
- [ ] Recommendations provided
- [ ] Historical data stored
- [ ] PDF generated (if requested)

**Output summary:**
```
✅ Code Quality Report Generated

📊 Overall Score: 87/100 (A - Excellent)
📈 Trend: ↑ Improving (+8 since Oct 1)

Detailed Metrics:
  ✅ Test Coverage: 94% (A+)
  ✅ Code Complexity: 88/100 (A)
  ✅ Security: 95/100 (A+)
  ✅ Performance: 92/100 (A)
  ⚠️ Accessibility: 78/100 (B+)
  ✅ Type Safety: 92% (A)

📄 Reports Generated:
  ✅ /docs/quality/CODE-QUALITY-2025-11-06.md
  ✅ /docs/quality/CODE-QUALITY-2025-11-06.pdf

🎯 Top 3 Recommendations:
  1. Add tests for payment processing (2h)
  2. Fix 3 accessibility issues (45min)
  3. Upgrade vulnerable dependency (5min)

💡 Pro Tip: Share PDF with client to build trust

Next Quality Audit: December 6, 2025
```

---

## 🎯 Success Metrics

**Report Quality Indicators:**
- All metrics calculated ✅
- Client summary generated ✅
- Visualizations included ✅
- Recommendations actionable ✅
- Historical trends shown (if available) ✅
- PDF export available ✅

**Client Success Indicators:**
- Client understands quality level
- Client trusts agency more
- Client approves budget for improvements
- Client shares report with stakeholders

---

## 🔄 Maintenance

**This command should be run:**
- **Monthly:** Track quality trends
- **Pre-Release:** Validate before deployment
- **Client Reviews:** Share with stakeholders
- **Proposals:** Demonstrate quality commitment

**Command to compare:**
```bash
@code-quality-report --compare=/docs/quality/CODE-QUALITY-2025-10-01.md
```

---

## 💡 Pro Tips

1. **Share with clients** - Transparency builds trust
2. **Include in proposals** - Demonstrate quality commitment upfront
3. **Track trends** - Show continuous improvement over time
4. **Before/after refactoring** - Prove ROI of code improvements
5. **Use for pricing** - Higher quality = justified premium pricing
6. **Team visibility** - Share internally to motivate quality culture
7. **Automate monthly** - Set up cron job or GitHub Action

---

## 🛠️ Technical Implementation Notes

**For Cursor AI implementing this command:**

1. **Orchestrate in parallel** - All audits can run simultaneously
2. **Handle missing tools** - Skip accessibility if command doesn't exist
3. **Client-friendly language** - Translate tech jargon to business impact
4. **Visualizations matter** - ASCII charts in markdown, real charts in PDF
5. **Historical tracking** - Store JSON for trend analysis
6. **PDF styling** - Use professional CSS with agency branding
7. **Actionable recommendations** - Not just problems, but solutions with effort estimates

**Performance:**
- Total runtime: ~3-5 minutes (dependent commands take time)
- Parallelize all audits
- Cache results for 24 hours (use `--refresh` to force re-run)

**Error Handling:**
- If test-gen fails → Use 0% coverage, warn user
- If security-audit fails → Skip security section, note in report
- If previous report not found → Skip trend analysis
- If PDF generation fails → Provide markdown only, warn user

---

$END$


