#!/usr/bin/env node

/**
 * SLAS (Self-Learning Agent System) Module
 *
 * Main entry point for SLAS functionality.
 * Provides session learning, pattern distillation, and artifact generation.
 */

import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { ROOT_DIR } from "../constants.js";

import { distill, generateProfileYAML, generateSkillMarkdown } from "./distiller.js";
import { generateArtifacts, cleanupGeneratedArtifacts } from "./generator.js";

/**
 * SLAS directory structure
 */
const SLAS_STRUCTURE = {
  hooks: ".claude/hooks/slas",
  hooksLib: ".claude/hooks/slas/lib",
  hooksGenerated: ".claude/hooks/slas/generated",
  skills: ".claude/skills",
  skillsPrefs: ".claude/skills/developer-preferences",
  sessionsLogs: "docs/sessions/logs",
  sessionsPrefs: "docs/sessions/preferences",
  sessionsPatterns: "docs/sessions/patterns"
};

/**
 * Initialize SLAS in a project
 * @param {string} targetDir - Target project directory
 * @param {Object} options - Initialization options
 * @returns {Promise<Object>} - Installation result
 */
export async function installSLAS(targetDir, options = {}) {
  const spinner = ora("Installing SLAS...").start();
  const results = {
    directories: [],
    files: [],
    hooks: [],
    errors: []
  };

  try {
    // Create directory structure
    spinner.text = "Creating SLAS directories...";
    for (const [name, relPath] of Object.entries(SLAS_STRUCTURE)) {
      const fullPath = path.join(targetDir, relPath);
      await fs.ensureDir(fullPath);
      results.directories.push(relPath);
    }

    // Seed hooks from template if available (do not overwrite existing)
    spinner.text = "Installing session hooks...";
    const hooksSource = path.join(targetDir, ".claude", "hooks", "slas");
    const hooksTemplate = path.join(ROOT_DIR, ".claude", "hooks", "slas");
    if (await fs.pathExists(hooksTemplate)) {
      const src = path.resolve(hooksTemplate);
      const dest = path.resolve(hooksSource);
      if (src !== dest) {
        await fs.copy(hooksTemplate, hooksSource, { overwrite: false, errorOnExist: false });
      }
    }

    // Ensure session-start hook exists
    const startHookPath = path.join(hooksSource, "session-start-context.sh");
    if (!(await fs.pathExists(startHookPath))) {
      await createSessionStartHook(startHookPath);
      results.files.push("session-start-context.sh");
    }

    // Ensure session-end hook exists
    const endHookPath = path.join(hooksSource, "session-end-summary.sh");
    if (!(await fs.pathExists(endHookPath))) {
      await createSessionEndHook(endHookPath);
      results.files.push("session-end-summary.sh");
    }

    // Ensure SLAS skills exist (session-distill, sigma-exit, developer-preferences)
    spinner.text = "Installing SLAS skills...";
    const slasSkills = ["session-distill", "sigma-exit", "developer-preferences"];
    for (const skill of slasSkills) {
      const templateDir = path.join(ROOT_DIR, "platforms", "claude-code", "skills", skill);
      const targetDirSkill = path.join(targetDir, SLAS_STRUCTURE.skills, skill);
      if (await fs.pathExists(templateDir)) {
        const src = path.resolve(templateDir);
        const dest = path.resolve(targetDirSkill);
        if (src !== dest && !(await fs.pathExists(dest))) {
          await fs.copy(templateDir, targetDirSkill);
          results.files.push(`${skill}/SKILL.md`);
        }
      }
    }

    // Update settings.json
    spinner.text = "Configuring hooks...";
    await configureHooks(targetDir);
    results.hooks.push("SessionStart", "SessionEnd");

    // Create initial preferences file
    spinner.text = "Creating initial preferences...";
    const prefsPath = path.join(targetDir, SLAS_STRUCTURE.sessionsPrefs, "developer-profile.yaml");
    if (!(await fs.pathExists(prefsPath))) {
      await fs.writeFile(prefsPath, `# Developer Preferences
# Auto-populated by SLAS after session analysis

metadata:
  initialized_at: "${new Date().toISOString()}"
  sessions_analyzed: 0

communication:
  verbosity: standard
  tone: direct

autonomy:
  level: medium
  score: 0.5

# Run /session-distill to populate from session history
`);
      results.files.push("developer-profile.yaml");
    }

    // Create initial patterns file
    const patternsPath = path.join(targetDir, SLAS_STRUCTURE.sessionsPatterns, "detected-patterns.json");
    if (!(await fs.pathExists(patternsPath))) {
      await fs.writeJson(patternsPath, {
        version: "1.0",
        initialized_at: new Date().toISOString(),
        sessions_analyzed: 0,
        patterns: {}
      }, { spaces: 2 });
      results.files.push("detected-patterns.json");
    }

    spinner.succeed("SLAS installed successfully");
    return { success: true, ...results };

  } catch (error) {
    spinner.fail("SLAS installation failed");
    results.errors.push(error.message);
    return { success: false, ...results };
  }
}

