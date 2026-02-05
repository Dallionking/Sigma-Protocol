/**
 * OpenCode platform builder for Sigma CLI
 */

import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { ROOT_DIR, PLATFORMS } from "../constants.js";
import { makeScriptsExecutable } from "../utils/files.js";
import { validateJsonSchema } from "../utils/validation.js";

/**
 * Build for OpenCode platform
 * Transforms original commands by adding OpenCode syntax while preserving ALL content
 * @param {string} targetDir - Target directory
 * @param {string[]} modules - Modules to install
 * @param {object} spinner - Ora spinner instance
 * @param {Function} installOpenCodeSkills - Skill installer function
 * @returns {boolean} - Success status
 */
export async function buildOpenCode(targetDir, modules, spinner, installOpenCodeSkills) {
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
      module === "steps" ? "steps" : module
    );
    if (await fs.pathExists(moduleSource)) {
      const files = await fs.readdir(moduleSource);

      for (const file of files) {
        if (file.startsWith(".")) continue;

        const filePath = path.join(moduleSource, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) continue;

        const originalContent = await fs.readFile(filePath, "utf8");

        // Generate OpenCode command (full prompt injection, no agent indirection)
        const openCodeCommand = transformToOpenCodeCommand(
          originalContent,
          file,
          module
        );
        await fs.writeFile(
          path.join(targetDir, config.commandsDir, `${file}.md`),
          openCodeCommand
        );

        // Generate OpenCode agent (full content)
        const openCodeAgent = transformToOpenCodeAgent(
          originalContent,
          file,
          module
        );
        await fs.writeFile(
          path.join(targetDir, config.agentsDir, `${file}.md`),
          openCodeAgent
        );

        totalCommands++;
      }
    }
  }

  spinner.text = `OpenCode: Transformed ${totalCommands} commands (full content preserved)`;

  // Generate AGENTS.md orchestrator
  const agentsMd = generateAgentsMd(modules);
  await fs.writeFile(path.join(targetDir, "AGENTS.md"), agentsMd);

  // Generate opencode.json config with schema validation
  const openCodeConfig = generateOpenCodeConfig(modules);

  // Validate against schema before writing
  const schemaPath = path.join(ROOT_DIR, "schemas", "opencode-config.schema.json");
  const validation = await validateJsonSchema(openCodeConfig, schemaPath);

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
    JSON.stringify(openCodeConfig, null, 2)
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
  if (installOpenCodeSkills) {
    await installOpenCodeSkills(targetDir, spinner, { opencode: { installed: 0, skipped: 0 } });
  }

  return true;
}

/**
 * Transform original Cursor command to OpenCode command format
 * Creates a thin wrapper that uses OpenCode-specific features
 * @param {string} originalContent - Original content
 * @param {string} filename - Filename
 * @param {string} module - Module name
 * @returns {string} - Transformed content
 */
export function transformToOpenCodeCommand(originalContent, filename, module) {
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

  // OpenCode command - full prompt injection (no agent indirection)
  if (originalContent.startsWith("---\n")) {
    return originalContent;
  }

  return `---
description: ${description}
---

${originalContent}`;
}

/**
 * Transform original Cursor command to OpenCode agent format
 * PRESERVES ALL ORIGINAL CONTENT - just adds OpenCode agent frontmatter
 * @param {string} originalContent - Original content
 * @param {string} filename - Filename
 * @param {string} module - Module name
 * @returns {string} - Transformed content
 */
export function transformToOpenCodeAgent(originalContent, filename, module) {
  // Parse existing YAML frontmatter
  const frontmatterMatch = originalContent.match(
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  );

  let existingFrontmatter = {};
  let bodyContent = originalContent;

  if (frontmatterMatch) {
    const yamlContent = frontmatterMatch[1];
    bodyContent = frontmatterMatch[2];

    existingFrontmatter.version = yamlContent.match(
      /version:\s*"?([^"\n]+)"?/
    )?.[1];
    existingFrontmatter.description = yamlContent.match(
      /description:\s*"?([^"\n]+)"?/
    )?.[1];
  }

  // Build OpenCode agent format with FULL original content
  const openCodeAgent = `---
description: "${existingFrontmatter.description || `Sigma ${module}/${filename}`}"
mode: primary
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

/**
 * Generate AGENTS.md for OpenCode
 * @param {string[]} _modules - Installed modules (unused but kept for API consistency)
 * @returns {string} - AGENTS.md content
 */
export function generateAgentsMd(_modules) {
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

/**
 * Generate opencode.json config
 * Schema URL: https://opencode.ai/config.json (NOT opencode.dev)
 * @param {string[]} _modules - Installed modules (unused but kept for API consistency)
 * @returns {object} - OpenCode config object
 */
export function generateOpenCodeConfig(_modules) {
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
