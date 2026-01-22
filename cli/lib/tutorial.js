#!/usr/bin/env node

/**
 * Sigma Protocol Interactive Tutorial
 *
 * Comprehensive curriculum for learning Sigma Protocol.
 * Covers all commands, workflows, and best practices.
 */

import chalk from "chalk";
import inquirer from "inquirer";
import boxen from "boxen";

// ============================================================================
// TUTORIAL CONTENT - Overview Section
// ============================================================================

const OVERVIEW_LESSONS = [
  {
    title: "What is Sigma Protocol?",
    content: `${chalk.cyan.bold("Welcome to Sigma Protocol!")}

Sigma Protocol is a ${chalk.yellow("13-step product development methodology")} 
designed for AI-assisted development.

${chalk.white.bold("Core Philosophy:")}

  ${chalk.green("•")} ${chalk.white("Structure")} — A clear path from idea to production
  ${chalk.green("•")} ${chalk.white("AI-Native")} — Built for AI coding assistants (Claude, Cursor, OpenCode)
  ${chalk.green("•")} ${chalk.white("Quality")} — HITL checkpoints ensure human oversight
  ${chalk.green("•")} ${chalk.white("Documentation")} — Living docs that evolve with your code

${chalk.white.bold("What Makes It Different:")}

Traditional development often leads to scope creep, lost context, and 
documentation that's always out of date. Sigma solves this by:

  ${chalk.yellow("1.")} Generating docs ${chalk.gray("before")} writing code
  ${chalk.yellow("2.")} Using PRDs as the ${chalk.gray("source of truth")}
  ${chalk.yellow("3.")} Letting AI handle routine tasks while you make decisions
  ${chalk.yellow("4.")} Keeping everything in sync automatically`,
  },
  {
    title: "The 13-Step Workflow",
    content: `${chalk.cyan.bold("The Sigma Workflow")}

${chalk.white.bold("Planning Phase (Steps 1-5):")}
  ${chalk.yellow("1.")} ${chalk.white("Ideation")}      — Define your product vision using Hormozi framework
  ${chalk.yellow("2.")} ${chalk.white("Architecture")}  — Design system structure, tech stack decisions
  ${chalk.yellow("3.")} ${chalk.white("UX Design")}     — Create user experience flows and personas
  ${chalk.yellow("4.")} ${chalk.white("Flow Tree")}     — Map navigation and state transitions
  ${chalk.yellow("5.")} ${chalk.white("Wireframes")}    — Visual prototypes and layouts

${chalk.white.bold("Design Phase (Steps 6-9):")}
  ${chalk.yellow("6.")} ${chalk.white("Design System")}    — Tokens, colors, typography, components
  ${chalk.yellow("7.")} ${chalk.white("Interface States")} — Loading, error, empty, success states
  ${chalk.yellow("8.")} ${chalk.white("Technical Spec")}   — API contracts, database schema, infra
  ${chalk.yellow("9.")} ${chalk.white("Landing Page")}     — Marketing site and conversion strategy

${chalk.white.bold("Implementation Phase (Steps 10-13):")}
  ${chalk.yellow("10.")} ${chalk.white("Feature Breakdown")} — Break into buildable units
  ${chalk.yellow("11.")} ${chalk.white("PRD Generation")}    — Detailed implementation specs
  ${chalk.yellow("12.")} ${chalk.white("Context Engine")}    — AI rules and coding patterns
  ${chalk.yellow("13.")} ${chalk.white("Skillpack")}         — Project-specific AI skills

${chalk.gray("You don't need all 13 steps for every project. Sigma adapts to your needs.")}`,
  },
  {
    title: "Who Is This For?",
    content: `${chalk.cyan.bold("Is Sigma Right for You?")}

${chalk.white.bold("Best Fit:")}
  ${chalk.green("★★★★★")} ${chalk.white("Solo founders building real products")}
         Structure prevents scope creep, parallel streams = shipping faster

  ${chalk.green("★★★★★")} ${chalk.white("Agencies & consultants")}
         Repeatable process, client handoffs built-in, quality gates

  ${chalk.green("★★★★☆")} ${chalk.white("Teams adopting AI")}
         Standardized workflow, everyone speaks the same language

  ${chalk.green("★★★★☆")} ${chalk.white("Senior engineers")}
         Already think this way; tooling accelerates their process

  ${chalk.green("★★★☆☆")} ${chalk.white("Junior devs")}
         Teaches good habits, but steep learning curve

  ${chalk.green("★★☆☆☆")} ${chalk.white("Weekend hackers")}
         Too heavy for quick experiments—just vibe code instead

${chalk.white.bold("Skip Sigma If:")}
  ${chalk.red("✗")} You're just prototyping (use after you validate the idea)
  ${chalk.red("✗")} The project is trivial (a landing page doesn't need 13 steps)
  ${chalk.red("✗")} You hate process (some people work better in chaos)

${chalk.white.bold("Use Sigma When:")}
  ${chalk.green("✓")} Quality matters (production code, not demos)
  ${chalk.green("✓")} You want to scale output (parallel agents)
  ${chalk.green("✓")} You're building something that matters`,
  },
  {
    title: "The Mental Model",
    content: `${chalk.cyan.bold("The Sigma Mental Model")}

${chalk.white.bold("Four Core Principles:")}

${chalk.yellow("1. Documentation Precedes Code")}
   PRDs aren't bureaucracy—they're ${chalk.green("executable specifications")}.
   When docs are right, implementation is straightforward.

${chalk.yellow("2. Verification is Non-Negotiable")}
   "It works on my machine" isn't a deliverable.
   Every feature gets verified against requirements.

${chalk.yellow("3. Parallelism is the Multiplier")}
   One engineer running 5 agents ${chalk.green("beats")} 5 engineers running 1 each.
   Thread-Based Engineering scales your output 5-10x.

${chalk.yellow("4. Structure Enables Speed")}
   Counterintuitively, constraints make you ${chalk.green("faster")}.
   The 13 steps front-load decisions so you don't revisit them.

${chalk.white.bold("The Investment Curve:")}
  ${chalk.gray(`
  Speed
    │     ╭──────── Sigma (after ramp-up)
    │    ╱
    │   ╱
    │  ╱   ╭──────── Vibe coding (stalls)
    │ ╱   ╱
    │╱   ╱
    ├───────────────────────────────
        Time`)}

${chalk.gray("Investment is front-loaded. Returns compound over time.")}`,
  },
  {
    title: "HITL Checkpoints",
    content: `${chalk.cyan.bold("Human-in-the-Loop (HITL)")}

Every Sigma step includes ${chalk.yellow("quality checkpoints")} where 
the AI pauses for your input.

${chalk.white.bold("Why HITL Matters:")}
  ${chalk.green("✓")} You stay in control of key decisions
  ${chalk.green("✓")} AI explains what it's doing and why
  ${chalk.green("✓")} You can redirect before going too far
  ${chalk.green("✓")} Quality gates prevent compounding errors

${chalk.white.bold("Example Checkpoint:")}
${chalk.gray(`┌─────────────────────────────────────────────────┐
│  HITL Checkpoint: Architecture Review           │
├─────────────────────────────────────────────────┤
│  Proposed: PostgreSQL with Prisma ORM           │
│  Reason: Type safety, excellent DX, scalable    │
│                                                 │
│  [1] Approve and continue                       │
│  [2] Modify selection                           │
│  [3] Request alternative analysis               │
└─────────────────────────────────────────────────┘`)}

${chalk.white.bold("Checkpoint Types:")}
  ${chalk.cyan("Decision")}   — Choose between options (tech stack, approach)
  ${chalk.cyan("Review")}     — Approve generated content (PRD, specs)
  ${chalk.cyan("Validation")} — Confirm understanding before proceeding`,
  },
  {
    title: "How Sigma Compares",
    content: `${chalk.cyan.bold("Sigma vs. Other Frameworks")}

${chalk.white.bold("The Competitive Landscape:")}

There are many AI development tools and frameworks. Here's how Sigma fits:

${chalk.yellow("GitHub Spec Kit")} ${chalk.gray("(Open-source toolkit)")}
  ${chalk.gray("•")} Scaffolds specs, plans, tasks as documents
  ${chalk.gray("•")} Works with any AI environment
  ${chalk.red("→")} ${chalk.white("Spec Kit generates documents; Sigma executes them")}

${chalk.yellow("AWS Kiro")} ${chalk.gray("(Proprietary IDE)")}
  ${chalk.gray("•")} Full IDE with spec-driven development
  ${chalk.gray("•")} Built-in agents, hooks, audit trails
  ${chalk.red("→")} ${chalk.white("Kiro is a closed IDE; Sigma is open and platform-agnostic")}

${chalk.yellow("BMAD Method")} ${chalk.gray("(Open-source framework)")}
  ${chalk.gray("•")} Multi-agent system architecture
  ${chalk.gray("•")} Similar human-in-the-loop philosophy
  ${chalk.red("→")} ${chalk.white("Sigma adds 13-step methodology + Ralph Loop")}

${chalk.yellow("Aider")} ${chalk.gray("(CLI pair programmer)")}
  ${chalk.gray("•")} Terminal-based chat + automatic git commits
  ${chalk.gray("•")} Great for quick coding tasks
  ${chalk.red("→")} ${chalk.white("Aider is tactical; Sigma is strategic")}

${chalk.white.bold("Sigma's Unique Advantages:")}
  ${chalk.green("✓")} End-to-end lifecycle (idea → production)
  ${chalk.green("✓")} Multi-agent orchestration (tmux, overmind, mprocs)
  ${chalk.green("✓")} Thread-Based Engineering (6+ thread types)
  ${chalk.green("✓")} Platform agnostic (Cursor, Claude Code, OpenCode)
  ${chalk.green("✓")} Ralph Loop for verified autonomous work

${chalk.gray("See: docs/FRAMEWORK-COMPARISON.md for full breakdown")}`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Quick Start Section
// ============================================================================

const QUICKSTART_LESSONS = [
  {
    title: "Installation",
    content: `${chalk.cyan.bold("Installing Sigma Protocol")}

${chalk.white.bold("Option 1: Global CLI (Recommended)")}
${chalk.gray(`  $ npm install -g sigma-protocol
  $ sigma              # Launch interactive menu`)}

${chalk.white.bold("Option 2: npx (No Install)")}
${chalk.gray(`  $ npx sigma-protocol`)}

${chalk.white.bold("Option 3: Project-Local")}
${chalk.gray(`  $ npm install --save-dev sigma-protocol
  $ npx sigma`)}

${chalk.white.bold("What Gets Installed:")}
  ${chalk.green("•")} ${chalk.white("sigma")} CLI command (like 'claude' for Claude Code)
  ${chalk.green("•")} Platform commands (.cursor/, .claude/, .opencode/)
  ${chalk.green("•")} JSON schemas for Ralph mode
  ${chalk.green("•")} Documentation templates

${chalk.white.bold("Verify Installation:")}
${chalk.gray(`  $ sigma doctor       # Health check
  $ sigma --version    # Version info`)}`,
  },
  {
    title: "Creating Your First Project",
    content: `${chalk.cyan.bold("Starting a New Project")}

${chalk.white.bold("Interactive Wizard:")}
${chalk.gray(`  $ sigma new
  
  This wizard helps you:
  • Choose a boilerplate (Next.js, Expo, TanStack, etc.)
  • Configure your stack
  • Install Sigma commands
  • Set up documentation structure`)}

${chalk.white.bold("Manual Setup:")}
${chalk.gray(`  $ mkdir my-project && cd my-project
  $ npm init -y
  $ npx sigma-protocol install`)}

${chalk.white.bold("What You Get:")}
  ${chalk.green("•")} ${chalk.white(".sigma/")} — Context, rules, orchestration config
  ${chalk.green("•")} ${chalk.white(".cursor/")} or ${chalk.white(".claude/")} — Platform-specific commands
  ${chalk.green("•")} ${chalk.white("docs/")} — Specs and PRDs directory
  ${chalk.green("•")} ${chalk.white(".sigma-manifest.json")} — Installation tracking

${chalk.white.bold("Next Step:")}
${chalk.gray(`  Open your project in an AI IDE and run:
  @step-1-ideation [your product idea]`)}`,
  },
  {
    title: "Running Your First Step",
    content: `${chalk.cyan.bold("Step 1: Ideation")}

Once Sigma is installed, open your project in Cursor, Claude Code, or OpenCode.

${chalk.white.bold("Start the workflow:")}
${chalk.gray(`  @step-1-ideation Create a task management app 
  that uses AI to prioritize tasks`)}

${chalk.white.bold("What Happens:")}
  ${chalk.yellow("1.")} AI asks clarifying questions about your idea
  ${chalk.yellow("2.")} Uses the ${chalk.white("Hormozi Value Equation")} for prioritization
  ${chalk.yellow("3.")} Generates ${chalk.white("MASTER_PRD.md")} in docs/specs/
  ${chalk.yellow("4.")} Creates HITL checkpoints for your review

${chalk.white.bold("The Hormozi Framework:")}
  Value = (Dream Outcome × Perceived Likelihood)
          ÷ (Time Delay × Effort/Sacrifice)

${chalk.white.bold("Output:")} docs/specs/MASTER_PRD.md

${chalk.white.bold("Pro Tips:")}
  ${chalk.yellow("→")} Be as detailed or vague as you want
  ${chalk.yellow("→")} AI will ask clarifying questions
  ${chalk.yellow("→")} Focus on the problem, not the solution`,
  },
  {
    title: "Continuing the Flow",
    content: `${chalk.cyan.bold("Moving Through Steps")}

Each step builds on the previous:
${chalk.gray(`  @step-2-architecture      # Uses MASTER_PRD.md
  @step-3-ux-design         # Uses ARCHITECTURE.md
  @step-4-flow-tree         # Uses UX-DESIGN.md
  ...and so on`)}

${chalk.white.bold("Finding Your Place:")}
${chalk.gray(`  @continue     # Finds your next unfinished task
  @status              # Shows overall project status
  @gap-analysis        # Checks implementation completeness`)}

${chalk.white.bold("Skipping Steps:")}
Not every project needs all 13 steps:
  ${chalk.green("•")} ${chalk.white("Quick prototype?")} — Skip to Step 10-11
  ${chalk.green("•")} ${chalk.white("Backend API only?")} — Skip Steps 3-5 (UX/Design)
  ${chalk.green("•")} ${chalk.white("Adding features?")} — Start at Step 10

${chalk.white.bold("Key Commands:")}
  ${chalk.cyan("@continue")}    — Find next task
  ${chalk.cyan("@gap-analysis")}      — Verify completeness
  ${chalk.cyan("@verify-prd")}        — Score PRD against code`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Steps Deep Dive
// ============================================================================

const STEPS_LESSONS = [
  {
    title: "Planning Phase Overview",
    content: `${chalk.cyan.bold("Planning Phase (Steps 1-5)")}

The planning phase transforms a raw idea into a clear vision.

${chalk.white.bold("Goal:")} Define WHAT you're building and WHY

${chalk.white.bold("Steps in This Phase:")}
  ${chalk.yellow("Step 1")} — ${chalk.white("Ideation")} — Product vision, value proposition
  ${chalk.yellow("Step 2")} — ${chalk.white("Architecture")} — System design, tech decisions
  ${chalk.yellow("Step 3")} — ${chalk.white("UX Design")} — User journeys, personas
  ${chalk.yellow("Step 4")} — ${chalk.white("Flow Tree")} — Navigation, state machine
  ${chalk.yellow("Step 5")} — ${chalk.white("Wireframes")} — Visual prototypes

${chalk.white.bold("Outputs:")}
  ${chalk.green("•")} MASTER_PRD.md — Your product's north star
  ${chalk.green("•")} ARCHITECTURE.md — Technical decisions
  ${chalk.green("•")} UX-DESIGN.md — User experience strategy
  ${chalk.green("•")} FLOW-TREE.md — Navigation blueprint
  ${chalk.green("•")} WIREFRAMES.md — Visual specs

${chalk.white.bold("Time Investment:")} 2-4 hours for a new product
${chalk.gray("This phase prevents weeks of wasted development later.")}`,
  },
  {
    title: "Step 1: Ideation",
    content: `${chalk.cyan.bold("@step-1-ideation")}

${chalk.white.bold("What it does:")}
Transforms your raw idea into a structured product vision using 
Alex Hormozi's value equation framework.

${chalk.white.bold("When to use:")}
  ${chalk.green("•")} Starting a brand new product
  ${chalk.green("•")} Pivoting an existing idea
  ${chalk.green("•")} Clarifying a vague concept

${chalk.white.bold("How to use:")}
${chalk.gray(`  @step-1-ideation Create an AI-powered code review tool
  @step-1-ideation [paste your rough notes here]
  @step-1-ideation --continue  # Resume interrupted session`)}

${chalk.white.bold("The Process:")}
  ${chalk.yellow("1.")} AI asks about your target market
  ${chalk.yellow("2.")} Explores pain points and dreams
  ${chalk.yellow("3.")} Applies Hormozi Value Equation
  ${chalk.yellow("4.")} Generates prioritized feature list
  ${chalk.yellow("5.")} Creates HITL checkpoint for review

${chalk.white.bold("Output:")} ${chalk.cyan("docs/specs/MASTER_PRD.md")}

${chalk.white.bold("Tips:")}
  ${chalk.yellow("→")} Don't overthink your initial input
  ${chalk.yellow("→")} Let the AI guide you with questions
  ${chalk.yellow("→")} Be honest about your target users`,
  },
  {
    title: "Step 2: Architecture",
    content: `${chalk.cyan.bold("@step-2-architecture")}

${chalk.white.bold("What it does:")}
Designs your system architecture based on the MASTER_PRD.
Makes technology decisions with justification.

${chalk.white.bold("When to use:")}
  ${chalk.green("•")} After completing Step 1
  ${chalk.green("•")} When re-evaluating tech stack
  ${chalk.green("•")} Before major infrastructure changes

${chalk.white.bold("How to use:")}
${chalk.gray(`  @step-2-architecture              # Uses existing MASTER_PRD
  @step-2-architecture --stack=serverless
  @step-2-architecture --constraint="must use PostgreSQL"`)}

${chalk.white.bold("Decisions Made:")}
  ${chalk.green("•")} Frontend framework (Next.js, Expo, etc.)
  ${chalk.green("•")} Backend approach (API, serverless, edge)
  ${chalk.green("•")} Database selection with reasoning
  ${chalk.green("•")} Authentication strategy
  ${chalk.green("•")} Hosting and deployment

${chalk.white.bold("Output:")} ${chalk.cyan("docs/specs/ARCHITECTURE.md")}

${chalk.white.bold("HITL Checkpoint:")}
You'll review and approve each major decision before AI continues.`,
  },
  {
    title: "Steps 3-5: UX, Flow, Wireframes",
    content: `${chalk.cyan.bold("Steps 3-5: User Experience Design")}

${chalk.white.bold("Step 3: @step-3-ux-design")}
  Creates user personas, journey maps, and experience principles.
  ${chalk.gray("Output: docs/specs/UX-DESIGN.md")}

${chalk.white.bold("Step 4: @step-4-flow-tree")}
  Maps navigation structure and state transitions.
  ${chalk.gray("Output: docs/specs/FLOW-TREE.md")}
  ${chalk.gray(`
  Home → Dashboard → Project
           ↓
       Settings → Profile
                   ↓
               Billing`)}

${chalk.white.bold("Step 5: @step-5-wireframe-prototypes")}
  Generates ASCII/text wireframes for key screens.
  ${chalk.gray("Output: docs/specs/WIREFRAMES.md")}

${chalk.white.bold("When to Skip:")}
  ${chalk.yellow("•")} Backend-only APIs (no UI)
  ${chalk.yellow("•")} CLI tools
  ${chalk.yellow("•")} Rapid prototypes (do minimal wireframes)

${chalk.white.bold("Pro Tip:")}
These steps are especially valuable when working with designers
or stakeholders who need to visualize before coding.`,
  },
  {
    title: "Design Phase Overview",
    content: `${chalk.cyan.bold("Design Phase (Steps 6-9)")}

The design phase bridges planning and implementation.

${chalk.white.bold("Goal:")} Define HOW it will look and work

${chalk.white.bold("Steps in This Phase:")}
  ${chalk.yellow("Step 6")} — ${chalk.white("Design System")} — Visual language, components
  ${chalk.yellow("Step 7")} — ${chalk.white("Interface States")} — Loading, error, empty
  ${chalk.yellow("Step 8")} — ${chalk.white("Technical Spec")} — API, database, contracts
  ${chalk.yellow("Step 9")} — ${chalk.white("Landing Page")} — Marketing, conversion

${chalk.white.bold("Outputs:")}
  ${chalk.green("•")} DESIGN-SYSTEM.md — Tokens, components
  ${chalk.green("•")} INTERFACE-STATES.md — State handling
  ${chalk.green("•")} TECHNICAL-SPEC.md — API contracts
  ${chalk.green("•")} LANDING-PAGE.md — Marketing copy

${chalk.white.bold("Why This Phase Matters:")}
  ${chalk.gray("• Ensures consistency across the product")}
  ${chalk.gray("• Defines contracts before implementation")}
  ${chalk.gray("• Handles edge cases proactively")}`,
  },
  {
    title: "Steps 6-9: Design Details",
    content: `${chalk.cyan.bold("Steps 6-9: Design Implementation")}

${chalk.white.bold("Step 6: @step-6-design-system")}
  Creates design tokens, color palette, typography, spacing.
  ${chalk.gray("• CSS variables / Tailwind config")}
  ${chalk.gray("• Component specifications")}
  ${chalk.gray("• Accessibility guidelines")}

${chalk.white.bold("Step 7: @step-7-interface-states")}
  Defines all interface states:
  ${chalk.gray("• Loading states (skeleton, spinner)")}
  ${chalk.gray("• Error states (validation, server)")}
  ${chalk.gray("• Empty states (no data, first use)")}
  ${chalk.gray("• Success states (confirmation)")}

${chalk.white.bold("Step 8: @step-8-technical-spec")}
  Creates technical contracts:
  ${chalk.gray("• API endpoint specifications")}
  ${chalk.gray("• Database schema (Prisma, SQL)")}
  ${chalk.gray("• Authentication flows")}
  ${chalk.gray("• Infrastructure requirements")}

${chalk.white.bold("Step 9: @step-9-landing-page")}
  Generates marketing and conversion:
  ${chalk.gray("• Hero copy and CTAs")}
  ${chalk.gray("• Feature highlights")}
  ${chalk.gray("• Social proof sections")}`,
  },
  {
    title: "Implementation Phase",
    content: `${chalk.cyan.bold("Implementation Phase (Steps 10-13)")}

Where planning becomes code.

${chalk.white.bold("Goal:")} Build the product systematically

${chalk.white.bold("Steps in This Phase:")}
  ${chalk.yellow("Step 10")} — ${chalk.white("Feature Breakdown")} — Decompose into units
  ${chalk.yellow("Step 11")} — ${chalk.white("PRD Generation")} — Detailed specs
  ${chalk.yellow("Step 12")} — ${chalk.white("Context Engine")} — AI rules
  ${chalk.yellow("Step 13")} — ${chalk.white("Skillpack")} — Custom skills

${chalk.white.bold("The PRD Workflow:")}
  ${chalk.gray(`MASTER_PRD → Feature Breakdown → Individual PRDs
                    ↓
              Implementation via @implement-prd
                    ↓
              @gap-analysis verification`)}

${chalk.white.bold("Key Insight:")}
Instead of writing all code at once, Sigma breaks it into 
manageable PRDs that can be implemented and verified individually.`,
  },
  {
    title: "Steps 10-11: PRD Generation",
    content: `${chalk.cyan.bold("Steps 10-11: From Features to PRDs")}

${chalk.white.bold("Step 10: @step-10-feature-breakdown")}
  Decomposes MASTER_PRD into buildable units.
${chalk.gray(`  @step-10-feature-breakdown
  @step-10-feature-breakdown --feature="user authentication"`)}

  Creates dependency graph showing build order.

${chalk.white.bold("Step 11: @step-11-prd-generation")}
  Generates detailed PRDs for each feature.
${chalk.gray(`  @step-11-prd-generation
  @step-11-prd-generation --feature=auth
  @step-11-prd-generation --all`)}

${chalk.white.bold("PRD Contents:")}
  ${chalk.green("•")} Objective and scope
  ${chalk.green("•")} Technical requirements
  ${chalk.green("•")} Acceptance criteria
  ${chalk.green("•")} Edge cases
  ${chalk.green("•")} Test scenarios

${chalk.white.bold("Output:")} ${chalk.cyan("docs/prds/<feature-name>.md")}

${chalk.white.bold("Pro Tip:")}
Run ${chalk.cyan("@step-11b-prd-swarm")} to set up multi-agent
orchestration for parallel PRD implementation.`,
  },
  {
    title: "Steps 12-13: AI Context",
    content: `${chalk.cyan.bold("Steps 12-13: AI Configuration")}

${chalk.white.bold("Step 12: @step-12-context-engine")}
  Creates AI rules and coding patterns for your project.
${chalk.gray(`  @step-12-context-engine`)}

${chalk.white.bold("What It Generates:")}
  ${chalk.green("•")} Coding conventions (.cursor/rules/)
  ${chalk.green("•")} Project-specific patterns
  ${chalk.green("•")} Error handling standards
  ${chalk.green("•")} Testing requirements

${chalk.white.bold("Step 13: @step-13-skillpack-generator")}
  Creates custom AI skills for your project.
${chalk.gray(`  @step-13-skillpack-generator`)}

${chalk.white.bold("Skillpack Includes:")}
  ${chalk.green("•")} Project-aware commands
  ${chalk.green("•")} Common task automation
  ${chalk.green("•")} Domain-specific knowledge
  ${chalk.green("•")} Integration patterns

${chalk.white.bold("Why This Matters:")}
Steps 12-13 teach the AI about YOUR project specifically,
making future interactions faster and more accurate.`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Audit Commands
// ============================================================================

const AUDIT_LESSONS = [
  {
    title: "Audit Overview",
    content: `${chalk.cyan.bold("Audit Commands")}

Audit commands verify quality, security, and completeness.

${chalk.white.bold("When to Audit:")}
  ${chalk.green("•")} After implementing a PRD
  ${chalk.green("•")} Before merging to main
  ${chalk.green("•")} During code review
  ${chalk.green("•")} Before deployment
  ${chalk.green("•")} Periodically (weekly/sprint)

${chalk.white.bold("Available Audits:")}
  ${chalk.cyan("@gap-analysis")}          — PRD coverage verification
  ${chalk.cyan("@security-audit")}        — Vulnerability scanning
  ${chalk.cyan("@accessibility-audit")}   — WCAG compliance
  ${chalk.cyan("@performance-check")}     — Speed analysis
  ${chalk.cyan("@code-quality-report")}   — Metrics and smells
  ${chalk.cyan("@tech-debt-audit")}       — Debt assessment
  ${chalk.cyan("@simplify")}        — Code simplification

${chalk.white.bold("Audit Philosophy:")}
Audits are ${chalk.yellow("non-destructive")} — they report issues but don't 
automatically change code. You decide what to fix.`,
  },
  {
    title: "@gap-analysis",
    content: `${chalk.cyan.bold("@gap-analysis — PRD Coverage Verification")}

${chalk.white.bold("What it does:")}
Compares your PRD requirements against actual implementation
to find missing features, incomplete code, or drift.

${chalk.white.bold("When to use:")}
  ${chalk.green("•")} After implementing a PRD
  ${chalk.green("•")} Before marking a feature complete
  ${chalk.green("•")} During code review
  ${chalk.green("•")} After major refactoring

${chalk.white.bold("How to use:")}
${chalk.gray(`  @gap-analysis                           # All PRDs
  @gap-analysis --prd=docs/prds/auth.md   # Specific PRD
  @gap-analysis --quick                   # Fast mode`)}

${chalk.white.bold("Output:")}
  ${chalk.green("•")} Confidence score (0-100%)
  ${chalk.green("•")} List of gaps found
  ${chalk.green("•")} Suggested fixes
  ${chalk.green("•")} Artifact in .sigma/confidence/

${chalk.white.bold("Tips:")}
  ${chalk.yellow("→")} Aim for 90%+ confidence before shipping
  ${chalk.yellow("→")} Run after every PRD implementation
  ${chalk.yellow("→")} Use ${chalk.cyan("--fix")} to generate fix tasks`,
  },
  {
    title: "@security-audit",
    content: `${chalk.cyan.bold("@security-audit — Vulnerability Scanning")}

${chalk.white.bold("What it does:")}
Scans your codebase for security vulnerabilities, bad practices,
and potential attack vectors.

${chalk.white.bold("When to use:")}
  ${chalk.green("•")} Before deploying to production
  ${chalk.green("•")} After adding authentication
  ${chalk.green("•")} When handling user data
  ${chalk.green("•")} During security review

${chalk.white.bold("How to use:")}
${chalk.gray(`  @security-audit
  @security-audit --scope=auth
  @security-audit --severity=high`)}

${chalk.white.bold("Checks Performed:")}
  ${chalk.green("•")} Hardcoded secrets/API keys
  ${chalk.green("•")} SQL injection vulnerabilities
  ${chalk.green("•")} XSS attack vectors
  ${chalk.green("•")} CSRF protection
  ${chalk.green("•")} Authentication flaws
  ${chalk.green("•")} Dependency vulnerabilities

${chalk.white.bold("Output:")} Security report with severity levels`,
  },
  {
    title: "@accessibility-audit",
    content: `${chalk.cyan.bold("@accessibility-audit — WCAG Compliance")}

${chalk.white.bold("What it does:")}
Checks your UI for accessibility issues based on WCAG guidelines.

${chalk.white.bold("When to use:")}
  ${chalk.green("•")} After building UI components
  ${chalk.green("•")} Before launching to public
  ${chalk.green("•")} When fixing reported a11y issues

${chalk.white.bold("How to use:")}
${chalk.gray(`  @accessibility-audit
  @accessibility-audit --level=AA
  @accessibility-audit --component=Button`)}

${chalk.white.bold("Checks Performed:")}
  ${chalk.green("•")} Color contrast ratios
  ${chalk.green("•")} Keyboard navigation
  ${chalk.green("•")} Screen reader compatibility
  ${chalk.green("•")} ARIA labels and roles
  ${chalk.green("•")} Focus management
  ${chalk.green("•")} Alt text for images

${chalk.white.bold("WCAG Levels:")}
  ${chalk.gray("A")}   — Minimum (essential)
  ${chalk.gray("AA")}  — Standard (recommended)
  ${chalk.gray("AAA")} — Enhanced (best)`,
  },
  {
    title: "@simplify",
    content: `${chalk.cyan.bold("@simplify — Code Simplification")}

${chalk.white.bold("What it does:")}
Analyzes code for complexity and suggests simplifications
without changing functionality.

${chalk.white.bold("When to use:")}
  ${chalk.green("•")} Code feels too complex
  ${chalk.green("•")} After rapid prototyping
  ${chalk.green("•")} During refactoring sprints
  ${chalk.green("•")} Tech debt reduction

${chalk.white.bold("How to use:")}
${chalk.gray(`  @simplify --scope=recent        # Recent changes
  @simplify --scope=file --file=src/utils.ts
  @simplify --depth=deep          # Thorough analysis`)}

${chalk.white.bold("What It Finds:")}
  ${chalk.green("•")} Nested ternaries and conditionals
  ${chalk.green("•")} Long functions (>50 lines)
  ${chalk.green("•")} Duplicate code patterns
  ${chalk.green("•")} Unused imports/variables
  ${chalk.green("•")} Complex expressions

${chalk.white.bold("Modes:")}
  ${chalk.cyan("--depth=quick")}    — Fast surface scan
  ${chalk.cyan("--depth=standard")} — Normal analysis
  ${chalk.cyan("--depth=deep")}     — Thorough review`,
  },
  {
    title: "Other Audits",
    content: `${chalk.cyan.bold("Additional Audit Commands")}

${chalk.white.bold("@performance-check")}
  Analyzes code for performance issues.
${chalk.gray(`  • Bundle size analysis
  • Render performance
  • Database query efficiency
  • Memory leaks`)}

${chalk.white.bold("@code-quality-report")}
  Generates code quality metrics.
${chalk.gray(`  • Cyclomatic complexity
  • Code coverage
  • Duplication percentage
  • Maintainability index`)}

${chalk.white.bold("@tech-debt-audit")}
  Identifies and prioritizes technical debt.
${chalk.gray(`  • TODOs and FIXMEs
  • Deprecated dependencies
  • Outdated patterns
  • Refactoring opportunities`)}

${chalk.white.bold("@license-check")}
  Verifies dependency license compliance.
${chalk.gray(`  • License compatibility
  • Attribution requirements
  • Commercial use restrictions`)}`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Ops Commands
// ============================================================================

const OPS_LESSONS = [
  {
    title: "Ops Overview",
    content: `${chalk.cyan.bold("Operations Commands")}

Ops commands help with daily development workflow.

${chalk.white.bold("Daily Workflow Commands:")}
  ${chalk.cyan("@status")}              — Project overview
  ${chalk.cyan("@continue")}      — Find next task (Ralph)
  ${chalk.cyan("@maid")}                — Repository maintenance

${chalk.white.bold("Sprint Commands:")}
  ${chalk.cyan("@sprint-plan")}         — Plan sprint tasks
  ${chalk.cyan("@backlog-groom")}       — Groom the backlog
  ${chalk.cyan("@daily-standup")}       — Daily standup summary

${chalk.white.bold("Review Commands:")}
  ${chalk.cyan("@pr-review")}           — Pull request review
  ${chalk.cyan("@release-review")}      — Release checklist

${chalk.white.bold("Maintenance Commands:")}
  ${chalk.cyan("@dependency-update")}   — Update dependencies
  ${chalk.cyan("@maid")}                — Cleanup repository

${chalk.white.bold("Retrofit Commands:")}
  ${chalk.cyan("@retrofit-analyze")}    — Analyze existing code
  ${chalk.cyan("@retrofit-generate")}   — Generate missing docs
  ${chalk.cyan("@retrofit-enhance")}    — Enhance existing docs`,
  },
  {
    title: "@status and @continue",
    content: `${chalk.cyan.bold("@status — Project Overview")}

${chalk.white.bold("What it does:")}
Shows current project status, active PRDs, and progress.

${chalk.gray(`  @status
  @status --detailed`)}

${chalk.white.bold("Shows:")}
  ${chalk.green("•")} Active PRDs and their status
  ${chalk.green("•")} Completed vs pending tasks
  ${chalk.green("•")} Recent activity
  ${chalk.green("•")} Blockers

---

${chalk.cyan.bold("@continue — Find Next Task")}

${chalk.white.bold("What it does:")}
Analyzes your project and finds the next logical task to work on.
This is the Ralph loop's core command.

${chalk.gray(`  @continue                    # Auto-detect
  @continue --prd=auth.md      # Specific PRD`)}

${chalk.white.bold("How it works:")}
  ${chalk.yellow("1.")} Reads active PRD
  ${chalk.yellow("2.")} Checks implementation status
  ${chalk.yellow("3.")} Identifies next incomplete task
  ${chalk.yellow("4.")} Provides context and starts work

${chalk.white.bold("Pro Tip:")} Run this at the start of each session.`,
  },
  {
    title: "@maid — Repository Maintenance",
    content: `${chalk.cyan.bold("@maid — Repository Maintenance")}

${chalk.white.bold("What it does:")}
Intelligent repository cleanup with content-aware analysis.
Finds cruft, organizes files, and simplifies code.

${chalk.white.bold("Modes:")}
${chalk.gray(`  @maid                    # Interactive menu
  @maid --analyze          # Deep analysis
  @maid --cleanup          # File cleanup
  @maid --simplify         # Code simplification
  @maid --all              # Full maintenance`)}

${chalk.white.bold("What It Does:")}
  ${chalk.green("•")} Creates Git backup tag for safety
  ${chalk.green("•")} Detects forgotten git worktrees
  ${chalk.green("•")} Reads file contents to understand purpose
  ${chalk.green("•")} Validates cross-references
  ${chalk.green("•")} Categorizes files for review/deletion

${chalk.white.bold("Safety Features:")}
  ${chalk.yellow("•")} Never auto-deletes — moves to .deleted/
  ${chalk.yellow("•")} Creates backup before changes
  ${chalk.yellow("•")} Human review before permanent deletion

${chalk.white.bold("Best Practice:")} Run @maid weekly or after sprints.`,
  },
  {
    title: "Sprint & Review Commands",
    content: `${chalk.cyan.bold("Sprint & Review Commands")}

${chalk.white.bold("@sprint-plan")}
  Creates sprint plan from backlog and PRDs.
${chalk.gray(`  @sprint-plan --duration=2weeks
  @sprint-plan --velocity=30`)}

${chalk.white.bold("@backlog-groom")}
  Reviews and prioritizes backlog items.
${chalk.gray(`  @backlog-groom
  @backlog-groom --tag=tech-debt`)}

${chalk.white.bold("@daily-standup")}
  Generates standup summary from recent commits/PRDs.
${chalk.gray(`  @daily-standup`)}

---

${chalk.white.bold("@pr-review")}
  Reviews a pull request for quality, tests, docs.
${chalk.gray(`  @pr-review
  @pr-review --strict`)}

${chalk.white.bold("@release-review")}
  Pre-release checklist and verification.
${chalk.gray(`  @release-review --version=1.0.0
  @release-review --type=major`)}`,
  },
  {
    title: "Retrofit Commands",
    content: `${chalk.cyan.bold("Retrofit Commands")}

For adding Sigma to existing projects.

${chalk.white.bold("@retrofit-analyze")}
  Scans existing codebase to understand structure.
${chalk.gray(`  @retrofit-analyze`)}

${chalk.white.bold("What it detects:")}
  ${chalk.green("•")} Tech stack (framework, database, auth)
  ${chalk.green("•")} Existing patterns and conventions
  ${chalk.green("•")} Test coverage
  ${chalk.green("•")} Documentation gaps

---

${chalk.white.bold("@retrofit-generate")}
  Creates Sigma docs from existing code.
${chalk.gray(`  @retrofit-generate
  @retrofit-generate --priority=high`)}

---

${chalk.white.bold("@retrofit-enhance")}
  Improves existing documentation.
${chalk.gray(`  @retrofit-enhance --doc=ARCHITECTURE.md`)}

---

${chalk.white.bold("Retrofit Workflow:")}
  ${chalk.yellow("1.")} Run ${chalk.cyan("sigma retrofit")} or ${chalk.cyan("@retrofit-analyze")}
  ${chalk.yellow("2.")} Review detected patterns
  ${chalk.yellow("3.")} Generate missing docs
  ${chalk.yellow("4.")} Run ${chalk.cyan("@gap-analysis")} to verify`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Orchestration
// ============================================================================

const ORCHESTRATION_LESSONS = [
  {
    title: "What is Orchestration?",
    content: `${chalk.cyan.bold("Multi-Agent Orchestration")}

For larger projects, Sigma supports ${chalk.yellow("parallel development")}
using multiple AI agents working simultaneously.

${chalk.white.bold("The Concept:")}
  ${chalk.green("•")} ${chalk.white("Orchestrator")} — Manages the overall workflow
  ${chalk.green("•")} ${chalk.white("Stream Workers")} — Individual AI agents on tasks
  ${chalk.green("•")} ${chalk.white("Message Bus")} — Communication between agents
  ${chalk.green("•")} ${chalk.white("Health Monitor")} — Detects and recovers crashes

${chalk.white.bold("When to Use:")}
  ${chalk.green("✓")} Multiple PRDs to implement
  ${chalk.green("✓")} Independent features that can parallelize
  ${chalk.green("✓")} Large refactoring projects
  ${chalk.yellow("✗")} Small projects (overhead not worth it)

${chalk.white.bold("How It Works:")}
${chalk.gray(`  You have 5 PRDs to implement.
  
  Instead of: PRD1 → PRD2 → PRD3 → PRD4 → PRD5 (serial)
  
  Orchestration: PRD1, PRD2, PRD3, PRD4, PRD5 (parallel)
                  ↓     ↓     ↓     ↓     ↓
              Stream A  B     C     D     E`)}`,
  },
  {
    title: "Dynamic Stream Detection",
    content: `${chalk.cyan.bold("Auto-Detecting Stream Count")}

Sigma ${chalk.yellow("automatically detects")} how many streams you need
based on your PRDs and their dependencies.

${chalk.white.bold("Detection Sources (in order):")}
  ${chalk.green("1.")} ${chalk.white(".sigma/orchestration/streams.json")} — Existing config
  ${chalk.green("2.")} ${chalk.white(".sigma/orchestration/prds/*.md")} — PRD files
  ${chalk.green("3.")} ${chalk.white("docs/prds/*.md")} — Documentation PRDs
  ${chalk.green("4.")} ${chalk.white("docs/ralph/*/prd.json")} — Ralph PRD directories

${chalk.white.bold("Example:")}
${chalk.gray(`  # If you have 6 PRDs in docs/prds/
  sigma orchestrate
  # → Auto-detected 6 streams from project PRDs
  
  # Override with specific count:
  sigma orchestrate --streams=4`)}

${chalk.white.bold("Max Streams:")}
  Maximum: ${chalk.yellow("8")} streams (to prevent resource exhaustion)
  
${chalk.white.bold("Dependency-Based Grouping:")}
  PRDs with dependencies are grouped into the same stream
  to ensure proper execution order.`,
  },
  {
    title: "Choosing Your AI Agent",
    content: `${chalk.cyan.bold("AI Agent Selection")}

When spawning streams, you can choose which AI coding agent to use.

${chalk.white.bold("Available Agents:")}
  ${chalk.yellow("claude")}    — Claude Code (Anthropic's AI IDE)
  ${chalk.yellow("opencode")} — OpenCode (open-source AI dev env)
  ${chalk.yellow("manual")}   — No auto-launch (use any agent)

${chalk.white.bold("Usage:")}
${chalk.gray(`  # Interactive prompt (default):
  sigma orchestrate
  # → "Which AI coding agent will you use?"
  
  # Specify directly:
  sigma orchestrate --agent=claude
  sigma orchestrate --agent=opencode
  sigma orchestrate --agent=manual`)}

${chalk.white.bold("Auto-Detection:")}
  If you don't specify, Sigma auto-detects:
  1. Claude Code (if installed)
  2. OpenCode (if installed)
  3. Manual mode (fallback)

${chalk.white.bold("Manual Mode:")}
  Use manual mode if you want to use:
  ${chalk.gray("•")} Cursor IDE
  ${chalk.gray("•")} VS Code with AI extensions
  ${chalk.gray("•")} Any other AI coding tool`,
  },
  {
    title: "Three TUI Modes",
    content: `${chalk.cyan.bold("Choose Your Interface")}

Sigma offers ${chalk.yellow("three TUI modes")} for orchestration:

${chalk.white.bold("1. mprocs TUI (Recommended)")}
${chalk.gray(`  sigma orchestrate --tui mprocs
  # or just: sigma orchestrate (interactive prompt)
  
  • Beautiful sidebar with process list
  • Keyboard navigation (j/k, arrows)
  • Start/stop/restart processes
  • Copy mode for output
  • Remote control support`)}

${chalk.white.bold("2. Overmind TUI")}
${chalk.gray(`  sigma orchestrate --tui overmind
  
  • Procfile-based process management
  • Similar sidebar interface
  • Good for Foreman users`)}

${chalk.white.bold("3. Standard tmux Mode")}
${chalk.gray(`  sigma orchestrate --tui tmux
  
  • Traditional tmux panes
  • Ctrl+B navigation
  • Good for tmux power users`)}

${chalk.white.bold("Install TUI Tools:")}
${chalk.gray(`  brew install mprocs    # Recommended
  brew install overmind  # Alternative
  brew install tmux      # Required for tmux/overmind`)}

${chalk.white.bold("mprocs Keyboard Shortcuts:")}
  ${chalk.green("q")}   — Quit gracefully
  ${chalk.green("j/k")} — Navigate processes
  ${chalk.green("s")}   — Start process
  ${chalk.green("x")}   — Stop process
  ${chalk.green("r")}   — Restart process
  ${chalk.green("z")}   — Zoom into terminal
  ${chalk.green("Ctrl+A")} — Toggle sidebar/terminal`,
  },
  {
    title: "Setting Up tmux",
    content: `${chalk.cyan.bold("tmux: Your Agent Workspace")}

Both modes use ${chalk.yellow("tmux")} under the hood.

${chalk.white.bold("Install tmux:")}
${chalk.gray(`  # macOS
  brew install tmux
  
  # Ubuntu/Debian
  sudo apt install tmux
  
  # Windows (WSL)
  sudo apt install tmux`)}

${chalk.white.bold("Basic tmux Commands:")}
  ${chalk.cyan("Ctrl+B then D")}     — Detach from session
  ${chalk.cyan("Ctrl+B then [")}     — Scroll mode (q to exit)
  ${chalk.cyan("Ctrl+B then 0-9")}   — Switch panes
  ${chalk.cyan("Ctrl+B then arrows")} — Navigate panes
  ${chalk.cyan("Ctrl+B then Z")}     — Zoom current pane
  ${chalk.cyan("tmux attach")}       — Reattach to session

${chalk.white.bold("Pro Tip:")}
Sigma handles most tmux operations for you.
You'll mainly use attach/detach.`,
  },
  {
    title: "Running Orchestration",
    content: `${chalk.cyan.bold("Launching Multi-Agent Streams")}

${chalk.white.bold("Step 1: Prepare PRDs")}
${chalk.gray(`  @step-11b-prd-swarm --orchestrate
  
  This generates streams.json with your PRD assignments.`)}

${chalk.white.bold("Step 2: Start Orchestration")}
${chalk.gray(`  # Auto-detect streams AND agent (prompts you):
  sigma orchestrate
  
  # Specify your AI agent:
  sigma orchestrate --agent=claude
  sigma orchestrate --agent=opencode
  sigma orchestrate --agent=manual
  
  # Use beautiful TUI mode:
  sigma orchestrate --tui
  
  # Or specify stream count:
  sigma orchestrate --streams=4`)}

${chalk.white.bold("What Gets Created:")}
  ${chalk.green("•")} 1 orchestrator pane
  ${chalk.green("•")} N stream worker panes (auto-detected)
  ${chalk.green("•")} Git worktrees for each stream

${chalk.white.bold("Step 3: Monitor & Manage")}
${chalk.gray(`  sigma orchestrate --status    # Check status
  sigma orchestrate --attach    # Attach to session
  sigma approve --stream=A      # Approve completion`)}

${chalk.white.bold("Voice Notifications:")}
${chalk.gray(`  Set ELEVENLABS_API_KEY in .env for 
  spoken alerts on completion or crash.`)}`,
  },
  {
    title: "Overmind TUI Commands",
    content: `${chalk.cyan.bold("Using Overmind TUI")}

When using ${chalk.yellow("--tui")} mode, you get a beautiful interface.

${chalk.white.bold("Starting TUI Mode:")}
${chalk.gray(`  sigma orchestrate --tui`)}

${chalk.white.bold("Inside the TUI:")}
  ${chalk.cyan("j/k")}           — Navigate process list
  ${chalk.cyan("Enter")}         — Connect to selected process
  ${chalk.cyan("s")}             — Start selected process
  ${chalk.cyan("r")}             — Restart selected process
  ${chalk.cyan("q")}             — Quit Overmind

${chalk.white.bold("From Terminal:")}
${chalk.gray(`  overmind connect orchestrator  # Connect to orchestrator
  overmind connect agent-a       # Connect to Stream A
  overmind connect agent-b       # Connect to Stream B
  overmind status                # Show all statuses
  overmind restart agent-a       # Restart Stream A
  overmind quit                  # Stop all gracefully`)}

${chalk.white.bold("Process Names:")}
  ${chalk.gray("orchestrator")} — Main orchestrator
  ${chalk.gray("agent-a")}      — Stream A worker
  ${chalk.gray("agent-b")}      — Stream B worker
  ${chalk.gray("...")}`,
  },
  {
    title: "Stream Management",
    content: `${chalk.cyan.bold("Managing Streams")}

${chalk.white.bold("Attach to Session:")}
${chalk.gray(`  sigma orchestrate --attach
  # Or directly:
  tmux attach -t sigma-orchestration`)}

${chalk.white.bold("Approve Completion:")}
${chalk.gray(`  sigma approve --stream=A
  sigma approve --stream=B`)}

${chalk.white.bold("Check Status:")}
${chalk.gray(`  sigma orchestrate --status`)}

${chalk.white.bold("Kill Session:")}
${chalk.gray(`  sigma orchestrate --kill`)}

${chalk.white.bold("Stream States:")}
  ${chalk.gray("pending")}     — Waiting for PRD assignment
  ${chalk.cyan("active")}      — Working on PRD
  ${chalk.yellow("review")}     — Awaiting human approval
  ${chalk.green("complete")}   — PRD finished, ready to merge
  ${chalk.red("crashed")}     — Error occurred, needs restart

${chalk.white.bold("Merge Process:")}
After all streams complete, use ${chalk.cyan("@merge-streams")} 
to combine work into main branch.`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Dev Commands
// ============================================================================

const DEV_LESSONS = [
  {
    title: "Dev Overview",
    content: `${chalk.cyan.bold("Development Commands")}

Commands for active development and implementation.

${chalk.white.bold("Core Dev Commands:")}
  ${chalk.cyan("@implement-prd")}        — Implement a PRD
  ${chalk.cyan("@plan")}                 — Create implementation plan
  ${chalk.cyan("@db-migrate")}           — Database migrations
  ${chalk.cyan("@compound-engineering")} — Complex patterns

${chalk.white.bold("Workflow:")}
${chalk.gray(`  PRD ready → @plan → @implement-prd → @gap-analysis
                ↓
            Implementation
                ↓
            Verification`)}

${chalk.white.bold("Best Practice:")}
Always have a PRD before implementing. Even for small features,
a quick PRD keeps you focused and enables verification.`,
  },
  {
    title: "@implement-prd",
    content: `${chalk.cyan.bold("@implement-prd — PRD Implementation")}

${chalk.white.bold("What it does:")}
Implements a PRD systematically, following the spec exactly.

${chalk.white.bold("How to use:")}
${chalk.gray(`  @implement-prd                          # Auto-detect PRD
  @implement-prd --prd=docs/prds/auth.md  # Specific PRD
  @implement-prd --continue               # Resume`)}

${chalk.white.bold("The Process:")}
  ${chalk.yellow("1.")} Reads and parses PRD
  ${chalk.yellow("2.")} Creates implementation plan
  ${chalk.yellow("3.")} Implements each requirement
  ${chalk.yellow("4.")} HITL checkpoint after each section
  ${chalk.yellow("5.")} Runs tests if specified
  ${chalk.yellow("6.")} Updates PRD status

${chalk.white.bold("HITL Checkpoints:")}
You'll be asked to approve:
  ${chalk.green("•")} Approach before starting
  ${chalk.green("•")} After each major component
  ${chalk.green("•")} Test results

${chalk.white.bold("Pro Tip:")}
For complex PRDs, run ${chalk.cyan("@plan")} first to review
the implementation strategy.`,
  },
  {
    title: "@plan and @db-migrate",
    content: `${chalk.cyan.bold("@plan — Implementation Planning")}

${chalk.white.bold("What it does:")}
Creates detailed implementation plan before coding.

${chalk.gray(`  @plan                          # Auto-detect scope
  @plan --feature=authentication # Specific feature
  @plan --estimate               # Include time estimates`)}

${chalk.white.bold("Plan Includes:")}
  ${chalk.green("•")} File changes needed
  ${chalk.green("•")} Dependencies to add
  ${chalk.green("•")} Order of implementation
  ${chalk.green("•")} Risk assessment
  ${chalk.green("•")} Time estimates (if requested)

---

${chalk.cyan.bold("@db-migrate — Database Migrations")}

${chalk.white.bold("What it does:")}
Creates and manages database migrations.

${chalk.gray(`  @db-migrate                    # Review pending changes
  @db-migrate --generate         # Generate migration
  @db-migrate --name=add_users   # Named migration`)}

${chalk.white.bold("Supports:")}
  ${chalk.green("•")} Prisma migrations
  ${chalk.green("•")} Drizzle migrations
  ${chalk.green("•")} Raw SQL migrations`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Deploy Commands
// ============================================================================

const DEPLOY_LESSONS = [
  {
    title: "Deploy Overview",
    content: `${chalk.cyan.bold("Deployment Commands")}

Commands for shipping your product safely.

${chalk.white.bold("Deploy Commands:")}
  ${chalk.cyan("@ship-check")}     — Pre-deploy verification
  ${chalk.cyan("@ship-stage")}     — Deploy to staging
  ${chalk.cyan("@ship-prod")}      — Deploy to production
  ${chalk.cyan("@client-handoff")} — Client delivery prep

${chalk.white.bold("Recommended Flow:")}
${chalk.gray(`  Development → @ship-check → @ship-stage
                                    ↓
                              QA & Testing
                                    ↓
                             @ship-prod`)}

${chalk.white.bold("Philosophy:")}
Deployment should be boring. These commands ensure you've 
checked everything before it becomes an emergency.`,
  },
  {
    title: "@ship-check and @ship-stage",
    content: `${chalk.cyan.bold("@ship-check — Pre-Deploy Verification")}

${chalk.white.bold("What it does:")}
Comprehensive check before deployment.

${chalk.gray(`  @ship-check
  @ship-check --environment=production`)}

${chalk.white.bold("Checks Performed:")}
  ${chalk.green("•")} All tests passing
  ${chalk.green("•")} No console.logs left
  ${chalk.green("•")} Environment variables set
  ${chalk.green("•")} Build succeeds
  ${chalk.green("•")} Dependencies up to date
  ${chalk.green("•")} Security audit clean

---

${chalk.cyan.bold("@ship-stage — Staging Deploy")}

${chalk.white.bold("What it does:")}
Deploys to staging environment with verification.

${chalk.gray(`  @ship-stage
  @ship-stage --skip-checks      # Skip (not recommended)`)}

${chalk.white.bold("Process:")}
  ${chalk.yellow("1.")} Runs @ship-check
  ${chalk.yellow("2.")} Builds production bundle
  ${chalk.yellow("3.")} Deploys to staging
  ${chalk.yellow("4.")} Runs smoke tests
  ${chalk.yellow("5.")} Reports status`,
  },
  {
    title: "@ship-prod and @client-handoff",
    content: `${chalk.cyan.bold("@ship-prod — Production Deploy")}

${chalk.white.bold("What it does:")}
Deploys to production with safety gates.

${chalk.gray(`  @ship-prod
  @ship-prod --version=1.2.0`)}

${chalk.white.bold("Safety Gates:")}
  ${chalk.green("•")} Requires @ship-check pass
  ${chalk.green("•")} Requires staging verification
  ${chalk.green("•")} Creates git tag
  ${chalk.green("•")} Human confirmation required

---

${chalk.cyan.bold("@client-handoff — Client Delivery")}

${chalk.white.bold("What it does:")}
Prepares project for client delivery.

${chalk.gray(`  @client-handoff
  @client-handoff --include-docs`)}

${chalk.white.bold("Creates:")}
  ${chalk.green("•")} README with setup instructions
  ${chalk.green("•")} Environment template
  ${chalk.green("•")} Deployment guide
  ${chalk.green("•")} Architecture overview
  ${chalk.green("•")} Maintenance documentation`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Generators
// ============================================================================

const GENERATOR_LESSONS = [
  {
    title: "Generators Overview",
    content: `${chalk.cyan.bold("Generator Commands")}

Create new code, tests, and documentation from templates.

${chalk.white.bold("Code Generators:")}
  ${chalk.cyan("@scaffold")}         — Scaffold new feature
  ${chalk.cyan("@new-feature")}      — Create feature structure
  ${chalk.cyan("@new-command")}      — Create Sigma command

${chalk.white.bold("Test Generators:")}
  ${chalk.cyan("@test-gen")}         — Generate tests

${chalk.white.bold("Doc Generators:")}
  ${chalk.cyan("@api-docs-gen")}     — Generate API docs
  ${chalk.cyan("@wireframe")}        — Generate wireframes

${chalk.white.bold("Business Generators:")}
  ${chalk.cyan("@estimation-engine")} — Estimate effort
  ${chalk.cyan("@contract")}          — Generate contract
  ${chalk.cyan("@proposal")}          — Generate proposal
  ${chalk.cyan("@nda")}               — Generate NDA`,
  },
  {
    title: "@scaffold and @new-feature",
    content: `${chalk.cyan.bold("@scaffold — Feature Scaffolding")}

${chalk.white.bold("What it does:")}
Creates full feature structure with all files.

${chalk.gray(`  @scaffold user-profile
  @scaffold --type=crud users
  @scaffold --type=api payments`)}

${chalk.white.bold("Creates:")}
  ${chalk.green("•")} Component files
  ${chalk.green("•")} Test files
  ${chalk.green("•")} Type definitions
  ${chalk.green("•")} API routes (if applicable)

---

${chalk.cyan.bold("@new-feature — Feature Creation")}

${chalk.white.bold("What it does:")}
Creates a new feature with PRD workflow.

${chalk.gray(`  @new-feature user-authentication
  @new-feature --quick notifications`)}

${chalk.white.bold("Creates:")}
  ${chalk.green("•")} Feature directory
  ${chalk.green("•")} Basic PRD template
  ${chalk.green("•")} Placeholder files
  ${chalk.green("•")} Test stubs`,
  },
  {
    title: "@test-gen and @api-docs-gen",
    content: `${chalk.cyan.bold("@test-gen — Test Generation")}

${chalk.white.bold("What it does:")}
Generates tests for existing code.

${chalk.gray(`  @test-gen                        # All files
  @test-gen --file=src/utils.ts   # Specific file
  @test-gen --type=integration    # Test type`)}

${chalk.white.bold("Test Types:")}
  ${chalk.green("•")} Unit tests
  ${chalk.green("•")} Integration tests
  ${chalk.green("•")} E2E tests
  ${chalk.green("•")} API tests

---

${chalk.cyan.bold("@api-docs-gen — API Documentation")}

${chalk.white.bold("What it does:")}
Generates API documentation from code.

${chalk.gray(`  @api-docs-gen
  @api-docs-gen --format=openapi
  @api-docs-gen --format=markdown`)}

${chalk.white.bold("Output Formats:")}
  ${chalk.green("•")} OpenAPI/Swagger spec
  ${chalk.green("•")} Markdown documentation
  ${chalk.green("•")} Postman collection`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Marketing
// ============================================================================

const MARKETING_LESSONS = [
  {
    title: "Marketing Overview",
    content: `${chalk.cyan.bold("Marketing Commands")}

AI-powered marketing content generation.

${chalk.white.bold("Research:")}
  ${chalk.cyan("@01-market-research")}    — Market analysis
  ${chalk.cyan("@02-customer-avatar")}    — Ideal customer profile

${chalk.white.bold("Branding:")}
  ${chalk.cyan("@03-brand-voice")}        — Voice and tone guide
  ${chalk.cyan("@04-offer-architect")}    — Offer structure

${chalk.white.bold("Sales:")}
  ${chalk.cyan("@05-sales-strategy")}     — Sales approach
  ${chalk.cyan("@06-email-sequences")}    — Email automation

${chalk.white.bold("Content:")}
  ${chalk.cyan("@07-landing-page-copy")}  — Landing page
  ${chalk.cyan("@14-video-script")}       — Video scripts
  ${chalk.cyan("@16-seo-content")}        — SEO articles

${chalk.white.bold("Advertising:")}
  ${chalk.cyan("@08-ads-strategy")}       — Ad campaigns
  ${chalk.cyan("@09-retargeting")}        — Retargeting

${chalk.white.bold("Launch:")}
  ${chalk.cyan("@10-launch-playbook")}    — Launch plan`,
  },
  {
    title: "Research & Branding",
    content: `${chalk.cyan.bold("Market Research & Branding")}

${chalk.white.bold("@01-market-research")}
  Analyzes market size, competitors, and opportunities.
${chalk.gray(`  @01-market-research
  @01-market-research --industry=saas`)}

${chalk.white.bold("@02-customer-avatar")}
  Creates detailed ideal customer profile.
${chalk.gray(`  @02-customer-avatar
  @02-customer-avatar --segment=enterprise`)}

---

${chalk.white.bold("@03-brand-voice")}
  Defines brand voice, tone, and messaging.
${chalk.gray(`  @03-brand-voice
  @03-brand-voice --tone=professional`)}

${chalk.white.bold("@04-offer-architect")}
  Structures your offer using Hormozi framework.
${chalk.gray(`  @04-offer-architect
  @04-offer-architect --type=subscription`)}

${chalk.white.bold("Pro Tip:")}
Run these in order for best results. Each builds
on the previous.`,
  },
  {
    title: "Sales & Content",
    content: `${chalk.cyan.bold("Sales & Content Generation")}

${chalk.white.bold("@05-sales-strategy")}
  Creates sales approach and objection handling.
${chalk.gray(`  @05-sales-strategy`)}

${chalk.white.bold("@06-email-sequences")}
  Generates email automation sequences.
${chalk.gray(`  @06-email-sequences
  @06-email-sequences --type=onboarding
  @06-email-sequences --type=nurture`)}

---

${chalk.white.bold("@07-landing-page-copy")}
  Creates landing page copy and structure.
${chalk.gray(`  @07-landing-page-copy`)}

${chalk.white.bold("@14-video-script")}
  Writes video scripts for various purposes.
${chalk.gray(`  @14-video-script --type=explainer
  @14-video-script --type=testimonial`)}

${chalk.white.bold("@16-seo-content")}
  Generates SEO-optimized content.
${chalk.gray(`  @16-seo-content --topic="task management"
  @16-seo-content --keywords=["productivity","ai"]`)}`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Ralph Loop
// ============================================================================

const RALPH_LESSONS = [
  {
    title: "What is Ralph?",
    content: `${chalk.cyan.bold("Ralph Loop — Autonomous Development")}

Ralph is Sigma's ${chalk.yellow("autonomous execution mode")}.

${chalk.white.bold("Named After:")}
Ralph Wiggum from The Simpsons — simple but effective.
"Me fail English? That's unpossible!"

${chalk.white.bold("What It Does:")}
Converts PRDs into actionable JSON format, then:
  ${chalk.yellow("1.")} Reads current task from JSON
  ${chalk.yellow("2.")} Implements the task
  ${chalk.yellow("3.")} Updates task status
  ${chalk.yellow("4.")} Moves to next task
  ${chalk.yellow("5.")} Repeat until done

${chalk.white.bold("When to Use:")}
  ${chalk.green("✓")} Well-defined PRDs with clear tasks
  ${chalk.green("✓")} Implementation-focused work
  ${chalk.green("✓")} Want to step away and let AI work
  ${chalk.yellow("✗")} Exploratory or unclear requirements
  ${chalk.yellow("✗")} Tasks requiring frequent decisions

${chalk.white.bold("The Magic:")}
You write the PRD, Ralph does the rest.`,
  },
  {
    title: "Setting Up Ralph",
    content: `${chalk.cyan.bold("Setting Up Ralph Mode")}

${chalk.white.bold("Prerequisites:")}
  ${chalk.green("•")} Sigma Protocol installed
  ${chalk.green("•")} JSON schemas in place
  ${chalk.green("•")} PRD written and ready

${chalk.white.bold("Step 1: Convert PRD to JSON")}
${chalk.gray(`  @step-5b-prd-to-json
  # Or for implementation PRDs:
  @step-11a-prd-to-json`)}

${chalk.white.bold("Step 2: Verify JSON")}
${chalk.gray(`  # Check .sigma/prds/<name>.json exists
  # Verify structure matches schema`)}

${chalk.white.bold("Step 3: Start Ralph Loop")}
${chalk.gray(`  @continue
  # Or directly:
  @ralph-loop`)}

${chalk.white.bold("JSON Structure:")}
${chalk.gray(`  {
    "prd": "feature-name",
    "tasks": [
      { "id": 1, "status": "pending", "task": "..." },
      { "id": 2, "status": "pending", "task": "..." }
    ],
    "currentTask": 1
  }`)}`,
  },
  {
    title: "Running Ralph Loop",
    content: `${chalk.cyan.bold("Running the Ralph Loop")}

${chalk.white.bold("Start the Loop:")}
${chalk.gray(`  @continue                 # Standard start
  @continue --autonomous    # Minimal interruption`)}

${chalk.white.bold("What Happens:")}
  ${chalk.yellow("1.")} Reads PRD JSON
  ${chalk.yellow("2.")} Finds next pending task
  ${chalk.yellow("3.")} Implements the task
  ${chalk.yellow("4.")} Updates JSON status to "done"
  ${chalk.yellow("5.")} Loops to next task

${chalk.white.bold("Monitoring:")}
${chalk.gray(`  # Watch progress
  cat .sigma/prds/<name>.json | jq '.currentTask'
  
  # View completed
  cat .sigma/prds/<name>.json | jq '[.tasks[] | select(.status=="done")]'`)}

${chalk.white.bold("Intervention:")}
  ${chalk.green("•")} AI pauses at HITL checkpoints
  ${chalk.green("•")} You can interrupt anytime
  ${chalk.green("•")} Tasks can be re-run if needed

${chalk.white.bold("Completion:")}
When all tasks done, Ralph reports completion
and suggests @gap-analysis.`,
  },
  {
    title: "Ralph Best Practices",
    content: `${chalk.cyan.bold("Ralph Best Practices")}

${chalk.white.bold("PRD Quality:")}
  ${chalk.green("✓")} Clear, atomic tasks
  ${chalk.green("✓")} Specific acceptance criteria
  ${chalk.green("✓")} Dependencies noted
  ${chalk.yellow("✗")} Vague requirements
  ${chalk.yellow("✗")} Combined tasks

${chalk.white.bold("Task Granularity:")}
${chalk.gray(`  Good: "Add login form with email/password fields"
  Bad:  "Implement authentication"`)}

${chalk.white.bold("Monitoring Recommendations:")}
  ${chalk.green("•")} Check in every 30-60 minutes
  ${chalk.green("•")} Review completed tasks before continuing
  ${chalk.green("•")} Run @gap-analysis after completion

${chalk.white.bold("Recovery:")}
If Ralph gets stuck:
${chalk.gray(`  @continue --from=<task-id>  # Resume from task
  @continue --reset            # Reset all tasks`)}

${chalk.white.bold("Pro Tips:")}
  ${chalk.yellow("→")} Start with smaller PRDs to test
  ${chalk.yellow("→")} Keep tasks independent when possible
  ${chalk.yellow("→")} Use @gap-analysis to verify quality`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Platforms Section
// ============================================================================

const PLATFORMS_LESSONS = [
  {
    title: "Platform Overview",
    content: `${chalk.cyan.bold("Supported AI Platforms")}

Sigma Protocol works with multiple AI coding assistants:

${chalk.white.bold("Cursor IDE")}
  ${chalk.green("•")} Use ${chalk.yellow("@command")} syntax
  ${chalk.green("•")} Rules in ${chalk.gray(".cursor/rules/*.mdc")}
  ${chalk.green("•")} Native Composer and Background Agents
  ${chalk.green("•")} Plan Mode for complex tasks

${chalk.white.bold("Claude Code")}
  ${chalk.green("•")} Use ${chalk.yellow("/command")} syntax
  ${chalk.green("•")} Skills in ${chalk.gray(".claude/skills/")}
  ${chalk.green("•")} Agents in ${chalk.gray(".claude/agents/")}
  ${chalk.green("•")} CLAUDE.md orchestrator file

${chalk.white.bold("OpenCode")}
  ${chalk.green("•")} Use ${chalk.yellow("/command")} syntax
  ${chalk.green("•")} Skills in ${chalk.gray(".opencode/skill/<name>/SKILL.md")}
  ${chalk.green("•")} Agents in ${chalk.gray(".opencode/agent/")}
  ${chalk.green("•")} AGENTS.md orchestrator file
  ${chalk.green("•")} Tab key switches Build/Plan agents

${chalk.gray("All platforms get the same commands - just different syntax!")}`,
  },
  {
    title: "OpenCode Deep Dive",
    content: `${chalk.cyan.bold("OpenCode Features")}

OpenCode has unique features compared to other platforms:

${chalk.white.bold("Agent Modes (Tab to Switch):")}
  ${chalk.yellow("Build")} — Implements code, makes changes
  ${chalk.yellow("Plan")}  — Creates plans, analyzes without changes

${chalk.white.bold("Key Commands:")}
  ${chalk.gray("/init")}        Create AGENTS.md orchestrator
  ${chalk.gray("/themes")}      Change color theme (or Ctrl+X+T)
  ${chalk.gray("@mention")}     Invoke subagents (General, Explore)

${chalk.white.bold("Directory Structure:")}
${chalk.gray(`  .opencode/
    ├── agent/         # Custom agents
    ├── skill/         # Skills (SKILL.md format)
    │   └── name/
    │       └── SKILL.md
    ├── command/       # Slash commands
    └── schemas/       # JSON schemas
  opencode.json        # Configuration
  AGENTS.md            # Orchestrator file`)}

${chalk.white.bold("Cross-Platform Bonus:")}
OpenCode ${chalk.green("automatically reads")} Claude Code files:
  ${chalk.gray("•")} Reads .claude/skills/ (disable: OPENCODE_DISABLE_CLAUDE_CODE_SKILLS)
  ${chalk.gray("•")} Reads ~/.claude/CLAUDE.md (disable: OPENCODE_DISABLE_CLAUDE_CODE_PROMPT)`,
  },
  {
    title: "Cursor Deep Dive",
    content: `${chalk.cyan.bold("Cursor Features")}

${chalk.white.bold("Cursor Modes:")}
  ${chalk.yellow("Composer")}  — Multi-file edits, complex tasks
  ${chalk.yellow("Chat")}      — Quick questions, explanations
  ${chalk.yellow("Plan Mode")} — Create plans before execution

${chalk.white.bold("Key Shortcuts:")}
  ${chalk.gray("Cmd+K")}       Edit selected code
  ${chalk.gray("Cmd+L")}       Open chat
  ${chalk.gray("Cmd+I")}       Open Composer
  ${chalk.gray("@file")}       Reference a file in chat

${chalk.white.bold("Directory Structure:")}
${chalk.gray(`  .cursor/
    ├── rules/         # MDC rules (v2 format)
    │   └── *.mdc
    └── plans/         # Plan mode files
  .cursorrules         # Legacy v1 format (single file)`)}

${chalk.white.bold("Sigma Commands in Cursor:")}
  ${chalk.gray("@step-1-ideation")}     Start ideation
  ${chalk.gray("@gap-analysis")}        Verify implementation
  ${chalk.gray("@continue")}      Find next task

${chalk.white.bold("Pro Tip:")}
Use ${chalk.yellow("Plan Mode")} for complex multi-step tasks.
Cursor creates a plan file you can review before execution.`,
  },
  {
    title: "Claude Code Deep Dive",
    content: `${chalk.cyan.bold("Claude Code Features")}

${chalk.white.bold("Running Claude Code:")}
${chalk.gray(`  $ claude                    # Start interactive mode
  $ claude "Run step 1"      # Direct command
  $ claude --continue        # Continue last session`)}

${chalk.white.bold("Key Features:")}
  ${chalk.green("•")} Terminal-native interface
  ${chalk.green("•")} Git integration
  ${chalk.green("•")} Tool calling (read/write/bash)
  ${chalk.green("•")} Context persistence across sessions

${chalk.white.bold("Directory Structure:")}
${chalk.gray(`  .claude/
    ├── commands/      # Slash commands
    ├── skills/        # Foundation skills
    ├── agents/        # Subagents
    └── hooks/         # Automation hooks
  CLAUDE.md            # Orchestrator file`)}

${chalk.white.bold("Sigma Commands in Claude Code:")}
  ${chalk.gray("/step-1-ideation")}     Start ideation
  ${chalk.gray("/gap-analysis")}        Verify implementation
  ${chalk.gray("/continue")}      Find next task

${chalk.white.bold("Hooks (Automation):")}
${chalk.gray(`  # In .claude/hooks/
  post-tool-use.sh     # Run after each tool
  session-start.sh     # Run when session starts`)}`,
  },
  {
    title: "Platform Comparison",
    content: `${chalk.cyan.bold("Feature Comparison")}

${chalk.white.bold("Command Syntax:")}
  ${chalk.gray("Cursor:")}      @command-name
  ${chalk.gray("Claude Code:")} /command-name
  ${chalk.gray("OpenCode:")}    /command-name

${chalk.white.bold("Rules/Skills Location:")}
  ${chalk.gray("Cursor:")}      .cursor/rules/*.mdc
  ${chalk.gray("Claude Code:")} .claude/skills/
  ${chalk.gray("OpenCode:")}    .opencode/skill/<name>/SKILL.md

${chalk.white.bold("Agents:")}
  ${chalk.gray("Cursor:")}      Background Agents (built-in)
  ${chalk.gray("Claude Code:")} .claude/agents/
  ${chalk.gray("OpenCode:")}    .opencode/agent/, Tab for Build/Plan

${chalk.white.bold("Orchestrator File:")}
  ${chalk.gray("Cursor:")}      N/A (uses rules)
  ${chalk.gray("Claude Code:")} CLAUDE.md
  ${chalk.gray("OpenCode:")}    AGENTS.md

${chalk.white.bold("Unique Features:")}
  ${chalk.yellow("Cursor:")}      Plan Mode, Composer, Browser
  ${chalk.yellow("Claude Code:")} Hooks, Git integration
  ${chalk.yellow("OpenCode:")}    Theme support, reads Claude files

${chalk.gray("Pick the platform that fits your workflow!")}`,
  },
];

// ============================================================================
// TUTORIAL CONTENT - Thread-Based Engineering Section
// ============================================================================

const THREAD_LESSONS = [
  {
    title: "What is Thread-Based Engineering?",
    content: `${chalk.cyan.bold("Thread-Based Engineering")}

${chalk.gray("Inspired by IndyDevDan's framework for agentic engineering.")}

A ${chalk.yellow("Thread")} is a unit of engineering work over time:

${chalk.white.bold("The Thread Structure:")}
${chalk.gray(`  ┌─────────┐     ┌──────────────┐     ┌─────────┐
  │ PROMPT  │ ──► │  AGENT WORK  │ ──► │ REVIEW  │
  │ or PLAN │     │ (Tool Calls) │     │or VALIDATE│
  └─────────┘     └──────────────┘     └─────────┘
       ▲                                    ▲
       │                                    │
      YOU                                  YOU`)}

${chalk.white.bold("Key Insight:")}
  The value your agent creates is measured in ${chalk.yellow("tool calls")}.
  Tool calls ≈ impact (assuming useful prompts).

${chalk.white.bold("Before AI (Pre-2023):")}
  YOU were the tool calls - writing code, reading files, etc.

${chalk.white.bold("Now:")}
  ${chalk.green("•")} You show up at the ${chalk.yellow("beginning")} (prompt/plan)
  ${chalk.green("•")} Agent does the ${chalk.yellow("middle")} (tool calls)
  ${chalk.green("•")} You show up at the ${chalk.yellow("end")} (review/validate)`,
  },
  {
    title: "The 6 Thread Types",
    content: `${chalk.cyan.bold("Six Types of Threads")}

${chalk.yellow("1. Base Thread (B)")}
   Single linear workflow: Prompt → Work → Review
   
${chalk.yellow("2. P-Thread (Parallel)")}
   Multiple agents running simultaneously
   
${chalk.yellow("3. C-Thread (Chained)")}
   Phases with human checkpoints between them
   
${chalk.yellow("4. F-Thread (Fusion)")}
   Same prompt to multiple agents, aggregate results
   
${chalk.yellow("5. B-Thread (Big/Meta)")}
   Agents prompting other agents (orchestration)
   
${chalk.yellow("6. L-Thread (Long Duration)")}
   Extended autonomy, hundreds of tool calls

${chalk.white.bold("Ultimate Goal: Z-Thread (Zero Touch)")}
  No human review needed - fully autonomous
  "Living software that works while you sleep"`,
  },
  {
    title: "Base Thread",
    content: `${chalk.cyan.bold("Base Thread — The Foundation")}

The fundamental unit of agentic work:

${chalk.gray(`  Prompt ──► Agent Work ──► Review`)}

${chalk.white.bold("In Sigma Protocol:")}
  ${chalk.green("•")} Running any ${chalk.yellow("@step-X")} command
  ${chalk.green("•")} Single Claude Code session
  ${chalk.green("•")} Any prompt-to-completion cycle

${chalk.white.bold("Example:")}
${chalk.gray(`  # In Claude Code or Cursor
  @step-3-ideation "Build a task management app"
  
  # Agent works... (tool calls happening)
  
  # You review the output`)}

${chalk.white.bold("Key Metrics:")}
  ${chalk.cyan("•")} Number of tool calls
  ${chalk.cyan("•")} Time to completion
  ${chalk.cyan("•")} Review iterations needed`,
  },
  {
    title: "P-Thread (Parallel)",
    content: `${chalk.cyan.bold("P-Thread — Scale Through Parallelism")}

Multiple threads running simultaneously:

${chalk.gray(`  Prompt A → Work A ──┐
  Prompt B → Work B ──┼──► Review All
  Prompt C → Work C ──┘`)}

${chalk.white.bold("In Sigma Protocol:")}
${chalk.gray(`  # Launch 4 parallel streams
  sigma orchestrate --streams=4 --tui mprocs
  
  # Each stream works on different work:
  # Stream A: Authentication module
  # Stream B: Database schema
  # Stream C: API endpoints
  # Stream D: Frontend components`)}

${chalk.white.bold("Boris Cherny's Setup:")}
  ${chalk.green("•")} 5 Claude Codes in terminal tabs (numbered 1-5)
  ${chalk.green("•")} 5-10 more in web interface (background)

${chalk.white.bold("Who Ships More?")}
  Engineer with ${chalk.red("1 agent")} or ${chalk.green("5-10 agents")}?
  ${chalk.yellow("Answer: More compute = more output")}`,
  },
  {
    title: "C-Thread (Chained)",
    content: `${chalk.cyan.bold("C-Thread — Phased Work with Checkpoints")}

Breaking high-stakes work into phases:

${chalk.gray(`  Prompt → Work → Review → Prompt → Work → Review → ...`)}

${chalk.white.bold("When to Use:")}
  ${chalk.yellow("•")} Work can't fit in single context window
  ${chalk.yellow("•")} High-pressure production work
  ${chalk.yellow("•")} Migrations or sensitive deployments

${chalk.white.bold("Sigma's 13-Step Workflow IS a C-Thread:")}
${chalk.gray(`  @step-5-prd-generation      # Phase 1
  # Review PRD, approve
  @step-6-tech-architecture   # Phase 2
  # Review architecture, approve
  @step-7-ux-flow             # Phase 3
  # ...continues through deployment`)}

${chalk.white.bold("Tools for C-Threads:")}
  ${chalk.green("•")} ${chalk.gray("ask_user_question")} — Agent asks for input
  ${chalk.green("•")} ${chalk.gray("System notifications")} — When work is done
  ${chalk.green("•")} ${chalk.gray("Text-to-speech")} — Voice alerts

${chalk.white.bold("Tradeoff:")}
  More checkpoints = More control, but more of YOUR time`,
  },
  {
    title: "F-Thread (Fusion)",
    content: `${chalk.cyan.bold("F-Thread — Best of N / Aggregation")}

Same prompt to multiple agents, aggregate the best:

${chalk.gray(`           ┌─► Claude ──┐
  Prompt ──┼─► Gemini ──┼──► Aggregate ──► Best Result
           └─► Codex  ──┘`)}

${chalk.white.bold("Use Cases:")}
  ${chalk.green("•")} ${chalk.white("Rapid prototyping")} — Multiple solutions
  ${chalk.green("•")} ${chalk.white("Increased confidence")} — 4/5 agree = high trust
  ${chalk.green("•")} ${chalk.white("Code review")} — Multiple perspectives

${chalk.white.bold("In Sigma Protocol:")}
${chalk.gray(`  # Same prompt across multiple models
  sigma f-thread \\
    --prompt="Review auth implementation" \\
    --models=claude,gemini,codex \\
    --aggregate=best`)}

${chalk.white.bold("Key Insight:")}
  "The chances of successful completion go UP
   when you have MORE agents trying."

${chalk.yellow("This is the future of rapid prototyping.")}`,
  },
  {
    title: "B-Thread (Big/Meta)",
    content: `${chalk.cyan.bold("B-Thread — Agents Prompting Agents")}

A super-structure where agents manage other agents:

${chalk.gray(`  ┌──────────────────────────────────────┐
  │           ORCHESTRATOR               │
  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
  │  │ Plan │ │Scout │ │Build │ │Review││
  │  │Agent │ │Agent │ │Agent │ │Agent ││
  │  └──────┘ └──────┘ └──────┘ └──────┘│
  └──────────────────────────────────────┘
        ▲                           │
      Prompt                     Review
       YOU ◄────────────────────────┘`)}

${chalk.white.bold("In Sigma Protocol:")}
  ${chalk.green("•")} ${chalk.yellow("Ralph Loop")} = B-Thread implementation
  ${chalk.green("•")} Orchestrator + Stream agents
  ${chalk.green("•")} Sub-agents within Claude Code

${chalk.white.bold("The Ralph Wiggum Pattern:")}
${chalk.gray(`  Loop {
    Agent plans → Agent builds → Validation →
      ├─► Continue
      └─► Stop
  }`)}

${chalk.white.bold("Command:")}
${chalk.gray(`  sigma orchestrate --mode=full-auto`)}`,
  },
  {
    title: "L-Thread (Long Duration)",
    content: `${chalk.cyan.bold("L-Thread — Extended Autonomy")}

High autonomy work running for hours or days:

${chalk.gray(`  Prompt ────────────────────────────────► Review
           │ Tool │ Tool │...│ Tool │ Tool │
           │ Call │ Call │100│ Call │ Call │
           └──────┴──────┴───┴──────┴──────┘
                Hours or even days`)}

${chalk.white.bold("Boris Cherny's Record:")}
  ${chalk.yellow("1 day, 2+ hours")} of continuous agent work!

${chalk.white.bold("Stop Hook Pattern:")}
${chalk.gray(`  Agent tries to stop 
    → Stop hook runs
    → Validation code
    → Continue or Complete`)}

${chalk.white.bold("In Sigma Protocol:")}
  ${chalk.green("•")} Long-running ${chalk.gray("@implement-prd")} sessions
  ${chalk.green("•")} Background Claude Code instances
  ${chalk.green("•")} Stop hooks for validation

${chalk.white.bold("L-Thread = Base Thread, just LONGER")}
  Better prompts + Better context = Longer runs`,
  },
  {
    title: "How to Improve",
    content: `${chalk.cyan.bold("The 4 Dimensions of Improvement")}

How do you know you're getting better?

${chalk.white.bold("1. More Threads")} ${chalk.gray("(Parallelism)")}
   ${chalk.green("•")} Running 1 agent = Beginner
   ${chalk.green("•")} Running 5+ agents = Intermediate
   ${chalk.green("•")} Running 10+ agents = Advanced

${chalk.white.bold("2. Longer Threads")} ${chalk.gray("(Duration)")}
   ${chalk.green("•")} Minutes = Getting started
   ${chalk.green("•")} Hours = Good autonomy
   ${chalk.green("•")} Days = Expert level

${chalk.white.bold("3. Thicker Threads")} ${chalk.gray("(Nesting)")}
   ${chalk.green("•")} No sub-agents = Base threads only
   ${chalk.green("•")} Using sub-agents = B-Thread capable
   ${chalk.green("•")} Full orchestration = Advanced

${chalk.white.bold("4. Fewer Checkpoints")} ${chalk.gray("(Trust)")}
   ${chalk.green("•")} Every few minutes = Building trust
   ${chalk.green("•")} Every hour = Good trust
   ${chalk.green("•")} Only at milestones = High trust

${chalk.yellow("Goal: Push toward Z-Thread (Zero Touch)")}`,
  },
  {
    title: "Sigma Thread Commands",
    content: `${chalk.cyan.bold("Thread Commands Quick Reference")}

${chalk.white.bold("Base Thread:")}
${chalk.gray(`  @step-7-ux-flow "Design checkout flow"`)}

${chalk.white.bold("P-Thread (Parallel):")}
${chalk.gray(`  sigma orchestrate --streams=4 --tui mprocs`)}

${chalk.white.bold("C-Thread (Chained):")}
${chalk.gray(`  # Use the 13-step workflow
  @step-5 → review → @step-6 → review → ...`)}

${chalk.white.bold("F-Thread (Fusion):")}
${chalk.gray(`  sigma f-thread --models=claude,gemini \\
    --prompt="Review API design"`)}

${chalk.white.bold("B-Thread (Big/Meta):")}
${chalk.gray(`  sigma orchestrate --mode=full-auto`)}

${chalk.white.bold("L-Thread (Long Duration):")}
${chalk.gray(`  # Configure stop hooks + run long sessions
  sigma orchestrate --duration=long`)}

${chalk.white.bold("Thread Status:")}
${chalk.gray(`  sigma thread status    # See active threads
  sigma thread metrics   # View tool call counts`)}`,
  },
  {
    title: "The Core Four",
    content: `${chalk.cyan.bold("The Core Four — Master These")}

Everything in agentic engineering comes back to:

${chalk.yellow("1. Context")} — What the agent knows
   ${chalk.gray("•")} Project files, PRDs, documentation
   ${chalk.gray("•")} Conversation history
   ${chalk.gray("•")} Rules and skills

${chalk.yellow("2. Model")} — The AI's capabilities
   ${chalk.gray("•")} Claude, GPT, Gemini, etc.
   ${chalk.gray("•")} Strengths and weaknesses
   ${chalk.gray("•")} Token limits

${chalk.yellow("3. Prompt")} — Your instructions
   ${chalk.gray("•")} Clarity and specificity
   ${chalk.gray("•")} Examples and constraints
   ${chalk.gray("•")} Planning = prompting

${chalk.yellow("4. Tools")} — Agent's abilities
   ${chalk.gray("•")} File read/write
   ${chalk.gray("•")} Command execution
   ${chalk.gray("•")} Web search, sub-agents

${chalk.white.bold("Master the Core Four = Master Threads")}

${chalk.gray(`"If you want to scale your impact,
 you must scale your compute."
                    — IndyDevDan`)}`,
  },
];

// ============================================================================
// TUTORIALS MASTER OBJECT
// ============================================================================

const TUTORIALS = {
  overview: {
    title: "What is Sigma Protocol?",
    duration: "5 min",
    lessons: OVERVIEW_LESSONS,
  },
  quickstart: {
    title: "Quick Start Guide",
    duration: "10 min",
    lessons: QUICKSTART_LESSONS,
  },
  steps: {
    title: "The 13 Steps (Deep Dive)",
    duration: "25 min",
    lessons: STEPS_LESSONS,
  },
  audit: {
    title: "Audit Commands",
    duration: "12 min",
    lessons: AUDIT_LESSONS,
  },
  ops: {
    title: "Operations Commands",
    duration: "12 min",
    lessons: OPS_LESSONS,
  },
  orchestration: {
    title: "Multi-Agent Orchestration",
    duration: "10 min",
    lessons: ORCHESTRATION_LESSONS,
  },
  dev: {
    title: "Development Commands",
    duration: "8 min",
    lessons: DEV_LESSONS,
  },
  deploy: {
    title: "Deployment Commands",
    duration: "8 min",
    lessons: DEPLOY_LESSONS,
  },
  generators: {
    title: "Generator Commands",
    duration: "8 min",
    lessons: GENERATOR_LESSONS,
  },
  marketing: {
    title: "Marketing Commands",
    duration: "10 min",
    lessons: MARKETING_LESSONS,
  },
  ralph: {
    title: "Ralph Loop (Autonomous Mode)",
    duration: "12 min",
    lessons: RALPH_LESSONS,
  },
  threads: {
    title: "Thread-Based Engineering",
    duration: "15 min",
    lessons: THREAD_LESSONS,
  },
  platforms: {
    title: "Platform Guide (Cursor, Claude Code, OpenCode)",
    duration: "10 min",
    lessons: PLATFORMS_LESSONS,
  },
};

// ============================================================================
// TUTORIAL NAVIGATION
// ============================================================================

/**
 * Run a tutorial section
 */
async function runTutorialSection(sectionKey) {
  const section = TUTORIALS[sectionKey];
  if (!section) return "menu";

  for (let i = 0; i < section.lessons.length; i++) {
    const lesson = section.lessons[i];
    console.clear();

    // Header with progress
    const progress = `${i + 1}/${section.lessons.length}`;
    console.log(
      boxen(
        chalk.cyan.bold(`${section.title}\n`) +
          chalk.gray(`Lesson ${progress}: ${lesson.title}`),
        {
          padding: { top: 0, bottom: 0, left: 1, right: 1 },
          borderStyle: "round",
          borderColor: "cyan",
        }
      )
    );

    // Content
    console.log("");
    console.log(lesson.content);
    console.log("");

    // Navigation
    const choices = [];
    if (i < section.lessons.length - 1) {
      choices.push({ name: "Next lesson →", value: "next" });
    } else {
      choices.push({ name: "✓ Complete section", value: "complete" });
    }
    if (i > 0) {
      choices.push({ name: "← Previous lesson", value: "prev" });
    }
    choices.push({ name: "Return to tutorial menu", value: "menu" });
    choices.push({ name: "Exit tutorial", value: "exit" });

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Navigation:",
        choices,
      },
    ]);

    if (action === "next") {
      continue;
    } else if (action === "prev") {
      i -= 2; // Will be incremented by loop
    } else if (action === "menu" || action === "complete") {
      if (action === "complete") {
        console.clear();
        console.log(
          boxen(
            chalk.green.bold(`✓ Completed: ${section.title}\n\n`) +
              chalk.white("Great job! You've finished this section.\n\n") +
              chalk.gray("Next steps:\n") +
              chalk.gray("  • Try another tutorial section\n") +
              chalk.gray("  • Start a project: sigma new\n") +
              chalk.gray("  • Run a command you learned"),
            {
              padding: 1,
              borderStyle: "round",
              borderColor: "green",
            }
          )
        );
        await inquirer.prompt([
          {
            type: "input",
            name: "continue",
            message: "Press Enter to continue...",
          },
        ]);
      }
      return "menu";
    } else {
      return "exit";
    }
  }

  return "menu";
}

/**
 * Main tutorial entry point
 */
export async function runTutorial(options = {}) {
  let continueLoop = true;

  while (continueLoop) {
    console.clear();
    console.log(
      boxen(
        chalk.cyan.bold("Sigma Protocol Tutorial\n\n") +
          chalk.white("Comprehensive curriculum for mastering Sigma.\n") +
          chalk.gray("Select a topic to begin learning."),
        {
          padding: 1,
          borderStyle: "round",
          borderColor: "cyan",
        }
      )
    );

    // Group tutorials by category
    const choices = [];

    // Getting Started
    choices.push(new inquirer.Separator(chalk.white.bold(" Getting Started")));
    choices.push({
      name: `  ${TUTORIALS.overview.title} ${chalk.gray(`(${TUTORIALS.overview.duration})`)}`,
      value: "overview",
    });
    choices.push({
      name: `  ${TUTORIALS.quickstart.title} ${chalk.gray(`(${TUTORIALS.quickstart.duration})`)}`,
      value: "quickstart",
    });

    // Core Workflow
    choices.push(new inquirer.Separator(chalk.white.bold(" Core Workflow")));
    choices.push({
      name: `  ${TUTORIALS.threads.title} ${chalk.gray(`(${TUTORIALS.threads.duration})`)} ${chalk.yellow("★ NEW")}`,
      value: "threads",
    });
    choices.push({
      name: `  ${TUTORIALS.steps.title} ${chalk.gray(`(${TUTORIALS.steps.duration})`)}`,
      value: "steps",
    });
    choices.push({
      name: `  ${TUTORIALS.ralph.title} ${chalk.gray(`(${TUTORIALS.ralph.duration})`)}`,
      value: "ralph",
    });
    choices.push({
      name: `  ${TUTORIALS.orchestration.title} ${chalk.gray(`(${TUTORIALS.orchestration.duration})`)}`,
      value: "orchestration",
    });

    // Command Categories
    choices.push(new inquirer.Separator(chalk.white.bold(" Command Reference")));
    choices.push({
      name: `  ${TUTORIALS.audit.title} ${chalk.gray(`(${TUTORIALS.audit.duration})`)}`,
      value: "audit",
    });
    choices.push({
      name: `  ${TUTORIALS.ops.title} ${chalk.gray(`(${TUTORIALS.ops.duration})`)}`,
      value: "ops",
    });
    choices.push({
      name: `  ${TUTORIALS.dev.title} ${chalk.gray(`(${TUTORIALS.dev.duration})`)}`,
      value: "dev",
    });
    choices.push({
      name: `  ${TUTORIALS.deploy.title} ${chalk.gray(`(${TUTORIALS.deploy.duration})`)}`,
      value: "deploy",
    });
    choices.push({
      name: `  ${TUTORIALS.generators.title} ${chalk.gray(`(${TUTORIALS.generators.duration})`)}`,
      value: "generators",
    });
    choices.push({
      name: `  ${TUTORIALS.marketing.title} ${chalk.gray(`(${TUTORIALS.marketing.duration})`)}`,
      value: "marketing",
    });

    // Platform-Specific
    choices.push(new inquirer.Separator(chalk.white.bold(" Platform-Specific")));
    choices.push({
      name: `  ${TUTORIALS.platforms.title} ${chalk.gray(`(${TUTORIALS.platforms.duration})`)}`,
      value: "platforms",
    });

    // Exit
    choices.push(new inquirer.Separator(""));
    choices.push({
      name: chalk.gray("  ← Back to main menu"),
      value: "menu",
    });

    const { section } = await inquirer.prompt([
      {
        type: "list",
        name: "section",
        message: "Choose a topic:",
        choices,
        pageSize: 20,
      },
    ]);

    if (section === "menu") {
      return "menu";
    }

    const result = await runTutorialSection(section);
    if (result === "exit") {
      return "exit";
    }
  }

  return "menu";
}

export default { runTutorial };
