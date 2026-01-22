#!/usr/bin/env node

/**
 * Sigma Protocol New Project Wizard
 *
 * Interactive wizard for creating a new project with Sigma Protocol.
 * Guides users through boilerplate selection, initialization, and first steps.
 */

import chalk from "chalk";
import inquirer from "inquirer";
import boxen from "boxen";
import ora from "ora";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");

/**
 * Available boilerplate templates
 */
const BOILERPLATES = {
  "nextjs-saas": {
    name: "Next.js SaaS",
    description: "Full-stack SaaS with Supabase, Stripe, Auth",
    stack: ["Next.js 15", "Supabase", "Stripe", "Vercel AI"],
    recommended: true,
  },
  "nextjs-ai": {
    name: "Next.js AI",
    description: "AI-first app with Convex and real-time features",
    stack: ["Next.js 15", "Convex", "AI SDK", "Real-time"],
    recommended: false,
  },
  "nextjs-portable": {
    name: "Next.js Portable",
    description: "Flexible stack with Drizzle ORM and Better Auth",
    stack: ["Next.js 15", "Drizzle", "Better Auth", "PostgreSQL"],
    recommended: false,
  },
  "expo-mobile": {
    name: "Expo Mobile",
    description: "React Native app with Supabase and RevenueCat",
    stack: ["Expo SDK 52", "Supabase", "RevenueCat", "React Native"],
    recommended: false,
  },
  "tanstack-saas": {
    name: "TanStack SaaS",
    description: "Modern SaaS with TanStack Start and Stripe",
    stack: ["TanStack Start", "Supabase", "Stripe", "Vite"],
    recommended: false,
  },
  custom: {
    name: "Custom (No Boilerplate)",
    description: "Start from scratch with your own stack",
    stack: ["Your choice"],
    recommended: false,
  },
};

/**
 * AI platform options
 */
const PLATFORMS = {
  cursor: {
    name: "Cursor",
    description: "Cursor IDE with @commands",
  },
  "claude-code": {
    name: "Claude Code",
    description: "Claude Code CLI with /commands",
  },
  opencode: {
    name: "OpenCode",
    description: "OpenCode with /commands and agents",
  },
};

/**
 * Run the new project wizard
 */