/**
 * Install SLAS scaffolding for non-Claude platforms (Codex/OpenCode)
 * Creates docs/sessions structure and initial preference/pattern files only.
 * @param {string} targetDir - Target project directory
 * @returns {Promise<Object>} - Installation result
 */
export async function installSLASScaffold(targetDir) {
  const spinner = ora("Setting up SLAS scaffolding...").start();
  const results = {
    directories: [],
    files: [],
    errors: []
  };

  try {
    const scaffoldDirs = [
      SLAS_STRUCTURE.sessionsLogs,
      SLAS_STRUCTURE.sessionsPrefs,
      SLAS_STRUCTURE.sessionsPatterns
    ];

    spinner.text = "Creating SLAS session directories...";
    for (const relPath of scaffoldDirs) {
      const fullPath = path.join(targetDir, relPath);
      await fs.ensureDir(fullPath);
      results.directories.push(relPath);
    }

    spinner.text = "Creating initial preferences...";
    const prefsPath = path.join(targetDir, SLAS_STRUCTURE.sessionsPrefs, "developer-profile.yaml");
    if (!(await fs.pathExists(prefsPath))) {
      await fs.writeFile(prefsPath, `# Developer Preferences
# Auto-populated by SLAS after session analysis

metadata:
  initialized_at: "${new Date().toISOString()}"
  sessions_analyzed: 0

communication:
  verbosity: standard
  tone: direct

autonomy:
  level: medium
  score: 0.5

# Run /session-distill to populate from session history
`);
      results.files.push("developer-profile.yaml");
    }

    const patternsPath = path.join(targetDir, SLAS_STRUCTURE.sessionsPatterns, "detected-patterns.json");
    if (!(await fs.pathExists(patternsPath))) {
      await fs.writeJson(patternsPath, {
        version: "1.0",
        initialized_at: new Date().toISOString(),
        sessions_analyzed: 0,
        patterns: {}
      }, { spaces: 2 });
      results.files.push("detected-patterns.json");
    }

    spinner.succeed("SLAS scaffolding ready");
    return { success: true, ...results };
  } catch (error) {
    spinner.fail("SLAS scaffolding failed");
    results.errors.push(error.message);
    return { success: false, ...results };
  }
}

/**
 * Bootstrap SLAS from existing session history
 * @param {string} targetDir - Target project directory
 * @param {string} transcriptPath - Path to session transcripts
 * @param {Object} options - Bootstrap options
 * @returns {Promise<Object>} - Bootstrap result
 */
