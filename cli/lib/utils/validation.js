/**
 * Validation utilities for Sigma CLI
 */

import fs from "fs-extra";
import path from "path";
import Ajv from "ajv";
import { ROOT_DIR } from "../constants.js";
import { countFilesByExt } from "./files.js";

// Initialize JSON Schema validator
const ajv = new Ajv({ allErrors: true, verbose: true });

/**
 * Validate JSON data against a schema
 * @param {object} data - Data to validate
 * @param {string} schemaPath - Path to JSON schema file
 * @returns {object} - { valid: boolean, errors: array, warning?: string }
 */
export async function validateJsonSchema(data, schemaPath) {
  try {
    const schemaContent = await fs.readJson(schemaPath);
    const validate = ajv.compile(schemaContent);
    const valid = validate(data);

    if (!valid) {
      return {
        valid: false,
        errors: validate.errors.map(err => ({
          path: err.instancePath || "/",
          message: err.message,
          keyword: err.keyword
        }))
      };
    }

    return { valid: true, errors: [] };
  } catch (error) {
    // If schema doesn't exist or can't be read, skip validation with warning
    return {
      valid: true,
      errors: [],
      warning: `Could not load schema: ${error.message}`
    };
  }
}

/**
 * Check platform prerequisites in target directory
 * @param {string} targetDir - Target directory
 * @param {string[]} platforms - Platforms to check
 * @returns {object} - { warnings: string[], suggestions: string[] }
 */
export async function checkPlatformPrerequisites(targetDir, platforms) {
  const warnings = [];
  const suggestions = [];

  // Check if it's a valid project directory
  const packageJson = path.join(targetDir, "package.json");
  const isNodeProject = await fs.pathExists(packageJson);

  if (!isNodeProject) {
    warnings.push("No package.json found - this may not be a Node.js project");
    suggestions.push("Consider running 'npm init' first for full Sigma integration");
  }

  // Check for git repository
  const gitDir = path.join(targetDir, ".git");
  const isGitRepo = await fs.pathExists(gitDir);

  if (!isGitRepo) {
    warnings.push("Not a git repository - version control recommended");
    suggestions.push("Consider running 'git init' for version tracking");
  }

  // Platform-specific checks
  for (const platform of platforms) {
    switch (platform) {
      case "cursor": {
        const cursorRules = path.join(targetDir, ".cursorrules");
        const cursorDir = path.join(targetDir, ".cursor");
        if ((await fs.pathExists(cursorRules)) || (await fs.pathExists(cursorDir))) {
          warnings.push("Existing Cursor configuration detected - will be merged/overwritten");
        }
        break;
      }

      case "claude-code": {
        const claudeMd = path.join(targetDir, "CLAUDE.md");
        const claudeDir = path.join(targetDir, ".claude");
        if ((await fs.pathExists(claudeMd)) || (await fs.pathExists(claudeDir))) {
          warnings.push("Existing Claude Code configuration detected - will be merged/overwritten");
        }
        break;
      }

      case "opencode": {
        const opencodeJson = path.join(targetDir, "opencode.json");
        const opencodeDir = path.join(targetDir, ".opencode");
        if ((await fs.pathExists(opencodeJson)) || (await fs.pathExists(opencodeDir))) {
          warnings.push("Existing OpenCode configuration detected - will be merged/overwritten");
        }
        break;
      }
    }
  }

  return { warnings, suggestions };
}

/**
 * Validate that required source files exist before installation
 * @param {string[]} modules - Modules to validate
 * @returns {object} - { valid: boolean, issues: string[] }
 */
export async function validateSourceFiles(modules) {
  const issues = [];

  for (const module of modules) {
    const moduleSource = path.join(
      ROOT_DIR,
      module === "steps" ? "steps" : module
    );

    if (!(await fs.pathExists(moduleSource))) {
      issues.push(`Missing module directory: ${moduleSource}`);
      continue;
    }

    // Check for at least one command file
    const files = await fs.readdir(moduleSource);
    const commandFiles = files.filter((f) => !f.startsWith(".") && !f.startsWith("README"));
    if (commandFiles.length === 0) {
      issues.push(`No commands found in module: ${module}`);
    }
  }

  // Check for skills directory
  const skillsSource = path.join(ROOT_DIR, "src", "skills");
  if (!(await fs.pathExists(skillsSource))) {
    issues.push(`Missing skills directory: ${skillsSource}`);
  }

  // Check for Cursor rules (categorized)
  const cursorRulesSource = path.join(ROOT_DIR, "platforms", "cursor", "rules");
  if (await fs.pathExists(cursorRulesSource)) {
    const ruleCount = await countFilesByExt(cursorRulesSource, ".mdc");
    if (ruleCount === 0) {
      issues.push(`No Cursor rules found under: ${cursorRulesSource}`);
    }
  } else {
    issues.push(`Missing Cursor rules directory: ${cursorRulesSource}`);
  }

  // Check for OpenCode agent templates (categorized)
  const opencodeAgentsSource = path.join(ROOT_DIR, "platforms", "opencode", "agent");
  if (await fs.pathExists(opencodeAgentsSource)) {
    const agentCount = await countFilesByExt(opencodeAgentsSource, ".md");
    if (agentCount === 0) {
      issues.push(`No OpenCode agents found under: ${opencodeAgentsSource}`);
    }
  } else {
    issues.push(`Missing OpenCode agent directory: ${opencodeAgentsSource}`);
  }

  // Check for Claude Code commands (marketing command packs)
  const claudeCommandsSource = path.join(ROOT_DIR, "platforms", "claude-code", "commands");
  if (await fs.pathExists(claudeCommandsSource)) {
    const commandCount = await countFilesByExt(claudeCommandsSource, ".md");
    if (commandCount === 0) {
      issues.push(`No Claude Code commands found under: ${claudeCommandsSource}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Validate a skill directory structure
 * @param {string} skillPath - Path to skill directory
 * @param {string} skillName - Name of the skill
 * @returns {object} - { valid: boolean, warnings: string[] }
 */
export async function validateSkillDirectory(skillPath, skillName) {
  const warnings = [];

  // Check for SKILL.md
  const skillMd = path.join(skillPath, "SKILL.md");
  if (!(await fs.pathExists(skillMd))) {
    warnings.push(`${skillName}: Missing SKILL.md file`);
  }

  // Check for other required/expected files
  const expectedFiles = ["SKILL.md"];
  for (const expected of expectedFiles) {
    const filePath = path.join(skillPath, expected);
    if (!(await fs.pathExists(filePath))) {
      // Only warn, don't fail
      // warnings.push(`${skillName}: Missing ${expected}`);
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Validate all skills in a directory
 * @param {string} skillsDir - Base skills directory
 * @returns {object} - { valid: boolean, skills: number, warnings: string[] }
 */
export async function validateAllSkills(skillsDir) {
  const warnings = [];
  let skillCount = 0;

  try {
    if (!(await fs.pathExists(skillsDir))) {
      return { valid: false, skills: 0, warnings: [`Skills directory not found: ${skillsDir}`] };
    }

    const items = await fs.readdir(skillsDir, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith(".")) {
        const skillPath = path.join(skillsDir, item.name);
        const result = await validateSkillDirectory(skillPath, item.name);
        if (!result.valid) {
          warnings.push(...result.warnings);
        }
        skillCount++;
      }
    }
  } catch (error) {
    warnings.push(`Error validating skills: ${error.message}`);
  }

  return {
    valid: warnings.length === 0,
    skills: skillCount,
    warnings,
  };
}
