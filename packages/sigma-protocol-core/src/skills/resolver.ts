/**
 * Skill Resolver
 * Loads, indexes, and matches skills based on triggers, globs, and context
 * @module @sigma-protocol/core/skills/resolver
 */

import type {
  Skill,
  SkillMetadata,
  SkillMatch,
  SkillResolutionOptions,
  SkillRegistryStats,
} from "./types.js";

/**
 * Parse skill frontmatter from markdown content
 */
function parseSkillFrontmatter(
  content: string,
  id: string
): { metadata: SkillMetadata; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    // No frontmatter, use defaults
    return {
      metadata: {
        id,
        name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: "",
        enabled: true,
      },
      body: content,
    };
  }

  const [, frontmatter, body] = match;
  const metadata: SkillMetadata = {
    id,
    name: id,
    description: "",
    enabled: true,
  };

  // Parse YAML-like frontmatter
  const lines = frontmatter.split("\n");
  let currentKey = "";
  let currentArray: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Array item
    if (trimmed.startsWith("- ")) {
      currentArray.push(trimmed.slice(2).trim().replace(/^["']|["']$/g, ""));
      continue;
    }

    // Save previous array if exists
    if (currentArray.length > 0 && currentKey) {
      (metadata as Record<string, unknown>)[currentKey] = currentArray;
      currentArray = [];
    }

    // Key-value pair
    const kvMatch = trimmed.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      currentKey = key;

      if (value) {
        // Single value
        const cleanValue = value.trim().replace(/^["']|["']$/g, "");

        // Handle booleans and numbers
        if (cleanValue === "true") {
          (metadata as Record<string, unknown>)[key] = true;
        } else if (cleanValue === "false") {
          (metadata as Record<string, unknown>)[key] = false;
        } else if (/^\d+$/.test(cleanValue)) {
          (metadata as Record<string, unknown>)[key] = parseInt(cleanValue, 10);
        } else if (/^\d+\.\d+$/.test(cleanValue)) {
          (metadata as Record<string, unknown>)[key] = parseFloat(cleanValue);
        } else {
          (metadata as Record<string, unknown>)[key] = cleanValue;
        }
      }
    }
  }

  // Save final array if exists
  if (currentArray.length > 0 && currentKey) {
    (metadata as Record<string, unknown>)[currentKey] = currentArray;
  }

  return { metadata, body };
}

/**
 * Check if a trigger pattern matches input
 */
function matchTrigger(trigger: string, input: string): boolean {
  const lowerInput = input.toLowerCase();
  const lowerTrigger = trigger.toLowerCase();

  // Simple keyword match
  if (lowerInput.includes(lowerTrigger)) {
    return true;
  }

  // Regex pattern (starts with /)
  if (trigger.startsWith("/") && trigger.endsWith("/")) {
    try {
      const regex = new RegExp(trigger.slice(1, -1), "i");
      return regex.test(input);
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Check if a glob pattern matches a file path
 */
function matchGlob(glob: string, filePath: string): boolean {
  // Convert glob to regex
  const regexPattern = glob
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, "{{GLOBSTAR}}")
    .replace(/\*/g, "[^/]*")
    .replace(/{{GLOBSTAR}}/g, ".*")
    .replace(/\?/g, ".");

  try {
    const regex = new RegExp(`^${regexPattern}$`, "i");
    return regex.test(filePath);
  } catch {
    return false;
  }
}

/**
 * Skill resolver for loading and matching skills
 */
export class SkillResolver {
  private skills: Map<string, Skill> = new Map();
  private skillsDir: string;
  private fileSystem: {
    readDir: (path: string) => Promise<string[]>;
    readFile: (path: string) => Promise<string>;
    stat: (path: string) => Promise<{ mtime: Date }>;
    exists: (path: string) => Promise<boolean>;
  };

  constructor(
    skillsDir: string,
    fileSystem?: {
      readDir: (path: string) => Promise<string[]>;
      readFile: (path: string) => Promise<string>;
      stat: (path: string) => Promise<{ mtime: Date }>;
      exists: (path: string) => Promise<boolean>;
    }
  ) {
    this.skillsDir = skillsDir;

    // Default to Node.js fs if not provided
    this.fileSystem = fileSystem ?? {
      readDir: async (path: string) => {
        const fs = await import("fs/promises");
        return fs.readdir(path);
      },
      readFile: async (path: string) => {
        const fs = await import("fs/promises");
        return fs.readFile(path, "utf-8");
      },
      stat: async (path: string) => {
        const fs = await import("fs/promises");
        const stat = await fs.stat(path);
        return { mtime: stat.mtime };
      },
      exists: async (path: string) => {
        const fs = await import("fs/promises");
        try {
          await fs.access(path);
          return true;
        } catch {
          return false;
        }
      },
    };
  }

  /**
   * Load all skills from the skills directory
   */
  async loadAll(): Promise<void> {
    const { join } = await import("path");

    if (!(await this.fileSystem.exists(this.skillsDir))) {
      return;
    }

    const files = await this.fileSystem.readDir(this.skillsDir);

    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const skillId = file.replace(/\.md$/, "");
      const filePath = join(this.skillsDir, file);

      await this.loadSkill(skillId, filePath);
    }
  }

  /**
   * Load a single skill
   */
  async loadSkill(id: string, path: string): Promise<Skill | null> {
    try {
      const content = await this.fileSystem.readFile(path);
      const stat = await this.fileSystem.stat(path);
      const { metadata, body } = parseSkillFrontmatter(content, id);

      const skill: Skill = {
        metadata,
        content: body,
        path,
        lastModified: stat.mtime,
      };

      this.skills.set(id, skill);
      return skill;
    } catch {
      return null;
    }
  }

  /**
   * Get a skill by ID
   */
  get(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  /**
   * List all skills
   */
  list(options?: SkillResolutionOptions): Skill[] {
    let skills = Array.from(this.skills.values());

    if (!options?.includeDisabled) {
      skills = skills.filter((s) => s.metadata.enabled !== false);
    }

    if (options?.category) {
      skills = skills.filter((s) => s.metadata.category === options.category);
    }

    if (options?.tags?.length) {
      skills = skills.filter((s) =>
        options.tags!.some((t) => s.metadata.tags?.includes(t))
      );
    }

    if (options?.forStep !== undefined) {
      skills = skills.filter((s) => s.metadata.steps?.includes(options.forStep!));
    }

    return skills;
  }

  /**
   * Resolve skills matching input text
   */
  resolve(input: string, options?: SkillResolutionOptions): SkillMatch[] {
    const matches: SkillMatch[] = [];
    const limit = options?.limit ?? 10;
    const minConfidence = options?.minConfidence ?? 0.3;

    for (const skill of this.list(options)) {
      // Check triggers
      for (const trigger of skill.metadata.triggers ?? []) {
        if (matchTrigger(trigger, input)) {
          matches.push({
            skill,
            confidence: 0.9,
            matchType: "trigger",
            matchedOn: trigger,
          });
          break;
        }
      }

      // Check tags (lower confidence)
      for (const tag of skill.metadata.tags ?? []) {
        if (input.toLowerCase().includes(tag.toLowerCase())) {
          matches.push({
            skill,
            confidence: 0.5,
            matchType: "tag",
            matchedOn: tag,
          });
          break;
        }
      }
    }

    // Sort by confidence and priority
    matches.sort((a, b) => {
      const confDiff = b.confidence - a.confidence;
      if (confDiff !== 0) return confDiff;

      const aPriority = a.skill.metadata.priority ?? 0;
      const bPriority = b.skill.metadata.priority ?? 0;
      return bPriority - aPriority;
    });

    // Filter and limit
    return matches
      .filter((m) => m.confidence >= minConfidence)
      .slice(0, limit);
  }

  /**
   * Resolve skills matching a file path (glob patterns)
   */
  resolveForFile(filePath: string, options?: SkillResolutionOptions): SkillMatch[] {
    const matches: SkillMatch[] = [];
    const limit = options?.limit ?? 5;

    for (const skill of this.list(options)) {
      for (const glob of skill.metadata.globs ?? []) {
        if (matchGlob(glob, filePath)) {
          matches.push({
            skill,
            confidence: 0.85,
            matchType: "glob",
            matchedOn: glob,
          });
          break;
        }
      }
    }

    return matches.slice(0, limit);
  }

  /**
   * Get skills for a specific step
   */
  getForStep(stepNumber: number): Skill[] {
    return this.list({ forStep: stepNumber });
  }

  /**
   * Get foundation skills
   */
  getFoundationSkills(): Skill[] {
    return Array.from(this.skills.values()).filter(
      (s) => s.metadata.foundation === true && s.metadata.enabled !== false
    );
  }

  /**
   * Get skill registry statistics
   */
  getStats(): SkillRegistryStats {
    const skills = Array.from(this.skills.values());

    const byCategory: Record<string, number> = {};
    const byStep: Record<number, number> = {};

    let foundation = 0;
    let enabled = 0;
    let disabled = 0;

    for (const skill of skills) {
      if (skill.metadata.foundation) foundation++;
      if (skill.metadata.enabled !== false) enabled++;
      else disabled++;

      const category = skill.metadata.category ?? "uncategorized";
      byCategory[category] = (byCategory[category] ?? 0) + 1;

      for (const step of skill.metadata.steps ?? []) {
        byStep[step] = (byStep[step] ?? 0) + 1;
      }
    }

    return {
      total: skills.length,
      foundation,
      byCategory,
      byStep,
      enabled,
      disabled,
    };
  }

  /**
   * Register a skill programmatically
   */
  register(skill: Skill): void {
    this.skills.set(skill.metadata.id, skill);
  }

  /**
   * Clear all loaded skills
   */
  clear(): void {
    this.skills.clear();
  }
}

/**
 * Create a skill resolver with default settings
 */
export function createSkillResolver(skillsDir: string): SkillResolver {
  return new SkillResolver(skillsDir);
}
