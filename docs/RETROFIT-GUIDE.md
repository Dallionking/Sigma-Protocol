# Retrofit Guide: Adding Sigma to Existing Projects

A comprehensive guide for integrating Sigma Protocol into existing codebases.

## When to Retrofit vs. Start Fresh

### Good Candidates for Retrofit

- ✓ Projects with technical debt needing documentation
- ✓ Codebases that work but lack structure
- ✓ Teams wanting to adopt structured workflows
- ✓ Legacy apps getting new features
- ✓ Projects where you're keeping >50% of existing code

### Consider Starting Fresh When

- × Complete rewrites planned
- × Prototypes that outgrew their architecture
- × Major tech stack changes (e.g., React to Vue)
- × Changing >50% of the codebase

**Rule of thumb:** If you're keeping the majority of your code, retrofit. If you're rewriting most of it, start fresh with `sigma new`.

## Quick Start

### Interactive Wizard

```bash
sigma retrofit
```

The wizard will:
1. Analyze your project structure
2. Detect your tech stack
3. Check for existing documentation
4. Recommend next steps

### Manual Process

```bash
# 1. Navigate to your project
cd /path/to/existing-project

# 2. Install Sigma commands
npx sigma-protocol install

# 3. Run analysis in your AI IDE
@retrofit-analyze
```

## The Retrofit Process

### Phase 1: Analysis

Run the analysis command to understand your codebase:

```
@retrofit-analyze
```

This scans your project and detects:

| Category | What's Detected |
|----------|-----------------|
| **Tech Stack** | Framework, language, database, auth |
| **Patterns** | Code conventions, file structure |
| **Coverage** | Test coverage, documentation gaps |
| **Issues** | Potential problems, tech debt |

**Output:** `.sigma/context/analysis-report.json`

### Phase 2: Generate Documentation

Generate Sigma documentation from your existing code:

```
@retrofit-generate --priority=high
```

This creates:

| Document | Generated From |
|----------|----------------|
| `ARCHITECTURE.md` | Code structure, imports, dependencies |
| `FLOW-TREE.md` | Routes, navigation, page structure |
| `TECHNICAL-SPEC.md` | APIs, database schema, integrations |
| `DESIGN-SYSTEM.md` | Existing components, styles |

### Phase 3: Verify Coverage

Check that generated docs match your actual code:

```
@gap-analysis
```

This compares documentation against implementation and reports:
- Missing features in docs
- Documented features not implemented
- Inconsistencies between docs and code

### Phase 4: Update with Frameworks

Apply latest Sigma frameworks to your docs:

```
@retrofit-enhance --mode=update
```

This adds:
- Hormozi Value Equation analysis
- HITL checkpoint structure
- Quality gate definitions
- Standard section formatting

## Selective Adoption

You don't have to use everything. Pick what helps your project.

### Documentation Only

Just generate docs from code, don't change workflow:

```
@retrofit-generate
```

**What you get:**
- Architecture documentation
- Technical specifications
- Flow diagrams

**What you skip:**
- PRD workflow
- Quality gates
- Ralph loop

### PRD Workflow Only

Use Sigma for new features while keeping existing code as-is:

```
@step-10-feature-breakdown [new feature]
@step-11-prd-generation
```

**What you get:**
- Structured feature planning
- Detailed implementation specs
- Clear acceptance criteria

**What you skip:**
- Retrofitting existing code
- Full 13-step workflow

### Quality Gates Only

Add auditing without changing development workflow:

```
@gap-analysis
@security-audit
@accessibility-audit
@performance-check
```

**What you get:**
- Code quality metrics
- Security vulnerability reports
- Accessibility compliance
- Performance analysis

**What you skip:**
- Documentation generation
- PRD workflow

## Gradual Rollout Strategy

### Week 1: Documentation

```bash
# Install Sigma
npx sigma-protocol install

# Generate initial docs
@retrofit-analyze
@retrofit-generate
```

**Goal:** Get baseline documentation without changing workflow.

### Week 2: Quality Gates

```bash
# Add quality checks to CI
@gap-analysis
@security-audit
```

**Goal:** Establish quality baselines and identify issues.

### Week 3: PRD Workflow

```bash
# Use PRDs for new features
@step-10-feature-breakdown [feature]
@step-11-prd-generation
```

**Goal:** Test PRD workflow on one new feature.

### Week 4+: Full Adoption

```bash
# Run through remaining steps as needed
@step-12-context-engine
@step-13-skillpack-generator
```

**Goal:** Complete adoption based on team comfort.

