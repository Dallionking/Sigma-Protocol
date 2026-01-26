#!/usr/bin/env node
/**
 * Sigma Generate CLI
 *
 * Command-line interface for generating platform-specific plugin files.
 *
 * Usage:
 *   sigma-generate --platform=claude-code --output=.claude/
 *   sigma-generate --platform=opencode --output=.opencode/
 *   sigma-generate --platform=factory-droid --output=.factory/
 *   sigma-generate --platform=all --output=./
 *   sigma-generate --dry-run --verbose
 *
 * @module generators/cli/generate
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type {
  Platform,
  PluginRegistry,
  GeneratorOptions,
  GeneratorResult,
  GeneratedFile,
} from "../types.js";
import { writeGeneratedFiles, summarizeResults } from "../utils/file-writer.js";

// Import generators
import { createClaudeCodeSkillGenerator, createClaudeCodeCommandGenerator } from "../claude-code/index.js";
import { createOpenCodeSkillGenerator, createOpenCodeCommandGenerator } from "../opencode/index.js";
import { createFactoryDroidSkillGenerator, createFactoryDroidCommandGenerator } from "../factory-droid/index.js";

/**
 * Parse command-line arguments
 */
function parseArgs(args: string[]): GeneratorOptions & { registryPath?: string } {
  const options: GeneratorOptions & { registryPath?: string } = {
    platforms: [],
    outputDir: process.cwd(),
    overwrite: false,
    dryRun: false,
    includeResearchMcps: false,
    verbose: false,
  };

  for (const arg of args) {
    if (arg.startsWith("--platform=")) {
      const value = arg.slice("--platform=".length);
      if (value === "all") {
        options.platforms = ["claude-code", "opencode", "factory-droid"];
      } else {
        options.platforms = value.split(",") as Platform[];
      }
    } else if (arg.startsWith("--output=")) {
      options.outputDir = resolve(arg.slice("--output=".length));
    } else if (arg.startsWith("--registry=")) {
      options.registryPath = resolve(arg.slice("--registry=".length));
    } else if (arg === "--overwrite") {
      options.overwrite = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--verbose" || arg === "-v") {
      options.verbose = true;
    } else if (arg === "--include-mcps") {
      options.includeResearchMcps = true;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  // Default to all platforms if none specified
  if (options.platforms.length === 0) {
    options.platforms = ["claude-code", "opencode", "factory-droid"];
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Sigma Generate - Platform Plugin Generator

USAGE:
  sigma-generate [OPTIONS]

OPTIONS:
  --platform=<platform>   Target platform(s): claude-code, opencode, factory-droid, all
                          (default: all)
  --output=<dir>          Output base directory (default: current directory)
  --registry=<path>       Path to registry JSON file with skills/commands
  --overwrite             Overwrite existing files
  --dry-run               Show what would be generated without writing
  --verbose, -v           Verbose output
  --include-mcps          Include research MCP preferences in all skills
  --help, -h              Show this help message

EXAMPLES:
  # Generate for all platforms
  sigma-generate --platform=all --output=./

  # Generate only Claude Code plugins
  sigma-generate --platform=claude-code --output=.claude/ --verbose

  # Dry run to preview changes
  sigma-generate --dry-run --verbose

  # Generate from registry file
  sigma-generate --registry=./registry.json --platform=all
`);
}

/**
 * Load registry from file
 */
async function loadRegistry(path: string): Promise<PluginRegistry> {
  const content = await readFile(path, "utf-8");
  return JSON.parse(content) as PluginRegistry;
}

/**
 * Generate sample registry for testing
 */
function getSampleRegistry(): PluginRegistry {
  return {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    skills: [
      {
        id: "example-skill",
        name: "Example Skill",
        description: "An example skill for testing the generator",
        version: "1.0.0",
        triggers: ["example", "test skill"],
        content: "# Example Skill\n\nThis is an example skill content.",
        category: "utility",
      },
    ],
    commands: [
      {
        name: "example-command",
        description: "An example command for testing",
        allowedTools: ["Read", "Write", "Edit", "Bash"],
        content: "Run the example workflow with full verification.",
        usage: "[input]",
      },
    ],
  };
}

/**
 * Generate files for a single platform
 */
function generateForPlatform(
  platform: Platform,
  registry: PluginRegistry
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  switch (platform) {
    case "claude-code": {
      const skillGen = createClaudeCodeSkillGenerator();
      const cmdGen = createClaudeCodeCommandGenerator();

      for (const skill of registry.skills) {
        files.push(skillGen.generate(skill));
      }
      for (const command of registry.commands) {
        files.push(cmdGen.generate(command));
      }
      break;
    }
    case "opencode": {
      const skillGen = createOpenCodeSkillGenerator();
      const cmdGen = createOpenCodeCommandGenerator();

      for (const skill of registry.skills) {
        files.push(skillGen.generate(skill));
      }
      for (const command of registry.commands) {
        files.push(cmdGen.generate(command));
      }
      break;
    }
    case "factory-droid": {
      const skillGen = createFactoryDroidSkillGenerator();
      const cmdGen = createFactoryDroidCommandGenerator();

      for (const skill of registry.skills) {
        files.push(skillGen.generate(skill));
      }
      for (const command of registry.commands) {
        files.push(cmdGen.generate(command));
      }
      break;
    }
  }

  return files;
}

/**
 * Main CLI entry point
 */
export async function main(args: string[] = process.argv.slice(2)): Promise<void> {
  const options = parseArgs(args);

  if (options.verbose) {
    console.log("Sigma Generate - Plugin Generator");
    console.log("─".repeat(40));
    console.log(`Platforms: ${options.platforms.join(", ")}`);
    console.log(`Output: ${options.outputDir}`);
    console.log(`Overwrite: ${options.overwrite}`);
    console.log(`Dry Run: ${options.dryRun}`);
    console.log("");
  }

  // Load registry
  let registry: PluginRegistry;
  if (options.registryPath) {
    try {
      registry = await loadRegistry(options.registryPath);
      if (options.verbose) {
        console.log(`Loaded registry from: ${options.registryPath}`);
        console.log(`  Skills: ${registry.skills.length}`);
        console.log(`  Commands: ${registry.commands.length}`);
        console.log("");
      }
    } catch (error) {
      console.error(`Error loading registry: ${error}`);
      process.exit(1);
    }
  } else {
    // Use sample registry for demonstration
    registry = getSampleRegistry();
    if (options.verbose) {
      console.log("Using sample registry (no --registry specified)");
      console.log("");
    }
  }

  // Generate for each platform
  const results: GeneratorResult[] = [];

  for (const platform of options.platforms) {
    if (options.verbose) {
      console.log(`Generating for ${platform}...`);
    }

    const files = generateForPlatform(platform, registry);

    // Write files
    const writeResults = await writeGeneratedFiles(files, options.outputDir!, {
      overwrite: options.overwrite,
      dryRun: options.dryRun,
      verbose: options.verbose,
    });

    const summary = summarizeResults(writeResults);

    results.push({
      platform,
      filesGenerated: summary.written,
      filesSkipped: summary.skipped,
      errors: writeResults
        .filter((r) => r.status === "error")
        .map((r) => ({
          definitionId: r.path,
          message: r.reason || "Unknown error",
          path: r.path,
        })),
      files,
    });

    if (options.verbose) {
      console.log(`  Generated: ${summary.written}, Skipped: ${summary.skipped}, Errors: ${summary.errors}`);
      console.log("");
    }
  }

  // Print summary
  console.log("─".repeat(40));
  console.log("Generation Summary");
  console.log("─".repeat(40));

  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const result of results) {
    console.log(`${result.platform}:`);
    console.log(`  Generated: ${result.filesGenerated}`);
    console.log(`  Skipped: ${result.filesSkipped}`);
    console.log(`  Errors: ${result.errors.length}`);

    totalGenerated += result.filesGenerated;
    totalSkipped += result.filesSkipped;
    totalErrors += result.errors.length;
  }

  console.log("");
  console.log(`Total: ${totalGenerated} generated, ${totalSkipped} skipped, ${totalErrors} errors`);

  if (options.dryRun) {
    console.log("");
    console.log("(Dry run - no files were written)");
  }

  // Exit with error code if there were errors
  if (totalErrors > 0) {
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1]?.endsWith("generate.js") || process.argv[1]?.endsWith("generate.ts")) {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}
