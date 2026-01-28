---
name: crewai-patterns
description: Use when designing role-based multi-agent systems, defining agent roles and responsibilities, or configuring agent crews for collaborative tasks
version: 1.0.0
tags: [crewai, multi-agent, roles, delegation, collaboration, agent-framework]
triggers: [crew, agent roles, delegation, researcher, writer, reviewer, agent team, crewai]
---

# CrewAI Patterns: Role-Based Multi-Agent Framework

Design patterns for role-based multi-agent systems inspired by CrewAI. Use when tasks benefit from distinct agent personas with specialized capabilities, tools, and responsibilities.

## Overview

CrewAI patterns organize agents into crews with defined roles, goals, and backstories. The core principle: **agents with clear identity produce better results than generic agents**.

Key insight: Role definition shapes agent behavior. A "Security Analyst" agent approaches problems differently than a generic "Assistant" agent, even with identical capabilities.

## When to Use

**Use CrewAI patterns when:**
- Task benefits from multiple perspectives (research, writing, review)
- Agents need distinct personalities or approaches
- Delegation between agents improves quality
- Task requires handoffs between specialized stages

**Skip CrewAI patterns when:**
- Single agent with multiple skills suffices
- Roles would be artificial (no real specialization needed)
- Overhead of role definition exceeds benefit

```
Task requires distinct perspectives?
    ├── YES → Define roles, create crew
    └── NO → Single agent with combined skills
```

## Agent Role Definitions

### Core Role Components

Each agent role requires:

| Component | Purpose | Example |
|-----------|---------|---------|
| **Role Name** | Identity and specialization | "Senior Security Researcher" |
| **Goal** | What agent optimizes for | "Find all vulnerabilities before attackers do" |
| **Backstory** | Context shaping behavior | "10 years pentesting, zero tolerance for false security" |
| **Tools** | Available capabilities | [code_search, vuln_database, exploit_checker] |
| **Allow Delegation** | Can pass tasks to others | true/false |

### Standard Role Library

#### Research Roles

**Deep Researcher**
```yaml
role: Deep Researcher
goal: Gather comprehensive, accurate information from multiple sources
backstory: Academic researcher with PhD, values thoroughness over speed
tools: [web_search, paper_search, fact_checker]
delegation: false
```

**Competitive Analyst**
```yaml
role: Competitive Analyst
goal: Map competitor landscape with actionable insights
backstory: Former strategy consultant, sees patterns others miss
tools: [web_search, company_data, market_trends]
delegation: true
```

#### Writing Roles

**Technical Writer**
```yaml
role: Technical Writer
goal: Produce clear, accurate documentation developers love
backstory: Former developer turned writer, hates ambiguity
tools: [code_reader, diagram_generator, linter]
delegation: false
```

**Copywriter**
```yaml
role: Conversion Copywriter
goal: Write copy that moves readers to action
backstory: Direct response marketer, obsessed with metrics
tools: [headline_analyzer, readability_scorer]
delegation: false
```

#### Review Roles

**Code Reviewer**
```yaml
role: Senior Code Reviewer
goal: Catch bugs, improve code quality, mentor through feedback
backstory: Staff engineer with 500+ PR reviews, constructive not critical
tools: [code_analyzer, test_runner, linter]
delegation: false
```

**Editor**
```yaml
role: Senior Editor
goal: Ensure content is clear, accurate, and on-brand
backstory: Newspaper editor, ruthless about unnecessary words
tools: [grammar_checker, style_guide, fact_checker]
delegation: true
```

#### Technical Roles

**Architect**
```yaml
role: System Architect
goal: Design scalable, maintainable systems
backstory: Built systems handling 1M+ requests, learned from failures
tools: [diagram_generator, cost_calculator, pattern_library]
delegation: true
```

**Security Analyst**
```yaml
role: Security Analyst
goal: Identify vulnerabilities before they become incidents
backstory: Former red team, thinks like an attacker
tools: [vuln_scanner, code_analyzer, threat_model]
delegation: false
```

