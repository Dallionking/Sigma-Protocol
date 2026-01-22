/**
 * Environment loading utilities for Sigma CLI
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";

/**
 * Load environment variables from a .env file
 * @param {string} filepath - Path to .env file
 */
export function loadEnvFile(filepath) {
  if (!existsSync(filepath)) return;

  try {
    const content = readFileSync(filepath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        // Only set if not already set (don't override shell env vars)
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Load .env files from current directory up to 5 levels
 */
export function loadEnvFiles() {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    loadEnvFile(resolve(dir, ".env"));
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}
