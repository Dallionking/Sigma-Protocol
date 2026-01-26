/**
 * OpenCode Command Generator
 *
 * Generates command files for OpenCode platform (.opencode/commands/*.md)
 * OpenCode commands use a thin wrapper format that delegates to agents.
 *
 * @module generators/opencode/command-generator
 */

import { BaseCommandGenerator } from "../base-generator.js";
import {
  PLATFORM_CONFIGS,
  CORE_TOOLS,
  type CommandDefinition,
  type GeneratedFile,
} from "../types.js";

/**
 * Output format for OpenCode commands (thin wrapper):
 *
 * ```yaml
 * ---
 * description: "Run Sigma {namespace}/{name}"
 * allowed-tools:
 *   - Read
 *   - Write
 *   - Edit
 *   - Bash
 *   - WebFetch
 * ---
 *
 * # /{name}
 *
 * Invoke the **{name}** agent from Sigma Protocol.
 *
 * This command runs the full {name} workflow including:
 * - All HITL (Human-in-the-Loop) checkpoints
 * - MCP research integration
 * - Quality verification gates
 *
 * **Usage:** `/{name} [your input here]`
 *
 * @{agentRef}
 * ```
 */
export class OpenCodeCommandGenerator extends BaseCommandGenerator {
  constructor() {
    super("opencode", PLATFORM_CONFIGS["opencode"]);
  }

  /**
   * Generate a command file from definition
   */
  generate(definition: CommandDefinition): GeneratedFile {
    const frontmatter = this.toFrontmatter(definition);
    const body = this.buildThinWrapperBody(definition);
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
   * Generate agent reference syntax for OpenCode
   * OpenCode uses @namespace-command-name format
   */
  formatAgentRef(agentName: string): string {
    return `@${agentName}`;
  }

  /**
   * Map fields for OpenCode command frontmatter
   */
  protected override mapFields(
    definition: CommandDefinition
  ): Record<string, unknown> {
    const mapped: Record<string, unknown> = {
      description: definition.description,
    };

    // OpenCode uses allowed-tools with hyphen
    if (definition.allowedTools && definition.allowedTools.length > 0) {
      mapped["allowed-tools"] = definition.allowedTools;
    } else {
      // Default to core tools for OpenCode commands
      mapped["allowed-tools"] = [...CORE_TOOLS];
    }

    return mapped;
  }

  /**
   * Build thin wrapper body for OpenCode commands
   * OpenCode commands delegate to underlying agents
   */
  private buildThinWrapperBody(command: CommandDefinition): string {
    const lines: string[] = [];

    // Command heading
    lines.push(`# /${command.name}`);
    lines.push("");

    // Brief description
    lines.push(`Invoke the **${command.name}** agent from Sigma Protocol.`);
    lines.push("");

    // Workflow description
    lines.push(`This command runs the full ${command.name} workflow including:`);
    lines.push("- All HITL (Human-in-the-Loop) checkpoints");
    lines.push("- MCP research integration");
    lines.push("- Quality verification gates");
    lines.push("");

    // Usage
    const usage = command.usage || "[your input here]";
    lines.push(`**Usage:** \`/${command.name} ${usage}\``);

    // Agent reference
    if (command.agentRef) {
      lines.push("");
      lines.push(this.formatAgentRef(command.agentRef));
    }

    return lines.join("\n");
  }
}

/**
 * Factory function to create an OpenCode command generator
 */
export function createOpenCodeCommandGenerator(): OpenCodeCommandGenerator {
  return new OpenCodeCommandGenerator();
}
