/**
 * Codex platform builder for Sigma CLI
 */

import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { ROOT_DIR, PLATFORMS } from "../constants.js";
import { makeScriptsExecutable } from "../utils/files.js";

/**
 * Build for Codex platform
 * Codex prefers .codex/skills, but we also write .agents/skills for legacy compatibility
 * @param {string} targetDir - Target directory
 * @param {string[]} modules - Modules to install
 * @param {object} spinner - Ora spinner instance
 * @returns {boolean} - Success status
 */
export async function buildCodex(targetDir, modules, spinner) {
  const config = PLATFORMS.codex;

  await fs.ensureDir(path.join(targetDir, config.outputDir));
  const codexSkillDirs = [config.skillsDir, config.legacySkillsDir].filter(Boolean);
  for (const dir of codexSkillDirs) {
    await fs.ensureDir(path.join(targetDir, dir));
  }

  let totalSkills = 0;
  const skippedModules = [];
  const seenNames = new Map();

  for (const module of modules) {
    const moduleSource = path.join(
      ROOT_DIR,
      module === "steps" ? "steps" : module
    );

    if (await fs.pathExists(moduleSource)) {
      const files = await fs.readdir(moduleSource);

      for (const file of files) {
        if (file.startsWith(".")) continue;
        if (file.toLowerCase().includes("readme")) continue;

        const filePath = path.join(moduleSource, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) continue;

        const originalContent = await fs.readFile(filePath, "utf8");
        const { description, version } = extractFrontmatterMeta(originalContent);
        const bodyContent = stripFrontmatter(originalContent);

        let skillName = normalizeCodexSkillName(file);
        if (seenNames.has(skillName)) {
          const previous = seenNames.get(skillName);
          skillName = normalizeCodexSkillName(`${module}-${file}`);
          seenNames.set(skillName, `${previous},${module}`);
        } else {
          seenNames.set(skillName, module);
        }

        const skillContent = buildCodexSkillContent({
          name: skillName,
          description: description || `Sigma ${module} command: ${file}`,
          version,
          body: bodyContent,
        });

        for (const skillsDir of codexSkillDirs) {
          const skillDir = path.join(targetDir, skillsDir, skillName);
          await fs.ensureDir(skillDir);
          await fs.writeFile(path.join(skillDir, "SKILL.md"), skillContent);
        }
        totalSkills++;
      }
    } else {
      skippedModules.push({ module, expectedPath: moduleSource });
    }
  }

  if (skippedModules.length > 0) {
    spinner.warn(`Codex: ${skippedModules.length} module(s) not found`);
    console.log(chalk.yellow(`\n⚠️  Warning: Source directories not found:`));
    for (const { module, expectedPath } of skippedModules) {
      console.log(chalk.gray(`   - ${module}: ${expectedPath}`));
    }
    console.log("");
  }

  if (totalSkills === 0) {
    throw new Error(
      `No skills generated for Codex. Source directory issue - ROOT_DIR=${ROOT_DIR}`
    );
  }

  spinner.text = `Codex: Generated ${totalSkills} skills (full prompt preserved)`;

  // Copy Codex config template (always update to latest version)
  const configTemplate = path.join(ROOT_DIR, "platforms", "codex", "config.toml");
  const configDest = path.join(targetDir, config.configFile);
  if (await fs.pathExists(configTemplate)) {
    await fs.copy(configTemplate, configDest);
  }

  // Install Codex execution policy rules from platforms/codex/rules/*.rules (Starlark)
  const rulesSource = path.join(ROOT_DIR, "platforms", "codex", "rules");
  if (await fs.pathExists(rulesSource)) {
    const rulesDest = path.join(targetDir, config.rulesDir);
    await fs.ensureDir(rulesDest);
    await fs.copy(rulesSource, rulesDest);
    const ruleFiles = (await fs.readdir(rulesSource)).filter(f => f.endsWith(".rules"));
    if (ruleFiles.length > 0) {
      spinner.text = `Codex: Installed ${ruleFiles.length} rule(s) to ${config.rulesDir}`;
    }
  }

  // Always regenerate AGENTS.md to keep it in sync with installed modules
  const agentsMdPath = path.join(targetDir, config.orchestrator);
  const agentsMd = generateCodexAgentsMd(modules);
  await fs.writeFile(agentsMdPath, agentsMd);

  // Copy Ralph scripts and make them executable
  const ralphSource = path.join(ROOT_DIR, "scripts", "ralph");
  if (await fs.pathExists(ralphSource)) {
    const ralphDest = path.join(targetDir, config.scriptsDir);
    await fs.copy(ralphSource, ralphDest);
    await makeScriptsExecutable(ralphDest);
    spinner.text = `Codex: Copied Ralph loop scripts (made executable)`;
  }

  // Copy schemas for Ralph JSON validation
  const schemasSource = path.join(ROOT_DIR, "schemas");
  if (await fs.pathExists(schemasSource)) {
    await fs.copy(schemasSource, path.join(targetDir, config.schemasDir));
  }

  // Install SLAS skills (session-distill, sigma-exit, developer-preferences) if available
  const slasSkills = ["session-distill", "sigma-exit", "developer-preferences"];
  const slasSourceRoot = path.join(ROOT_DIR, "platforms", "codex", "skills");
  if (await fs.pathExists(slasSourceRoot)) {
    for (const skill of slasSkills) {
      const src = path.join(slasSourceRoot, skill);
      if (await fs.pathExists(src)) {
        for (const skillsDir of codexSkillDirs) {
          const dest = path.join(targetDir, skillsDir, skill);
          if (!(await fs.pathExists(dest))) {
            await fs.copy(src, dest);
          }
        }
      }
    }
  }

  return true;
}

