#!/usr/bin/env node

/**
 * Sigma Protocol Configuration Management
 *
 * View and edit Sigma Protocol configuration.
 */

import chalk from "chalk";
import inquirer from "inquirer";
import boxen from "boxen";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";

// Default configuration
const DEFAULT_CONFIG = {
  version: "1.0.0",
  platforms: {
    default: "claude-code",
    installed: [],
  },
  ralph: {
    autoCommit: true,
    autoVerify: true,
    pauseOnError: true,
  },
  orchestration: {
    defaultStreams: 4,
    forksPerStream: 1,
    autoRestart: true,
    voiceNotifications: false,
    elevenLabsApiKey: "",
    providers: {
      preferred: "e2b",
      fallback: ["docker", "daytona"]
    },
    github: {
      autoCreatePR: true,
      autoMergeBestFork: false,
      closeRejectedPRs: true
    },
    browserValidation: true
  },
  ui: {
    colorScheme: "default",
    showProgress: true,
    verboseOutput: false,
  },
};

/**
 * Get config file path
 */
export function getConfigPath(targetDir = process.cwd()) {
  return path.join(targetDir, ".sigma", "config.json");
}

/**
 * Load configuration
 */
export async function loadConfig(targetDir = process.cwd()) {
  const configPath = getConfigPath(targetDir);
  
  if (await fs.pathExists(configPath)) {
    try {
      const config = await fs.readJson(configPath);
      return { ...DEFAULT_CONFIG, ...config };
    } catch {
      return DEFAULT_CONFIG;
    }
  }
  
  return DEFAULT_CONFIG;
}

/**
 * Save configuration
 */
export async function saveConfig(config, targetDir = process.cwd()) {
  const configPath = getConfigPath(targetDir);
  const sigmaDir = path.dirname(configPath);
  
  await fs.ensureDir(sigmaDir);
  await fs.writeJson(configPath, config, { spaces: 2 });
}

/**
 * Display current configuration
 */
export async function displayConfig(targetDir = process.cwd()) {
  const config = await loadConfig(targetDir);
  
  console.log(
    boxen(
      chalk.cyan.bold("Sigma Protocol Configuration\n\n") +
      chalk.white.bold("Platforms:\n") +
      chalk.gray(`  Default: ${config.platforms.default}\n`) +
      chalk.gray(`  Installed: ${config.platforms.installed.join(", ") || "None"}\n\n`) +
      chalk.white.bold("Ralph Loop:\n") +
      chalk.gray(`  Auto-commit: ${config.ralph.autoCommit}\n`) +
      chalk.gray(`  Auto-verify: ${config.ralph.autoVerify}\n`) +
      chalk.gray(`  Pause on error: ${config.ralph.pauseOnError}\n\n`) +
      chalk.white.bold("Orchestration:\n") +
      chalk.gray(`  Default streams: ${config.orchestration.defaultStreams}\n`) +
      chalk.gray(`  Forks per stream: ${config.orchestration.forksPerStream || 1}\n`) +
      chalk.gray(`  Preferred provider: ${config.orchestration.providers?.preferred || "e2b"}\n`) +
      chalk.gray(`  Browser validation: ${config.orchestration.browserValidation ?? true}\n`) +
      chalk.gray(`  Auto-create PRs: ${config.orchestration.github?.autoCreatePR ?? true}\n`) +
      chalk.gray(`  Auto-restart: ${config.orchestration.autoRestart}\n`) +
      chalk.gray(`  Voice notifications: ${config.orchestration.voiceNotifications}\n`) +
      chalk.gray(`  ElevenLabs API key: ${config.orchestration.elevenLabsApiKey ? "***set***" : "not set"}\n\n`) +
      chalk.white.bold("UI:\n") +
      chalk.gray(`  Color scheme: ${config.ui.colorScheme}\n`) +
      chalk.gray(`  Show progress: ${config.ui.showProgress}\n`) +
      chalk.gray(`  Verbose output: ${config.ui.verboseOutput}`),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );
  
  console.log(chalk.gray(`\nConfig file: ${getConfigPath(targetDir)}\n`));
}

/**
 * Edit configuration interactively
 */
export async function editConfigInteractive(targetDir = process.cwd()) {
  const config = await loadConfig(targetDir);
  
  console.log(chalk.cyan("\nEditing Sigma Protocol configuration...\n"));
  
  const { section } = await inquirer.prompt([
    {
      type: "list",
      name: "section",
      message: "What would you like to configure?",
      choices: [
        { name: "Platforms (default IDE, installed platforms)", value: "platforms" },
        { name: "Ralph Loop (auto-commit, verification)", value: "ralph" },
        { name: "Orchestration (streams, voice, API keys)", value: "orchestration" },
        { name: "UI (colors, progress, verbosity)", value: "ui" },
        new inquirer.Separator(),
        { name: "View current config", value: "view" },
        { name: "Reset to defaults", value: "reset" },
        { name: "Back", value: "back" },
      ],
    },
  ]);
  
  if (section === "back") {
    return;
  }
  
  if (section === "view") {
    await displayConfig(targetDir);
    return editConfigInteractive(targetDir);
  }
  
  if (section === "reset") {
    const { confirm } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirm",
        message: "Reset all configuration to defaults?",
        default: false,
      },
    ]);
    
    if (confirm) {
      await saveConfig(DEFAULT_CONFIG, targetDir);
      console.log(chalk.green("\n✓ Configuration reset to defaults\n"));
    }
    return;
  }
  
  // Edit specific section
  switch (section) {
    case "platforms":
      await editPlatformsConfig(config, targetDir);
      break;
    case "ralph":
      await editRalphConfig(config, targetDir);
      break;
    case "orchestration":
      await editOrchestrationConfig(config, targetDir);
      break;
    case "ui":
      await editUIConfig(config, targetDir);
      break;
  }
  
  // Ask if user wants to continue editing
  const { continueEditing } = await inquirer.prompt([
    {
      type: "confirm",
      name: "continueEditing",
      message: "Continue editing configuration?",
      default: false,
    },
  ]);
  
  if (continueEditing) {
    return editConfigInteractive(targetDir);
  }
}

