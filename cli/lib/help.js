#!/usr/bin/env node

/**
 * Sigma Protocol Contextual Help System
 *
 * Provides detailed help for specific topics and commands.
 */

import chalk from "chalk";
import boxen from "boxen";

// Help topics with detailed content
const HELP_TOPICS = {
  steps: {
    title: "The 13-Step Workflow",
    description: "Sigma Protocol's core methodology for building products",
    content: `
The 13-step workflow guides you from idea to production:

${chalk.cyan.bold("Discovery Phase (Steps 1-4)")}
  ${chalk.yellow("@step-1-ideation")}       Product ideation using Hormozi frameworks
  ${chalk.yellow("@step-1.5-offer")}        Design your offer and pricing
  ${chalk.yellow("@step-2-architecture")}   System architecture design
  ${chalk.yellow("@step-3-ux-design")}      User experience design
  ${chalk.yellow("@step-4-flow-tree")}      Navigation and user flows

${chalk.cyan.bold("Design Phase (Steps 5-8)")}
  ${chalk.yellow("@step-5-wireframe")}      Wireframes and prototypes
  ${chalk.yellow("@step-5b-prd-to-json")}  Convert prototype PRD to Ralph format
  ${chalk.yellow("@step-6-design-system")}  Design system and components
  ${chalk.yellow("@step-7-states")}         Interface state specifications
  ${chalk.yellow("@step-8-technical")}      Technical specifications

${chalk.cyan.bold("Implementation Phase (Steps 9-13)")}
  ${chalk.yellow("@step-9-landing")}        Landing page generation
  ${chalk.yellow("@step-10-features")}      Feature breakdown
  ${chalk.yellow("@step-11-prd")}           PRD generation
  ${chalk.yellow("@step-11a-prd-json")}   Implementation PRD to Ralph
  ${chalk.yellow("@step-11b-swarm")}       PRD swarm orchestration
  ${chalk.yellow("@step-12-context")}       Context engine
  ${chalk.yellow("@step-13-skillpack")}     Generate skill packs

${chalk.white.bold("Quick Start:")}
  1. Run ${chalk.cyan("@step-1-ideation")} with your product idea
  2. Follow prompts through each step
  3. Use ${chalk.cyan("@continue")} to find your next task
`,
  },
  
  ralph: {
    title: "The Ralph Loop",
    description: "Autonomous implementation cycle",
    content: `
Ralph is Sigma Protocol's autonomous implementation system.

${chalk.cyan.bold("What is Ralph?")}
Ralph reads your PRDs (converted to JSON) and implements them story by story,
automatically committing after each verified implementation.

${chalk.cyan.bold("CLI Commands")}
  ${chalk.yellow("sigma ralph")}              Auto-detect and run backlogs
  ${chalk.yellow("sigma ralph --all")}        Run all backlogs sequentially
  ${chalk.yellow("sigma ralph --parallel")}   Run in parallel (iTerm/tmux)
  ${chalk.yellow("sigma ralph --observe")}    Add observer tab for logs
  ${chalk.yellow("sigma ralph -b <path>")}    Run specific backlog

${chalk.cyan.bold("Slash Commands (in Claude Code)")}
  ${chalk.yellow("/sigma-ralph")}              Interactive orchestration
  ${chalk.yellow("/sigma-ralph --stream=ios")} Run specific stream
  ${chalk.yellow("/sigma-ralph --all --parallel")} Parallel iTerm tabs
  ${chalk.yellow("@ralph-loop")}               Basic Ralph execution

${chalk.cyan.bold("Parallel Execution Backends")}
  ${chalk.white("iTerm2")} (macOS)    Auto-detected, opens tabs with observer
  ${chalk.white("tmux")}   (Unix)     Creates session with panes
  ${chalk.white("Task")}   (fallback) In-process sequential execution

${chalk.cyan.bold("How to Use Ralph")}
  1. Generate PRDs using ${chalk.cyan("@step-11-prd-generation")}
  2. Convert to JSON using ${chalk.cyan("@step-11a-prd-to-json")}
  3. Run ${chalk.cyan("sigma ralph")} or ${chalk.cyan("/sigma-ralph")}

${chalk.cyan.bold("Skill Delegation (CRITICAL)")}
  Workers MUST use skills, not implement directly:
  ${chalk.yellow("@senior-architect")}      Before coding
  ${chalk.yellow("@frontend-design")}       For UI components
  ${chalk.yellow("@systematic-debugging")}  On errors
  ${chalk.yellow("@gap-analysis")}          After implementing

${chalk.cyan.bold("Ralph File Structure")}
  docs/ralph/
    ├── ios/
    │   ├── prd.json        # iOS stories
    │   └── progress.txt    # Progress log
    └── web/
        ├── prd.json        # Web stories
        └── progress.txt

${chalk.cyan.bold("Observability (What You See)")}
  ${chalk.white("Worker Tabs")}    Live Claude Code streaming (tool invocations, edits)
  ${chalk.gray("--observe")}      (Optional) Extra tab with tail -f progress.txt

  The worker tabs show real-time execution - every Glob, Read, Edit,
  Bash command as it happens. This IS observability. The --observe
  flag just adds a summary log tab, which is rarely needed.
`,
  },
  
  audit: {
    title: "Audit Commands",
    description: "Code quality and compliance checking",
    content: `
Audit commands help maintain code quality and compliance.

${chalk.cyan.bold("Security & Compliance")}
  ${chalk.yellow("@security-audit")}        Scan for vulnerabilities (OWASP)
  ${chalk.yellow("@accessibility-audit")}   Check WCAG compliance
  ${chalk.yellow("@license-check")}         Verify dependency licenses
  ${chalk.yellow("@seo-audit")}             Search engine optimization check

${chalk.cyan.bold("Code Quality")}
  ${chalk.yellow("@performance-check")}     Analyze performance metrics
  ${chalk.yellow("@code-quality-report")}   Generate quality metrics
  ${chalk.yellow("@tech-debt-audit")}       Assess technical debt
  ${chalk.yellow("@simplify")}        Simplify and refactor code

${chalk.cyan.bold("Implementation Verification")}
  ${chalk.yellow("@gap-analysis")}          Verify PRD coverage
  ${chalk.yellow("@holes")}                 Find missing implementations

${chalk.cyan.bold("Usage")}
  Run any audit command in your AI IDE:
  ${chalk.gray("In Cursor/Claude Code:")} ${chalk.cyan("@security-audit")}
  ${chalk.gray("In OpenCode:")} ${chalk.cyan("/security-audit")}

${chalk.cyan.bold("Best Practice")}
  Run ${chalk.cyan("@gap-analysis")} after completing a feature
  Run ${chalk.cyan("@security-audit")} before deployment
  Run ${chalk.cyan("@maid")} weekly for maintenance
`,
  },
  
  orchestration: {
    title: "Multi-Agent Orchestration",
    description: "Run parallel AI agents for faster development",
    content: `
Orchestration allows multiple AI agents to work in parallel.

${chalk.cyan.bold("CLI Commands")}
  ${chalk.yellow("sigma orchestrate")}              Start orchestration
  ${chalk.yellow("sigma orchestrate --streams=4")} Start with 4 agents
  ${chalk.yellow("sigma orchestrate --attach")}    Attach to existing session
  ${chalk.yellow("sigma orchestrate --status")}    Check session status
  ${chalk.yellow("sigma orchestrate --kill")}      Stop orchestration
  ${chalk.yellow("sigma approve --stream=A")}      Approve stream A's work

${chalk.cyan.bold("Slash Commands (in AI IDE)")}
  ${chalk.yellow("@orchestrate/start")}    Start orchestration
  ${chalk.yellow("@orchestrate/status")}   Check status
  ${chalk.yellow("@orchestrate/attach")}   Attach to session
  ${chalk.yellow("@orchestrate/stop")}     Stop orchestration

${chalk.cyan.bold("How It Works")}
  1. Create PRDs in ${chalk.cyan(".sigma/orchestration/prds/")}
  2. Configure streams in ${chalk.cyan(".sigma/orchestration/streams.json")}
  3. Run ${chalk.cyan("sigma orchestrate")}
  4. Each stream works on its assigned PRD
  5. Approve completed work with ${chalk.cyan("sigma approve --stream=A")}

${chalk.cyan.bold("Stream Configuration")}
  ${chalk.gray(".sigma/orchestration/streams.json:")}
  {
    "streams": [
      { "name": "A", "prd": "auth-feature" },
      { "name": "B", "prd": "dashboard" }
    ]
  }

${chalk.cyan.bold("Voice Notifications")}
  Enable in ${chalk.cyan("sigma config")} with your ElevenLabs API key
  Get audio alerts when PRDs complete or agents crash
`,
  },
  
  retrofit: {
    title: "Retrofitting Existing Projects",
    description: "Add Sigma Protocol to existing codebases",
    content: `
Retrofit allows you to add Sigma Protocol to existing projects.

${chalk.cyan.bold("CLI Command")}
  ${chalk.yellow("sigma retrofit")}    Launch retrofit wizard

${chalk.cyan.bold("Retrofit Process")}
  1. ${chalk.white("Analysis")} - AI analyzes your codebase
  2. ${chalk.white("Documentation")} - Generate missing docs
  3. ${chalk.white("Enhancement")} - Improve existing docs
  4. ${chalk.white("Integration")} - Add Sigma commands

${chalk.cyan.bold("AI Commands")}
  ${chalk.yellow("@retrofit-analyze")}    Analyze existing codebase
  ${chalk.yellow("@retrofit-generate")}   Generate missing documentation
  ${chalk.yellow("@retrofit-enhance")}    Enhance existing documentation

${chalk.cyan.bold("What Gets Created")}
  - ARCHITECTURE.md (system design)
  - DECISIONS.md (ADRs)
  - PRD templates for existing features
  - Context files for AI understanding

${chalk.cyan.bold("Best Practice")}
  Run ${chalk.cyan("sigma retrofit")} before adding new features
  This helps AI understand your existing patterns
`,
  },
  
  platforms: {
    title: "Platform Support",
    description: "Cursor, Claude Code, OpenCode, and Codex",
    content: `
Sigma Protocol supports multiple AI IDEs/platforms.

${chalk.cyan.bold("Supported Platforms")}
  ${chalk.yellow("Cursor")}       @commands in Cursor IDE
  ${chalk.yellow("Claude Code")} /commands in Claude Code CLI
  ${chalk.yellow("OpenCode")}    /commands + agents in OpenCode
  ${chalk.yellow("Codex")}       Skills + AGENTS.md in Codex

${chalk.cyan.bold("Command Syntax by Platform")}
  ${chalk.gray("Cursor:")}      ${chalk.cyan("@step-1-ideation")}
  ${chalk.gray("Claude Code:")} ${chalk.cyan("/step-1-ideation")} or ${chalk.cyan("claude \"Run step 1\"")}
  ${chalk.gray("OpenCode:")}    ${chalk.cyan("/step-1-ideation")} or ${chalk.cyan("@sigma-implementer")}
  ${chalk.gray("Codex:")}       ${chalk.cyan("$step-1-ideation")} (skill invocation)

${chalk.cyan.bold("Directory Structure")}
  ${chalk.gray("Cursor:")}
    .cursor/rules/        # Cursor rules (MDC format)
    .cursor/commands/     # Command definitions

  ${chalk.gray("Claude Code:")}
    .claude/commands/     # Slash commands
    .claude/skills/       # Foundation skills
    .claude/agents/       # Subagents
    CLAUDE.md             # Orchestrator file

  ${chalk.gray("OpenCode:")}
    .opencode/command/    # Slash commands
    .opencode/skill/      # Skills (SKILL.md format)
    .opencode/agent/      # Agents
    opencode.json         # Configuration
    AGENTS.md             # Orchestrator file

  ${chalk.gray("Codex:")}
    .codex/config.toml    # Project config (optional)
    .codex/rules/         # Starlark rules (optional)
    .codex/skills/        # Skills (SKILL.md format)
    .agents/skills/       # Legacy skills (fallback)
    AGENTS.md             # Orchestrator file

${chalk.cyan.bold("Cross-Platform Note")}
  OpenCode automatically reads Claude Code files!
  Your .claude/skills/ work in OpenCode too.
`,
  },
  
  maid: {
    title: "Repository Maintenance",
    description: "Clean up and simplify your codebase",
    content: `
Maid helps maintain a clean, efficient codebase.

${chalk.cyan.bold("CLI Command")}
  ${chalk.yellow("sigma maid")}         Launch maintenance wizard
  ${chalk.yellow("sigma maid --quick")} Quick scan (non-AI)

${chalk.cyan.bold("AI Commands")}
  ${chalk.yellow("@maid")}             Full maintenance menu
  ${chalk.yellow("@maid --analyze")}   Deep analysis only
  ${chalk.yellow("@maid --cleanup")}   File cleanup mode
  ${chalk.yellow("@maid --simplify")}  Code simplification
  ${chalk.yellow("@maid --all")}       Cleanup + simplify

${chalk.cyan.bold("What Maid Does")}
  ${chalk.white("Cleanup Mode:")}
  - Identifies unused files
  - Finds orphaned test files
  - Detects duplicate code
  - Organizes project structure
  - Moves deletions to .sigma/delete/

  ${chalk.white("Simplify Mode:")}
  - Reduces code complexity
  - Refactors verbose patterns
  - Improves readability
  - Uses @simplify under the hood

${chalk.cyan.bold("Safety")}
  Maid never auto-deletes files!
  All deletions go to ${chalk.cyan(".sigma/delete/")}
  Review before permanently removing

${chalk.cyan.bold("Best Practice")}
  Run ${chalk.cyan("sigma maid")} weekly
  Review ${chalk.cyan(".sigma/delete/")} before clearing
`,
  },
};

