# Swarm-First CLAUDE.md Template Section

This template section should be injected into every project's CLAUDE.md by Step 12.

---

## 🐝 Swarm-First Philosophy

**CRITICAL RULE: Never work solo. Always delegate to sub-agents.**

Every task, no matter how simple, should leverage the agent swarm:

### Mandatory Delegation Rules

1. **Always spawn sub-agents** — Use the Task tool to delegate work
2. **Match agents to domains** — Use the right agent for the job (see Agent Registry below)
3. **Invoke skills explicitly** — Sub-agents MUST use `/skill-name` for domain expertise
4. **Parallelize when possible** — Spawn multiple agents for independent work

### Agent Invocation Pattern

```bash
# WRONG - Working solo
[Read files, make edits directly]

# CORRECT - Delegate to swarm
[Spawn sigma-planner for design]
[Spawn sigma-executor for implementation]
[Spawn sigma-reviewer for QA]
[Spawn sigma-sisyphus for verification]
```

### When to Use Each Agent Type

| Task Type | Primary Agent | Supporting Agents |
|-----------|---------------|-------------------|
| Planning/Architecture | sigma-planner | sigma-researcher |
| Code Implementation | sigma-executor | sigma-backend, sigma-frontend |
| Bug Fixes | sigma-executor | sigma-reviewer |
| Research | sigma-researcher | — |
| Code Review | sigma-reviewer | — |
| Verification | sigma-sisyphus | — |
| Frontend Work | sigma-frontend | sigma-executor |
| Backend Work | sigma-backend | sigma-executor |
| Testing | sigma-qa | sigma-reviewer |
| Documentation | sigma-docs | sigma-researcher |

### Spawning Sub-Agents

```
Use Task tool with:
- subagent_type: "general-purpose" (or specialized type)
- prompt: "You are sigma-executor. Implement [specific task]. Use /frontend-design skill."
- run_in_background: true (for parallel work)
```

---

## 📚 Agent Registry

### Core Agents

| Agent | Domain | Skills to Use | When to Spawn |
|-------|--------|---------------|---------------|
| `sigma-planner` | Architecture | @senior-architect, @brainstorming | Planning, design decisions |
| `sigma-executor` | Implementation | @frontend-design, @api-design-principles | Writing code |
| `sigma-reviewer` | Quality | @senior-qa, @systematic-debugging | Code review, bug fixes |
| `sigma-researcher` | Investigation | @sigmavue-research, @remembering-conversations | Research, context gathering |
| `sigma-sisyphus` | Verification | @quality-gates, @systematic-debugging | Verification loops |
| `sigma-frontend` | UI/UX | @frontend-design, @react-performance, @ux-designer | React, components |
| `sigma-backend` | API/Data | @api-design-principles, @architecture-patterns | APIs, databases |
| `sigma-qa` | Testing | @senior-qa, @quality-gates | Test writing, coverage |
| `sigma-docs` | Documentation | @skill-writer, @output-generation | Docs, README updates |

### Agent Spawn Examples

```markdown
<!-- Planning a new feature -->
Task: spawn sigma-planner
Prompt: "Design the authentication system. Use @senior-architect skill. Output architecture doc."

<!-- Implementing frontend -->
Task: spawn sigma-frontend
Prompt: "Build LoginForm component. Use @frontend-design skill. Follow design system."

<!-- Running verification -->
Task: spawn sigma-sisyphus
Prompt: "Verify all acceptance criteria for S001. Use @systematic-debugging if issues found."
```

---

## 🗂️ Skills Registry ({{SKILL_COUNT}} Skills by Category)

### Quick Lookup: Find the right skill instantly

<!-- Step 13 auto-generates this section based on actual skills in .claude/skills/ -->

{{SKILLS_BY_CATEGORY}}

---

## Skill Invocation Rules

1. **Always prefix with `/`** — Use `/skill-name` not just `skill-name`
2. **Match skill to task** — Check the "Use When" column
3. **Chain skills** — Complex tasks may need multiple skills in sequence
4. **Sub-agents inherit** — When spawning, tell the sub-agent which skills to use

### Example Skill Chains

```markdown
<!-- New feature implementation -->
1. /brainstorming — Explore approaches
2. /senior-architect — Design solution
3. /frontend-design — Build UI
4. /senior-qa — Write tests
5. /systematic-debugging — Fix issues

<!-- Bug fix workflow -->
1. /systematic-debugging — Diagnose root cause
2. /senior-qa — Verify fix
3. /quality-gates — Ensure no regressions
```
