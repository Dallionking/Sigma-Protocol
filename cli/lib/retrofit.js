#!/usr/bin/env node

/**
 * Sigma Protocol Retrofit Wizard
 *
 * Interactive wizard for adding Sigma Protocol to existing projects.
 * Analyzes existing code and helps integrate Sigma methodology.
 */

import chalk from "chalk";
import inquirer from "inquirer";
import boxen from "boxen";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// Get CLI root directory for local execution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_ROOT = path.resolve(__dirname, "..");
const SIGMA_ROOT = path.resolve(CLI_ROOT, "..");

/**
 * Detect project type and stack
 */
async function detectProjectStack(targetDir) {
  const stack = {
    type: "unknown",
    framework: null,
    language: null,
    database: null,
    auth: null,
    hasTests: false,
    hasDocs: false,
    hasCI: false,
    files: {
      packageJson: false,
      requirements: false,
      cargoToml: false,
      goMod: false,
    },
  };

  // Check for package.json (Node.js/JavaScript)
  const packageJsonPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    stack.files.packageJson = true;
    stack.language = "JavaScript/TypeScript";

    try {
      const pkg = await fs.readJson(packageJsonPath);
      const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      // Detect framework
      if (deps.next) {
        stack.framework = "Next.js";
        stack.type = "web";
      } else if (deps.react && deps["react-native"]) {
        stack.framework = "React Native";
        stack.type = "mobile";
      } else if (deps.react) {
        stack.framework = "React";
        stack.type = "web";
      } else if (deps.vue) {
        stack.framework = "Vue.js";
        stack.type = "web";
      } else if (deps.express || deps.fastify || deps.koa) {
        stack.framework = deps.express ? "Express" : deps.fastify ? "Fastify" : "Koa";
        stack.type = "api";
      }

      // Detect database
      if (deps.prisma || deps["@prisma/client"]) {
        stack.database = "Prisma";
      } else if (deps.drizzle || deps["drizzle-orm"]) {
        stack.database = "Drizzle";
      } else if (deps.mongoose) {
        stack.database = "MongoDB (Mongoose)";
      } else if (deps["@supabase/supabase-js"]) {
        stack.database = "Supabase";
      }

      // Detect auth
      if (deps["next-auth"]) {
        stack.auth = "NextAuth";
      } else if (deps["@auth/core"] || deps["better-auth"]) {
        stack.auth = "Better Auth";
      } else if (deps["@supabase/supabase-js"]) {
        stack.auth = stack.auth || "Supabase Auth";
      }

      // Check for tests
      if (deps.jest || deps.vitest || deps.mocha || deps["@testing-library/react"]) {
        stack.hasTests = true;
      }
    } catch {
      // ignore parsing errors
    }
  }

  // Check for requirements.txt (Python)
  if (await fs.pathExists(path.join(targetDir, "requirements.txt"))) {
    stack.files.requirements = true;
    if (!stack.language) {
      stack.language = "Python";
      stack.type = "api";
    }
  }

  // Check for cargo.toml (Rust)
  if (await fs.pathExists(path.join(targetDir, "Cargo.toml"))) {
    stack.files.cargoToml = true;
    if (!stack.language) {
      stack.language = "Rust";
    }
  }

  // Check for go.mod (Go)
  if (await fs.pathExists(path.join(targetDir, "go.mod"))) {
    stack.files.goMod = true;
    if (!stack.language) {
      stack.language = "Go";
    }
  }

  // Check for docs
  stack.hasDocs =
    (await fs.pathExists(path.join(targetDir, "docs"))) ||
    (await fs.pathExists(path.join(targetDir, "documentation")));

  // Check for CI
  stack.hasCI =
    (await fs.pathExists(path.join(targetDir, ".github", "workflows"))) ||
    (await fs.pathExists(path.join(targetDir, ".gitlab-ci.yml"))) ||
    (await fs.pathExists(path.join(targetDir, ".circleci")));

  return stack;
}

/**
 * Check for existing Sigma documents
 */
