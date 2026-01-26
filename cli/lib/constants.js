/**
 * Shared constants for Sigma CLI
 */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolve the source root directory with validation
 * This handles the case where CLI runs from installed package vs local dev
 * @returns {string} - Resolved root directory path
 */
function resolveSourceRoot() {
  // Standard relative path (works for local dev)
  const localRoot = path.resolve(__dirname, "../..");

  // Key directories that must exist for a valid source installation
  // These match the MODULES structure: steps + module directories
  const requiredDirs = ["steps", "audit", "dev", "ops"];

  // Check if key directories exist at the expected location
  const existingDirs = requiredDirs.filter((dir) =>
    fs.existsSync(path.join(localRoot, dir))
  );

  // If most required directories exist, use this location
  if (existingDirs.length >= 2) {
    return localRoot;
  }

  // Return local anyway - the build functions will handle the error
  // This allows for better error messages at build time
  return localRoot;
}

// Root directory of Sigma-Protocol
export const ROOT_DIR = resolveSourceRoot();

/**
 * Check if source files are available at ROOT_DIR
 * @returns {{ valid: boolean, missingDirs: string[], rootDir: string }}
 */
export function checkSourceAvailability() {
  // Check for the key module directories that the build functions expect
  const requiredDirs = ["steps", "audit", "dev", "ops"];
  const missingDirs = requiredDirs.filter(
    (dir) => !fs.existsSync(path.join(ROOT_DIR, dir))
  );

  return {
    valid: missingDirs.length === 0,
    missingDirs,
    rootDir: ROOT_DIR,
  };
}

// Platform configurations
export const PLATFORMS = {
  cursor: {
    name: "Cursor",
    description: "@commands in Cursor IDE",
    outputDir: ".cursor/commands",
    rulesFile: ".cursorrules",
    rulesDir: ".cursor/rules",
  },
  "claude-code": {
    name: "Claude Code",
    description: "/commands in Claude Code CLI",
    outputDir: ".claude",
    agentsDir: ".claude/agents",
    skillsDir: ".claude/skills",
    hooksDir: ".claude/hooks",
    commandsDir: ".claude/commands",
    orchestrator: "CLAUDE.md",
  },
  opencode: {
    name: "OpenCode",
    description: "/commands + agents in OpenCode",
    outputDir: ".opencode",
    commandsDir: ".opencode/command",
    agentsDir: ".opencode/agent",
    toolsDir: ".opencode/tools",
    orchestrator: "AGENTS.md",
    configFile: "opencode.json",
  },
};

// Command aliases for consistent naming
// Maps alternative names to canonical command names
export const COMMAND_ALIASES = {
  // Numeric aliases for steps with decimal notation
  "step-02": "step-1.5-offer-architecture",
  "step-1.5": "step-1.5-offer-architecture",
  "step-5a": "step-5-wireframe-prototypes",
  "step-5-json": "step-5b-prd-to-json",
  "step-11-json": "step-11a-prd-to-json",
  "step-11-swarm": "step-11b-prd-swarm",

  // Short aliases for common commands
  "ideation": "step-1-ideation",
  "architecture": "step-2-architecture",
  "ux": "step-3-ux-design",
  "flows": "step-4-flow-tree",
  "wireframes": "step-5-wireframe-prototypes",
  "design": "step-6-design-system",
  "states": "step-7-interface-states",
  "technical": "step-8-technical-spec",
  "landing": "step-9-landing-page",
  "features": "step-10-feature-breakdown",
  "prd": "step-11-prd-generation",
  "context": "step-12-context-engine",
  "skillpack": "step-13-skillpack-generator",

  // Audit aliases
  "security": "security-audit",
  "a11y": "accessibility-audit",
  "perf": "performance-check",
  "gap": "gap-analysis",
  "debt": "tech-debt-audit",

  // Ops aliases
  "cleanup": "maid",
  "health": "doctor",
  "continue": "continue",
  "orchestration": "orchestrate",
};

// Resolve alias to canonical command name
export function resolveAlias(input) {
  const normalized = input.toLowerCase().replace(/^[@/]/, "");
  return COMMAND_ALIASES[normalized] || normalized;
}

// Module configurations
export const MODULES = {
  steps: {
    name: "Sigma Steps",
    description: "Core 13-step product development workflow",
    required: true,
  },
  audit: {
    name: "Audit Commands",
    description: "Security, accessibility, and quality audits",
    required: false,
  },
  dev: {
    name: "Dev Commands",
    description: "Development workflow (implement-prd, plan)",
    required: false,
  },
  ops: {
    name: "Ops Commands",
    description: "Operations (pr-review, sprint-plan, status)",
    required: false,
  },
  deploy: {
    name: "Deploy Commands",
    description: "Deployment (ship-check, ship-prod)",
    required: false,
  },
  generators: {
    name: "Generator Commands",
    description: "Code generators (scaffold, test-gen)",
    required: false,
  },
  marketing: {
    name: "Marketing Commands",
    description: "Marketing workflow (launch playbook)",
    required: false,
  },
};
