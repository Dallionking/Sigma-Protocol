#!/usr/bin/env node

/**
 * SSS Protocol CLI
 *
 * Interactive installer for the Sigma Startup Stack methodology.
 * Supports Cursor, Claude Code, and OpenCode platforms.
 *
 * Usage:
 *   npx sss-protocol install    # Interactive installation
 *   npx sss-protocol build      # Build platform outputs
 *   npx sss-protocol status     # Check installation status
 *   npx sss-protocol update     # Update to latest version
 */

import { Command } from "commander";
import chalk from "chalk";
import figlet from "figlet";
import boxen from "boxen";
import ora from "ora";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// Platform configurations
const PLATFORMS = {
  cursor: {
    name: "Cursor",
    description: "@commands in Cursor IDE",
    outputDir: ".cursor/commands",
    rulesFile: ".cursorrules",
    rulesDir: ".cursor/rules",
  },
  "claude-code": {
    name: "Claude Code",
    description: "/commands in Claude Code CLI",
    outputDir: ".claude",
    agentsDir: ".claude/agents",
    skillsDir: ".claude/skills",
    hooksDir: ".claude/hooks",
    commandsDir: ".claude/commands",
    orchestrator: "CLAUDE.md",
  },
  opencode: {
    name: "OpenCode",
    description: "/commands + agents in OpenCode",
    outputDir: ".opencode",
    commandsDir: ".opencode/command",
    agentsDir: ".opencode/agent",
    toolsDir: ".opencode/tools",
    orchestrator: "AGENTS.md",
    configFile: "opencode.json",
  },
};

// Module configurations
const MODULES = {
  steps: {
    name: "SSS Steps",
    description: "Core 13-step product development workflow",
    required: true,
  },
  audit: {
    name: "Audit Commands",
    description: "Security, accessibility, and quality audits",
    required: false,
  },
  dev: {
    name: "Dev Commands",
    description: "Development workflow (implement-prd, plan)",
    required: false,
  },
  ops: {
    name: "Ops Commands",
    description: "Operations (pr-review, sprint-plan, status)",
    required: false,
  },
  deploy: {
    name: "Deploy Commands",
    description: "Deployment (ship-check, ship-prod)",
    required: false,
  },
  generators: {
    name: "Generator Commands",
    description: "Code generators (scaffold, test-gen)",
    required: false,
  },
  marketing: {
    name: "Marketing Commands",
    description: "Marketing workflow (launch playbook)",
    required: false,
  },
};

// Display banner
function showBanner() {
  console.log(
    chalk.cyan(
      figlet.textSync("SSS Protocol", {
        font: "Small",
        horizontalLayout: "default",
      }),
    ),
  );

  console.log(
    boxen(
      chalk.white("Sigma Startup Stack\n") +
        chalk.gray("Platform-agnostic AI development methodology"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      },
    ),
  );
}

// Detect existing installations
async function detectInstallations(targetDir) {
  const installations = {};

  for (const [platform, config] of Object.entries(PLATFORMS)) {
    const checkPath = path.join(targetDir, config.outputDir);
    installations[platform] = await fs.pathExists(checkPath);
  }

  return installations;
}

// Interactive platform selection
async function selectPlatforms(existing) {
  const choices = Object.entries(PLATFORMS).map(([id, config]) => ({
    name: `${config.name} - ${config.description}${existing[id] ? chalk.yellow(" (installed)") : ""}`,
    value: id,
    checked: existing[id] || id === "cursor", // Default to Cursor
  }));

  const { platforms } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "platforms",
      message: "Which platforms do you want to configure?",
      choices,
      validate: (answer) => {
        if (answer.length < 1) {
          return "You must select at least one platform.";
        }
        return true;
      },
    },
  ]);

  return platforms;
}

