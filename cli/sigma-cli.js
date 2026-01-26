#!/usr/bin/env node

/**
 * Sigma Protocol CLI
 *
 * Interactive CLI for the Sigma Protocol methodology.
 * Supports Cursor, Claude Code, and OpenCode platforms.
 *
 * Usage:
 *   sigma                         # Interactive menu (like `claude`)
 *   sigma new                     # Create new project
 *   sigma retrofit                # Add to existing project
 *   sigma install                 # Install commands to project
 *   sigma orchestrate             # Multi-agent orchestration
 *   sigma doctor                  # System health check
 *   sigma tutorial                # Interactive tutorial
 *   sigma maid                    # Repository maintenance
 */

import { Command } from "commander";
import chalk from "chalk";
import boxen from "boxen";
import ora from "ora";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { Listr } from "listr2";

// Import extracted modules
import { ROOT_DIR, PLATFORMS, MODULES } from "./lib/constants.js";
import {
  loadEnvFiles,
  countFilesByExt,
  makeScriptsExecutable,
  validateJsonSchema as validateJsonSchemaUtil,
  detectInstallations,
  detectMissingAssets,
  checkPlatformPrerequisites,
  validateSourceFiles,
  validateAllSkills,
  backupFile,
  restoreFromBackup,
  cleanupBackup,
  autoDetectPlatform,
} from "./lib/utils/index.js";
import { showBanner, selectPlatforms, selectModules } from "./lib/ui/index.js";
import {
  installCursorSkills,
  installClaudeCodeSkills,
  installClaudeCodeCommands,
  installOpenCodeSkills,
} from "./lib/skills/index.js";

// Load .env files from current directory and parent directories
loadEnvFiles(process.cwd(), 5);

const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(__filename);

// Note: validateJsonSchema is now imported from ./lib/utils/validation.js
// Note: All utility functions (backup, files, detection, validation) are imported from ./lib/utils/
// Note: UI functions (showBanner, selectPlatforms, selectModules) are imported from ./lib/ui/
// Note: PLATFORMS and MODULES constants are imported from ./lib/constants.js

// Local module selection wrapper for backward compatibility
async function _selectModulesLocal() {
  const moduleChoices = Object.entries(MODULES).map(([id, config]) => ({
    name: `${config.name} - ${config.description}`,
    value: id,
    checked: true, // Default to all selected
    disabled: config.required ? "Required" : false,
  }));

  const choices = [
    new inquirer.Separator("─── Select modules (space to toggle, 'a' to toggle all) ───"),
    ...moduleChoices,
    new inquirer.Separator(""),
    { name: chalk.gray("← Back to main menu"), value: "__back__" },
  ];

  const { modules } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "modules",
      message: "Which modules do you want to install?",
      choices,
    },
  ]);

  // Check if user wants to go back
  if (modules.includes("__back__")) {
    return "__back__";
  }

  // Filter out the back option
  const selectedModules = modules.filter(m => m !== "__back__");

  // Always include required modules
  const requiredModules = Object.entries(MODULES)
    .filter(([_, config]) => config.required)
    .map(([id]) => id);

  return [...new Set([...requiredModules, ...selectedModules])];
}

// Build for Cursor platform
// Cursor uses the original files directly - they already have Cursor frontmatter
async function buildCursor(targetDir, modules, spinner) {
  const config = PLATFORMS.cursor;
  const outputDir = path.join(targetDir, config.outputDir);

  await fs.ensureDir(outputDir);

  let totalFiles = 0;
  const skippedModules = [];

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
    } else {
      skippedModules.push({ module, expectedPath: moduleSource });
    }
  }

  // Warn if modules were skipped
  if (skippedModules.length > 0) {
    spinner.warn(`Cursor: ${skippedModules.length} module(s) not found`);
    console.log(chalk.yellow(`\n⚠️  Warning: Source directories not found:`));
    for (const { module, expectedPath } of skippedModules) {
      console.log(chalk.gray(`   - ${module}: ${expectedPath}`));
    }
    console.log("");
  }

  // Error if nothing was copied
  if (totalFiles === 0) {
    throw new Error(
      `No files copied for Cursor platform. Source directory issue - ROOT_DIR=${ROOT_DIR}`
    );
  }

  spinner.text = `Cursor: Copied ${totalFiles} commands (full content preserved)`;

  // Copy schemas
  const schemasSource = path.join(ROOT_DIR, "schemas");
  if (await fs.pathExists(schemasSource)) {
    await fs.copy(schemasSource, path.join(targetDir, ".cursor", "schemas"));
  }

  // Copy Ralph scripts and make them executable
  const ralphSource = path.join(ROOT_DIR, "scripts", "ralph");
  if (await fs.pathExists(ralphSource)) {
    const ralphDest = path.join(targetDir, "scripts", "ralph");
    await fs.copy(ralphSource, ralphDest);
    await makeScriptsExecutable(ralphDest);
    spinner.text = `Cursor: Copied Ralph loop scripts (made executable)`;
  }

  // Install skills
  await installCursorSkills(targetDir, spinner, { cursor: { installed: 0, skipped: 0 } });

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
  const skippedModules = [];

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
    } else {
      skippedModules.push({ module, expectedPath: moduleSource });
    }
  }

  // Warn if modules were skipped
  if (skippedModules.length > 0) {
    spinner.warn(`Claude Code: ${skippedModules.length} module(s) not found`);
    console.log(chalk.yellow(`\n⚠️  Warning: Source directories not found:`));
    for (const { module, expectedPath } of skippedModules) {
      console.log(chalk.gray(`   - ${module}: ${expectedPath}`));
    }
    console.log("");
  }

  // Error if nothing was copied
  if (totalCommands === 0) {
    throw new Error(
      `No files copied for Claude Code platform. Source directory issue - ROOT_DIR=${ROOT_DIR}`
    );
  }

  spinner.text = `Claude Code: Transformed ${totalCommands} commands (full content preserved)`;

  // Copy skills from src/skills if they exist
  const skillsSource = path.join(ROOT_DIR, "src", "skills");
  if (await fs.pathExists(skillsSource)) {
    await fs.copy(skillsSource, path.join(targetDir, config.skillsDir));
  }

  // Copy Claude Code commands from platforms if present
  await installClaudeCodeCommands(targetDir, spinner);

  // Copy hooks from claude-code directory if exists
  const hooksSource = path.join(ROOT_DIR, "claude-code", ".claude", "hooks");
  if (await fs.pathExists(hooksSource)) {
    await fs.copy(hooksSource, path.join(targetDir, config.hooksDir));
  }

  // Generate CLAUDE.md orchestrator
  const claudeMd = generateClaudeMd(modules);
  await fs.writeFile(path.join(targetDir, "CLAUDE.md"), claudeMd);

  // Copy Ralph scripts and make them executable
  const ralphSource = path.join(ROOT_DIR, "scripts", "ralph");
  if (await fs.pathExists(ralphSource)) {
    const ralphDest = path.join(targetDir, "scripts", "ralph");
    await fs.copy(ralphSource, ralphDest);
    await makeScriptsExecutable(ralphDest);
    spinner.text = `Claude Code: Copied Ralph loop scripts (made executable)`;
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
description: "${existingFrontmatter.description || `Sigma ${module} command: ${filename}`}"
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
description: "Run Sigma ${module}/${filename}"
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

// ============================================================================
// CURSOR SKILL TRANSFORMATION
// ============================================================================

/**
 * Transform source skill (.md) to Cursor rule format (.mdc)
 * Converts frontmatter from src/skills format to Cursor's globs/keywords format
 *
 * Source format (src/skills/skill-name.md):
 *   name, description, version, triggers fields
 *
 * Cursor format (.cursor/rules/skill-name.mdc):
 *   description, globs, keywords fields
 */
function _transformToCursorRule(originalContent, filename) {
  const frontmatterMatch = originalContent.match(
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/,
  );

  let bodyContent = originalContent;
  let skillName = filename.replace(".md", "");
  let description = "";
  let triggers = [];

  if (frontmatterMatch) {
    const yamlContent = frontmatterMatch[1];
    bodyContent = frontmatterMatch[2];

    // Extract name
    const nameMatch = yamlContent.match(/^name:\s*"?([^"\n]+)"?/m);
    if (nameMatch) skillName = nameMatch[1];

    // Extract description
    const descMatch = yamlContent.match(/^description:\s*"?([^"\n]+)"?/m);
    if (descMatch) description = descMatch[1];

    // Extract triggers to convert to keywords
    const triggersMatch = yamlContent.match(/triggers:\s*\n([\s\S]*?)(?=\n[a-z]|\n---|\n$)/i);
    if (triggersMatch) {
      triggers = triggersMatch[1]
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.replace(/^\s*-\s*/, "").trim())
        .filter(Boolean);
    }
  }

  // Build Cursor-appropriate globs and keywords based on skill type
  const { globs, keywords } = getCursorSkillMetadata(skillName, triggers);

  // Build Cursor rule format
  const cursorRule = `---
description: "Sigma ${skillName} - ${description || `Foundation skill for ${skillName}`}"
globs: [${globs.map((g) => `"${g}"`).join(", ")}]
keywords: [${keywords.map((k) => `"${k}"`).join(", ")}]
---

# Sigma ${skillName} Skill

${bodyContent}
`;

  return cursorRule;
}

/**
 * Get appropriate globs and keywords for a skill based on its name and triggers
 */
function getCursorSkillMetadata(skillName, triggers) {
  // Default metadata - globs used in fallback return
  const defaultGlobs = ["**/*.md", "**/*.tsx", "**/*.ts"];
  const keywords = [...triggers.map((t) => t.replace(/-/g, " "))];

  // Skill-specific mappings
  const skillMappings = {
    "frontend-design": {
      globs: ["**/*.tsx", "**/*.jsx", "**/*.vue", "**/*.css", "**/*.scss", "tailwind.config.*", "**/components/**/*"],
      keywords: ["ui", "component", "tailwind", "shadcn", "layout", "typography", "motion", "design", "styling", "frontend"],
    },
    "api-design-principles": {
      globs: ["**/api/**/*", "**/routes/**/*", "**/*.openapi.yaml", "**/swagger.*"],
      keywords: ["api", "rest", "graphql", "endpoint", "route", "openapi", "swagger"],
    },
    "architecture-patterns": {
      globs: ["**/src/**/*", "**/lib/**/*", "**/services/**/*"],
      keywords: ["architecture", "clean", "hexagonal", "ddd", "domain", "service", "pattern"],
    },
    "systematic-debugging": {
      globs: ["**/*.test.*", "**/*.spec.*", "**/debug/**/*"],
      keywords: ["debug", "bug", "error", "fix", "trace", "log", "investigate"],
    },
    "senior-qa": {
      globs: ["**/*.test.*", "**/*.spec.*", "**/tests/**/*", "**/e2e/**/*"],
      keywords: ["test", "qa", "quality", "coverage", "e2e", "unit", "integration"],
    },
    "senior-architect": {
      globs: ["**/*.md", "**/docs/**/*", "**/architecture/**/*"],
      keywords: ["architecture", "design", "system", "scalability", "diagram"],
    },
    "ux-designer": {
      globs: ["**/*.tsx", "**/*.jsx", "**/components/**/*", "**/pages/**/*"],
      keywords: ["ux", "user", "experience", "flow", "wireframe", "accessibility"],
    },
    "brainstorming": {
      globs: ["**/*.md", "**/docs/**/*", "**/prd/**/*"],
      keywords: ["brainstorm", "idea", "explore", "concept", "discovery"],
    },
    "quality-gates": {
      globs: ["**/.github/**/*", "**/lefthook.*", "**/.husky/**/*", "**/vitest.*"],
      keywords: ["quality", "gate", "ci", "cd", "hook", "lint", "test"],
    },
    "prompt-engineering-patterns": {
      globs: ["**/*.md", "**/prompts/**/*", "**/agents/**/*"],
      keywords: ["prompt", "llm", "ai", "engineering", "template"],
    },
    "xlsx": {
      globs: ["**/*.xlsx", "**/*.xls", "**/*.csv", "**/*.tsv"],
      keywords: ["excel", "spreadsheet", "csv", "data", "xlsx"],
    },
    "pptx": {
      globs: ["**/*.pptx", "**/*.ppt"],
      keywords: ["powerpoint", "presentation", "slides", "pptx"],
    },
    "web-artifacts-builder": {
      globs: ["**/*.tsx", "**/*.jsx", "**/*.html"],
      keywords: ["artifact", "web", "component", "react", "interactive"],
    },
    "remembering-conversations": {
      globs: ["**/.memory/**/*", "**/*.memory.json"],
      keywords: ["memory", "remember", "context", "history", "recall"],
    },
    "skill-creator": {
      globs: ["**/skills/**/*", "**/SKILL.md", "**/*.mdc"],
      keywords: ["skill", "create", "agent", "capability"],
    },
  };

  // Get skill-specific metadata or use defaults
  if (skillMappings[skillName]) {
    return {
      globs: skillMappings[skillName].globs,
      keywords: [...skillMappings[skillName].keywords, ...keywords],
    };
  }

  // Default fallback - generic globs
  return {
    globs: defaultGlobs,
    keywords: [skillName.replace(/-/g, " "), ...keywords],
  };
}

// Generate CLAUDE.md orchestrator with full module list
function generateClaudeMd(modules) {
  return `# Sigma Protocol - Claude Code Configuration

## Overview

Sigma Protocol is a **platform-agnostic 13-step product development methodology** for AI-assisted development.

This CLAUDE.md orchestrates the Sigma workflow in Claude Code, providing access to all step commands, agents, and skills.

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
| \`/step-13-skillpack-generator\` | Generate project skillpack |

### Ralph Loop (Autonomous Implementation)
| Command | Description |
|---------|-------------|
| \`./scripts/ralph/sigma-ralph.sh\` | Run Ralph loop on prd.json backlog |

**Ralph Mode Usage:**
\`\`\`bash
# 1. Convert PRDs to JSON
claude "Run step-5b-prd-to-json --all-prds"

# 2. Run Ralph loop (in terminal)
./scripts/ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json claude-code
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
Step 5.5: PRD to JSON (Ralph-mode) → docs/ralph/prototype/prd.json
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
Step 11.25: PRD to JSON (Ralph-mode) → docs/ralph/implementation/prd.json
    ↓
Step 11b: PRD Swarm (optional) → swarm-*/
    ↓
Step 12: Context Engine → .cursorrules
    ↓
Step 13: Skillpack Generator → project skills
    ↓
[Ralph Loop] → Autonomous implementation via sigma-ralph.sh
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

See https://github.com/dallionking/sigma-protocol for full documentation.
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
  const skippedModules = [];

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
    } else {
      skippedModules.push({ module, expectedPath: moduleSource });
    }
  }

  // Warn if modules were skipped
  if (skippedModules.length > 0) {
    spinner.warn(`OpenCode: ${skippedModules.length} module(s) not found`);
    console.log(chalk.yellow(`\n⚠️  Warning: Source directories not found:`));
    for (const { module, expectedPath } of skippedModules) {
      console.log(chalk.gray(`   - ${module}: ${expectedPath}`));
    }
    console.log("");
  }

  // Error if nothing was copied
  if (totalCommands === 0) {
    throw new Error(
      `No files copied for OpenCode platform. Source directory issue - ROOT_DIR=${ROOT_DIR}`
    );
  }

  spinner.text = `OpenCode: Transformed ${totalCommands} commands (full content preserved)`;

  // Generate AGENTS.md orchestrator
  const agentsMd = generateAgentsMd(modules);
  await fs.writeFile(path.join(targetDir, "AGENTS.md"), agentsMd);

  // Generate opencode.json config with schema validation
  const openCodeConfig = generateOpenCodeConfig(modules);

  // Validate against schema before writing
  const schemaPath = path.join(ROOT_DIR, "schemas", "opencode-config.schema.json");
  const validation = await validateJsonSchemaUtil(openCodeConfig, schemaPath);

  if (!validation.valid) {
    console.warn(chalk.yellow(`  Warning: OpenCode config validation errors:`));
    validation.errors.forEach(err => {
      console.warn(chalk.yellow(`    - ${err.path}: ${err.message}`));
    });
  }
  if (validation.warning) {
    console.warn(chalk.gray(`  ${validation.warning}`));
  }

  await fs.writeFile(
    path.join(targetDir, "opencode.json"),
    JSON.stringify(openCodeConfig, null, 2),
  );

  // Copy custom tools from src/tools if they exist
  const toolsSource = path.join(ROOT_DIR, "src", "tools");
  if (await fs.pathExists(toolsSource)) {
    await fs.copy(toolsSource, path.join(targetDir, config.toolsDir));
  }

  // Copy Ralph scripts and make them executable
  const ralphSource = path.join(ROOT_DIR, "scripts", "ralph");
  if (await fs.pathExists(ralphSource)) {
    const ralphDest = path.join(targetDir, "scripts", "ralph");
    await fs.copy(ralphSource, ralphDest);
    await makeScriptsExecutable(ralphDest);
    spinner.text = `OpenCode: Copied Ralph loop scripts (made executable)`;
  }

  // Copy schemas for Ralph
  const schemasSource = path.join(ROOT_DIR, "schemas");
  if (await fs.pathExists(schemasSource)) {
    await fs.copy(schemasSource, path.join(targetDir, ".opencode", "schemas"));
  }

  // Install skills
  await installOpenCodeSkills(targetDir, spinner, { opencode: { installed: 0, skipped: 0 } });

  return true;
}

// Transform original Cursor command to OpenCode command format
// This creates a thin wrapper that uses OpenCode-specific features
function transformToOpenCodeCommand(originalContent, filename, module) {
  // Parse existing YAML frontmatter
  const frontmatterMatch = originalContent.match(/^---\n([\s\S]*?)\n---/);
  let description = `Sigma ${module}/${filename}`;

  if (frontmatterMatch) {
    const yamlContent = frontmatterMatch[1];
    const descMatch = yamlContent.match(/description:\s*"?([^"\n]+)"?/);
    if (descMatch) {
      description = descMatch[1];
    }
  }

  // OpenCode command - NO shell injection for security
  // Project state should be gathered via safe API calls, not shell commands
  return `---
description: ${description}
agent: ${filename}
---

# /${filename}

## Context

This command invokes the **@${filename}** agent with full Sigma Protocol methodology.

The agent will automatically:
- Read project structure from the file system
- Check for existing specs in \`docs/specs/\`
- Check for PRDs in \`docs/prds/\`
- Review recent git history if available

## Your Input

$ARGUMENTS

---

**Usage:** \`/${filename} [your input]\`

The agent has access to file read/write, bash (with safety restrictions), and web fetch tools.
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
description: "${existingFrontmatter.description || `Sigma ${module}/${filename}`}"
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
This configuration enables the Sigma workflow in OpenCode.

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
| \`/step-13-skillpack-generator\` | Generate project skillpack |

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

See https://github.com/dallionking/sigma-protocol for full documentation.
`;
}

