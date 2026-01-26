/**
 * Factory Droid Skill Generator
 *
 * Generates skill files for Factory Droid platform (.factory/skills/{id}/SKILL.md)
 * Factory Droid uses a folder-based structure where each skill is in its own directory.
 *
 * @module generators/factory-droid/skill-generator
 */

import { BaseSkillGenerator } from "../base-generator.js";
import {
  PLATFORM_CONFIGS,
  type SkillDefinition,
  type GeneratedFile,
} from "../types.js";

/**
 * Output format for Factory Droid skills (folder structure):
 *
 * Path: .factory/skills/{skill-id}/SKILL.md
 *
 * ```yaml
 * ---
 * name: {id}
 * description: "{description}"
 * version: "{version}"
 * source: "{source}"
 * platform: "factory-droid"
 * triggers:
 *   - {trigger1}
 * ---
 *
 * {content}
 * ```
 */
export class FactoryDroidSkillGenerator extends BaseSkillGenerator {
  constructor() {
    super("factory-droid", PLATFORM_CONFIGS["factory-droid"]);
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
   * Factory Droid uses folder structure: skills/{id}/SKILL.md
   */
  getOutputPath(definition: SkillDefinition): string {
    const folderId = this.sanitizeId(definition.id);
    return `${this.getSkillsDir()}/${folderId}/SKILL.md`;
  }

  /**
   * Map fields for Factory Droid frontmatter
   */
  protected override mapFields(
    definition: SkillDefinition
  ): Record<string, unknown> {
    const mapped: Record<string, unknown> = {
      name: definition.id,
      description: definition.description,
      platform: "factory-droid",
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

    if (definition.allowedTools && definition.allowedTools.length > 0) {
      mapped["allowed-tools"] = definition.allowedTools;
    }

    if (definition.model) {
      mapped.model = definition.model;
    }

    if (definition.category) {
      mapped.category = definition.category;
    }

    // Factory Droid specific: capabilities field
    if (definition.stepAssociation) {
      mapped.capabilities = [definition.stepAssociation];
    }

    return mapped;
  }

  /**
   * Build the skill body with Factory Droid specific additions
   */
  protected override buildSkillBody(skill: SkillDefinition): string {
    let content = skill.content;

    // Add Factory Droid platform notice at the end
    content += `\n\n---\n*Generated for Factory Droid platform*\n`;

    return content;
  }
}

/**
 * Factory function to create a Factory Droid skill generator
 */
export function createFactoryDroidSkillGenerator(): FactoryDroidSkillGenerator {
  return new FactoryDroidSkillGenerator();
}
