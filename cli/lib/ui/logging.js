/**
 * Logging utilities for Sigma CLI
 */

import chalk from "chalk";

// Global state for debug/verbose modes
export const debugState = {
  debug: false,
  verbose: false,
};

/**
 * Debug logging - only prints when --debug flag is set
 * @param {...any} args - Arguments to log
 */
export function debugLog(...args) {
  if (debugState.debug) {
    console.log(chalk.gray("[DEBUG]"), ...args);
  }
}

/**
 * Verbose logging - only prints when --verbose or --debug flag is set
 * @param {...any} args - Arguments to log
 */
export function verboseLog(...args) {
  if (debugState.verbose || debugState.debug) {
    console.log(chalk.gray("[INFO]"), ...args);
  }
}

/**
 * Info logging - always prints
 * @param {...any} args - Arguments to log
 */
export function infoLog(...args) {
  console.log(chalk.blue("[INFO]"), ...args);
}

/**
 * Success logging
 * @param {...any} args - Arguments to log
 */
export function successLog(...args) {
  console.log(chalk.green("[SUCCESS]"), ...args);
}

/**
 * Warning logging
 * @param {...any} args - Arguments to log
 */
export function warnLog(...args) {
  console.log(chalk.yellow("[WARN]"), ...args);
}

/**
 * Error logging
 * @param {...any} args - Arguments to log
 */
export function errorLog(...args) {
  console.error(chalk.red("[ERROR]"), ...args);
}

/**
 * Set up global options processing
 * Call this early in the CLI startup
 */
export function processGlobalOptions() {
  const args = process.argv;

  // Check for debug flag
  if (args.includes("--debug") || args.includes("-D")) {
    debugState.debug = true;
    debugState.verbose = true; // Debug implies verbose
    debugLog("Debug mode enabled");
    debugLog("Node version:", process.version);
    debugLog("Platform:", process.platform);
    debugLog("Working directory:", process.cwd());
    debugLog("Arguments:", args.slice(2).join(" "));
  }

  // Check for verbose flag
  if (args.includes("--verbose") || args.includes("-v")) {
    debugState.verbose = true;
    verboseLog("Verbose mode enabled");
  }
}

/**
 * Enable debug mode programmatically
 */
export function enableDebug() {
  debugState.debug = true;
  debugState.verbose = true;
}

/**
 * Enable verbose mode programmatically
 */
export function enableVerbose() {
  debugState.verbose = true;
}

/**
 * Check if debug mode is enabled
 * @returns {boolean}
 */
export function isDebug() {
  return debugState.debug;
}

/**
 * Check if verbose mode is enabled
 * @returns {boolean}
 */
export function isVerbose() {
  return debugState.verbose || debugState.debug;
}
