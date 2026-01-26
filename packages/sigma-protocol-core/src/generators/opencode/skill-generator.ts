/**
 * OpenCode Skill Generator
 *
 * Generates skill files for OpenCode platform (.opencode/skills/*.md)
 *
 * @module generators/opencode/skill-generator
 */

import { BaseSkillGenerator } from "../base-generator.js";
import {
  PLATFORM_CONFIGS,
  type SkillDefinition,
  type GeneratedFile,
} from "../types.js";

/**
 * Output format for OpenCode skills (similar to Claude Code but with allowed-tools field):
 *
 * ```yaml
 * ---
 * name: {id}
 * description: "{description}"
 * triggers:
 *   - {trigger1}
 * allowed-tools:
 *   - Read
 *   - Write
 * ---
 *
 * {content}
 * ```
 */
export class OpenCodeSkillGenerator extends BaseSkillGenerator {
  constructor() {
    super("opencode", PLATFORM_CONFIGS["opencode"]);
  }

  /**
   * Generate a skill file from definition
   */
  generate(definition: SkillDefinition): GeneratedFile {
    const skill = this.injectToolPreferences(definition);
    const frontmatter = this.toFrontmatter(skill);
    const body = this.buildSkillBody(skill);
    const content = this.buildContent(frontmatter, body);

    return {
      path: this.getOutputPath(skill),
      content,
      isUpdate: false,
    };
  }

  /**
   * Get the output path for a skill
   */
  getOutputPath(definition: SkillDefinition): string {
    const filename = `${this.sanitizeId(definition.id)}${this.getFileExtension()}`;
    return `${this.getSkillsDir()}/${filename}`;
  }

  /**
   * Map fields for OpenCode frontmatter
   * OpenCode uses "allowed-tools" instead of "allowedTools"
   */
  protected override mapFields(
    definition: SkillDefinition
  ): Record<string, unknown> {
    const mapped: Record<string, unknown> = {
      name: definition.id,
      description: definition.description,
    };

    // Optional fields
    if (definition.version) {
      mapped.version = definition.version;
    }

    if (definition.source) {
      mapped.source = definition.source;
    }

    if (definition.triggers && definition.triggers.length > 0) {
      mapped.triggers = definition.triggers;
    }

    // OpenCode uses hyphenated field name
    if (definition.allowedTools && definition.allowedTools.length > 0) {
      mapped["allowed-tools"] = definition.allowedTools;
    }

    if (definition.model) {
      mapped.model = definition.model;
    }

    if (definition.category) {
      mapped.category = definition.category;
    }

    return mapped;
  }
}

/**
 * Factory function to create an OpenCode skill generator
 */
export function createOpenCodeSkillGenerator(): OpenCodeSkillGenerator {
  return new OpenCodeSkillGenerator();
}