/**
 * Display help for a topic
 */
export function showTopicHelp(topic) {
  const topicKey = topic.toLowerCase();
  const helpTopic = HELP_TOPICS[topicKey];
  
  if (!helpTopic) {
    showAvailableTopics();
    return;
  }
  
  console.log(
    boxen(
      chalk.cyan.bold(`${helpTopic.title}\n`) +
      chalk.gray(helpTopic.description),
      {
        padding: 1,
        margin: { top: 1, bottom: 0, left: 1, right: 1 },
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );
  
  console.log(helpTopic.content);
}

/**
 * Show available help topics
 */
export function showAvailableTopics() {
  console.log(
    boxen(
      chalk.cyan.bold("Sigma Protocol Help\n\n") +
      chalk.white("Available topics:\n\n") +
      Object.entries(HELP_TOPICS)
        .map(([key, topic]) => 
          chalk.yellow(`  sigma help ${key.padEnd(15)}`) + 
          chalk.gray(topic.description)
        )
        .join("\n") +
      chalk.white("\n\nOther help commands:\n\n") +
      chalk.yellow("  sigma --help") + chalk.gray("              General CLI help\n") +
      chalk.yellow("  sigma search <query>") + chalk.gray("      Search all commands\n") +
      chalk.yellow("  sigma tutorial") + chalk.gray("            Interactive tutorial"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );
}

/**
 * Run help command
 */
export function runHelp(topic) {
  if (topic) {
    showTopicHelp(topic);
  } else {
    showAvailableTopics();
  }
}

export default {
  showTopicHelp,
  showAvailableTopics,
  runHelp,
  HELP_TOPICS,
};
