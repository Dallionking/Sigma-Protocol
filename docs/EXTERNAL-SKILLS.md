# External Skills Reference

**Version:** 5.0
**Last Updated:** 2026-01-23
**Maintainer:** Sigma Protocol Team

---

## Overview

Sigma Protocol integrates **129 external skills** from the [skills.sh](https://skills.sh) ecosystem and other community sources. These skills extend the 39 Foundation Skills with domain-specific expertise for security, mobile development, 3D graphics, marketing, and more.

External skills are automatically discovered by the Ralph Loop's skill-registry system and matched to stories based on content keywords, file paths, and task IDs.

---

## Skill Sources

| Source | Skills | Category | Description |
|--------|--------|----------|-------------|
| [vercel-labs](https://github.com/vercel-labs) | 2 | Development | React best practices, deployment optimization |
| [remotion-dev](https://github.com/remotion-dev) | 1 | Video | Programmatic video creation |
| [expo](https://github.com/expo) | 10 | Mobile | React Native with Expo framework |
| [stripe](https://github.com/stripe) | 2 | Payments | Payment integration best practices |
| [cloudai-x/threejs](https://github.com/cloudai-x) | 10 | 3D Graphics | Three.js fundamentals to advanced |
| [marketingskills](https://skills.sh) | 24 | Marketing | CRO, ads, content, SEO |
| [trailofbits](https://github.com/trailofbits) | 42 | Security | Fuzzing, vulnerability scanning |
| [better-auth](https://github.com/better-auth) | 3 | Authentication | Modern auth patterns |
| [callstack](https://github.com/callstack) | 9 | Mobile | React Native performance |
| [anthropics](https://github.com/anthropics) | 14 | Productivity | AI-assisted workflows |
| [obra/superpowers](https://github.com/obra) | 12 | Agent Patterns | Multi-agent coordination |

---

## Skills by Category

### Security & Vulnerability Scanning (42 skills)

These skills from Trail of Bits provide expertise in security testing, fuzzing, and vulnerability analysis.

| Skill | Purpose | Auto-Trigger Keywords |
|-------|---------|----------------------|
| `semgrep` | Static analysis rule creation | security, scan, vulnerability |
| `semgrep-rule-creator` | Custom Semgrep rule development | rule, pattern, security |
| `semgrep-rule-variant-creator` | Rule variants for edge cases | variant, security |
| `codeql` | GitHub CodeQL analysis | codeql, security, vulnerability |
| `aflpp` | American Fuzzy Lop++ fuzzing | fuzz, afl, crash |
| `libfuzzer` | LLVM-based fuzzing | fuzz, libfuzzer, crash |
| `libafl` | Advanced fuzzing framework | fuzz, libafl, crash |
| `cargo-fuzz` | Rust fuzzing | fuzz, rust, cargo |
| `atheris` | Python fuzzing | fuzz, python, atheris |
| `ruzzy` | Ruby fuzzing | fuzz, ruby, ruzzy |
| `ossfuzz` | OSS-Fuzz integration | fuzz, oss-fuzz, google |
| `address-sanitizer` | Memory error detection | asan, memory, sanitizer |
| `constant-time-analysis` | Timing attack prevention | timing, constant, crypto |
| `constant-time-testing` | Cryptographic timing tests | timing, crypto, test |
| `wycheproof` | Crypto test vectors | crypto, test, wycheproof |
| `sarif-parsing` | Security results format | sarif, security, results |
| `harness-writing` | Fuzz harness development | harness, fuzz, test |
| `fuzzing-dictionary` | Fuzzing dictionary creation | dictionary, fuzz, mutation |
| `fuzzing-obstacles` | Common fuzzing issues | fuzz, obstacle, debug |
| `entry-point-analyzer` | Code entry point analysis | entry, analysis, security |
| `token-integration-analyzer` | Token/auth analysis | token, auth, security |
| `burpsuite-project-parser` | Burp Suite integration | burp, proxy, security |
| `webapp-testing` | Web app security testing | webapp, security, pentest |
| `dwarf-expert` | DWARF debug info analysis | dwarf, debug, binary |

**Blockchain-Specific Vulnerability Scanners:**

| Skill | Chain | Purpose |
|-------|-------|---------|
| `algorand-vulnerability-scanner` | Algorand | Smart contract security |
| `cairo-vulnerability-scanner` | StarkNet | Cairo contract analysis |
| `cosmos-vulnerability-scanner` | Cosmos | SDK module security |
| `solana-vulnerability-scanner` | Solana | Program security |
| `substrate-vulnerability-scanner` | Polkadot | Substrate pallet security |
| `ton-vulnerability-scanner` | TON | FunC contract security |

---

### Mobile Development (19 skills)

Skills for React Native and Expo mobile development.

**Expo Skills (10):**

| Skill | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `expo-api-routes` | Expo Router API routes | expo, api, route |
| `expo-cicd-workflows` | CI/CD for Expo apps | expo, ci, deploy |
| `expo-deployment` | EAS Build & Submit | expo, deploy, eas |
| `expo-dev-client` | Custom dev client setup | expo, dev, client |
| `expo-tailwind-setup` | NativeWind configuration | expo, tailwind, native |
| `upgrading-expo` | Expo SDK upgrades | expo, upgrade, sdk |
| `native-data-fetching` | Data fetching patterns | expo, fetch, data |
| `use-dom` | DOM components in Expo | expo, dom, web |
| `sharp-edges` | Native module gotchas | expo, native, edge |
| `building-native-ui` | Native UI components | expo, native, ui |

**React Native Skills (9):**

| Skill | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `react-native-best-practices` | RN patterns & performance | react-native, mobile |
| Plus 8 more from callstack | Performance optimization | react-native, performance |

---

### 3D Graphics - Three.js (10 skills)

Comprehensive Three.js skill collection from cloudai-x.

| Skill | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `threejs-fundamentals` | Scene, camera, renderer | three, 3d, scene |
| `threejs-geometry` | Meshes and geometries | three, geometry, mesh |
| `threejs-materials` | Materials and shaders | three, material, shader |
| `threejs-lighting` | Lights and shadows | three, light, shadow |
| `threejs-animation` | Animation and tweening | three, animation, tween |
| `threejs-loaders` | Model loading (GLTF, FBX) | three, loader, gltf |
| `threejs-textures` | Texture mapping | three, texture, map |
| `threejs-interaction` | Raycasting and events | three, raycast, click |
| `threejs-shaders` | Custom GLSL shaders | three, glsl, shader |
| `threejs-postprocessing` | Post-processing effects | three, postprocess, effect |

---

### Marketing & Conversion (24 skills)

CRO, advertising, and content marketing expertise.

**Conversion Rate Optimization:**

| Skill | Focus Area | Auto-Trigger |
|-------|------------|--------------|
| `page-cro` | Landing page optimization | landing, conversion, cro |
| `form-cro` | Form conversion | form, conversion, signup |
| `popup-cro` | Popup effectiveness | popup, modal, conversion |
| `signup-flow-cro` | Signup funnel | signup, funnel, onboard |
| `onboarding-cro` | User onboarding | onboarding, activation |
| `paywall-upgrade-cro` | Paywall optimization | paywall, upgrade, pricing |

**Advertising & Growth:**

| Skill | Focus Area | Auto-Trigger |
|-------|------------|--------------|
| `paid-ads` | Paid advertising strategy | ads, paid, campaign |
| `social-content` | Social media content | social, content, post |
| `programmatic-seo` | Programmatic SEO pages | seo, programmatic, pages |
| `schema-markup` | Structured data | schema, seo, markup |
| `seo-audit` | SEO site audit | seo, audit, ranking |

**Strategy & Content:**

| Skill | Focus Area | Auto-Trigger |
|-------|------------|--------------|
| `launch-strategy` | Product launch planning | launch, strategy, release |
| `pricing-strategy` | Pricing models | pricing, strategy, monetize |
| `referral-program` | Referral system design | referral, growth, viral |
| `free-tool-strategy` | Free tool marketing | free, tool, lead |
| `marketing-ideas` | Campaign ideation | marketing, idea, campaign |
| `marketing-psychology` | Persuasion principles | psychology, persuasion |
| `email-sequence` | Email automation | email, sequence, drip |
| `copywriting` | Persuasive copy | copy, headline, cta |
| `copy-editing` | Copy refinement | edit, copy, polish |

---

### Payments (2 skills)

| Skill | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `stripe-best-practices` | Stripe integration patterns | stripe, payment, checkout |
| `upgrade-stripe` | Stripe SDK upgrades | stripe, upgrade, migration |

---

### Authentication (3 skills)

| Skill | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `better-auth-best-practices` | Modern auth implementation | auth, login, session |
| `create-auth-skill` | Custom auth skill creation | auth, skill, custom |

---

### Video Production (1 skill)

| Skill | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `remotion-best-practices` | Programmatic video with React | video, remotion, render |

---

### Agent Patterns (12 skills)

Multi-agent coordination from obra/superpowers.

| Skill | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `dispatching-parallel-agents` | Multi-agent orchestration | parallel, agent, dispatch |
| `subagent-driven-development` | Subagent architecture | subagent, delegate, task |
| `using-superpowers` | Superpower patterns | superpower, capability |
| `doc-coauthoring` | Collaborative document editing | doc, collaborate, edit |
| `executing-plans` | Plan execution patterns | plan, execute, implement |
| `writing-plans` | Plan authoring | plan, write, strategy |
| `ask-questions-if-underspecified` | Clarification patterns | question, clarify, ambiguous |
| `verification-before-completion` | Quality verification | verify, complete, check |

---

### Productivity & Development (14 skills)

General development workflow skills.

| Skill | Purpose | Auto-Trigger |
|-------|---------|--------------|
| `code-maturity-assessor` | Code quality assessment | quality, maturity, assess |
| `differential-review` | Diff-focused code review | review, diff, change |
| `fix-review` | Post-fix verification | fix, review, verify |
| `receiving-code-review` | Handling review feedback | review, feedback, respond |
| `requesting-code-review` | Review request best practices | review, request, pr |
| `finishing-a-development-branch` | Branch completion checklist | branch, finish, merge |
| `spec-to-code-compliance` | Spec adherence verification | spec, compliance, verify |
| `test-driven-development` | TDD workflow | tdd, test, driven |
| `property-based-testing` | Property-based test patterns | property, test, hypothesis |
| `testing-handbook-generator` | Test documentation | test, handbook, doc |
| `using-git-worktrees` | Git worktree workflow | worktree, git, branch |
| `terminal-automation` | Terminal workflow automation | terminal, automation, cli |
| `mcp-builder` | MCP server development | mcp, server, tool |
| `taskmaster-integration` | Task Master integration | taskmaster, task, manage |

---

## Platform Distribution

External skills are distributed across all supported platforms:

| Platform | Location | Count | Format |
|----------|----------|-------|--------|
| Claude Code | `platforms/claude-code/skills/<name>/SKILL.md` | 148 | Full content |
| OpenCode | `platforms/opencode/skill/<name>/SKILL.md` | 149 | Full content |
| Cursor | `platforms/cursor/rules/<category>/sigma-<name>.mdc` | 149 | Condensed |
| Local Project | `.claude/skills/<name>.md` | 162 | Flat files |

---

## Auto-Discovery

The Ralph Loop automatically discovers and matches skills using the `skill-registry.sh` system:

```bash
# Build skill registry (done automatically by Ralph)
source scripts/ralph/skill-registry.sh
build_skill_registry "/path/to/project"

# Get matching skills for a story
matched=$(get_matching_skills "$story_json")
```

### Matching Algorithm

Skills are matched to stories based on weighted scoring:

| Match Type | Points | Example |
|------------|--------|---------|
| Direct trigger match | +10 | Story mentions "three.js" → threejs-fundamentals |
| Task ID prefix | +8 | Task "UI-001" → frontend-design |
| File path pattern | +6 | File `*.tsx` → react skills |
| Keyword in content | +4 | "conversion" → page-cro |
| Complexity boost | +3 | Complex story → senior-architect |

See [RALPH-SKILL-REGISTRY.md](./RALPH-SKILL-REGISTRY.md) for full documentation.

---

## Adding New External Skills

1. **Find skill packages** at [skills.sh](https://skills.sh) or GitHub
2. **Import using skillz.sh:**
   ```bash
   npx skillz.sh install <package-name>
   ```
3. **Sync to Sigma Protocol:**
   ```bash
   ./scripts/sync-skills-to-master.sh
   npm run build:all  # Rebuild platform distributions
   ```
4. **Add triggers** to skill frontmatter for auto-matching

---

## Related Documentation

- [FOUNDATION-SKILLS.md](./FOUNDATION-SKILLS.md) - 39 Foundation skills
- [RALPH-SKILL-REGISTRY.md](./RALPH-SKILL-REGISTRY.md) - Dynamic skill matching
- [PLATFORMS.md](./PLATFORMS.md) - Platform-specific skill formats
- [Gap Analysis Report](./analysis/GAP-ANALYSIS-SKILLS-INTEGRATION-2026-01-22.md) - Integration details
