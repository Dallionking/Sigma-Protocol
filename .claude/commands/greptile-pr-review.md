---
name: greptile-pr-review
description: "AI-powered PR review using Greptile MCP — codebase-aware analysis with auto-resolve"
model: sonnet
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /greptile-pr-review

**Codebase-aware AI PR review powered by Greptile MCP**

## Purpose

**Role Context:** You are a **Senior Engineer** augmented with Greptile's full codebase understanding. You review PRs not just by reading the diff, but by understanding how changes fit within the entire repository's architecture, patterns, and history.

This command:
- Reviews PRs using Greptile's indexed codebase knowledge
- Analyzes cross-file impact and breaking changes
- Detects pattern deviations from established codebase conventions
- Provides fix suggestions with full context
- Auto-resolves Greptile bot comments when requested
- Generates a review report compatible with Sigma's review system

**Business Impact:**
- **Catch cross-file bugs** that diff-only reviews miss
- **Faster reviews** with AI-powered codebase understanding
- **Auto-resolve loop** — fix Greptile comments, push, repeat until clean
- **Complements `/pr-review`** for comprehensive quality gates

---

## Command Usage

```bash
# Review current PR (auto-detects from branch)
/greptile-pr-review

# Review specific PR
/greptile-pr-review --pr=42

# Review specific repo + PR
/greptile-pr-review --repo=owner/repo --pr=42

# Index repo first (required for first use)
/greptile-pr-review --index

# Auto-resolve Greptile bot comments
/greptile-pr-review --auto-resolve --pr=42

# Focus review on specific area
/greptile-pr-review --pr=42 --focus=security
/greptile-pr-review --pr=42 --focus=architecture
/greptile-pr-review --pr=42 --focus=performance
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `--pr` | PR number to review | Auto-detect from current branch |
| `--repo` | Repository (owner/repo format) | Auto-detect from git remote |
| `--index` | Index the repository before reviewing | false |
| `--auto-resolve` | Fetch and fix Greptile bot comments | false |
| `--focus` | Focus area: `all`, `security`, `architecture`, `performance` | `all` |
| `--prd-id` | Link to a Sigma PRD for cross-reference | none |

---

## Execution Flow

### Phase 0: Repository Check

**Task:** Ensure the repo is indexed and ready for Greptile analysis

1. **Detect repository**
   ```bash
   # Get repo from git remote
   REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
   ```

2. **Check Greptile index status**
   - Use `greptile_repo_info` MCP tool to check if repo is indexed
   - If not indexed or `--index` flag passed, use `greptile_index` to index it
   - Wait for indexing to complete before proceeding

3. **Identify PR**
   - If `--pr` provided, use that
   - Otherwise, detect from current branch:
     ```bash
     PR_NUMBER=$(gh pr view --json number -q '.number' 2>/dev/null)
     ```

**Output:**
```
Repository: owner/repo
Index Status: Ready
PR: #42 (feature/auth-system → main)
Files Changed: 15
```

---

### Phase 1: PR Context Loading

**Task:** Gather PR metadata and diff for Greptile analysis

1. **Get PR details**
   ```bash
   gh pr view $PR_NUMBER --json title,body,files,additions,deletions,baseRefName,headRefName
   ```

2. **Get the diff**
   ```bash
   gh pr diff $PR_NUMBER
   ```

3. **Get PR comments** (for auto-resolve mode)
   ```bash
   gh api repos/$REPO/pulls/$PR_NUMBER/comments --jq '.[].body'
   ```

4. **Load Sigma context** (if `--prd-id` provided)
   - Read relevant PRD from `/docs/prds/`
   - Read architecture specs
   - Read design system specs

**Output:**
```
PR #42: "Add authentication system"
  Branch: feature/auth-system → main
  Files: 15 changed (+890, -45)
  Sigma PRD: F1-auth (if linked)
  Greptile Index: Ready
```

---

### Phase 2: Greptile Codebase Analysis

**Task:** Use Greptile MCP to analyze changes with full codebase context

Run these Greptile queries (via MCP tools):

1. **Impact Analysis**
   ```
   Query: "What is the impact of the changes in PR #[number]?
   What other parts of the codebase could be affected?"
   ```

2. **Pattern Compliance**
   ```
   Query: "Do the changes in this PR follow the established patterns
   and conventions in the codebase? Flag any deviations."
   ```

3. **Architecture Review**
   ```
   Query: "Review the architecture of the changes in PR #[number].
   Are there any dependency violations, circular imports, or
   layering issues?"
   ```

4. **Security Scan**
   ```
   Query: "Are there any security concerns in this PR? Check for
   auth bypass, data exposure, injection vulnerabilities, and
   missing input validation."
   ```

5. **Breaking Changes**
   ```
   Query: "Could any of these changes break existing functionality?
   Check for API contract changes, removed exports, or changed
   function signatures."
   ```

**Output:**
```
Greptile Analysis Complete:
  Impact Score: 7/10 (high cross-file impact)
  Pattern Compliance: 3 deviations found
  Architecture Issues: 1 dependency violation
  Security Concerns: 2 findings
  Breaking Changes: 1 potential