export async function bootstrapFromHistory(targetDir, transcriptPath, options = {}) {
  const spinner = ora("Bootstrapping from session history...").start();

  try {
    // Run distillation
    spinner.text = "Analyzing session transcripts...";
    const distillResults = await distill({
      transcriptsPath: transcriptPath,
      sessionsLimit: options.sessions || 100,
      bootstrap: true
    });

    if (!distillResults.success) {
      spinner.fail(`Distillation failed: ${distillResults.error}`);
      return distillResults;
    }

    spinner.text = `Analyzed ${distillResults.filesAnalyzed} sessions...`;

    // Generate profile
    spinner.text = "Generating developer profile...";
    const profileYAML = generateProfileYAML(distillResults);
    const profilePath = path.join(targetDir, SLAS_STRUCTURE.sessionsPrefs, "developer-profile.yaml");
    await fs.writeFile(profilePath, profileYAML);

    // Generate skill
    spinner.text = "Generating preferences skill...";
    const skillMD = generateSkillMarkdown(distillResults);
    const skillPath = path.join(targetDir, SLAS_STRUCTURE.skillsPrefs, "SKILL.md");
    await fs.ensureDir(path.dirname(skillPath));
    await fs.writeFile(skillPath, skillMD);

    // Save patterns
    spinner.text = "Saving pattern cache...";
    const patternsPath = path.join(targetDir, SLAS_STRUCTURE.sessionsPatterns, "detected-patterns.json");
    await fs.writeJson(patternsPath, {
      version: "1.0",
      generated_at: new Date().toISOString(),
      ...distillResults
    }, { spaces: 2 });

    // Generate artifacts
    spinner.text = "Generating SLAS artifacts...";
    const artifacts = await generateArtifacts(targetDir, distillResults, options);

    spinner.succeed(`Bootstrap complete: ${distillResults.filesAnalyzed} sessions analyzed`);

    return {
      success: true,
      sessionsAnalyzed: distillResults.filesAnalyzed,
      confidence: distillResults.confidence,
      artifacts,
      patterns: distillResults.patterns
    };

  } catch (error) {
    spinner.fail(`Bootstrap failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Run session distillation
 * @param {Object} options - Distillation options
 * @returns {Promise<Object>} - Distillation result
 */
export async function distillSessions(options = {}) {
  const {
    targetDir = process.cwd(),
    sessions = 50,
    transcriptsPath,
    dryRun = false
  } = options;

  const spinner = ora("Running session distillation...").start();

  try {
    // Default transcript path
    const transcripts = transcriptsPath || path.join(process.env.HOME, ".claude", "projects");

    // Run distillation
    spinner.text = "Analyzing sessions...";
    const results = await distill({
      transcriptsPath: transcripts,
      sessionsLimit: sessions
    });

    if (!results.success) {
      spinner.fail(`Distillation failed: ${results.error}`);
      return results;
    }

    spinner.text = `Found patterns in ${results.filesAnalyzed} sessions...`;

    if (dryRun) {
      spinner.succeed("Dry run complete - no files modified");
      return { success: true, dryRun: true, ...results };
    }

    // Update profile
    spinner.text = "Updating developer profile...";
    const profileYAML = generateProfileYAML(results);
    const profilePath = path.join(targetDir, SLAS_STRUCTURE.sessionsPrefs, "developer-profile.yaml");
    await fs.ensureDir(path.dirname(profilePath));
    await fs.writeFile(profilePath, profileYAML);

    // Update skill
    spinner.text = "Updating preferences skill...";
    const skillMD = generateSkillMarkdown(results);
    const skillPath = path.join(targetDir, SLAS_STRUCTURE.skillsPrefs, "SKILL.md");
    await fs.ensureDir(path.dirname(skillPath));
    await fs.writeFile(skillPath, skillMD);

    // Update patterns cache
    spinner.text = "Updating pattern cache...";
    const patternsPath = path.join(targetDir, SLAS_STRUCTURE.sessionsPatterns, "detected-patterns.json");
    await fs.writeJson(patternsPath, {
      version: "1.0",
      generated_at: new Date().toISOString(),
      ...results
    }, { spaces: 2 });

    // Regenerate artifacts
    spinner.text = "Regenerating artifacts...";
    const artifacts = await generateArtifacts(targetDir, results);

    spinner.succeed(`Distillation complete: ${results.filesAnalyzed} sessions analyzed`);

    return {
      success: true,
      ...results,
      artifacts
    };

  } catch (error) {
    spinner.fail(`Distillation failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Get SLAS status for a project
 * @param {string} targetDir - Target project directory
 * @returns {Promise<Object>} - Status information
 */
export async function getSLASStatus(targetDir) {
  const status = {
    installed: false,
    hooksConfigured: false,
    profileExists: false,
    patternsExist: false,
    lastDistillation: null,
    sessionsAnalyzed: 0,
    confidence: 0
  };

  // Check installation
  const hooksDir = path.join(targetDir, SLAS_STRUCTURE.hooks);
  status.installed = await fs.pathExists(hooksDir);

  // Check hooks configuration
  const settingsPath = path.join(targetDir, ".claude", "settings.json");
  if (await fs.pathExists(settingsPath)) {
    try {
      const settings = await fs.readJson(settingsPath);
      status.hooksConfigured = !!(
        settings.hooks?.SessionStart?.length > 0 &&
        settings.hooks?.SessionEnd?.length > 0
      );
    } catch {}
  }

  // Check profile
  const profilePath = path.join(targetDir, SLAS_STRUCTURE.sessionsPrefs, "developer-profile.yaml");
  status.profileExists = await fs.pathExists(profilePath);

  // Check patterns
  const patternsPath = path.join(targetDir, SLAS_STRUCTURE.sessionsPatterns, "detected-patterns.json");
  if (await fs.pathExists(patternsPath)) {
    status.patternsExist = true;
    try {
      const patterns = await fs.readJson(patternsPath);
      status.lastDistillation = patterns.generated_at;
      status.sessionsAnalyzed = patterns.sessions_analyzed || 0;
      status.confidence = patterns.confidence || 0;
    } catch {}
  }

  return status;
}

/**
 * Sync SLAS artifacts to all platforms
 * @param {string} targetDir - Target project directory
 * @returns {Promise<Object>} - Sync results
 */
export async function syncToPlatforms(targetDir) {
  const results = {
    claudeCode: false,
    cursor: false,
    opencode: false
  };

  // Load patterns
  const patternsPath = path.join(targetDir, SLAS_STRUCTURE.sessionsPatterns, "detected-patterns.json");
  if (!(await fs.pathExists(patternsPath))) {
    return { success: false, error: "No patterns found. Run distillation first." };
  }

  const distillResults = await fs.readJson(patternsPath);

  // Generate artifacts for each platform
  const artifacts = await generateArtifacts(targetDir, distillResults);

  results.claudeCode = artifacts.skills.length > 0 || artifacts.updated.includes("CLAUDE.md");
  results.cursor = artifacts.rules.length > 0;
  results.opencode = artifacts.hooks.some(h => h.includes(".opencode"));

  return { success: true, ...results, artifacts };
}

/**
 * Configure hooks in settings.json
 * @param {string} targetDir - Target directory
 */
async function configureHooks(targetDir) {
  const settingsPath = path.join(targetDir, ".claude", "settings.json");

  let settings = {};
  if (await fs.pathExists(settingsPath)) {
    settings = await fs.readJson(settingsPath);
  }

  // Ensure hooks structure exists
  if (!settings.hooks) {
    settings.hooks = {};
  }

  // Add SessionStart hook if not present
  const startHookCommand = 'bash "$CLAUDE_PROJECT_DIR/.claude/hooks/slas/session-start-context.sh"';
  if (!settings.hooks.SessionStart) {
    settings.hooks.SessionStart = [{
      hooks: [{
        type: "command",
        command: startHookCommand
      }]
    }];
  } else {
    // Check if our hook is already there
    const hasStartHook = settings.hooks.SessionStart.some(
      h => h.hooks?.some(hk => hk.command?.includes("session-start-context"))
    );
    if (!hasStartHook) {
      settings.hooks.SessionStart.push({
        hooks: [{
          type: "command",
          command: startHookCommand
        }]
      });
    }
  }

  // Add SessionEnd hook if not present
  const endHookCommand = 'bash "$CLAUDE_PROJECT_DIR/.claude/hooks/slas/session-end-summary.sh"';
  if (!settings.hooks.SessionEnd) {
    settings.hooks.SessionEnd = [{
      hooks: [{
        type: "command",
        command: endHookCommand
      }]
    }];
  } else {
    const hasEndHook = settings.hooks.SessionEnd.some(
      h => h.hooks?.some(hk => hk.command?.includes("session-end-summary"))
    );
    if (!hasEndHook) {
      settings.hooks.SessionEnd.push({
        hooks: [{
          type: "command",
          command: endHookCommand
        }]
      });
    }
  }

  await fs.writeJson(settingsPath, settings, { spaces: 2 });
}

/**
 * Create default session start hook
 * @param {string} hookPath - Path for hook file
 */
async function createSessionStartHook(hookPath) {
  const content = `#!/bin/bash
# Session Start Context Hook - Auto-generated by SLAS

PROJECT_DIR="\${CLAUDE_PROJECT_DIR:-\$(pwd)}"
PREFS_FILE="\$PROJECT_DIR/docs/sessions/preferences/developer-profile.yaml"

echo "<session-context>"

if [[ -f "\$PREFS_FILE" ]]; then
    echo "## Developer Preferences"
    head -30 "\$PREFS_FILE"
fi

echo "</session-context>"
`;

  await fs.writeFile(hookPath, content);
  await fs.chmod(hookPath, 0o755);
}

/**
 * Create default session end hook
 * @param {string} hookPath - Path for hook file
 */
async function createSessionEndHook(hookPath) {
  const content = `#!/bin/bash
# Session End Hook - Auto-generated by SLAS

echo ""
echo "---"
echo "Session ended. Run /sigma-exit for rich context capture."
echo "---"
`;

  await fs.writeFile(hookPath, content);
  await fs.chmod(hookPath, 0o755);
}

export default {
  installSLAS,
  bootstrapFromHistory,
  distillSessions,
  getSLASStatus,
  syncToPlatforms,
  generateArtifacts,
  SLAS_STRUCTURE
};