// Generate opencode.json config
// Schema URL: https://opencode.ai/config.json (NOT opencode.dev)
function generateOpenCodeConfig(_modules) {
  return {
    $schema: "https://opencode.ai/config.json",
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

// Note: autoDetectPlatform is now imported from ./lib/utils/detection.js

// Install command handler
async function installCommand(options) {
  const nonInteractive = options.yes || false;

  debugLog("installCommand called with options:", JSON.stringify(options, null, 2));

  if (!nonInteractive) {
    showBanner();
  }

  const targetDir = options.target || process.cwd();
  verboseLog("Target directory:", targetDir);
  console.log(chalk.gray(`Target directory: ${targetDir}\n`));

  // Detect existing installations
  const existing = await detectInstallations(targetDir);
  const hasExisting = Object.values(existing).some((v) => v);

  if (hasExisting && !nonInteractive) {
    console.log(chalk.yellow("Existing installations detected:\n"));
    for (const [platform, installed] of Object.entries(existing)) {
      if (installed) {
        console.log(`  ${chalk.green("✓")} ${PLATFORMS[platform].name}`);
      }
    }
    console.log("");
  }

  // Determine platforms
  let platforms;
  if (options.platform) {
    // Parse platform option
    const platformInput = options.platform.toLowerCase();
    if (platformInput === "all") {
      platforms = Object.keys(PLATFORMS);
    } else {
      platforms = platformInput.split(",").map((p) => p.trim()).filter((p) => PLATFORMS[p]);
      if (platforms.length === 0) {
        console.log(chalk.red(`Invalid platform(s): ${options.platform}`));
        console.log(chalk.gray(`Valid platforms: ${Object.keys(PLATFORMS).join(", ")}, all`));
        return;
      }
    }
  } else if (nonInteractive) {
    // Auto-detect platform in non-interactive mode
    platforms = await autoDetectPlatform(targetDir);
    if (platforms.length === 0) {
      // Default to all platforms if none detected
      platforms = Object.keys(PLATFORMS);
    }
    console.log(chalk.cyan(`Auto-detected platforms: ${platforms.map((p) => PLATFORMS[p].name).join(", ")}`));
  } else {
    // Interactive platform selection
    platforms = await selectPlatforms(existing);
    if (platforms === "__back__") {
      return "menu";
    }
  }

  debugLog("Selected platforms:", platforms);

  // Check platform prerequisites (only show warnings, don't block)
  const prerequisites = await checkPlatformPrerequisites(targetDir, platforms);
  verboseLog("Prerequisites check:", prerequisites.warnings.length > 0 ? "warnings found" : "passed");

  if (prerequisites.warnings.length > 0 && !nonInteractive) {
    console.log("");
    console.log(chalk.yellow("⚠️  Prerequisites check:\n"));
    prerequisites.warnings.forEach((w) => {
      console.log(chalk.yellow(`   • ${w}`));
    });

    if (prerequisites.suggestions.length > 0) {
      console.log("");
      console.log(chalk.gray("   Suggestions:"));
      prerequisites.suggestions.forEach((s) => {
        console.log(chalk.gray(`   → ${s}`));
      });
    }
    console.log("");
  }

  // Determine modules
  let modules;
  if (options.modules) {
    // Parse modules option
    const moduleInput = options.modules.toLowerCase();
    if (moduleInput === "all") {
      modules = Object.keys(MODULES);
    } else {
      modules = moduleInput.split(",").map((m) => m.trim()).filter((m) => MODULES[m]);
      // Always include required modules
      const requiredModules = Object.entries(MODULES)
        .filter(([_, config]) => config.required)
        .map(([id]) => id);
      modules = [...new Set([...requiredModules, ...modules])];
    }
    if (modules.length === 0) {
      console.log(chalk.red(`Invalid module(s): ${options.modules}`));
      console.log(chalk.gray(`Valid modules: ${Object.keys(MODULES).join(", ")}, all`));
      return;
    }
  } else if (nonInteractive) {
    // Default to all modules in non-interactive mode
    modules = Object.keys(MODULES);
    console.log(chalk.cyan(`Installing all modules: ${modules.map((m) => MODULES[m].name).join(", ")}`));
  } else {
    // Interactive module selection
    modules = await selectModules();
    if (modules === "__back__") {
      return "menu";
    }
  }

  debugLog("Selected modules:", modules);
  console.log("");

  // Show selection summary
  console.log(chalk.cyan("Selected platforms:"));
  platforms.forEach((p) => console.log(`  ${chalk.green("✓")} ${PLATFORMS[p].name}`));
  console.log("");
  console.log(chalk.cyan("Selected modules:"));
  modules.forEach((m) => console.log(`  ${chalk.green("✓")} ${MODULES[m].name}`));
  console.log("");

  // Confirm installation (skip in non-interactive mode)
  if (!nonInteractive) {
    const platformList = platforms.map((p) => PLATFORMS[p].name).join(", ");
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: `Proceed with installation for: ${chalk.yellow(platformList)}?`,
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow("\nInstallation cancelled."));
      return;
    }
    console.log("");
  }

  // Validate source files exist before installation
  const validation = await validateSourceFiles(modules);
  if (!validation.valid) {
    console.log(chalk.red("❌ Pre-installation validation failed:\n"));
    validation.issues.forEach((issue) => {
      console.log(chalk.red(`   • ${issue}`));
    });
    console.log("");
    console.log(chalk.yellow("Please ensure you're running from the sigma-protocol repository root."));
    console.log(chalk.gray(`Current ROOT_DIR: ${ROOT_DIR}`));
    return;
  }

  console.log(chalk.green("✓ Source files validated\n"));

  // Handle dry-run mode - show what would happen without making changes
  if (options.dryRun) {
    console.log(boxen(
      chalk.cyan.bold("Dry Run Mode - No changes will be made\n\n") +
      chalk.white.bold("Would install to:\n") +
      chalk.gray(`  ${targetDir}\n\n`) +
      chalk.white.bold("Platforms:\n") +
      platforms.map(p => {
        const config = PLATFORMS[p];
        return `  ${chalk.green("✓")} ${config.name}\n` +
               `    ${chalk.gray(`Output: ${config.outputDir}`)}\n` +
               (config.commandsDir ? `    ${chalk.gray(`Commands: ${config.commandsDir}`)}` : "") +
               (config.skillsDir ? `\n    ${chalk.gray(`Skills: ${config.skillsDir}`)}` : "") +
               (config.agentsDir ? `\n    ${chalk.gray(`Agents: ${config.agentsDir}`)}` : "");
      }).join("\n") +
      "\n\n" +
      chalk.white.bold("Modules:\n") +
      modules.map(m => `  ${chalk.green("✓")} ${MODULES[m].name} - ${MODULES[m].description}`).join("\n") +
      "\n\n" +
      chalk.white.bold("Files that would be created:\n") +
      `  ${chalk.gray(".sigma-manifest.json")}\n` +
      `  ${chalk.gray(".sigma/context/ (project.json, history.json, decisions.json)")}\n` +
      `  ${chalk.gray(".sigma/rules/")}\n` +
      platforms.map(p => {
        const config = PLATFORMS[p];
        const files = [];
        files.push(`  ${chalk.gray(config.outputDir + "/ (commands)")}`);
        if (config.skillsDir) files.push(`  ${chalk.gray(config.skillsDir + "/ (skills)")}`);
        if (config.agentsDir) files.push(`  ${chalk.gray(config.agentsDir + "/ (agents)")}`);
        if (p === "opencode") files.push(`  ${chalk.gray("opencode.json")}`);
        if (p === "opencode") files.push(`  ${chalk.gray("AGENTS.md")}`);
        return files.join("\n");
      }).join("\n"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    ));
    console.log(chalk.yellow("\nRun without --dry-run to apply changes."));
    return;
  }

  // Create listr2 tasks for better progress visualization
  const installTasks = new Listr(
    platforms.map((platform) => ({
      title: `Installing ${PLATFORMS[platform].name}`,
      task: async (_ctx, task) => {
        // Create a simple spinner-like object for build functions
        const spinner = {
          text: "",
          start: () => spinner,
          succeed: () => spinner,
          fail: () => spinner,
        };
        
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
        
        task.title = `${PLATFORMS[platform].name} installed successfully`;
      },
    })),
    {
      concurrent: false,
      rendererOptions: {
        showSubtasks: true,
        collapseSubtasks: false,
      },
    }
  );

  try {
    await installTasks.run();
  } catch (error) {
    // Use contextual error handling
    const { logError } = await import("./lib/errors.js");
    logError(error, {
      operation: "installation",
      file: targetDir,
      helpUrl: "https://github.com/sigma-protocol/cli/issues",
    });
    return; // Exit early on failure
  }

  // Create or update .sigma-manifest.json for version tracking
  const manifestPath = path.join(targetDir, ".sigma-manifest.json");
  const now = new Date().toISOString();

  // Backup existing manifest before modification
  const manifestBackupPath = await backupFile(manifestPath);
  if (manifestBackupPath) {
    console.log(chalk.gray(`  Created manifest backup: ${path.basename(manifestBackupPath)}`));
  }

  // Try to read existing manifest first
  let existingManifest = null;
  if (await fs.pathExists(manifestPath)) {
    try {
      existingManifest = await fs.readJson(manifestPath);
    } catch {
      // Invalid existing manifest, start fresh
      console.log(chalk.yellow("  Warning: Existing manifest was invalid, creating new one"));
    }
  }

  // Build the manifest with proper merge logic
  const manifest = {
    // Always update to current version
    sigma_version: "3.0.0",

    // Preserve original initialized date, or set new one
    initialized: existingManifest?.initialized || now,

    // Always update sync time
    last_sync: now,

    // Track installation history
    installation_history: [
      ...(existingManifest?.installation_history || []),
      {
        timestamp: now,
        platforms: platforms,
        modules: modules,
      },
    ].slice(-10), // Keep last 10 installations

    // Merge project info (preserve existing, add new)
    project_info: {
      ...(existingManifest?.project_info || {}),
    },

    // Preserve command history
    commands_run: existingManifest?.commands_run || {},

    // Clear pending updates on fresh install
    pending_updates: [],

    // Preserve section inventory
    section_inventory: existingManifest?.section_inventory || {},

    // Track installed platforms and modules
    installed_platforms: platforms,
    installed_modules: modules,
  };

  // Read project name from package.json if available
  const pkgPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(pkgPath)) {
    try {
      const pkg = await fs.readJson(pkgPath);
      manifest.project_info.name = pkg.name;
      manifest.project_info.version = pkg.version;
    } catch {
      // Ignore errors
    }
  }

  try {
    await fs.writeJson(manifestPath, manifest, { spaces: 2 });
    console.log(chalk.gray(`  ${existingManifest ? "Updated" : "Created"} .sigma-manifest.json for version tracking`));
    // Clean up backup on success
    await cleanupBackup(manifestBackupPath);
  } catch (manifestError) {
    console.error(chalk.red(`  Failed to write manifest: ${manifestError.message}`));
    // Attempt to restore from backup
    if (manifestBackupPath) {
      const restored = await restoreFromBackup(manifestPath, manifestBackupPath);
      if (restored) {
        console.log(chalk.yellow(`  Restored previous manifest from backup`));
      }
    }
  }

  // Create .sigma/context/ directory structure for persistent context tracking
  const sigmaContextDir = path.join(targetDir, ".sigma", "context");
  await fs.ensureDir(sigmaContextDir);

  // Create initial context files
  const contextFiles = {
    "project.json": {
      generated_at: new Date().toISOString(),
      summary: "Auto-generated by Sigma Protocol installation. Will be populated by @step-12-context-engine.",
      tech_stack: {},
      key_files: [],
    },
    "history.json": {
      version: "1.0.0",
      entries: [],
      description: "Command execution history for context continuity",
    },
    "decisions.json": {
      version: "1.0.0",
      checkpoints: [],
      description: "HITL checkpoint decisions and key choices made during workflow",
    },
  };

  for (const [filename, content] of Object.entries(contextFiles)) {
    const filePath = path.join(sigmaContextDir, filename);
    if (!(await fs.pathExists(filePath))) {
      await fs.writeJson(filePath, content, { spaces: 2 });
    }
  }

  // Create .sigma/rules/ directory for modular rules
  const sigmaRulesDir = path.join(targetDir, ".sigma", "rules");
  await fs.ensureDir(sigmaRulesDir);

  // Create .claude/rules/ directory for Claude Code compatibility
  if (platforms.includes("claude-code")) {
    const claudeRulesDir = path.join(targetDir, ".claude", "rules");
    await fs.ensureDir(claudeRulesDir);
  }

  console.log(chalk.gray(`  Created .sigma/context/ and .sigma/rules/ directories`));

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
  debugLog("buildCommand called with options:", JSON.stringify(options, null, 2));

  const targetDir = options.target || process.cwd();
  const platforms =
    options.platform === "all" ? Object.keys(PLATFORMS) : [options.platform];

  verboseLog("Build target:", targetDir);
  debugLog("Platforms to build:", platforms);

  const modules = [
    "steps",
    "audit",
    "dev",
    "ops",
    "deploy",
    "generators",
    "marketing",
  ];

  // Dry-run mode: just show what would be built
  if (options.dryRun) {
    console.log(
      boxen(
        chalk.cyan.bold("Dry Run Mode - No changes will be made\n\n") +
        chalk.white.bold("Would build for:\n") +
        platforms.map(p => chalk.cyan(`  • ${PLATFORMS[p]?.name || p}`)).join("\n") +
        chalk.white.bold("\n\nTarget directory:\n") +
        chalk.gray(`  ${targetDir}\n\n`) +
        chalk.white.bold("Modules to include:\n") +
        modules.map(m => chalk.gray(`  • ${m}`)).join("\n"),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "cyan",
          title: "Build Preview",
          titleAlignment: "center",
        }
      )
    );
    return;
  }

  // Use Listr2 for consistent progress display
  const buildTasks = new Listr(
    platforms.map((platform) => ({
      title: `Building for ${PLATFORMS[platform]?.name || platform}`,
      task: async (_ctx, task) => {
        // Create a simple spinner-like object for compatibility
        const spinner = {
          text: "",
          start: () => spinner,
          succeed: () => spinner,
          fail: () => spinner,
        };

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

        task.title = `${PLATFORMS[platform]?.name || platform} build complete`;
      },
    })),
    {
      concurrent: false,
      rendererOptions: {
        showSubtasks: true,
        collapseSubtasks: false,
      },
    }
  );

  try {
    await buildTasks.run();
    console.log(chalk.green("\n✓ Build complete\n"));
  } catch (error) {
    const { logError } = await import("./lib/errors.js");
    logError(error, {
      operation: "build",
      file: targetDir,
      helpUrl: "https://github.com/sigma-protocol/cli/issues",
    });
    process.exit(1);
  }
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

  // Use Listr2 for consistent progress display
  const skillTasks = new Listr(
    platforms.map((platform) => ({
      title: `Installing skills for ${PLATFORMS[platform]?.name || platform}`,
      task: async (_ctx, task) => {
        // Create compatibility spinner object
        const spinner = {
          text: "",
          start: () => spinner,
          succeed: () => spinner,
          fail: () => spinner,
        };

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
        task.title = `${PLATFORMS[platform]?.name || platform}: ${r.installed} skills installed${r.skipped > 0 ? `, ${r.skipped} skipped` : ""}`;
      },
    })),
    {
      concurrent: false,
      rendererOptions: {
        showSubtasks: true,
        collapseSubtasks: false,
      },
    }
  );

  try {
    await skillTasks.run();
  } catch (error) {
    const { logError } = await import("./lib/errors.js");
    logError(error, {
      operation: "install-skills",
      file: targetDir,
      helpUrl: "https://github.com/sigma-protocol/cli/issues",
    });
    return;
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
          "  • Sigma Core (research, verification, bdd-scenarios...)\n",
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

// Note: installCursorSkills, installClaudeCodeSkills, installClaudeCodeCommands, installOpenCodeSkills
// are now imported from ./lib/skills/index.js
// Note: countFilesByExt, findSkillDirs, validateSkillDirectory, validateAllSkills
// are now imported from ./lib/utils/index.js

async function installHarnessCommand(options) {
  showBanner();

  const isGlobal = options.global || false;
  const targetDir = isGlobal
    ? path.join(process.env.HOME || "~", ".config", "opencode")
    : options.target || process.cwd();

  console.log(chalk.white("Installing Sigma Agent Harness Plugin...\n"));
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

    const harnessPackage = "sigma-harness";
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
    spinner.succeed("Updated opencode.json with sigma-harness plugin");

    spinner = ora("Copying agent configurations...").start();

    const agentDir = path.join(targetDir, ".opencode", "agent");
    const agentSourceDir = path.join(ROOT_DIR, "platforms", "opencode", "agent");
    await fs.ensureDir(agentDir);

    if (await fs.pathExists(agentSourceDir)) {
      await fs.copy(agentSourceDir, agentDir);
      const agentCount = await countFilesByExt(agentSourceDir, ".md");
      spinner.succeed(`Copied ${agentCount} agent templates`);
    } else {
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
    }

    spinner = ora("Creating Sigma harness config...").start();

    const harnessConfigPath = path.join(targetDir, "sigma-harness.json");
    if (!(await fs.pathExists(harnessConfigPath))) {
      const harnessConfig = {
        $schema:
          "https://raw.githubusercontent.com/dallionking/sigma-protocol/main/packages/sigma-harness/sigma-harness.schema.json",
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
    spinner.succeed("Created sigma-harness.json configuration");

    console.log("");
    console.log(
      boxen(
        chalk.green("Sigma Agent Harness installed successfully!\n\n") +
          chalk.white("Installed components:\n") +
          chalk.gray("  - Plugin registered in opencode.json\n") +
          chalk.gray("  - 5 tab-switchable agents (Sigma family)\n") +
          chalk.gray("  - Sigma harness configuration\n\n") +
          chalk.white("Next steps:\n") +
          chalk.cyan("  1. npm install sigma-harness\n") +
          chalk.cyan(
            "  2. npx sigma-protocol install-skills --platform opencode\n",
          ) +
          chalk.cyan("  3. Run 'opencode' and press Tab to switch agents\n\n") +
          chalk.gray("Documentation: https://github.com/dallionking/sigma-protocol"),
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

// Retrofit command handler - analyze and update/generate Sigma docs
async function retrofitCommand(options) {
  showBanner();

  const targetDir = options.target || process.cwd();
  console.log(chalk.gray(`Target directory: ${targetDir}\n`));

  // Check if Sigma is installed
  const existing = await detectInstallations(targetDir);
  const hasAnyInstallation = Object.values(existing).some((v) => v);

  // Check for manifest
  const manifestPath = path.join(targetDir, ".sigma-manifest.json");
  const hasManifest = await fs.pathExists(manifestPath);

  // Check for docs directory
  const docsDir = path.join(targetDir, "docs");
  const hasDocs = await fs.pathExists(docsDir);

  console.log(chalk.cyan("📊 Project Analysis\n"));

  // Determine project state
  let projectState = "new"; // new, partial, installed
  if (hasAnyInstallation && hasManifest) {
    projectState = "installed";
    console.log(chalk.green("  ✓ Sigma Protocol installed"));
  } else if (hasDocs || hasAnyInstallation) {
    projectState = "partial";
    console.log(chalk.yellow("  ⚠ Partial Sigma installation detected"));
  } else {
    console.log(chalk.gray("  ○ No Sigma installation found"));
  }

  // Check for existing Sigma docs
  const sssDocPaths = [
    "docs/specs/MASTER_PRD.md",
    "docs/architecture/ARCHITECTURE.md",
    "docs/ux/UX-DESIGN.md",
    "docs/flows/FLOW-TREE.md",
    "docs/wireframes/WIREFRAME-SPEC.md",
    "docs/design/DESIGN-SYSTEM.md",
    "docs/states/STATE-SPEC.md",
    "docs/technical/TECHNICAL-SPEC.md",
    "docs/prds",
  ];

  const existingDocs = [];
  const missingDocs = [];

  for (const docPath of sssDocPaths) {
    const fullPath = path.join(targetDir, docPath);
    if (await fs.pathExists(fullPath)) {
      existingDocs.push(docPath);
    } else {
      missingDocs.push(docPath);
    }
  }

  console.log("");
  console.log(chalk.cyan("📁 Documentation Status\n"));
  console.log(`  Existing: ${chalk.green(existingDocs.length)} files/folders`);
  console.log(`  Missing:  ${chalk.yellow(missingDocs.length)} files/folders`);

  // Determine recommendation
  console.log("");
  console.log(chalk.cyan("🎯 Recommended Actions\n"));

  if (projectState === "new" && existingDocs.length === 0) {
    console.log(chalk.white("  This appears to be a new project without Sigma.\n"));
    console.log(chalk.gray("  Options:"));
    console.log(chalk.cyan("    1. Install Sigma: ") + chalk.white("npx sigma-protocol"));
    console.log(chalk.cyan("    2. Run Steps:     ") + chalk.white("Start with @step-1-ideation"));
  } else if (existingDocs.length > 0 && missingDocs.length > 0) {
    console.log(chalk.white("  Existing docs found. Choose your path:\n"));
    console.log(chalk.gray("  For UPDATING existing docs (add new frameworks):"));
    console.log(chalk.cyan("    @retrofit-enhance --mode=update\n"));
    console.log(chalk.gray("  For GENERATING missing docs:"));
    console.log(chalk.cyan("    @retrofit-analyze") + chalk.gray(" (analyze first)"));
    console.log(chalk.cyan("    @retrofit-generate --priority=high") + chalk.gray(" (then generate)"));
  } else if (existingDocs.length > 0 && missingDocs.length === 0) {
    console.log(chalk.green("  ✓ All core documentation exists!\n"));
    console.log(chalk.gray("  To update with latest frameworks:"));
    console.log(chalk.cyan("    @retrofit-enhance --mode=update"));
  }

  // If dry-run mode
  if (options.dryRun) {
    console.log("");
    console.log(chalk.yellow("  [DRY RUN] No changes made."));
    return;
  }

  // Interactive mode - ask what to do
  console.log("");
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        {
          name: "Analyze project (run @retrofit-analyze)",
          value: "analyze",
        },
        {
          name: "Update existing docs with new frameworks",
          value: "update",
        },
        {
          name: "Generate missing documentation",
          value: "generate",
        },
        {
          name: "Exit (I'll run commands manually)",
          value: "exit",
        },
      ],
    },
  ]);

  if (action === "exit") {
    console.log(chalk.gray("\nRun these commands in your AI assistant:"));
    console.log(chalk.cyan("  @retrofit-analyze"));
    console.log(chalk.cyan("  @retrofit-enhance --mode=update"));
    console.log(chalk.cyan("  @retrofit-generate --priority=high"));
    return;
  }

  const commandToRun =
    action === "analyze"
      ? "@retrofit-analyze"
      : action === "update"
        ? "@retrofit-enhance --mode=update" + (options.steps ? ` --steps=${options.steps}` : "")
        : "@retrofit-generate --priority=high";

  // Show the command they should run
  console.log("");
  console.log(
    boxen(
      chalk.white("Run this command in your AI assistant:\n\n") +
        chalk.cyan(commandToRun) +
        chalk.gray("\n\n(The AI will guide you through the process)"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      },
    ),
  );

  // Offer to launch Claude Code immediately (with terminal backend selection)
  console.log("");
  const { launchNow } = await inquirer.prompt([
    {
      type: "confirm",
      name: "launchNow",
      message: "Launch Claude Code now and run this command automatically?",
      default: true,
    },
  ]);

  if (!launchNow) return;

  const { spawnClaude, selectTerminalBackend } = await import("./lib/terminal-utils.js");
  const backend = await selectTerminalBackend(options.backend);
  await spawnClaude(commandToRun, {
    backend,
    sessionName: "sigma-retrofit",
    workdir: targetDir,
  });
}

// Update command handler - pull latest and retrofit
async function updateCommand(options) {
  debugLog("updateCommand called with options:", JSON.stringify(options, null, 2));
  showBanner();

  const targetDir = options.target || process.cwd();
  verboseLog("Update target:", targetDir);
  console.log(chalk.gray(`Target directory: ${targetDir}\n`));

  // Quick mode implies no retrofit
  if (options.quick) {
    options.skipRetrofit = true;
  }

  // Check if we're running from within the SSS-Protocol source repo
  const resolvedTarget = path.resolve(targetDir);
  const resolvedRoot = path.resolve(ROOT_DIR);
  if (resolvedTarget === resolvedRoot) {
    console.log(
      chalk.yellow("⚠ Cannot update the SSS-Protocol source repo itself.\n"),
    );
    console.log(chalk.white("To update a project, run from that project directory:"));
    console.log(chalk.cyan("  cd /path/to/your/project"));
    console.log(chalk.cyan("  npx sigma-protocol update\n"));
    console.log(chalk.gray("Or specify a target:"));
    console.log(chalk.cyan("  sigma update --target /path/to/your/project\n"));
    return;
  }

  // Check for existing installation
  const existing = await detectInstallations(targetDir);
  const hasAnyInstallation = Object.values(existing).some((v) => v);

  if (!hasAnyInstallation) {
    console.log(
      chalk.yellow("⚠ No Sigma Protocol installation found.\n"),
    );
    console.log(chalk.white("Run this first to install:"));
    console.log(chalk.cyan("  npx sigma-protocol\n"));
    return;
  }

  if (options.quick) {
    console.log(chalk.cyan("⚡ Quick update mode (commands & skills only)\n"));
    const missing = await detectMissingAssets(targetDir);
    if (missing.length > 0) {
      console.log(chalk.yellow("Missing assets detected:"));
      missing.forEach((item) => console.log(chalk.yellow(`  - ${item}`)));
      console.log("");
    } else {
      console.log(chalk.green("✓ All core assets present\n"));
    }
  }

  // Check mode
  if (options.check) {
    console.log(chalk.cyan("🔍 Checking for updates...\n"));

    // Read manifest to get current versions
    const manifestPath = path.join(targetDir, ".sigma-manifest.json");
    let currentVersion = "unknown";

    if (await fs.pathExists(manifestPath)) {
      try {
        const manifest = await fs.readJson(manifestPath);
        currentVersion = manifest.sigma_version || "unknown";
      } catch {
        // Ignore
      }
    }

    console.log(`  Current version: ${chalk.yellow(currentVersion)}`);
    console.log(`  Latest version:  ${chalk.green("3.0.0")} (check npm for actual latest)\n`);

    if (currentVersion !== "3.0.0") {
      console.log(chalk.white("Updates available! Run:"));
      console.log(chalk.cyan("  npx sigma-protocol update\n"));
    } else {
      console.log(chalk.green("✓ You're on the latest version!\n"));
    }

    console.log(chalk.gray("To see what's new in your docs:"));
    console.log(chalk.cyan("  npx sigma-protocol retrofit"));
    return;
  }

  // Validate source files before updating
  const allModules = Object.keys(MODULES);
  const sourceValidation = await validateSourceFiles(allModules);
  if (!sourceValidation.valid) {
    console.log(chalk.red("❌ Source files not found:\n"));
    sourceValidation.issues.forEach((issue) => {
      console.log(chalk.red(`   • ${issue}`));
    });
    console.log("");
    console.log(chalk.yellow("💡 This usually means the CLI cannot find the Sigma Protocol source files."));
    console.log(chalk.gray(`   ROOT_DIR: ${ROOT_DIR}`));
    console.log("");
    console.log(chalk.white("Solutions:"));
    console.log(chalk.gray("   1. Run from the SSS-Protocol repository root"));
    console.log(chalk.gray("   2. Reinstall using: npx sigma-protocol install"));
    return;
  }

  // Perform update
  console.log(chalk.cyan("🔄 Updating Sigma Protocol...\n"));

  const spinner = ora("Updating commands and steps...").start();

  try {
    // Reinstall to get latest commands
    const platforms = Object.keys(existing).filter((p) => existing[p]);

    for (const platform of platforms) {
      spinner.text = `Updating ${PLATFORMS[platform].name}...`;

      // Get all modules (full update)
      const modules = Object.keys(MODULES);

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
    }

    // Update manifest
    const manifestPath = path.join(targetDir, ".sigma-manifest.json");
    let manifest = {
      sigma_version: "3.0.0",
      initialized: new Date().toISOString(),
      last_sync: new Date().toISOString(),
      commands_run: {},
    };

    if (await fs.pathExists(manifestPath)) {
      try {
        const existing = await fs.readJson(manifestPath);
        manifest = {
          ...existing,
          sigma_version: "3.0.0",
          last_sync: new Date().toISOString(),
        };
      } catch {
        // Keep new manifest
      }
    }

    await fs.writeJson(manifestPath, manifest, { spaces: 2 });

    spinner.succeed("Commands updated to latest version!");

  } catch (error) {
    spinner.fail(`Update failed: ${error.message}`);
    process.exit(1);
  }

  // Skip retrofit if requested
  if (options.skipRetrofit) {
    console.log("");
    console.log(chalk.green("✓ Update complete (retrofit skipped)"));
    console.log(chalk.gray("\nTo update your docs with new frameworks:"));
    console.log(chalk.cyan("  npx sigma-protocol retrofit"));
    return;
  }

  // Show retrofit recommendation
  console.log("");
  console.log(
    boxen(
      chalk.green("✓ Commands updated!\n\n") +
        chalk.white("Next step - update your docs with new frameworks:\n\n") +
        chalk.cyan("  @retrofit-enhance --mode=update\n\n") +
        chalk.gray("Or run the CLI retrofit wizard:\n") +
        chalk.cyan("  npx sigma-protocol retrofit"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "green",
      },
    ),
  );
}

const program = new Command();

// Global state for debug/verbose modes
const debugState = {
  debug: false,
  verbose: false,
};

/**
 * Debug logging - only prints when --debug flag is set
 * @param  {...any} args - Arguments to log
 */
function debugLog(...args) {
  if (debugState.debug) {
    console.log(chalk.gray("[DEBUG]"), ...args);
  }
}

/**
 * Verbose logging - only prints when --verbose or --debug flag is set
 * @param  {...any} args - Arguments to log
 */
function verboseLog(...args) {
  if (debugState.verbose || debugState.debug) {
    console.log(chalk.gray("[INFO]"), ...args);
  }
}

/**
 * Set up global options processing
 */
function processGlobalOptions() {
  const args = process.argv;

  // Check for debug flag
  if (args.includes("--debug") || args.includes("-D")) {
    debugState.debug = true;
    debugState.verbose = true; // Debug implies verbose
    debugLog("Debug mode enabled");
    debugLog("Node version:", process.version);
    debugLog("Platform:", process.platform);
    debugLog("Working directory:", process.cwd());
    debugLog("Arguments:", args.slice(2).join(" "));
  }

  // Check for verbose flag
  if (args.includes("--verbose") || args.includes("-v")) {
    debugState.verbose = true;
    verboseLog("Verbose mode enabled");
  }
}

// Process global options before Commander parses commands
processGlobalOptions();

program
  .name("sigma-protocol")
  .description("Sigma Protocol - Platform-agnostic AI development methodology\n\n" +
    "Global flags (apply to all commands):\n" +
    "  -D, --debug     Show detailed debugging information\n" +
    "  -v, --verbose   Show additional informational output")
  .version("1.0.0-alpha.1")
  .option("-D, --debug", "Enable debug output (includes verbose)")
  .option("-v, --verbose", "Enable verbose output")
  .addHelpText("after", `
Advanced Commands:
  doctor            Check installation health and diagnose issues
  maid              Repository maintenance and cleanup (AI-powered)
  quickstart        Guided setup for new users (5-minute path)
  search <query>    Search all 100+ Sigma commands by keyword

Examples:
  $ sigma                     # Interactive menu
  $ sigma quickstart          # Guided first-time setup
  $ sigma install             # Install to current project
  $ sigma doctor              # Check installation health
  $ sigma search prd          # Find PRD-related commands

Documentation: https://github.com/sigma-protocol/cli
  `);

// Hook to ensure global options are processed after Commander parsing
program.hook("preAction", () => {
  const opts = program.opts();
  if (opts.debug) {
    debugState.debug = true;
    debugState.verbose = true;
  }
  if (opts.verbose) {
    debugState.verbose = true;
  }
});

program
  .command("install")
  .description("Install Sigma Protocol to your project")
  .addHelpText("after", `
Examples:
  $ sigma install                          # Interactive mode
  $ sigma install -y                       # Auto-detect platform, install all modules
  $ sigma install -p cursor -m all         # Cursor with all modules
  $ sigma install -p all -m steps,audit    # All platforms, specific modules
  $ sigma install --target ../myapp        # Install to different directory
  $ sigma install -n                       # Preview without installing

Documentation: https://github.com/sigma-protocol/cli#installation
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-y, --yes", "Non-interactive mode (accept all defaults)")
  .option("-p, --platform <platforms>", "Platform(s) to install: cursor, claude-code, opencode, all (comma-separated)")
  .option("-m, --modules <modules>", "Modules to install (comma-separated, or 'all')")
  .option("-n, --dry-run", "Preview what would be installed without making changes")
  .action(installCommand);

program
  .command("status")
  .description("Check Sigma Protocol installation status")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(statusCommand);

program
  .command("build")
  .description("Build platform-specific outputs")
  .addHelpText("after", `
Examples:
  $ sigma build                            # Build for all platforms
  $ sigma build -p cursor                  # Build for Cursor only
  $ sigma build -p opencode -t ./myapp     # Build for OpenCode in specific directory
  $ sigma build --dry-run                  # Preview what would be generated

Platforms:
  cursor       Generate .cursor/commands/ and .cursorrules
  claude-code  Generate .claude/commands/ and CLAUDE.md
  opencode     Generate .opencode/command/ and opencode.json
  all          Generate for all platforms (default)

Documentation: https://github.com/sigma-protocol/cli#build
  `)
  .option(
    "-p, --platform <platform>",
    "Platform to build (cursor, claude-code, opencode, all)",
    "all",
  )
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-n, --dry-run", "Preview what would be built without making changes")
  .action(buildCommand);

program
  .command("update")
  .description("Update Sigma Protocol assets (commands, skills, agents)")
  .addHelpText("after", `
Examples:
  $ sigma update                           # Update commands and skills
  $ sigma update --quick                   # Fast sync (no retrofit)
  $ sigma update --check                   # Check for updates without applying
  $ sigma update --skip-retrofit           # Update commands only
  $ sigma update --dry-run                 # Preview what would change

What happens:
  1. Checks for new Sigma Protocol version
  2. Updates commands and skills to latest
  3. Optionally runs retrofit analysis on your project
  4. Optionally merges updates with existing documentation

Documentation: https://github.com/sigma-protocol/cli#update
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("--quick", "Fast sync of commands/skills only")
  .option("--skip-retrofit", "Only update commands, skip retrofit analysis")
  .option("--check", "Check for updates without applying them")
  .option("-n, --dry-run", "Preview what would change without making modifications")
  .action(updateCommand);

program
  .command("retrofit")
  .description("Analyze existing project and update/generate Sigma documentation")
  .addHelpText("after", `
Examples:
  $ sigma retrofit                         # Auto-analyze and generate docs
  $ sigma retrofit --backend iterm         # Launch Claude Code in iTerm2 (when you choose an AI action)
  $ sigma retrofit --backend tmux          # Launch Claude Code in tmux (when you choose an AI action)
  $ sigma retrofit -m analyze              # Analyze only, don't modify
  $ sigma retrofit --steps 1,2,3           # Update specific steps
  $ sigma retrofit --dry-run               # Preview what would change

Modes:
  analyze   Scan project and report what documentation exists/missing
  update    Update existing Sigma docs with project changes
  generate  Generate new Sigma docs from scratch
  auto      Smart mode: analyze first, then update or generate (default)

Documentation: https://github.com/sigma-protocol/cli#retrofit
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("--backend <backend>", "Terminal backend for launching Claude Code (iterm, tmux)")
  .option("-m, --mode <mode>", "Mode: analyze, update, generate, auto", "auto")
  .option("--steps <steps>", "Specific steps to update (comma-separated)")
  .option("--dry-run", "Show what would be done without making changes")
  .action(retrofitCommand);

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
  .description("Install Sigma Agent Harness plugin for OpenCode")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-g, --global", "Install globally to ~/.config/opencode/")
  .action(installHarnessCommand);

// Doctor command handler - health check for installation
async function doctorCommand(options) {
  debugLog("doctorCommand called with options:", JSON.stringify(options, null, 2));
  showBanner();

  const targetDir = options.target || process.cwd();
  verboseLog("Doctor check target:", targetDir);
  console.log(chalk.gray(`Target directory: ${targetDir}\n`));

  const issues = [];
  const warnings = [];
  const passed = [];

  debugLog("Starting health checks...");
  console.log(chalk.cyan("🔍 Running Sigma Protocol Health Check...\n"));

  // Check 1: Installation detection
  const existing = await detectInstallations(targetDir);
  const installedPlatforms = Object.entries(existing)
    .filter(([_, v]) => v)
    .map(([k]) => k);

  if (installedPlatforms.length === 0) {
    issues.push("No Sigma Protocol installation detected");
  } else {
    passed.push(`Installed for: ${installedPlatforms.map(p => PLATFORMS[p].name).join(", ")}`);
  }

  // Check 2: Manifest file
  const manifestPath = path.join(targetDir, ".sigma-manifest.json");
  if (await fs.pathExists(manifestPath)) {
    try {
      const manifest = await fs.readJson(manifestPath);
      if (manifest.sigma_version) {
        passed.push(`Manifest valid (version ${manifest.sigma_version})`);
      } else {
        warnings.push("Manifest missing sigma_version field");
      }
    } catch {
      issues.push("Manifest file is invalid JSON");
    }
  } else {
    warnings.push("No .sigma-manifest.json found (version tracking disabled)");
  }

  // Check 3: Stale SSS references
  const spinner = ora("Checking for stale references...").start();

  try {
    const { execSync } = await import("child_process");
    const grepResult = execSync(
      `grep -r "SSS\\|sss-\\|\\.sss" "${targetDir}" --include="*.md" --include="*.mdc" --include="*.json" -l 2>/dev/null || true`,
      { encoding: "utf8" }
    );

    if (grepResult.trim()) {
      const files = grepResult.trim().split("\n").filter(Boolean);
      // Filter out files that should have SSS (like historical docs or this file itself)
      const problematicFiles = files.filter(f => 
        !f.includes("node_modules") && 
        !f.includes(".git") &&
        !f.includes("CHANGELOG") &&
        !f.includes("history")
      );
      
      if (problematicFiles.length > 0) {
        warnings.push(`Found ${problematicFiles.length} files with stale SSS references`);
        if (options.verbose) {
          console.log(chalk.gray("\n  Files with stale refs:"));
          problematicFiles.slice(0, 5).forEach(f => console.log(chalk.gray(`    - ${f}`)));
          if (problematicFiles.length > 5) {
            console.log(chalk.gray(`    ... and ${problematicFiles.length - 5} more`));
          }
        }
      } else {
        passed.push("No stale SSS references found");
      }
    } else {
      passed.push("No stale SSS references found");
    }
    spinner.stop();
  } catch {
    spinner.stop();
    warnings.push("Could not check for stale references (grep failed)");
  }

  // Check 4: Required directories
  const requiredDirs = [];
  for (const [platform, installed] of Object.entries(existing)) {
    if (installed) {
      const config = PLATFORMS[platform];
      requiredDirs.push({ platform, path: config.outputDir });
    }
  }

  for (const { platform, path: dirPath } of requiredDirs) {
    const fullPath = path.join(targetDir, dirPath);
    const files = await fs.readdir(fullPath).catch(() => []);
    if (files.length === 0) {
      warnings.push(`${PLATFORMS[platform].name} directory exists but is empty`);
    } else {
      passed.push(`${PLATFORMS[platform].name} has ${files.length} items`);
    }
  }

  // Check 5: CLAUDE.md or AGENTS.md (for Claude Code/OpenCode)
  if (existing["claude-code"]) {
    const claudeMd = path.join(targetDir, "CLAUDE.md");
    if (await fs.pathExists(claudeMd)) {
      passed.push("CLAUDE.md orchestrator present");
    } else {
      warnings.push("CLAUDE.md missing (recommended for Claude Code)");
    }
  }

  if (existing.opencode) {
    const agentsMd = path.join(targetDir, "AGENTS.md");
    if (await fs.pathExists(agentsMd)) {
      passed.push("AGENTS.md orchestrator present");
    } else {
      warnings.push("AGENTS.md missing (recommended for OpenCode)");
    }
  }

  // Check 6: Ralph loop files (if using Ralph mode)
  const ralphDir = path.join(targetDir, "scripts", "ralph");
  if (await fs.pathExists(ralphDir)) {
    const sigmaRalph = path.join(ralphDir, "sigma-ralph.sh");
    if (await fs.pathExists(sigmaRalph)) {
      passed.push("Ralph loop script present");
    } else {
      warnings.push("scripts/ralph/ exists but sigma-ralph.sh missing");
    }
  }

  // Check 7: Schemas
  const schemaLocations = [
    ".cursor/schemas",
    ".claude/schemas",
    ".opencode/schemas",
  ];

  let schemasFound = false;
  for (const schemaLoc of schemaLocations) {
    const schemaPath = path.join(targetDir, schemaLoc);
    if (await fs.pathExists(schemaPath)) {
      schemasFound = true;
      break;
    }
  }

  if (schemasFound) {
    passed.push("JSON schemas installed");
  } else if (installedPlatforms.length > 0) {
    warnings.push("JSON schemas not found (Ralph mode may not work)");
  }

  // Check 8: Validate skill directory structures
  const skillDirs = [
    { platform: "claude-code", path: ".claude/skills" },
    { platform: "opencode", path: ".opencode/skill" },
  ];

  for (const { platform, path: skillPath } of skillDirs) {
    if (!existing[platform]) continue;

    const fullSkillPath = path.join(targetDir, skillPath);
    if (await fs.pathExists(fullSkillPath)) {
      const validation = await validateAllSkills(fullSkillPath);

      // validateAllSkills returns { valid: boolean, skills: number, warnings: string[] }
      if (validation.valid && validation.skills > 0) {
        passed.push(`${PLATFORMS[platform].name}: ${validation.skills} valid skills`);
      }

      if (validation.warnings && validation.warnings.length > 0) {
        warnings.push(`${PLATFORMS[platform].name}: ${validation.warnings.length} skill warnings`);
        if (options.verbose) {
          console.log(chalk.gray("\n  Skill warnings:"));
          validation.warnings.forEach((w) =>
            console.log(chalk.gray(`    - ${w}`))
          );
        }
      }
    }
  }

  // Print results
  console.log("");
  console.log(chalk.cyan("📊 Results\n"));

  if (passed.length > 0) {
    console.log(chalk.green("✓ Passed:"));
    passed.forEach(p => console.log(chalk.green(`  ✓ ${p}`)));
    console.log("");
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow("⚠ Warnings:"));
    warnings.forEach(w => console.log(chalk.yellow(`  ⚠ ${w}`)));
    console.log("");
  }

  if (issues.length > 0) {
    console.log(chalk.red("✗ Issues:"));
    issues.forEach(i => console.log(chalk.red(`  ✗ ${i}`)));
    console.log("");
  }

  // Summary
  const total = passed.length + warnings.length + issues.length;
  const score = Math.round((passed.length / total) * 100);

  console.log(
    boxen(
      chalk.white(`Health Score: ${score >= 80 ? chalk.green(score + "%") : score >= 50 ? chalk.yellow(score + "%") : chalk.red(score + "%")}\n\n`) +
        chalk.green(`✓ ${passed.length} passed\n`) +
        chalk.yellow(`⚠ ${warnings.length} warnings\n`) +
        chalk.red(`✗ ${issues.length} issues`),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: score >= 80 ? "green" : score >= 50 ? "yellow" : "red",
      }
    )
  );

  // If there are issues or warnings, offer to fix them
  if (issues.length > 0 || warnings.length > 0) {
    console.log("");
    const inquirer = await import("inquirer");
    
    const fixChoices = [];
    
    if (issues.includes("No Sigma Protocol installation detected")) {
      fixChoices.push({
        name: "Install Sigma Protocol for this project",
        value: "install",
      });
    }
    
    if (warnings.some(w => w.includes("stale SSS references"))) {
      fixChoices.push({
        name: "Fix stale SSS references (spawn Claude Code via tmux)",
        value: "fix-sss",
      });
    }
    
    if (warnings.some(w => w.includes("CLAUDE.md missing"))) {
      fixChoices.push({
        name: "Generate CLAUDE.md orchestrator file",
        value: "generate-claude-md",
      });
    }
    
    if (warnings.some(w => w.includes("AGENTS.md missing"))) {
      fixChoices.push({
        name: "Generate AGENTS.md orchestrator file",
        value: "generate-agents-md",
      });
    }
    
    if (warnings.some(w => w.includes("JSON schemas not found"))) {
      fixChoices.push({
        name: "Install JSON schemas",
        value: "install-schemas",
      });
    }
    
    if (warnings.some(w => w.includes("sigma-manifest.json"))) {
      fixChoices.push({
        name: "Create sigma-manifest.json",
        value: "create-manifest",
      });
    }
    
    fixChoices.push(new inquirer.default.Separator());
    fixChoices.push({ name: "Back to main menu", value: "menu" });
    fixChoices.push({ name: "Exit", value: "exit" });
    
    if (fixChoices.length > 3) { // More than just separator + menu + exit
      const { fixAction } = await inquirer.default.prompt([
        {
          type: "list",
          name: "fixAction",
          message: "Would you like to fix any issues?",
          choices: fixChoices,
        },
      ]);
      
      switch (fixAction) {
        case "install":
          console.log(chalk.cyan("\nRun: sigma install\n"));
          break;
          
        case "fix-sss": {
          console.log(chalk.cyan("\nSpawning Claude Code to fix SSS references...\n"));
          const { spawnClaude, selectTerminalBackend } = await import("./lib/terminal-utils.js");
          const backend = options.backend || await selectTerminalBackend();
          if (backend) {
            await spawnClaude("@cleanup-sss", {
              backend,
              sessionName: "sigma-doctor"
            });
          }
          break;
        }

        case "generate-claude-md": {
          const claudeMdContent = `# CLAUDE.md - Sigma Protocol Orchestrator

This file serves as the central orchestration point for Claude Code.

## Quick Commands

- \`@continue\` - Find and work on the next task
- \`@status\` - Show project status
- \`@gap-analysis\` - Verify implementation completeness

## Active PRDs

Check \`.sigma/prds/\` for active Product Requirement Documents.
`;
          await fs.writeFile(path.join(targetDir, "CLAUDE.md"), claudeMdContent);
          console.log(chalk.green("✅ Created CLAUDE.md\n"));
          break;
        }

        case "generate-agents-md": {
          const agentsMdContent = `# AGENTS.md - Sigma Protocol Orchestrator

This file serves as the central orchestration point for OpenCode agents.

## Quick Commands

- \`@continue\` - Find and work on the next task
- \`@status\` - Show project status
- \`@gap-analysis\` - Verify implementation completeness

## Active PRDs

Check \`.sigma/prds/\` for active Product Requirement Documents.
`;
          await fs.writeFile(path.join(targetDir, "AGENTS.md"), agentsMdContent);
          console.log(chalk.green("✅ Created AGENTS.md\n"));
          break;
        }

        case "install-schemas":
          console.log(chalk.cyan("\nRun: sigma install --schemas\n"));
          break;

        case "create-manifest": {
          const manifestContent = {
            sigma_version: "1.0.0",
            installed_at: new Date().toISOString(),
            platforms: installedPlatforms,
          };
          await fs.writeJson(path.join(targetDir, ".sigma-manifest.json"), manifestContent, { spaces: 2 });
          console.log(chalk.green("✅ Created .sigma-manifest.json\n"));
          break;
        }
          
        case "menu":
          return "menu";
          
        case "exit":
        default:
          break;
      }
    }
  } else {
    console.log(chalk.green("\n✅ All good! Your installation is healthy.\n"));
  }

  // Return to indicate we should continue if called from interactive
  return score >= 80 ? "healthy" : "needs-attention";
}

