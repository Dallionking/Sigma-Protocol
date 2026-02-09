# PDF Lead Magnets — Content Outlines

**Version:** 1.0
**Date:** 2026-02-08
**Series:** SSS Unified Platform
**Purpose:** Content blueprints for 2 PDF lead magnets delivered via ManyChat (TIPS keyword) and the landing page
**Related:** `08-MANYCHAT-AUTOMATION-STRATEGY.md`, `LEAD-CAPTURE-LANDING-PAGE.md`

---

## PDF 1: "The 13-Step Sigma Methodology — Cheat Sheet"

**Format:** Single page (front and back), designed for mobile viewing and print
**Design tool:** Canva or Figma
**File:** Host on Vercel, Google Drive, or Gumroad (free)

### Front Side — The 13 Steps

Visual layout: numbered step flow (vertical or grid), each step in a card/block.

| Step | Name | What It Produces |
|------|------|------------------|
| 0 | Environment Setup | Dev environment, tools, AI coding config |
| 1 | Ideation | Problem/solution definition, Hormozi Value Equation |
| 1.5 | Offer Architecture | Pricing tiers, value ladder, positioning |
| 2 | System Architecture | Tech stack, infrastructure, data flow |
| 3 | UX Design | User flows, personas, journey maps |
| 4 | Flow Tree | Navigation structure, screen inventory, bulletproof gates |
| 5 | Wireframe Prototypes | Low-fi wireframes, PRDs per flow |
| 6 | Design System | Tokens, typography, color, spacing |
| 7 | Interface States | Loading, error, empty, success states for every screen |
| 8 | Technical Spec | API contracts, DB schema, integration specs |
| 9 | Landing Page | Conversion-optimized launch page |
| 10 | Feature Breakdown | Story mapping, feature shaping, sprint-ready chunks |
| 11 | PRD Generation | Implementation-ready PRDs with acceptance criteria |
| 12 | Context Engine | Codebase indexing, AI context rules |
| 13 | Skillpack Generator | Project-specific AI skills and commands |

### Back Side — Quick Reference

**Section 1: "When to Use Which Step"**
- Starting from scratch → Steps 0–5 (foundations)
- Adding a feature to existing code → Steps 10–11 (feature breakdown + PRD)
- Fixing quality/polish → Steps 6–7 (design system + states)
- Preparing for AI implementation → Steps 12–13 (context + skills)
- Full product from idea to ship → Steps 0–13 (everything)

**Section 2: "The Quality Gate"**
- Every step has a verification score (target: 80+/100)
- Nothing moves forward until the gate passes
- AI verifies — human approves (HITL checkpoint)

**Section 3: QR Code**
- Links to: `https://github.com/dallionking/sigma-protocol`
- Label: "Get the full protocol — 185+ commands, 6 platforms"

### Design Guidelines
- Use dark background with high-contrast text (matches Sigma brand)
- Step numbers in large bold font
- Minimal icons — one per step if any
- No walls of text — this is a reference sheet, not a guide
- Logo in top-left corner
- Social handles in bottom-right corner (@sigmasoftwaresolutions or equivalent)

---

## PDF 2: "5 Claude Code Patterns That Ship Products Faster"

**Format:** 3-4 pages, one pattern per half-page
**Design tool:** Canva, Figma, or Typst (for code-heavy layout)
**File:** Host on Vercel, Google Drive, or Gumroad (free)

### Cover / Intro (Half Page)

Title: **"5 Claude Code Patterns That Ship Products Faster"**
Subtitle: "How I use Claude Code to build full-stack products in hours, not weeks."
Author: Dallion King / Sigma Software Solutions
QR Code: Links to the Sigma Protocol GitHub repo

---

### Pattern 1: Agent Swarms

**What it is:** Spawn multiple AI agents that work in parallel on different parts of your codebase. One agent builds the frontend, another writes the API, a third handles tests — all at the same time.

**When to use it:** Any task with 3+ independent work streams. Feature implementation, codebase refactoring, multi-file changes.

**Example:**
```
Use Shift+Tab to enter delegate mode.
The orchestrator creates tasks and assigns them to specialized agents.
Each agent works independently with its own context window.
Results merge back through the shared task list.
```

**Key takeaway:** "Stop working sequentially. A 5-agent swarm can do in 20 minutes what takes 2 hours solo."

---

### Pattern 2: Preview-Driven Development

**What it is:** Build features by describing the end state, generate a preview, iterate on the visual output, then lock in the code. Design → Code, not Code → Hope It Looks Right.

**When to use it:** UI work, landing pages, component design, any visual output.

**Example:**
```
1. Describe the component: "A pricing card with 3 tiers, dark theme, gradient border"
2. Claude generates the code
3. Preview in browser → see issues immediately
4. Iterate: "Make the CTA button larger, add a 'Most Popular' badge to the middle tier"
5. Lock the code when the preview matches your vision
```

**Key takeaway:** "Let the AI generate, you curate. Your eye for design is the bottleneck, not your typing speed."

---

### Pattern 3: Skill-Based Architecture

**What it is:** Package reusable prompts, patterns, and instructions as "skills" that Claude loads on demand. Instead of re-explaining your codebase conventions every session, write it once as a skill.

