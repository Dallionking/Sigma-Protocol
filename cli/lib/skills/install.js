/**
 * Skill installation functions for Sigma CLI
 */

import fs from "fs-extra";
import path from "path";
import { ROOT_DIR, PLATFORMS } from "../constants.js";
import { countFilesByExt, findSkillDirs } from "../utils/files.js";
import { transformToCursorRule } from "../platform/cursor.js";

/**
 * Validate that a skill directory has the required structure
 * Claude Code/OpenCode skills require: skillName/SKILL.md
 * @param {string} skillPath - Path to the skill directory
 * @param {string} skillName - Name of the skill
 * @returns {object} - { valid: boolean, error?: string }
 */
export async function validateSkillDirectory(skillPath, skillName) {
  const skillMdPath = path.join(skillPath, "SKILL.md");

  // Check if directory exists
  if (!(await fs.pathExists(skillPath))) {
    return { valid: false, error: `Skill directory not found: ${skillPath}` };
  }

  // Check if SKILL.md exists
  if (!(await fs.pathExists(skillMdPath))) {
    return {
      valid: false,
      error: `Missing SKILL.md in skill directory: ${skillName}/`,
    };
  }

  // Optionally check SKILL.md has content
  const content = await fs.readFile(skillMdPath, "utf8");
  if (content.trim().length < 10) {
    return {
      valid: false,
      error: `SKILL.md is empty or too short in: ${skillName}/`,
    };
  }

  return { valid: true };
}

/**
 * Validate all skills in a directory and return validation results
 * @param {string} skillsDir - Directory containing skill subdirectories
 * @returns {object} - { valid: skill[], invalid: {name, error}[] }
 */
export async function validateAllSkills(skillsDir) {
  const results = { valid: [], invalid: [] };

  if (!(await fs.pathExists(skillsDir))) {
    return results;
  }

  const items = await fs.readdir(skillsDir);

  for (const item of items) {
    const itemPath = path.join(skillsDir, item);
    const stat = await fs.stat(itemPath);

    if (!stat.isDirectory()) continue;

    const validation = await validateSkillDirectory(itemPath, item);
    if (validation.valid) {
      results.valid.push(item);
    } else {
      results.invalid.push({ name: item, error: validation.error });
    }
  }

  return results;
}

/**
 * Install Cursor Foundation Skills
 * @param {string} targetDir - Target directory
 * @param {object} spinner - Ora spinner instance
 * @param {object} results - Results tracking object
 */
export async function installCursorSkills(targetDir, spinner, results) {
  // First try platforms folder (pre-transformed .mdc files)
  let sourceDir = path.join(ROOT_DIR, "platforms", "cursor", "rules");
  const destDir = path.join(targetDir, ".cursor", "rules");
  let needsTransformation = false;

  // Ensure destination exists
  await fs.ensureDir(destDir);

  // Check if platform source exists, otherwise use src/skills (needs transformation)
  if (!(await fs.pathExists(sourceDir))) {
    sourceDir = path.join(ROOT_DIR, "src", "skills");
    needsTransformation = true;
    if (!(await fs.pathExists(sourceDir))) {
      throw new Error(`No skills found at ${sourceDir}`);
    }
  }

  if (!needsTransformation) {
    // Copy categorized rules recursively (marketing/, design/, etc.)
    const entries = await fs.readdir(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(sourceDir, entry.name);
      const destPath = path.join(destDir, entry.name);

      if (entry.isDirectory()) {
        await fs.copy(srcPath, destPath);
        results.cursor.installed += await countFilesByExt(srcPath, ".mdc");
        continue;
      }

      if (!entry.name.endsWith(".mdc")) continue;

      if (await fs.pathExists(destPath)) {
        results.cursor.skipped++;
        continue;
      }

      await fs.copy(srcPath, destPath);
      results.cursor.installed++;
      spinner.text = `Cursor: Installing ${entry.name}...`;
    }
    return;
  }

  // Transform flat src/skills into Cursor .mdc format
  const files = await fs.readdir(sourceDir);
  const skillFiles = files.filter((f) => f.endsWith(".mdc") || f.endsWith(".md"));

  for (const file of skillFiles) {
    // Convert .md to .mdc for Cursor and add sigma- prefix if needed
    let destFileName = file.endsWith(".md") ? file.replace(".md", ".mdc") : file;
    if (!destFileName.startsWith("sigma-")) {
      destFileName = `sigma-${destFileName}`;
    }
    const destPath = path.join(destDir, destFileName);

    // Check if already exists
    if (await fs.pathExists(destPath)) {
      results.cursor.skipped++;
      continue;
    }

    // Read source content
    const content = await fs.readFile(path.join(sourceDir, file), "utf8");
    const outputContent = file.endsWith(".md")
      ? transformToCursorRule(content, file)
      : content;

    spinner.text = `Cursor: Transforming ${file} → ${destFileName}...`;
    await fs.writeFile(destPath, outputContent);
    results.cursor.installed++;

    spinner.text = `Cursor: Installing ${destFileName}...`;
  }
}