export async function runNewProjectWizard(options = {}) {
  console.clear();
  console.log(
    boxen(
      chalk.cyan.bold("🚀 Create a New Project with Sigma Protocol\n\n") +
        chalk.white(
          "This wizard will help you:\n" +
            "  1. Choose a boilerplate template\n" +
            "  2. Configure your project\n" +
            "  3. Install Sigma Protocol commands\n" +
            "  4. Get started with your first step"
        ),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );

  // Step 1: Project name and location
  const { projectName, projectDir } = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What's your project name?",
      default: "my-sigma-project",
      validate: (input) => {
        if (!input.trim()) return "Project name is required";
        if (!/^[a-z0-9-_]+$/i.test(input))
          return "Use only letters, numbers, hyphens, and underscores";
        return true;
      },
    },
    {
      type: "input",
      name: "projectDir",
      message: "Where should we create it?",
      default: (answers) => `./${answers.projectName}`,
    },
  ]);

  // Check if directory exists
  const fullPath = path.resolve(projectDir);
  if (await fs.pathExists(fullPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: `Directory ${projectDir} already exists. Continue anyway?`,
        default: false,
      },
    ]);
    if (!overwrite) {
      console.log(chalk.yellow("\nProject creation cancelled.\n"));
      return "menu";
    }
  }

  // Step 2: Boilerplate selection
  console.log("");
  console.log(chalk.cyan.bold("📦 Choose Your Starting Point\n"));

  const boilerplateChoices = Object.entries(BOILERPLATES).map(
    ([id, config]) => ({
      name:
        `${config.name}${config.recommended ? chalk.green(" (recommended)") : ""}\n` +
        chalk.gray(`     ${config.description}\n`) +
        chalk.gray(`     Stack: ${config.stack.join(", ")}`),
      value: id,
      short: config.name,
    })
  );

  const { boilerplate } = await inquirer.prompt([
    {
      type: "list",
      name: "boilerplate",
      message: "Select a boilerplate template:",
      choices: boilerplateChoices,
      pageSize: 12,
    },
  ]);

  // Step 3: Platform selection
  console.log("");
  console.log(chalk.cyan.bold("🖥️ Choose Your AI Platform\n"));

  const platformChoices = Object.entries(PLATFORMS).map(([id, config]) => ({
    name: `${config.name} - ${config.description}`,
    value: id,
    checked: true,
  }));

  const { platforms } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "platforms",
      message: "Which AI platforms will you use? (space to toggle)",
      choices: platformChoices,
      validate: (answer) => {
        if (answer.length < 1) return "Select at least one platform";
        return true;
      },
    },
  ]);

  // Step 4: Product idea (optional)
  console.log("");
  console.log(chalk.cyan.bold("💡 Quick Product Description (Optional)\n"));
  console.log(
    chalk.gray(
      "Tell us briefly about your product idea. This helps us customize\n" +
        "the initial setup. You can skip this and define it in Step 1 later.\n"
    )
  );

  const { productIdea } = await inquirer.prompt([
    {
      type: "input",
      name: "productIdea",
      message: "What are you building? (press Enter to skip)",
      default: "",
    },
  ]);

  // Step 5: Confirmation
  console.log("");
  console.log(
    boxen(
      chalk.white.bold("Project Summary\n\n") +
        chalk.gray("Name:        ") +
        chalk.white(projectName) +
        "\n" +
        chalk.gray("Location:    ") +
        chalk.white(fullPath) +
        "\n" +
        chalk.gray("Boilerplate: ") +
        chalk.white(BOILERPLATES[boilerplate].name) +
        "\n" +
        chalk.gray("Platforms:   ") +
        chalk.white(platforms.map((p) => PLATFORMS[p].name).join(", ")) +
        (productIdea
          ? "\n" + chalk.gray("Idea:        ") + chalk.white(productIdea)
          : ""),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "white",
      }
    )
  );

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Ready to create your project?",
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow("\nProject creation cancelled.\n"));
    return "menu";
  }

  // Step 6: Create project
  console.log("");
  let spinner = ora("Creating project directory...").start();

  try {
    // Create directory
    await fs.ensureDir(fullPath);
    spinner.succeed("Project directory created");

    // Copy boilerplate if not custom
    if (boilerplate !== "custom") {
      spinner = ora(`Copying ${BOILERPLATES[boilerplate].name} template...`).start();

      const boilerplatePath = path.join(
        ROOT_DIR,
        "templates",
        "boilerplates",
        boilerplate
      );

      if (await fs.pathExists(boilerplatePath)) {
        await fs.copy(boilerplatePath, fullPath, {
          filter: (src) => {
            // Skip node_modules and other development files
            const relativePath = path.relative(boilerplatePath, src);
            return (
              !relativePath.includes("node_modules") &&
              !relativePath.includes(".git")
            );
          },
        });
        spinner.succeed("Boilerplate template copied");
      } else {
        spinner.warn(
          `Boilerplate ${boilerplate} not found locally, creating minimal structure`
        );

        // Create minimal package.json
        const packageJson = {
          name: projectName,
          version: "0.1.0",
          description: productIdea || `A ${BOILERPLATES[boilerplate].name} project`,
          private: true,
          scripts: {
            dev: "echo 'Install dependencies first'",
            build: "echo 'Install dependencies first'",
          },
        };
        await fs.writeJson(path.join(fullPath, "package.json"), packageJson, {
          spaces: 2,
        });
      }
    } else {
      // Custom project - create minimal structure
      spinner = ora("Creating minimal project structure...").start();

      const packageJson = {
        name: projectName,
        version: "0.1.0",
        description: productIdea || "A Sigma Protocol project",
        private: true,
        scripts: {},
      };
      await fs.writeJson(path.join(fullPath, "package.json"), packageJson, {
        spaces: 2,
      });

      spinner.succeed("Minimal structure created");
    }

    // Install Sigma Protocol commands
    spinner = ora("Installing Sigma Protocol commands...").start();

    // Import and run the build functions from sigma-cli.js
    const { execSync } = await import("child_process");

    try {
      execSync(
        `cd "${fullPath}" && npx sigma-protocol install --target="${fullPath}" -y`,
        { stdio: "pipe" }
      );
      spinner.succeed("Sigma Protocol commands installed");
    } catch {
      // If npx fails, try local build
      spinner.text = "Installing Sigma Protocol (local mode)...";

      // Create .sigma directories
      await fs.ensureDir(path.join(fullPath, ".sigma", "context"));
      await fs.ensureDir(path.join(fullPath, ".sigma", "rules"));
      await fs.ensureDir(path.join(fullPath, "docs", "specs"));
      await fs.ensureDir(path.join(fullPath, "docs", "prds"));

      // Create manifest
      const manifest = {
        sigma_version: "3.0.0",
        initialized: new Date().toISOString(),
        project_info: {
          name: projectName,
          boilerplate: boilerplate !== "custom" ? boilerplate : null,
          product_idea: productIdea || null,
        },
        platforms: platforms,
      };
      await fs.writeJson(path.join(fullPath, ".sigma-manifest.json"), manifest, {
        spaces: 2,
      });

      spinner.succeed("Sigma Protocol initialized (commands will be installed on first AI interaction)");
    }

    // Create initial context files
    spinner = ora("Setting up project context...").start();

    // Create .sigma/context/project.json
    const projectContext = {
      generated_at: new Date().toISOString(),
      name: projectName,
      boilerplate: boilerplate !== "custom" ? boilerplate : null,
      product_idea: productIdea || null,
      current_step: 0,
      summary: "Project initialized with Sigma Protocol. Ready for Step 1: Ideation.",
    };
    await fs.writeJson(
      path.join(fullPath, ".sigma", "context", "project.json"),
      projectContext,
      { spaces: 2 }
    );

    spinner.succeed("Project context initialized");

    // Save product idea to docs if provided
    if (productIdea) {
      spinner = ora("Saving product idea...").start();
      const ideaPath = path.join(fullPath, "docs", "specs", "IDEA.md");
      await fs.writeFile(
        ideaPath,
        `# Product Idea\n\n${productIdea}\n\n---\n\n*Created with Sigma Protocol. Run @step-1-ideation to expand this into a full product vision.*\n`
      );
      spinner.succeed("Product idea saved to docs/specs/IDEA.md");
    }
  } catch (error) {
    spinner.fail(`Error: ${error.message}`);
    return "menu";
  }

  // Success message with next steps
  console.log("");
  console.log(
    boxen(
      chalk.green.bold("✅ Project Created Successfully!\n\n") +
        chalk.white.bold("Next Steps:\n\n") +
        chalk.cyan(`  1. cd ${projectDir}\n\n`) +
        (boilerplate !== "custom"
          ? chalk.cyan("  2. npm install\n\n")
          : chalk.cyan("  2. Initialize your preferred framework\n\n")) +
        chalk.cyan("  3. Open in your AI IDE (Cursor/Claude Code)\n\n") +
        chalk.cyan("  4. Run: @step-1-ideation") +
        (productIdea ? "" : " [your product idea]") +
        "\n\n" +
        chalk.gray("─────────────────────────────────────────────\n\n") +
        chalk.white.bold("Quick Commands in Your IDE:\n\n") +
        chalk.gray("  @step-1-ideation    ") +
        chalk.white("Start product ideation\n") +
        chalk.gray("  @step-2-architecture") +
        chalk.white("Design system architecture\n") +
        chalk.gray("  @continue     ") +
        chalk.white("Find next task\n") +
        chalk.gray("  @gap-analysis       ") +
        chalk.white("Verify implementation\n"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "green",
      }
    )
  );

  // Ask if they want to open the project
  const { openProject } = await inquirer.prompt([
    {
      type: "confirm",
      name: "openProject",
      message: `Open ${projectDir} in your default editor?`,
      default: true,
    },
  ]);

  if (openProject) {
    try {
      const { exec } = await import("child_process");
      // Try cursor first, then code, then default
      exec(`cursor "${fullPath}" 2>/dev/null || code "${fullPath}" 2>/dev/null || open "${fullPath}"`, {
        stdio: "pipe",
      });
      console.log(chalk.green("\n✓ Opening project in editor...\n"));
    } catch {
      console.log(
        chalk.gray(`\nTo open manually: cd ${projectDir} && cursor . (or code .)\n`)
      );
    }
  }

  return "exit";
}

export default { runNewProjectWizard };