// Interactive module selection
async function selectModules() {
  const choices = Object.entries(MODULES).map(([id, config]) => ({
    name: `${config.name} - ${config.description}`,
    value: id,
    checked: config.required,
    disabled: config.required ? "Required" : false,
  }));

  const { modules } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "modules",
      message: "Which modules do you want to install?",
      choices,
    },
  ]);

  // Always include required modules
  const requiredModules = Object.entries(MODULES)
    .filter(([_, config]) => config.required)
    .map(([id]) => id);

  return [...new Set([...requiredModules, ...modules])];
}

// Build for Cursor platform
// Cursor uses the original files directly - they already have Cursor frontmatter
async function buildCursor(targetDir, modules, spinner) {
  const config = PLATFORMS.cursor;
  const outputDir = path.join(targetDir, config.outputDir);

  await fs.ensureDir(outputDir);

  let totalFiles = 0;

  // Copy module commands (original files are already Cursor-formatted)
  for (const module of modules) {
    const moduleSource = path.join(
      ROOT_DIR,
      module === "steps" ? "steps" : module,
    );
    if (await fs.pathExists(moduleSource)) {
      const destDir =
        module === "steps"
          ? path.join(outputDir, "steps")
          : path.join(outputDir, module);
      await fs.copy(moduleSource, destDir);

      const files = await fs.readdir(moduleSource);
      totalFiles += files.filter((f) => !f.startsWith(".")).length;
    }
  }

  spinner.text = `Cursor: Copied ${totalFiles} commands (full content preserved)`;

  // Copy schemas
  const schemasSource = path.join(ROOT_DIR, "schemas");
  if (await fs.pathExists(schemasSource)) {
    await fs.copy(schemasSource, path.join(targetDir, ".cursor", "schemas"));
  }

  return true;
}

// Build for Claude Code platform
// Transforms original commands by adding Claude Code frontmatter while preserving ALL content
async function buildClaudeCode(targetDir, modules, spinner) {
  const config = PLATFORMS["claude-code"];

  // Ensure directories
  await fs.ensureDir(path.join(targetDir, config.agentsDir));
  await fs.ensureDir(path.join(targetDir, config.skillsDir));
  await fs.ensureDir(path.join(targetDir, config.commandsDir));
  await fs.ensureDir(path.join(targetDir, config.hooksDir));

  let totalCommands = 0;

  // Transform each module's commands to Claude Code format
  for (const module of modules) {
    const moduleSource = path.join(
      ROOT_DIR,
      module === "steps" ? "steps" : module,
    );
    if (await fs.pathExists(moduleSource)) {
      const files = await fs.readdir(moduleSource);

      for (const file of files) {
        if (file.startsWith(".")) continue;

        const filePath = path.join(moduleSource, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) continue;

        const originalContent = await fs.readFile(filePath, "utf8");
        const claudeCodeContent = transformToClaudeCodeAgent(
          originalContent,
          file,
          module,
        );

        // Write as agent (full methodology content)
        const agentFileName = `${module}-${file}.md`;
        await fs.writeFile(
          path.join(targetDir, config.agentsDir, agentFileName),
          claudeCodeContent,
        );

        // Write as command (thin wrapper that invokes the agent)
        const commandContent = generateClaudeCodeCommand(file, module);
        await fs.writeFile(
          path.join(targetDir, config.commandsDir, `${file}.md`),
          commandContent,
        );

        totalCommands++;
      }
    }
  }

  spinner.text = `Claude Code: Transformed ${totalCommands} commands (full content preserved)`;

  // Copy skills from src/skills if they exist
  const skillsSource = path.join(ROOT_DIR, "src", "skills");
  if (await fs.pathExists(skillsSource)) {
    await fs.copy(skillsSource, path.join(targetDir, config.skillsDir));
  }

  // Copy hooks from claude-code directory if exists
  const hooksSource = path.join(ROOT_DIR, "claude-code", ".claude", "hooks");
  if (await fs.pathExists(hooksSource)) {
    await fs.copy(hooksSource, path.join(targetDir, config.hooksDir));
  }

  // Generate CLAUDE.md orchestrator
  const claudeMd = generateClaudeMd(modules);
  await fs.writeFile(path.join(targetDir, "CLAUDE.md"), claudeMd);

  return true;
}

