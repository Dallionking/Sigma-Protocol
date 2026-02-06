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
| 3+ independent tasks | `dispatching-parallel-agents` |

## Agent Skill Assignment

When distributing to swarm, assign skills by role:

| Agent Role | Skills |
|------------|--------|
| **Planning Agents** | deep-research, brainstorming, executing-plans |
| **Frontend Agents** | frontend-design, react-performance, web-artifacts-builder |
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
