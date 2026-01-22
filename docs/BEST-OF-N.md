# Best of N Pattern

The Best of N pattern is a quality improvement technique that runs multiple parallel AI agents on the same task and selects the best result.

## Concept

Instead of relying on a single AI attempt, we:

1. **Fork**: Create N parallel sandbox environments
2. **Execute**: Run the same prompt/story in each fork
3. **Evaluate**: Score results using automated tests + AI analysis
4. **Select**: Pick the best implementation (AI-assisted or human review)
5. **Merge**: Apply the winning implementation to main branch

```
                    ┌─────────────┐
                    │   Story     │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  Sandbox 1  │  │  Sandbox 2  │  │  Sandbox N  │
   │  (Fork A)   │  │  (Fork B)   │  │  (Fork N)   │
   │ Claude Code │  │ Claude Code │  │ Claude Code │
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
                           ▼
              ┌───────────────────────────┐
              │    Best of N Evaluator    │
              │  ─────────────────────    │
              │  • Run tests              │
              │  • Score code quality     │
              │  • Check completeness     │
              │  • AI evaluation          │
              └────────────┬──────────────┘
                           │
                           ▼
              ┌───────────────────────────┐
              │       Top Candidates      │
              │    (Filtered by AI)       │
              └────────────┬──────────────┘
                           │
                           ▼
              ┌───────────────────────────┐
              │      Human Review         │
              │   (Pick final winner)     │
              └────────────┬──────────────┘
                           │
                           ▼
              ┌───────────────────────────┐
              │     Merge to Main         │
              └───────────────────────────┘
```

## Why Best of N?

### Quality Improvement

AI responses have variance. Running multiple attempts:

- **Catches edge cases**: Different approaches surface different issues
- **Exploits variance**: The best of N attempts is better than a single attempt
- **Provides alternatives**: Sometimes the "second best" has valuable ideas

### Research Backing

Studies show that Best of N sampling with N=3-5 significantly improves output quality:

- 10-30% improvement in task completion
- Better handling of complex requirements
- More robust error handling

## Granularity Options

### Per-Story (Default)

Each story in a PRD gets N parallel forks:

```bash
sigma orchestrate --sandbox --forks=3
```

**Best for:**
- Most use cases
- Good cost/quality balance
- Independent story implementations

### Per-Stream

Each parallel stream (PRD) gets N forks:

```bash
sigma orchestrate --sandbox --best-of-n=per-stream
```

**Best for:**
- Complex PRDs with interdependencies
- When you want consistent approaches across stories
- Higher budget scenarios

### Per-PRD (Expert)

The entire orchestration gets N complete runs:

```bash
sigma orchestrate --sandbox --best-of-n=per-prd
```

**Best for:**
- Critical production deployments
- Maximum quality requirements
- Research/comparison purposes

## Evaluation System

### Scoring Weights

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Test Pass Rate** | 40% | `(passing tests / total tests) × 100` |
| **Code Quality** | 20% | ESLint/linter score (0-100) |
| **Completeness** | 20% | Acceptance criteria satisfied |
| **Performance** | 10% | Build time, bundle size |
| **AI Subjective** | 10% | Claude's evaluation score |

### Minimum Thresholds

A result must meet minimum thresholds to be considered:

| Metric | Threshold |
|--------|-----------|
| Test Pass Rate | ≥80% |
| Code Quality | ≥70/100 |
| AI Score | ≥70/100 |

### AI Evaluation Prompt

Each fork is evaluated by Claude using this prompt:

```markdown
Evaluate this implementation for story: "{storyTitle}"

Acceptance Criteria:
{list of criteria}

Code Changes:
{diff summary}

Test Results:
{test output}

Evaluate on:
1. Does it meet ALL acceptance criteria? (Yes/No + explanation)
2. Is the code clean and maintainable? (1-10)
3. Are there any obvious bugs or issues? (List or "None")
4. Overall quality score (0-100)
```

## Review Strategies

### Hybrid (Default)

AI filters to top candidates, human picks final winner.

```bash
sigma orchestrate --sandbox --review=hybrid
```

**UI Flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│              BEST OF N RESULTS - Story #3                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AI Pre-filtered from 5 → 3 candidates                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FORK A (Recommended)                                    │   │
│  │ Tests: 14/14 passing                                    │   │
│  │ AI Score: 92/100                                        │   │
│  │ Preview: https://fork-a.e2b.app                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ FORK B                                                  │   │
│  │ Tests: 12/14 passing                                    │   │
│  │ AI Score: 78/100                                        │   │
│  │ Preview: https://fork-b.e2b.app                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [1] Accept Fork A (recommended)                               │
│  [2] Accept Fork B                                             │
│  [3] View diff comparison                                      │
│  [4] Reject all, retry                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### AI-Only