/**
 * Install Claude Code Foundation Skills
 * @param {string} targetDir - Target directory
 * @param {object} spinner - Ora spinner instance
 * @param {object} results - Results tracking object
 */
export async function installClaudeCodeSkills(targetDir, spinner, results) {
  // First try platforms folder, then fall back to src/skills
  let sourceDir = path.join(ROOT_DIR, "platforms", "claude-code", "skills");
  const destDir = path.join(targetDir, ".claude", "skills");

  // Ensure destination exists
  await fs.ensureDir(destDir);

  // Check if platform source exists, otherwise use src/skills
  if (!(await fs.pathExists(sourceDir))) {
    sourceDir = path.join(ROOT_DIR, "src", "skills");
    if (!(await fs.pathExists(sourceDir))) {
      throw new Error(`No skills found at ${sourceDir}`);
    }

    // Copy individual skill files
    const files = await fs.readdir(sourceDir);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const skillName = file.replace(".md", "");
      const skillDir = path.join(destDir, skillName);

      if (await fs.pathExists(skillDir)) {
        results["claude-code"].skipped++;
        continue;
      }

      await fs.ensureDir(skillDir);
      await fs.copy(path.join(sourceDir, file), path.join(skillDir, "SKILL.md"));
      results["claude-code"].installed++;

      spinner.text = `Claude Code: Installing ${skillName}...`;
    }
    return;
  }

  // Get all skill directories
  const items = await fs.readdir(sourceDir);

  for (const item of items) {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(destDir, item);
    const stat = await fs.stat(srcPath);

    if (!stat.isDirectory()) continue;

    // Validate skill directory structure before copying
    const validation = await validateSkillDirectory(srcPath, item);
    if (!validation.valid) {
      spinner.text = `Claude Code: Skipping invalid skill ${item} (${validation.error})`;
      results["claude-code"].skipped++;
      continue;
    }

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

/**
 * Install Claude Code command packs (e.g., marketing/)
 * @param {string} targetDir - Target directory
 * @param {object} spinner - Ora spinner instance
 * @param {object} results - Optional results tracking object
 */
export async function installClaudeCodeCommands(targetDir, spinner, results) {
  const sourceDir = path.join(ROOT_DIR, "platforms", "claude-code", "commands");
  const destDir = path.join(targetDir, ".claude", "commands");

  if (!(await fs.pathExists(sourceDir))) {
    return;
  }

  await fs.ensureDir(destDir);
  await fs.copy(sourceDir, destDir);

  const installedCount = await countFilesByExt(sourceDir, ".md");
  if (results && results["claude-code"]) {
    results["claude-code"].installed += installedCount;
  }
  spinner.text = `Claude Code: Installed ${installedCount} command files`;
}

/**
 * Install OpenCode Foundation Skills
 * @param {string} targetDir - Target directory
 * @param {object} spinner - Ora spinner instance
 * @param {object} results - Results tracking object
 */
export async function installOpenCodeSkills(targetDir, spinner, results) {
  // First try platforms folder, then fall back to src/skills
  let sourceDir = path.join(ROOT_DIR, "platforms", "opencode", "skill");
  const destDir = path.join(targetDir, ".opencode", "skill");
  const agentSourceDir = path.join(ROOT_DIR, "platforms", "opencode", "agent");
  const agentDestDir = path.join(targetDir, ".opencode", "agent");

  // Ensure destination exists
  await fs.ensureDir(destDir);
  await fs.ensureDir(agentDestDir);

  // Copy categorized agent templates if present
  if (await fs.pathExists(agentSourceDir)) {
    await fs.copy(agentSourceDir, agentDestDir);
    results.opencode.installed += await countFilesByExt(agentSourceDir, ".md");
  }

  // Check if platform source exists, otherwise use src/skills
  if (!(await fs.pathExists(sourceDir))) {
    sourceDir = path.join(ROOT_DIR, "src", "skills");
    if (!(await fs.pathExists(sourceDir))) {
      throw new Error(`No skills found at ${sourceDir}`);
    }

    // Copy individual skill files
    const files = await fs.readdir(sourceDir);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const skillName = file.replace(".md", "");
      const skillDir = path.join(destDir, skillName);

      if (await fs.pathExists(skillDir)) {
        results.opencode.skipped++;
        continue;
      }

      await fs.ensureDir(skillDir);
      await fs.copy(path.join(sourceDir, file), path.join(skillDir, "SKILL.md"));
      results.opencode.installed++;

      spinner.text = `OpenCode: Installing ${skillName}...`;
    }
    return;
  }

  // Get all skill directories (supports nested categories)
  const skillDirs = await findSkillDirs(sourceDir);

  for (const srcPath of skillDirs) {
    const skillName = path.basename(srcPath);
    const destPath = path.join(destDir, skillName);

    // Validate skill directory structure before copying
    const validation = await validateSkillDirectory(srcPath, skillName);
    if (!validation.valid) {
      spinner.text = `OpenCode: Skipping invalid skill ${skillName} (${validation.error})`;
      results.opencode.skipped++;
      continue;
    }

    // Check if already exists
    if (await fs.pathExists(destPath)) {
      results.opencode.skipped++;
      continue;
    }

    // Copy the skill directory
    await fs.copy(srcPath, destPath);
    results.opencode.installed++;

    spinner.text = `OpenCode: Installing ${skillName}...`;
  }
}

