# Sigma Protocol - Swarm Orchestration

## Swarm Sizing
| PRD Complexity | Agent Count | Parallel Streams |
|----------------|-------------|------------------|
| Simple (1-3 features) | 5 agents | 2-3 |
| Medium (4-7 features) | 10 agents | 4-5 |
| Complex (8+ features) | 15-20 agents | 6-8 |

## Mandatory Team Agents

**Every team MUST include these two agents, regardless of team size:**

| Agent | Role | When | Skills |
|-------|------|------|--------|
| **Devil's Advocate** | Adversarial post-implementation review | After all implementation tasks complete | verification-before-completion, quality-gates |
| **Gap Analyst** | Requirements traceability + auto-fix | After devil's advocate completes | gap-analysis, verification-before-completion, quality-gates |

**Execution order:**
1. Implementation agents work in parallel
2. Devil's Advocate reviews (blocked until all implementation tasks complete)
3. Gap Analyst runs final verification (blocked until devil's advocate completes)
4. Team lead reviews reports and decides ship/no-ship

**Task dependency pattern:**
```
Implementation Task 1 --+
Implementation Task 2 --+
Implementation Task N --+---> Devil's Advocate Review ---> Gap Analysis ---> Done
```

## Research-First Planning

**CRITICAL: Before ANY planning session:**
1. Invoke `deep-research` skill automatically
2. Use Firecrawl for competitor/market research
3. Use EXA for technical patterns and code examples
4. Synthesize findings BEFORE brainstorming

## Automatic Skill Invocation

Before executing ANY task, match keywords and auto-invoke:

| Task Contains | Auto-Invoke Skill |
|---------------|-------------------|
| plan, design, ideate | `brainstorming` + `deep-research` |
| architecture, technical | `deep-research` first |
| component, UI, *.tsx | `frontend-design` |
| test, verify, done | `verification-before-completion` |
| docs, README, commit | `writing-clearly` |
| marketing, launch, SEO | `marketing-*` skills |
| pr, review, merge | `greptile-pr-review` + `differential-review` |
| security, audit, vulnerability | `owasp-web-security` + `security-code-review` |
| auth, authentication, authorization | `better-auth-best-practices` + `defense-in-depth` |
| compliance, SOC2, GDPR, HIPAA | `saas-security-patterns` |
| dependency, supply-chain, secrets | `dependency-security` + `secrets-detection` |
| LLM, AI safety, prompt injection | `owasp-llm-security` |
| mobile security, certificate pinning | `mobile-app-security` |
| react-native, expo, nativewind | `react-native-patterns` + `mobile-app-security` |
| swiftui, swift, xcode, ios-native | `swiftui-patterns` + `swift-concurrency` |
| maestro, detox, mobile-test | `mobile-ui-testing` |
| hig, material-design, platform-native | `platform-design-guidelines` |
| chart, data-viz, bklit | `rn-component-library` |
| shadcn-mobile, react-native-reusables | `rn-component-library` |
| 3+ independent tasks | `dispatching-parallel-agents` |

## Agent Skill Assignment

When distributing to swarm, assign skills by role:

| Agent Role | Skills |
|------------|--------|
| **Planning Agents** | deep-research, brainstorming, executing-plans |
| **Frontend Agents** | frontend-design, react-performance, web-artifacts-builder, react-native-patterns, rn-component-library |
| **Mobile Agents (RN/Expo)** | react-native-patterns, rn-component-library, mobile-ui-testing, platform-design-guidelines |
| **Mobile Agents (SwiftUI)** | swiftui-patterns, swift-concurrency, mobile-ui-testing, platform-design-guidelines |
| **Backend Agents** | verification-before-completion, api-design-principles |
| **QA Agents** | verification-before-completion, tdd-skill-creation, greptile-pr-review |
| **Security Lead** | owasp-web-security, owasp-api-security, defense-in-depth, security-code-review |
| **Security Web/API** | owasp-web-security, owasp-api-security, better-auth-best-practices |
| **Security Infra** | dependency-security, secrets-detection |
| **Security Compliance** | saas-security-patterns, security-code-review |
| **Security Mobile** | mobile-app-security, owasp-web-security |
| **Security AI Safety** | owasp-llm-security, dependency-security |
| **Documentation Agents** | writing-clearly |
| **Devil's Advocate** | verification-before-completion, quality-gates |
| **Gap Analyst** | gap-analysis, verification-before-completion, quality-gates |
| **Marketing Agents** | marketing-copywriting, marketing-psychology, seo-audit |

## Agent Memory Configuration

Agents with `memory:` in their frontmatter persist a MEMORY.md across sessions. The first 200 lines are injected into the agent's system prompt at session start.

| Agent | Scope | What It Remembers |
|-------|-------|-------------------|
| **sigma-orchestrator** | `project` | Delegation patterns, swarm configurations, team composition history |
| **sigma-product-owner** | `project` | PRD quality learnings, stakeholder preferences |
| **sigma-venture-studio** | `user` | Cross-project market insights, business model learnings |
| **sigma-lead-architect** | `project` | Architecture decisions, tech stack rationale |
| **sigma-ux-director** | `project` | UX decisions, design constraints |
| **sigma-frontend** | `project` | Component patterns, performance history |
| **sigma-design-systems** | `project` | Token decisions, component library choices |
| **sigma-qa** | `project` | Test strategy baselines, known flaky areas |
| **sigma-security-lead** | `local` | Threat models, vulnerability findings (sensitive) |
| **sigma-security-compliance** | `local` | Compliance status, framework mappings (sensitive) |
| **sigma-market-data** | `project` | Data source configs, symbol mappings |
| **sigma-quant-strategist** | `project` | Strategy performance, Base Hit calibrations |
| **sigma-content-director** | `user` | Brand voice notes, platform-specific learnings |

**Scope definitions:**
- `project` — Stored in `.claude/agent-memory/`, committed to git, shared across team
- `local` — Stored in `.claude/agent-memory-local/`, gitignored (sensitive data)
- `user` — Stored in `~/.claude/agent-memory/`, spans all repositories

**No memory:** sigma-executor (stateless fork worker), sigma-devils-advocate (fixed checklist), sigma-gap-analyst (fresh each run), 5 security leaf agents (stateless auditors).

## Subagent Spawning Restrictions

Only coordinators can spawn subagents via the Task tool. All other agents are leaf workers.

| Agent | Task Tool Access | Allowed Subagent Types |
|-------|-----------------|----------------------|
| **sigma-orchestrator** | Unrestricted | All agent types |
| **sigma-security-lead** | Restricted | sigma-security-web-api, sigma-security-infra, sigma-security-mobile, sigma-security-compliance, sigma-security-ai-safety |
| **All other agents (18)** | None | Cannot spawn subagents |
