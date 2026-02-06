---
name: code-maturity-assessor-extended
description: Extended codebase readiness evaluation inspired by Obra. Covers technical debt scoring, test coverage analysis, documentation completeness, architecture health, migration readiness, and refactoring priority matrix.
version: 1.0.0
tags: [assessment, technical-debt, refactoring, architecture, migration, code-quality]
triggers: [assess, evaluate, readiness, migration, refactor, technical-debt, health-check, audit]
user-invocable: false
---

# Code Maturity Assessor Extended

Comprehensive codebase evaluation framework for assessing readiness for migrations, refactoring, or new feature development. Extends the Trail of Bits methodology with practical scoring rubrics and actionable recommendations.

## Overview

This skill provides a systematic approach to evaluating codebase maturity across multiple dimensions. It produces quantified assessments that help teams prioritize improvements and make informed decisions about technical investments.

## When to Use

Invoke this skill when:
- Evaluating a codebase for acquisition or integration
- Assessing readiness for major migrations (framework, language, cloud)
- Prioritizing technical debt remediation
- Planning refactoring initiatives
- Onboarding to a new project
- Preparing for security audits
- Making build-vs-buy decisions

## Workflow

### Phase 1: Discovery

```
1. Identify project type and stack
2. Locate source directories, tests, docs
3. Gather metrics (LOC, file count, age)
4. Map external dependencies
5. Review CI/CD configuration
```

### Phase 2: Assessment

Evaluate each of the 6 maturity dimensions:

1. Technical Debt
2. Test Coverage
3. Documentation
4. Architecture Health
5. Migration Readiness
6. Security Posture

### Phase 3: Scoring & Reporting

- Score each dimension (0-100)
- Calculate weighted overall score
- Generate improvement roadmap
- Provide effort estimates

---

## Dimension 1: Technical Debt Scoring

### Metrics to Collect

```bash
# Code complexity (cyclomatic)
npx eslint . --format json | jq '.[] | .messages | length'  # JS
radon cc src/ -a -s  # Python
gocyclo ./...  # Go

# Code duplication
npx jscpd --reporters json src/
dupfinder solution.sln  # C#

# Dependency age
npm outdated --json
pip list --outdated --format=json
go list -u -m all

# Dead code
npx ts-prune  # TypeScript
vulture src/  # Python
```

### Scoring Rubric

| Score | Criteria |
|-------|----------|
| **90-100** | < 5% duplication, all deps current, cyclomatic < 10 avg |
| **70-89** | < 10% duplication, deps < 6mo old, cyclomatic < 15 avg |
| **50-69** | < 20% duplication, some outdated deps, cyclomatic < 20 avg |
| **30-49** | > 20% duplication, critical outdated deps, high complexity |
| **0-29** | Severe duplication, abandoned deps, unmaintainable complexity |

### Technical Debt Indicators

| Indicator | Weight | Detection |
|-----------|--------|-----------|
| **Copy-paste code** | High | jscpd, dupfinder |
| **Long methods (>50 lines)** | Medium | eslint, pylint |
| **Deep nesting (>4 levels)** | Medium | Complexity tools |
| **Magic numbers/strings** | Low | Static analysis |
| **Outdated dependencies** | High | npm/pip audit |
| **TODOs and FIXMEs** | Low | grep -r "TODO\|FIXME" |
| **Commented-out code** | Low | Custom regex |
| **Circular dependencies** | High | madge, deptry |

### Debt Quantification Formula

```
Technical Debt Hours = (
    (duplicate_lines * 0.5) +
    (functions_over_complexity * 2) +
    (outdated_critical_deps * 8) +
    (circular_deps * 4) +
    (dead_code_files * 1)
) * team_velocity_factor
```

---

## Dimension 2: Test Coverage Analysis

### Beyond Percentage

Coverage percentage alone is misleading. Assess coverage quality:

| Metric | What It Measures | Target |
|--------|------------------|--------|
| **Line coverage** | Basic execution | > 80% |
| **Branch coverage** | Decision paths | > 70% |
| **Mutation score** | Test effectiveness | > 60% |
| **Critical path coverage** | Business logic | 100% |
| **Error handling coverage** | Edge cases | > 80% |

### Commands for Collection

```bash
# JavaScript/TypeScript
npx jest --coverage --coverageReporters=json
npx stryker run  # Mutation testing

# Python
pytest --cov=src --cov-report=json
mutmut run  # Mutation testing

# Go
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out

# Java
./gradlew jacocoTestReport
pitest  # Mutation testing
```