program
  .command("doctor")
  .description("Check Sigma Protocol installation health")
  .addHelpText("after", `
Examples:
  $ sigma doctor                           # Quick health check
  $ sigma doctor -v                        # Verbose output with details
  $ sigma doctor -t ./myproject            # Check specific project
  $ sigma doctor --backend iterm           # Use iTerm2 for auto-fix

Checks performed:
  - Platform installation status (Cursor, Claude Code, OpenCode)
  - Manifest file integrity and version
  - Module installation status
  - Skill file presence
  - Command file validation
  - Step documentation completeness

Terminal backends (for auto-fix):
  --backend iterm    Native iTerm2 tabs (macOS, click to navigate)
  --backend tmux     tmux sessions (detachable, Ctrl+B navigation)

Exit codes:
  0  All checks passed (healthy)
  1  Issues detected (needs attention)

Documentation: https://github.com/sigma-protocol/cli#doctor
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-v, --verbose", "Show detailed output")
  .option("--backend <backend>", "Terminal backend for auto-fix (iterm, tmux)")
  .action(doctorCommand);

// Detect stream count dynamically from PRDs
async function _detectStreamCount(targetDir) {
  // 1. Check streams.json for existing config
  const streamsJson = path.join(targetDir, ".sigma", "orchestration", "streams.json");
  if (await fs.pathExists(streamsJson)) {
    try {
      const config = JSON.parse(await fs.readFile(streamsJson, "utf8"));
      if (config.streams && config.streams.length > 0) {
        return config.streams.length;
      }
    } catch { /* ignore */ }
  }
  
  // 2. Count PRDs in orchestration directory
  const orchPrdDir = path.join(targetDir, ".sigma", "orchestration", "prds");
  if (await fs.pathExists(orchPrdDir)) {
    const files = await fs.readdir(orchPrdDir);
    const prds = files.filter(f => f.endsWith(".md") || f.endsWith(".json"));
    if (prds.length > 0) return Math.min(prds.length, 8);
  }
  
  // 3. Count PRDs in docs/prds
  const docsPrdDir = path.join(targetDir, "docs", "prds");
  if (await fs.pathExists(docsPrdDir)) {
    const files = await fs.readdir(docsPrdDir);
    const prds = files.filter(f => f.endsWith(".md") || f.endsWith(".json"));
    if (prds.length > 0) return Math.min(prds.length, 8);
  }
  
  // 4. Count Ralph PRD directories
  const ralphDir = path.join(targetDir, "docs", "ralph");
  if (await fs.pathExists(ralphDir)) {
    const dirs = await fs.readdir(ralphDir);
    const prdDirs = [];
    for (const d of dirs) {
      const prdJson = path.join(ralphDir, d, "prd.json");
      if (await fs.pathExists(prdJson)) prdDirs.push(d);
    }
    if (prdDirs.length > 0) return Math.min(prdDirs.length, 8);
  }
  
  // Default
  return 4;
}

// Orchestration command handler
async function orchestrateCommand(options) {
  debugLog("orchestrateCommand called with options:", JSON.stringify(options, null, 2));
  showBanner();

  const targetDir = options.target || process.cwd();
  verboseLog("Orchestration target:", targetDir);

  // Quick launch mode - just spawn N Claude instances, no PRDs
  if (options.quick || options.quickPanes || options.quickIterm) {
    const numAgents = parseInt(options.quick || options.quickPanes || options.quickIterm) || 2;
    
    if (options.quickIterm) {
      // Native iTerm2 tabs
      const { quickLaunchIterm } = await import("./lib/orchestration/iterm-launcher.js");
      await quickLaunchIterm(targetDir, numAgents);
    } else if (options.quickPanes) {
      // tmux panes in one window
      console.log(chalk.cyan(`\n⚡ Quick Launch: ${numAgents} Claude instances in PANES (one window)\n`));
      const { quickLaunchPanes } = await import("./lib/orchestration/tmux-launcher.js");
      await quickLaunchPanes(targetDir, numAgents);
    } else {
      // tmux tabs (windows)
      console.log(chalk.cyan(`\n⚡ Quick Launch: ${numAgents} Claude instances in tmux tabs\n`));
      const { quickLaunch } = await import("./lib/orchestration/tmux-launcher.js");
      await quickLaunch(targetDir, numAgents);
    }
    return;
  }
  
  // Explicit backend selection (skip interactive menu if user specified backend)
  // NOTE: If sandbox mode is requested, we must not force any local terminal backend.
  const useExplicitIterm = !options.sandbox && (options.iterm || options.backend === 'iterm');
  const useExplicitTmux = !options.sandbox && options.backend === 'tmux';
  
  // When explicit --iterm or --backend iterm is passed, use iTerm2 directly
  if (useExplicitIterm) {
    const { launchItermTabs } = await import("./lib/orchestration/iterm-launcher.js");
    const { checkPRDs, selectAgent, selectStories, createWorktrees, generateStreamsConfig } = await import("./lib/orchestration/index.js");
    
    // PRD check
    const prdCheck = await checkPRDs(targetDir);
    if (!prdCheck.ready) {
      console.log(chalk.yellow(`\n⚠️  ${prdCheck.message}\n`));
      return;
    }
    
    // Agent selection
    const agent = options.agent !== 'auto' ? options.agent : await selectAgent();
    
    // Story selection
    const selectedPrds = await selectStories(prdCheck.prds);
    if (selectedPrds.length === 0) return;
    
    // Stream/fork counts
    const numStreams = options.streams ? parseInt(options.streams) : Math.min(selectedPrds.length, 4);
    const forksPerStream = options.forks ? parseInt(options.forks) : 1;
    
    console.log(chalk.cyan(`\n📐 Architecture: iTerm2 tabs → ${numStreams} streams × ${forksPerStream} forks`));
    
    // Create worktrees
    const worktrees = await createWorktrees(targetDir, numStreams);
    
    // Generate config
    const config = await generateStreamsConfig(targetDir, selectedPrds, worktrees);
    
    // Launch with iTerm2
    await launchItermTabs({
      targetDir,
      agent,
      config,
      forksPerStream,
      autoStart: options.autoStart || false
    });
    
    return;
  }
  
  // When explicit --backend tmux is passed, skip to tmux flow (handled by runOrchestration below)
  // When --backend auto (default), go through interactive flow which prompts for iTerm2 vs tmux

  // Check if we need to attach or kill
  // Support both session names
  const sessionNames = ['sigma-orc', 'sigma-orchestration'];
  
  if (options.attach) {
    console.log(chalk.cyan("Attaching to existing orchestration session...\n"));
    for (const session of sessionNames) {
      try {
        const { execSync } = await import("child_process");
        execSync(`tmux attach -t ${session}`, { stdio: "inherit" });
        return;
      } catch {
        // Try next session name
      }
    }
    console.log(chalk.yellow("No existing session found. Start one with:"));
    console.log(chalk.cyan("  sigma orchestrate\n"));
    console.log(chalk.gray("  Or quick launch: sigma orchestrate --quick=3\n"));
    return;
  }

  if (options.kill) {
    // Check for any running session
    const { execSync: execSyncCheck } = await import("child_process");
    let foundSession = null;
    
    for (const session of sessionNames) {
      try {
        execSyncCheck(`tmux has-session -t ${session} 2>/dev/null`);
        foundSession = session;
        break;
      } catch {
        // Session doesn't exist
      }
    }

    if (!foundSession) {
      console.log(chalk.yellow("No orchestration session running.\n"));
      return;
    }

    console.log(chalk.yellow.bold("\n⚠️  Warning: This will stop all running orchestration streams"));
    console.log(chalk.gray(`   Session: ${foundSession}`));
    console.log(chalk.gray("   Any unsaved work in the streams will be lost.\n"));

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: chalk.red("Are you sure you want to kill the orchestration session?"),
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.gray("\nAborted. Session is still running."));
      return;
    }

    console.log(chalk.cyan("\nKilling orchestration session...\n"));
    try {
      const { execSync: execSyncKill } = await import("child_process");
      execSyncKill(`tmux kill-session -t ${foundSession}`, { stdio: "inherit" });
      console.log(chalk.green("✓ Session killed\n"));
    } catch {
      console.log(chalk.yellow("Failed to kill session.\n"));
    }
    return;
  }

  if (options.status) {
    console.log(chalk.cyan("Checking orchestration status...\n"));
    
    // Import and use the new message monitor
    const { printStatus } = await import("./lib/orchestration/message-monitor.js");
    await printStatus(targetDir);
    
    // Also check tmux
    try {
      const { execSync } = await import("child_process");
      const result = execSync("tmux list-panes -t sigma-orchestration -F '#{pane_index}:#{pane_title}:#{pane_current_command}'", { encoding: "utf8" });
      console.log(chalk.white("Active tmux panes:\n"));
      console.log(result);
    } catch {
      console.log(chalk.gray("No tmux session running.\n"));
    }
    return;
  }

  // Use the new orchestration flow following @doctor-fix pattern
  const { runOrchestration } = await import("./lib/orchestration/index.js");
  
  // Determine environment preset
  let environment = options.sandbox ? options.sandbox : undefined;
  if (useExplicitTmux) {
    environment = 'local-tmux'; // Skip interactive prompt, go straight to tmux
  }
  
  const result = await runOrchestration({
    targetDir,
    agent: options.agent !== 'auto' ? options.agent : undefined,
    environment,
    autoStart: options.autoStart || false,
    // Allow non-interactive runs when flags are passed
    streamCount: options.streams ? parseInt(options.streams, 10) : undefined,
    forksPerStream: options.forks ? parseInt(options.forks, 10) : undefined
  });
  
  // If orchestration delegated to sandbox mode
  if (result.delegateTo === 'sandbox') {
    await orchestrateSandboxMode(options, targetDir, result.prds, result.agent, result.environment);
    return;
  }
  
  if (!result.success) {
    console.log(chalk.gray(`\nOrchestration exited: ${result.reason || 'unknown reason'}\n`));
  }
  
  // Orchestration completed (either success or user cancelled)
  // The runOrchestration function handles everything including tmux setup
}

// Sandbox orchestration mode handler
async function orchestrateSandboxMode(options, targetDir, prds = null, agent = null, environment = null) {
  console.log(chalk.cyan("\n🐳 Sandbox Orchestration Mode\n"));
  
  const { SandboxManager: _SandboxManager, PROVIDERS } = await import("./lib/sandbox/index.js");
  const { loadSandboxConfig } = await import("./lib/sandbox/config.js");
  const { CostEstimator } = await import("./lib/sandbox/cost-estimator.js");
  const { generateStreamsConfig } = await import("./lib/orchestration/index.js");
  
  // Determine provider
  let provider = environment || (typeof options.sandbox === 'string' ? options.sandbox : null);
  const config = await loadSandboxConfig(targetDir);
  
  if (!provider && config?.provider) {
    provider = config.provider;
  }
  
  if (!provider) {
    // No provider configured - run setup wizard
    console.log(chalk.yellow("No sandbox provider configured.\n"));
    const { runSetupWizard } = await import("./lib/sandbox/setup-wizard.js");
    const result = await runSetupWizard(targetDir);
    
    if (!result) {
      console.log(chalk.gray("\nSetup cancelled.\n"));
      return;
    }
    
    provider = result.provider;
  }
  
  // If PRDs not passed from orchestration flow, detect them
  if (!prds || prds.length === 0) {
    const { detectPRDs } = await import("./lib/orchestration/index.js");
    prds = await detectPRDs(targetDir);
    
    if (prds.length === 0) {
      console.log(chalk.yellow("⚠️  No PRDs found for orchestration.\n"));
      console.log(chalk.gray("PRDs should be in: docs/prds/*.md"));
      console.log(chalk.cyan("\nCreate PRDs first, then run orchestration again."));
      return;
    }
  }
  
  const numStreams = Math.min(prds.length, 4); // Max 4 streams
  const forksPerStory = parseInt(options.forks) || config?.defaults?.forks_per_story || 1;
  
  const providerInfo = PROVIDERS[provider];
  console.log(chalk.white(`Provider: ${providerInfo?.name || provider}`));
  console.log(chalk.white(`Agent: ${agent || 'claude'}`));
  console.log(chalk.white(`Streams: ${numStreams}`));
  console.log(chalk.white(`PRDs: ${prds.length}`));
  console.log(chalk.white(`Forks per story: ${forksPerStory}`));
  console.log("");
  
  // Cost estimation
  const estimator = new CostEstimator(targetDir, config);
  
  const estimate = await estimator.estimate({
    provider,
    stories: prds.length,
    forksPerStory,
    estimatedMinutesPerStory: 15
  });
  
  console.log(estimator.formatEstimate(estimate));
  console.log("");
  
  // Check budget
  if (options.budget) {
    const budgetLimit = parseFloat(options.budget);
    if (estimate.estimatedCostWithBuffer > budgetLimit) {
      console.log(chalk.red(`⚠️  Estimated cost ($${estimate.estimatedCostWithBuffer}) exceeds budget ($${budgetLimit})`));
      console.log(chalk.gray("\nOptions:"));
      console.log(chalk.cyan("  1. Reduce forks: --forks=1"));
      console.log(chalk.cyan("  2. Use Docker (free): --sandbox=docker"));
      console.log(chalk.cyan("  3. Increase budget: --budget=" + Math.ceil(estimate.estimatedCostWithBuffer)));
      return;
    }
  }
  
  // Confirm with user
  const { confirm } = await inquirer.prompt([{
    type: "confirm",
    name: "confirm",
    message: `Proceed with sandbox orchestration? (Est. cost: $${estimate.costRange.min}-$${estimate.costRange.max})`,
    default: true
  }]);
  
  if (!confirm) {
    console.log(chalk.gray("\nCancelled.\n"));
    return;
  }
  
  console.log(chalk.cyan("\n📖 PRDs to implement:\n"));
  for (const prd of prds) {
    console.log(chalk.white(`  • ${prd.id}: ${prd.title}`));
  }
  console.log("");
  
  // Ask to run test first or full orchestration
  const { runMode } = await inquirer.prompt([{
    type: "list",
    name: "runMode",
    message: "How would you like to proceed?",
    choices: [
      { name: "🧪 Test mode (single sandbox, verify setup)", value: "test" },
      { name: "🚀 Full orchestration (all PRDs)", value: "full" },
      { name: "❌ Cancel", value: "cancel" }
    ]
  }]);
  
  if (runMode === "cancel") {
    console.log(chalk.gray("\nCancelled.\n"));
    return;
  }
  
  // Import and run orchestrator
  const { runSandboxOrchestration, runTestOrchestration } = await import("./lib/sandbox/orchestrator.js");
  
  if (runMode === "test") {
    // Run test mode
    const result = await runTestOrchestration({
      targetDir,
      provider
    });
    
    if (result.success) {
      console.log(chalk.green("✅ Test passed! You can now run full orchestration.\n"));
      console.log(chalk.cyan("Run: sigma orchestrate --sandbox=" + provider));
    } else {
      console.log(chalk.red("❌ Test failed. Check the error above and try again.\n"));
    }
    return;
  }
  
  // Generate streams config
  const worktrees = prds.slice(0, numStreams).map((_, i) => ({
    name: ['A', 'B', 'C', 'D'][i],
    path: path.join(targetDir, 'worktrees', `stream-${['a', 'b', 'c', 'd'][i]}`),
    branch: `stream-${['a', 'b', 'c', 'd'][i]}`
  }));
  
  const streamsConfig = await generateStreamsConfig(targetDir, prds, worktrees);
  
  // Run full orchestration with message bus integration
  await runSandboxOrchestration({
    targetDir,
    provider,
    agent: agent || 'claude',
    config: streamsConfig,
    prds,
    forksPerStory,
    mode: options.mode || "semi-auto"
  });
}

// Detect PRD stories for orchestration
async function _detectPRDStories(targetDir) {
  const stories = {};
  
  // 1. Check docs/prds/*.md
  const docsPrdDir = path.join(targetDir, "docs", "prds");
  if (await fs.pathExists(docsPrdDir)) {
    const files = await fs.readdir(docsPrdDir);
    for (const file of files) {
      if (file.endsWith(".md")) {
        const id = file.replace(".md", "");
        const filePath = path.join(docsPrdDir, file);
        const content = await fs.readFile(filePath, "utf8");
        
        // Extract title from first # heading
        const titleMatch = content.match(/^#\s+(.+)$/m);
        stories[id] = {
          path: filePath,
          title: titleMatch ? titleMatch[1] : id,
          type: "markdown"
        };
      }
    }
  }
  
  // 2. Check .sigma/orchestration/prds/*.md
  const orchPrdDir = path.join(targetDir, ".sigma", "orchestration", "prds");
  if (await fs.pathExists(orchPrdDir)) {
    const files = await fs.readdir(orchPrdDir);
    for (const file of files) {
      if (file.endsWith(".md") || file.endsWith(".json")) {
        const id = file.replace(/\.(md|json)$/, "");
        if (!stories[id]) {
          const filePath = path.join(orchPrdDir, file);
          stories[id] = {
            path: filePath,
            title: id,
            type: file.endsWith(".json") ? "json" : "markdown"
          };
        }
      }
    }
  }
  
  // 3. Check docs/ralph/*/prd.json
  const ralphDir = path.join(targetDir, "docs", "ralph");
  if (await fs.pathExists(ralphDir)) {
    const dirs = await fs.readdir(ralphDir);
    for (const d of dirs) {
      const prdJson = path.join(ralphDir, d, "prd.json");
      if (await fs.pathExists(prdJson)) {
        if (!stories[d]) {
          try {
            const content = JSON.parse(await fs.readFile(prdJson, "utf8"));
            stories[d] = {
              path: prdJson,
              title: content.title || content.name || d,
              type: "ralph-json"
            };
          } catch {
            stories[d] = { path: prdJson, title: d, type: "ralph-json" };
          }
        }
      }
    }
  }
  
  return stories;
}

// Approve command handler
async function approveCommand(options) {
  const targetDir = options.target || process.cwd();
  const stream = options.stream?.toUpperCase();

  if (!stream) {
    console.log(chalk.red("Error: --stream is required\n"));
    console.log(chalk.white("Usage: npx sigma-protocol approve --stream=A\n"));
    return;
  }

  console.log(chalk.cyan(`Approving Stream ${stream}...\n`));

  // Call orchestrator.py with approve flag
  const orchestratorPy = path.join(targetDir, "scripts", "orchestrator", "orchestrator.py");
  
  if (!(await fs.pathExists(orchestratorPy))) {
    console.log(chalk.yellow("orchestrator.py not found. Manual approval required."));
    console.log(chalk.gray("In the orchestrator pane, say: 'Approved, continue'\n"));
    return;
  }

  try {
    const { execSync } = await import("child_process");
    execSync(`python3 "${orchestratorPy}" --approve=${stream}`, {
      cwd: targetDir,
      stdio: "inherit",
    });
    console.log(chalk.green(`\n✓ Stream ${stream} approved\n`));
  } catch (error) {
    console.log(chalk.red(`Approval failed: ${error.message}`));
  }
}

program
  .command("orchestrate")
  .description("Launch multi-agent orchestration (auto-detects stream count from PRDs)")
  .addHelpText("after", `
Examples:
  $ sigma orchestrate --iterm --auto-start  # RECOMMENDED: iTerm2 tabs + auto-start all agents
  $ sigma orchestrate --iterm               # Use native iTerm2 tabs
  $ sigma orchestrate --iterm --streams 3 --forks 2 --auto-start   # 3 streams × 2 forks, auto-start
  $ sigma orchestrate --quick-iterm=3       # Quick: 3 Claude in native iTerm2 tabs
  $ sigma orchestrate --quick=3             # Quick: 3 Claude in tmux tabs
  $ sigma orchestrate --streams 2 --forks 2 # 2 streams × 2 forks
  $ sigma orchestrate --attach              # Reattach to tmux session
  $ sigma orchestrate --kill                # Stop tmux session

Quick Launch (for testing - no PRD setup needed):
  --quick-iterm=N   Native iTerm2 tabs (click to switch, Cmd+1/2/3) ← BEST FOR MAC
  --quick=N         tmux tabs (Ctrl+B then 0/1/2 to switch)
  --quick-panes=N   tmux panes in one window (Ctrl+B → arrows)

Full Orchestration:
  --iterm           Use native iTerm2 tabs (recommended for Mac)
  (default)         Use tmux (works everywhere but Ctrl+B can conflict)

iTerm2 Navigation (with --iterm):
  Cmd+1, Cmd+2...   Jump to tab by number
  Cmd+Shift+]       Next tab
  Cmd+Shift+[       Previous tab
  Click tab         Switch to tab

tmux Navigation (without --iterm):
  Ctrl+B → 0-9      Jump to tab
  Ctrl+B → n/p      Next/Previous tab
  Ctrl+B → d        Detach

Documentation: https://github.com/sigma-protocol/cli#orchestration
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-s, --streams <number>", "Number of parallel streams (auto-detected if not specified)")
  .option("-a, --agent <agent>", "AI coding agent to use (claude, opencode, manual)", "auto")
  .option("-m, --mode <mode>", "Orchestration mode (full-auto, semi-auto, manual)", "semi-auto")
  .option("--quick [count]", "Quick launch: N Claude in tmux tabs")
  .option("--quick-panes [count]", "Quick launch: N Claude in tmux panes (one window)")
  .option("--quick-iterm [count]", "Quick launch: N Claude in NATIVE iTerm2 tabs (recommended for Mac)")
  .option("--iterm", "Use native iTerm2 tabs instead of tmux (Mac only)")
  .option("--backend <backend>", "Terminal backend (auto, iterm, tmux, task)", "auto")
  .option("--sandbox [provider]", "Run in sandbox environment (e2b, docker, daytona)")
  .option("--forks <number>", "Number of forks per story for Best of N pattern", "3")
  .option("--auto-start", "Auto-send initial prompts to agents after they initialize (recommended)")
  .option("--budget <amount>", "Maximum budget for sandbox run in USD")
  .option("--attach", "Attach to existing orchestration session")
  .option("--kill", "Kill existing orchestration session")
  .option("--status", "Show orchestration status")
  .option("-n, --dry-run", "Preview orchestration plan without launching streams")
  .action(orchestrateCommand);

program
  .command("approve")
  .description("Approve a stream's PRD completion")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-s, --stream <letter>", "Stream to approve (A, B, C, D, etc.)")
  .action(approveCommand);

// New project wizard command
async function newProjectCommand(options) {
  const { runNewProjectWizard } = await import("./lib/new-project.js");
  await runNewProjectWizard(options);
}

program
  .command("new")
  .description("Create a new project with Sigma Protocol (guided wizard)")
  .addHelpText("after", `
Examples:
  $ sigma new                              # Start interactive wizard
  $ sigma new -t ~/projects/myapp          # Create in specific directory

The wizard will guide you through:
  1. Project name and description
  2. Tech stack selection (Next.js, React, etc.)
  3. Platform selection (Cursor, Claude Code, OpenCode)
  4. Module selection (steps, audit, dev, ops, etc.)
  5. Initial Step 0-3 documentation setup

Documentation: https://github.com/sigma-protocol/cli#new-project
  `)
  .option("-t, --target <directory>", "Target directory")
  .action(newProjectCommand);

// Quickstart command handler - fast path for new users
async function quickstartCommand(options) {
  showBanner();

  console.log(
    boxen(
      chalk.cyan.bold("🚀 SIGMA QUICKSTART\n\n") +
        chalk.white("Fast path to productivity!\n") +
        chalk.gray("This will get you started in under 5 minutes."),
      {
        padding: 1,
        margin: { top: 0, bottom: 1 },
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );

  const targetDir = options.target || process.cwd();

  // Step 1: Check prerequisites
  console.log(chalk.bold("\n📋 Step 1: Checking prerequisites...\n"));

  const { runPreCheck } = await import("./lib/install-wizard.js");
  const preCheckPassed = await runPreCheck();

  if (!preCheckPassed) {
    console.log(
      chalk.yellow(
        "\nFix the issues above, then run 'sigma quickstart' again.\n"
      )
    );
    return;
  }

  // Step 2: Detect or create project
  console.log(chalk.bold("\n📁 Step 2: Setting up project...\n"));

  const hasPackageJson = await fs.pathExists(path.join(targetDir, "package.json"));
  const hasSigma = await fs.pathExists(path.join(targetDir, ".sigma-manifest.json"));

  if (hasSigma) {
    console.log(chalk.green("✓ Sigma Protocol already installed"));
    console.log(chalk.gray(`  Location: ${targetDir}\n`));
  } else if (hasPackageJson) {
    console.log(chalk.yellow("⚠ Project exists, adding Sigma Protocol...\n"));

    // Quick install with auto-detected platform
    const detectedPlatform = await autoDetectPlatform(targetDir);
    const platforms = detectedPlatform ? [detectedPlatform] : ["claude-code"];

    console.log(chalk.gray(`  Auto-detected platform: ${platforms[0]}`));

    // Run minimal install
    const spinner = ora("Installing Sigma Protocol...").start();
    try {
      const modules = ["steps", "audit", "dev", "ops"];
      for (const platform of platforms) {
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
      }
      spinner.succeed("Sigma Protocol installed!");
    } catch (error) {
      spinner.fail(`Installation failed: ${error.message}`);
      return;
    }
  } else {
    console.log(chalk.yellow("⚠ No project found. Creating a new one...\n"));

    const { name } = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Project name:",
        default: path.basename(targetDir) || "my-sigma-project",
      },
    ]);

    // Create minimal package.json
    const pkgPath = path.join(targetDir, "package.json");
    await fs.ensureDir(targetDir);
    await fs.writeJson(
      pkgPath,
      {
        name: name.toLowerCase().replace(/\s+/g, "-"),
        version: "0.1.0",
        private: true,
        scripts: {
          dev: 'echo "Add your dev script"',
          build: 'echo "Add your build script"',
        },
      },
      { spaces: 2 }
    );

    console.log(chalk.green(`✓ Created ${name}/package.json`));

    // Install Sigma with Claude Code default
    const spinner = ora("Installing Sigma Protocol...").start();
    try {
      const modules = ["steps", "audit", "dev", "ops"];
      await buildClaudeCode(targetDir, modules, spinner);
      spinner.succeed("Sigma Protocol installed!");
    } catch (error) {
      spinner.fail(`Installation failed: ${error.message}`);
      return;
    }
  }

  // Step 3: Detect and launch appropriate IDE
  console.log(chalk.bold("\n🎯 Step 3: Ready to launch!\n"));

  // Check what's available
  const hasClaudeCLI = await fs.pathExists(path.join(targetDir, ".claude"));
  const hasCursor = await fs.pathExists(path.join(targetDir, ".cursor"));

  // Show what's next
  console.log(
    boxen(
      chalk.green.bold("✅ You're ready to go!\n\n") +
        chalk.white.bold("Start your first step:\n\n") +
        (hasClaudeCLI
          ? chalk.cyan("  claude \"Run @step-1-ideation for [your product idea]\"\n\n")
          : "") +
        (hasCursor
          ? chalk.yellow("  In Cursor: @step-1-ideation [your product idea]\n\n")
          : "") +
        chalk.white.bold("Quick Reference:\n") +
        chalk.gray("  sigma --help        ") + chalk.white("Full command list\n") +
        chalk.gray("  sigma tutorial      ") + chalk.white("Interactive tutorial\n") +
        chalk.gray("  sigma doctor        ") + chalk.white("System health check\n"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "green",
      }
    )
  );

  // Offer to start tutorial for first-time users
  const { startTutorial } = await inquirer.prompt([
    {
      type: "confirm",
      name: "startTutorial",
      message: "Would you like a 5-minute tutorial?",
      default: true,
    },
  ]);

  if (startTutorial) {
    const { runTutorial } = await import("./lib/tutorial.js");
    await runTutorial({ target: targetDir });
  } else {
    console.log(
      chalk.gray("\nRun 'sigma tutorial' anytime to learn the basics.\n")
    );
  }
}

