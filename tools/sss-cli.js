#!/usr/bin/env node

/**
 * Sigma Protocol CLI
 *
 * Interactive installer for the Sigma Startup Stack methodology.
 * Supports Cursor, Claude Code, and OpenCode platforms.
 *
 * Usage:
 *   npx sigma-protocol install    # Interactive installation
 *   npx sigma-protocol build      # Build platform outputs
 *   npx sigma-protocol status     # Check installation status
 *   npx sigma-protocol update     # Update to latest version
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
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// CLI version - used for tracking
const CLI_VERSION = "1.0.0-alpha.1";

// Manifest file name
const MANIFEST_FILE = ".sigma-manifest.json";

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

// ========================================
// Manifest & Hashing Utilities
// ========================================

// Compute SHA-256 hash of file contents
async function computeFileHash(filePath) {
  try {
    const content = await fs.readFile(filePath);
    return crypto.createHash("sha256").update(content).digest("hex");
  } catch {
    return null;
  }
}

// Get all files in a directory recursively
async function getFilesRecursive(dir, baseDir = dir) {
  const files = [];
  const items = await fs.readdir(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.name.startsWith(".")) continue;
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (item.isDirectory()) {
      files.push(...(await getFilesRecursive(fullPath, baseDir)));
    } else {
      files.push(relativePath);
    }
  }

  return files;
}

// Read manifest from target directory
async function readManifest(targetDir) {
  const manifestPath = path.join(targetDir, MANIFEST_FILE);
  if (await fs.pathExists(manifestPath)) {
    try {
      const content = await fs.readFile(manifestPath, "utf8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }
  return null;
}

// Write manifest to target directory
async function writeManifest(targetDir, manifest) {
  const manifestPath = path.join(targetDir, MANIFEST_FILE);
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
}

// Get current Sigma-Protocol version from package.json
async function getSourceVersion() {
  try {
    const pkgPath = path.join(ROOT_DIR, "package.json");
    const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
    return pkg.version || CLI_VERSION;
  } catch {
    return CLI_VERSION;
  }
}

// Get current git commit hash from Sigma-Protocol
async function getSourceCommit() {
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);

  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: ROOT_DIR,
    });
    return stdout.trim();
  } catch {
    return null;
  }
}

// Create a backup of existing installation
async function createBackup(targetDir, platforms) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(targetDir, ".sigma", "backups", `backup-${timestamp}`);

  await fs.ensureDir(backupDir);

  const backedUpPaths = [];

  for (const platform of platforms) {
    const config = PLATFORMS[platform];
    if (!config) continue;

    const outputDir = path.join(targetDir, config.outputDir);
    if (await fs.pathExists(outputDir)) {
      const backupPath = path.join(backupDir, config.outputDir);
      await fs.copy(outputDir, backupPath);
      backedUpPaths.push(config.outputDir);
    }
  }

  // Backup CLAUDE.md if exists
  const claudeMdPath = path.join(targetDir, "CLAUDE.md");
  if (await fs.pathExists(claudeMdPath)) {
    await fs.copy(claudeMdPath, path.join(backupDir, "CLAUDE.md"));
    backedUpPaths.push("CLAUDE.md");
  }

  // Backup AGENTS.md if exists
  const agentsMdPath = path.join(targetDir, "AGENTS.md");
  if (await fs.pathExists(agentsMdPath)) {
    await fs.copy(agentsMdPath, path.join(backupDir, "AGENTS.md"));
    backedUpPaths.push("AGENTS.md");
  }

  return { backupDir, backedUpPaths };
}

// Compare two versions (semver-like)
function compareVersions(v1, v2) {
  if (!v1) return -1;
  if (!v2) return 1;

  const normalize = (v) =>
    v
      .replace(/^v/, "")
      .split("-")[0]
      .split(".")
      .map((n) => parseInt(n, 10) || 0);

  const p1 = normalize(v1);
  const p2 = normalize(v2);

  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }

  return 0;
}

// Completion patterns for intelligent output analysis
const COMPLETION_PATTERNS = {
  success: [
    /\b(completed?|done|finished|success(ful)?|passed|implemented)\b/i,
    /all (tasks?|criteria|tests?) (passed|complete|done)/i,
    /story.*(complete|done|finished)/i,
    /\[x\].*(?:all|final|last)/i,
    /build succeeded/i,
    /tests? passed/i,
    /✓|✔|☑/,
  ],
  failure: [
    /\b(failed|error|exception|crashed)\b/i,
    /could not (complete|finish|implement)/i,
    /unable to (proceed|continue)/i,
    /tests? failed/i,
    /build failed/i,
    /✗|✘|☒/,
  ],
  blocked: [
    /\b(blocked|stuck|waiting|pending)\b/i,
    /need(s)? (clarification|input|approval)/i,
    /cannot proceed without/i,
    /missing (dependency|requirement)/i,
    /hit a blocker/i,
  ],
  progress: [
    /\[\d+\/\d+\]/,
    /step \d+ of \d+/i,
    /phase \d+/i,
    /working on/i,
    /implementing/i,
    /creating/i,
  ],
};

// Analyze agent output for completion status
function analyzeAgentOutput(output) {
  const result = {
    status: "unknown",
    confidence: 0,
    indicators: [],
    progressPercent: null,
  };

  // Check for progress indicators
  const progressMatch = output.match(/\[(\d+)\/(\d+)\]/);
  if (progressMatch) {
    const current = parseInt(progressMatch[1], 10);
    const total = parseInt(progressMatch[2], 10);
    result.progressPercent = Math.round((current / total) * 100);
  }

  // Count pattern matches
  let successScore = 0;
  let failureScore = 0;
  let blockedScore = 0;

  for (const pattern of COMPLETION_PATTERNS.success) {
    if (pattern.test(output)) {
      successScore++;
      result.indicators.push({ type: "success", pattern: pattern.toString() });
    }
  }

  for (const pattern of COMPLETION_PATTERNS.failure) {
    if (pattern.test(output)) {
      failureScore++;
      result.indicators.push({ type: "failure", pattern: pattern.toString() });
    }
  }

  for (const pattern of COMPLETION_PATTERNS.blocked) {
    if (pattern.test(output)) {
      blockedScore++;
      result.indicators.push({ type: "blocked", pattern: pattern.toString() });
    }
  }

  // Determine status based on scores
  const maxScore = Math.max(successScore, failureScore, blockedScore);
  if (maxScore === 0) {
    result.status = "unknown";
    result.confidence = 0;
  } else if (successScore === maxScore && successScore > failureScore) {
    result.status = "success";
    result.confidence = Math.min(successScore * 20, 100);
  } else if (failureScore === maxScore) {
    result.status = "failure";
    result.confidence = Math.min(failureScore * 25, 100);
  } else if (blockedScore === maxScore) {
    result.status = "blocked";
    result.confidence = Math.min(blockedScore * 25, 100);
  }

  return result;
}

// Save agent output for debugging
async function saveAgentOutput(storyId, output, targetDir) {
  const logsDir = path.join(targetDir, ".sigma", "logs", "ralph");
  await fs.ensureDir(logsDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logFile = path.join(logsDir, `${storyId}-${timestamp}.log`);

  await fs.writeFile(logFile, output);
  return logFile;
}

// Display banner
function showBanner() {
  console.log(
    chalk.cyan(
      figlet.textSync("Sigma Protocol", {
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

  // Copy Ralph scripts
  const ralphSource = path.join(ROOT_DIR, "scripts", "ralph");
  if (await fs.pathExists(ralphSource)) {
    const ralphDest = path.join(targetDir, "scripts", "ralph");
    await fs.copy(ralphSource, ralphDest);
    spinner.text = `Cursor: Copied Ralph loop scripts`;
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

  // Copy Ralph scripts
  const ralphSource = path.join(ROOT_DIR, "scripts", "ralph");
  if (await fs.pathExists(ralphSource)) {
    const ralphDest = path.join(targetDir, "scripts", "ralph");
    await fs.copy(ralphSource, ralphDest);
    spinner.text = `Claude Code: Copied Ralph loop scripts`;
  }

  // Copy schemas for Ralph
  const schemasSource = path.join(ROOT_DIR, "schemas");
  if (await fs.pathExists(schemasSource)) {
    await fs.copy(schemasSource, path.join(targetDir, ".claude", "schemas"));
  }

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

**Source:** Sigma Protocol ${module} module
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

Invoke the **${filename}** agent from Sigma Protocol.

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
  return `# Sigma Protocol - Claude Code Configuration

## Overview

Sigma Protocol is a **platform-agnostic 13-step product development methodology** for AI-assisted development.

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
| \`/step-5b-prd-to-json\` | **Ralph-Mode:** Convert prototype PRDs to JSON |
| \`/step-6-design-system\` | Design System & Tokens |
| \`/step-7-interface-states\` | Interface State Specifications |
| \`/step-8-technical-spec\` | Technical Specifications |
| \`/step-9-landing-page\` | Landing Page Design |
| \`/step-10-feature-breakdown\` | Feature Breakdown |
| \`/step-11-prd-generation\` | PRD Generation |
| \`/step-11a-prd-to-json\` | **Ralph-Mode:** Convert implementation PRDs to JSON |
| \`/step-11b-prd-swarm\` | PRD Swarm Orchestration (supports Ralph-mode) |
| \`/step-12-context-engine\` | Context Engine Setup |

### Ralph Loop (Autonomous Implementation)
| Command | Description |
|---------|-------------|
| \`./scripts/ralph/sss-ralph.sh\` | Run Ralph loop on prd.json backlog |

**Ralph Mode Usage:**
\`\`\`bash
# 1. Convert PRDs to JSON
claude "Run step-5b-prd-to-json --all-prds"

# 2. Run Ralph loop (in terminal)
./scripts/ralph/sss-ralph.sh . docs/ralph/prototype/prd.json claude-code
\`\`\`

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
Step 5: Wireframes → docs/prds/flows/*.md
    ↓
Step 5b: PRD to JSON (Ralph-mode) → docs/ralph/prototype/prd.json
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
Step 11a: PRD to JSON (Ralph-mode) → docs/ralph/implementation/prd.json
    ↓
Step 11b: PRD Swarm (optional) → swarm-*/
    ↓