/**
 * Edit platforms configuration
 */
async function editPlatformsConfig(config, targetDir) {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "default",
      message: "Default platform:",
      choices: ["cursor", "claude-code", "opencode"],
      default: config.platforms.default,
    },
  ]);
  
  config.platforms.default = answers.default;
  await saveConfig(config, targetDir);
  console.log(chalk.green("\n✓ Platforms configuration saved\n"));
}

/**
 * Edit Ralph loop configuration
 */
async function editRalphConfig(config, targetDir) {
  const answers = await inquirer.prompt([
    {
      type: "confirm",
      name: "autoCommit",
      message: "Auto-commit after completing tasks?",
      default: config.ralph.autoCommit,
    },
    {
      type: "confirm",
      name: "autoVerify",
      message: "Auto-verify implementation after each task?",
      default: config.ralph.autoVerify,
    },
    {
      type: "confirm",
      name: "pauseOnError",
      message: "Pause for user intervention on errors?",
      default: config.ralph.pauseOnError,
    },
  ]);
  
  config.ralph = { ...config.ralph, ...answers };
  await saveConfig(config, targetDir);
  console.log(chalk.green("\n✓ Ralph configuration saved\n"));
}

/**
 * Edit orchestration configuration
 */
async function editOrchestrationConfig(config, targetDir) {
  const answers = await inquirer.prompt([
    {
      type: "number",
      name: "defaultStreams",
      message: "Default number of parallel streams:",
      default: config.orchestration.defaultStreams,
      validate: (input) => (input >= 1 && input <= 10) || "Enter a number between 1 and 10",
    },
    {
      type: "list",
      name: "forksPerStream",
      message: "Default forks per stream (Best of N pattern):",
      choices: [
        { name: "1 (no forking - fastest)", value: 1 },
        { name: "2 forks", value: 2 },
        { name: "3 forks (recommended)", value: 3 },
        { name: "5 forks", value: 5 }
      ],
      default: config.orchestration.forksPerStream || 1,
    },
    {
      type: "list",
      name: "preferredProvider",
      message: "Preferred sandbox provider:",
      choices: [
        { name: "E2B (cloud, recommended)", value: "e2b" },
        { name: "Docker (local)", value: "docker" },
        { name: "Daytona (dev environments)", value: "daytona" }
      ],
      default: config.orchestration.providers?.preferred || "e2b",
    },
    {
      type: "confirm",
      name: "autoCreatePR",
      message: "Automatically create GitHub PRs for each fork?",
      default: config.orchestration.github?.autoCreatePR ?? true,
    },
    {
      type: "confirm",
      name: "browserValidation",
      message: "Enable browser validation (orchestrator opens preview URLs)?",
      default: config.orchestration.browserValidation ?? true,
    },
    {
      type: "confirm",
      name: "autoRestart",
      message: "Auto-restart crashed agents?",
      default: config.orchestration.autoRestart,
    },
    {
      type: "confirm",
      name: "voiceNotifications",
      message: "Enable voice notifications (requires ElevenLabs)?",
      default: config.orchestration.voiceNotifications,
    },
  ]);
  
  if (answers.voiceNotifications && !config.orchestration.elevenLabsApiKey) {
    const { apiKey } = await inquirer.prompt([
      {
        type: "password",
        name: "apiKey",
        message: "Enter your ElevenLabs API key:",
        mask: "*",
      },
    ]);
    answers.elevenLabsApiKey = apiKey;
  }
  
  // Structure the config properly
  config.orchestration = {
    ...config.orchestration,
    defaultStreams: answers.defaultStreams,
    forksPerStream: answers.forksPerStream,
    autoRestart: answers.autoRestart,
    voiceNotifications: answers.voiceNotifications,
    browserValidation: answers.browserValidation,
    providers: {
      ...config.orchestration.providers,
      preferred: answers.preferredProvider
    },
    github: {
      ...config.orchestration.github,
      autoCreatePR: answers.autoCreatePR
    }
  };
  
  if (answers.elevenLabsApiKey) {
    config.orchestration.elevenLabsApiKey = answers.elevenLabsApiKey;
  }
  
  await saveConfig(config, targetDir);
  console.log(chalk.green("\n✓ Orchestration configuration saved\n"));
}