## Task Delegation Strategies

### Sequential Delegation

Tasks flow through roles in order. Each agent completes before next begins.

```
Research → Write → Review → Publish

Example:
1. Researcher gathers market data
2. Writer creates report draft
3. Editor reviews and refines
4. Publisher formats and distributes
```

**Use when:** Each stage requires previous output, quality gates between stages

### Hierarchical Delegation

Manager agent assigns tasks, workers report back, manager synthesizes.

```
        Manager
       /   |   \
   Worker Worker Worker
       \   |   /
        Synthesis

Example:
1. Project Manager breaks feature into tasks
2. Frontend Dev, Backend Dev, QA work in parallel
3. PM integrates and resolves conflicts
```

**Use when:** Work parallelizable, central coordination needed

### Peer Delegation

Agents delegate to each other based on expertise. No fixed hierarchy.

```
Agent A ↔ Agent B ↔ Agent C

Example:
1. Writer needs data → delegates to Researcher
2. Researcher needs clarification → asks Writer
3. Editor reviews, suggests research → back to Researcher
```

**Use when:** Iterative refinement, expertise-based handoffs

## Result Aggregation Patterns

### Merge Pattern

Combine outputs from multiple agents into single artifact.

```python
# Each agent produces section
sections = {
    "researcher": executive_summary,
    "analyst": competitive_landscape,
    "writer": recommendations
}

# Merge into final report
final_report = merge_sections(sections, order=["researcher", "analyst", "writer"])
```

### Consensus Pattern

Agents vote or discuss to reach agreement.

```python
# Each agent evaluates
evaluations = {
    "security": {"risk": "high", "recommendation": "reject"},
    "product": {"risk": "low", "recommendation": "approve"},
    "legal": {"risk": "medium", "recommendation": "modify"}
}

# Consensus rules
if any_high_risk(evaluations):
    final = "reject"
elif majority_approve(evaluations):
    final = "approve"
else:
    final = "escalate"
```

### Pipeline Pattern

Output transforms through agent chain. Each agent refines previous.

```python
# Transform chain
draft = writer.generate(topic)
edited = editor.refine(draft)
fact_checked = researcher.verify(edited)
final = publisher.format(fact_checked)
```

## Memory Sharing Between Agents

### Shared Context

All agents access common knowledge base.

```yaml
shared_memory:
  type: long_term
  contents:
    - project_requirements
    - style_guide
    - previous_decisions
  access: read_all, write_orchestrator_only
```

### Scoped Memory

Agents share within scope, isolated across scopes.

```yaml
memory_scopes:
  research_team:
    agents: [researcher, analyst]
    shared: [research_notes, sources]

  writing_team:
    agents: [writer, editor]
    shared: [drafts, style_decisions]

  cross_team:
    shared: [final_outputs, requirements]
```

### Handoff Memory

Context passed explicitly during delegation.

```yaml
handoff:
  from: researcher
  to: writer
  context:
    - key_findings
    - source_links
    - confidence_levels
  exclude:
    - raw_search_results
    - failed_queries
```

## Tool Assignment Per Role

### Exclusive Tools

Only specific role can use certain tools.

```yaml
tool_assignments:
  code_executor:
    roles: [developer, qa]
    reason: Safety - only technical roles run code

  publish_tool:
    roles: [publisher]
    reason: Control - single point of publication

  delete_tool:
    roles: [admin]
    reason: Destructive - requires elevated privilege
```

### Shared Tools

Multiple roles access common capabilities.

```yaml
shared_tools:
  - web_search: [researcher, analyst, writer]
  - file_read: [all]
  - file_write: [developer, writer]
```

### Tool Hierarchy

Roles inherit tools from parent roles.

```yaml
role_hierarchy:
  base_agent:
    tools: [web_search, file_read]

  developer:
    inherits: base_agent
    additional_tools: [code_executor, linter, test_runner]

  senior_developer:
    inherits: developer
    additional_tools: [deploy_tool, database_access]
```