program
  .command("quickstart")
  .description("Fast path to productivity for new users (5 min setup)")
  .addHelpText("after", `
Examples:
  $ sigma quickstart                         # Start in current directory
  $ sigma quickstart -t ~/projects/myapp     # Start in specific directory

What quickstart does:
  1. Checks prerequisites (Node.js, git, etc.)
  2. Detects or creates a project
  3. Installs Sigma Protocol
  4. Launches you into Step 1

Use this if you want to skip the full wizard and get started fast.

Full wizard: sigma new
Full tutorial: sigma tutorial
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(quickstartCommand);

// Tutorial command
async function tutorialCommand(options) {
  const { runTutorial } = await import("./lib/tutorial.js");
  await runTutorial(options);
}

program
  .command("tutorial")
  .description("Interactive tutorial for learning Sigma Protocol")
  .addHelpText("after", `
Examples:
  $ sigma tutorial                         # Start interactive tutorial
  $ sigma tutorial -t ./myproject          # Tutorial with project context

Tutorial covers:
  - Understanding the 13-step methodology
  - Working with AI coding agents (Cursor, Claude, OpenCode)
  - Using commands and skills effectively
  - Multi-agent orchestration basics
  - Quality gates and HITL checkpoints

Documentation: https://github.com/sigma-protocol/cli#tutorial
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(tutorialCommand);

// Maid command handler - repository maintenance
async function maidCommand(options) {
  if (options.quick) {
    const { runQuickScan } = await import("./lib/maid.js");
    await runQuickScan(process.cwd());
  } else {
    const { runMaidWizard } = await import("./lib/maid.js");
    const result = await runMaidWizard({ backend: options.backend });
    
    // If user returns to menu, launch interactive mode
    if (result === "menu") {
      const { runInteractiveMode } = await import("./lib/interactive.js");
      await runInteractiveMode(options);
    }
  }
}

program
  .command("maid")
  .description("Repository maintenance and cleanup (AI-powered)")
  .addHelpText("after", `
Examples:
  $ sigma maid                             # Interactive cleanup wizard (prompts for terminal)
  $ sigma maid --backend iterm             # Use iTerm2 native tabs
  $ sigma maid --backend tmux              # Use tmux sessions
  $ sigma maid --quick                     # Quick non-AI cruft scan
  $ sigma maid -t ./myproject              # Clean specific project

Cleanup tasks:
  - Orphaned files and dead code detection
  - Unused dependencies identification
  - Old backup file removal
  - Build artifact cleanup
  - Log file rotation
  - Node modules cleanup

Terminal backends:
  --backend iterm    Native iTerm2 tabs (macOS, click to navigate)
  --backend tmux     tmux sessions (detachable, Ctrl+B navigation)

Note: Destructive operations require confirmation.

Documentation: https://github.com/sigma-protocol/cli#maid
  `)
  .option("--quick", "Quick scan only (non-AI, find obvious cruft)")
  .option("--backend <backend>", "Terminal backend (iterm, tmux)")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(maidCommand);

// Thread commands
program
  .command("thread [action]")
  .description("Thread-Based Engineering tools (status, metrics, wizard)")
  .addHelpText("after", `
Examples:
  $ sigma thread                           # Launch thread wizard
  $ sigma thread status                    # View active threads
  $ sigma thread metrics                   # Show thread performance metrics

Actions:
  status    Show status of all active threads
  metrics   Display thread performance and completion metrics
  wizard    Interactive thread configuration (default)

Thread Types:
  - Sequential: Linear execution across steps
  - Parallel: Multiple streams working simultaneously
  - Fusion: Same prompt to multiple agents, best result wins

Documentation: https://github.com/sigma-protocol/cli#threads
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(threadCommand);

program
  .command("f-thread")
  .description("Run a Fusion Thread (same prompt to multiple agents)")
  .addHelpText("after", `
Examples:
  $ sigma f-thread -p "Implement auth system"   # Run fusion with default settings
  $ sigma f-thread -p "Fix bug" -c 5            # 5 parallel agents
  $ sigma f-thread -p "Refactor" -a consensus   # Use consensus aggregation

Aggregation strategies:
  best       Select single best result (default)
  consensus  Combine common elements from all results
  merge      Merge all results intelligently
  vote       Democratic selection across agents

Documentation: https://github.com/sigma-protocol/cli#fusion-threads
  `)
  .option("-p, --prompt <prompt>", "Prompt to run across agents")
  .option("-c, --count <number>", "Number of agents", "3")
  .option("-a, --aggregate <strategy>", "Aggregation strategy (best, consensus, merge, vote)", "best")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(fusionThreadCommand);

// Thread command handler
async function threadCommand(action, options) {
  const { threadStatus, threadMetrics, runThreadWizard } = await import("./lib/threads.js");
  
  switch (action) {
    case "status":
      await threadStatus(options);
      break;
    case "metrics":
      await threadMetrics(options);
      break;
    case "wizard":
      await runThreadWizard(options);
      break;
    default:
      // Show help/wizard by default
      await runThreadWizard(options);
  }
}

// Fusion thread command handler
async function fusionThreadCommand(options) {
  const { runFusionThread } = await import("./lib/threads.js");
  await runFusionThread({
    prompt: options.prompt,
    count: parseInt(options.count),
    aggregate: options.aggregate,
    target: options.target,
  });
}

// Search command handler
async function searchCommand(query, options) {
  const { runInteractiveSearch, searchCommands, displaySearchResults, listCategories } = await import("./lib/search.js");
  
  if (options.categories) {
    listCategories();
    return;
  }
  
  if (query) {
    const results = searchCommands(query, { category: options.category });
    displaySearchResults(results, query);
  } else {
    await runInteractiveSearch(options);
  }
}

program
  .command("search [query]")
  .description("Search all Sigma Protocol commands")
  .option("-c, --category <name>", "Filter by category (steps, audit, ops, dev, deploy, generators, marketing)")
  .option("--categories", "List all command categories")
  .action(searchCommand);

// Config command handler
async function configCommand(options) {
  const { runConfig } = await import("./lib/config.js");
  await runConfig(options);
}

// Sandbox command handler
async function sandboxCommand(action, options) {
  const _targetDir = options.target || process.cwd();
  
  switch (action) {
    case "setup":
      await sandboxSetupCommand(options);
      break;
    case "status":
      await sandboxStatusCommand(options);
      break;
    case "test":
      await sandboxTestCommand(options);
      break;
    case "destroy":
      await sandboxDestroyCommand(options);
      break;
    case "cost":
      await sandboxCostCommand(options);
      break;
    case "build":
      await sandboxBuildCommand(options);
      break;
    case "mcp-server":
      await sandboxMcpServerCommand(options);
      break;
    case "experiment":
      await sandboxExperimentCommand(options);
      break;
    case "forks":
      await sandboxForksCommand(options);
      break;
    default:
      // Show help / interactive setup
      await sandboxSetupCommand(options);
  }
}

// Sandbox test command - directly test E2B connection
async function sandboxTestCommand(options) {
  showBanner();
  console.log(chalk.cyan("🧪 Sandbox Connection Test\n"));
  
  const targetDir = options.target || process.cwd();
  
  // Check if E2B_API_KEY is set
  if (!process.env.E2B_API_KEY) {
    console.log(chalk.red("❌ E2B_API_KEY not found in environment\n"));
    console.log(chalk.white("Set it by running:"));
    console.log(chalk.cyan('  export E2B_API_KEY="your-key-here"\n'));
    console.log(chalk.gray("Or add it to ~/.zshrc for persistence."));
    return;
  }
  
  console.log(chalk.green("✓ E2B_API_KEY found\n"));
  console.log(chalk.gray("Testing connection to E2B...\n"));
  
  const ora = (await import("ora")).default;
  const spinner = ora({ text: "Creating test sandbox...", color: "cyan" }).start();
  
  try {
    // Dynamic import of E2B
    const e2b = await import("e2b");
    
    // Create a quick test sandbox
    const sandbox = await e2b.Sandbox.create({
      apiKey: process.env.E2B_API_KEY,
      template: "base",
      timeoutMs: 60000 // 1 minute
    });
    
    spinner.text = "Sandbox created! Running test command...";
    
    // Run a simple command
    const result = await sandbox.commands.run("echo 'Hello from E2B!' && uname -a");
    
    spinner.text = "Cleaning up...";
    await sandbox.kill();
    
    spinner.succeed("Test completed successfully!");
    
    console.log(chalk.green("\n✅ E2B Connection Working!\n"));
    console.log(chalk.white("Test output:"));
    console.log(chalk.gray("─".repeat(40)));
    console.log(chalk.cyan(result.stdout || "(no output)"));
    console.log(chalk.gray("─".repeat(40)));
    
    console.log(chalk.green("\n🎉 You're all set! Now you can run:\n"));
    console.log(chalk.cyan("  sigma orchestrate --sandbox=e2b --forks=1\n"));
    
  } catch (error) {
    spinner.fail("Test failed");
    
    console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
    
    if (error.message.includes("401") || error.message.includes("Unauthorized")) {
      console.log(chalk.yellow("Your API key appears to be invalid."));
      console.log(chalk.gray("Get a valid key at: https://e2b.dev/dashboard\n"));
    } else if (error.message.includes("MODULE_NOT_FOUND")) {
      console.log(chalk.yellow("E2B SDK not installed. Run:"));
      console.log(chalk.cyan("  npm install e2b\n"));
    } else {
      console.log(chalk.gray("Check your network connection and try again."));
    }
  }
}

// Sandbox setup command
async function sandboxSetupCommand(options) {
  showBanner();
  
  const targetDir = options.target || process.cwd();
  
  if (options.provider) {
    // Non-interactive quick setup
    console.log(chalk.cyan(`Setting up ${options.provider} sandbox provider...\n`));
    
    const { quickSetup } = await import("./lib/sandbox/setup-wizard.js");
    const result = await quickSetup(targetDir, options.provider);
    
    if (result) {
      console.log(chalk.green(`\n✓ ${options.provider} provider configured`));
      console.log(chalk.gray(`\nNext: sigma orchestrate --sandbox`));
    }
  } else {
    // Interactive setup wizard
    const { runSetupWizard } = await import("./lib/sandbox/setup-wizard.js");
    const result = await runSetupWizard(targetDir);
    
    if (result) {
      console.log(chalk.green(`\n✓ Sandbox provider configured: ${result.provider}`));
      console.log(chalk.gray(`\nNext: sigma orchestrate --sandbox`));
    }
  }
}

// Sandbox status command
async function sandboxStatusCommand(options) {
  showBanner();
  console.log(chalk.cyan("🐳 Sandbox Status\n"));
  
  const targetDir = options.target || process.cwd();
  
  const { SandboxManager } = await import("./lib/sandbox/index.js");
  const { loadSandboxConfig } = await import("./lib/sandbox/config.js");
  
  const config = await loadSandboxConfig(targetDir);
  
  if (!config || !config.provider) {
    console.log(chalk.yellow("No sandbox provider configured."));
    console.log(chalk.gray("\nRun: sigma sandbox setup"));
    return;
  }
  
  console.log(chalk.white("Provider:"), chalk.cyan(config.provider));
  console.log(chalk.white("Forks per story:"), chalk.cyan(config.defaults?.forks_per_story || 3));
  console.log(chalk.white("Review strategy:"), chalk.cyan(config.best_of_n?.review_strategy || 'hybrid'));
  console.log("");
  
  // Show active sandboxes if any
  const manager = new SandboxManager(targetDir);
  await manager.initialize();
  
  const active = manager.getActiveSandboxes();
  
  if (active.length === 0) {
    console.log(chalk.gray("No active sandboxes"));
  } else {
    console.log(chalk.white(`Active sandboxes: ${active.length}\n`));
    for (const sandbox of active) {
      const json = sandbox.toJSON();
      console.log(`  ${chalk.cyan(json.id)}`);
      console.log(`    State: ${json.state}`);
      console.log(`    Runtime: ${json.runtime}s`);
      console.log("");
    }
  }
  
  // Show budget info
  const { getRemainingBudget } = await import("./lib/sandbox/config.js");
  const remaining = await getRemainingBudget(targetDir, config);
  
  console.log(chalk.white("Budget:"));
  console.log(`  Limit: $${config.budget?.max_spend_usd || 50}`);
  console.log(`  Remaining: $${remaining.toFixed(2)}`);
}

// Sandbox destroy command
async function sandboxDestroyCommand(options) {
  const targetDir = options.target || process.cwd();

  const { SandboxManager } = await import("./lib/sandbox/index.js");
  const manager = new SandboxManager(targetDir);
  await manager.initialize();

  if (options.all) {
    // Get count of sandboxes first
    const status = await manager.getStatus?.() || {};
    const count = Object.keys(status.running || {}).length || 'all';

    console.log(chalk.yellow.bold("\n⚠️  Warning: This will destroy ALL sandbox environments"));
    console.log(chalk.gray(`   Sandbox count: ${count}`));
    console.log("");

    // Require explicit confirmation for destructive action
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: chalk.red("Are you sure you want to destroy all sandboxes?"),
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.gray("\nAborted. No sandboxes were destroyed."));
      return;
    }

    console.log(chalk.cyan("\nDestroying all sandboxes...\n"));
    await manager.destroyAllSandboxes();
    console.log(chalk.green("✓ All sandboxes destroyed"));
  } else if (options.id) {
    console.log(chalk.yellow(`\n⚠️  This will destroy sandbox: ${options.id}`));

    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: chalk.red(`Confirm destruction of sandbox ${options.id}?`),
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.gray("\nAborted. Sandbox was not destroyed."));
      return;
    }

    console.log(chalk.cyan(`\nDestroying sandbox: ${options.id}\n`));
    await manager.destroySandbox(options.id);
    console.log(chalk.green(`✓ Sandbox ${options.id} destroyed`));
  } else {
    console.log(chalk.yellow("Specify --id=<sandbox-id> or --all"));
  }
}

// Sandbox cost command
async function sandboxCostCommand(options) {
  showBanner();
  console.log(chalk.cyan("💰 Sandbox Cost Summary\n"));
  
  const targetDir = options.target || process.cwd();
  
  const { CostEstimator } = await import("./lib/sandbox/cost-estimator.js");
  const { loadSandboxConfig } = await import("./lib/sandbox/config.js");
  
  const config = await loadSandboxConfig(targetDir);
  const estimator = new CostEstimator(targetDir, config);
  
  const period = options.period || 'all';
  const summary = await estimator.getCostSummary(period);
  
  console.log(chalk.white(`Period: ${period}`));
  console.log(chalk.white(`Total spent: $${summary.totalCost}`));
  console.log(chalk.white(`Total sandboxes: ${summary.totalSandboxes}`));
  console.log(chalk.white(`Total runtime: ${summary.totalHours} hours`));
  console.log("");
  
  if (Object.keys(summary.byProvider).length > 0) {
    console.log(chalk.white("By provider:"));
    for (const [provider, data] of Object.entries(summary.byProvider)) {
      console.log(`  ${provider}: $${data.cost.toFixed(2)} (${data.sandboxes} sandboxes)`);
    }
  }
}

// Sandbox build command (build Docker image)
async function sandboxBuildCommand(options) {
  console.log(chalk.cyan("Building sigma-sandbox Docker image...\n"));
  
  const targetDir = options.target || process.cwd();
  
  const { DockerProvider } = await import("./lib/sandbox/providers/docker.js");
  const provider = new DockerProvider({ projectRoot: targetDir });
  
  try {
    const result = await provider.buildImage(targetDir);
    console.log(chalk.green("\n✓ sigma-sandbox:latest built successfully"));
    console.log(chalk.gray("\nYou can now use: sigma orchestrate --sandbox=docker"));
  } catch (error) {
    console.log(chalk.red(`\nBuild failed: ${error.message}`));
  }
}

// Sandbox MCP server command - start the unified MCP server
async function sandboxMcpServerCommand(options) {
  console.log(chalk.cyan("🔌 Starting Sigma Sandbox MCP Server\n"));
  
  const serverPath = path.join(import.meta.dirname, "mcp", "sandbox-server.js");
  
  console.log(chalk.gray("Server path: " + serverPath + "\n"));
  console.log(chalk.white("The MCP server will provide these tools to Claude:"));
  console.log(chalk.cyan("  • sandbox_list_providers - List available providers"));
  console.log(chalk.cyan("  • sandbox_create - Create a sandbox"));
  console.log(chalk.cyan("  • sandbox_exec - Execute commands"));
  console.log(chalk.cyan("  • sandbox_preview_urls - Get preview URLs"));
  console.log(chalk.cyan("  • sandbox_open_previews - Open all previews in Chrome"));
  console.log(chalk.cyan("  • sandbox_fork - Create N forks (Best of N)"));
  console.log("");
  
  console.log(chalk.white("To use with Claude Code, add to .cursor/mcp.json:\n"));
  console.log(chalk.gray(`{
  "mcpServers": {
    "sigma-sandbox": {
      "command": "node",
      "args": ["${serverPath}"],
      "env": {
        "E2B_API_KEY": "\${E2B_API_KEY}",
        "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
      }
    }
  }
}`));
  console.log("");
  
  console.log(chalk.yellow("Starting server in foreground mode...\n"));
  
  // Run the server
  const { spawn } = await import("child_process");
  const server = spawn("node", [serverPath], {
    stdio: "inherit",
    env: process.env
  });
  
  server.on("error", (err) => {
    console.error(chalk.red(`Failed to start server: ${err.message}`));
  });
  
  server.on("close", (code) => {
    console.log(chalk.gray(`Server exited with code ${code}`));
  });
}

// Sandbox experiment command - quick fork experiment (like IndyDevDan's obox)
async function sandboxExperimentCommand(options) {
  showBanner();
  console.log(chalk.cyan("🧪 Quick Fork Experiment\n"));

  const targetDir = options.target || process.cwd();

  // Interactive prompts
  const { default: inquirer } = await import("inquirer");
  const { execSync } = await import("child_process");

  let defaultRepo = "";
  try {
    defaultRepo = execSync("git remote get-url origin 2>/dev/null", { encoding: "utf-8" }).trim();
  } catch { /* ignore */ }

  const { repoUrl: _repoUrl } = await inquirer.prompt([{
    type: "input",
    name: "repoUrl",
    message: "Git repository URL:",
    default: defaultRepo
  }]);

  const { branch: _branch } = await inquirer.prompt([{
    type: "input",
    name: "branch",
    message: "Branch to use:",
    default: "main"
  }]);

  const { forkCount } = await inquirer.prompt([{
    type: "list",
    name: "forkCount",
    message: "Number of forks (Best of N)?",
    choices: [
      { name: "2 forks", value: 2 },
      { name: "3 forks (recommended)", value: 3 },
      { name: "5 forks", value: 5 }
    ],
    default: 3
  }]);

  const { prompt: _prompt } = await inquirer.prompt([{
    type: "editor",
    name: "prompt",
    message: "Prompt for Claude Code (opens editor):",
    default: "Implement the feature described in the PRD. Use Ralph loop methodology."
  }]);

  const { provider: _provider } = await inquirer.prompt([{
    type: "list",
    name: "provider",
    message: "Sandbox provider:",
    choices: [
      { name: "E2B (cloud)", value: "e2b" },
      { name: "Docker (local)", value: "docker" },
      { name: "Daytona", value: "daytona" }
    ],
    default: "e2b"
  }]);

  console.log(chalk.cyan("\n🚀 Creating forks...\n"));

  // Use fork manager
  const { setupAllForks } = await import("./lib/orchestration/fork-manager.js");

  const streams = [{
    name: "experiment",
    prds: ["custom"],
    description: "Experiment stream"
  }];

  const result = await setupAllForks(targetDir, streams, forkCount, "claude");
  
  console.log(chalk.green(`\n✓ Created ${result.totalForks} forks`));
  console.log(chalk.gray("\nTo monitor: sigma sandbox forks --stream experiment"));
}

// Sandbox forks command - list forks and their status
async function sandboxForksCommand(options) {
  const targetDir = options.target || process.cwd();
  const streamName = options.stream || "all";
  
  console.log(chalk.cyan("📋 Fork Status\n"));
  
  const { getForkStatuses } = await import("./lib/orchestration/fork-manager.js");
  const fs = await import("fs/promises");
  
  // Get all streams
  const worktreesDir = path.join(targetDir, "worktrees");
  let streams = [];
  
  try {
    const dirs = await fs.readdir(worktreesDir);
    streams = dirs.filter(d => d.startsWith("stream-"));
  } catch {
    console.log(chalk.yellow("No worktrees found."));
    return;
  }
  
  if (streamName !== "all") {
    streams = streams.filter(s => s.includes(streamName.toLowerCase()));
  }
  
  for (const stream of streams) {
    const name = stream.replace("stream-", "").toUpperCase();
    console.log(chalk.white(`Stream ${name}:`));
    
    const statuses = await getForkStatuses(targetDir, name);
    
    if (statuses.length === 0) {
      console.log(chalk.gray("  No forks"));
    } else {
      for (const fork of statuses) {
        const status = fork.error ? chalk.red("✗ error") : 
                       fork.hasChanges ? chalk.yellow("○ changes") : 
                       chalk.green("✓ clean");
        
        console.log(`  Fork ${fork.id}: ${status}`);
        if (fork.lastCommit) {
          console.log(chalk.gray(`    ${fork.lastCommit}`));
        }
        if (fork.previewUrl) {
          console.log(chalk.cyan(`    Preview: ${fork.previewUrl}`));
        }
        if (fork.error) {
          console.log(chalk.red(`    Error: ${fork.error}`));
        }
      }
    }
    console.log("");
  }
}

program
  .command("config")
  .description("View and edit Sigma Protocol configuration")
  .option("-e, --edit", "Open config file in editor")
  .option("-s, --set <key=value>", "Set a config value (e.g., ralph.autoCommit=true)")
  .option("-i, --interactive", "Edit config interactively")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .action(configCommand);

program
  .command("sandbox [action]")
  .description("Manage sandbox environments (setup, test, status, destroy, cost, build, mcp-server, experiment, forks)")
  .addHelpText("after", `
Examples:
  $ sigma sandbox                          # Interactive sandbox wizard
  $ sigma sandbox setup -p e2b             # Setup E2B sandbox
  $ sigma sandbox status                   # Show running sandboxes
  $ sigma sandbox cost --period month      # View monthly sandbox costs
  $ sigma sandbox destroy -a               # Destroy all sandboxes
  $ sigma sandbox forks --stream A         # View forks for stream A

Actions:
  setup       Configure sandbox environment
  test        Verify sandbox connectivity
  status      Show running sandbox instances
  destroy     Remove sandbox instances
  cost        View sandbox usage costs
  build       Build sandbox images
  mcp-server  Start MCP server for sandbox
  experiment  Run experimental sandbox
  forks       Manage Best-of-N forks

Providers:
  e2b         E2B cloud sandboxes (recommended)
  docker      Local Docker containers
  daytona     Daytona dev environments

Documentation: https://github.com/sigma-protocol/cli#sandbox
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-p, --provider <provider>", "Sandbox provider (e2b, docker, daytona)")
  .option("-i, --id <id>", "Sandbox ID for destroy command")
  .option("-a, --all", "Destroy all sandboxes")
  .option("--period <period>", "Cost period (day, week, month, all)", "all")
  .option("--stream <name>", "Stream name for forks command")
  .action(sandboxCommand);

// ============================================================================
// Merge Command - Consolidate stream worktrees
// ============================================================================

async function mergeCommand(options) {
  showBanner();
  const targetDir = options.target || process.cwd();

  console.log(
    boxen(
      chalk.cyan.bold("Stream Merge\n\n") +
        chalk.gray("Merge completed stream worktrees back to main branch"),
      { padding: 1, borderStyle: "round", borderColor: "cyan" }
    )
  );

  // Check if merge-streams.sh exists
  const mergeScript = path.join(targetDir, "scripts", "orchestrator", "merge-streams.sh");
  const packageMergeScript = path.join(ROOT_DIR, "scripts", "orchestrator", "merge-streams.sh");

  let scriptPath = mergeScript;
  if (!(await fs.pathExists(mergeScript))) {
    if (await fs.pathExists(packageMergeScript)) {
      // Copy merge script to project
      const destDir = path.join(targetDir, "scripts", "orchestrator");
      await fs.ensureDir(destDir);
      await fs.copy(packageMergeScript, mergeScript);
      await fs.chmod(mergeScript, 0o755);
      console.log(chalk.gray("  Copied merge-streams.sh to project\n"));
    } else {
      scriptPath = null;
    }
  }

  // Check for streams.json
  const streamsFile = path.join(targetDir, ".sigma", "orchestration", "streams.json");
  if (!(await fs.pathExists(streamsFile))) {
    console.log(chalk.yellow("\n⚠️  No orchestration streams found.\n"));
    console.log(chalk.gray("Run sigma orchestrate first to set up streams.\n"));
    return;
  }

  // Read streams config
  const streamsConfig = await fs.readJson(streamsFile);
  const streamCount = streamsConfig.streams?.length || 0;
  const mergeOrder = streamsConfig.merge_order || [];

  console.log(chalk.white.bold("\nStreams to merge:"));
  console.log(chalk.gray(`  Merge order: ${mergeOrder.join(" → ")}`));
  console.log(chalk.gray(`  Total streams: ${streamCount}\n`));

  // Check for existing stream branches
  const { execSync } = await import("child_process");
  const existingBranches = [];
  for (const letter of mergeOrder) {
    const branchName = `stream-${letter.toLowerCase()}`;
    try {
      execSync(`git show-ref --verify --quiet refs/heads/${branchName}`, { cwd: targetDir, stdio: "pipe" });
      existingBranches.push(letter);
    } catch {
      // Branch doesn't exist
    }
  }

  if (existingBranches.length === 0) {
    console.log(chalk.yellow("No stream branches found to merge.\n"));
    return;
  }

  console.log(chalk.green(`Found ${existingBranches.length} stream branches: ${existingBranches.join(", ")}\n`));

  if (options.status) {
    // Just show status
    if (scriptPath) {
      try {
        execSync(`bash "${scriptPath}" "${targetDir}" --status`, { stdio: "inherit", cwd: targetDir });
      } catch {
        console.log(chalk.gray("Could not get merge status.\n"));
      }
    }
    return;
  }

  if (options.dryRun) {
    console.log(chalk.cyan.bold("Dry Run Mode - No changes will be made\n"));
    if (scriptPath) {
      try {
        execSync(`bash "${scriptPath}" "${targetDir}" --dry-run`, { stdio: "inherit", cwd: targetDir });
      } catch {
        console.log(chalk.gray("Dry run preview completed.\n"));
      }
    }
    return;
  }

  // Confirm merge
  const { confirm } = await inquirer.prompt([{
    type: "confirm",
    name: "confirm",
    message: `Merge ${existingBranches.length} stream branches into main?`,
    default: false,
  }]);

  if (!confirm) {
    console.log(chalk.gray("\nMerge cancelled.\n"));
    return;
  }

  // Execute merge
  if (scriptPath) {
    console.log(chalk.cyan("\nStarting merge sequence...\n"));
    try {
      const { spawn } = await import("child_process");
      const child = spawn("bash", [scriptPath, targetDir], {
        stdio: "inherit",
        cwd: targetDir,
      });

      child.on("error", (error) => {
        console.log(chalk.red(`Error: ${error.message}`));
      });

      await new Promise((resolve) => child.on("close", resolve));
    } catch (error) {
      console.log(chalk.red(`Merge failed: ${error.message}\n`));
    }
  } else {
    // Manual merge instructions
    console.log(chalk.yellow("\nMerge script not available. Manual merge:\n"));
    console.log(chalk.gray("  git checkout main"));
    for (const letter of existingBranches) {
      console.log(chalk.gray(`  git merge stream-${letter.toLowerCase()}`));
    }
    console.log("");
  }
}

program
  .command("merge")
  .description("Merge completed stream worktrees back to main branch")
  .addHelpText("after", `
Examples:
  $ sigma merge                              # Interactive merge wizard
  $ sigma merge --status                     # Show merge status
  $ sigma merge --dry-run                    # Preview merge without executing
  $ sigma merge --continue                   # Continue after conflict resolution
  $ sigma merge --abort                      # Abort current merge

The merge command consolidates work from parallel streams back into
the main branch following the dependency order in streams.json.

Documentation: https://github.com/sigma-protocol/cli#merge
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-n, --dry-run", "Preview merge without making changes")
  .option("--status", "Show current merge status")
  .option("--continue", "Continue after resolving conflicts")
  .option("--abort", "Abort current merge")
  .action(mergeCommand);

// ============================================================================
// Health Command - Monitor stream health
// ============================================================================

async function healthCommand(options) {
  const targetDir = options.target || process.cwd();

  // Check for existing orchestration session
  const { execSync } = await import("child_process");
  let sessionExists = false;
  try {
    execSync("tmux has-session -t sigma-orchestration 2>/dev/null", { stdio: "pipe" });
    sessionExists = true;
  } catch {
    sessionExists = false;
  }

  if (options.watch) {
    // Continuous monitoring mode
    console.log(chalk.cyan("\n🏥 Stream Health Monitor\n"));
    console.log(chalk.gray("Press Ctrl+C to stop\n"));

    if (!sessionExists) {
      console.log(chalk.yellow("No orchestration session running.\n"));
      console.log(chalk.gray("Start orchestration first: sigma orchestrate\n"));
      return;
    }

    // Check for health-monitor.sh
    const healthScript = path.join(targetDir, "scripts", "orchestrator", "health-monitor.sh");
    const packageHealthScript = path.join(ROOT_DIR, "scripts", "orchestrator", "health-monitor.sh");

    let scriptPath = healthScript;
    if (!(await fs.pathExists(healthScript))) {
      if (await fs.pathExists(packageHealthScript)) {
        const destDir = path.join(targetDir, "scripts", "orchestrator");
        await fs.ensureDir(destDir);
        await fs.copy(packageHealthScript, healthScript);
        await fs.chmod(healthScript, 0o755);
        console.log(chalk.gray("Copied health-monitor.sh to project\n"));
      } else {
        scriptPath = null;
      }
    }

    if (scriptPath) {
      const { spawn } = await import("child_process");
      const child = spawn("bash", [scriptPath, "sigma-orchestration"], {
        stdio: "inherit",
        cwd: targetDir,
      });

      child.on("error", (error) => {
        console.log(chalk.red(`Error: ${error.message}`));
      });

      // Handle SIGINT to gracefully stop
      process.on("SIGINT", () => {
        child.kill("SIGTERM");
        console.log(chalk.gray("\n\nHealth monitor stopped.\n"));
        process.exit(0);
      });

      await new Promise((resolve) => child.on("close", resolve));
    } else {
      // Fallback to built-in monitoring using message-monitor
      const { watchStatus } = await import("./lib/orchestration/message-monitor.js");

      const stop = watchStatus(targetDir, ({ orchestrator, streams }) => {
        console.clear();
        console.log(chalk.cyan("🏥 Stream Health Monitor\n"));
        console.log(chalk.gray(`Last update: ${new Date().toLocaleTimeString()}\n`));

        // Orchestrator status
        const orchIcon = orchestrator.running ? chalk.green("●") : chalk.gray("○");
        console.log(`${orchIcon} Orchestrator: ${orchestrator.running ? "Running" : "Stopped"}`);
        if (orchestrator.pendingMessages > 0) {
          console.log(chalk.yellow(`  ${orchestrator.pendingMessages} pending messages`));
        }

        // Stream status
        console.log(chalk.white.bold("\nStreams:"));
        for (const [name, stream] of Object.entries(streams)) {
          let icon = "○";
          let color = chalk.gray;
          if (stream.status === "working") { icon = "●"; color = chalk.green; }
          else if (stream.status === "blocked") { icon = "◆"; color = chalk.yellow; }
          else if (stream.status === "error") { icon = "✗"; color = chalk.red; }
          else if (stream.status === "completed") { icon = "✓"; color = chalk.green; }

          console.log(`  ${color(icon)} Stream ${name}: ${color(stream.status)}`);
        }

        console.log(chalk.gray("\nPress Ctrl+C to stop"));
      }, 2000);

      process.on("SIGINT", () => {
        stop();
        console.log(chalk.gray("\n\nHealth monitor stopped.\n"));
        process.exit(0);
      });

      // Keep process running
      await new Promise(() => {});
    }
    return;
  }

  // One-time status check
  console.log(
    boxen(
      chalk.cyan.bold("Stream Health Status\n\n") +
        chalk.gray("Health check for orchestration streams"),
      { padding: 1, borderStyle: "round", borderColor: "cyan" }
    )
  );

  if (!sessionExists) {
    console.log(chalk.yellow("\nNo orchestration session running.\n"));
    console.log(chalk.gray("Start orchestration first: sigma orchestrate\n"));
    return;
  }

  // Get tmux pane status
  console.log(chalk.white.bold("\nTmux Panes:"));
  try {
    const paneInfo = execSync(
      "tmux list-panes -t sigma-orchestration -F '#{pane_index}:#{pane_dead}:#{pane_title}:#{pane_current_command}'",
      { encoding: "utf8", cwd: targetDir }
    );

    for (const line of paneInfo.trim().split("\n")) {
      const [index, dead, title, cmd] = line.split(":");
      const statusIcon = dead === "1" ? chalk.red("✗ Dead") : chalk.green("● Running");
      console.log(`  Pane ${index} (${title || "unnamed"}): ${statusIcon} [${cmd}]`);
    }
  } catch {
    console.log(chalk.gray("  Could not get pane info\n"));
  }

  // Get message bus status
  const { printStatus } = await import("./lib/orchestration/message-monitor.js");
  await printStatus(targetDir);

  // Check health status file
  const healthStatusFile = path.join(targetDir, ".sigma", "orchestration", "health-status.json");
  if (await fs.pathExists(healthStatusFile)) {
    try {
      const healthData = await fs.readJson(healthStatusFile);
      if (healthData.events && healthData.events.length > 0) {
        console.log(chalk.white.bold("Recent Events:"));
        const recentEvents = healthData.events.slice(-5);
        for (const event of recentEvents) {
          console.log(chalk.gray(`  ${event.timestamp}: Pane ${event.pane} - ${event.event}`));
        }
        console.log("");
      }
    } catch {
      // Ignore parse errors
    }
  }

  console.log(chalk.gray("Run sigma health --watch for continuous monitoring\n"));
}

program
  .command("health")
  .description("Monitor orchestration stream health")
  .addHelpText("after", `
Examples:
  $ sigma health                             # One-time health check
  $ sigma health --watch                     # Continuous monitoring
  $ sigma health -t ./project                # Check specific project

The health command monitors tmux panes for crashed agents
and provides real-time status updates via the message bus.

Documentation: https://github.com/sigma-protocol/cli#health
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-w, --watch", "Watch mode - continuous monitoring")
  .action(healthCommand);

// ============================================================================
// Rollback Command - Restore from backups
// ============================================================================

/**
 * Find all backup files in a directory
 * @param {string} directory - Directory to search
 * @returns {Array} - List of backup files with metadata
 */
async function findBackups(directory) {
  const backups = [];

  async function scanDir(dir) {
    if (!(await fs.pathExists(dir))) return;

    const items = await fs.readdir(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);

      // Skip common directories we don't want to scan
      if (
        item === "node_modules" ||
        item === ".git" ||
        item.startsWith(".")
      ) {
        continue;
      }

      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        await scanDir(itemPath);
      } else if (item.includes(".backup.")) {
        // Parse backup filename: original.backup.YYYY-MM-DDTHH-MM-SS-MMMZ
        const timestampMatch = item.match(/\.backup\.(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);
        const originalName = item.replace(/\.backup\.\d{4}-\d{2}-\d{2}T.*$/, "");

        backups.push({
          path: itemPath,
          originalName,
          timestamp: timestampMatch ? timestampMatch[1].replace(/-/g, ":").replace("T", " ").slice(0, 19) : "unknown",
          size: stat.size,
          relativePath: path.relative(directory, itemPath),
        });
      }
    }
  }

  await scanDir(directory);

  // Sort by timestamp (newest first)
  backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return backups;
}

/**
 * Rollback command - list and restore backups
 */
async function rollbackCommand(options) {
  debugLog("rollbackCommand called with options:", JSON.stringify(options, null, 2));
  showBanner();

  const targetDir = options.target || process.cwd();
  verboseLog("Rollback target:", targetDir);

  console.log(chalk.cyan("\n🔄 Sigma Protocol Rollback\n"));
  console.log(chalk.gray(`Target: ${targetDir}\n`));

  // Find all backups
  debugLog("Scanning for backups in:", targetDir);
  const spinner = ora("Scanning for backups...").start();
  const backups = await findBackups(targetDir);
  spinner.stop();
  debugLog("Found backups:", backups.length);

  if (backups.length === 0) {
    console.log(chalk.yellow("No backup files found.\n"));
    console.log(chalk.gray("Backups are created automatically when:"));
    console.log(chalk.gray("  - Running sigma update"));
    console.log(chalk.gray("  - Modifying .sigma-manifest.json"));
    console.log(chalk.gray("  - Making destructive changes\n"));
    return;
  }

  // List mode
  if (options.list) {
    console.log(chalk.white.bold(`Found ${backups.length} backup(s):\n`));

    for (let i = 0; i < Math.min(backups.length, 20); i++) {
      const backup = backups[i];
      const sizeStr = backup.size > 1024 ? `${(backup.size / 1024).toFixed(1)}KB` : `${backup.size}B`;
      console.log(chalk.cyan(`  [${i + 1}] `) + chalk.white(backup.relativePath));
      console.log(chalk.gray(`      Original: ${backup.originalName} | Time: ${backup.timestamp} | Size: ${sizeStr}`));
    }

    if (backups.length > 20) {
      console.log(chalk.gray(`\n  ... and ${backups.length - 20} more backups`));
    }

    console.log(chalk.gray("\n\nTo restore a backup:"));
    console.log(chalk.cyan("  sigma rollback --restore=<number>"));
    console.log(chalk.cyan("  sigma rollback --clean  # Remove all backups"));
    return;
  }

  // Restore mode
  if (options.restore) {
    const index = parseInt(options.restore, 10) - 1;

    if (isNaN(index) || index < 0 || index >= backups.length) {
      console.log(chalk.red(`Invalid backup number. Use 1-${backups.length}\n`));
      console.log(chalk.gray("List backups with: sigma rollback --list"));
      return;
    }

    const backup = backups[index];
    const originalPath = backup.path.replace(/\.backup\.\d{4}-\d{2}-\d{2}T.*$/, "");

    console.log(chalk.white("Restoring backup:\n"));
    console.log(chalk.gray(`  From: ${backup.relativePath}`));
    console.log(chalk.gray(`  To:   ${path.relative(targetDir, originalPath)}`));
    console.log(chalk.gray(`  Time: ${backup.timestamp}\n`));

    if (!options.force) {
      const { confirm } = await inquirer.prompt([{
        type: "confirm",
        name: "confirm",
        message: "Restore this backup? The current file will be overwritten.",
        default: false,
      }]);

      if (!confirm) {
        console.log(chalk.gray("\nRollback cancelled.\n"));
        return;
      }
    }

    try {
      // Create backup of current file before restoring
      await backupFile(originalPath);

      // Restore
      await fs.copy(backup.path, originalPath, { overwrite: true });
      console.log(chalk.green(`\n✓ Restored ${path.basename(originalPath)}\n`));

      // Remove the backup file we just restored
      await fs.remove(backup.path);
      console.log(chalk.gray(`Removed backup file: ${backup.relativePath}\n`));
    } catch (error) {
      console.log(chalk.red(`\n✗ Restore failed: ${error.message}\n`));
    }

    return;
  }

  // Clean mode - remove all backups
  if (options.clean) {
    console.log(chalk.white(`Found ${backups.length} backup file(s).\n`));

    if (!options.force) {
      const { confirm } = await inquirer.prompt([{
        type: "confirm",
        name: "confirm",
        message: `Delete all ${backups.length} backup files? This cannot be undone.`,
        default: false,
      }]);

      if (!confirm) {
        console.log(chalk.gray("\nCleanup cancelled.\n"));
        return;
      }
    }

    let deleted = 0;
    let failed = 0;

    for (const backup of backups) {
      try {
        await fs.remove(backup.path);
        deleted++;
      } catch {
        failed++;
      }
    }

    console.log(chalk.green(`\n✓ Deleted ${deleted} backup file(s)\n`));
    if (failed > 0) {
      console.log(chalk.yellow(`⚠ Failed to delete ${failed} file(s)\n`));
    }

    return;
  }

  // Default: show summary and available actions
  console.log(chalk.white.bold(`Found ${backups.length} backup(s)\n`));

  // Show recent backups
  console.log(chalk.gray("Recent backups:"));
  for (let i = 0; i < Math.min(backups.length, 5); i++) {
    const backup = backups[i];
    console.log(chalk.gray(`  [${i + 1}] ${backup.relativePath} (${backup.timestamp})`));
  }

  if (backups.length > 5) {
    console.log(chalk.gray(`  ... and ${backups.length - 5} more`));
  }

  console.log(chalk.white("\n\nAvailable actions:"));
  console.log(chalk.cyan("  sigma rollback --list        ") + chalk.gray("List all backups"));
  console.log(chalk.cyan("  sigma rollback --restore=1   ") + chalk.gray("Restore backup #1"));
  console.log(chalk.cyan("  sigma rollback --clean       ") + chalk.gray("Remove all backups"));
}

program
  .command("rollback")
  .description("List, restore, or clean up backup files")
  .addHelpText("after", `
Examples:
  $ sigma rollback                       # Show backup summary
  $ sigma rollback --list                # List all backups
  $ sigma rollback --restore=1           # Restore backup #1
  $ sigma rollback --clean               # Remove all backups
  $ sigma rollback --clean --force       # Remove without confirmation

Backups are created automatically during update operations.
Each backup filename includes a timestamp for easy identification.

Documentation: https://github.com/sigma-protocol/cli#rollback
  `)
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("-l, --list", "List all available backups")
  .option("-r, --restore <number>", "Restore backup by number (from --list)")
  .option("-c, --clean", "Remove all backup files")
  .option("-f, --force", "Skip confirmation prompts")
  .action(rollbackCommand);

// Init command (alias for install --auto)
async function initCommand(options) {
  showBanner();
  
  console.log(chalk.cyan("Initializing Sigma Protocol...\n"));
  
  const targetDir = options.target || process.cwd();
  
  // Auto-detect project type
  const pkgPath = path.join(targetDir, "package.json");
  let projectType = "generic";
  let suggestedPlatforms = ["cursor", "claude-code"];
  
  if (await fs.pathExists(pkgPath)) {
    try {
      const pkg = await fs.readJson(pkgPath);
      
      // Detect project type from dependencies
      if (pkg.dependencies?.next || pkg.devDependencies?.next) {
        projectType = "Next.js";
      } else if (pkg.dependencies?.expo || pkg.devDependencies?.expo) {
        projectType = "Expo";
      } else if (pkg.dependencies?.react || pkg.devDependencies?.react) {
        projectType = "React";
      } else if (pkg.dependencies?.vue || pkg.devDependencies?.vue) {
        projectType = "Vue";
      }
      
      console.log(chalk.gray(`Detected project type: ${projectType}`));
    } catch {
      // Ignore parse errors
    }
  } else {
    console.log(chalk.yellow("No package.json found. Creating generic setup.\n"));
  }
  
  // Auto-select platforms
  if (options.template) {
    console.log(chalk.gray(`Using template: ${options.template}\n`));
  }
  
  // Run install with auto-detected settings
  const modules = ["steps", "audit", "ops", "dev"];
  const platforms = suggestedPlatforms;
  
  console.log(chalk.cyan("Installing Sigma Protocol with:\n"));
  console.log(chalk.gray(`  Platforms: ${platforms.join(", ")}`));
  console.log(chalk.gray(`  Modules: ${modules.join(", ")}`));
  console.log("");
  
  // Create listr2 tasks for installation
  const installTasks = new Listr(
    platforms.map((platform) => ({
      title: `Installing ${PLATFORMS[platform]?.name || platform}`,
      task: async (ctx, task) => {
        const spinner = { text: "", start: () => spinner, succeed: () => spinner, fail: () => spinner };
        
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
        
        task.title = `${PLATFORMS[platform]?.name || platform} installed successfully`;
      },
    })),
    { concurrent: false }
  );
  
  try {
    await installTasks.run();
    
    // Create manifest
    const manifestPath = path.join(targetDir, ".sigma-manifest.json");
    const manifest = {
      sigma_version: "3.0.0",
      initialized: new Date().toISOString(),
      last_sync: new Date().toISOString(),
      project_type: projectType,
      project_info: {},
      commands_run: {},
      pending_updates: [],
    };
    await fs.writeJson(manifestPath, manifest, { spaces: 2 });
    
    console.log("");
    console.log(
      boxen(
        chalk.green("Sigma Protocol initialized!\n\n") +
        chalk.white("Next steps:\n") +
        chalk.gray("  1. Run ") + chalk.cyan("@step-1-ideation") + chalk.gray(" in your AI IDE\n") +
        chalk.gray("  2. Or run ") + chalk.cyan("sigma tutorial") + chalk.gray(" to learn more"),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "green",
        }
      )
    );
  } catch (error) {
    console.log(chalk.red(`\nInitialization failed: ${error.message}`));
  }
}

program
  .command("init")
  .description("Quick initialization (auto-detect project and install)")
  .option("-t, --target <directory>", "Target directory", process.cwd())
  .option("--template <name>", "Use a specific template (nextjs-saas, expo-mobile, etc.)")
  .action(initCommand);

// Contextual help command
async function helpCommand(topic) {
  const { runHelp } = await import("./lib/help.js");
  runHelp(topic);
}

program
  .command("help [topic]")
  .description("Get help on a specific topic (steps, ralph, audit, orchestration, retrofit, platforms, maid)")
  .action(helpCommand);

// ============================================================================
// Dependencies Installation Command
// ============================================================================

async function depsCommand(action, options) {
  const { runInstallWizard, checkRequiredDeps, warnMissingDeps, DEPENDENCIES } = await import("./lib/install-wizard.js");
  
  switch (action) {
    case 'install':
    case undefined:
      // Run full installation wizard
      await runInstallWizard();
      break;
      
    case 'check':
      // Just check and warn about missing deps
      await warnMissingDeps();
      break;
      
    case 'list':
      // List all dependencies and their status
      console.log(chalk.bold('\n📦 Sigma Protocol Dependencies\n'));
      for (const [category, group] of Object.entries(DEPENDENCIES)) {
        console.log(chalk.bold.blue(`\n${group.title}`));
        console.log(chalk.dim(group.description));
        for (const dep of group.items) {
          const installed = typeof dep.check === 'function' 
            ? await dep.check() 
            : dep.check;
          const status = installed 
            ? chalk.green('✓') 
            : chalk.red('✗');
          const required = dep.required 
            ? chalk.yellow(' (required)') 
            : chalk.dim(' (optional)');
          console.log(`  ${status} ${dep.displayName || dep.name}${required}`);
        }
      }
      console.log();
      break;
      
    default:
      console.log(chalk.red(`Unknown action: ${action}`));
      console.log('Usage: sigma deps [install|check|list]');
  }
}

program
  .command("deps [action]")
  .description("Manage dependencies (install, check, list)")
  .action(depsCommand);

// ============================================================================
// Ralph Loop Command
// ============================================================================

async function ralphCommand(options) {
  const { spawn } = await import("child_process");
  const targetDir = path.resolve(options.target || process.cwd());

  console.log(boxen(
    chalk.bold.cyan("🔄 Ralph Loop") + "\n" +
    chalk.gray("Autonomous story implementation"),
    { padding: 1, borderStyle: "round", borderColor: "cyan" }
  ));

  // Find ralph backlog files
  const ralphDir = path.join(targetDir, "docs", "ralph");
  let backlogs = [];

  if (options.backlog) {
    // User specified a backlog
    const backlogPath = path.isAbsolute(options.backlog)
      ? options.backlog
      : path.join(targetDir, options.backlog);
    if (await fs.pathExists(backlogPath)) {
      backlogs.push({ name: path.basename(path.dirname(backlogPath)), path: backlogPath });
    } else {
      console.log(chalk.red(`Backlog not found: ${backlogPath}`));
      process.exit(1);
    }
  } else if (await fs.pathExists(ralphDir)) {
    // Auto-detect backlogs
    const dirs = await fs.readdir(ralphDir);
    for (const dir of dirs) {
      const prdJson = path.join(ralphDir, dir, "prd.json");
      if (await fs.pathExists(prdJson)) {
        backlogs.push({ name: dir, path: prdJson });
      }
    }
  }

  if (backlogs.length === 0) {
    console.log(chalk.red("No ralph backlogs found."));
    console.log(chalk.gray("Run Step 5b or Step 11a to create prd.json files in docs/ralph/"));
    process.exit(1);
  }

  // Detect engine
  const engine = options.engine || "claude";

  // Check if engine is available
  const { execSync, spawnSync } = await import("child_process");
  const engineCheck = spawnSync("which", [engine], { stdio: "ignore" });
  if (engineCheck.status !== 0) {
    console.log(chalk.red(`Engine not found: ${engine}`));
    console.log(chalk.gray("Install claude or opencode CLI"));
    process.exit(1);
  }

  // Show what we found
  console.log(chalk.bold("\n📋 Found Backlogs:"));
  for (const b of backlogs) {
    const data = await fs.readJson(b.path);
    const passed = data.stories?.filter(s => s.passes).length || 0;
    const total = data.stories?.length || 0;
    console.log(`  ${chalk.cyan(b.name)}: ${passed}/${total} stories (${total - passed} remaining)`);
  }

  // If multiple backlogs and no specific one chosen, ask or run all
  if (backlogs.length > 1 && !options.backlog && !options.all && !options.parallel) {
    console.log(chalk.yellow("\nMultiple backlogs found. Choose how to run them:"));
    console.log(chalk.gray("  sigma ralph --all          # Run all sequentially"));
    console.log(chalk.gray("  sigma ralph --parallel     # Run all in parallel tmux panes"));
    console.log(chalk.gray("  sigma ralph -b <path>      # Run specific backlog"));
    process.exit(0);
  }

  // Resolve path to sigma-ralph.sh (script path is trusted, not user input)
  const scriptPath = path.join(ROOT_DIR, "scripts", "ralph", "sigma-ralph.sh");
  if (!await fs.pathExists(scriptPath)) {
    console.log(chalk.red(`Ralph script not found: ${scriptPath}`));
    process.exit(1);
  }

  // Determine backend (auto-detect or forced)
  let backend = options.backend || "auto";
  const isMacOS = process.platform === "darwin";

  if (backend === "auto") {
    // Auto-detect best backend
    if (isMacOS && await fs.pathExists("/Applications/iTerm.app")) {
      backend = "iterm";
    } else {
      try {
        spawnSync("which", ["tmux"], { stdio: "ignore" });
        backend = "tmux";
      } catch {
        backend = "sequential";
      }
    }
  }

  // Handle parallel mode with new spawn scripts
  if (options.parallel && backlogs.length > 1) {
    const backlogNames = backlogs.map(b => b.name).join(",");

    // Use iTerm spawn script on macOS
    if (backend === "iterm") {
      const itermScript = path.join(ROOT_DIR, "scripts", "ralph", "iterm-spawn.sh");
      if (await fs.pathExists(itermScript)) {
        console.log(chalk.bold(`\n🖥️  Spawning iTerm tabs (${backlogs.length} workers${options.observe ? " + observer" : ""})...`));

        const itermArgs = [
          `--project=${targetDir}`,
          `--backlogs=${backlogNames}`,
          `--engine=${engine}`
        ];
        if (options.observe) itermArgs.push("--observe");
        // Pass sandbox flags
        if (options.sandbox) {
          itermArgs.push("--sandbox");
          if (options.sandboxProvider) itermArgs.push(`--sandbox-provider=${options.sandboxProvider}`);
        }

        const result = spawnSync(itermScript, itermArgs, { stdio: "inherit" });
        if (result.status === 0) {
          console.log(chalk.green(`\n✅ iTerm tabs created successfully`));
          return;
        } else {
          console.log(chalk.yellow(`iTerm spawn failed (code ${result.status}), falling back to tmux`));
          backend = "tmux";
        }
      } else {
        console.log(chalk.yellow("iterm-spawn.sh not found, falling back to tmux"));
        backend = "tmux";
      }
    }

    // Use tmux spawn script
    if (backend === "tmux") {
      // Check if tmux is available
      const tmuxCheck = spawnSync("which", ["tmux"], { stdio: "ignore" });
      if (tmuxCheck.status !== 0) {
        console.log(chalk.red("tmux not found. Install with: brew install tmux"));
        process.exit(1);
      }

      const tmuxScript = path.join(ROOT_DIR, "scripts", "ralph", "tmux-spawn.sh");
      if (await fs.pathExists(tmuxScript)) {
        console.log(chalk.bold(`\n🖥️  Spawning tmux session (${backlogs.length} workers)...`));

        const tmuxArgs = [
          `--project=${targetDir}`,
          `--backlogs=${backlogNames}`,
          `--engine=${engine}`
        ];
        if (options.noAttach) tmuxArgs.push("--no-attach");
        // Pass sandbox flags
        if (options.sandbox) {
          tmuxArgs.push("--sandbox");
          if (options.sandboxProvider) tmuxArgs.push(`--sandbox-provider=${options.sandboxProvider}`);
        }

        const result = spawnSync(tmuxScript, tmuxArgs, { stdio: "inherit" });
        if (result.status === 0) {
          return;
        } else {
          console.log(chalk.yellow(`tmux-spawn.sh failed (code ${result.status}), using legacy mode`));
        }
      }

      // Legacy tmux fallback (uses shell commands for tmux control)
      const sessionName = `ralph-${Date.now()}`;
      console.log(chalk.bold(`\n🖥️  Creating tmux session: ${sessionName}`));

      // Build sandbox flags string
      const sandboxFlagsTmux = options.sandbox
        ? ` --sandbox --sandbox-provider=${options.sandboxProvider || "docker"}`
        : "";

      // Create tmux session with first backlog (tmux requires shell for complex commands)
      const firstCmd = `cd "${targetDir}" && "${scriptPath}" --workspace="${targetDir}" --backlog="${backlogs[0].path}" --engine=${engine}${sandboxFlagsTmux}`;
      execSync(`tmux new-session -d -s ${sessionName} -n ralph '${firstCmd}'`, { stdio: "inherit" });

      // Split panes for remaining backlogs
      for (let i = 1; i < backlogs.length; i++) {
        const cmd = `cd "${targetDir}" && "${scriptPath}" --workspace="${targetDir}" --backlog="${backlogs[i].path}" --engine=${engine}${sandboxFlagsTmux}`;
        execSync(`tmux split-window -t ${sessionName} -h '${cmd}'`, { stdio: "inherit" });
        execSync(`tmux select-layout -t ${sessionName} tiled`, { stdio: "inherit" });
      }

      console.log(chalk.green(`\n✅ Tmux session created with ${backlogs.length} panes`));
      console.log(chalk.cyan(`\nAttach with: tmux attach -t ${sessionName}`));
      console.log(chalk.gray(`Kill with:   tmux kill-session -t ${sessionName}`));

      // Ask if user wants to attach
      if (!options.noAttach) {
        console.log(chalk.yellow("\nAttaching to tmux session..."));
        execSync(`tmux attach -t ${sessionName}`, { stdio: "inherit" });
      }

      return;
    }
  }

  // Run Ralph for each backlog
  const backlogsToRun = options.all ? backlogs : [backlogs[0]];

  // Show sandbox status if enabled
  if (options.sandbox) {
    console.log(chalk.bold("\n🐳 Sandbox Mode Enabled"));
    console.log(chalk.white(`  Provider: ${chalk.cyan(options.sandboxProvider || "docker")}`));
    console.log(chalk.white(`  Budget: $${options.budgetMax || 50} max, $${options.budgetWarn || 25} warn`));
    console.log("");
  }

  console.log(chalk.bold(`\n🚀 Starting Ralph Loop (${engine})...\n`));

  for (const backlog of backlogsToRun) {
    // Build args array (spawn with array args is safe from injection)
    const args = [
      `--workspace=${targetDir}`,
      `--backlog=${backlog.path}`,
      `--engine=${engine}`
    ];

    if (options.dryRun) args.push("--dry-run");
    if (options.verbose) args.push("--verbose");

    // Sandbox flags
    if (options.sandbox) {
      args.push("--sandbox");
      if (options.sandboxProvider) args.push(`--sandbox-provider=${options.sandboxProvider}`);
      if (options.sandboxTimeout) args.push(`--sandbox-timeout=${options.sandboxTimeout}`);
      if (options.sandboxMemory) args.push(`--sandbox-memory=${options.sandboxMemory}`);
      if (options.sandboxCpus) args.push(`--sandbox-cpus=${options.sandboxCpus}`);
      if (options.budgetMax) args.push(`--budget-max=${options.budgetMax}`);
      if (options.budgetWarn) args.push(`--budget-warn=${options.budgetWarn}`);
    }
    if (options.validateOnly) args.push("--validate-only");

    console.log(chalk.cyan(`\n▶ ${backlog.name}: ${backlog.path}`));

    if (options.background) {
      // Run in background
      const logFile = path.join(path.dirname(backlog.path), "ralph-output.log");
      const out = await fs.open(logFile, "w");
      const subprocess = spawn(scriptPath, args, {
        detached: true,
        stdio: ["ignore", out.fd, out.fd]
      });
      subprocess.unref();
      console.log(chalk.green(`  Started in background (PID: ${subprocess.pid})`));
      console.log(chalk.gray(`  Log: ${logFile}`));
      console.log(chalk.gray(`  Monitor: tail -f "${logFile}"`));
    } else {
      // Run in foreground
      const subprocess = spawn(scriptPath, args, {
        stdio: "inherit",
        cwd: targetDir
      });

      await new Promise((resolve, reject) => {
        subprocess.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`Ralph exited with code ${code}`));
        });
        subprocess.on("error", reject);
      });
    }
  }
}

