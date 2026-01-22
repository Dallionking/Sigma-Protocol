/**
 * Cursor platform builder for Sigma CLI
 */

import fs from "fs-extra";
import path from "path";
import { ROOT_DIR, PLATFORMS } from "../constants.js";
import { makeScriptsExecutable } from "../utils/files.js";

/**
 * Build for Cursor platform
 * Cursor uses the original files directly - they already have Cursor frontmatter
 * @param {string} targetDir - Target directory
 * @param {string[]} modules - Modules to install
 * @param {object} spinner - Ora spinner instance
 * @param {Function} installCursorSkills - Skill installer function
 * @returns {boolean} - Success status
 */
export async function buildCursor(targetDir, modules, spinner, installCursorSkills) {
  const config = PLATFORMS.cursor;
  const outputDir = path.join(targetDir, config.outputDir);

  await fs.ensureDir(outputDir);

  let totalFiles = 0;

  // Copy module commands (original files are already Cursor-formatted)
  for (const module of modules) {
    const moduleSource = path.join(
      ROOT_DIR,
      module === "steps" ? "steps" : module
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

  // Copy Ralph scripts and make them executable
  const ralphSource = path.join(ROOT_DIR, "scripts", "ralph");
  if (await fs.pathExists(ralphSource)) {
    const ralphDest = path.join(targetDir, "scripts", "ralph");
    await fs.copy(ralphSource, ralphDest);
    await makeScriptsExecutable(ralphDest);
    spinner.text = `Cursor: Copied Ralph loop scripts (made executable)`;
  }

  // Install skills
  if (installCursorSkills) {
    await installCursorSkills(targetDir, spinner, { cursor: { installed: 0, skipped: 0 } });
  }

  return true;
}

/**
 * Transform source skill (.md) to Cursor rule format (.mdc)
 * @param {string} originalContent - Original skill content
 * @param {string} filename - Filename
 * @returns {string} - Transformed content
 */
export function transformToCursorRule(originalContent, filename) {
  const frontmatterMatch = originalContent.match(
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
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
 * @param {string} skillName - Skill name
 * @param {string[]} triggers - Trigger keywords
 * @returns {object} - { globs: string[], keywords: string[] }
 */
export function getCursorSkillMetadata(skillName, triggers) {
  // Default metadata
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

  // Default fallback
  return {
    globs: defaultGlobs,
    keywords: [skillName.replace(/-/g, " "), ...keywords],
  };
}