/**
 * Install Codex Foundation Skills
 * Codex prefers .codex/skills, but we also install .agents/skills for legacy compatibility
 * @param {string} targetDir - Target directory
 * @param {object} spinner - Ora spinner instance
 * @param {object} results - Results tracking object
 */
export async function installCodexSkills(targetDir, spinner, results) {
  const sourceDir = path.join(ROOT_DIR, "platforms", "codex", "skills");
  const config = PLATFORMS.codex;
  const destDirs = [config.skillsDir, config.legacySkillsDir].filter(Boolean).map((dir) => path.join(targetDir, dir));

  if (!(await fs.pathExists(sourceDir))) {
    throw new Error(`No Codex skills found at ${sourceDir}`);
  }

  for (const destDir of destDirs) {
    await fs.ensureDir(destDir);
  }

  // Get all skill directories (supports nested categories)
  const skillDirs = await findSkillDirs(sourceDir);

  for (const srcPath of skillDirs) {
    const skillName = path.basename(srcPath);
    const destPaths = destDirs.map((dir) => path.join(dir, skillName));

    const validation = await validateSkillDirectory(srcPath, skillName);
    if (!validation.valid) {
      spinner.text = `Codex: Skipping invalid skill ${skillName} (${validation.error})`;
      results.codex.skipped++;
      continue;
    }

    let copied = false;
    for (const destPath of destPaths) {
      if (!(await fs.pathExists(destPath))) {
        await fs.copy(srcPath, destPath);
        copied = true;
      }
    }

    if (copied) {
      results.codex.installed++;
      spinner.text = `Codex: Installing ${skillName}...`;
    } else {
      results.codex.skipped++;
    }
  }
}
