#!/usr/bin/env node

/**
 * Sigma Protocol Doctor
 *
 * System health checker for Sigma Protocol installations.
 * Validates setup, detects issues, and provides fixes.
 */

import chalk from "chalk";
import ora from "ora";
import boxen from "boxen";
import fs from "fs-extra";
import path from "path";
import { 
  spawnClaude, 
  selectTerminalBackend,
  checkClaudeCode 
} from "./terminal-utils.js";

/**
 * Health check categories
 */
const CHECKS = {
  installation: {
    name: "Installation",
    checks: [
      {
        id: "manifest",
        name: "Sigma manifest file",
        check: async (targetDir) => {
          const manifestPath = path.join(targetDir, ".sigma-manifest.json");
          if (await fs.pathExists(manifestPath)) {
            try {
              const manifest = await fs.readJson(manifestPath);
              if (manifest.sigma_version) {
                return {
                  status: "pass",
                  message: `Version ${manifest.sigma_version}`,
                };
              }
              return {
                status: "warn",
                message: "Manifest missing sigma_version",
              };
            } catch {
              return { status: "fail", message: "Invalid manifest JSON" };
            }
          }
          return { status: "fail", message: "No .sigma-manifest.json found" };
        },
        fix: "Run: npx sigma-protocol install",
      },
      {
        id: "sigma-dir",
        name: "Sigma directory structure",
        check: async (targetDir) => {
          const sigmaDir = path.join(targetDir, ".sigma");
          const contextDir = path.join(sigmaDir, "context");
          const rulesDir = path.join(sigmaDir, "rules");

          const hasSigma = await fs.pathExists(sigmaDir);
          const hasContext = await fs.pathExists(contextDir);
          const hasRules = await fs.pathExists(rulesDir);

          if (hasSigma && hasContext && hasRules) {
            return { status: "pass", message: "All directories present" };
          } else if (hasSigma) {
            return { status: "warn", message: "Missing subdirectories" };
          }
          return { status: "fail", message: "No .sigma directory" };
        },
        fix: "Run: sigma install",
      },
    ],
  },
  platforms: {
    name: "Platforms",
    checks: [
      {
        id: "cursor",
        name: "Cursor configuration",
        check: async (targetDir) => {
          const cursorDir = path.join(targetDir, ".cursor");
          const commandsDir = path.join(cursorDir, "commands");

          if (!(await fs.pathExists(cursorDir))) {
            return { status: "skip", message: "Not configured" };
          }

          if (await fs.pathExists(commandsDir)) {
            const files = await fs.readdir(commandsDir);
            const mdFiles = files.filter((f) => !f.startsWith("."));
            return { status: "pass", message: `${mdFiles.length} command dirs` };
          }
          return { status: "warn", message: "Commands directory empty" };
        },
        fix: "Run: npx sigma-protocol install (select Cursor)",
      },
      {
        id: "claude-code",
        name: "Claude Code configuration",
        check: async (targetDir) => {
          const claudeDir = path.join(targetDir, ".claude");
          const claudeMd = path.join(targetDir, "CLAUDE.md");

          if (!(await fs.pathExists(claudeDir))) {
            return { status: "skip", message: "Not configured" };
          }

          const hasOrchestrator = await fs.pathExists(claudeMd);
          const hasCommands = await fs.pathExists(path.join(claudeDir, "commands"));
          const hasAgents = await fs.pathExists(path.join(claudeDir, "agents"));

          if (hasOrchestrator && hasCommands) {
            return {
              status: "pass",
              message: `CLAUDE.md present${hasAgents ? ", agents installed" : ""}`,
            };
          } else if (hasCommands || hasAgents) {
            return { status: "warn", message: "Missing CLAUDE.md orchestrator" };
          }
          return { status: "warn", message: "Missing commands" };
        },
        fix: "Run: npx sigma-protocol install (select Claude Code)",
      },
      {
        id: "opencode",
        name: "OpenCode configuration",
        check: async (targetDir) => {
          const opencodeDir = path.join(targetDir, ".opencode");
          const agentsMd = path.join(targetDir, "AGENTS.md");

          if (!(await fs.pathExists(opencodeDir))) {
            return { status: "skip", message: "Not configured" };
          }

          const hasOrchestrator = await fs.pathExists(agentsMd);
          const hasCommands = await fs.pathExists(path.join(opencodeDir, "command"));

          if (hasOrchestrator && hasCommands) {
            return { status: "pass", message: "AGENTS.md present" };
          }
          return { status: "warn", message: "Incomplete setup" };
        },
        fix: "Run: npx sigma-protocol install (select OpenCode)",
      },
      {
        id: "codex",
        name: "Codex configuration",
        check: async (targetDir) => {
          const codexDir = path.join(targetDir, ".codex");
          const codexConfig = path.join(codexDir, "config.toml");
          const codexSkills = path.join(targetDir, ".agents", "skills");
          const agentsMd = path.join(targetDir, "AGENTS.md");

          if (
            !(await fs.pathExists(codexDir)) &&
            !(await fs.pathExists(codexSkills)) &&
            !(await fs.pathExists(agentsMd))
          ) {
            return { status: "skip", message: "Not configured" };
          }

          const hasConfig = await fs.pathExists(codexConfig);
          const hasSkills = await fs.pathExists(codexSkills);
          const hasAgents = await fs.pathExists(agentsMd);
          const hasRules = await fs.pathExists(path.join(targetDir, ".codex", "rules"));

          // Validate config.toml has real content (not empty/placeholder)
          let configValid = false;
          if (hasConfig) {
            const configContent = await fs.readFile(codexConfig, "utf8");
            configValid = configContent.length > 50 && configContent.includes("model");
          }

          if (hasConfig && configValid && hasSkills && hasAgents && hasRules) {
            return { status: "pass", message: "config.toml, skills, rules, and AGENTS.md present" };
          }

          if (hasConfig && hasSkills && hasAgents) {
            const missing = [];
            if (!hasRules) missing.push("rules");
            if (!configValid) missing.push("config.toml has no model setting");
            return { status: "warn", message: `Setup mostly complete (missing: ${missing.join(", ")})` };
          }

          if (hasSkills || hasAgents) {
            return { status: "warn", message: "Partial setup (missing config.toml or skills)" };
          }

          return { status: "warn", message: "Missing Codex skills" };
        },
        fix: "Run: npx sigma-protocol install (select Codex)",
      },
    ],
  },
  documentation: {
    name: "Documentation",
    checks: [
      {
        id: "docs-structure",
        name: "Docs directory structure",
        check: async (targetDir) => {
          const docsDir = path.join(targetDir, "docs");

          if (!(await fs.pathExists(docsDir))) {
            return { status: "warn", message: "No docs directory" };
          }

          const expectedDirs = ["specs", "prds"];
          const existingDirs = [];

          for (const dir of expectedDirs) {
            if (await fs.pathExists(path.join(docsDir, dir))) {
              existingDirs.push(dir);
            }
          }

          if (existingDirs.length === expectedDirs.length) {
            return { status: "pass", message: "All directories present" };
          } else if (existingDirs.length > 0) {
            return {
              status: "warn",
              message: `Partial (${existingDirs.join(", ")})`,
            };
          }
          return { status: "warn", message: "Missing standard directories" };
        },
        fix: "Directories created on first step execution",
      },
      {
        id: "master-prd",
        name: "Master PRD",
        check: async (targetDir) => {
          const prdPath = path.join(targetDir, "docs", "specs", "MASTER_PRD.md");

          if (await fs.pathExists(prdPath)) {
            const content = await fs.readFile(prdPath, "utf8");
            if (content.length > 500) {
              return { status: "pass", message: "Present and populated" };
            }
            return { status: "warn", message: "Present but minimal" };
          }
          return { status: "info", message: "Not created yet" };
        },
        fix: "Run: @step-1-ideation [your product idea]",
      },
    ],
  },
  tools: {
    name: "Tools & Dependencies",
    checks: [
      {
        id: "node-version",
        name: "Node.js version",
        check: async () => {
          const nodeVersion = process.version;
          const major = parseInt(nodeVersion.slice(1).split(".")[0]);

          if (major >= 20) {
            return { status: "pass", message: nodeVersion };
          } else if (major >= 18) {
            return { status: "warn", message: `${nodeVersion} (20+ recommended)` };
          }
          return { status: "fail", message: `${nodeVersion} (need 18+)` };
        },
        fix: "Install Node.js 20+ from nodejs.org",
      },
      {
        id: "git",
        name: "Git installation",
        check: async () => {
          try {
            const { execSync } = await import("child_process");
            const version = execSync("git --version", { encoding: "utf8" }).trim();
            return { status: "pass", message: version.replace("git version ", "") };
          } catch {
            return { status: "fail", message: "Git not found" };
          }
        },
        fix: "Install Git from git-scm.com",
      },
      {
        id: "tmux",
        name: "tmux (for orchestration)",
        check: async () => {
          try {
            const { execSync } = await import("child_process");
            const version = execSync("tmux -V", { encoding: "utf8" }).trim();
            return { status: "pass", message: version };
          } catch {
            return {
              status: "info",
              message: "Not installed (optional for orchestration)",
            };
          }
        },
        fix: "brew install tmux (macOS) or apt install tmux (Linux)",
      },
    ],
  },
  ralph: {
    name: "Ralph Loop",
    checks: [
      {
        id: "ralph-scripts",
        name: "Ralph loop scripts",
        check: async (targetDir) => {
          const ralphDir = path.join(targetDir, "scripts", "ralph");
          const ralphScript = path.join(ralphDir, "sigma-ralph.sh");

          if (await fs.pathExists(ralphScript)) {
            // Check if executable
            try {
              const { execSync } = await import("child_process");
              execSync(`test -x "${ralphScript}"`, { stdio: "pipe" });
              return { status: "pass", message: "Installed and executable" };
            } catch {
              return { status: "warn", message: "Not executable (chmod +x needed)" };
            }
          }
          return { status: "info", message: "Not installed" };
        },
        fix: "Scripts copied during platform install",
      },
      {
        id: "schemas",
        name: "Ralph JSON schemas",
        check: async (targetDir) => {
          const schemaPaths = [
            ".cursor/schemas",
            ".claude/schemas",
            ".opencode/schemas",
          ];

          for (const schemaPath of schemaPaths) {
            const fullPath = path.join(targetDir, schemaPath);
            if (await fs.pathExists(fullPath)) {
              return { status: "pass", message: `Found in ${schemaPath}` };
            }
          }
          return { status: "info", message: "Not installed" };
        },
        fix: "Schemas copied during platform install",
      },
    ],
  },
  orchestration: {
    name: "Orchestration",
    checks: [
      {
        id: "orchestrator-scripts",
        name: "Orchestration scripts",
        check: async (targetDir) => {
          const orchestratorDir = path.join(targetDir, "scripts", "orchestrator");
          const spawnScript = path.join(orchestratorDir, "spawn-streams.sh");
          const orchestratorPy = path.join(orchestratorDir, "orchestrator.py");

          const hasSpawn = await fs.pathExists(spawnScript);
          const hasOrchestrator = await fs.pathExists(orchestratorPy);

          if (hasSpawn && hasOrchestrator) {
            return { status: "pass", message: "All scripts present" };
          } else if (hasSpawn || hasOrchestrator) {
            return { status: "warn", message: "Partial installation" };
          }
          return { status: "info", message: "Not installed" };
        },
        fix: "Run: sigma orchestrate (installs on first use)",
      },
      {
        id: "streams-config",
        name: "Streams configuration",
        check: async (targetDir) => {
          const configPath = path.join(
            targetDir,
            ".sigma",
            "orchestration",
            "streams.json"
          );

          if (await fs.pathExists(configPath)) {
            try {
              const config = await fs.readJson(configPath);
              const streamCount = config.streams?.length || 0;
              return { status: "pass", message: `${streamCount} streams configured` };
            } catch {
              return { status: "warn", message: "Invalid streams.json" };
            }
          }
          return { status: "info", message: "No streams configured" };
        },
        fix: "Run: @step-11b-prd-swarm --orchestrate",
      },
      {
        id: "elevenlabs",
        name: "ElevenLabs voice notifications",
        check: async () => {
          const apiKey = process.env.ELEVENLABS_API_KEY;
          if (apiKey) {
            return {
              status: "pass",
              message: `API key configured (${apiKey.slice(0, 8)}...)`,
            };
          }
          return { status: "info", message: "Not configured (optional)" };
        },
        fix: "Set ELEVENLABS_API_KEY in .env",
      },
    ],
  },
};

