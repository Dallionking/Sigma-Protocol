/**
 * Skill System Types
 * Type definitions for the skill resolution and loading system
 * @module @sigma-protocol/core/skills/types
 */

/**
 * Skill metadata parsed from frontmatter
 */
export interface SkillMetadata {
  /**
   * Index signature for dynamic properties
   */
  [key: string]: string | string[] | number | number[] | boolean | undefined;

  /**
   * Skill identifier (derived from filename)
   */
  id: string;

  /**
   * Display name
   */
  name: string;

  /**
   * Skill description
   */
  description: string;

  /**
   * Trigger patterns for auto-activation
   */
  triggers?: string[];

  /**
   * Glob patterns that trigger this skill
   */
  globs?: string[];

  /**
   * Steps this skill is relevant for
   */
  steps?: number[];

  /**
   * Skill category
   */
  category?: string;

  /**
   * Tags for discovery
   */
  tags?: string[];

  /**
   * Whether this is a foundation skill
   */
  foundation?: boolean;

  /**
   * Required tools for this skill
   */
  requiredTools?: string[];

  /**
   * Skill priority (higher = preferred)
   */
  priority?: number;

  /**
   * Whether skill is enabled
   */
  enabled?: boolean;
}

/**
 * Loaded skill with content
 */
export interface Skill {
  /**
   * Skill metadata
   */
  metadata: SkillMetadata;

  /**
   * Raw markdown content
   */
  content: string;

  /**
   * File path
   */
  path: string;

  /**
   * Last modified timestamp
   */
  lastModified?: Date;
}

/**
 * Skill match result
 */
export interface SkillMatch {
  /**
   * Matched skill
   */
  skill: Skill;

  /**
   * Match confidence (0-1)
   */
  confidence: number;

  /**
   * How the skill was matched
   */
  matchType: "trigger" | "glob" | "step" | "tag" | "semantic";

  /**
   * The pattern or value that matched
   */
  matchedOn: string;
}

/**
 * Skill resolution options
 */
export interface SkillResolutionOptions {
  /**
   * Maximum number of skills to return
   */
  limit?: number;

  /**
   * Minimum confidence threshold (0-1)
   */
  minConfidence?: number;

  /**
   * Filter by step number
   */
  forStep?: number;

  /**
   * Include disabled skills
   */
  includeDisabled?: boolean;

  /**
   * Filter by category
   */
  category?: string;

  /**
   * Filter by tags
   */
  tags?: string[];
}

/**
 * Skill registry statistics
 */
export interface SkillRegistryStats {
  /**
   * Total skill count
   */
  total: number;

  /**
   * Foundation skill count
   */
  foundation: number;

  /**
   * Skills by category
   */
  byCategory: Record<string, number>;

  /**
   * Skills by step
   */
  byStep: Record<number, number>;

  /**
   * Enabled vs disabled
   */
  enabled: number;
  disabled: number;
}
