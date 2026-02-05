/**
 * Codex platform builder for Sigma CLI
 */

import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { ROOT_DIR, PLATFORMS } from "../constants.js";

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

  // Copy Codex config template if available and not present
  const configTemplate = path.join(ROOT_DIR, "platforms", "codex", "config.toml");
  const configDest = path.join(targetDir, config.configFile);
  if (await fs.pathExists(configTemplate)) {
    if (!(await fs.pathExists(configDest))) {
      await fs.copy(configTemplate, configDest);
    }
  }

  // Ensure AGENTS.md exists (Codex reads this automatically)
  const agentsMdPath = path.join(targetDir, config.orchestrator);
  if (!(await fs.pathExists(agentsMdPath))) {
    const agentsMd = generateCodexAgentsMd(modules);
    await fs.writeFile(agentsMdPath, agentsMd);
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

function generateCodexAgentsMd(_modules) {
  return `# Sigma Protocol - Codex Configuration

## Overview

Sigma Protocol is a 13-step product development methodology for AI-assisted development.
This configuration enables the Sigma workflow in Codex via skills and AGENTS.md.

## Available Steps (Skills)

Invoke skills with:
\`$step-1-ideation\` (Codex skill invocation)

Key steps include:
- \`step-1-ideation\`
- \`step-2-architecture\`
- \`step-3-ux-design\`
- \`step-4-flow-tree\`
- \`step-5-wireframe-prototypes\`
- \`step-6-design-system\`
- \`step-7-interface-states\`
- \`step-8-technical-spec\`
- \`step-9-landing-page\`
- \`step-10-feature-breakdown\`
- \`step-11-prd-generation\`
- \`step-12-context-engine\`
- \`step-13-skillpack-generator\`

## Notes

- Codex loads skills from \`.codex/skills/\` in the repo (legacy: \`.agents/skills/\`).
- Project config is optional via \`.codex/config.toml\`.
`;
}
