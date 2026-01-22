#!/usr/bin/env node

/**
 * Sigma Protocol Maid - Repository Maintenance
 *
 * Interactive wizard for repository cleanup and code simplification.
 * Spawns Claude Code via iTerm2 or tmux for AI-powered operations.
 */

import chalk from "chalk";
import inquirer from "inquirer";
import boxen from "boxen";
import ora from "ora";
import { execSync } from "child_process";
import path from "path";
import { 
  spawnClaude, 
  selectTerminalBackend 
} from "./terminal-utils.js";

/**
 * Quick scan (non-AI) - find obvious cruft files
 * @param {string} targetDir - Directory to scan
 * @returns {string[]} - List of found cruft files
 */
export async function runQuickScan(targetDir = process.cwd()) {
  const spinner = ora("Scanning for cruft files...").start();

  const cruftPatterns = [
    ".DS_Store",
    "Thumbs.db",
    "*.tmp",
    "*.temp",
    "*~",
    "*.swp",
    "*.bak",
    "*.log",
    "*.heapsnapshot",
  ];

  const cruftDirs = [".next/cache", "node_modules/.cache", "coverage/", ".turbo/"];

  let found = [];

  // Scan for cruft files
  for (const pattern of cruftPatterns) {
    try {
      const result = execSync(
        `find . -name "${pattern}" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -50`,
        { cwd: targetDir, encoding: "utf8" }
      );
      if (result.trim()) {
        found.push(...result.trim().split("\n").filter(Boolean));
      }
    } catch {
      // Pattern not found
    }
  }

  // Check for cruft directories
  for (const dir of cruftDirs) {
    try {
      const fullPath = path.join(targetDir, dir);
      const result = execSync(`test -d "${fullPath}" && echo "${dir}"`, {
        cwd: targetDir,
        encoding: "utf8",
      });
      if (result.trim()) {
        found.push(result.trim());
      }
    } catch {
      // Dir doesn't exist
    }
  }

  // Remove duplicates
  found = [...new Set(found)];

  spinner.succeed(`Found ${found.length} cruft items`);

  if (found.length > 0) {
    console.log("");
    console.log(chalk.yellow.bold("Cruft files/directories found:"));
    console.log("");

    // Group by type
    const files = found.filter((f) => !f.endsWith("/"));
    const dirs = found.filter((f) => f.endsWith("/") || cruftDirs.some((d) => f.includes(d)));

    if (files.length > 0) {
      console.log(chalk.gray("  Files:"));
      files.slice(0, 15).forEach((f) => console.log(chalk.red(`    ${f}`)));
      if (files.length > 15) {
        console.log(chalk.gray(`    ... and ${files.length - 15} more files`));
      }
    }

    if (dirs.length > 0) {
      console.log(chalk.gray("\n  Directories:"));
      dirs.forEach((d) => console.log(chalk.red(`    ${d}`)));
    }

    console.log("");
    console.log(
      chalk.gray("Run ") +
        chalk.cyan("@maid --analyze") +
        chalk.gray(" in Claude Code for deep analysis")
    );
  } else {
    console.log(chalk.green("\n✨ No obvious cruft files found!"));
  }

  return found;
}

/**
 * Check for pending deletions in .deleted folder
 * @param {string} targetDir - Directory to check
 */
async function checkPendingDeletions(targetDir = process.cwd()) {
  const deletedPath = path.join(targetDir, ".deleted");

  try {
    const reviewPath = path.join(deletedPath, "review");
    const confirmedPath = path.join(deletedPath, "confirmed");

    let reviewCount = 0;
    let confirmedCount = 0;

    try {
      const reviewResult = execSync(
        `find "${reviewPath}" -type f 2>/dev/null | wc -l`,
        { encoding: "utf8" }
      );
      reviewCount = parseInt(reviewResult.trim()) || 0;
    } catch {
      // Review folder doesn't exist
    }

    try {
      const confirmedResult = execSync(
        `find "${confirmedPath}" -type f 2>/dev/null | wc -l`,
        { encoding: "utf8" }
      );
      confirmedCount = parseInt(confirmedResult.trim()) || 0;
    } catch {
      // Confirmed folder doesn't exist
    }

    if (reviewCount === 0 && confirmedCount === 0) {
      console.log(chalk.green("\n✨ No pending deletions!"));
      console.log(chalk.gray("The .deleted folder is empty or doesn't exist."));
      return;
    }

    console.log("");
    console.log(
      boxen(
        chalk.white.bold("Pending Deletions\n\n") +
          chalk.yellow(`📋 Needs Review:  ${reviewCount} files\n`) +
          chalk.red(`🗑️  Confirmed:     ${confirmedCount} files\n\n`) +
          chalk.gray("Review paths:\n") +
          chalk.cyan("  .deleted/review/\n") +
          chalk.cyan("  .deleted/confirmed/"),
        {
          padding: 1,
          borderColor: "yellow",
        }
      )
    );

    if (confirmedCount > 0) {
      console.log("");
      console.log(
        chalk.yellow("⚠️  Run ") +
          chalk.cyan("@maid --confirm-delete") +
          chalk.yellow(" to permanently delete confirmed files")
      );
    }
  } catch (error) {
    console.log(chalk.gray("\nNo .deleted folder found."));
  }
}

