/**
 * Detection utilities for Sigma CLI
 */

import fs from "fs-extra";
import path from "path";
import { PLATFORMS } from "../constants.js";

/**
 * Detect existing platform installations in target directory
 * @param {string} targetDir - Target directory to check
 * @returns {object} - { [platform]: boolean }
 */
export async function detectInstallations(targetDir) {
  const installations = {};

  for (const [platform, config] of Object.entries(PLATFORMS)) {
    const checkPath = path.join(targetDir, config.outputDir);
    installations[platform] = await fs.pathExists(checkPath);
  }

  return installations;
}

/**
 * Detect missing installed assets in target project
 * @param {string} targetDir - Project root
 * @returns {string[]} - Missing asset paths (relative)
 */
export async function detectMissingAssets(targetDir) {
  const missing = [];
  const checks = [
    { label: ".cursor/rules", path: path.join(targetDir, ".cursor", "rules") },
    { label: ".claude/commands", path: path.join(targetDir, ".claude", "commands") },
    { label: ".claude/skills", path: path.join(targetDir, ".claude", "skills") },
    { label: ".opencode/command", path: path.join(targetDir, ".opencode", "command") },
    { label: ".opencode/agent", path: path.join(targetDir, ".opencode", "agent") },
    { label: ".opencode/skill", path: path.join(targetDir, ".opencode", "skill") },
  ];

  for (const check of checks) {
    if (!(await fs.pathExists(check.path))) {
      missing.push(check.label);
    }
  }

  return missing;
}

/**
 * Detect stream count in target directory (for orchestration)
 * @param {string} targetDir - Target directory
 * @returns {object} - { count: number, streams: string[] }
 */
export async function detectStreamCount(targetDir) {
  const streams = [];

  // Check for numbered stream directories
  const items = await fs.readdir(targetDir);

  for (const item of items) {
    // Match patterns like: stream-1, stream-a, StreamA, etc.
    if (/^stream[-_]?[a-z0-9]+$/i.test(item)) {
      const itemPath = path.join(targetDir, item);
      const stat = await fs.stat(itemPath);
      if (stat.isDirectory()) {
        streams.push(item);
      }
    }
  }

  // Also check for .sigma/orchestration/streams directory
  const sigmaStreams = path.join(targetDir, ".sigma", "orchestration", "streams");
  if (await fs.pathExists(sigmaStreams)) {
    const streamFiles = await fs.readdir(sigmaStreams);
    for (const file of streamFiles) {
      if (file.endsWith(".json")) {
        const streamName = file.replace(".json", "");
        if (!streams.includes(streamName)) {
          streams.push(streamName);
        }
      }
    }
  }

  return {
    count: streams.length,
    streams: streams.sort(),
  };
}

/**
 * Auto-detect platform from existing configuration
 * @param {string} targetDir - Target directory
 * @returns {string|null} - Detected platform or null
 */
export async function autoDetectPlatform(targetDir) {
  // Check for Claude Code first (most common)
  const claudeDir = path.join(targetDir, ".claude");
  const claudeMd = path.join(targetDir, "CLAUDE.md");
  if ((await fs.pathExists(claudeDir)) || (await fs.pathExists(claudeMd))) {
    return "claude-code";
  }

  // Check for Cursor
  const cursorDir = path.join(targetDir, ".cursor");
  const cursorRules = path.join(targetDir, ".cursorrules");
  if ((await fs.pathExists(cursorDir)) || (await fs.pathExists(cursorRules))) {
    return "cursor";
  }

  // Check for OpenCode
  const opencodeDir = path.join(targetDir, ".opencode");
  const opencodeJson = path.join(targetDir, "opencode.json");
  if ((await fs.pathExists(opencodeDir)) || (await fs.pathExists(opencodeJson))) {
    return "opencode";
  }

  return null;
}

/**
 * Detect PRD stories for orchestration
 * @param {string} targetDir - Target directory
 * @returns {object[]} - Array of PRD story objects
 */
export async function detectPRDStories(targetDir) {
  const stories = [];

  // Check for Ralph backlog files
  const ralphDir = path.join(targetDir, "docs", "ralph");
  if (await fs.pathExists(ralphDir)) {
    const domains = await fs.readdir(ralphDir);

    for (const domain of domains) {
      const backlogPath = path.join(ralphDir, domain, "prd-backlog.json");
      if (await fs.pathExists(backlogPath)) {
        try {
          const backlog = await fs.readJson(backlogPath);
          if (backlog.stories && Array.isArray(backlog.stories)) {
            for (const story of backlog.stories) {
              stories.push({
                ...story,
                domain,
                backlogPath,
              });
            }
          }
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  }

  // Check for .sigma/prd-map.json
  const prdMapPath = path.join(targetDir, ".sigma", "prd-map.json");
  if (await fs.pathExists(prdMapPath)) {
    try {
      const prdMap = await fs.readJson(prdMapPath);
      if (prdMap.stories && Array.isArray(prdMap.stories)) {
        for (const story of prdMap.stories) {
          // Avoid duplicates
          if (!stories.find(s => s.id === story.id)) {
            stories.push(story);
          }
        }
      }
    } catch {
      // Ignore invalid JSON
    }
  }

  return stories;
}
