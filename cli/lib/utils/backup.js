/**
 * Backup and restore utilities for Sigma CLI
 */

import fs from "fs-extra";
import chalk from "chalk";

/**
 * Backup a file before modification
 * @param {string} filePath - Path to file to backup
 * @returns {string|null} - Backup path or null if no backup needed
 */
export async function backupFile(filePath) {
  if (!(await fs.pathExists(filePath))) {
    return null; // No backup needed if file doesn't exist
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${filePath}.backup.${timestamp}`;

  try {
    await fs.copy(filePath, backupPath);
    return backupPath;
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Could not create backup: ${error.message}`));
    return null;
  }
}

/**
 * Restore from backup on failure
 * @param {string} originalPath - Original file path
 * @param {string} backupPath - Backup file path
 * @returns {boolean} - Success status
 */
export async function restoreFromBackup(originalPath, backupPath) {
  if (!backupPath || !(await fs.pathExists(backupPath))) {
    return false;
  }

  try {
    await fs.copy(backupPath, originalPath, { overwrite: true });
    await fs.remove(backupPath);
    return true;
  } catch (error) {
    console.error(chalk.red(`Failed to restore backup: ${error.message}`));
    console.log(chalk.yellow(`Backup file preserved at: ${backupPath}`));
    return false;
  }
}

/**
 * Clean up backup after successful operation
 * @param {string} backupPath - Backup file path
 */
export async function cleanupBackup(backupPath) {
  if (backupPath && (await fs.pathExists(backupPath))) {
    try {
      await fs.remove(backupPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}
