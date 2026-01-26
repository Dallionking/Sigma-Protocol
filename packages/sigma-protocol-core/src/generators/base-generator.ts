/**
 * Base Generator
 *
 * Abstract base class providing shared generation logic for all platforms.
 *
 * @module generators/base-generator
 */

import type {
  Platform,
  PlatformConfig,
  SkillDefinition,
  CommandDefinition,
  GeneratedFile,
  Generator,
  SkillGenerator,
  CommandGenerator,
} from "./types.js";
import { toYamlFrontmatter } from "./utils/frontmatter.js";

/**
 * Fields to exclude from frontmatter (they go in the body)
 */
const BODY_FIELDS = ["content"] as const;

/**
 * Abstract base generator with shared logic
 */
export abstract class BaseGenerator<
  T extends SkillDefinition | CommandDefinition,
> implements Generator<T>
{
  constructor(
    public readonly platform: Platform,
    public readonly config: PlatformConfig
  ) {}

  /**
   * Generate a file from a definition
   */
  abstract generate(definition: T): GeneratedFile;

  /**
   * Generate multiple files
   */
  generateAll(definitions: T[]): GeneratedFile[] {
    return definitions.map((d) => this.generate(d));
  }

  /**
   * Get the output path for a definition
   */
  abstract getOutputPath(definition: T): string;

  /**
   * Convert definition to YAML frontmatter
   */
  toFrontmatter(definition: T): string {
    const mapped = this.mapFields(definition);
    return toYamlFrontmatter(mapped);
  }

  /**
   * Map source fields to platform-specific field names
   */
  protected mapFields(definition: T): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [sourceKey, value] of Object.entries(definition)) {
      // Skip body fields
      if (BODY_FIELDS.includes(sourceKey as (typeof BODY_FIELDS)[number])) {
        continue;
      }

      // Skip undefined values
      if (value === undefined) {
        continue;
      }

      // Apply field mapping or use original key
      const targetKey = this.config.fieldMappings[sourceKey] || sourceKey;
      result[targetKey] = value;
    }

    return result;
  }

  /**
   * Build the full file content from frontmatter and body
   */
  protected buildContent(frontmatter: string, body: string): string {
    return `${frontmatter}\n${body}`;
  }

  /**
   * Get the file extension for output files
   */
  protected getFileExtension(): string {
    return ".md";
  }

  /**
   * Sanitize an ID for use in file paths
   */
  protected sanitizeId(id: string): string {
    return id
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
}

/**
 * Abstract base class for skill generators
 */
export abstract class BaseSkillGenerator
  extends BaseGenerator<SkillDefinition>
  implements SkillGenerator
{
  /**
   * Inject standard MCP/tool preferences into skill
   */
  injectToolPreferences(skill: SkillDefinition): SkillDefinition {
    const injected = { ...skill };

    // Add preferred MCPs if enabled
    if (skill.preferredMcps && skill.preferredMcps.length > 0) {
      // Already has preferences, keep them
    } else {
      // Could inject defaults here if needed
    }

    return injected;
  }

  /**
   * Get the skills directory for this platform
   */
  protected getSkillsDir(): string {
    return `${this.config.outputRoot}/${this.config.skillsDir}`;
  }

  /**
   * Build the skill body content
   */
  protected buildSkillBody(skill: SkillDefinition): string {
    return skill.content;
  }
}

/**
 * Abstract base class for command generators
 */
export abstract class BaseCommandGenerator
  extends BaseGenerator<CommandDefinition>
  implements CommandGenerator
{
  /**
   * Generate agent reference syntax for platform
   */
  abstract formatAgentRef(agentName: string): string;

  /**
   * Get the commands directory for this platform
   */
  protected getCommandsDir(): string {
    return `${this.config.outputRoot}/${this.config.commandsDir}`;
  }

  /**
   * Build the command body content
   */
  protected buildCommandBody(command: CommandDefinition): string {
    const lines: string[] = [];

    // Command heading
    lines.push(`# /${command.name}`);
    lines.push("");

    // Main content
    lines.push(command.content);

    // Usage section if provided
    if (command.usage) {
      lines.push("");
      lines.push(`**Usage:** \`/${command.name} ${command.usage}\``);
    }

    // Arguments section if provided
    if (command.arguments && command.arguments.length > 0) {
      lines.push("");
      lines.push("## Arguments");
      lines.push("");
      for (const arg of command.arguments) {
        const required = arg.required ? "(required)" : "(optional)";
        const defaultVal =
          arg.default !== undefined ? ` [default: ${arg.default}]` : "";
        lines.push(`- **${arg.name}** ${required}: ${arg.description}${defaultVal}`);
      }
    }

    // Agent reference if provided
    if (command.agentRef) {
      lines.push("");
      lines.push(this.formatAgentRef(command.agentRef));
    }

    return lines.join("\n");
  }
}