/**
 * Run health checks
 */
export async function runDoctor(options = {}) {
  const targetDir = options.target || process.cwd();
  const verbose = options.verbose || false;

  console.log("");
  console.log(chalk.cyan.bold("🔍 Sigma Protocol Health Check\n"));
  console.log(chalk.gray(`Target: ${targetDir}\n`));

  const results = {
    pass: 0,
    warn: 0,
    fail: 0,
    info: 0,
    skip: 0,
  };

  const issues = [];
  const warnings = [];
  const fixes = [];

  // Run all checks
  for (const [categoryKey, category] of Object.entries(CHECKS)) {
    console.log(chalk.white.bold(`\n${category.name}`));

    for (const check of category.checks) {
      const spinner = ora({
        text: check.name,
        prefixText: "  ",
      }).start();

      try {
        const result = await check.check(targetDir);
        results[result.status]++;

        switch (result.status) {
          case "pass":
            spinner.succeed(
              chalk.green(check.name) + chalk.gray(` - ${result.message}`)
            );
            break;
          case "warn":
            spinner.warn(
              chalk.yellow(check.name) + chalk.gray(` - ${result.message}`)
            );
            warnings.push({ check: check.name, message: result.message });
            if (check.fix) fixes.push({ issue: check.name, fix: check.fix });
            break;
          case "fail":
            spinner.fail(
              chalk.red(check.name) + chalk.gray(` - ${result.message}`)
            );
            issues.push({ check: check.name, message: result.message });
            if (check.fix) fixes.push({ issue: check.name, fix: check.fix });
            break;
          case "info":
            spinner.info(
              chalk.blue(check.name) + chalk.gray(` - ${result.message}`)
            );
            break;
          case "skip":
            spinner.stopAndPersist({
              symbol: chalk.gray("○"),
              text: chalk.gray(check.name) + chalk.gray(` - ${result.message}`),
            });
            break;
        }
      } catch (error) {
        spinner.fail(chalk.red(check.name) + chalk.gray(` - Error: ${error.message}`));
        results.fail++;
        issues.push({ check: check.name, message: error.message });
      }
    }
  }

  // Calculate score
  const total = results.pass + results.warn + results.fail;
  const score = total > 0 ? Math.round((results.pass / total) * 100) : 0;

  // Summary
  console.log("");
  console.log(
    boxen(
      chalk.white.bold("Health Summary\n\n") +
        chalk.green(`  ✓ ${results.pass} passed\n`) +
        chalk.yellow(`  ⚠ ${results.warn} warnings\n`) +
        chalk.red(`  ✗ ${results.fail} failed\n`) +
        chalk.blue(`  ℹ ${results.info} informational\n`) +
        chalk.gray(`  ○ ${results.skip} skipped\n\n`) +
        chalk.white.bold("Health Score: ") +
        (score >= 80
          ? chalk.green.bold(`${score}%`)
          : score >= 50
            ? chalk.yellow.bold(`${score}%`)
            : chalk.red.bold(`${score}%`)),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: score >= 80 ? "green" : score >= 50 ? "yellow" : "red",
      }
    )
  );

  // Show fixes if there are issues
  if (fixes.length > 0 && (verbose || results.fail > 0)) {
    console.log(chalk.white.bold("\n🔧 Suggested Fixes:\n"));
    for (const { issue, fix } of fixes) {
      console.log(chalk.yellow(`  ${issue}:`));
      console.log(chalk.cyan(`    ${fix}\n`));
    }
  }

  // Offer auto-fix options if there are issues
  if (fixes.length > 0) {
    const inquirer = await import("inquirer");
    
    const { autoFix } = await inquirer.default.prompt([
      {
        type: "list",
        name: "autoFix",
        message: "How would you like to proceed?",
        choices: [
          { 
            name: "Fix all issues via Claude Code", 
            value: "claude" 
          },
          { 
            name: "Back to main menu", 
            value: "menu" 
          },
          { 
            name: "Exit", 
            value: "exit" 
          },
        ],
      },
    ]);

    if (autoFix === "claude") {
      // Select terminal backend
      const backend = await selectTerminalBackend();
      if (backend) {
        await spawnClaudeAutoFix(fixes, targetDir, backend);
      }
      return "fixed";
    } else if (autoFix === "menu") {
      return "menu";
    }
  }

  // Return status code
  return results.fail > 0 ? 1 : 0;
}