// Transform original Cursor command to Claude Code agent format
// PRESERVES ALL ORIGINAL CONTENT - just adds Claude Code frontmatter
function transformToClaudeCodeAgent(originalContent, filename, module) {
  // Parse existing YAML frontmatter
  const frontmatterMatch = originalContent.match(
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/,
  );

  let existingFrontmatter = {};
  let bodyContent = originalContent;

  if (frontmatterMatch) {
    // Extract key fields from Cursor frontmatter
    const yamlContent = frontmatterMatch[1];
    bodyContent = frontmatterMatch[2];

    existingFrontmatter.version = yamlContent.match(
      /version:\s*"?([^"\n]+)"?/,
    )?.[1];
    existingFrontmatter.description = yamlContent.match(
      /description:\s*"?([^"\n]+)"?/,
    )?.[1];

    // Extract allowed-tools to convert to Claude Code format
    const toolsMatch = yamlContent.match(
      /allowed-tools:\s*\n([\s\S]*?)(?=\n[a-z]|\n---|\n$)/i,
    );
    if (toolsMatch) {
      existingFrontmatter.tools = toolsMatch[1]
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.replace(/^\s*-\s*/, "").trim())
        .filter(Boolean);
    }
  }

  // Build Claude Code agent format
  const claudeCodeAgent = `---
name: ${filename}
description: "${existingFrontmatter.description || `SSS ${module} command: ${filename}`}"
model: claude-sonnet-4-5-20241022
tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
${existingFrontmatter.tools?.some((t) => t.includes("mcp_")) ? "  # MCP tools inherited from original command" : ""}
---

# ${filename}

**Source:** SSS Protocol ${module} module
**Version:** ${existingFrontmatter.version || "1.0.0"}

---

${bodyContent}
`;

  return claudeCodeAgent;
}

// Generate thin Claude Code command that invokes the agent
function generateClaudeCodeCommand(filename, module) {
  return `---
description: "Run SSS ${module}/${filename}"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - WebFetch
---

# /${filename}

Invoke the **${filename}** agent from SSS Protocol.

This command runs the full ${filename} workflow including:
- All HITL (Human-in-the-Loop) checkpoints
- MCP research integration
- Quality verification gates

**Usage:** \`/${filename} [your input here]\`

@${module}-${filename}
`;
}

// Generate CLAUDE.md orchestrator with full module list
function generateClaudeMd(modules) {
  return `# SSS Protocol - Claude Code Configuration

## Overview

SSS Protocol is a **platform-agnostic 13-step product development methodology** for AI-assisted development.

This CLAUDE.md orchestrates the SSS workflow in Claude Code, providing access to all step commands, agents, and skills.

## Quick Start

\`\`\`bash
# Start with product ideation
claude "Run step 1 ideation for [your product idea]"

# Continue through the workflow
claude "Continue to step 2"

# Verify any step
claude "Verify step 1"

# Check status
claude "What step am I on?"
\`\`\`

## Available Commands

### Core Steps
| Command | Description |
|---------|-------------|
| \`/step-1-ideation\` | Product Ideation with Hormozi Value Equation |
| \`/step-2-architecture\` | System Architecture Design |
| \`/step-3-ux-design\` | UX/UI Design & User Flows |
| \`/step-4-flow-tree\` | Navigation Flow & Screen Inventory |
| \`/step-5-wireframe-prototypes\` | Wireframe Prototypes |
| \`/step-6-design-system\` | Design System & Tokens |
| \`/step-7-interface-states\` | Interface State Specifications |
| \`/step-8-technical-spec\` | Technical Specifications |
| \`/step-9-landing-page\` | Landing Page Design |
| \`/step-10-feature-breakdown\` | Feature Breakdown |
| \`/step-11-prd-generation\` | PRD Generation |
| \`/step-12-context-engine\` | Context Engine Setup |

${
  modules.includes("audit")
    ? `
### Audit Commands
| Command | Description |
|---------|-------------|
| \`/security-audit\` | Security vulnerability assessment |
| \`/accessibility-audit\` | WCAG compliance check |
| \`/performance-check\` | Performance analysis |
| \`/gap-analysis\` | PRD coverage analysis |
`
    : ""
}