**When to use it:** Any pattern you repeat more than twice. Code review standards, component conventions, deployment procedures.

**Example:**
```
# .claude/skills/frontend-design.md
When building React components:
- Use CVA for variant styling
- Follow the compound component pattern
- Include loading, error, and empty states
- Use Tailwind, no inline styles
```

**Key takeaway:** "Skills are institutional memory for AI. Write them once, enforce them forever."

---

### Pattern 4: Ralph Loop — Autonomous Implementation

**What it is:** Feed the AI a structured PRD (as JSON), and it autonomously implements features one by one in a loop — building, testing, verifying, and moving to the next task without human intervention.

**When to use it:** After Steps 10-11 of the Sigma methodology — when you have well-defined PRDs ready for implementation.

**Example:**
```bash
# Convert PRDs to JSON format
claude "Run step-11a-prd-to-json"

# Start the autonomous loop
./scripts/ralph/sigma-ralph.sh . docs/ralph/implementation/prd.json claude-code

# Ralph picks up the next unfinished PRD item, implements it,
# verifies with tests, marks complete, moves to the next one.
# You review the output when it's done.
```

**Key takeaway:** "PRDs are the product. Code is the output. Ralph turns your specs into running software while you sleep."

---

### Pattern 5: MCP Tool Orchestration

**What it is:** Connect external tools (databases, APIs, design tools, browsers) directly to Claude via MCP (Model Context Protocol) servers. Claude can query your database, scrape a competitor's page, run your test suite, and file a GitHub issue — all without leaving the conversation.

**When to use it:** Any workflow where you'd normally alt-tab to another tool. Database queries, API testing, web research, CI/CD, design system updates.

**Example:**
```
# Claude can directly:
- Query your Supabase database via MCP
- Search documentation via Context7
- Scrape competitor pages via Firecrawl
- Run comprehensive research via EXA
- Manage GitHub issues and PRs via gh CLI
- Automate browser testing via Playwright

# All from the same conversation where it's writing your code.
```

**Key takeaway:** "MCP turns Claude from a code generator into a full development environment. The fewer tools you alt-tab to, the faster you ship."

---

### Back Cover / CTA

**Heading:** "Want the full system?"

**Body:**
These 5 patterns are part of the Sigma Protocol — a 13-step methodology with 185+ commands for building production software with AI.

**Links:**
- Sigma Protocol (GitHub): [QR code]
- SSS Academy (waitlist): sigmasoftwaresolutions.io
- Discord community: [QR code]

**Social:** @sigmasoftwaresolutions (or equivalent handles)

---

## Content Sources

All content for these PDFs comes from existing documentation in the repo:

| Content | Source File |
|---------|------------|
| 13 steps overview | `CLAUDE.md` → workflow section, `.claude/rules/workflow.md` |
| Step details | `.claude/skills/steps/` (per-step skill files) |
| Agent swarms | `.claude/rules/swarm-orchestration.md` |
| Ralph Loop | `docs/RALPH-MODE.md` |
| Skills architecture | `docs/FOUNDATION-SKILLS.md`, `.claude/skills/` |
| MCP tools | `.claude/rules/mcp-tools.md` |
| Commands reference | `.claude/rules/commands-reference.md` |

No new content needs to be written from scratch — curate and simplify from existing docs.

---

## Hosting & Delivery

| Option | Pros | Cons |
|--------|------|------|
| **Vercel (static file)** | Free, fast CDN, custom domain | Requires deploy |
| **Google Drive (public link)** | Instant, no deploy | Ugly URL, Google branding |
| **Gumroad ($0 product)** | Captures email again, analytics | Extra friction |
| **GitHub Release asset** | Lives with the repo | Not optimized for mobile viewing |

**Recommendation:** Host on Vercel as a static asset at `sigmasoftwaresolutions.io/resources/sigma-cheatsheet.pdf` and `sigmasoftwaresolutions.io/resources/claude-code-patterns.pdf`. Clean URLs, fast loading, no third-party branding.

---

## Design & Production Timeline

| Task | Tool | Time |
|------|------|------|
| PDF 1 content (cheat sheet text) | Text editor | 30 min |
| PDF 1 design | Canva or Figma | 1-2 hours |
| PDF 2 content (5 patterns text) | Text editor | 45 min |
| PDF 2 design | Canva or Figma | 1-2 hours |
| QR code generation | Any QR tool | 5 min |
| Upload + test links | Vercel / hosting | 15 min |

**Total: ~4-5 hours for both PDFs**

---

## Testing

- [ ] PDF renders correctly on mobile (iPhone Safari PDF viewer)
- [ ] PDF renders correctly on desktop (Chrome, Safari)
- [ ] QR codes scan correctly on both PDFs
- [ ] Download links work from ManyChat DM
- [ ] Download links work from landing page
- [ ] File size is reasonable (< 5 MB per PDF)
- [ ] Text is readable without zooming on mobile

---

*Last updated: 2026-02-08*
*Cross-reference: `08-MANYCHAT-AUTOMATION-STRATEGY.md`, `LEAD-CAPTURE-LANDING-PAGE.md`*