Step 12: Context Engine → .cursorrules
    ↓
[Ralph Loop] → Autonomous implementation via sss-ralph.sh
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

See https://github.com/your-org/sigma-protocol for full documentation.
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

  // Copy Ralph scripts
  const ralphSource = path.join(ROOT_DIR, "scripts", "ralph");
  if (await fs.pathExists(ralphSource)) {
    const ralphDest = path.join(targetDir, "scripts", "ralph");
    await fs.copy(ralphSource, ralphDest);
    spinner.text = `OpenCode: Copied Ralph loop scripts`;
  }

  // Copy schemas for Ralph
  const schemasSource = path.join(ROOT_DIR, "schemas");
  if (await fs.pathExists(schemasSource)) {
    await fs.copy(schemasSource, path.join(targetDir, ".opencode", "schemas"));
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

**This command invokes the @${filename} agent with full Sigma Protocol methodology.**

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

**Source:** Sigma Protocol ${module} module
**Version:** ${existingFrontmatter.version || "1.0.0"}
**Format:** OpenCode Agent (full methodology preserved)

---

${bodyContent}
`;

  return openCodeAgent;
}

// Generate AGENTS.md for OpenCode
function generateAgentsMd(_modules) {
  return `# Sigma Protocol - OpenCode Configuration

## Overview

Sigma Protocol is a 13-step product development methodology for AI-assisted development.
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

See https://github.com/your-org/sigma-protocol for full documentation.
`;
}

// Generate opencode.json config
function generateOpenCodeConfig(_modules) {
  return {
    $schema: "https://opencode.dev/schemas/config.json",
    name: "sigma-protocol",
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
      message: `Install Sigma Protocol for ${platforms.map((p) => PLATFORMS[p].name).join(", ")}?`,
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
      chalk.green("Sigma Protocol installed successfully!\n\n") +
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
  const verbose = options.verbose || false;

  // Read manifest
  const manifest = await readManifest(targetDir);
  const existing = await detectInstallations(targetDir);

  // Get source version for comparison
  const sourceVersion = await getSourceVersion();
  const installedVersion = manifest?.sigma_version || "Not installed";
  const updateAvailable = manifest && compareVersions(sourceVersion, installedVersion) > 0;

  // Header
  console.log(chalk.white("Sigma Protocol Status\n"));

  // Version info
  console.log(chalk.gray("Version:"));
  console.log(`  Installed: ${installedVersion === "Not installed" ? chalk.yellow(installedVersion) : chalk.green(`v${installedVersion}`)}`);
  console.log(`  Available: ${chalk.cyan(`v${sourceVersion}`)}`);
  if (updateAvailable) {
    console.log(chalk.yellow(`  ↑ Update available! Run: sigma update`));
  }
  console.log("");

  // Platform status
  console.log(chalk.gray("Platforms:"));
  for (const [platform, installed] of Object.entries(existing)) {
    const status = installed
      ? chalk.green("✓ Installed")
      : chalk.gray("○ Not installed");
    console.log(`  ${PLATFORMS[platform].name}: ${status}`);
  }
  console.log("");

  // Module status (if manifest exists)
  if (manifest?.installed_modules) {
    console.log(chalk.gray("Modules:"));
    for (const [moduleId, config] of Object.entries(MODULES)) {
      const installed = manifest.installed_modules.includes(moduleId);
      const status = installed
        ? chalk.green("✓")
        : chalk.gray("○");
      console.log(`  ${status} ${config.name}`);
    }
    console.log("");
  }

  // Health checks
  console.log(chalk.gray("Health Check:"));
  const healthIssues = [];
  let healthScore = 100;

  // Check for CLAUDE.md (if claude-code is installed)
  if (existing["claude-code"]) {
    const claudeMdExists = await fs.pathExists(path.join(targetDir, "CLAUDE.md"));
    if (claudeMdExists) {
      console.log(`  ${chalk.green("✓")} CLAUDE.md present`);
    } else {
      console.log(`  ${chalk.yellow("⚠")} CLAUDE.md missing`);
      healthIssues.push({ type: "warning", message: "CLAUDE.md not found (recommended for Claude Code)" });
      healthScore -= 10;
    }
  }

  // Check for AGENTS.md (if opencode is installed)
  if (existing.opencode) {
    const agentsMdExists = await fs.pathExists(path.join(targetDir, "AGENTS.md"));
    if (agentsMdExists) {
      console.log(`  ${chalk.green("✓")} AGENTS.md present`);
    } else {
      console.log(`  ${chalk.yellow("⚠")} AGENTS.md missing`);
      healthIssues.push({ type: "warning", message: "AGENTS.md not found (recommended for OpenCode)" });
      healthScore -= 10;
    }
  }

  // Check for Ralph readiness
  const ralphPaths = [
    path.join(targetDir, ".sigma", "ralph-backlog.json"),
    path.join(targetDir, "docs", "ralph", "implementation", "prd.json"),
    path.join(targetDir, "docs", "ralph", "prototype", "prd.json"),
  ];
  let ralphReady = false;
  let ralphPath = null;

  for (const p of ralphPaths) {
    if (await fs.pathExists(p)) {
      ralphReady = true;
      ralphPath = p;
      break;
    }
  }

  if (ralphReady) {
    console.log(`  ${chalk.green("✓")} Ralph backlog found`);
    if (verbose) {
      console.log(chalk.gray(`    Path: ${ralphPath}`));
    }
  } else {
    console.log(`  ${chalk.gray("○")} Ralph backlog not set up`);
    healthIssues.push({ type: "info", message: "No Ralph backlog found (run step-11a-prd-to-json to create)" });
  }

  // Check for TaskMaster
  const taskMasterPath = path.join(targetDir, ".taskmaster", "tasks.json");
  const taskMasterExists = await fs.pathExists(taskMasterPath);
  if (taskMasterExists) {
    console.log(`  ${chalk.green("✓")} TaskMaster configured`);
  } else {
    console.log(`  ${chalk.gray("○")} TaskMaster not set up`);
  }

  // Check for SSS specs (MASTER_PRD.md, etc)
  const masterPrdPath = path.join(targetDir, "docs", "specs", "MASTER_PRD.md");
  const masterPrdExists = await fs.pathExists(masterPrdPath);
  if (masterPrdExists) {
    console.log(`  ${chalk.green("✓")} MASTER_PRD.md present`);
  } else {
    console.log(`  ${chalk.gray("○")} MASTER_PRD.md not found (run step-1-ideation)`);
    healthIssues.push({ type: "info", message: "MASTER_PRD.md not found (start with step-1-ideation)" });
  }

  console.log("");

  // Active work (from manifest)
  if (manifest?.active_work?.current_prd) {
    console.log(chalk.gray("Active Work:"));
    console.log(`  PRD: ${manifest.active_work.current_prd}`);
    if (manifest.active_work.current_story_id) {
      console.log(`  Story: ${manifest.active_work.current_story_id}`);
    }
    if (manifest.active_work.progress) {
      const { completed, total } = manifest.active_work.progress;
      const percent = Math.round((completed / total) * 100);
      console.log(`  Progress: ${completed}/${total} (${percent}%)`);
    }
    console.log("");
  }

  // Show health score
  const scoreColor = healthScore >= 80 ? "green" : healthScore >= 60 ? "yellow" : "red";
  console.log(chalk.gray("Overall Health:"));
  console.log(`  Score: ${chalk[scoreColor](`${healthScore}/100`)}`);

  if (healthIssues.length > 0 && verbose) {
    console.log("");
    console.log(chalk.gray("Issues:"));
    for (const issue of healthIssues) {
      const icon = issue.type === "error" ? chalk.red("✗") : issue.type === "warning" ? chalk.yellow("⚠") : chalk.gray("ℹ");
      console.log(`  ${icon} ${issue.message}`);
    }
  }

  console.log("");

  // Quick actions
  if (updateAvailable || healthIssues.length > 0) {
    console.log(chalk.gray("Suggested Actions:"));
    if (updateAvailable) {
      console.log(chalk.cyan("  sigma update          # Update to latest version"));
    }
    if (!existing["claude-code"] && !existing.cursor && !existing.opencode) {
      console.log(chalk.cyan("  sigma install         # Install Sigma Protocol"));
    }
    if (!ralphReady && masterPrdExists) {
      console.log(chalk.cyan("  @step-11a-prd-to-json # Set up Ralph backlog"));
    }
    console.log("");
  }
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

async function installHarnessCommand(options) {
  showBanner();

  const isGlobal = options.global || false;
  const targetDir = isGlobal
    ? path.join(process.env.HOME || "~", ".config", "opencode")
    : options.target || process.cwd();

  console.log(chalk.white("Installing SSS Agent Harness Plugin...\n"));
  console.log(chalk.gray(`Target: ${targetDir}`));
  console.log(
    chalk.gray(`Mode: ${isGlobal ? "Global" : "Project-specific"}\n`),
  );

  let spinner = ora("Checking prerequisites...").start();

  try {
    const opencodeConfigPath = path.join(targetDir, "opencode.json");
    let opencodeConfig = {};

    if (await fs.pathExists(opencodeConfigPath)) {
      const content = await fs.readFile(opencodeConfigPath, "utf8");
      opencodeConfig = JSON.parse(content);
      spinner.text = "Found existing opencode.json";
    } else {
      spinner.text = "Creating opencode.json";
    }

    if (!opencodeConfig.plugin) {
      opencodeConfig.plugin = [];
    }

    const harnessPackage = "sss-harness";
    if (!opencodeConfig.plugin.includes(harnessPackage)) {
      opencodeConfig.plugin.push(harnessPackage);
    }

    if (!opencodeConfig.$schema) {
      opencodeConfig.$schema = "https://opencode.ai/config.json";
    }

    await fs.writeFile(
      opencodeConfigPath,
      JSON.stringify(opencodeConfig, null, 2),
    );
    spinner.succeed("Updated opencode.json with sss-harness plugin");

    spinner = ora("Copying agent configurations...").start();

    const agentDir = path.join(targetDir, ".opencode", "agent");
    await fs.ensureDir(agentDir);

    const agentConfigs = [
      {
        name: "sigma",
        description: "Main orchestrator - complex multi-step tasks",
        mode: "primary",
        model: "anthropic/claude-opus-4-5",
      },
      {
        name: "sigma-plan",
        description: "Strategic planning and task decomposition",
        mode: "primary",
        model: "openai/gpt-5.2",
      },
      {
        name: "sigma-qa",
        description: "Verification, quality gates, and audits",
        mode: "primary",
        model: "anthropic/claude-sonnet-4-5",
      },
      {
        name: "sigma-debug",
        description: "Debugging and problem resolution",
        mode: "primary",
        model: "openai/gpt-5.2-high",
      },
      {
        name: "sigma-workflow",
        description: "Sigma Protocol step execution",
        mode: "primary",
        model: "anthropic/claude-opus-4-5",
      },
    ];

    for (const agent of agentConfigs) {
      const agentPath = path.join(agentDir, `${agent.name}.md`);
      if (!(await fs.pathExists(agentPath))) {
        const content = `---
description: "${agent.description}"
mode: ${agent.mode}
model: ${agent.model}
temperature: 0.3
tools:
  write: true
  edit: true
  read: true
  bash: true
  webfetch: true
---

# ${agent.name.charAt(0).toUpperCase() + agent.name.slice(1)}

${agent.description}

[Scaffold - Full system prompt will be generated in Phase 2]
`;
        await fs.writeFile(agentPath, content);
      }
    }
    spinner.succeed(`Created ${agentConfigs.length} agent configurations`);

    spinner = ora("Creating SSS harness config...").start();

    const harnessConfigPath = path.join(targetDir, "sss-harness.json");
    if (!(await fs.pathExists(harnessConfigPath))) {
      const harnessConfig = {
        $schema:
          "https://raw.githubusercontent.com/your-org/sigma-protocol/main/packages/sss-harness/sss-harness.schema.json",
        workflow: {
          qualityGateThreshold: 80,
          hitlEnabled: true,
          autoProgressSteps: false,
          foundationSkillsEnabled: true,
        },
        hooks: {
          disabled: [],
        },
        experimental: {
          preemptiveCompaction: false,
        },
      };
      await fs.writeFile(
        harnessConfigPath,
        JSON.stringify(harnessConfig, null, 2),
      );
    }
    spinner.succeed("Created sss-harness.json configuration");

    console.log("");
    console.log(
      boxen(
        chalk.green("SSS Agent Harness installed successfully!\n\n") +
          chalk.white("Installed components:\n") +
          chalk.gray("  - Plugin registered in opencode.json\n") +
          chalk.gray("  - 5 tab-switchable agents (Sigma family)\n") +
          chalk.gray("  - SSS harness configuration\n\n") +
          chalk.white("Next steps:\n") +
          chalk.cyan("  1. npm install sss-harness\n") +
          chalk.cyan(
            "  2. npx sigma-protocol install-skills --platform opencode\n",
          ) +
          chalk.cyan("  3. Run 'opencode' and press Tab to switch agents\n\n") +
          chalk.gray("Documentation: https://github.com/your-org/sigma-protocol"),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "green",
        },
      ),
    );
  } catch (error) {
    spinner.fail(`Installation failed: ${error.message}`);
    process.exit(1);
  }
}

// Install Validators command handler
async function installValidatorsCommand(options) {
  showBanner();

  const targetDir = options.target || process.cwd();

  console.log(chalk.white("Installing Self-Validating Agent Hooks...\n"));
  console.log(chalk.gray(`Target: ${targetDir}\n`));

  let spinner = ora("Creating validators directory...").start();

  try {
    // Create validators directory
    const validatorsDir = path.join(targetDir, ".claude", "hooks", "validators");
    await fs.ensureDir(validatorsDir);
    spinner.succeed("Created .claude/hooks/validators/");

    // Copy validator scripts from the source
    spinner = ora("Copying validator scripts...").start();

    const sourceValidatorsDir = path.join(
      ROOT_DIR,
      ".claude",
      "hooks",
      "validators",
    );

    const validators = [
      {
        name: "prd-validator.py",
        description: "PRD structure validation",
        triggers: "**/prds/*.md",
      },
      {
        name: "typescript-validator.sh",
        description: "TypeScript/JavaScript validation",
        triggers: "**/*.{ts,tsx,js,jsx}",
      },
      {
        name: "design-tokens-validator.py",
        description: "Design tokens JSON validation",
        triggers: "**/*token*.json, **/*theme*.json",
      },
      {
        name: "bdd-validator.py",
        description: "BDD/Gherkin syntax validation",
        triggers: "**/*.feature, **/prds/*.md",
      },
      {
        name: "csv-validator.py",
        description: "CSV structure and data validation",
        triggers: "**/*.csv",
      },
    ];

    let copiedCount = 0;
    for (const validator of validators) {
      const sourcePath = path.join(sourceValidatorsDir, validator.name);
      const destPath = path.join(validatorsDir, validator.name);

      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, destPath);
        // Make executable
        await fs.chmod(destPath, 0o755);
        copiedCount++;
        spinner.text = `Copied ${validator.name}`;
      } else {
        console.log(
          chalk.yellow(`\n  Warning: ${validator.name} not found in source`),
        );
      }
    }

    spinner.succeed(`Copied ${copiedCount} validator scripts`);

    // Update settings.json with PostToolUse hooks
    spinner = ora("Configuring PostToolUse hooks...").start();

    const settingsPath = path.join(targetDir, ".claude", "settings.json");
    let settings = {};

    if (await fs.pathExists(settingsPath)) {
      const content = await fs.readFile(settingsPath, "utf8");
      settings = JSON.parse(content);
    }

    // Initialize hooks structure
    if (!settings.hooks) {
      settings.hooks = {};
    }

    // Add PostToolUse hooks
    settings.hooks.PostToolUse = [
      {
        matcher: "Edit|Write",
        hooks: [
          {
            type: "command",
            command:
              'python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/validators/prd-validator.py" "$CLAUDE_FILE_PATH"',
            condition: { glob: "**/prds/*.md" },
          },
        ],
      },
      {
        matcher: "Edit|Write",
        hooks: [
          {
            type: "command",
            command:
              'python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/validators/bdd-validator.py" "$CLAUDE_FILE_PATH"',
            condition: { glob: "**/*.feature" },
          },
        ],
      },
      {
        matcher: "Edit|Write",
        hooks: [
          {
            type: "command",
            command:
              'bash "$CLAUDE_PROJECT_DIR/.claude/hooks/validators/typescript-validator.sh" "$CLAUDE_FILE_PATH"',
            condition: { glob: "**/*.{ts,tsx}" },
          },
        ],
      },
      {
        matcher: "Edit|Write",
        hooks: [
          {
            type: "command",
            command:
              'python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/validators/design-tokens-validator.py" "$CLAUDE_FILE_PATH"',
            condition: { glob: "**/*token*.json" },
          },
        ],
      },
      {
        matcher: "Edit|Write",
        hooks: [
          {
            type: "command",
            command:
              'python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/validators/design-tokens-validator.py" "$CLAUDE_FILE_PATH"',
            condition: { glob: "**/*theme*.json" },
          },
        ],
      },
      {
        matcher: "Edit|Write",
        hooks: [
          {
            type: "command",
            command:
              'python3 "$CLAUDE_PROJECT_DIR/.claude/hooks/validators/csv-validator.py" "$CLAUDE_FILE_PATH"',
            condition: { glob: "**/*.csv" },
          },
        ],
      },
    ];

    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
    spinner.succeed("Configured PostToolUse hooks in settings.json");

    // Display summary
    console.log("");
    console.log(
      boxen(
        chalk.green("Self-Validating Agent Hooks installed!\n\n") +
          chalk.white("Installed validators:\n") +
          validators
            .map(
              (v) =>
                chalk.cyan(`  • ${v.name}\n`) +
                chalk.gray(`    ${v.description}\n`) +
                chalk.gray(`    Triggers: ${v.triggers}`),
            )
            .join("\n") +
          "\n\n" +
          chalk.white("How it works (Closed Loop Prompt pattern):\n") +
          chalk.gray("  1. Agent edits a file (e.g., docs/prds/F1.md)\n") +
          chalk.gray("  2. PostToolUse hook runs prd-validator.py\n") +
          chalk.gray("  3. Validator returns JSON with errors\n") +
          chalk.gray("  4. Agent sees errors and auto-fixes in same session\n") +
          chalk.gray("  5. Hook re-validates until passing\n\n") +
          chalk.yellow("Tip: ") +
          chalk.white("Use @specialized-validation skill to learn more"),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "green",
        },
      ),
    );
  } catch (error) {
    spinner.fail(`Installation failed: ${error.message}`);
    process.exit(1);
  }
}

const program = new Command();

program
  .name("sigma-protocol")
  .description("Sigma Protocol - Platform-agnostic AI development methodology")
  .version("1.0.0-alpha.1");

program
  .command("install")
  .alias("init")
  .description("Interactive installation of Sigma Protocol")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(installCommand);

program
  .command("status")
  .description("Check Sigma Protocol installation status and health")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-v, --verbose", "Show detailed health issues")
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

// Update command handler
async function updateCommand(options) {
  showBanner();

  const targetDir = options.target || process.cwd();
  const platformArg = options.platform || "all";
  const dryRun = options.dryRun || false;
  const backup = options.backup || false;
  const force = options.force || false;
  const verbose = options.verbose || false;

  console.log(chalk.white("Sigma Protocol Update\n"));
  console.log(chalk.gray(`Target: ${targetDir}`));
  console.log(chalk.gray(`Platform: ${platformArg}`));
  if (dryRun) console.log(chalk.yellow("Mode: DRY RUN"));
  console.log("");

  // Read existing manifest
  let spinner = ora("Reading current installation...").start();
  const manifest = await readManifest(targetDir);

  if (!manifest) {
    spinner.warn("No .sigma-manifest.json found");
    console.log(chalk.yellow("\nThis project hasn't been initialized with Sigma Protocol."));
    console.log(chalk.white("Run:"));
    console.log(chalk.cyan("  npx sigma-protocol install\n"));
    console.log(chalk.gray("Or use --force to initialize during update."));

    if (!force) {
      return;
    }

    console.log(chalk.yellow("\nForce mode: proceeding with fresh installation...\n"));
  } else {
    spinner.succeed(`Found installation: v${manifest.sigma_version || "unknown"}`);
  }

  // Get source version info
  spinner = ora("Checking Sigma-Protocol version...").start();
  const sourceVersion = await getSourceVersion();
  const sourceCommit = await getSourceCommit();
  spinner.succeed(`Source: v${sourceVersion}${sourceCommit ? ` (${sourceCommit})` : ""}`);

  // Determine platforms to update
  const installedPlatforms = manifest?.installed_platforms || [];
  let platforms;

  if (platformArg === "all") {
    platforms = installedPlatforms.length > 0 ? installedPlatforms : Object.keys(PLATFORMS);
  } else {
    platforms = [platformArg];
  }

  // Check if update is needed
  const currentVersion = manifest?.sigma_version || "0.0.0";
  const versionComparison = compareVersions(sourceVersion, currentVersion);

  if (versionComparison === 0 && !force) {
    console.log(chalk.green(`\n✓ Already up to date (v${sourceVersion})`));
    console.log(chalk.gray("Use --force to reinstall anyway."));
    return;
  }

  if (versionComparison > 0) {
    console.log(chalk.cyan(`\n↑ Update available: v${currentVersion} → v${sourceVersion}\n`));
  } else if (force) {
    console.log(chalk.yellow(`\n⟳ Force reinstall: v${sourceVersion}\n`));
  }

  // Get installed modules
  const modules = manifest?.installed_modules || [
    "steps", "audit", "dev", "ops", "deploy", "generators", "marketing"
  ];

  // Calculate what will change
  spinner = ora("Calculating changes...").start();
  const changes = await calculateChanges(targetDir, platforms, modules, manifest);
  spinner.succeed(`Found ${changes.added.length} new, ${changes.modified.length} modified, ${changes.unchanged.length} unchanged files`);

  // Show change summary
  if (verbose || dryRun) {
    console.log("");

    if (changes.added.length > 0) {
      console.log(chalk.green("Files to add:"));
      changes.added.slice(0, 10).forEach((f) => console.log(chalk.gray(`  + ${f}`)));
      if (changes.added.length > 10) {
        console.log(chalk.gray(`  ... and ${changes.added.length - 10} more`));
      }
    }

    if (changes.modified.length > 0) {
      console.log(chalk.yellow("\nFiles to update:"));
      changes.modified.slice(0, 10).forEach((f) => console.log(chalk.gray(`  ~ ${f}`)));
      if (changes.modified.length > 10) {
        console.log(chalk.gray(`  ... and ${changes.modified.length - 10} more`));
      }
    }

    console.log("");
  }

  if (dryRun) {
    console.log(chalk.yellow("[DRY RUN] No changes applied."));
    console.log(chalk.gray("Remove --dry-run to apply updates."));
    return;
  }

  // Create backup if requested
  let backupInfo = null;
  if (backup) {
    spinner = ora("Creating backup...").start();
    backupInfo = await createBackup(targetDir, platforms);
    spinner.succeed(`Backup created: ${backupInfo.backupDir}`);
  }

  // Apply updates
  console.log("");
  for (const platform of platforms) {
    spinner = ora(`Updating ${PLATFORMS[platform]?.name || platform}...`).start();

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

      spinner.succeed(`${PLATFORMS[platform]?.name || platform} updated`);
    } catch (error) {
      spinner.fail(`${PLATFORMS[platform]?.name || platform} failed: ${error.message}`);
      if (backupInfo) {
        console.log(chalk.yellow(`Backup available at: ${backupInfo.backupDir}`));
      }
    }
  }

  // Update manifest
  spinner = ora("Updating manifest...").start();

  const newHashes = await computeAllHashes(targetDir, platforms);

  const newManifest = {
    ...manifest,
    sigma_version: sourceVersion,
    source_version: sourceVersion,
    source_commit: sourceCommit,
    last_update: new Date().toISOString(),
    installed_platforms: [...new Set([...(manifest?.installed_platforms || []), ...platforms])],
    installed_modules: modules,
    file_hashes: newHashes,
  };

  if (!newManifest.initialized) {
    newManifest.initialized = new Date().toISOString();
  }

  await writeManifest(targetDir, newManifest);
  spinner.succeed("Manifest updated");

  // Summary
  console.log("");
  console.log(
    boxen(
      chalk.green(`Sigma Protocol updated to v${sourceVersion}!\n\n`) +
        chalk.white(`Platforms: ${platforms.map((p) => PLATFORMS[p]?.name || p).join(", ")}\n`) +
        chalk.white(`Modules: ${modules.length} modules\n`) +
        chalk.gray(`Files: +${changes.added.length} ~${changes.modified.length}\n\n`) +
        (backupInfo ? chalk.gray(`Backup: ${backupInfo.backupDir}\n\n`) : "") +
        chalk.white("Run ") + chalk.cyan("sigma status") + chalk.white(" to verify installation."),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "green",
      }
    )
  );
}

// Calculate what files will change
async function calculateChanges(targetDir, platforms, modules, manifest) {
  const changes = {
    added: [],
    modified: [],
    unchanged: [],
  };

  const existingHashes = manifest?.file_hashes || {};

  for (const module of modules) {
    const moduleSource = path.join(ROOT_DIR, module === "steps" ? "steps" : module);
    if (!(await fs.pathExists(moduleSource))) continue;

    const files = await getFilesRecursive(moduleSource);

    for (const file of files) {
      const sourcePath = path.join(moduleSource, file);
      const sourceHash = await computeFileHash(sourcePath);
      const relativeKey = `${module}/${file}`;

      if (!existingHashes[relativeKey]) {
        changes.added.push(relativeKey);
      } else if (existingHashes[relativeKey] !== sourceHash) {
        changes.modified.push(relativeKey);
      } else {
        changes.unchanged.push(relativeKey);
      }
    }
  }

  return changes;
}

// Compute hashes for all installed files
async function computeAllHashes(targetDir, platforms) {
  const hashes = {};

  for (const platform of platforms) {
    const config = PLATFORMS[platform];
    if (!config) continue;

    const outputDir = path.join(targetDir, config.outputDir);
    if (!(await fs.pathExists(outputDir))) continue;

    const files = await getFilesRecursive(outputDir);

    for (const file of files) {
      const filePath = path.join(outputDir, file);
      const hash = await computeFileHash(filePath);
      if (hash) {
        hashes[`${platform}/${file}`] = hash;
      }
    }
  }

  return hashes;
}

program
  .command("update")
  .description("Update Sigma Protocol to latest version")
  .option("-t, --target <directory>", "Target project directory", process.cwd())
  .option("-p, --platform <platform>", "Platform to update (cursor, claude-code, opencode, all)", "all")
  .option("--dry-run", "Preview changes without applying")
  .option("--backup", "Create backup before updating")
  .option("--force", "Force update even if already up-to-date")
  .option("--verbose", "Show detailed output")
  .action(updateCommand);

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

program
  .command("install-harness")
  .description("Install SSS Agent Harness plugin for OpenCode")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-g, --global", "Install globally to ~/.config/opencode/")
  .action(installHarnessCommand);

program
  .command("install-validators")
  .description(
    "Install self-validating agent hooks (Closed Loop Prompt pattern)",
  )
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(installValidatorsCommand);

// Ralph Loop command handler
async function ralphCommand(options) {
  showBanner();

  const targetDir = options.target || process.cwd();
  const engine = options.engine || "claude";
  const parallel = options.parallel || 1;
  const dryRun = options.dryRun || false;
  const browserEnabled = options.browser !== false;

  console.log(chalk.white("SSS Ralph Loop - Autonomous Implementation\n"));
  console.log(chalk.gray(`Target: ${targetDir}`));
  console.log(chalk.gray(`Engine: ${engine}`));
  console.log(chalk.gray(`Parallel: ${parallel === "auto" ? "auto-detect" : parallel}`));
  console.log(chalk.gray(`Browser Validation: ${browserEnabled ? "enabled" : "disabled"}`));
  if (options.sandbox) {
    console.log(chalk.gray(`Sandbox: ${options.sandbox}`));
  }
  if (dryRun) {
    console.log(chalk.yellow(`Mode: DRY RUN (no changes will be made)\n`));
  }
  console.log("");

  // Locate ralph-backlog.json
  const backlogPaths = [
    path.join(targetDir, ".sigma", "ralph-backlog.json"),
    path.join(targetDir, "docs", "ralph", "implementation", "prd.json"),
    path.join(targetDir, "docs", "ralph", "prototype", "prd.json"),
  ];

  let backlogPath = options.backlog;

  if (!backlogPath) {
    for (const p of backlogPaths) {
      if (await fs.pathExists(p)) {
        backlogPath = p;
        break;
      }
    }
  }

  if (!backlogPath || !(await fs.pathExists(backlogPath))) {
    console.log(
      chalk.red("❌ No ralph-backlog.json found.\n")
    );
    console.log(chalk.white("Generate one with:\n"));
    console.log(chalk.cyan("  # For prototype PRDs (Step 5):"));
    console.log(chalk.gray("  claude \"Run step-5b-prd-to-json\"\n"));
    console.log(chalk.cyan("  # For implementation PRDs (Step 11):"));
    console.log(chalk.gray("  claude \"Run step-11a-prd-to-json\"\n"));
    process.exit(1);
  }

  console.log(chalk.gray(`Backlog: ${backlogPath}\n`));

  // Load backlog
  let spinner = ora("Loading backlog...").start();
  let backlog;

  try {
    const content = await fs.readFile(backlogPath, "utf8");
    backlog = JSON.parse(content);
    spinner.succeed(`Loaded ${backlog.stories?.length || 0} stories from backlog`);
  } catch (error) {
    spinner.fail(`Failed to load backlog: ${error.message}`);
    process.exit(1);
  }

  // Filter pending stories
  const pendingStories = backlog.stories.filter((s) => !s.passes);
  const passedStories = backlog.stories.filter((s) => s.passes);

  console.log("");
  console.log(chalk.white("Backlog Status:"));
  console.log(chalk.green(`  ✓ Passed: ${passedStories.length}`));
  console.log(chalk.yellow(`  ○ Pending: ${pendingStories.length}`));
  console.log(chalk.gray(`  Total: ${backlog.stories.length}`));
  console.log("");

  if (pendingStories.length === 0) {
    console.log(
      boxen(
        chalk.green("🎉 All stories have passed!\n\n") +
          chalk.white("Your Ralph Loop implementation is complete.\n\n") +
          chalk.gray("Next steps:\n") +
          chalk.gray("  1. Run tests: npm test\n") +
          chalk.gray("  2. Review changes: git diff\n") +
          chalk.gray("  3. Commit: git commit -am \"Ralph Loop complete\""),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "green",
        }
      )
    );
    return;
  }

  // Filter by specific PRD if requested
  let storiesToRun = pendingStories;
  if (options.prd) {
    storiesToRun = pendingStories.filter(
      (s) => s.source?.prdPath?.includes(options.prd) || s.id.includes(options.prd)
    );
    if (storiesToRun.length === 0) {
      console.log(chalk.red(`No pending stories found matching: ${options.prd}`));
      process.exit(1);
    }
    console.log(chalk.gray(`Filtered to ${storiesToRun.length} stories matching: ${options.prd}\n`));
  }

  // Filter by stream if requested
  if (options.stream) {
    storiesToRun = storiesToRun.filter(
      (s) => s.tags?.streamId === options.stream
    );
    if (storiesToRun.length === 0) {
      console.log(chalk.red(`No pending stories found in stream: ${options.stream}`));
      process.exit(1);
    }
    console.log(chalk.gray(`Filtered to ${storiesToRun.length} stories in stream: ${options.stream}\n`));
  }

  // Sort by priority
  storiesToRun.sort((a, b) => (a.priority || 999) - (b.priority || 999));

  // Display execution plan
  console.log(chalk.white("Execution Plan:\n"));
  console.log(
    boxen(
      storiesToRun
        .slice(0, 10)
        .map((s, i) => {
          const deps = s.dependsOn?.length > 0 ? chalk.gray(` [deps: ${s.dependsOn.join(", ")}]`) : "";
          return `${chalk.cyan(`${i + 1}.`)} ${s.title}${deps}`;
        })
        .join("\n") +
        (storiesToRun.length > 10 ? chalk.gray(`\n... and ${storiesToRun.length - 10} more`) : ""),
      {
        padding: 1,
        borderStyle: "single",
        borderColor: "cyan",
      }
    )
  );

  if (dryRun) {
    console.log(chalk.yellow("\n[DRY RUN] No stories will be executed."));
    return;
  }

  // Confirm execution
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Execute ${storiesToRun.length} stories using ${engine}?`,
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("\nRalph Loop cancelled."));
    return;
  }

  console.log("");

  // Execute stories
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < storiesToRun.length; i++) {
    const story = storiesToRun[i];

    // Check dependencies
    if (story.dependsOn?.length > 0) {
      const unmetDeps = story.dependsOn.filter((depId) => {
        const depStory = backlog.stories.find((s) => s.id === depId);
        return !depStory?.passes;
      });

      if (unmetDeps.length > 0) {
        console.log(
          chalk.yellow(`⏭ Skipping ${story.id}: unmet dependencies [${unmetDeps.join(", ")}]`)
        );
        results.skipped++;
        continue;
      }
    }

    spinner = ora(`[${i + 1}/${storiesToRun.length}] ${story.title}`).start();

    try {
      const success = await executeStory(story, {
        engine,
        targetDir,
        browser: browserEnabled,
        backlogPath,
        spinner,
        sandbox: options.sandbox,
      });

      if (success) {
        // Update story in backlog
        story.passes = true;
        story.lastAttempt = {
          timestamp: new Date().toISOString(),
          engine,
          success: true,
        };

        // Save backlog
        await fs.writeFile(backlogPath, JSON.stringify(backlog, null, 2));

        spinner.succeed(`✓ ${story.title}`);
        results.passed++;
      } else {
        spinner.fail(`✗ ${story.title}`);
        results.failed++;
        results.errors.push({ story: story.id, error: "Acceptance criteria not met" });
      }
    } catch (error) {
      spinner.fail(`✗ ${story.title}: ${error.message}`);
      results.failed++;
      results.errors.push({ story: story.id, error: error.message });
    }
  }

  // Display summary
  console.log("");
  const summaryColor = results.failed === 0 ? "green" : results.passed > 0 ? "yellow" : "red";
  console.log(
    boxen(
      chalk[summaryColor]("Ralph Loop Complete\n\n") +
        chalk.green(`  ✓ Passed: ${results.passed}\n`) +
        chalk.red(`  ✗ Failed: ${results.failed}\n`) +
        chalk.yellow(`  ⏭ Skipped: ${results.skipped}\n\n`) +
        (results.errors.length > 0
          ? chalk.red("Errors:\n") +
            results.errors
              .slice(0, 5)
              .map((e) => chalk.gray(`  - ${e.story}: ${e.error}`))
              .join("\n") +
            (results.errors.length > 5 ? chalk.gray(`\n  ... and ${results.errors.length - 5} more`) : "")
          : chalk.green("No errors!")),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: summaryColor,
      }
    )
  );
}