### Coverage Quality Assessment

```python
def assess_coverage_quality(metrics):
    score = 0

    # Line coverage (max 25 points)
    score += min(25, metrics['line_coverage'] * 0.3)

    # Branch coverage (max 25 points)
    score += min(25, metrics['branch_coverage'] * 0.35)

    # Mutation score (max 30 points)
    score += min(30, metrics['mutation_score'] * 0.5)

    # Critical path coverage (max 20 points)
    critical_paths_tested = metrics['critical_paths_tested'] / metrics['total_critical_paths']
    score += critical_paths_tested * 20

    return score
```

### Coverage Red Flags

- [ ] High line coverage but low branch coverage (happy path only)
- [ ] No tests for error handling paths
- [ ] Test files larger than source files (over-mocking)
- [ ] No integration or E2E tests
- [ ] Tests that never fail (weak assertions)
- [ ] Coverage excludes configuration files

---

## Dimension 3: Documentation Completeness

### Documentation Inventory

| Type | Location | Purpose |
|------|----------|---------|
| **README** | Root | Quick start, overview |
| **API Docs** | `/docs/api/` | Endpoint reference |
| **Architecture** | `/docs/architecture/` | System design |
| **Runbooks** | `/docs/operations/` | Operational procedures |
| **Contributing** | `CONTRIBUTING.md` | Development guide |
| **Changelog** | `CHANGELOG.md` | Version history |
| **ADRs** | `/docs/adr/` | Decision records |

### Documentation Scoring

```markdown
## Scoring Checklist

### Quick Start (20 points)
- [ ] Installation steps (5)
- [ ] Running locally (5)
- [ ] Running tests (5)
- [ ] Environment setup (5)

### API Documentation (20 points)
- [ ] All endpoints documented (10)
- [ ] Request/response examples (5)
- [ ] Error codes explained (5)

### Architecture (20 points)
- [ ] System overview diagram (5)
- [ ] Component descriptions (5)
- [ ] Data flow documentation (5)
- [ ] Technology decisions (5)

### Operations (20 points)
- [ ] Deployment procedures (5)
- [ ] Monitoring/alerting (5)
- [ ] Incident response (5)
- [ ] Backup/recovery (5)

### Maintenance (20 points)
- [ ] Contributing guide (5)
- [ ] Code style guide (5)
- [ ] Changelog maintained (5)
- [ ] ADRs for major decisions (5)
```

### Documentation Quality Indicators

| Indicator | Good Sign | Warning Sign |
|-----------|-----------|--------------|
| **Freshness** | Updated with code | Last update > 6 months |
| **Completeness** | Covers all features | Major gaps |
| **Accuracy** | Matches implementation | Outdated examples |
| **Accessibility** | Clear navigation | Hard to find |
| **Examples** | Working code samples | Broken snippets |

---

## Dimension 4: Architecture Health

### Indicators to Assess

```
1. Coupling & Cohesion
2. Dependency Management
3. Separation of Concerns
4. Error Handling Patterns
5. Configuration Management
6. Scalability Patterns
```

### Architecture Metrics

```bash
# Dependency analysis
npx madge --circular src/  # JavaScript
pydeps src/ --cluster  # Python
go mod graph | modgraphviz | dot -Tpng -o deps.png  # Go

# Layering violations
npx dependency-cruiser src/

# Module cohesion
npx code-complexity src/ --format json
```

### Architecture Scoring Rubric

| Score | Characteristics |
|-------|-----------------|
| **90-100** | Clear boundaries, no circular deps, well-defined interfaces, SOLID principles |
| **70-89** | Mostly clean architecture, few coupling issues, consistent patterns |
| **50-69** | Some architectural debt, mixed patterns, manageable complexity |
| **30-49** | Significant coupling, inconsistent patterns, hard to modify |
| **0-29** | Monolithic, tightly coupled, no clear structure, "big ball of mud" |

### Architecture Health Checklist

```markdown
## Coupling (25 points)
- [ ] No circular dependencies (10)
- [ ] Clear module boundaries (10)
- [ ] Dependency injection used (5)

## Cohesion (25 points)
- [ ] Single responsibility per module (10)
- [ ] Related code grouped together (10)
- [ ] No god classes/modules (5)

## Patterns (25 points)
- [ ] Consistent error handling (8)
- [ ] Consistent logging (8)
- [ ] Consistent configuration (9)

## Extensibility (25 points)
- [ ] Feature flags supported (8)
- [ ] Plugin architecture where needed (8)
- [ ] Interface-based design (9)
```

