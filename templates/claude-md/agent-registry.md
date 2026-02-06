# Agent Registry Template

This template defines the agent-to-task mapping for swarm-first projects.
Step 12 injects this into CLAUDE.md during context engine generation.

---

## Agent Registry

### Core Agent Roles

| Agent Name | Domain | Primary Skills | When to Spawn |
|------------|--------|----------------|---------------|
| `sigma-planner` | Planning & Architecture | `@senior-architect`, `@brainstorming` | Design decisions, system planning, PRD review |
| `sigma-executor` | Implementation | `@frontend-design`, `@api-design-principles` | Writing production code |
| `sigma-reviewer` | Quality Assurance | `@senior-qa`, `@systematic-debugging` | Code review, bug investigation |
| `sigma-researcher` | Investigation | `@sigmavue-research`, `@remembering-conversations` | Research, context gathering, docs lookup |
| `sigma-sisyphus` | Verification | `@quality-gates`, `@gap-analysis` | Verification loops, acceptance testing |
| `sigma-frontend` | UI/UX | `@frontend-design`, `@react-performance`, `@ux-designer` | React components, styling, UX |
| `sigma-backend` | API/Data | `@api-design-principles`, `@architecture-patterns` | APIs, server actions, database |
| `sigma-qa` | Testing | `@senior-qa`, `@quality-gates`, `@systematic-debugging` | Test writing, coverage |
| `sigma-docs` | Documentation | `@skill-writer`, `@output-generation` | Docs, README, comments |
| `sigma-security` | Security Lead | `@owasp-web-security`, `@owasp-api-security`, `@defense-in-depth`, `@security-code-review` | Threat modeling, security audit coordination, risk prioritization |
| `sigma-security-web` | Web/API Security | `@owasp-web-security`, `@owasp-api-security`, `@better-auth-best-practices` | Auth review, injection checks, XSS, BOLA |
| `sigma-security-infra` | Infra Security | `@dependency-security`, `@secrets-detection` | Container scanning, CI/CD hardening, supply chain |
| `sigma-security-compliance` | Compliance | `@saas-security-patterns`, `@security-code-review` | SOC 2, GDPR, HIPAA, PCI-DSS audits |
| `sigma-security-mobile` | Mobile Security | `@mobile-app-security`, `@owasp-web-security` | React Native security, certificate pinning, secure storage |
| `sigma-security-ai` | AI Safety | `@owasp-llm-security`, `@dependency-security` | Prompt injection, LLM output validation, AI supply chain |

### Task Type Routing

| Task Pattern | Primary Agent | Fallback |
|--------------|---------------|----------|
| `**/components/**` | `sigma-frontend` | `sigma-executor` |
| `**/app/**/page.tsx` | `sigma-frontend` | `sigma-executor` |
| `**/api/**`, `**/routes/**` | `sigma-backend` | `sigma-executor` |
| `**/actions/**` | `sigma-backend` | `sigma-executor` |
| `**/*.test.*`, `**/*.spec.*` | `sigma-qa` | `sigma-reviewer` |
| `**/styles/**`, `**/design/**` | `sigma-frontend` | `sigma-executor` |
| `**/db/**`, `**/schema/**` | `sigma-backend` | `sigma-executor` |
| `docs/prds/**` | `sigma-planner` | `sigma-researcher` |
| `**/auth/**`, `**/middleware/**` | `sigma-security-web` | `sigma-security` |
| `**/security/**`, `**/policies/**` | `sigma-security` | `sigma-security-compliance` |
| `Dockerfile`, `*.yml` (CI/CD) | `sigma-security-infra` | `sigma-security` |
| `**/ai/**`, `**/llm/**`, `**/prompts/**` | `sigma-security-ai` | `sigma-security` |
| `**/mobile/**`, `**/ios/**`, `**/android/**` | `sigma-security-mobile` | `sigma-security` |

### Spawning Pattern

```markdown
<!-- Planning a new feature -->
Task tool: spawn sigma-planner
Prompt: "Design the authentication system. Use @senior-architect skill. Output architecture doc."

<!-- Implementing frontend -->
Task tool: spawn sigma-frontend
Prompt: "Build LoginForm component. Use @frontend-design skill. Follow design system."

<!-- Running verification -->
Task tool: spawn sigma-sisyphus
Prompt: "Verify all acceptance criteria for PRD-001. Use @gap-analysis if issues found."

<!-- Research before implementation -->
Task tool: spawn sigma-researcher
Prompt: "Research Supabase RLS patterns for multi-tenant apps. Use @sigmavue-research skill."

<!-- Security audit -->
Task tool: spawn sigma-security
Prompt: "Run full security audit. Coordinate sigma-security-web for OWASP Top 10, sigma-security-infra for dependencies."

<!-- Compliance check -->
Task tool: spawn sigma-security-compliance
Prompt: "Run SOC 2 compliance check. Use @saas-security-patterns skill. Output compliance report."
```

### Agent Communication Protocol

Agents communicate through:
1. **Task tool results** - Direct response back to parent
2. **AGENTS.md updates** - Long-term learnings persist here
3. **File artifacts** - Code, docs, configs they produce

### Parallel vs Sequential

**Parallel (independent work):**
```markdown
Use Task tool multiple times in same message:
- sigma-frontend: Build Header component
- sigma-frontend: Build Footer component
- sigma-backend: Create auth endpoints
```

**Sequential (dependencies):**
```markdown
1. sigma-planner: Design the feature architecture
2. [wait for result]
3. sigma-executor: Implement based on the plan
4. [wait for result]
5. sigma-qa: Verify implementation
```