Full automation - AI picks winner without human input.

```bash
sigma orchestrate --sandbox --review=ai-only
```

**Best for:**
- High-volume, low-risk tasks
- CI/CD pipelines
- When human review is bottleneck

### Manual

All candidates shown to human for selection.

```bash
sigma orchestrate --sandbox --review=manual
```

**Best for:**
- Learning/exploration
- Critical decisions
- When AI filtering isn't trusted

## Recommendation Types

The evaluator provides recommendation confidence:

| Type | Confidence | Description |
|------|------------|-------------|
| **Strong** | High | Clear winner (>10 point lead) |
| **Accept** | Medium-High | Good candidate, minor gap |
| **Review** | Medium | Close race, human should decide |
| **Caution** | Low | Best option has quality issues |
| **None** | N/A | No valid results |

## Configuration

### CLI Options

```bash
# Number of forks
sigma orchestrate --sandbox --forks=5

# Review strategy
sigma orchestrate --sandbox --review=hybrid

# Granularity
sigma orchestrate --sandbox --best-of-n=per-story
```

### Config File

In `.sigma/orchestration/sandbox-config.json`:

```json
{
  "best_of_n": {
    "mode": "per-story",
    "n": 3,
    "review_strategy": "hybrid"
  }
}
```

### Evaluation Weights

Customize weights in code:

```javascript
const { BestOfNEvaluator } = require('./cli/lib/sandbox/best-of-n');

const evaluator = new BestOfNEvaluator({
  weights: {
    testPassRate: 0.50,  // Increase test importance
    codeQuality: 0.15,
    completeness: 0.15,
    performance: 0.10,
    aiSubjective: 0.10
  },
  thresholds: {
    testPassRate: 0.90,  // Stricter test requirement
    codeQuality: 80,
    aiScore: 75
  }
});
```

## Cost Considerations

Best of N multiplies costs by N:

| Stories | Forks | Total Sandboxes | Est. Cost (E2B) |
|---------|-------|-----------------|-----------------|
| 10 | 1 | 10 | ~$15 |
| 10 | 3 | 30 | ~$45 |
| 10 | 5 | 50 | ~$75 |

**Cost Optimization:**
- Use N=1 for development/testing
- Use N=3 for production (good balance)
- Use N=5 only for critical features
- Use Docker (free) for initial validation

## Best Practices

### When to Use Best of N

✅ **Good Use Cases:**
- Complex features with many edge cases
- Critical user-facing functionality
- Tasks where "almost right" isn't good enough
- When you have budget for quality

❌ **Skip For:**
- Simple, well-defined tasks
- Urgent hotfixes
- When single attempt is likely sufficient
- Budget-constrained situations

### Choosing N Value

| N | Quality | Cost | Use Case |
|---|---------|------|----------|
| 1 | Baseline | 1x | Development, simple tasks |
| 2 | +15% | 2x | Moderate complexity |
| 3 | +25% | 3x | Production (recommended) |
| 5 | +30% | 5x | Critical features |
| 7+ | Diminishing | 7x+ | Research only |

### Review Efficiency

- **Pre-filter aggressively**: AI should reduce to 2-3 candidates
- **Use preview URLs**: Visual inspection catches UI issues
- **Trust test results**: If tests pass, focus on code review
- **Time-box reviews**: Don't agonize over similar candidates

## Troubleshooting

### All Forks Failing

- Check environment variables (API keys)
- Verify prompt is clear and achievable
- Increase timeout for complex tasks
- Check sandbox logs: `sigma sandbox logs <id>`

### No Clear Winner

- All candidates below threshold: Simplify the task
- Very close scores: Pick any, they're equivalent
- Consider re-running with different prompts

### Timeout Issues

- Increase `sandbox_lifetime_seconds`
- Break complex tasks into smaller stories
- Check for infinite loops in agent behavior

## See Also

- [Sandbox Guide](./SANDBOX-GUIDE.md) - Provider setup and management
- [Cost Management](./COST-MANAGEMENT.md) - Budget tracking
- [Orchestration Overview](./ORCHESTRATION.md) - General orchestration