${
  modules.includes("dev")
    ? `
### Dev Commands
| Command | Description |
|---------|-------------|
| \`/implement-prd\` | Implement a PRD feature |
| \`/plan\` | Create implementation plan |
`
    : ""
}

${
  modules.includes("ops")
    ? `
### Ops Commands
| Command | Description |
|---------|-------------|
| \`/pr-review\` | Pull request review |
| \`/sprint-plan\` | Sprint planning |
| \`/status\` | Project status check |
`
    : ""
}

## Workflow

\`\`\`
Step 0: Environment Setup
    ↓
Step 1: Ideation → MASTER_PRD.md
    ↓
Step 1.5: Offer Architecture (if monetized)
    ↓
Step 2: Architecture → ARCHITECTURE.md
    ↓
Step 3: UX Design → UX-DESIGN.md
    ↓
Step 4: Flow Tree → Bulletproof Gates
    ↓
Step 5: Wireframes (optional)
    ↓
Step 6: Design System → DESIGN-SYSTEM.md
    ↓
Step 7: Interface States → STATE-SPEC.md
    ↓
Step 8: Technical Spec → TECHNICAL-SPEC.md
    ↓
Step 9: Landing Page (optional)
    ↓
Step 10: Feature Breakdown → FEATURE-BREAKDOWN.md
    ↓
Step 11: PRD Generation → /docs/prds/*.md
    ↓
Step 12: Context Engine → .cursorrules
\`\`\`

## Key Principles

### Value Equation (Hormozi)
Every feature must maximize:
\`\`\`
Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)
\`\`\`

### HITL Checkpoints
Commands pause for human approval at critical points. Never skip these.

### Quality Gates
Each step has verification criteria. Target: 80+/100 score.

## Documentation

See https://github.com/your-org/sss-protocol for full documentation.
`;
}

// Build for OpenCode platform
// Transforms original commands by adding OpenCode syntax while preserving ALL content
async function buildOpenCode(targetDir, modules, spinner) {
  const config = PLATFORMS.opencode;

  // Ensure directories
  await fs.ensureDir(path.join(targetDir, config.commandsDir));
  await fs.ensureDir(path.join(targetDir, config.agentsDir));
  await fs.ensureDir(path.join(targetDir, config.toolsDir));

  let totalCommands = 0;

  // Transform each module's commands to OpenCode format
  for (const module of modules) {
    const moduleSource = path.join(
      ROOT_DIR,
      module === "steps" ? "steps" : module,
    );
    if (await fs.pathExists(moduleSource)) {
      const files = await fs.readdir(moduleSource);

      for (const file of files) {
        if (file.startsWith(".")) continue;

        const filePath = path.join(moduleSource, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) continue;

        const originalContent = await fs.readFile(filePath, "utf8");

        // Generate OpenCode command (thin wrapper with shell injection)
        const openCodeCommand = transformToOpenCodeCommand(
          originalContent,
          file,
          module,
        );
        await fs.writeFile(
          path.join(targetDir, config.commandsDir, `${file}.md`),
          openCodeCommand,
        );

        // Generate OpenCode agent (full content)
        const openCodeAgent = transformToOpenCodeAgent(
          originalContent,
          file,
          module,
        );
        await fs.writeFile(
          path.join(targetDir, config.agentsDir, `${file}.md`),
          openCodeAgent,
        );

        totalCommands++;
      }
    }
  }

  spinner.text = `OpenCode: Transformed ${totalCommands} commands (full content preserved)`;

  // Generate AGENTS.md orchestrator
  const agentsMd = generateAgentsMd(modules);
  await fs.writeFile(path.join(targetDir, "AGENTS.md"), agentsMd);

  // Generate opencode.json config
  const openCodeConfig = generateOpenCodeConfig(modules);
  await fs.writeFile(
    path.join(targetDir, "opencode.json"),
    JSON.stringify(openCodeConfig, null, 2),
  );

  // Copy custom tools from src/tools if they exist
  const toolsSource = path.join(ROOT_DIR, "src", "tools");
  if (await fs.pathExists(toolsSource)) {
    await fs.copy(toolsSource, path.join(targetDir, config.toolsDir));
  }

  return true;
}