```

---

### Phase 3: Auto-Resolve (if --auto-resolve)

**Task:** Fetch Greptile bot comments from GitHub and implement fixes

1. **Fetch Greptile comments**
   ```bash
   # Get all review comments from Greptile bot
   gh api repos/$REPO/pulls/$PR_NUMBER/comments \
     --jq '.[] | select(.user.login | contains("greptile")) | {path, body, line}'
   ```

2. **For each comment:**
   - Read the file at the specified path
   - Understand the comment's suggestion
   - Implement the fix
   - Stage the change

3. **Commit fixes**
   ```bash
   git add -A && git commit -m "fix: resolve Greptile review comments for PR #$PR_NUMBER"
   ```

4. **Push and re-trigger**
   ```bash
   git push
   ```

5. **Wait and re-check** (loop until clean)
   - Wait 2-3 minutes for Greptile to re-review
   - Fetch new comments
   - If new comments exist, repeat
   - If clean, report success

**Output:**
```
Auto-Resolve Results:
  Comments Found: 8
  Comments Fixed: 7
  Comments Skipped: 1 (requires human decision)
  Commits Created: 2
  Status: Clean (no new Greptile comments)
```

---

### Phase 4: Review Report Generation

**Task:** Generate a comprehensive review report

**File:** `/docs/reviews/GREPTILE-PR-[NUMBER]-YYYY-MM-DD.md`

```markdown
# Greptile PR Review: #[NUMBER] - [Title]

**Reviewer:** Greptile AI + Claude Code
**Date:** [date]
**Repository:** [owner/repo]
**PR:** #[number] ([head] → [base])

---

## Summary

[2-3 sentence summary of findings]

### Scores

| Category | Score | Issues |
|----------|-------|--------|
| Impact | X/10 | N findings |
| Pattern Compliance | X/10 | N deviations |
| Architecture | X/10 | N violations |
| Security | X/10 | N concerns |
| Breaking Changes | X/10 | N potential |

---

## Critical Findings

[Greptile findings with severity, file locations, and fix suggestions]

---

## Cross-File Impact

[Analysis of how changes affect other parts of the codebase]

---

## Pattern Deviations

[Where the PR deviates from established codebase conventions]

---

## Recommendations

### Must Fix (Blocking)
1. [Finding with fix]

### Should Fix (Non-Blocking)
1. [Finding with fix]

### Consider
1. [Suggestion]

---

*Generated by /greptile-pr-review on [date]*
*Powered by Greptile MCP + Claude Code*
```

---

### Phase 5: Integration with Sigma Review

**Task:** If `--prd-id` is provided, cross-reference with Sigma specs

1. Compare Greptile findings with `/pr-review` categories:
   - Architecture alignment (Step 2 + Step 8)
   - Design system compliance (Step 6)
   - State coverage (Step 7)
   - Security requirements (PRD acceptance criteria)

2. Generate a combined score if both reviews were run

3. Update tracking if `.tracking-db` exists

---

## Outputs

### Files Created
1. **Review Report** — `/docs/reviews/GREPTILE-PR-[NUMBER]-YYYY-MM-DD.md`

### Console Output
- Summary of findings with severity levels
- Action items for the developer
- Link to full report

---

## Success Criteria

- Repository indexed and ready
- PR diff analyzed with full codebase context
- Cross-file impact identified
- Pattern deviations flagged
- Security concerns surfaced
- Review report generated
- Auto-resolve completed (if requested)

---

## Tips

### First Time Setup
```bash
# Index your repo (takes 1-2 minutes)
/greptile-pr-review --index

# Then review any PR
/greptile-pr-review --pr=42
```

### Auto-Resolve Loop
```bash
# Fix all Greptile comments automatically
/greptile-pr-review --auto-resolve --pr=42

# Keep looping until clean
# (command handles the loop internally)
```

### Combined Review
```bash
# Full Sigma + Greptile review
/greptile-pr-review --pr=42 --prd-id=F1
/pr-review --prd-id=F1

# Compare both reports in /docs/reviews/
```

---

*Part of SSS Review Workflows — Greptile Integration*
