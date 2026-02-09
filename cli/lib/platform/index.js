/**
 * Platform builder exports for Sigma CLI
 */

// Cursor platform
export {
  buildCursor,
  transformToCursorRule,
  getCursorSkillMetadata,
} from "./cursor.js";

// Claude Code platform
export {
  buildClaudeCode,
  transformToClaudeCodeAgent,
  generateClaudeCodeCommand,
  generateClaudeMd,
} from "./claude-code.js";

// OpenCode platform
export {
  buildOpenCode,
  transformToOpenCodeCommand,
  transformToOpenCodeAgent,
  generateAgentsMd,
  generateOpenCodeConfig,
} from "./opencode.js";

// Codex platform
export { buildCodex, generateCodexAgentsMd } from "./codex.js";