/**
 * Spawn Claude Code to auto-fix issues (supports iTerm2 or tmux)
 * @param {Array} fixes - List of fixes to apply
 * @param {string} targetDir - Target directory
 * @param {string} backend - Terminal backend ('iterm' | 'tmux')
 */
async function spawnClaudeAutoFix(fixes, targetDir, backend) {
  const { execSync } = await import("child_process");
  const sessionName = "sigma-doctor-fix";

  // Check for Claude Code
  if (!checkClaudeCode()) {
    console.log(chalk.red("\n❌ Claude Code is not installed."));
    console.log(chalk.white("Manual fix commands:"));
    for (const { fix } of fixes) {
      console.log(chalk.cyan(`  ${fix}`));
    }
    return;
  }

  // Build the fix prompt
  const fixList = fixes.map(f => `- ${f.issue}: ${f.fix}`).join("\n");
  const prompt = `@doctor-fix

Please fix the following health check issues in this project:

${fixList}

For each issue:
1. Determine what needs to be done
2. Execute the fix (create files, run commands, etc.)
3. Verify the fix worked
4. Report progress

Start with the most critical issues first.`;

  console.log(chalk.cyan("\n🚀 Spawning Claude Code to fix issues...\n"));

  // Use unified spawn function
  const success = await spawnClaude(prompt, {
    backend,
    sessionName,
    workdir: targetDir
  });

  if (success && backend === 'tmux') {
    // Ask if user wants to attach (only for tmux)
    const inquirer = await import("inquirer");
    const { attach } = await inquirer.default.prompt([
      {
        type: "confirm",
        name: "attach",
        message: "Attach to the session now?",
        default: true,
      },
    ]);

    if (attach) {
      execSync(`tmux attach -t ${sessionName}`, { stdio: "inherit" });
    }
  } else if (!success) {
    console.log(chalk.white("\nManual fix commands:"));
    for (const { fix } of fixes) {
      console.log(chalk.cyan(`  ${fix}`));
    }
  }
}

/**
 * Quick check for CLI usage
 */
export async function quickCheck(targetDir) {
  const manifestPath = path.join(targetDir, ".sigma-manifest.json");
  const hasManifest = await fs.pathExists(manifestPath);

  const platforms = [];
  if (await fs.pathExists(path.join(targetDir, ".cursor"))) {
    platforms.push("cursor");
  }
  if (await fs.pathExists(path.join(targetDir, ".claude"))) {
    platforms.push("claude-code");
  }
  if (await fs.pathExists(path.join(targetDir, ".opencode"))) {
    platforms.push("opencode");
  }
  if (
    (await fs.pathExists(path.join(targetDir, ".codex"))) ||
    (await fs.pathExists(path.join(targetDir, ".agents", "skills")))
  ) {
    platforms.push("codex");
  }

  return {
    installed: hasManifest || platforms.length > 0,
    hasManifest,
    platforms,
  };
}

export default { runDoctor, quickCheck };
