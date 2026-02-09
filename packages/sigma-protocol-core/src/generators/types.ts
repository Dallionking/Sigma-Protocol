/**
 * Generator Types for Native Plugin Generation
 *
 * These interfaces define the contract for generating platform-specific
 * skill and command files from a single source definition.
 *
 * @module generators/types
 */

import type { ModelId, ModelProvider } from "../types/agent.js";

// Re-export for convenience
export type { ModelId, ModelProvider };

// ============================================================================
// MODEL PREFERENCES (Always Top-Tier)
// ============================================================================

/**
 * Top-tier model preferences by provider.
 * Never subsidize - always use the best available model.
 */
export const TOP_TIER_MODELS: Record<ModelProvider, ModelId> = {
  anthropic: "claude-opus-4-5-20251101",  // Always Opus 4.5
  openai: "gpt-5.3-codex",                  // Always GPT 5.3 Codex
  google: "gemini-3",                      // Always Gemini 3
  local: "local",                          // Local model
} as const;

// ============================================================================
// MCP/TOOL PREFERENCES (Research & Execution)
// ============================================================================

/**
 * Preferred MCP tools for research and execution.
 * These enable agents to research when stuck and execute tasks.
 */
export const PREFERRED_MCPS = [
  // Research tools (prioritized)
  "mcp__exa__web_search_exa",
  "mcp__exa__get_code_context_exa",
  "mcp__exa__deep_researcher_start",
  "mcp__mcp-server-firecrawl__firecrawl_scrape",
  "mcp__mcp-server-firecrawl__firecrawl_search",
  "mcp__perplexity-ask__perplexity_ask",
  "mcp__context7__resolve-library-id",
  "mcp__context7__query-docs",
  "mcp__ref__ref_search_documentation",
  "mcp__ref__ref_read_url",
] as const;

/**
 * Core tools available on all platforms
 */
export const CORE_TOOLS = [
  "Read",
  "Write",
  "Edit",
  "Bash",
  "Glob",
  "Grep",
  "WebFetch",
  "WebSearch",
  "Task",
] as const;

export type McpTool = typeof PREFERRED_MCPS[number];
export type CoreTool = typeof CORE_TOOLS[number];
export type ToolName = McpTool | CoreTool | string;

// ============================================================================
// PLATFORM DEFINITIONS
// ============================================================================

/**
 * Supported platforms for plugin generation
 */
export type Platform = "claude-code" | "opencode" | "factory-droid" | "codex";

/**
 * Platform-specific configuration
 */
export interface PlatformConfig {
  /** Platform identifier */
  platform: Platform;

  /** Root output directory (e.g., ".claude", ".opencode", ".factory") */
  outputRoot: string;

  /** Skills subdirectory */
  skillsDir: string;

  /** Commands subdirectory */
  commandsDir: string;

  /** File naming pattern */
  filePattern: "flat" | "folder";  // flat = skill.md, folder = skill/SKILL.md

  /** Default model for this platform */
  defaultModel: ModelId;

  /** Frontmatter field mappings (source field → platform field) */
  fieldMappings: Record<string, string>;
}

/**
 * Pre-configured platform settings
 */
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  "claude-code": {
    platform: "claude-code",
    outputRoot: ".claude",
    skillsDir: "skills",
    commandsDir: "commands",
    filePattern: "flat",
    defaultModel: TOP_TIER_MODELS.anthropic,
    fieldMappings: {
      id: "name",
      name: "name",
      description: "description",
      triggers: "triggers",
      version: "version",
      source: "source",
    },
  },
  "opencode": {
    platform: "opencode",
    outputRoot: ".opencode",
    skillsDir: "skills",
    commandsDir: "commands",
    filePattern: "flat",
    defaultModel: TOP_TIER_MODELS.anthropic,
    fieldMappings: {
      id: "name",
      description: "description",
      triggers: "triggers",
      allowedTools: "allowed-tools",
    },
  },
  "factory-droid": {
    platform: "factory-droid",
    outputRoot: ".factory",
    skillsDir: "skills",
    commandsDir: "commands",
    filePattern: "folder",  // skill-name/SKILL.md
    defaultModel: TOP_TIER_MODELS.anthropic,
    fieldMappings: {
      id: "name",
      name: "name",
      description: "description",
      triggers: "triggers",
      model: "model",
      capabilities: "capabilities",
    },
  },
  "codex": {
    platform: "codex",
    outputRoot: ".codex",
    skillsDir: "skills",
    commandsDir: "skills",
    filePattern: "folder",
    defaultModel: TOP_TIER_MODELS.openai,
    fieldMappings: {
      id: "name",
      name: "name",
      description: "description",
      triggers: "triggers",
      model: "model",
      version: "version",
      source: "source",
    },
  },
};

