# How It Works

A technical deep-dive into the Sigma Protocol methodology, step file architecture,
the Ralph autonomous implementation loop, and multi-agent orchestration.

---

## The Methodology

Software projects fail primarily because of planning gaps, not engineering gaps. Studies
consistently show that the majority of project failures trace back to unclear requirements,
missed edge cases, and architectural misalignment discovered too late. The Sigma Protocol's
13-step sequence is designed around this observation.

Each step addresses a specific category of planning gap:

| Steps | Category | What It Prevents |
|-------|----------|------------------|
| 0 | Environment | "Works on my machine" failures |
| 1 | Ideation | Building something nobody wants |
| 2 | Architecture | Technical dead ends at scale |
| 3 | UX Design | Interfaces that confuse users |
| 4 | Flow Tree | Missing screens discovered mid-build |
| 5 | Wireframes | Misunderstood layouts and interactions |
| 6 | Design System | Inconsistent UI across features |
| 7 | Interface States | Unhandled loading, empty, and error states |
| 8 | Technical Spec | Ambiguous implementation details |
| 9 | Landing Page | Weak positioning and messaging |
| 10 | Feature Breakdown | Poor scope estimation and shaping |
| 11 | PRD Generation | Incomplete or vague developer handoff |
| 12 | Context Engine | AI agents lacking project context |

The steps are strictly sequential. Step 2 (Architecture) cannot begin until Step 1
(Ideation) outputs are verified because architecture decisions depend on product
requirements. Step 4 (Flow Tree) depends on Step 3 (UX Design) because screen
enumeration depends on user journey definitions. Every step builds on verified outputs
from the step before it.

Quality gates at each step boundary prevent the "we'll figure it out later" pattern.
An AI agent cannot proceed to the next step until the current step scores 80+/100 on
a structured verification rubric. This forces completeness at each stage rather than
accumulating technical debt from the start.

The methodology was designed specifically for AI-assisted development. Each step is a
self-contained prompt that guides an AI coding assistant through structured phases,
producing concrete artifacts. A human working alone would follow the same logical
sequence, but the step files are optimized for AI execution with human oversight.

---

## The Value Equation

Every product decision in the Sigma Protocol is filtered through Alex Hormozi's
Value Equation:

```
Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort & Sacrifice)
```

This is not decoration. The framework is embedded into the step files and applied at
every decision point:

**Maximizing Dream Outcome (Step 1: Ideation)**
Step 1 forces you to articulate exactly what the user's life looks like after using
your product. Not vague benefits ("save time") but specific, measurable outcomes
("from funded account to $10K/month passive income"). The ideation step demands that
you define personas with concrete goals, frustrations, and desired states. Weak value
propositions are rejected.

**Increasing Perceived Likelihood (Step 2: Architecture)**
A product that looks technically feasible to build is more valuable than one that
seems like vaporware. Step 2 proves feasibility by producing a complete system
architecture, database schema, API specification, and security model. When stakeholders
see the technical blueprint, confidence in delivery increases.

**Minimizing Time Delay (Steps 1-11: The Full Spec Package)**
The single largest source of delay in software projects is rework caused by
discovering missed requirements during implementation. By producing a complete
specification package before writing application code, the protocol eliminates
the feedback loops that cause projects to stall. The spec package includes: PRD,
architecture, UX design, screen inventory, wireframes, design system, interface
states, technical spec, and implementation-ready PRDs.

**Minimizing Effort (Ralph Loop: Autonomous Implementation)**
After the specification package is complete, the Ralph Loop converts PRDs into a
machine-executable backlog and spawns AI coding sessions to implement features
autonomously. Instead of manually translating requirements into code, you run a
single command and monitor progress. The protocol converts human effort into
machine effort.

The net effect: the protocol maximizes value by forcing clarity on what to build
(dream outcome), proving it can be built (perceived likelihood), eliminating rework
(time delay), and automating implementation (effort).

---

## Architecture of a Step

Every step file in the `steps/` directory follows a consistent internal architecture.
Understanding this structure is essential for extending the protocol or debugging
step execution.