/**
 * Main maid wizard
 * @param {Object} options - Wizard options
 * @param {string} [options.backend] - Terminal backend ('iterm' | 'tmux')
 * @returns {string} - Next action ('menu', 'exit', etc.)
 */
export async function runMaidWizard(options = {}) {
  const { backend: backendOverride } = options;
  
  // Select terminal backend upfront if AI operations will be used
  const backend = await selectTerminalBackend(backendOverride);
  
  console.clear();
  console.log(
    boxen(
      chalk.cyan.bold("🧹 MAID — Repository Maintenance\n\n") +
        chalk.white(
          "Clean up files, simplify code, and maintain your codebase.\n" +
            `AI-powered operations run via Claude Code in ${backend === 'iterm' ? 'iTerm2' : 'tmux'}.`
        ),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        {
          name: "1. Quick Scan (no AI) — Find obvious cruft files",
          value: "quick",
        },
        new inquirer.Separator("─── AI-Powered (requires Claude Code) ───"),
        {
          name: "2. Deep Cleanup — Content-aware file analysis",
          value: "cleanup",
        },
        {
          name: "3. Code Simplify — Find refactoring opportunities",
          value: "simplify",
        },
        {
          name: "4. Full Suite — Cleanup + Simplify",
          value: "all",
        },
        new inquirer.Separator("─── Review ───"),
        {
          name: "5. Review pending deletions",
          value: "review",
        },
        new inquirer.Separator(),
        {
          name: "0. Back to main menu",
          value: "cancel",
        },
      ],
    },
  ]);

  if (action === "cancel") {
    return "menu";
  }

  switch (action) {
    case "quick":
      await runQuickScan();
      break;

    case "cleanup": {
      console.log(
        chalk.cyan("\n📦 Launching Deep Cleanup via Claude Code...\n")
      );
      const cleanupSuccess = await spawnClaude("@maid --analyze --deep-analysis", {
        backend,
        sessionName: "sigma-maid"
      });
      if (cleanupSuccess && backend === 'tmux') {
        const { attach } = await inquirer.prompt([
          {
            type: "confirm",
            name: "attach",
            message: "Attach to tmux session now?",
            default: true,
          },
        ]);
        if (attach) {
          execSync("tmux attach -t sigma-maid", { stdio: "inherit" });
        }
      }
      break;
    }

    case "simplify": {
      console.log(
        chalk.cyan("\n🔧 Launching Code Simplification via Claude Code...\n")
      );
      const simplifySuccess = await spawnClaude("@simplify --scope=recent", {
        backend,
        sessionName: "sigma-maid"
      });
      if (simplifySuccess && backend === 'tmux') {
        const { attach } = await inquirer.prompt([
          {
            type: "confirm",
            name: "attach",
            message: "Attach to tmux session now?",
            default: true,
          },
        ]);
        if (attach) {
          execSync("tmux attach -t sigma-maid", { stdio: "inherit" });
        }
      }
      break;
    }

    case "all": {
      console.log(
        chalk.cyan("\n🚀 Launching Full Maintenance Suite via Claude Code...\n")
      );
      const allSuccess = await spawnClaude("@maid --all", {
        backend,
        sessionName: "sigma-maid"
      });
      if (allSuccess && backend === 'tmux') {
        const { attach } = await inquirer.prompt([
          {
            type: "confirm",
            name: "attach",
            message: "Attach to tmux session now?",
            default: true,
          },
        ]);
        if (attach) {
          execSync("tmux attach -t sigma-maid", { stdio: "inherit" });
        }
      }
      break;
    }

    case "review":
      await checkPendingDeletions();
      break;
  }

  // Wait for user before returning
  console.log("");
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: "Press Enter to continue...",
    },
  ]);

  return "exit";
}

// Re-export spawnClaudeInTmux for backwards compatibility
export { spawnClaudeInTmux } from "./terminal-utils.js";

export default { runMaidWizard, runQuickScan };

