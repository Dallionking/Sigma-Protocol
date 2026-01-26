/**
 * Generators Module
 *
 * Static file generators for platform-specific plugins.
 * Generates Claude Code, OpenCode, and Factory Droid skills/commands
 * from a single source definition.
 *
 * @module generators
 */

// Core types
export * from "./types.js";

// Base generator classes
export {
  BaseGenerator,
  BaseSkillGenerator,
  BaseCommandGenerator,
} from "./base-generator.js";

// Utilities
export * from "./utils/index.js";

// Claude Code generators
export {
  ClaudeCodeSkillGenerator,
  ClaudeCodeCommandGenerator,
  createClaudeCodeSkillGenerator,
  createClaudeCodeCommandGenerator,
} from "./claude-code/index.js";

// OpenCode generators
export {
  OpenCodeSkillGenerator,
  OpenCodeCommandGenerator,
  createOpenCodeSkillGenerator,
  createOpenCodeCommandGenerator,
} from "./opencode/index.js";

// Factory Droid generators
export {
  FactoryDroidSkillGenerator,
  FactoryDroidCommandGenerator,
  createFactoryDroidSkillGenerator,
  createFactoryDroidCommandGenerator,
} from "./factory-droid/index.js";

// CLI
export { main as runCli } from "./cli/index.js";
