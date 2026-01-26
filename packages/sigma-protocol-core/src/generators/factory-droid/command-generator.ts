/**
 * Factory Droid Command Generator
 *
 * Generates command files for Factory Droid platform (.factory/commands/*.md)
 * Factory Droid commands use the same comprehensive format as Claude Code.
 *
 * @module generators/factory-droid/command-generator
 */

import { BaseCommandGenerator } from "../base-generator.js";
import {
  PLATFORM_CONFIGS,
  type CommandDefinition,
  type GeneratedFile,
} from "../types.js";

/**
 * Output format for Factory Droid commands:
 *
 * ```yaml
 * ---
 * description: "{description}"
 * platform: "factory-droid"
 * allowed-tools:
 *   - {tool1}
 *   - {tool2}
 * ---
 *
 * # /{name}
 *
 * {content}
 *
 * **Usage:** `/{name} {usage}`
 * ```
 */
export class FactoryDroidCommandGenerator extends BaseCommandGenerator {
  constructor() {
    super("factory-droid", PLATFORM_CONFIGS["factory-droid"]);
  }

  /**
   * Generate a command file from definition
   */
  generate(definition: CommandDefinition): GeneratedFile {
    const frontmatter = this.toFrontmatter(definition);
    const body = this.buildCommandBody(definition);
    const content = this.buildContent(frontmatter, body);

    return {
      path: this.getOutputPath(definition),
      content,
      isUpdate: false,
    };
  }

  /**
   * Get the output path for a command
   */
  getOutputPath(definition: CommandDefinition): string {
    const filename = `${this.sanitizeId(definition.name)}${this.getFileExtension()}`;
    return `${this.getCommandsDir()}/${filename}`;
  }

  /**
   * Generate agent reference syntax for Factory Droid
   */
  formatAgentRef(agentName: string): string {
    // Factory Droid uses @agent-name syntax like Claude Code
    return `@${agentName}`;
  }

  /**
   * Map fields for Factory Droid command frontmatter
   */
  protected override mapFields(
    definition: CommandDefinition
  ): Record<string, unknown> {
    const mapped: Record<string, unknown> = {
      description: definition.description,
      platform: "factory-droid",
    };

    if (definition.allowedTools && definition.allowedTools.length > 0) {
      mapped["allowed-tools"] = definition.allowedTools;
    }

    return mapped;
  }
}

/**
 * Factory function to create a Factory Droid command generator
 */
export function createFactoryDroidCommandGenerator(): FactoryDroidCommandGenerator {
  return new FactoryDroidCommandGenerator();
}