// Transform original Cursor command to OpenCode command format
// This creates a thin wrapper that uses OpenCode-specific features
function transformToOpenCodeCommand(originalContent, filename, module) {
  // Parse existing YAML frontmatter
  const frontmatterMatch = originalContent.match(/^---\n([\s\S]*?)\n---/);
  let description = `SSS ${module}/${filename}`;

  if (frontmatterMatch) {
    const yamlContent = frontmatterMatch[1];
    const descMatch = yamlContent.match(/description:\s*"?([^"\n]+)"?/);
    if (descMatch) {
      description = descMatch[1];
    }
  }

  // OpenCode command with shell injection for project state
  return `---
description: ${description}
agent: ${filename}
---

# /${filename}

## Current Project State
!\`ls -la docs/specs/ 2>/dev/null || echo "No specs directory yet"\`
!\`ls -la docs/prds/ 2>/dev/null || echo "No PRDs yet"\`

## Recent Git Activity
!\`git log --oneline -5 2>/dev/null || echo "Not a git repo"\`

## Your Input
$ARGUMENTS

---

**This command invokes the @${filename} agent with full SSS Protocol methodology.**

Run with: \`/${filename} [your input]\`
`;
}

// Transform original Cursor command to OpenCode agent format
// PRESERVES ALL ORIGINAL CONTENT - just adds OpenCode agent frontmatter
function transformToOpenCodeAgent(originalContent, filename, module) {
  // Parse existing YAML frontmatter
  const frontmatterMatch = originalContent.match(
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/,
  );

  let existingFrontmatter = {};
  let bodyContent = originalContent;

  if (frontmatterMatch) {
    const yamlContent = frontmatterMatch[1];
    bodyContent = frontmatterMatch[2];

    existingFrontmatter.version = yamlContent.match(
      /version:\s*"?([^"\n]+)"?/,
    )?.[1];
    existingFrontmatter.description = yamlContent.match(
      /description:\s*"?([^"\n]+)"?/,
    )?.[1];
  }

  // Build OpenCode agent format with FULL original content
  const openCodeAgent = `---
description: "${existingFrontmatter.description || `SSS ${module}/${filename}`}"
mode: subagent
model: anthropic/claude-sonnet-4-20250514
temperature: 0.3
tools:
  write: true
  edit: true
  read: true
  bash: true
  webfetch: true
permission:
  bash:
    "rm -rf *": deny
    "git push --force": deny
    "*": allow
---

# ${filename}

**Source:** SSS Protocol ${module} module
**Version:** ${existingFrontmatter.version || "1.0.0"}
**Format:** OpenCode Agent (full methodology preserved)

---

${bodyContent}
`;

  return openCodeAgent;
}

// Generate AGENTS.md for OpenCode
function generateAgentsMd(_modules) {
  return `# SSS Protocol - OpenCode Configuration

## Overview

SSS Protocol is a 13-step product development methodology for AI-assisted development.
This configuration enables the SSS workflow in OpenCode.

## Available Commands

| Command | Description |
|---------|-------------|
| \`/step-1-ideation\` | Product Ideation & Validation |
| \`/step-2-architecture\` | System Architecture Design |
| \`/step-3-ux-design\` | UX/UI Design |
| \`/step-4-flow-tree\` | Navigation Flow Design |
| \`/step-5-wireframe-prototypes\` | Wireframe Prototypes |
| \`/step-6-design-system\` | Design System & Tokens |
| \`/step-7-interface-states\` | Interface State Specifications |
| \`/step-8-technical-spec\` | Technical Specifications |
| \`/step-9-landing-page\` | Landing Page Design |
| \`/step-10-feature-breakdown\` | Feature Breakdown |
| \`/step-11-prd-generation\` | PRD Generation |
| \`/step-12-context-engine\` | Context Engine Setup |

## Agents

Press Tab to switch between specialized agents:

- **venture-studio-partner** - Product vision and market validation
- **lead-architect** - System design and technical architecture
- **ux-director** - User experience and interface design
- **product-owner** - Feature breakdown and PRD generation
- **design-systems-architect** - Design tokens and component systems

## Custom Tools

- \`verify_step\` - Verify step completion against schema
- \`prd_score\` - Calculate PRD quality score
- \`step_status\` - Check which steps are complete

## Getting Started

1. Run \`/step-1-ideation\` with your product idea
2. Follow HITL (Human-in-the-Loop) checkpoints
3. Verify each step before proceeding
4. Use \`@verify\` to check step completion

## Documentation

See https://github.com/your-org/sss-protocol for full documentation.
`;
}

