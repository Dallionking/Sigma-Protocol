# Research Skill

## Metadata

```yaml
id: research
name: "Research Skill"
description: "MCP-orchestrated web research with source curation"
version: "1.0.0"
```

## Purpose

Conduct current-year-aware web research using available MCP tools, curate credible sources, and generate structured research documents.

## Activation Triggers

This skill activates when an agent needs to:
- Gather market data or statistics
- Research competitors or alternatives
- Find best practices or industry standards
- Validate assumptions with external data
- Build year-aware context for decisions

## Tool Preferences

Try MCP tools in this order:
1. `mcp_exa_web_search_exa` - Best for technical/code content
2. `mcp_perplexity-ask_perplexity_ask` - Best for conversational research
3. `mcp_Ref_ref_search_documentation` - Best for library/framework docs
4. `web_search` - Fallback for general queries

## Workflow

### 1. Build Year-Aware Queries

Always include the current year in queries to get recent information:

```javascript
const year = new Date().getFullYear();
const queries = [
  `${topic} best practices ${year}`,
  `${topic} market size ${year}`,
  `${topic} trends ${year}`,
  `${topic} vs alternatives ${year}`
];
```

### 2. Execute Parallel Searches

Run multiple queries in parallel for efficiency:
- Aim for 5-10 credible sources per research task
- Diversify source types (blogs, docs, reports, papers)

### 3. Evaluate Source Credibility

Score each source:

| Factor | Weight | Criteria |
|--------|--------|----------|
| Recency | 30% | Published within 12 months |
| Authority | 25% | Known expert, official docs, peer-reviewed |
| Relevance | 25% | Directly addresses the query |
| Depth | 20% | Provides actionable detail, not fluff |

Discard sources scoring below 60%.

### 4. Extract Key Insights

From each credible source, extract:
- Main thesis or finding
- Supporting data points
- Relevant quotes (with attribution)
- Actionable recommendations

### 5. Generate Research Document

Output format:

```markdown
# Research: {Topic}

**Date:** {TODAY}
**Queries Used:** {list}
**Sources Evaluated:** {N}
**Sources Included:** {M}

## Executive Summary

{2-3 paragraph synthesis of key findings}

## Key Findings

### Finding 1: {Title}
{Description with data}
*Source: [Title](URL)*

### Finding 2: {Title}
...

## Source List

| # | Title | URL | Date | Credibility |
|---|-------|-----|------|-------------|
| 1 | ... | ... | ... | 85% |

## Methodology Notes

- Search tools used: {list}
- Queries executed: {list}
- Sources rejected: {count} (reasons: ...)
```

## Quality Gates

- [ ] At least 5 credible sources cited
- [ ] All sources from within 18 months
- [ ] No paywalled content without accessible summary
- [ ] Conflicting findings noted and addressed
- [ ] Executive summary synthesizes (not lists) findings

## Error Handling

If no MCP tools available:
1. Notify user that research will be limited
2. Use agent's training knowledge with explicit caveats
3. Flag all claims as "unverified - recommend manual research"
4. Suggest specific queries for user to run manually