### YAML Frontmatter

Each step begins with YAML frontmatter that declares metadata, allowed tools, and
parameters:

```yaml
---
version: "2.2.0"
last_updated: "2026-01-07"
description: "Step 1: Ideation - Interactive research-backed product requirements"
allowed-tools:
  - mcp_ref_ref_search_documentation
  - mcp_exa_web_search_exa
  - web_search
  - read_file
  - write
parameters:
  - --research-depth
---
```

The `allowed-tools` list controls which MCP tools and built-in tools the AI agent
can use during step execution. The `parameters` list defines optional flags that
modify step behavior.

### Mission Statement

Immediately after frontmatter, each step declares a mission with a persona and
valuation context:

```
Mission: Run a complete, interactive Step-1: Ideation for a startup project.
Valuation Context: You are a Founding Partner at a Top-Tier Venture Studio
evaluating this idea for a $100M Series A.
```

The persona is not flavor text. It calibrates the AI agent's quality threshold.
A "Principal Fellow at a FAANG Company" persona in Step 2 produces architecture
documents held to a different standard than a junior developer perspective would.

### Goal Block

The `<goal>` block provides the AI agent with an upfront execution map:

```xml
<goal>
You are the Venture Studio Partner. Execute ALL phases (A through E) in order.
CRITICAL: Do NOT skip any phase. Do NOT combine phases.

Phase Roadmap:
| Phase | Name                       | Key Output               |
|-------|----------------------------|--------------------------|
| A     | Discovery & Research       | User input + analysis    |
| B     | Technical Feasibility      | Data entities + stack    |
| C     | Specification Development  | MASTER_PRD.md draft      |
| D     | Iterative Refinement       | User-approved PRD        |
| E     | Output & Handoff           | Complete docs package    |

Quality gate: Score 80+/100
</goal>
```

The goal block serves as a contract. The AI agent knows the full phase sequence,
the expected output of each phase, and the quality threshold before it begins
execution. This prevents the agent from rushing to output or skipping intermediate
work.

### Frameworks Section

After the goal block, each step embeds domain-specific frameworks that the AI must
apply. Step 1 includes the Hormozi Value Equation and Grand Slam Offer frameworks.
Step 2 includes Clean Architecture, Evolutionary Architecture, and SOLID principles.
Step 11 includes Amazon PR/FAQ, BDD acceptance criteria, and 15 additional frameworks.

These frameworks are inlined directly in the step file rather than referenced
externally. This ensures the AI agent has the full framework context in its prompt
without needing to fetch additional files.

### Phases

The body of each step is organized into sequential phases (A, B, C, and so on).
Each phase contains:

- Specific instructions for what to produce
- Questions to ask the user (where applicable)
- Research directives (which tools to use, what to search for)
- Output format specifications

Phases must be executed in order. The step file explicitly states: "Do NOT skip any
phase. Do NOT combine phases."

### Checkpoint Markers

Between phases, checkpoint markers halt execution for human approval:

```
---
>>> CHECKPOINT: PHASE A.4 APPROVAL (Market Research & Gap Analysis) <<<

Present research findings and gap analysis to the user.
Do NOT continue to Phase B until the user explicitly approves.

Reply `approve research` or `pivot: [direction]` or `refine: [feedback]`.
---
```

Checkpoints are the human-in-the-loop mechanism. They exist at every point where
the AI agent has produced work that requires human judgment before proceeding.
A typical step has 3-6 checkpoints. This is quality control, not busywork -- each
checkpoint is placed at a decision boundary where human input materially affects
downstream outputs.

The `>>> CHECKPOINT` format uses a distinctive marker that triggers attention on
multiple AI platforms (Claude Code, Codex, Cursor). The triple-chevron prefix and
all-caps formatting ensure the marker is not overlooked during long execution runs.

### Verification Block

Every step ends with a `<verification>` block that defines a 100-point scoring
rubric across five dimensions:

```xml
<verification>
## Step 1 Verification Schema

### Required Files (20 points)
| File         | Path                          | Min Size | Points |
|--------------|-------------------------------|----------|--------|
| Master PRD   | /docs/specs/MASTER_PRD.md     | 5KB      | 6      |
| Stack Profile| /docs/stack-profile.json      | 200B     | 5      |

### Required Sections (30 points)
| Document       | Section                  | Points |
|----------------|--------------------------|--------|
| MASTER_PRD.md  | ## Executive Summary     | 4      |
| MASTER_PRD.md  | ## Problem Statement     | 4      |

### Content Quality (30 points)
| Check                              | Points |
|------------------------------------|--------|
| PRD has minimum 1500 words         | 8      |
| Competitor comparison table exists | 5      |

### Checkpoints (10 points)
| Checkpoint        | Evidence                    | Points |
|-------------------|-----------------------------|--------|
| Research Approved | market-analysis file exists  | 5      |

### Success Criteria (10 points)
| Criterion          | Check                        | Points |
|--------------------|------------------------------|--------|
| Problem Validated  | Market evidence in section   | 3      |
</verification>
```

The five scoring dimensions are consistent across all steps:

| Dimension | Points | What It Checks |
|-----------|--------|----------------|
| File Existence | 20 | Required output files exist and meet minimum size |
| Section Completeness | 30 | Required document sections are present |
| Content Quality | 30 | Tables, diagrams, code blocks, word counts |
| Checkpoints | 10 | Human-in-the-loop approvals were completed |
| Success Criteria | 10 | Step-specific business logic criteria |

A score of 80+/100 is required to proceed. Below 80, the step must be re-run or
gaps must be fixed before advancing.

---

## What Each Step Produces

Every step outputs specific files to canonical paths. These paths are the contract
between steps -- downstream steps read from the paths that upstream steps write to.

### Output Map

| Step | Name | Primary Output | Additional Outputs |
|------|------|----------------|-------------------|
| 0 | Environment Setup | Workspace validation | Folder structure |
| 1 | Ideation | `docs/specs/MASTER_PRD.md` | `docs/stack-profile.json`, `docs/specs/FEATURES.md`, `docs/specs/USP.md`, `docs/specs/NFRS.md` |
| 2 | Architecture | `docs/architecture/ARCHITECTURE.md` | `docs/database/SCHEMA.md`, `docs/api/API-SPEC.md`, `docs/security/SECURITY.md` |
| 3 | UX Design | `docs/ux/UX-DESIGN.md` | `docs/journeys/USER-JOURNEYS.md`, `docs/design/INSPIRATION.md` |
| 4 | Flow Tree | `docs/flows/FLOW-TREE.md` | `docs/flows/SCREEN-INVENTORY.md`, `docs/flows/FLOW-DIAGRAMS.md` |
| 5 | Wireframes | `docs/wireframes/WIREFRAME-SPEC.md` | `docs/wireframes/screenshots/*.png`, `docs/prds/flows/FLOW-*.md` |
| 6 | Design System | `docs/design/DESIGN-SYSTEM.md` | `docs/tokens/DESIGN-TOKENS.md` |
| 7 | Interface States | `docs/states/STATE-SPEC.md` | `docs/states/MICRO-INTERACTIONS.md` |
| 8 | Technical Spec | `docs/technical/TECHNICAL-SPEC.md` | |
| 9 | Landing Page | `docs/landing-page/LANDING-PAGE-COPY.md` | `docs/avatars/PROBLEM-AWARE-AVATAR.md` |
| 10 | Feature Breakdown | `docs/implementation/FEATURE-BREAKDOWN.md` | |
| 11 | PRD Generation | `docs/prds/F[N]-[FEATURE-NAME].md` | `docs/prds/.prd-status.json` |
| 12 | Context Engine | `.cursorrules`, `.cursor/rules/*.mdc` | Platform-specific configs |

### Dependency Graph

Steps consume outputs from previous steps. Here are the key dependencies:

```
Step 1 (Ideation)
  outputs: MASTER_PRD.md, stack-profile.json
      |
      v
Step 2 (Architecture)
  reads: MASTER_PRD.md, stack-profile.json
  outputs: ARCHITECTURE.md, SCHEMA.md, API-SPEC.md
      |
      v
Step 3 (UX Design)
  reads: MASTER_PRD.md, ARCHITECTURE.md
  outputs: UX-DESIGN.md, USER-JOURNEYS.md
      |
      v
Step 4 (Flow Tree)
  reads: UX-DESIGN.md, USER-JOURNEYS.md, MASTER_PRD.md
  outputs: FLOW-TREE.md, SCREEN-INVENTORY.md
      |
      v
Step 5 (Wireframes)
  reads: FLOW-TREE.md, SCREEN-INVENTORY.md, DESIGN inspiration
  outputs: WIREFRAME-SPEC.md, prototype PRDs
      |                          |
      v                          v  [Optional: Ralph Prototype Mode]
Step 6-9 (Design details)
      |
      v
Step 10 (Feature Breakdown)
  reads: ALL previous outputs
  outputs: FEATURE-BREAKDOWN.md (shaped projects)
      |
      v
Step 11 (PRD Generation)
  reads: FEATURE-BREAKDOWN.md + all specs
  outputs: docs/prds/F*.md     [Optional: Ralph Implementation Mode]
      |
      v
Step 12 (Context Engine)
  reads: ALL docs/
  outputs: Platform configurations
```

The file paths are canonical. If a step references a path not listed in the
file path reference, it is an error. This strict path contract ensures that
steps can be verified independently and that no step silently depends on
an undocumented file.

---

## Platform Support

The step files are platform-agnostic markdown documents. They work across multiple
AI coding tools because the instructions are written as structured prompts, not
tool-specific commands.

### How Steps Map to Platforms

**Goal blocks** provide the execution contract. Every AI platform that supports
structured prompts can parse the phase roadmap table and execute phases sequentially.

**Checkpoint markers** use a distinctive `>>> CHECKPOINT` format with triple-chevron
prefix and all-caps text. This format was chosen because it triggers attention
mechanisms across all major AI coding platforms -- the high-contrast formatting
prevents markers from being overlooked during long sessions.

**Verification blocks** define scoring rubrics as structured tables. Any platform
can implement verification by parsing the table and checking for file existence,
section presence, and content patterns.

### Platform-Specific Behavior

| Platform | Step Loading | Checkpoint Handling | Skill System |
|----------|-------------|-------------------|--------------|
| Claude Code | Steps loaded as prompts | Native HITL pause | `.claude/skills/*/SKILL.md` |
| Codex | Steps loaded via SKILL.md | Attention-based pause | `.codex/skills/*/SKILL.md` |
| Cursor | Steps loaded via rules | Rules-based integration | `.cursor/rules/*.mdc` |
| OpenCode | Steps loaded as prompts | Prompt-based pause | `.opencode/skill/*/SKILL.md` |

The step files themselves never reference platform-specific APIs or file formats.
Platform adaptation happens at the installation layer (Step 0 and Step 12), not
in the step content.

---

## Ralph Loop -- Autonomous Implementation

Ralph (Rapid Autonomous Loop for Product Handling) is the autonomous implementation
engine. After completing the planning phases, Ralph takes a structured backlog and
implements features without continuous human intervention.

### PRD to JSON Conversion

The bridge between planning and implementation is the `/prd-json` command, which
converts markdown PRDs into a structured JSON backlog:

```bash
# Convert implementation PRDs to JSON
claude "Run /prd-json --input docs/prds/ --output docs/ralph/implementation/prd.json"
```

The JSON schema includes fields that Ralph needs for autonomous execution:

```json
{
  "features": [
    {
      "id": "F01-auth",
      "priority": 1,
      "complexity": "medium",
      "dependencies": [],
      "acceptance_criteria": ["..."],
      "tasks": ["..."],
      "skill_requirements": ["auth", "database"]
    }
  ]
}
```