---

## Dimension 5: Migration Readiness

### Pre-Migration Assessment

| Factor | Assessment Questions |
|--------|---------------------|
| **Dependencies** | Can all dependencies be migrated? Version compatibility? |
| **APIs** | Are all APIs documented? Breaking changes acceptable? |
| **Data** | Schema migrations needed? Data volume considerations? |
| **Configuration** | Environment-specific configs isolated? |
| **Tests** | Can existing tests validate migration success? |
| **Rollback** | Is rollback strategy defined and tested? |

### Migration Complexity Matrix

```markdown
## Scoring by Migration Type

### Framework Migration (e.g., React 17 → 18)
- [ ] Breaking changes identified (20)
- [ ] Deprecation warnings resolved (20)
- [ ] Tests pass on new version (20)
- [ ] Performance benchmarked (20)
- [ ] Rollback plan documented (20)

### Language Migration (e.g., JS → TS)
- [ ] Type definitions available for deps (15)
- [ ] Incremental migration path defined (20)
- [ ] CI pipeline supports both (15)
- [ ] Team trained on new language (25)
- [ ] Style guide established (25)

### Cloud Migration (e.g., On-prem → AWS)
- [ ] Services mapped to cloud equivalents (20)
- [ ] Data migration plan defined (25)
- [ ] Network topology documented (15)
- [ ] Cost estimation completed (15)
- [ ] Compliance requirements met (25)
```

### Migration Readiness Score

```python
def migration_readiness_score(factors):
    weights = {
        'dependency_compatibility': 0.20,
        'api_stability': 0.15,
        'data_portability': 0.20,
        'test_coverage': 0.20,
        'team_readiness': 0.15,
        'rollback_capability': 0.10
    }

    score = sum(factors[k] * weights[k] for k in weights)
    return score * 100
```

---

## Dimension 6: Security Posture

### Security Assessment Checklist

```markdown
## Authentication & Authorization (25 points)
- [ ] Auth mechanism documented (5)
- [ ] Session management secure (5)
- [ ] Password policies enforced (5)
- [ ] MFA supported (5)
- [ ] Role-based access control (5)

## Data Protection (25 points)
- [ ] Sensitive data encrypted at rest (8)
- [ ] TLS for data in transit (8)
- [ ] PII handling documented (9)

## Dependency Security (25 points)
- [ ] No known vulnerabilities (10)
- [ ] Automated security scanning (8)
- [ ] Dependency update policy (7)

## Code Security (25 points)
- [ ] Input validation present (8)
- [ ] SQL injection prevention (8)
- [ ] XSS prevention (9)
```

### Security Commands

```bash
# Dependency vulnerabilities
npm audit --json
pip-audit --format=json
go vuln check ./...
snyk test

# Static analysis for security
semgrep --config=p/security-audit src/
bandit -r src/  # Python
gosec ./...  # Go
```

---

## Refactoring Priority Matrix

### Prioritization Formula

```
Priority Score = (
    (Impact * 0.4) +
    (Frequency * 0.3) +
    (Risk * 0.2) +
    (Effort_Inverse * 0.1)
)
```

| Factor | Description | Scale |
|--------|-------------|-------|
| **Impact** | Business value of fixing | 1-10 |
| **Frequency** | How often code is modified | 1-10 |
| **Risk** | Likelihood of bugs if unchanged | 1-10 |
| **Effort_Inverse** | Inverse of effort (easy = high) | 1-10 |

### Refactoring Candidates

```markdown
## High Priority (Score > 7.5)
Refactor immediately. These areas block progress and cause frequent issues.

## Medium Priority (Score 5-7.5)
Schedule in next 2-3 sprints. Balance with feature work.

## Low Priority (Score < 5)
Document and monitor. Address opportunistically.
```

### Refactoring Decision Tree

```
Is the code causing bugs?
├── Yes → Is it touched frequently?
│   ├── Yes → HIGH PRIORITY (refactor now)
│   └── No → MEDIUM PRIORITY (schedule)
└── No → Is it blocking features?
    ├── Yes → MEDIUM PRIORITY (schedule)
    └── No → Is it a security risk?
        ├── Yes → HIGH PRIORITY (address immediately)
        └── No → LOW PRIORITY (document only)
```

---

## Report Template

### Executive Summary