// Generate opencode.json config
function generateOpenCodeConfig(_modules) {
  return {
    $schema: "https://opencode.dev/schemas/config.json",
    name: "sss-protocol",
    version: "1.0.0",
    agents: {
      default: {
        model: "anthropic/claude-sonnet-4-20250514",
        temperature: 0.3,
      },
    },
    tools: {
      verify_step: {
        path: ".opencode/tools/verify-step.ts",
      },
      prd_score: {
        path: ".opencode/tools/prd-score.ts",
      },
      step_status: {
        path: ".opencode/tools/step-status.ts",
      },
    },
  };
}

// Install command handler
async function installCommand(options) {
  showBanner();

  const targetDir = options.target || process.cwd();
  console.log(chalk.gray(`Target directory: ${targetDir}\n`));

  // Detect existing installations
  const existing = await detectInstallations(targetDir);
  const hasExisting = Object.values(existing).some((v) => v);

  if (hasExisting) {
    console.log(chalk.yellow("Existing installations detected:\n"));
    for (const [platform, installed] of Object.entries(existing)) {
      if (installed) {
        console.log(`  ${chalk.green("✓")} ${PLATFORMS[platform].name}`);
      }
    }
    console.log("");
  }

  // Select platforms
  const platforms = await selectPlatforms(existing);
  console.log("");

  // Select modules
  const modules = await selectModules();
  console.log("");

  // Confirm installation
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Install SSS Protocol for ${platforms.map((p) => PLATFORMS[p].name).join(", ")}?`,
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("\nInstallation cancelled."));
    return;
  }

  console.log("");

  // Install for each platform
  for (const platform of platforms) {
    const spinner = ora(
      `Installing for ${PLATFORMS[platform].name}...`,
    ).start();

    try {
      switch (platform) {
        case "cursor":
          await buildCursor(targetDir, modules, spinner);
          break;
        case "claude-code":
          await buildClaudeCode(targetDir, modules, spinner);
          break;
        case "opencode":
          await buildOpenCode(targetDir, modules, spinner);
          break;
      }

      spinner.succeed(`${PLATFORMS[platform].name} installed successfully`);
    } catch (error) {
      spinner.fail(
        `${PLATFORMS[platform].name} installation failed: ${error.message}`,
      );
    }
  }

  // Show success message
  console.log("");
  console.log(
    boxen(
      chalk.green("SSS Protocol installed successfully!\n\n") +
        chalk.white("Next steps:\n") +
        platforms
          .map((p) => {
            switch (p) {
              case "cursor":
                return `  ${chalk.cyan("Cursor:")} Use @step-1-ideation to start`;
              case "claude-code":
                return `  ${chalk.cyan("Claude Code:")} Run "claude \\"Run step 1\\""`;
              case "opencode":
                return `  ${chalk.cyan("OpenCode:")} Use /step-1-ideation to start`;
            }
          })
          .join("\n"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "green",
      },
    ),
  );
}

// Status command handler
async function statusCommand(options) {
  showBanner();

  const targetDir = options.target || process.cwd();
  const existing = await detectInstallations(targetDir);

  console.log(chalk.white("Installation Status:\n"));

  for (const [platform, installed] of Object.entries(existing)) {
    const status = installed
      ? chalk.green("✓ Installed")
      : chalk.gray("○ Not installed");
    console.log(`  ${PLATFORMS[platform].name}: ${status}`);
  }

  console.log("");
}

// Build command handler
async function buildCommand(options) {
  const spinner = ora("Building platform outputs...").start();

  const targetDir = options.target || process.cwd();
  const platforms =
    options.platform === "all" ? Object.keys(PLATFORMS) : [options.platform];

  const modules = [
    "steps",
    "audit",
    "dev",
    "ops",
    "deploy",
    "generators",
    "marketing",
  ];

  for (const platform of platforms) {
    spinner.text = `Building for ${PLATFORMS[platform]?.name || platform}...`;

    try {
      switch (platform) {
        case "cursor":
          await buildCursor(targetDir, modules, spinner);
          break;
        case "claude-code":
          await buildClaudeCode(targetDir, modules, spinner);
          break;
        case "opencode":
          await buildOpenCode(targetDir, modules, spinner);
          break;
        default:
          throw new Error(`Unknown platform: ${platform}`);
      }
    } catch (error) {
      spinner.fail(`Build failed for ${platform}: ${error.message}`);
      process.exit(1);
    }
  }

  spinner.succeed("Build complete");
}

// Install Foundation Skills command handler
async function installSkillsCommand(options) {
  showBanner();

  const targetDir = options.target || process.cwd();
  const platformArg = options.platform || "all";
  const platforms =
    platformArg === "all"
      ? ["cursor", "claude-code", "opencode"]
      : [platformArg];

  console.log(chalk.white("Installing Foundation Skills...\n"));
  console.log(chalk.gray(`Target: ${targetDir}`));
  console.log(chalk.gray(`Platforms: ${platforms.join(", ")}\n`));

  const results = {
    cursor: { installed: 0, skipped: 0 },
    "claude-code": { installed: 0, skipped: 0 },
    opencode: { installed: 0, skipped: 0 },
  };

  for (const platform of platforms) {
    const spinner = ora(
      `Installing skills for ${PLATFORMS[platform]?.name || platform}...`,
    ).start();

    try {
      switch (platform) {
        case "cursor":
          await installCursorSkills(targetDir, spinner, results);
          break;
        case "claude-code":
          await installClaudeCodeSkills(targetDir, spinner, results);
          break;
        case "opencode":
          await installOpenCodeSkills(targetDir, spinner, results);
          break;
        default:
          throw new Error(`Unknown platform: ${platform}`);
      }

      const r = results[platform];
      spinner.succeed(
        `${PLATFORMS[platform]?.name || platform}: ${r.installed} skills installed${r.skipped > 0 ? `, ${r.skipped} skipped (already exist)` : ""}`,
      );
    } catch (error) {
      spinner.fail(
        `${PLATFORMS[platform]?.name || platform} failed: ${error.message}`,
      );
    }
  }

  // Summary
  const totalInstalled = Object.values(results).reduce(
    (sum, r) => sum + r.installed,
    0,
  );

  console.log("");
  console.log(
    boxen(
      chalk.green(`Foundation Skills installed!\n\n`) +
        chalk.white(
          `Total: ${totalInstalled} skills across ${platforms.length} platform(s)\n\n`,
        ) +
        chalk.gray("Skills include:\n") +
        chalk.gray(
          "  • SSS Core (research, verification, bdd-scenarios...)\n",
        ) +
        chalk.gray(
          "  • Design & Dev (ux-designer, architecture-patterns...)\n",
        ) +
        chalk.gray("  • Quality (systematic-debugging, quality-gates...)\n") +
        chalk.gray(
          "  • Productivity (prompt-engineering-patterns, xlsx...)\n",
        ) +
        chalk.gray("  • Platform Tools (skill-creator, agent-development...)"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "green",
      },
    ),
  );
}

// Install Cursor Foundation Skills
async function installCursorSkills(targetDir, spinner, results) {
  const sourceDir = path.join(ROOT_DIR, "platforms", "cursor", "rules");
  const destDir = path.join(targetDir, ".cursor", "rules");

  // Ensure destination exists
  await fs.ensureDir(destDir);

  // Check if source exists
  if (!(await fs.pathExists(sourceDir))) {
    throw new Error(`Source skills not found at ${sourceDir}`);
  }

  // Get all sss-*.mdc files
  const files = await fs.readdir(sourceDir);
  const skillFiles = files.filter(
    (f) => f.startsWith("sss-") && f.endsWith(".mdc"),
  );

  for (const file of skillFiles) {
    const destPath = path.join(destDir, file);

    // Check if already exists
    if (await fs.pathExists(destPath)) {
      results.cursor.skipped++;
      continue;
    }

    // Copy the file
    await fs.copy(path.join(sourceDir, file), destPath);
    results.cursor.installed++;

    spinner.text = `Cursor: Installing ${file}...`;
  }
}

// Install Claude Code Foundation Skills
async function installClaudeCodeSkills(targetDir, spinner, results) {
  const sourceDir = path.join(ROOT_DIR, "platforms", "claude-code", "skills");
  const destDir = path.join(targetDir, ".claude", "skills");

  // Ensure destination exists
  await fs.ensureDir(destDir);

  // Check if source exists
  if (!(await fs.pathExists(sourceDir))) {
    throw new Error(`Source skills not found at ${sourceDir}`);
  }

  // Get all skill directories
  const items = await fs.readdir(sourceDir);

  for (const item of items) {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(destDir, item);
    const stat = await fs.stat(srcPath);

    if (!stat.isDirectory()) continue;

    // Check if already exists
    if (await fs.pathExists(destPath)) {
      results["claude-code"].skipped++;
      continue;
    }

    // Copy the skill directory
    await fs.copy(srcPath, destPath);
    results["claude-code"].installed++;

    spinner.text = `Claude Code: Installing ${item}...`;
  }
}

// Install OpenCode Foundation Skills
async function installOpenCodeSkills(targetDir, spinner, results) {
  const sourceDir = path.join(ROOT_DIR, "platforms", "opencode", "skill");
  const destDir = path.join(targetDir, ".opencode", "skill");

  // Ensure destination exists
  await fs.ensureDir(destDir);

  // Check if source exists
  if (!(await fs.pathExists(sourceDir))) {
    throw new Error(`Source skills not found at ${sourceDir}`);
  }

  // Get all skill directories
  const items = await fs.readdir(sourceDir);

  for (const item of items) {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(destDir, item);
    const stat = await fs.stat(srcPath);

    if (!stat.isDirectory()) continue;

    // Check if already exists
    if (await fs.pathExists(destPath)) {
      results.opencode.skipped++;
      continue;
    }

    // Copy the skill directory
    await fs.copy(srcPath, destPath);
    results.opencode.installed++;

    spinner.text = `OpenCode: Installing ${item}...`;
  }
}

// Main CLI setup
const program = new Command();

program
  .name("sss-protocol")
  .description("SSS Protocol - Platform-agnostic AI development methodology")
  .version("1.0.0-alpha.1");

program
  .command("install")
  .description("Interactive installation of SSS Protocol")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(installCommand);

program
  .command("status")
  .description("Check SSS Protocol installation status")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(statusCommand);

program
  .command("build")
  .description("Build platform-specific outputs")
  .option(
    "-p, --platform <platform>",
    "Platform to build (cursor, claude-code, opencode, all)",
    "all",
  )
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(buildCommand);

program
  .command("update")
  .description("Update SSS Protocol to latest version")
  .action(() => {
    console.log(
      chalk.yellow("Update command coming soon. For now, reinstall with:"),
    );
    console.log(chalk.cyan("  npx sss-protocol@latest install"));
  });

program
  .command("install-skills")
  .description("Install Foundation Skills to your project")
  .option(
    "-p, --platform <platform>",
    "Platform to install skills for (cursor, claude-code, opencode, all)",
    "all",
  )
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(installSkillsCommand);

program.parse();
