/**
 * File system utilities for Sigma CLI
 */

import fs from "fs-extra";
import path from "path";

/**
 * Make shell scripts executable on Unix systems
 * @param {string} dir - Directory to process
 */
export async function makeScriptsExecutable(dir) {
  if (process.platform === "win32") {
    return; // Windows doesn't use chmod
  }

  try {
    if (!(await fs.pathExists(dir))) return;

    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        await makeScriptsExecutable(filePath);
      } else if (file.endsWith(".sh") || file.endsWith(".bash")) {
        // Make shell scripts executable (755 = rwxr-xr-x)
        await fs.chmod(filePath, 0o755);
      }
    }
  } catch (error) {
    // Silently ignore permission errors on some systems
    console.warn(`Warning: Could not set execute permission: ${error.message}`);
  }
}

/**
 * Count files by extension in a directory
 * @param {string} dirPath - Directory to count files in
 * @param {string} ext - File extension (e.g., ".js", ".md")
 * @returns {number} - Count of matching files
 */
export async function countFilesByExt(dirPath, ext) {
  let count = 0;

  try {
    if (!(await fs.pathExists(dirPath))) return 0;

    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        count += await countFilesByExt(path.join(dirPath, item.name), ext);
      } else if (item.name.endsWith(ext)) {
        count++;
      }
    }
  } catch {
    // Ignore errors
  }

  return count;
}

/**
 * Find all skill directories in a base directory
 * @param {string} baseDir - Base directory to search
 * @returns {string[]} - Array of skill directory paths
 */
export async function findSkillDirs(baseDir) {
  const skillDirs = [];

  try {
    if (!(await fs.pathExists(baseDir))) return [];

    const items = await fs.readdir(baseDir, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory() && !item.name.startsWith(".")) {
        const skillPath = path.join(baseDir, item.name);
        // Check if it looks like a skill directory (has SKILL.md or similar)
        const skillMd = path.join(skillPath, "SKILL.md");
        if (await fs.pathExists(skillMd)) {
          skillDirs.push(skillPath);
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return skillDirs;
}