/**
 * Edit UI configuration
 */
async function editUIConfig(config, targetDir) {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "colorScheme",
      message: "Color scheme:",
      choices: ["default", "dark", "light", "minimal"],
      default: config.ui.colorScheme,
    },
    {
      type: "confirm",
      name: "showProgress",
      message: "Show progress bars during operations?",
      default: config.ui.showProgress,
    },
    {
      type: "confirm",
      name: "verboseOutput",
      message: "Enable verbose output?",
      default: config.ui.verboseOutput,
    },
  ]);
  
  config.ui = { ...config.ui, ...answers };
  await saveConfig(config, targetDir);
  console.log(chalk.green("\n✓ UI configuration saved\n"));
}

/**
 * Set a specific config value
 */
export async function setConfigValue(key, value, targetDir = process.cwd()) {
  const config = await loadConfig(targetDir);
  
  // Parse key path (e.g., "ralph.autoCommit")
  const keys = key.split(".");
  let current = config;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      console.log(chalk.red(`Unknown config key: ${key}`));
      return;
    }
    current = current[keys[i]];
  }
  
  const lastKey = keys[keys.length - 1];
  if (!(lastKey in current)) {
    console.log(chalk.red(`Unknown config key: ${key}`));
    return;
  }
  
  // Parse value based on current type
  const currentType = typeof current[lastKey];
  if (currentType === "boolean") {
    current[lastKey] = value === "true" || value === "1";
  } else if (currentType === "number") {
    current[lastKey] = parseInt(value, 10);
  } else {
    current[lastKey] = value;
  }
  
  await saveConfig(config, targetDir);
  console.log(chalk.green(`✓ Set ${key} = ${current[lastKey]}`));
}

/**
 * Open config in editor
 */
export async function openConfigInEditor(targetDir = process.cwd()) {
  const configPath = getConfigPath(targetDir);
  
  // Ensure config exists
  if (!(await fs.pathExists(configPath))) {
    await saveConfig(DEFAULT_CONFIG, targetDir);
  }
  
  const editor = process.env.EDITOR || process.env.VISUAL || "vi";
  
  console.log(chalk.cyan(`\nOpening config in ${editor}...\n`));
  
  try {
    execSync(`${editor} "${configPath}"`, { stdio: "inherit" });
    console.log(chalk.green("\n✓ Config saved\n"));
  } catch (error) {
    console.log(chalk.red(`\nFailed to open editor: ${error.message}`));
    console.log(chalk.gray(`Config file: ${configPath}\n`));
  }
}

/**
 * Run config command
 */
export async function runConfig(options = {}) {
  const targetDir = options.target || process.cwd();
  
  if (options.edit) {
    return openConfigInEditor(targetDir);
  }
  
  if (options.set) {
    const [key, value] = options.set.split("=");
    if (!key || value === undefined) {
      console.log(chalk.red("Invalid format. Use: sigma config --set key=value"));
      return;
    }
    return setConfigValue(key, value, targetDir);
  }
  
  if (options.interactive) {
    return editConfigInteractive(targetDir);
  }
  
  // Default: show current config
  return displayConfig(targetDir);
}

export default {
  loadConfig,
  saveConfig,
  displayConfig,
  editConfigInteractive,
  setConfigValue,
  openConfigInEditor,
  runConfig,
  getConfigPath,
  DEFAULT_CONFIG,
};

