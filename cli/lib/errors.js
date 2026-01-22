#!/usr/bin/env node

/**
 * Sigma Protocol Error Handling Utilities
 *
 * Provides contextual error messages with:
 * - Clear error description
 * - Possible causes
 * - Suggested fixes
 * - Help links
 */

import chalk from "chalk";
import boxen from "boxen";

// Common error types and their handling patterns
const ERROR_PATTERNS = {
  EACCES: {
    title: "Permission Denied",
    causes: [
      "Directory or file is read-only",
      "Insufficient permissions to write",
      "File is owned by another user",
    ],
    suggestions: [
      "Try running with elevated permissions (not recommended)",
      "Check file ownership with `ls -la`",
      "Change permissions with `chmod +w <path>`",
    ],
  },
  ENOENT: {
    title: "File or Directory Not Found",
    causes: [
      "Path does not exist",
      "Parent directory is missing",
      "Typo in the file path",
    ],
    suggestions: [
      "Verify the path exists",
      "Create parent directories first",
      "Check for typos in the path",
    ],
  },
  EEXIST: {
    title: "File Already Exists",
    causes: [
      "Attempting to create a file that already exists",
      "Previous installation was not cleaned up",
    ],
    suggestions: [
      "Use --force flag to overwrite",
      "Remove existing file first",
      "Run `sigma maid` to clean up",
    ],
  },
  ENOSPC: {
    title: "No Space Left on Device",
    causes: [
      "Disk is full",
      "Quota exceeded",
    ],
    suggestions: [
      "Free up disk space",
      "Check disk usage with `df -h`",
      "Remove old backup files",
    ],
  },
  EISDIR: {
    title: "Is a Directory",
    causes: [
      "Expected a file but found a directory",
      "Path conflict between file and directory",
    ],
    suggestions: [
      "Remove the conflicting directory",
      "Use a different path",
    ],
  },
  ENOTDIR: {
    title: "Not a Directory",
    causes: [
      "Expected a directory but found a file",
      "Parent path is a file, not a directory",
    ],
    suggestions: [
      "Remove the conflicting file",
      "Create the proper directory structure",
    ],
  },
  NETWORK: {
    title: "Network Error",
    causes: [
      "No internet connection",
      "DNS resolution failed",
      "Server is unreachable",
    ],
    suggestions: [
      "Check your internet connection",
      "Try again later",
      "Check if the service is down",
    ],
  },
  JSON_PARSE: {
    title: "Invalid JSON",
    causes: [
      "Malformed JSON syntax",
      "Corrupted configuration file",
      "Unexpected characters in file",
    ],
    suggestions: [
      "Validate JSON with a linter",
      "Restore from backup",
      "Delete and regenerate the file",
    ],
  },
};

/**
 * Format an error with context and suggestions
 * @param {Error} error - The original error
 * @param {object} options - Additional context
 * @returns {string} Formatted error message
 */
export function formatError(error, options = {}) {
  const {
    operation = "operation",
    file = null,
    helpUrl = "https://github.com/sigma-protocol/cli/issues",
  } = options;

  // Determine error pattern
  let pattern = null;
  if (error.code && ERROR_PATTERNS[error.code]) {
    pattern = ERROR_PATTERNS[error.code];
  } else if (error.message?.includes("JSON")) {
    pattern = ERROR_PATTERNS.JSON_PARSE;
  } else if (error.message?.includes("network") || error.message?.includes("ENOTFOUND")) {
    pattern = ERROR_PATTERNS.NETWORK;
  }

  // Build error message parts
  const parts = [];

  // Header
  parts.push(chalk.red.bold(`❌ ${pattern?.title || "Error"} during ${operation}`));
  parts.push("");

  // Error message
  parts.push(chalk.white(`Error: ${error.message}`));

  // File path if relevant
  if (file || error.path) {
    parts.push(chalk.gray(`File: ${file || error.path}`));
  }

  // Error code if available
  if (error.code) {
    parts.push(chalk.gray(`Code: ${error.code}`));
  }

  parts.push("");

  // Possible causes
  if (pattern?.causes?.length > 0) {
    parts.push(chalk.yellow.bold("Possible causes:"));
    pattern.causes.forEach((cause) => {
      parts.push(chalk.yellow(`  • ${cause}`));
    });
    parts.push("");
  }

  // Suggestions
  if (pattern?.suggestions?.length > 0) {
    parts.push(chalk.cyan.bold("Try:"));
    pattern.suggestions.forEach((suggestion) => {
      parts.push(chalk.cyan(`  ${suggestion}`));
    });
    parts.push("");
  }

  // Help link
  parts.push(chalk.gray(`Need help? ${helpUrl}`));

  return boxen(parts.join("\n"), {
    padding: 1,
    margin: 1,
    borderStyle: "round",
    borderColor: "red",
  });
}

/**
 * Log an error with context (to console)
 * @param {Error} error - The original error
 * @param {object} options - Additional context
 */
export function logError(error, options = {}) {
  console.error(formatError(error, options));
}

/**
 * Create a custom error with additional context
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {object} details - Additional details
 * @returns {Error} Enhanced error object
 */
export function createError(message, code = "SIGMA_ERROR", details = {}) {
  const error = new Error(message);
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Wrap an async function with error handling
 * @param {Function} fn - Async function to wrap
 * @param {object} options - Error context options
 * @returns {Function} Wrapped function
 */
export function withErrorHandling(fn, options = {}) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, options);
      throw error;
    }
  };
}

/**
 * Parse common error types and return user-friendly messages
 * @param {Error} error - The error to parse
 * @returns {object} Parsed error info
 */
export function parseError(error) {
  const info = {
    title: "Unknown Error",
    message: error.message,
    code: error.code || "UNKNOWN",
    recoverable: true,
    suggestions: [],
  };

  if (error.code && ERROR_PATTERNS[error.code]) {
    const pattern = ERROR_PATTERNS[error.code];
    info.title = pattern.title;
    info.suggestions = pattern.suggestions;
    info.recoverable = error.code !== "ENOSPC"; // Out of space is usually not immediately recoverable
  }

  return info;
}

export default {
  formatError,
  logError,
  createError,
  withErrorHandling,
  parseError,
  ERROR_PATTERNS,
};