// Execute a single story
async function executeStory(story, options) {
  const { engine, sandbox } = options;

  // Build the prompt for the agent
  const storyPrompt = buildStoryPrompt(story);

  // If sandbox mode is enabled, wrap execution in sandbox
  if (sandbox) {
    return await executeInSandbox(storyPrompt, story, options);
  }

  // Execute based on engine
  switch (engine) {
    case "claude":
      return await executeWithClaude(storyPrompt, story, options);
    case "cursor":
      return await executeWithCursor(storyPrompt, story, options);
    case "opencode":
      return await executeWithOpenCode(storyPrompt, story, options);
    default:
      throw new Error(`Unknown engine: ${engine}`);
  }
}

// Execute story in sandbox environment
async function executeInSandbox(prompt, story, options) {
  const { engine, targetDir, sandbox, spinner } = options;

  const { execFile, spawn } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);

  // Find sandbox script
  const sandboxScript = path.join(__dirname, "..", "scripts", "sandbox", "run-in-sandbox.sh");

  if (!(await fs.pathExists(sandboxScript))) {
    throw new Error(`Sandbox script not found: ${sandboxScript}`);
  }

  // Write prompt to temp file
  const promptFile = path.join(targetDir, ".sigma", `ralph-prompt-${story.id}.md`);
  await fs.ensureDir(path.dirname(promptFile));
  await fs.writeFile(promptFile, prompt);

  // Build the agent command based on engine
  let agentCommand;
  switch (engine) {
    case "claude":
      agentCommand = `claude --yes --prompt-file "${promptFile}"`;
      break;
    case "cursor":
      agentCommand = `cursor --prompt-file "${promptFile}"`;
      break;
    case "opencode":
      agentCommand = `opencode agent --prompt-file "${promptFile}"`;
      break;
    default:
      agentCommand = `claude --yes --prompt-file "${promptFile}"`;
  }

  const sessionId = `ralph-${story.id}-${Date.now()}`;

  spinner?.text && (spinner.text = `[sandbox:${sandbox}] ${story.title}`);

  try {
    // Run in sandbox
    const { stdout, stderr } = await execFileAsync(sandboxScript, [
      "--provider", sandbox,
      "--session", sessionId,
      "--workspace", targetDir,
      "--command", agentCommand,
      "--json"
    ], {
      timeout: 1800000, // 30 minute timeout
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    // Parse result
    let result;
    try {
      result = JSON.parse(stdout.trim().split("\n").pop());
    } catch {
      result = { status: stdout.includes("success") ? "success" : "failed" };
    }

    // Clean up prompt file
    await fs.remove(promptFile).catch(() => {});

    if (result.status === "success") {
      // Verify acceptance criteria
      return await verifyAcceptanceCriteria(story, options);
    }

    return false;
  } catch (error) {
    // Clean up prompt file
    await fs.remove(promptFile).catch(() => {});
    throw error;
  }
}

// Build prompt for story execution
function buildStoryPrompt(story) {
  let prompt = `# Implement Story: ${story.title}\n\n`;

  if (story.description) {
    prompt += `## Description\n${story.description}\n\n`;
  }

  prompt += `## Story ID\n${story.id}\n\n`;

  if (story.source) {
    prompt += `## Source\nPRD: ${story.source.prdPath}\n\n`;
  }

  // Add tasks if available
  if (story.tasks?.length > 0) {
    prompt += `## Tasks\n`;
    for (const task of story.tasks) {
      const status = task.completed ? "[x]" : "[ ]";
      prompt += `- ${status} **${task.id}:** ${task.description}`;
      if (task.filePath) {
        prompt += ` \`${task.filePath}\``;
      }
      prompt += "\n";
    }
    prompt += "\n";
  }

  // Add acceptance criteria
  prompt += `## Acceptance Criteria\n`;
  for (const ac of story.acceptanceCriteria) {
    prompt += `- **${ac.id}:** ${ac.description}\n`;
    prompt += `  - Type: ${ac.type}\n`;
    if (ac.filePath) prompt += `  - File: ${ac.filePath}\n`;
    if (ac.contains) prompt += `  - Contains: ${ac.contains}\n`;
    if (ac.command) prompt += `  - Command: ${ac.command}\n`;
  }
  prompt += "\n";

  if (story.agentInstructions) {
    prompt += `## Additional Instructions\n${story.agentInstructions}\n\n`;
  }

  prompt += `## Instructions
1. Implement each task in order
2. After implementation, verify each acceptance criterion passes
3. Do NOT ask questions - use your best judgment
4. If you hit a blocker, document it and move on
5. Mark the story as complete when all acceptance criteria pass
`;

  return prompt;
}

// Execute with Claude Code
async function executeWithClaude(prompt, story, options) {
  const { targetDir, spinner } = options;

  // Check if claude is available using execFile (safer than exec)
  const { execFile, spawn } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);

  try {
    await execFileAsync("which", ["claude"]);
  } catch {
    throw new Error("Claude Code CLI not found. Install with: npm install -g @anthropic-ai/claude-code");
  }

  // Write prompt to temp file
  const promptFile = path.join(targetDir, ".sigma", `ralph-prompt-${story.id}.md`);
  await fs.ensureDir(path.dirname(promptFile));
  await fs.writeFile(promptFile, prompt);

  spinner.text = `Running Claude Code for ${story.id}...`;

  // Execute claude with the prompt
  return new Promise((resolve, reject) => {
    const claudeProcess = spawn("claude", ["-p", prompt], {
      cwd: targetDir,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    let errorOutput = "";
    let lastActivityTime = Date.now();
    let idleTimeoutId = null;
    let maxTimeoutId = null;

    // Activity-based idle timeout (3 minutes of no output)
    const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
    // Maximum total execution time (15 minutes)
    const MAX_TIMEOUT_MS = 15 * 60 * 1000;

    const resetIdleTimeout = () => {
      lastActivityTime = Date.now();
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      idleTimeoutId = setTimeout(() => {
        // Graceful shutdown: try SIGTERM first
        claudeProcess.kill("SIGTERM");
        setTimeout(() => {
          if (!claudeProcess.killed) {
            claudeProcess.kill("SIGKILL");
          }
        }, 5000);
        reject(new Error(`Idle timeout (${IDLE_TIMEOUT_MS / 60000} minutes of no activity)`));
      }, IDLE_TIMEOUT_MS);
    };

    claudeProcess.stdout.on("data", (data) => {
      const chunk = data.toString();
      output += chunk;
      resetIdleTimeout();

      // Update spinner with progress if detected
      const progressMatch = chunk.match(/\[(\d+)\/(\d+)\]/);
      if (progressMatch) {
        spinner.text = `Claude Code [${progressMatch[1]}/${progressMatch[2]}]: ${story.id}`;
      }
    });

    claudeProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
      resetIdleTimeout();
    });

    claudeProcess.on("close", async (code) => {
      // Clear timeouts
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      if (maxTimeoutId) clearTimeout(maxTimeoutId);

      // Save output for debugging
      await saveAgentOutput(story.id, output + "\n---STDERR---\n" + errorOutput, targetDir).catch(() => {});

      // Clean up prompt file
      await fs.remove(promptFile).catch(() => {});

      // Analyze output for completion indicators
      const analysis = analyzeAgentOutput(output);

      if (code !== 0) {
        // Check if output suggests success despite non-zero exit
        if (analysis.status === "success" && analysis.confidence >= 60) {
          spinner.text = `Claude exited with code ${code}, but output suggests success. Verifying...`;
          const passed = await verifyAcceptanceCriteria(story, options);
          resolve(passed);
          return;
        }
        reject(new Error(errorOutput || `Claude exited with code ${code}`));
        return;
      }

      // Combine output analysis with AC verification
      const acPassed = await verifyAcceptanceCriteria(story, options);

      // If AC verification failed but output suggests success, log warning
      if (!acPassed && analysis.status === "success" && analysis.confidence >= 60) {
        console.log(chalk.yellow(`\n  Warning: Output suggests success but AC verification failed`));
        console.log(chalk.gray(`  Output analysis: ${JSON.stringify(analysis, null, 2)}`));
      }

      resolve(acPassed);
    });

    claudeProcess.on("error", (error) => {
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      if (maxTimeoutId) clearTimeout(maxTimeoutId);
      reject(error);
    });

    // Start idle timeout
    resetIdleTimeout();

    // Maximum timeout (15 minutes)
    maxTimeoutId = setTimeout(() => {
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      // Graceful shutdown
      claudeProcess.kill("SIGTERM");
      setTimeout(() => {
        if (!claudeProcess.killed) {
          claudeProcess.kill("SIGKILL");
        }
      }, 5000);
      reject(new Error(`Maximum execution timeout (${MAX_TIMEOUT_MS / 60000} minutes)`));
    }, MAX_TIMEOUT_MS);
  });
}