## Common Scenarios

### Scenario 1: Undocumented Codebase

**Problem:** Working code but no documentation.

**Solution:**
```
@retrofit-analyze
@retrofit-generate --all
@gap-analysis
```

### Scenario 2: Outdated Documentation

**Problem:** Docs exist but don't match code.

**Solution:**
```
@retrofit-analyze
@retrofit-enhance --mode=sync
@gap-analysis
```

### Scenario 3: Adding Major Feature

**Problem:** Need to add significant new functionality.

**Solution:**
```
@step-10-feature-breakdown [feature description]
@step-11-prd-generation
@step-11a-prd-to-json
./scripts/ralph/sigma-ralph.sh . docs/ralph/implementation/prd.json
```

### Scenario 4: Technical Debt Cleanup

**Problem:** Code works but needs refactoring.

**Solution:**
```
@retrofit-analyze
@tech-debt-audit
@retrofit-generate --focus=architecture
# Then use PRDs to plan refactoring
```

## Integration with Existing Tools

### CI/CD Integration

Add Sigma quality checks to your pipeline:

```yaml
# .github/workflows/sigma-quality.yml
name: Sigma Quality Gates

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g sigma-protocol
      - run: sigma doctor --ci
      - run: npx sigma-protocol gap-analysis --ci
```

### Git Hooks

Add pre-commit quality checks:

```bash
# .husky/pre-commit
#!/bin/sh
npx sigma-protocol gap-analysis --quick
```

### IDE Integration

Sigma commands work in:
- **Cursor:** `@command-name`
- **Claude Code:** `/command-name`
- **OpenCode:** `/command-name`

## Preserving Existing Patterns

### Code Conventions

Sigma respects your existing patterns. During analysis:

```
@retrofit-analyze --preserve-patterns
```

This creates `.sigma/rules/project-patterns.mdc` with your conventions.

### Custom Rules

Add project-specific rules:

```markdown
<!-- .sigma/rules/my-project.mdc -->
---
description: Project-specific patterns
globs: src/**/*
---

- Use camelCase for variables
- Prefer named exports
- Always use TypeScript strict mode
```

### Existing Tests

Sigma integrates with your test suite:

```
@retrofit-analyze --include-tests
```

This maps tests to features for coverage analysis.

## Troubleshooting

### "Analysis found no patterns"

Your project structure may be non-standard. Try:

```
@retrofit-analyze --verbose
```

Then manually specify patterns in `.sigma/rules/`.

### "Generated docs don't match code"

Run sync mode:

```
@retrofit-enhance --mode=sync --force
```

### "Too many gaps reported"

Focus on high-priority items first:

```
@gap-analysis --priority=high
```

### "Existing docs conflict with Sigma format"

Keep both during transition:

```
@retrofit-generate --output=docs/sigma/
```

Then gradually migrate.

## Best Practices

### 1. Start Small

Don't try to retrofit everything at once. Pick one area:
- A single module
- One feature
- The most problematic code

### 2. Involve the Team

Retrofit works best when the team understands it:
- Run `sigma tutorial` together
- Discuss which parts to adopt
- Agree on gradual rollout

### 3. Maintain Momentum

Set regular checkpoints:
- Weekly: Review generated docs
- Bi-weekly: Run quality audits
- Monthly: Assess adoption progress

### 4. Document Decisions

Use `.sigma/context/decisions.json` to track:
- Why certain patterns were kept
- What was changed and why
- Future improvement plans

## Next Steps

- **[GETTING-STARTED.md](GETTING-STARTED.md)** - Core concepts
- **[NEW-PROJECT-QUICKSTART.md](NEW-PROJECT-QUICKSTART.md)** - Starting fresh
- **[ORCHESTRATION.md](ORCHESTRATION.md)** - Multi-agent development
- **[COMMANDS.md](COMMANDS.md)** - Full command reference

## Quick Reference

### CLI Commands

```bash
sigma retrofit           # Interactive wizard
sigma doctor             # Health check
sigma install            # Install commands
```

### AI Commands

```
@retrofit-analyze        # Analyze codebase
@retrofit-generate       # Generate docs
@retrofit-enhance        # Update with frameworks
@gap-analysis            # Verify coverage
```

### Key Files

| File | Purpose |
|------|---------|
| `.sigma-manifest.json` | Installation tracking |
| `.sigma/context/analysis-report.json` | Analysis results |
| `.sigma/rules/project-patterns.mdc` | Detected patterns |

---

Ready to retrofit? Run `sigma retrofit` and follow the wizard! 🔄