Each feature carries its priority, complexity rating, dependency list, acceptance
criteria, implementation tasks, and required skills. This is the contract that
Ralph executes against.

### The Ralph Loop

Once you have a `prd.json` backlog, Ralph executes a continuous loop:

```
./ralph/sigma-ralph.sh . docs/ralph/implementation/prd.json claude-code
```

The loop operates as follows:

1. **Read backlog** -- Parse `prd.json` and identify the highest-priority unblocked feature
2. **Check dependencies** -- Verify that all dependent features are marked complete
3. **Spawn session** -- Start a fresh AI coding session (new terminal or tmux pane)
4. **Inject context** -- Load the PRD, relevant skills, and project context into the session
5. **Monitor execution** -- Track task completion via the platform's task system
6. **Run quality gates** -- Execute tests, linting, and security checks
7. **Mark complete** -- Update `prd.json` status and auto-commit implemented code
8. **Loop** -- Return to step 1 and pick up the next feature

Each feature gets a fresh AI session. This prevents context pollution between features
and ensures that each implementation starts from a clean state with only the relevant
PRD and project context loaded.

### Two Entry Points

Ralph supports two modes corresponding to different points in the workflow:

| Mode | Entry Point | Input | Purpose |
|------|-------------|-------|---------|
| Prototype | After Step 5 | `docs/prds/flows/*.md` | Build clickable prototypes from wireframe PRDs |
| Implementation | After Step 11 | `docs/prds/F*.md` | Build production features from full PRDs |

Prototype mode uses the lightweight PRDs generated during wireframing (Step 5) to
build rapid prototypes for user testing. Implementation mode uses the comprehensive
PRDs from Step 11 to build production-ready features.

### Progress Tracking

Ralph tracks progress through multiple mechanisms:

- **Backlog status** in `prd.json` (pending, in-progress, complete, blocked)
- **Session logs** in `.ralph/logs/` for debugging
- **Progress reports** via `./ralph/generate-progress-report.sh`
- **Auto-commit** after each completed feature for git history

### Parallel Execution with Swarms

For projects with many independent features, Ralph supports parallel execution
through swarms. The `/prd-swarm` command analyzes the dependency graph and splits
the backlog into independent groups:

```bash
# Analyze dependencies and create 4 parallel swarms
claude "Run /prd-swarm --terminals 4 --visualize"

# Run each swarm in a separate terminal
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-1/prd.json claude-code &
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-2/prd.json claude-code &
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-3/prd.json claude-code &
./ralph/sigma-ralph.sh . docs/ralph/implementation/swarm-4/prd.json claude-code &
```

Swarms are groups of features with no cross-dependencies. Running four swarms
simultaneously can provide up to a 4x speedup on projects with sufficient
parallelism in their dependency graph.

---

## Multi-Agent Orchestration (Advanced)

For complex features, the Sigma Protocol supports multi-agent orchestration where
specialized AI agents collaborate on implementation.

### Swarm-First Philosophy

The core principle is: never work solo on complex tasks. When a feature touches
multiple domains (frontend, backend, database, security), a single AI agent
switching between concerns produces worse results than specialized agents working
in parallel with coordination.

### Agent Roles

Agent teams are composed of specialized roles, each with domain-specific skills
and tool access:

| Role | Responsibility | Key Skills |
|------|---------------|------------|
| Orchestrator | Task delegation, coordination | Planning, execution |
| Frontend | UI components, styling, interactions | Design system, React patterns |
| Backend | Server actions, API routes, business logic | API design, validation |
| Database | Schema, migrations, RLS policies | Data modeling |
| QA | Testing, verification, coverage | BDD, quality gates |
| Security | Auth, RLS, OWASP compliance | Threat modeling |
| Documentation | Docs, comments, README updates | Technical writing |
| Devil's Advocate | Adversarial post-implementation review | Verification |
| Gap Analyst | Requirements traceability, auto-fix | Gap analysis |

### Team Sizing

Team size scales with project complexity:

| PRD Complexity | Recommended Agents | Parallel Streams |
|----------------|-------------------|-----------------|
| Simple (1-3 features) | 5 agents | 2-3 |
| Medium (4-7 features) | 10 agents | 4-5 |
| Complex (8+ features) | 15-20 agents | 6-8 |

### Mandatory Review Agents

Every team, regardless of size, must include two mandatory review agents:

**Devil's Advocate** -- Runs an adversarial review after all implementation tasks
complete. Challenges assumptions, finds edge cases, and identifies potential
failures that the implementation agents may have missed.

**Gap Analyst** -- Runs after the Devil's Advocate. Performs requirements traceability
to verify that every acceptance criterion from the PRD has been implemented and
tested. Can auto-fix gaps when possible.

The execution order enforces this through task dependencies:

```
Implementation Task 1 --+
Implementation Task 2 --+--> Devil's Advocate --> Gap Analyst --> Done
Implementation Task N --+
```

No feature ships until both review agents approve.

### Task Flow

Within a multi-agent team, work flows through a dependency graph:

1. The orchestrator reads the PRD and creates tasks with explicit dependencies
2. Independent tasks (e.g., database schema and UI components) run in parallel
3. Dependent tasks (e.g., API routes that need the schema) wait for blockers
4. After all implementation tasks complete, review agents run sequentially
5. The orchestrator reviews reports and makes a ship/no-ship decision

---

## Extending the Protocol

The Sigma Protocol is designed to be customized for specific teams, industries,
and workflows.

### Adding Custom Steps

To add a new step, create a file in `steps/` that follows the standard architecture:

1. **YAML frontmatter** with version, description, allowed-tools, and parameters
2. **Mission statement** with persona and quality context
3. **Goal block** with phase roadmap table and quality gate threshold
4. **Frameworks section** with domain-specific reference material
5. **Phases A-N** with sequential execution and checkpoint markers
6. **Verification block** with 100-point scoring rubric

The step file should declare its dependencies (which previous step outputs it reads)
and its outputs (which files it creates). Register the step in the workflow by adding
its entry to the file path reference and workflow overview.

### Creating Project-Specific Skills

Skills are reusable knowledge modules that provide domain-specific context to AI
agents. To create a custom skill:

1. Create a directory under the platform's skill location (e.g., `.claude/skills/my-skill/`)
2. Add a `SKILL.md` file with the skill's knowledge, patterns, and instructions
3. Define auto-trigger keywords so the skill activates when relevant tasks are detected

Skills are injected into agent context when their trigger keywords match the current
task, providing specialized knowledge without polluting the base prompt.

### Modifying Quality Gate Thresholds

Each step's `<verification>` block defines the scoring rubric. To adjust thresholds:

- Change point allocations within the five dimensions (must still total 100)
- Adjust the minimum score required to proceed (default: 80/100)
- Add or remove required files, sections, or content quality checks
- Modify minimum file sizes or word count requirements

Changes to verification rubrics propagate immediately -- the next time the step is
run or verified, the new thresholds apply.

### Adding Platform Configurations

To add support for a new AI coding platform:

1. Define the platform's skill file format and location
2. Create an installer in Step 0 that sets up the platform directory structure
3. Add platform-specific output generation in Step 12 (Context Engine)
4. Test that checkpoint markers trigger attention on the new platform

The step files themselves require no changes. Platform adaptation is handled entirely
at the installation and context engine layers.

### Contributing

The protocol is open source at [github.com/dallionking/sigma-protocol](https://github.com/dallionking/sigma-protocol).
To contribute:

1. Fork the repository
2. Create a feature branch
3. Follow the step file architecture for any new steps or modifications
4. Submit a pull request with a description of what the change addresses
5. Include verification that existing steps still pass their quality gates

---

*For quick setup instructions, see [GETTING-STARTED.md](./GETTING-STARTED.md).
For the complete file path reference, see [FILE-PATH-REFERENCE.md](./FILE-PATH-REFERENCE.md).
For the workflow diagram, see [WORKFLOW-OVERVIEW.md](./WORKFLOW-OVERVIEW.md).*