program
  .command("ralph")
  .description("Run Ralph Loop autonomous implementation")
  .option("-t, --target <directory>", "Target project directory", process.cwd())
  .option("-b, --backlog <path>", "Path to specific prd.json backlog")
  .option("-e, --engine <engine>", "AI engine: claude, opencode", "claude")
  .option("--all", "Run all detected backlogs in sequence")
  .option("--parallel", "Run all backlogs in parallel (iTerm/tmux)")
  .option("--observe", "Open observer tab for log tailing (with --parallel)")
  .option("--backend <type>", "Force backend: iterm, tmux, or auto", "auto")
  .option("--background", "Run in background (detached)")
  .option("--no-attach", "Don't auto-attach to tmux (with --parallel)")
  .option("--dry-run", "Show what would be done without executing")
  .option("-v, --verbose", "Show detailed output")
  // Sandbox flags
  .option("--sandbox", "Enable sandbox isolation for stories")
  .option("--sandbox-provider <provider>", "Sandbox provider: docker, e2b, daytona", "docker")
  .option("--sandbox-timeout <seconds>", "Sandbox creation timeout", "120")
  .option("--sandbox-memory <size>", "Docker memory limit", "4g")
  .option("--sandbox-cpus <n>", "Docker CPU limit", "2")
  .option("--budget-max <usd>", "Maximum spend before stopping (USD)", "50")
  .option("--budget-warn <usd>", "Warning threshold (USD)", "25")
  .option("--validate-only", "Only validate PRD without running")
  .action(ralphCommand);

