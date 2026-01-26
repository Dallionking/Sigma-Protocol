# Verification Skill

## Metadata

```yaml
id: verification
name: "Verification Skill"
description: "Step completion verification with scoring"
version: "1.0.0"
```

## Purpose

Verify that SSS step outputs meet quality requirements by checking file existence, content patterns, and section completeness. Generate a score and actionable feedback.

## Activation Triggers

This skill activates when:
- A step claims to be complete
- User requests verification (`verify step N`)
- Before proceeding to the next step
- During quality audits

## Verification Schema Format

Each step defines its verification requirements:

```yaml
verification:
  required_files:
    - path: docs/specs/MASTER_PRD.md
      min_size: 3000  # bytes
      points: 30
      
  required_sections:
    - document: MASTER_PRD.md
      section: "## Problem Statement"
      points: 10
      
  content_patterns:
    - file: MASTER_PRD.md
      pattern: "Hormozi|Value Equation"
      points: 10
      description: "Value framework applied"
      
  quality_checks:
    - name: "No ambiguous language"
      pattern_absent: "should probably|TBD|TODO"
      points: 10
      
  passing_score: 80
```

## Workflow

### 1. Load Verification Schema

Read the verification schema from the step's metadata:

```javascript
const schema = parseYamlFrontmatter(stepFile);
const verification = schema.verification;
```

### 2. Check Required Files

For each required file:
- Verify file exists
- Check file size meets minimum
- Award points if passing

```javascript
for (const file of verification.required_files) {
  const exists = await fileExists(file.path);
  const size = exists ? await getFileSize(file.path) : 0;
  
  if (exists && size >= file.min_size) {
    score += file.points;
    results.push({ check: file.path, status: 'pass', points: file.points });
  } else {
    results.push({ check: file.path, status: 'fail', reason: exists ? 'too small' : 'missing' });
  }
}
```

### 3. Check Required Sections

For each required section:
- Read the document
- Search for section heading
- Award points if found

```javascript
for (const section of verification.required_sections) {
  const content = await readFile(`docs/${section.document}`);
  const hasSection = content.includes(section.section);
  
  if (hasSection) {
    score += section.points;
  }
}
```

### 4. Check Content Patterns

For each pattern requirement:
- Read the target file
- Apply regex pattern
- Award points if matches found

```javascript
for (const pattern of verification.content_patterns) {
  const content = await readFile(pattern.file);
  const regex = new RegExp(pattern.pattern, 'i');
  const matches = regex.test(content);
  
  if (matches) {
    score += pattern.points;
  }
}
```

### 5. Run Quality Checks

For absence patterns (things that should NOT be present):

```javascript
for (const check of verification.quality_checks) {
  if (check.pattern_absent) {
    const content = await readFile(targetFile);
    const regex = new RegExp(check.pattern_absent, 'i');
    const found = regex.test(content);
    
    if (!found) {
      score += check.points;  // Good - pattern is absent
    } else {
      results.push({ check: check.name, status: 'fail', reason: 'forbidden pattern found' });
    }
  }
}
```

### 6. Generate Report

Output format:

```markdown
# Verification Report: Step {N}

**Date:** {TODAY}
**Score:** {score}/{max_points} ({percentage}%)
**Status:** {PASS|FAIL}

## Summary

{1-2 sentence summary}

## Detailed Results

### Required Files
| File | Status | Points |
|------|--------|--------|
| docs/specs/MASTER_PRD.md | ✅ Pass | 30/30 |
| docs/research/MARKET.md | ❌ Fail (missing) | 0/10 |

### Required Sections
| Section | Document | Status | Points |
|---------|----------|--------|--------|
| ## Problem Statement | MASTER_PRD.md | ✅ Pass | 10/10 |

### Content Patterns
| Pattern | Description | Status | Points |
|---------|-------------|--------|--------|
| Hormozi | Value framework | ✅ Pass | 10/10 |

### Quality Checks
| Check | Status | Points |
|-------|--------|--------|
| No ambiguous language | ❌ Fail | 0/10 |

## Issues to Fix

1. **Missing file:** `docs/research/MARKET.md` - Create market research document
2. **Ambiguous language found:** Line 42: "should probably work" → Replace with definitive statement

## Next Steps

{If passing: "Ready to proceed to Step {N+1}"}
{If failing: "Fix the {count} issues above and re-verify"}
```

## Scoring Thresholds

| Score | Status | Action |
|-------|--------|--------|
| 90-100 | Excellent | Proceed to next step |
| 80-89 | Pass | Proceed with minor notes |
| 60-79 | Needs Work | Fix issues before proceeding |
| 0-59 | Fail | Major rework required |

## Error Handling

- If verification schema missing: Use default checks (file exists, non-empty)
- If file unreadable: Mark as fail with "access error"
- If pattern invalid: Skip pattern, log warning

