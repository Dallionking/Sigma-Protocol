/**
 * File Writer Utilities
 *
 * Handles writing generated files to disk with conflict detection
 * and directory creation.
 *
 * @module generators/utils/file-writer
 */

import { mkdir, writeFile, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import type { GeneratedFile, GeneratorOptions } from "../types.js";

/**
 * Result of writing a file
 */
export interface WriteResult {
  path: string;
  status: "written" | "skipped" | "error";
  reason?: string;
}

/**
 * Check if a file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if content matches existing file
 */
export async function contentMatches(
  path: string,
  content: string
): Promise<boolean> {
  try {
    const existing = await readFile(path, "utf-8");
    return existing === content;
  } catch {
    return false;
  }
}

/**
 * Ensure a directory exists
 */
export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

/**
 * Write a single generated file
 */
export async function writeGeneratedFile(
  file: GeneratedFile,
  baseDir: string,
  options: Pick<GeneratorOptions, "overwrite" | "dryRun" | "verbose">
): Promise<WriteResult> {
  const fullPath = resolve(baseDir, file.path);

  if (options.dryRun) {
    if (options.verbose) {
      console.log(`[dry-run] Would write: ${fullPath}`);
    }
    return { path: fullPath, status: "written", reason: "dry-run" };
  }

  try {
    const exists = await fileExists(fullPath);

    if (exists && !options.overwrite) {
      // Check if content is identical
      const matches = await contentMatches(fullPath, file.content);
      if (matches) {
        if (options.verbose) {
          console.log(`[skip] Identical: ${fullPath}`);
        }
        return { path: fullPath, status: "skipped", reason: "identical" };
      }

      if (options.verbose) {
        console.log(`[skip] Exists (use --overwrite): ${fullPath}`);
      }
      return { path: fullPath, status: "skipped", reason: "exists" };
    }

    // Ensure directory exists
    await ensureDir(dirname(fullPath));

    // Write the file
    await writeFile(fullPath, file.content, "utf-8");

    if (options.verbose) {
      console.log(`[${exists ? "update" : "create"}] ${fullPath}`);
    }

    return {
      path: fullPath,
      status: "written",
      reason: exists ? "updated" : "created",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (options.verbose) {
      console.error(`[error] ${fullPath}: ${message}`);
    }
    return { path: fullPath, status: "error", reason: message };
  }
}

/**
 * Write multiple generated files
 */
export async function writeGeneratedFiles(
  files: GeneratedFile[],
  baseDir: string,
  options: Pick<GeneratorOptions, "overwrite" | "dryRun" | "verbose">
): Promise<WriteResult[]> {
  const results: WriteResult[] = [];

  for (const file of files) {
    const result = await writeGeneratedFile(file, baseDir, options);
    results.push(result);
  }

  return results;
}

/**
 * Generate a summary of write results
 */
export function summarizeResults(results: WriteResult[]): {
  written: number;
  skipped: number;
  errors: number;
} {
  return {
    written: results.filter((r) => r.status === "written").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    errors: results.filter((r) => r.status === "error").length,
  };
}

/**
 * Get the platform output directory
 */
export function getPlatformOutputDir(
  baseDir: string,
  platformRoot: string
): string {
  return join(baseDir, platformRoot);
}