// Interactive mode handler
async function interactiveCommand(options) {
  const { runInteractiveMode, handleMenuAction } = await import("./lib/interactive.js");
  
  const result = await runInteractiveMode(options);
  
  // Handle actions that return to main CLI
  if (result === "install") {
    await installCommand(options);
  } else if (result === "orchestrate") {
    await orchestrateCommand({ ...options, attach: false });
  } else if (result === "doctor") {
    await doctorCommand(options);
  } else if (result === "update") {
    await updateCommand({ ...options, quick: true, skipRetrofit: true });
  }
}

// Make interactive mode the default when no command is provided
// Check if user provided no command (just "sigma" or "npx sigma-protocol")
const args = process.argv.slice(2);
const commands = [
  "install", "status", "build", "update", "retrofit", "install-skills",
  "install-harness", "doctor", "orchestrate", "approve", "new", "tutorial",
  "maid", "search", "config", "init", "help", "deps", "sandbox", "thread",
  "f-thread", "merge", "health", "rollback", "ralph", "quickstart",
  "-h", "--help", "-V", "--version"
];
const hasCommand = args.some(arg => commands.includes(arg));

if (!hasCommand && args.length === 0) {
  // No arguments - run interactive mode
  interactiveCommand({ target: process.cwd() }).then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(chalk.red("Error:"), err.message);
    process.exit(1);
  });
} else if (!hasCommand && args.every(arg => arg.startsWith("-"))) {
  // Only flags like --target - run interactive with those flags
  const targetFlag = args.indexOf("--target");
  const tFlag = args.indexOf("-t");
  let target = process.cwd();
  
  if (targetFlag !== -1 && args[targetFlag + 1]) {
    target = args[targetFlag + 1];
  } else if (tFlag !== -1 && args[tFlag + 1]) {
    target = args[tFlag + 1];
  }
  
  interactiveCommand({ target }).then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error(chalk.red("Error:"), err.message);
    process.exit(1);
  });
} else {
  // Add unknown command handler with typo suggestions
  program.on('command:*', async (operands) => {
    const unknownCommand = operands[0];
    console.error(chalk.red(`\nError: Unknown command '${unknownCommand}'\n`));

    try {
      // Dynamic import to avoid circular dependencies
      const { searchCommands } = await import("./lib/search.js");
      const suggestions = searchCommands(unknownCommand, {});

      if (suggestions.length > 0) {
        // Show top 3 suggestions
        const topSuggestions = suggestions.slice(0, 3);
        console.log(chalk.yellow("Did you mean:"));
        topSuggestions.forEach((cmd, i) => {
          const prefix = i === 0 ? chalk.green("  → ") : "    ";
          console.log(`${prefix}${chalk.cyan(`sigma ${cmd.name.replace(/^@/, '')}`)} - ${chalk.gray(cmd.desc)}`);
        });
        console.log("");
      }
    } catch (_e) {
      // Fallback if search module fails to load
    }

    console.log(chalk.gray("Run 'sigma --help' for available commands"));
    console.log(chalk.gray("Run 'sigma search <query>' to find commands\n"));
    process.exit(1);
  });

  program.parse();
}