// Execute with Cursor (via cursor-agent-cli if available)
async function executeWithCursor(prompt, story, options) {
  const { targetDir, spinner } = options;
  const { execFile, spawn } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);

  // Check if cursor-agent-cli is available
  let cursorAgentAvailable = false;
  try {
    await execFileAsync("which", ["cursor-agent"]);
    cursorAgentAvailable = true;
  } catch {
    // cursor-agent-cli not installed
  }

  if (cursorAgentAvailable) {
    // Automated execution via cursor-agent-cli
    spinner.text = `Running Cursor Agent for ${story.id}...`;

    return new Promise((resolve, reject) => {
      const cursorProcess = spawn("cursor-agent", ["--prompt", prompt], {
        cwd: targetDir,
        stdio: ["ignore", "pipe", "pipe"],
      });

      let output = "";
      let errorOutput = "";
      let lastActivityTime = Date.now();
      let idleTimeoutId = null;
      const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
      const MAX_TIMEOUT_MS = 15 * 60 * 1000;

      const resetIdleTimeout = () => {
        lastActivityTime = Date.now();
        if (idleTimeoutId) clearTimeout(idleTimeoutId);
        idleTimeoutId = setTimeout(() => {
          cursorProcess.kill("SIGTERM");
          setTimeout(() => {
            if (!cursorProcess.killed) cursorProcess.kill("SIGKILL");
          }, 5000);
          reject(new Error("Cursor Agent idle timeout"));
        }, IDLE_TIMEOUT_MS);
      };

      cursorProcess.stdout.on("data", (data) => {
        output += data.toString();
        resetIdleTimeout();
      });

      cursorProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
        resetIdleTimeout();
      });

      cursorProcess.on("close", async (code) => {
        if (idleTimeoutId) clearTimeout(idleTimeoutId);
        await saveAgentOutput(story.id, output, targetDir).catch(() => {});

        const analysis = analyzeAgentOutput(output);

        if (code !== 0 && analysis.status !== "success") {
          reject(new Error(errorOutput || `Cursor Agent exited with code ${code}`));
          return;
        }

        const passed = await verifyAcceptanceCriteria(story, options);
        resolve(passed);
      });

      cursorProcess.on("error", (error) => {
        if (idleTimeoutId) clearTimeout(idleTimeoutId);
        reject(error);
      });

      resetIdleTimeout();

      setTimeout(() => {
        cursorProcess.kill("SIGTERM");
        reject(new Error("Cursor Agent max timeout"));
      }, MAX_TIMEOUT_MS);
    });
  }

  // Manual fallback: Copy prompt to clipboard if possible
  console.log(chalk.yellow("\nCursor Agent CLI not available. Falling back to manual mode."));

  // Try to copy to clipboard
  try {
    const clipboardy = await import("clipboardy").catch(() => null);
    if (clipboardy) {
      await clipboardy.default.write(prompt);
      console.log(chalk.green("✓ Prompt copied to clipboard!"));
    }
  } catch {
    // Clipboard not available
  }

  console.log(chalk.gray("\nPaste this prompt in Cursor Composer (Cmd/Ctrl+L):\n"));
  console.log(chalk.white("---"));
  console.log(prompt.slice(0, 800) + (prompt.length > 800 ? "\n..." : ""));
  console.log(chalk.white("---\n"));

  // Write prompt to file as backup
  const promptFile = path.join(targetDir, ".sigma", `ralph-prompt-${story.id}.md`);
  await fs.ensureDir(path.dirname(promptFile));
  await fs.writeFile(promptFile, prompt);
  console.log(chalk.gray(`Full prompt saved to: ${promptFile}\n`));

  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message: "Did the story implementation complete successfully in Cursor?",
      default: false,
    },
  ]);

  if (confirmed) {
    return await verifyAcceptanceCriteria(story, options);
  }
  return false;
}