function normalizeCodexSkillName(name) {
  return name.replace(/\.[a-z0-9]+$/i, "").replace(/\./g, "-");
}

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n?/);
  return match ? content.slice(match[0].length) : content;
}

function extractFrontmatterMeta(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { description: "", version: "" };

  const yamlContent = match[1];
  const descMatch = yamlContent.match(/description:\s*"?([^"\n]+)"?/);
  const versionMatch = yamlContent.match(/version:\s*"?([^"\n]+)"?/);

  return {
    description: descMatch?.[1]?.trim() || "",
    version: versionMatch?.[1]?.trim() || "",
  };
}

function yamlEscape(value) {
  return value.replace(/"/g, '\\"').replace(/\r?\n/g, " ").trim();
}

function buildCodexSkillContent({ name, description, version, body }) {
  const headerLines = [
    "---",
    `name: ${name}`,
    `description: "${yamlEscape(description)}"`,
    "source: sigma-protocol",
  ];
  if (version) headerLines.push(`version: "${yamlEscape(version)}"`);
  headerLines.push("---", "");

  return `${headerLines.join("\n")}${body.trimStart()}`;
}

export function generateCodexAgentsMd(modules) {
  return `# Sigma Protocol - Codex Configuration

## Overview

Sigma Protocol is a **platform-agnostic 13-step product development methodology** for AI-assisted development.

This AGENTS.md orchestrates the Sigma workflow in Codex, providing access to all step skills, audit commands, and operational tooling.

### Value Equation (Hormozi)

Every feature must maximize:
\`\`\`
Value = (Dream Outcome x Perceived Likelihood) / (Time Delay x Effort & Sacrifice)
\`\`\`

## Quick Start

\`\`\`bash
# Start with product ideation
codex "Run step 1 ideation for [your product idea]"

# Continue through the workflow
codex "Continue to step 2"

# Use a named profile
codex --profile sigma-dev    # Balanced daily development
codex --profile sigma-strict # Read-only audit mode
codex --profile sigma-fast   # Rapid prototyping
\`\`\`

## Workflow

\`\`\`
Step 0: Environment Setup
    |
Step 1: Ideation -> MASTER_PRD.md
    |
Step 1.5: Offer Architecture (if monetized)
    |
Step 2: Architecture -> ARCHITECTURE.md
    |
Step 3: UX Design -> UX-DESIGN.md
    |
Step 4: Flow Tree -> Bulletproof Gates
    |
Step 5: Wireframes -> docs/prds/flows/*.md
    |
Step 5.5: PRD to JSON (Ralph-mode) -> docs/ralph/prototype/prd.json
    |
Step 6: Design System -> DESIGN-SYSTEM.md
    |
Step 7: Interface States -> STATE-SPEC.md
    |
Step 8: Technical Spec -> TECHNICAL-SPEC.md
    |
Step 9: Landing Page (optional)
    |
Step 10: Feature Breakdown -> FEATURE-BREAKDOWN.md
    |
Step 11: PRD Generation -> /docs/prds/*.md
    |
Step 11.25: PRD to JSON (Ralph-mode) -> docs/ralph/implementation/prd.json
    |
Step 11b: PRD Swarm (optional) -> swarm-*/
    |
Step 12: Context Engine -> platform rules
    |
Step 13: Skillpack Generator -> project skills
    |
[Ralph Loop] -> Autonomous implementation via sigma-ralph.sh
\`\`\`

## Available Skills

### Core Steps

Invoke any skill with: \`$step-1-ideation\` (Codex skill invocation syntax)

| Skill | Description |
|-------|-------------|
| \`$step-1-ideation\` | Product Ideation with Hormozi Value Equation |
| \`$step-2-architecture\` | System Architecture Design |
| \`$step-3-ux-design\` | UX/UI Design & User Flows |
| \`$step-4-flow-tree\` | Navigation Flow & Screen Inventory |
| \`$step-5-wireframe-prototypes\` | Wireframe Prototypes |
| \`$step-5b-prd-to-json\` | **Ralph-Mode:** Convert prototype PRDs to JSON |
| \`$step-6-design-system\` | Design System & Tokens |
| \`$step-7-interface-states\` | Interface State Specifications |
| \`$step-8-technical-spec\` | Technical Specifications |
| \`$step-9-landing-page\` | Landing Page Design |
| \`$step-10-feature-breakdown\` | Feature Breakdown |
| \`$step-11-prd-generation\` | PRD Generation |
| \`$step-11a-prd-to-json\` | **Ralph-Mode:** Convert implementation PRDs to JSON |
| \`$step-11b-prd-swarm\` | PRD Swarm Orchestration (supports Ralph-mode) |
| \`$step-12-context-engine\` | Context Engine Setup |
| \`$step-13-skillpack-generator\` | Generate project skillpack |

### Ralph Loop (Autonomous Implementation)

| Command | Description |
|---------|-------------|
| \`./scripts/ralph/sigma-ralph.sh\` | Run Ralph loop on prd.json backlog |

**Ralph Mode Usage:**
\`\`\`bash
# 1. Convert PRDs to JSON
codex "Run step-5b-prd-to-json --all-prds"

# 2. Run Ralph loop (in terminal)
./scripts/ralph/sigma-ralph.sh . docs/ralph/prototype/prd.json codex
\`\`\`

${modules.includes("audit") ? `### Audit Skills
| Skill | Description |
|-------|-------------|
| \`$security-audit\` | Security vulnerability assessment |
| \`$accessibility-audit\` | WCAG compliance check |
| \`$performance-check\` | Performance analysis |
| \`$gap-analysis\` | PRD coverage analysis |
` : ""}
${modules.includes("dev") ? `### Dev Skills
| Skill | Description |
|-------|-------------|
| \`$implement-prd\` | Implement a PRD feature |
| \`$plan\` | Create implementation plan |
` : ""}
${modules.includes("ops") ? `### Ops Skills
| Skill | Description |
|-------|-------------|
| \`$pr-review\` | Pull request review |
| \`$sprint-plan\` | Sprint planning |
| \`$status\` | Project status check |
` : ""}
## Skill Routing Table

When a user request contains these keywords, invoke the corresponding skill automatically:

| Keyword / Pattern | Skill to Invoke |
|-------------------|-----------------|
| ideation, idea, brainstorm | \`$step-1-ideation\` |
| architecture, system design | \`$step-2-architecture\` |
| ux, user experience, flows | \`$step-3-ux-design\` |
| flow tree, navigation, screens | \`$step-4-flow-tree\` |
| wireframe, prototype, mockup | \`$step-5-wireframe-prototypes\` |
| design system, tokens, theme | \`$step-6-design-system\` |
| states, interface states, loading | \`$step-7-interface-states\` |
| technical spec, spec | \`$step-8-technical-spec\` |
| landing page, hero, CTA | \`$step-9-landing-page\` |
| feature breakdown, decompose | \`$step-10-feature-breakdown\` |
| prd, product requirements | \`$step-11-prd-generation\` |
| context engine, cursorrules | \`$step-12-context-engine\` |
| skillpack, generate skills | \`$step-13-skillpack-generator\` |
| security, vulnerability, audit | \`$security-audit\` |
| accessibility, a11y, wcag | \`$accessibility-audit\` |
| performance, perf, lighthouse | \`$performance-check\` |
| gap, coverage, traceability | \`$gap-analysis\` |
| plan, implement, build | \`$implement-prd\` |
| pr, review, merge | \`$pr-review\` |
| sprint, backlog, groom | \`$sprint-plan\` |

## Named Profiles

Switch behavior by passing \`--profile\` to \`codex\`:

| Profile | Approval Policy | Reasoning | Sandbox | Use Case |
|---------|----------------|-----------|---------|----------|
| \`sigma-dev\` | on-request | high | workspace-write | Daily development (default) |
| \`sigma-strict\` | untrusted | high | read-only | Code review & audit |
| \`sigma-fast\` | on-failure | medium | workspace-write | Rapid prototyping |

## MCP Tools

The following MCP servers are configured in \`.codex/config.toml\`:

| Server | Capabilities |
|--------|-------------|
| **Firecrawl** | Web scraping, site crawling, content extraction |
| **EXA** | Semantic search, code context, deep research |
| **Ref** | Documentation search, URL reading |
| **Context7** | Library-specific documentation lookup |
| **Task Master AI** | PRD parsing, task management, research integration |

## HITL Checkpoint Policy

Skills pause for human approval at critical decision points. **Never skip these.**

Key checkpoints:
- **Step 1**: Approve value proposition before architecture
- **Step 2**: Approve architecture before UX design
- **Step 5**: Approve wireframes before design system
- **Step 11**: Approve PRDs before implementation
- **Ralph Loop**: Each task completion requires verification

## Quality Gates

Each step has built-in verification criteria. **Target: 80+/100 score.**

Gate checks include:
- Completeness: All required sections present
- Consistency: Cross-references validated
- Value alignment: Maps to Value Equation
- HITL sign-off: Human approval recorded

## Notes

- Codex loads skills from \`.codex/skills/\` in the repo (legacy: \`.agents/skills/\`).
- Project config via \`.codex/config.toml\` (profiles, MCP servers, sandbox).
- Rules in \`.codex/rules/\` define execution policies.
- Ralph loop scripts in \`scripts/ralph/\`.
- Schemas in \`.codex/schemas/\` for Ralph JSON validation.

See https://github.com/dallionking/sigma-protocol for full documentation.
`;
}
