/**
 * Claude Code platform builder for Sigma CLI
 */

import fs from "fs-extra";
import path from "path";
import { ROOT_DIR, PLATFORMS } from "../constants.js";
import { makeScriptsExecutable } from "../utils/files.js";

/**
 * Build for Claude Code platform
 * Transforms original commands by adding Claude Code frontmatter while preserving ALL content
 * @param {string} targetDir - Target directory
 * @param {string[]} modules - Modules to install
 * @param {object} spinner - Ora spinner instance
 * @param {Function} installClaudeCodeCommands - Command installer function
 * @returns {boolean} - Success status
 */
export async function buildClaudeCode(targetDir, modules, spinner, installClaudeCodeCommands) {
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
        const claudeCodeContent = transformToClaudeCodeAgent(
          originalContent,
          file,
          module
        );

        // Write as agent (full methodology content)
        const agentFileName = `${module}-${file}.md`;
        await fs.writeFile(
          path.join(targetDir, config.agentsDir, agentFileName),
          claudeCodeContent
        );

        // Write as command (full prompt injection, no agent indirection)
        const commandContent = generateClaudeCodeCommand(file, module, originalContent);
        await fs.writeFile(
          path.join(targetDir, config.commandsDir, `${file}.md`),
          commandContent
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

  // Copy Claude Code commands from platforms if present
  if (installClaudeCodeCommands) {
    await installClaudeCodeCommands(targetDir, spinner);
  }

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

/**
 * Transform original Cursor command to Claude Code agent format
 * PRESERVES ALL ORIGINAL CONTENT - just adds Claude Code frontmatter
 * @param {string} originalContent - Original content
 * @param {string} filename - Filename
 * @param {string} module - Module name
 * @returns {string} - Transformed content
 */
export function transformToClaudeCodeAgent(originalContent, filename, module) {
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

    // Extract allowed-tools to convert to Claude Code format
    const toolsMatch = yamlContent.match(
      /allowed-tools:\s*\n([\s\S]*?)(?=\n[a-z]|\n---|\n$)/i
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

/**
 * Generate thin Claude Code command that invokes the agent
 * @param {string} filename - Filename
 * @param {string} module - Module name
 * @returns {string} - Command content
 */
export function generateClaudeCodeCommand(filename, module, originalContent) {
  if (originalContent) {
    if (originalContent.startsWith("---\n")) {
      return originalContent;
    }
    return `---
description: "Run Sigma ${module}/${filename}"
---

${originalContent}`;
  }

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

/**
 * Generate CLAUDE.md orchestrator with full module list
 * @param {string[]} modules - Installed modules
 * @returns {string} - CLAUDE.md content
 */
export function generateClaudeMd(modules) {
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

## Skill Routing (Ralph Loop Integration)

When implementing tasks from the Ralph backlog, use the appropriate skills based on task type:

| Task Prefix | Primary Agent | Skills | When to Use |
|-------------|---------------|--------|-------------|
| \`UI-*\` | \`@frontend-engineer\` | frontend-design, react-performance | All UI components, pages, styling |
| \`API-*\` | \`@senior-architect\` | api-design-principles, backend-engineering | API routes, server actions |
| \`DB-*\` | \`@senior-architect\` | architecture-patterns, database-modeling | Database schema, migrations |
| \`TEST-*\` | \`@qa-engineer\` | senior-qa, systematic-debugging | Test files, validation |
| \`VERIFY-*\` | \`@qa-engineer\` | quality-gates, gap-analysis | Verification tasks |

### File Pattern Routing

| File Pattern | Agent | Skills |
|--------------|-------|--------|
| \`**/components/**\` | \`@frontend-engineer\` | frontend-aesthetics |
| \`**/app/**/page.tsx\` | \`@frontend-engineer\` | frontend-aesthetics, ux-designer |
| \`**/api/**\` | \`@lead-architect\` | backend-engineering, api-security |
| \`**/actions/**\` | \`@lead-architect\` | server-actions-patterns |
| \`**/db/**\`, \`**/schema/**\` | \`@senior-architect\` | database-modeling |
| \`**/*.test.*\` | \`@qa-engineer\` | quality-gates |

### Acceptance Criteria Validators

| AC Type | Validator | Browser Required |
|---------|-----------|------------------|
| \`ui-validation\` | \`agent-browser\` CLI | Yes (DO NOT use Playwright MCP) |
| \`command\` | Run specified command | No |
| \`file-exists\` | Check file presence | No |
| \`file-contains\` | Grep file content | No |
| \`manual\` | HITL signoff | No |

### Design System Enforcement

For all \`UI-*\` tasks:
1. Read \`docs/design/ui-profile.json\` (if exists)
2. Apply design constraints from task's \`designSystem\` field
3. Use only allowed tokens (\`--radius-md\`, \`--surface-raised\`, etc.)
4. Avoid banned patterns (saturated gradients, bouncy animations)
5. Verify with \`@ui-healer\` before completing

**See \`.sigma/invokes.json\` for the full routing manifest.**

---

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