## Example Crew Configurations

### Content Creation Crew

```yaml
crew: content_creation
goal: Produce high-quality blog post from topic

agents:
  - role: Research Lead
    goal: Gather authoritative sources
    tools: [web_search, paper_search]
    delegation: false

  - role: Content Strategist
    goal: Define angle and structure
    tools: [trend_analyzer, audience_insights]
    delegation: true

  - role: Writer
    goal: Create engaging, accurate content
    tools: [writing_assistant, plagiarism_checker]
    delegation: false

  - role: Editor
    goal: Polish and fact-check
    tools: [grammar_checker, fact_verifier]
    delegation: false

workflow:
  1. Research Lead → gathers sources
  2. Content Strategist → defines structure (can delegate research)
  3. Writer → creates draft
  4. Editor → final review
```

### Code Review Crew

```yaml
crew: code_review
goal: Comprehensive code review for PR

agents:
  - role: Logic Reviewer
    goal: Verify correctness and edge cases
    tools: [code_analyzer, test_generator]

  - role: Security Reviewer
    goal: Identify vulnerabilities
    tools: [vuln_scanner, dependency_checker]

  - role: Performance Reviewer
    goal: Spot performance issues
    tools: [profiler, complexity_analyzer]

  - role: Style Reviewer
    goal: Ensure code consistency
    tools: [linter, formatter]

workflow:
  parallel: [logic, security, performance, style]
  aggregation: merge_all_comments
  blocking: security_issues_block_merge
```

### Product Launch Crew

```yaml
crew: product_launch
goal: Execute product launch checklist

agents:
  - role: Launch Manager
    goal: Coordinate all launch activities
    delegation: true

  - role: Marketing Lead
    goal: Prepare marketing materials
    tools: [campaign_builder, analytics]

  - role: Technical Lead
    goal: Ensure system readiness
    tools: [health_checker, load_tester]

  - role: Support Lead
    goal: Prepare support resources
    tools: [doc_generator, ticket_system]

workflow:
  phase_1: [technical_readiness, support_prep] # parallel
  phase_2: [marketing_prep] # requires phase_1
  phase_3: [launch_execution] # requires phase_2
  manager: coordinates, resolves blockers
```

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Role Soup** | Too many roles, unclear boundaries | Max 5 roles per crew, clear ownership |
| **Fake Specialization** | Roles differ only in name | Each role needs unique goal, tools, or approach |
| **Tool Hoarding** | One role has all tools | Distribute tools based on need |
| **Memory Leak** | All agents see all context | Scope memory to relevant roles |
| **Delegation Loops** | A delegates to B delegates to A | Clear delegation direction, no cycles |
| **Silent Handoffs** | Context lost between agents | Explicit handoff with required context |

## Checklist

Before creating crew:

- [ ] Task benefits from multiple perspectives
- [ ] Roles are genuinely distinct (different goals, tools, or approach)
- [ ] Delegation strategy selected (sequential, hierarchical, peer)
- [ ] Tools assigned per role (exclusive and shared)
- [ ] Memory sharing configured (shared, scoped, handoff)
- [ ] Aggregation pattern defined (merge, consensus, pipeline)

During crew execution:

- [ ] Agents operating within role boundaries
- [ ] Delegations following defined strategy
- [ ] Memory isolation maintained
- [ ] Handoffs include required context

After crew completion:

- [ ] Results aggregated correctly
- [ ] All agent outputs integrated
- [ ] Quality gates passed per role
- [ ] Crew performance documented for iteration

## Integration with Sigma Protocol

Cross-reference with:
- `@loki-mode` - Multi-agent orchestration patterns
- `@dispatching-parallel-agents` - Parallel execution mechanics
- `@deep-research` - Research agent configuration
- `@writing-clearly` - Writing agent standards

---

_Remember: Roles are personas, not just labels. A well-defined role shapes agent behavior toward better outcomes. If role definition feels forced, single-agent may be simpler._