// ============================================================================
// SKILL DEFINITIONS
// ============================================================================

/**
 * Source skill definition (platform-agnostic)
 */
export interface SkillDefinition {
  /** Unique identifier (kebab-case) */
  id: string;

  /** Display name */
  name: string;

  /** Short description (1-2 sentences) */
  description: string;

  /** Version string (semver) */
  version: string;

  /** Attribution source if external */
  source?: string;

  /** Trigger phrases/patterns that activate this skill */
  triggers: string[];

  /** Tools this skill can use */
  allowedTools?: ToolName[];

  /** MCPs this skill should prefer */
  preferredMcps?: McpTool[];

  /** Preferred model (defaults to platform default) */
  model?: ModelId;

  /** Skill body content (markdown) */
  content: string;

  /** Step association (e.g., "step-1", "step-2") */
  stepAssociation?: string;

  /** Category for organization */
  category?: SkillCategory;
}

export type SkillCategory =
  | "workflow"      // SSS workflow steps
  | "research"      // Research and analysis
  | "coding"        // Code generation/editing
  | "testing"       // Testing and QA
  | "design"        // UI/UX design
  | "marketing"     // Marketing and copy
  | "ops"           // DevOps and deployment
  | "utility";      // General utilities

// ============================================================================
// COMMAND DEFINITIONS
// ============================================================================

/**
 * Source command definition (platform-agnostic)
 */
export interface CommandDefinition {
  /** Command name (without leading slash) */
  name: string;

  /** Short description */
  description: string;

  /** Tools this command can use */
  allowedTools: ToolName[];

  /** Agent to invoke (uses @agent-name syntax) */
  agentRef?: string;

  /** Command body content (markdown) */
  content: string;

  /** Usage example */
  usage?: string;

  /** Arguments accepted */
  arguments?: CommandArgument[];
}

export interface CommandArgument {
  name: string;
  description: string;
  required: boolean;
  type: "string" | "number" | "boolean" | "file" | "path";
  default?: string | number | boolean;
}

// ============================================================================
// GENERATOR INTERFACES
// ============================================================================

/**
 * Output from a generator
 */
export interface GeneratedFile {
  /** Relative path from output root */
  path: string;

  /** File content */
  content: string;

  /** Whether this file already exists (for conflict detection) */
  isUpdate?: boolean;
}

/**
 * Base generator interface
 */
export interface Generator<T extends SkillDefinition | CommandDefinition> {
  /** Platform this generator targets */
  readonly platform: Platform;

  /** Platform config */
  readonly config: PlatformConfig;

  /**
   * Generate a file from a definition
   */
  generate(definition: T): GeneratedFile;

  /**
   * Generate multiple files
   */
  generateAll(definitions: T[]): GeneratedFile[];

  /**
   * Get the output path for a definition
   */
  getOutputPath(definition: T): string;

  /**
   * Convert definition to YAML frontmatter
   */
  toFrontmatter(definition: T): string;
}

/**
 * Skill generator interface
 */
export interface SkillGenerator extends Generator<SkillDefinition> {
  /**
   * Inject standard MCP/tool preferences into skill
   */
  injectToolPreferences(skill: SkillDefinition): SkillDefinition;
}

/**
 * Command generator interface
 */
export interface CommandGenerator extends Generator<CommandDefinition> {
  /**
   * Generate agent reference syntax for platform
   */
  formatAgentRef(agentName: string): string;
}

// ============================================================================
// GENERATION OPTIONS
// ============================================================================

/**
 * Options for running generators
 */
export interface GeneratorOptions {
  /** Target platform(s) */
  platforms: Platform[];

  /** Output base directory (default: current directory) */
  outputDir?: string;

  /** Overwrite existing files */
  overwrite?: boolean;

  /** Dry run (don't write files) */
  dryRun?: boolean;

  /** Include research MCPs in all skills */
  includeResearchMcps?: boolean;

  /** Verbose output */
  verbose?: boolean;
}

/**
 * Result from running generators
 */
export interface GeneratorResult {
  platform: Platform;
  filesGenerated: number;
  filesSkipped: number;
  errors: GeneratorError[];
  files: GeneratedFile[];
}

export interface GeneratorError {
  definitionId: string;
  message: string;
  path?: string;
}

// ============================================================================
// REGISTRY TYPES
// ============================================================================

/**
 * Registry of all skills and commands to generate
 */
export interface PluginRegistry {
  skills: SkillDefinition[];
  commands: CommandDefinition[];
  version: string;
  lastUpdated: string;
}

/**
 * Load a registry from file
 */
export type RegistryLoader = (path: string) => Promise<PluginRegistry>;

/**
 * Write generated files to disk
 */
export type FileWriter = (files: GeneratedFile[], baseDir: string) => Promise<void>;