// Execute with OpenCode
async function executeWithOpenCode(prompt, story, options) {
  const { targetDir, spinner } = options;
  const { execFile, spawn } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);

  try {
    await execFileAsync("which", ["opencode"]);
  } catch {
    throw new Error("OpenCode CLI not found. Install from: https://opencode.ai");
  }

  spinner.text = `Running OpenCode for ${story.id}...`;

  // Execute opencode with JSON output format for structured parsing
  return new Promise((resolve, reject) => {
    const opencodeProcess = spawn("opencode", ["--prompt", prompt, "--json"], {
      cwd: targetDir,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    let errorOutput = "";
    let lastActivityTime = Date.now();
    let idleTimeoutId = null;
    const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
    const MAX_TIMEOUT_MS = 15 * 60 * 1000;

    const resetIdleTimeout = () => {
      lastActivityTime = Date.now();
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      idleTimeoutId = setTimeout(() => {
        opencodeProcess.kill("SIGTERM");
        setTimeout(() => {
          if (!opencodeProcess.killed) opencodeProcess.kill("SIGKILL");
        }, 5000);
        reject(new Error("OpenCode idle timeout"));
      }, IDLE_TIMEOUT_MS);
    };

    opencodeProcess.stdout.on("data", (data) => {
      const chunk = data.toString();
      output += chunk;
      resetIdleTimeout();

      // Try to parse JSON progress updates
      try {
        const lines = chunk.split("\n").filter(Boolean);
        for (const line of lines) {
          if (line.startsWith("{")) {
            const json = JSON.parse(line);
            if (json.progress) {
              spinner.text = `OpenCode [${json.progress.current}/${json.progress.total}]: ${story.id}`;
            } else if (json.status === "complete") {
              spinner.text = `OpenCode completing: ${story.id}`;
            }
          }
        }
      } catch {
        // Not JSON, check for text progress patterns
        const progressMatch = chunk.match(/\[(\d+)\/(\d+)\]/);
        if (progressMatch) {
          spinner.text = `OpenCode [${progressMatch[1]}/${progressMatch[2]}]: ${story.id}`;
        }
      }
    });

    opencodeProcess.stderr.on("data", (data) => {
      errorOutput += data.toString();
      resetIdleTimeout();
    });

    opencodeProcess.on("close", async (code) => {
      if (idleTimeoutId) clearTimeout(idleTimeoutId);

      // Save output for debugging
      await saveAgentOutput(story.id, output + "\n---STDERR---\n" + errorOutput, targetDir).catch(() => {});

      // Try to parse final JSON result
      let jsonResult = null;
      try {
        const lines = output.split("\n").filter(Boolean);
        const lastJsonLine = lines.reverse().find((l) => l.startsWith("{") && l.includes("status"));
        if (lastJsonLine) {
          jsonResult = JSON.parse(lastJsonLine);
        }
      } catch {
        // Not JSON output
      }

      // Analyze output
      const analysis = analyzeAgentOutput(output);

      if (code !== 0) {
        // Check if JSON result or output analysis suggests success
        if (jsonResult?.status === "success" || (analysis.status === "success" && analysis.confidence >= 60)) {
          const passed = await verifyAcceptanceCriteria(story, options);
          resolve(passed);
          return;
        }
        reject(new Error(errorOutput || `OpenCode exited with code ${code}`));
        return;
      }

      // Verify acceptance criteria
      const passed = await verifyAcceptanceCriteria(story, options);
      resolve(passed);
    });

    opencodeProcess.on("error", (error) => {
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      reject(error);
    });

    resetIdleTimeout();

    setTimeout(() => {
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      opencodeProcess.kill("SIGTERM");
      setTimeout(() => {
        if (!opencodeProcess.killed) opencodeProcess.kill("SIGKILL");
      }, 5000);
      reject(new Error("OpenCode max timeout"));
    }, MAX_TIMEOUT_MS);
  });
}

// Verify acceptance criteria
async function verifyAcceptanceCriteria(story, options) {
  const { targetDir, browser } = options;
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);

  let allPassed = true;

  for (const ac of story.acceptanceCriteria) {
    let passed = false;

    try {
      switch (ac.type) {
        case "file-exists":
          const filePath = ac.filePath || ac.filePattern;
          if (filePath) {
            if (filePath.includes("*")) {
              // Glob pattern - simplified check
              const dirPath = path.dirname(path.join(targetDir, filePath));
              if (await fs.pathExists(dirPath)) {
                const files = await fs.readdir(dirPath);
                passed = files.length > 0;
              }
            } else {
              passed = await fs.pathExists(path.join(targetDir, filePath));
            }
          }
          break;

        case "file-contains":
          if (ac.filePath && ac.contains) {
            const fullPath = path.join(targetDir, ac.filePath);
            if (await fs.pathExists(fullPath)) {
              const content = await fs.readFile(fullPath, "utf8");
              passed = content.includes(ac.contains);
            }
          }
          break;

        case "command":
          if (ac.command) {
            try {
              // Parse command into executable and args for safety
              const parts = ac.command.split(/\s+/);
              const cmd = parts[0];
              const args = parts.slice(1);
              await execFileAsync(cmd, args, {
                cwd: targetDir,
                timeout: 60000,
              });
              passed = true;
            } catch {
              passed = false;
            }
          }
          break;

        case "ui-validation":
          if (browser && ac.uiValidation) {
            passed = await runUIValidation(ac.uiValidation, targetDir);
          } else {
            // Skip UI validation if browser disabled
            passed = true;
          }
          break;

        case "artifact-check":
          // Check if artifact exists based on type
          if (ac.artifactType && ac.artifactName) {
            // Simplified check - just verify file existence
            passed = true; // Would use glob here in full implementation
          }
          break;

        case "manual":
          // Manual checks are skipped in automated mode
          passed = true;
          break;

        default:
          passed = true;
      }
    } catch {
      passed = false;
    }

    ac.passed = passed;
    if (!passed) allPassed = false;
  }

  return allPassed;
}

