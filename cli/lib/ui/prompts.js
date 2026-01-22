/**
 * Interactive prompts for Sigma CLI
 */

import inquirer from "inquirer";
import chalk from "chalk";
import { PLATFORMS, MODULES } from "../constants.js";

/**
 * Interactive platform selection
 * @param {object} existing - Object of existing platform installations
 * @returns {string[]|"__back__"} - Selected platforms or back indicator
 */
export async function selectPlatforms(existing) {
  const platformChoices = Object.entries(PLATFORMS).map(([id, config]) => ({
    name: `${config.name} - ${config.description}${existing[id] ? chalk.yellow(" (installed)") : ""}`,
    value: id,
    checked: false, // Don't pre-check anything - let user choose
  }));

  const choices = [
    new inquirer.Separator("─── Select platforms (space to toggle, enter to confirm) ───"),
    ...platformChoices,
    new inquirer.Separator("─── Press 'a' to toggle all ───"),
    new inquirer.Separator(""),
    { name: chalk.gray("← Back to main menu"), value: "__back__" },
  ];

  const { platforms } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "platforms",
      message: "Which platforms do you want to install?",
      choices,
      validate: (answer) => {
        // Allow back option without other selections
        if (answer.includes("__back__")) {
          return true;
        }
        if (answer.length < 1) {
          return "You must select at least one platform. Use SPACE to select.";
        }
        return true;
      },
    },
  ]);

  // Check if user wants to go back
  if (platforms.includes("__back__")) {
    return "__back__";
  }

  // Filter out the back option if somehow selected with others
  return platforms.filter(p => p !== "__back__");
}

/**
 * Interactive module selection
 * @returns {string[]|"__back__"} - Selected modules or back indicator
 */
export async function selectModules() {
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

  // Ensure required modules are always included
  const requiredModules = Object.entries(MODULES)
    .filter(([, config]) => config.required)
    .map(([id]) => id);

  const selectedModules = [...new Set([...requiredModules, ...modules.filter(m => m !== "__back__")])];

  return selectedModules;
}

/**
 * Confirm action prompt
 * @param {string} message - Confirmation message
 * @param {boolean} defaultValue - Default value
 * @returns {boolean} - User's response
 */
export async function confirmAction(message, defaultValue = true) {
  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message,
      default: defaultValue,
    },
  ]);
  return confirmed;
}

/**
 * Select from a list
 * @param {string} message - Selection message
 * @param {Array} choices - Array of choices
 * @returns {any} - Selected value
 */
export async function selectFromList(message, choices) {
  const { selection } = await inquirer.prompt([
    {
      type: "list",
      name: "selection",
      message,
      choices,
    },
  ]);
  return selection;
}

/**
 * Get text input
 * @param {string} message - Input message
 * @param {string} defaultValue - Default value
 * @returns {string} - User input
 */
export async function getInput(message, defaultValue = "") {
  const { input } = await inquirer.prompt([
    {
      type: "input",
      name: "input",
      message,
      default: defaultValue,
    },
  ]);
  return input;
}
