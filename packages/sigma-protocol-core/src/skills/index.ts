/**
 * Sigma Protocol Skills Module
 * Skill loading, resolution, and management
 * @module @sigma-protocol/core/skills
 */

export type {
  SkillMetadata,
  Skill,
  SkillMatch,
  SkillResolutionOptions,
  SkillRegistryStats,
} from "./types.js";

export { SkillResolver, createSkillResolver } from "./resolver.js";