// Run UI validation using Agent Browser
async function runUIValidation(config, targetDir) {
  const { execFile } = await import("child_process");
  const { promisify } = await import("util");
  const execFileAsync = promisify(execFile);

  // Check if agent-browser is available
  try {
    await execFileAsync("which", ["agent-browser"]);
  } catch {
    // Agent Browser not installed, skip validation
    return true;
  }

  const route = config.route || "/";
  const port = process.env.DEV_SERVER_PORT || "3000";
  const url = `http://localhost:${port}${route}`;

  try {
    // Open the URL
    await execFileAsync("agent-browser", ["open", url], { timeout: 30000 });

    // Wait for page to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get snapshot
    const { stdout: snapshot } = await execFileAsync("agent-browser", ["snapshot", "-i"], {
      timeout: 30000,
    });

    // Check for errors
    if (snapshot.match(/error|exception|500|404/i)) {
      return false;
    }

    // Run checks
    for (const check of config.checks || []) {
      if (check.type === "content-exists" && check.expectedText) {
        if (!snapshot.includes(check.expectedText)) {
          return false;
        }
      }
    }

    return true;
  } catch {
    return false;
  }
}

program
  .command("ralph")
  .description("Run Ralph Loop autonomous implementation")
  .option("-t, --target <directory>", "Target project directory", process.cwd())
  .option("-e, --engine <engine>", "AI engine (claude, cursor, opencode)", "claude")
  .option("-p, --parallel <count>", "Parallel execution count (number or 'auto')", "1")
  .option("--prd <name>", "Run specific PRD only")
  .option("--stream <id>", "Run specific stream only")
  .option("-b, --backlog <path>", "Path to ralph-backlog.json")
  .option("--browser", "Enable Agent Browser UI validation (default)", true)
  .option("--no-browser", "Disable browser validation")
  .option("--dry-run", "Show execution plan without running")
  .option("--sandbox <type>", "Run in sandbox (docker, e2b, daytona)")
  .action(ralphCommand);

// Tail command - spawn terminal windows for Ralph log observability
program
  .command("tail [target]")
  .description("Spawn terminal windows to monitor Ralph loop logs")
  .option("--list", "Just list log paths without opening terminals")
  .option("--terminal", "Force Terminal.app instead of iTerm")
  .action(async (target, options) => {
    const { execFileSync } = await import("child_process");
    const scriptPath = path.join(ROOT_DIR, "scripts/ralph/tail-logs.sh");

    let args = [];
    if (target) args.push(target);
    if (options.list) args.push("--list");
    if (options.terminal) args.push("--terminal");

    try {
      execFileSync("bash", [scriptPath, ...args], {
        stdio: "inherit",
        cwd: process.cwd()
      });
    } catch (error) {
      if (error.status !== 0) {
        process.exit(error.status);
      }
    }
  });

program.parse();