async function detectSigmaDocs(targetDir) {
  const docs = {
    existing: [],
    missing: [],
  };

  const sigmaDocPaths = [
    { path: "docs/specs/MASTER_PRD.md", name: "Master PRD" },
    { path: "docs/architecture/ARCHITECTURE.md", name: "Architecture" },
    { path: "docs/ux/UX-DESIGN.md", name: "UX Design" },
    { path: "docs/flows/FLOW-TREE.md", name: "Flow Tree" },
    { path: "docs/wireframes/WIREFRAME-SPEC.md", name: "Wireframes" },
    { path: "docs/design/DESIGN-SYSTEM.md", name: "Design System" },
    { path: "docs/states/STATE-SPEC.md", name: "Interface States" },
    { path: "docs/technical/TECHNICAL-SPEC.md", name: "Technical Spec" },
    { path: "docs/prds", name: "PRD Directory" },
  ];

  for (const doc of sigmaDocPaths) {
    const fullPath = path.join(targetDir, doc.path);
    if (await fs.pathExists(fullPath)) {
      docs.existing.push(doc);
    } else {
      docs.missing.push(doc);
    }
  }

  return docs;
}

/**
 * Run the retrofit wizard
 */
export async function runRetrofitWizard(options = {}) {
  console.clear();
  console.log(
    boxen(
      chalk.cyan.bold("🔄 Add Sigma Protocol to Existing Project\n\n") +
        chalk.white(
          "This wizard will:\n" +
            "  1. Analyze your existing codebase\n" +
            "  2. Detect your tech stack\n" +
            "  3. Check for existing documentation\n" +
            "  4. Help you integrate Sigma methodology"
        ),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );

  const targetDir = options.target || process.cwd();

  // Step 1: Confirm directory
  console.log("");
  console.log(chalk.gray(`Target directory: ${targetDir}\n`));

  const { confirmDir } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmDir",
      message: "Is this the correct project directory?",
      default: true,
    },
  ]);

  if (!confirmDir) {
    const { newDir } = await inquirer.prompt([
      {
        type: "input",
        name: "newDir",
        message: "Enter the project directory path:",
        validate: async (input) => {
          if (await fs.pathExists(input)) return true;
          return "Directory does not exist";
        },
      },
    ]);
    options.target = newDir;
    return runRetrofitWizard(options);
  }

  // Step 2: Analyze project
  console.log("");
  let spinner = ora("Analyzing project structure...").start();

  const stack = await detectProjectStack(targetDir);
  spinner.succeed("Project structure analyzed");

  spinner = ora("Checking for existing Sigma documents...").start();
  const sigmaDocs = await detectSigmaDocs(targetDir);
  spinner.succeed("Documentation check complete");

  // Step 3: Display analysis results
  console.log("");
  console.log(
    boxen(
      chalk.white.bold("📊 Project Analysis\n\n") +
        chalk.gray("Language:    ") +
        chalk.white(stack.language || "Not detected") +
        "\n" +
        chalk.gray("Framework:   ") +
        chalk.white(stack.framework || "Not detected") +
        "\n" +
        chalk.gray("Type:        ") +
        chalk.white(stack.type || "Unknown") +
        "\n" +
        chalk.gray("Database:    ") +
        chalk.white(stack.database || "Not detected") +
        "\n" +
        chalk.gray("Auth:        ") +
        chalk.white(stack.auth || "Not detected") +
        "\n" +
        chalk.gray("Tests:       ") +
        (stack.hasTests ? chalk.green("Yes") : chalk.yellow("No")) +
        "\n" +
        chalk.gray("CI/CD:       ") +
        (stack.hasCI ? chalk.green("Yes") : chalk.yellow("No")) +
        "\n\n" +
        chalk.white.bold("📁 Sigma Documentation\n\n") +
        chalk.gray("Existing:    ") +
        chalk.green(sigmaDocs.existing.length + " documents") +
        "\n" +
        chalk.gray("Missing:     ") +
        chalk.yellow(sigmaDocs.missing.length + " documents"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "white",
      }
    )
  );

  // List existing and missing docs
  if (sigmaDocs.existing.length > 0) {
    console.log(chalk.green("\nExisting documents:"));
    sigmaDocs.existing.forEach((doc) =>
      console.log(chalk.green(`  ✓ ${doc.name}`))
    );
  }

  if (sigmaDocs.missing.length > 0) {
    console.log(chalk.yellow("\nMissing documents:"));
    sigmaDocs.missing.forEach((doc) =>
      console.log(chalk.yellow(`  ○ ${doc.name}`))
    );
  }

  // Step 4: Determine retrofit path
  console.log("");
  console.log(chalk.cyan.bold("🎯 Recommended Actions\n"));

  let retrofitMode = "full";

  if (sigmaDocs.existing.length > 0 && sigmaDocs.missing.length > 0) {
    // Partial docs exist
    retrofitMode = "partial";
    console.log(
      chalk.white(
        "You have some Sigma documents already. We recommend:\n" +
          "  • Generating missing documentation\n" +
          "  • Updating existing docs with latest frameworks\n"
      )
    );
  } else if (sigmaDocs.existing.length === 0) {
    // No docs - full retrofit
    retrofitMode = "full";
    console.log(
      chalk.white(
        "This appears to be a fresh retrofit. We recommend:\n" +
          "  • Running @retrofit-analyze for deep analysis\n" +
          "  • Generating all documentation from code\n" +
          "  • Running through Sigma steps 1-5 for planning\n"
      )
    );
  } else {
    // All docs exist
    retrofitMode = "update";
    console.log(
      chalk.green(
        "All core documentation exists! You might want to:\n" +
          "  • Update docs with latest frameworks\n" +
          "  • Run @gap-analysis to verify coverage\n"
      )
    );
  }

  // Step 5: Choose action
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        {
          name: "Install Sigma commands (required first)",
          value: "install",
        },
        {
          name: "Deep analysis (@retrofit-analyze) - analyze code patterns",
          value: "analyze",
        },
        {
          name: "Generate missing docs (@retrofit-generate)",
          value: "generate",
        },
        {
          name: "Update existing docs (@retrofit-enhance)",
          value: "enhance",
        },
        {
          name: "Generate Ralph backlog (@retrofit-enhance --ralph) - for autonomous implementation",
          value: "ralph",
        },
        {
          name: "Full retrofit (install + analyze + generate)",
          value: "full",
        },
        {
          name: "Show AI commands to run manually",
          value: "manual",
        },
        {
          name: "Return to menu",
          value: "cancel",
        },
      ],
    },
  ]);

  if (action === "cancel") {
    return "menu";
  }

  // Step 6: Execute action
  console.log("");

  if (action === "install" || action === "full") {
    spinner = ora("Installing Sigma Protocol commands...").start();

    try {
      const { spawnSync } = await import("child_process");

      // Try local CLI first, then fall back to npx
      const localCliPath = path.join(CLI_ROOT, "sigma-cli.js");
      let installResult;

      if (await fs.pathExists(localCliPath)) {
        // Running from local sigma-protocol repo - use spawnSync for safety
        spinner.text = "Installing from local Sigma Protocol...";
        installResult = spawnSync("node", [localCliPath, "install", `--target=${targetDir}`, "-y", "--modules=all"], {
          cwd: SIGMA_ROOT,
          timeout: 180000, // 3 minutes for full install
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        });
      } else {
        // Try npx as fallback (this won't work unless published to npm)
        spinner.text = "Trying npx fallback...";
        installResult = spawnSync("npx", ["sigma-protocol", "install", `--target=${targetDir}`, "-y", "--modules=all"], {
          cwd: targetDir,
          timeout: 180000,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
        });
      }

      if (installResult.status === 0) {
        spinner.succeed("Sigma Protocol commands installed");
      } else {
        throw new Error(installResult.stderr || installResult.stdout || "Unknown installation error");
      }
    } catch (error) {
      // Provide more detailed error info
      const errorMsg = error.message || "Unknown error";
      const isTimeout = errorMsg.includes("ETIMEDOUT") || errorMsg.includes("timeout");
      const isNotFound = errorMsg.includes("ENOENT") || errorMsg.includes("not found");

      if (isTimeout) {
        spinner.warn("Installation timed out - try running manually: node cli/sigma-cli.js install");
      } else if (isNotFound) {
        spinner.warn("CLI not found - ensure you're running from sigma-protocol directory");
      } else {
        spinner.warn(`Auto-install failed: ${errorMsg.substring(0, 100)}`);
      }

      console.log(chalk.gray("\nTry manual installation:"));
      console.log(chalk.cyan("  cd /path/to/sigma-protocol"));
      console.log(chalk.cyan(`  node cli/sigma-cli.js install --target="${targetDir}"`));
    }
  }

  // Create minimal Sigma structure if needed
  spinner = ora("Setting up Sigma directory structure...").start();

  try {
    await fs.ensureDir(path.join(targetDir, ".sigma", "context"));
    await fs.ensureDir(path.join(targetDir, ".sigma", "rules"));
    await fs.ensureDir(path.join(targetDir, "docs", "specs"));
    await fs.ensureDir(path.join(targetDir, "docs", "prds"));

    // Create or update manifest
    const manifestPath = path.join(targetDir, ".sigma-manifest.json");
    let manifest = {
      sigma_version: "3.0.0",
      initialized: new Date().toISOString(),
      retrofit: true,
      detected_stack: stack,
      retrofit_mode: retrofitMode,
    };

    if (await fs.pathExists(manifestPath)) {
      try {
        const existing = await fs.readJson(manifestPath);
        manifest = { ...existing, ...manifest, last_sync: new Date().toISOString() };
      } catch {
        // ignore
      }
    }

    await fs.writeJson(manifestPath, manifest, { spaces: 2 });
    spinner.succeed("Sigma directory structure created");
  } catch (error) {
    spinner.fail(`Setup failed: ${error.message}`);
  }

  // Show next steps based on action
  console.log("");

  if (action === "manual") {
    console.log(
      boxen(
        chalk.cyan.bold("AI Commands to Run\n\n") +
          chalk.white("Run these in your AI IDE (Cursor/Claude Code):\n\n") +
          chalk.yellow("Step 1: Deep Analysis\n") +
          chalk.gray("  @retrofit-analyze\n\n") +
          chalk.yellow("Step 2: Generate Documentation\n") +
          chalk.gray("  @retrofit-generate --priority=high\n\n") +
          chalk.yellow("Step 3: Verify Coverage\n") +
          chalk.gray("  @gap-analysis\n\n") +
          chalk.yellow("Step 4: Update with Latest Frameworks\n") +
          chalk.gray("  @retrofit-enhance --mode=update\n"),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "yellow",
        }
      )
    );
  } else if (action === "full") {
    console.log(
      boxen(
        chalk.green.bold("✅ Sigma Protocol Installed!\n\n") +
          chalk.white("Next steps in your AI IDE:\n\n") +
          chalk.cyan("  1. @retrofit-analyze") +
          chalk.gray("    (deep code analysis)\n") +
          chalk.cyan("  2. @retrofit-generate") +
          chalk.gray("  (generate docs from code)\n") +
          chalk.cyan("  3. @gap-analysis") +
          chalk.gray("      (verify coverage)\n\n") +
          chalk.gray("Or continue developing with:\n") +
          chalk.cyan("  @continue") +
          chalk.gray("        (find next task)\n"),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "green",
        }
      )
    );
  } else if (action === "ralph") {
    console.log(
      boxen(
        chalk.green.bold("✅ Ready for Ralph Backlog Generation!\n\n") +
          chalk.white("Run this command in your AI IDE:\n\n") +
          chalk.cyan("  @retrofit-enhance --ralph\n\n") +
          chalk.gray("This will:\n") +
          chalk.gray("  • Scan docs/prds/ for existing PRDs\n") +
          chalk.gray("  • Auto-detect platforms (iOS, Web, etc.)\n") +
          chalk.gray("  • Generate docs/ralph/*/prd.json backlogs\n\n") +
          chalk.white("Then run the Ralph loop:\n\n") +
          chalk.cyan("  sigma ralph --all --parallel") +
          chalk.gray("  (run all platforms)\n") +
          chalk.cyan("  sigma ralph -b docs/ralph/ios/prd.json") +
          chalk.gray("  (single platform)\n"),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "green",
        }
      )
    );
  } else {
    console.log(
      boxen(
        chalk.green.bold("✅ Setup Complete!\n\n") +
          chalk.white("Run this command in your AI IDE:\n\n") +
          chalk.cyan(
            action === "analyze"
              ? "  @retrofit-analyze"
              : action === "generate"
                ? "  @retrofit-generate --priority=high"
                : "  @retrofit-enhance --mode=update"
          ) +
          "\n\n" +
          chalk.gray("The AI will guide you through the process."),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "green",
        }
      )
    );
  }

  // Wait for user
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: "Press Enter to continue...",
    },
  ]);

  return "exit";
}

export default { runRetrofitWizard };