```markdown
# Code Maturity Assessment: [Project Name]

**Assessment Date:** YYYY-MM-DD
**Assessor:** [Name/Team]
**Codebase Version:** [commit hash or version]

## Overall Score: XX/100

| Dimension | Score | Trend |
|-----------|-------|-------|
| Technical Debt | XX/100 | ↑↓→ |
| Test Coverage | XX/100 | ↑↓→ |
| Documentation | XX/100 | ↑↓→ |
| Architecture | XX/100 | ↑↓→ |
| Migration Readiness | XX/100 | ↑↓→ |
| Security | XX/100 | ↑↓→ |

## Key Findings

### Strengths
1. [Strength 1]
2. [Strength 2]
3. [Strength 3]

### Critical Gaps
1. [Gap 1] - **Impact:** [Description]
2. [Gap 2] - **Impact:** [Description]
3. [Gap 3] - **Impact:** [Description]

## Recommendations

### Immediate (0-30 days)
1. [Action item with effort estimate]

### Short-term (1-3 months)
1. [Action item with effort estimate]

### Long-term (3-6 months)
1. [Action item with effort estimate]
```

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Scoring without evidence | Subjective bias | Collect metrics first |
| One-time assessment | Maturity changes | Regular reassessment |
| Ignoring team context | Same code, different teams | Factor in team skills |
| Perfectionism | 100% is unrealistic | Target "good enough" |
| Assessment paralysis | Analysis vs action | Time-box assessments |

---

## Checklist

### Before Assessment

- [ ] Define assessment scope
- [ ] Identify stakeholders
- [ ] Gather tool access (repos, CI, monitoring)
- [ ] Review existing documentation
- [ ] Schedule team interviews if needed

### During Assessment

- [ ] Collect metrics systematically
- [ ] Document evidence for scores
- [ ] Note uncertainties and assumptions
- [ ] Track time spent per dimension
- [ ] Validate findings with team

### After Assessment

- [ ] Present findings to stakeholders
- [ ] Prioritize recommendations
- [ ] Create tracking tickets
- [ ] Schedule follow-up assessment
- [ ] Archive assessment report

---

## Examples

### Sample Technical Debt Report

```markdown
## Technical Debt Assessment: payments-service

### Metrics Collected
- **Lines of Code:** 45,000
- **Duplication:** 8.3% (target: < 5%)
- **Avg Cyclomatic Complexity:** 12.4 (target: < 10)
- **Outdated Dependencies:** 4 critical, 12 minor
- **Circular Dependencies:** 2 cycles detected

### Score: 62/100

### Top Debt Items
1. **PaymentProcessor class (High)** - 847 lines, complexity 34
   - Effort: 3-5 days
   - Impact: Blocks new payment methods

2. **Legacy validation module (Medium)** - 23% duplication
   - Effort: 2-3 days
   - Impact: Maintenance burden

3. **Outdated Stripe SDK (High)** - v8 → v12
   - Effort: 1-2 days
   - Impact: Security vulnerabilities

### Recommendation
Schedule 2-week debt sprint focused on PaymentProcessor refactoring.
```

### Sample Migration Readiness Report

```markdown
## Migration Readiness: React 17 → React 18

### Compatibility Analysis
- **Breaking Changes:** 3 identified
- **Deprecation Warnings:** 12 resolved, 4 remaining
- **Dependency Compatibility:** 94% (2 packages need updates)

### Score: 78/100

### Blockers
1. react-router v5 incompatible → Upgrade to v6 first
2. Custom hook uses deprecated API → Refactor required

### Risks
- Performance regression possible with Concurrent Mode
- Need to test lazy loading behavior

### Recommendation
Proceed with migration after router upgrade (2-week dependency).
Create feature flag for gradual rollout.
```

---

## Resources

### Tools
- [SonarQube](https://www.sonarqube.org/) - Comprehensive code quality
- [CodeClimate](https://codeclimate.com/) - Maintainability metrics
- [Snyk](https://snyk.io/) - Security scanning
- [Madge](https://github.com/pahen/madge) - Dependency analysis

### Frameworks
- [SQALE](http://www.sqale.org/) - Technical debt quantification
- [COCOMO](https://en.wikipedia.org/wiki/COCOMO) - Effort estimation
- [Technical Debt Quadrant](https://martinfowler.com/bliki/TechnicalDebtQuadrant.html) - Classification

### Reading
- "Refactoring" by Martin Fowler
- "Working Effectively with Legacy Code" by Michael Feathers
- "Clean Architecture" by Robert C. Martin
