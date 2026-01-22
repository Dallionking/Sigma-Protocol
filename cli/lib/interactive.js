#!/usr/bin/env node

/**
 * Sigma Protocol Interactive Menu
 *
 * Main interactive interface when user types `sigma` with no arguments.
 * Provides a guided experience for all Sigma Protocol operations.
 */

import chalk from "chalk";
import inquirer from "inquirer";
import boxen from "boxen";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import gradient from "gradient-string";
import terminalLink from "terminal-link";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Custom Sigma gradient theme (cyan to purple)
 */
const sigmaGradient = gradient(["#00d4ff", "#7b68ee", "#9370db"]);

/**
 * Display the Sigma ASCII banner with gradient
 */
export function showSigmaBanner() {
  // ASCII art without box - Unicode blocks have inconsistent terminal widths
  const banner = `
  ███████╗██╗ ██████╗ ███╗   ███╗ █████╗
  ██╔════╝██║██╔════╝ ████╗ ████║██╔══██╗
  ███████╗██║██║  ███╗██╔████╔██║███████║
  ╚════██║██║██║   ██║██║╚██╔╝██║██╔══██║
  ███████║██║╚██████╔╝██║ ╚═╝ ██║██║  ██║
  ╚══════╝╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝ PROTOCOL

  The AI-Native Development Workflow
`;

  console.log(sigmaGradient.multiline(banner));
}

/**
 * Get version from package.json
 */
async function getVersion() {
  try {
    const pkgPath = path.resolve(__dirname, "../../package.json");
    const pkg = await fs.readJson(pkgPath);
    return pkg.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
}

/**
 * Detect project context
 */
async function detectProjectContext(targetDir) {
  const context = {
    hasPackageJson: false,
    hasSigma: false,
    hasDocs: false,
    platforms: [],
    projectName: null,
  };

  // Check for package.json
  const pkgPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(pkgPath)) {
    context.hasPackageJson = true;
    try {
      const pkg = await fs.readJson(pkgPath);
      context.projectName = pkg.name;
    } catch {
      // ignore
    }
  }

  // Check for Sigma installation
  const manifestPath = path.join(targetDir, ".sigma-manifest.json");
  context.hasSigma = await fs.pathExists(manifestPath);

  // Check for docs
  context.hasDocs = await fs.pathExists(path.join(targetDir, "docs"));

  // Check platforms
  if (await fs.pathExists(path.join(targetDir, ".cursor"))) {
    context.platforms.push("cursor");
  }
  if (await fs.pathExists(path.join(targetDir, ".claude"))) {
    context.platforms.push("claude-code");
  }
  if (await fs.pathExists(path.join(targetDir, ".opencode"))) {
    context.platforms.push("opencode");
  }

  return context;
}

/**
 * Main interactive menu
 */
export async function showInteractiveMenu(options = {}) {
  showSigmaBanner();

  const version = await getVersion();
  const targetDir = options.target || process.cwd();
  const context = await detectProjectContext(targetDir);

  // Show context info
  console.log("");
  if (context.projectName) {
    console.log(chalk.gray(`  Project: ${context.projectName}`));
  }
  console.log(chalk.gray(`  Directory: ${targetDir}`));
  console.log(chalk.gray(`  Version: ${version}`));

  if (context.hasSigma) {
    console.log(chalk.green(`  Status: Sigma Protocol installed`));
    if (context.platforms.length > 0) {
      console.log(chalk.gray(`  Platforms: ${context.platforms.join(", ")}`));
    }
  } else if (context.hasPackageJson) {
    console.log(chalk.yellow(`  Status: Project exists, Sigma not installed`));
  } else {
    console.log(chalk.gray(`  Status: No project detected`));
  }

  console.log("");

  // Build menu choices based on context
  const choices = [];

  if (!context.hasSigma && !context.hasPackageJson) {
    // Fresh start - new project is most relevant
    choices.push({
      name: `${chalk.green("[1]")} Start a new project          ${chalk.gray("(guided walkthrough)")}`,
      value: "new",
    });
    choices.push({
      name: `${chalk.blue("[2]")} Add to existing project      ${chalk.gray("(retrofit)")}`,
      value: "retrofit",
    });
  } else if (context.hasPackageJson && !context.hasSigma) {
    // Existing project without Sigma - retrofit is most relevant
    choices.push({
      name: `${chalk.green("[1]")} Add Sigma to this project    ${chalk.gray("(install)")}`,
      value: "install",
    });
    choices.push({
      name: `${chalk.blue("[2]")} Retrofit with analysis       ${chalk.gray("(retrofit)")}`,
      value: "retrofit",
    });
  } else {
    // Sigma installed - show project-specific options
    choices.push({
      name: `${chalk.green("[1]")} Continue development         ${chalk.gray("(next task)")}`,
      value: "continue",
    });
    choices.push({
      name: `${chalk.blue("[2]")} Start a new feature          ${chalk.gray("(add PRD)")}`,
      value: "feature",
    });
    choices.push({
      name: `${chalk.yellow("[3]")} Update Sigma assets           ${chalk.gray("(sync commands & skills)")}`,
      value: "update",
    });
  }

  // Always available options
  choices.push({
    name: `${chalk.cyan("[4]")} Set up orchestration         ${chalk.gray("(P-Thread: multi-agent streams)")}`,
    value: "orchestrate",
  });
  choices.push({
    name: `${chalk.magenta("[5]")} Thread wizard               ${chalk.gray("(choose the right thread type)")}`,
    value: "thread",
  });
  choices.push({
    name: `${chalk.white("[6]")} Quick commands               ${chalk.gray("(reference cheatsheet)")}`,
    value: "commands",
  });
  choices.push({
    name: `${chalk.white("[7]")} System health check          ${chalk.gray("(verify setup)")}`,
    value: "doctor",
  });
  choices.push({
    name: `${chalk.yellow("[8]")} Repository maintenance       ${chalk.gray("(cleanup & simplify)")}`,
    value: "maid",
  });
  choices.push({
    name: `${chalk.white("[9]")} Interactive tutorial         ${chalk.gray("(learn Sigma)")}`,
    value: "tutorial",
  });
  choices.push({
    name: `${chalk.white("[10]")} Open documentation          ${chalk.gray("(browser)")}`,
    value: "docs",
  });

  choices.push(new inquirer.Separator(""));
  choices.push({
    name: `${chalk.gray("[q]")} Exit`,
    value: "exit",
  });

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices,
      pageSize: 12,
    },
  ]);

  return action;
}

/**
 * Show quick commands reference
 */
export async function showQuickCommands() {
  console.log("");
  console.log(
    boxen(
      chalk.cyan.bold("Sigma Protocol Quick Commands\n\n") +
        chalk.white.bold("CLI Commands:\n") +
        chalk.gray("  sigma                     ") + chalk.white("Interactive menu\n") +
        chalk.gray("  sigma new                 ") + chalk.white("Create new project\n") +
        chalk.gray("  sigma retrofit            ") + chalk.white("Add to existing project\n") +
        chalk.gray("  sigma install             ") + chalk.white("Install Sigma commands\n") +
        chalk.gray("  sigma update              ") + chalk.white("Update commands & skills\n") +
        chalk.gray("  sigma update --quick      ") + chalk.white("Fast sync (no retrofit)\n") +
        chalk.gray("  sigma doctor              ") + chalk.white("System health check\n") +
        chalk.gray("  sigma maid                ") + chalk.white("Repository maintenance\n") +
        chalk.gray("  sigma orchestrate         ") + chalk.white("Multi-agent orchestration\n") +
        chalk.gray("  sigma tutorial            ") + chalk.white("Interactive tutorial\n\n") +
        chalk.white.bold("AI Commands (in your IDE):\n") +
        chalk.gray("  @step-1-ideation          ") + chalk.white("Start product ideation\n") +
        chalk.gray("  @step-2-architecture      ") + chalk.white("Design architecture\n") +
        chalk.gray("  @gap-analysis             ") + chalk.white("Verify implementation\n") +
        chalk.gray("  @retrofit-analyze         ") + chalk.white("Analyze existing code\n") +
        chalk.gray("  @continue           ") + chalk.white("Find next task\n\n") +
        chalk.white.bold("Orchestration (P-Thread):\n") +
        chalk.gray("  sigma orchestrate                   ") + chalk.white("Interactive setup\n") +
        chalk.gray("  sigma orchestrate --tui mprocs      ") + chalk.white("Use mprocs TUI (recommended)\n") +
        chalk.gray("  sigma orchestrate --agent=opencode  ") + chalk.white("Use OpenCode agent\n") +
        chalk.gray("  sigma orchestrate --streams=6       ") + chalk.white("Start with specific count\n") +
        "\n" +
        chalk.white.bold("Thread-Based Engineering:\n") +
        chalk.gray("  sigma thread                        ") + chalk.white("Thread type wizard\n") +
        chalk.gray("  sigma thread status                 ") + chalk.white("View active threads\n") +
        chalk.gray("  sigma thread metrics                ") + chalk.white("Track your improvement\n") +
        chalk.gray("  sigma f-thread                      ") + chalk.white("Fusion thread (multi-agent)\n"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );

  // Show option to browse all commands
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What next?",
      choices: [
        { name: "Browse all commands (categorized)", value: "browse" },
        { name: "Back to main menu", value: "back" },
      ],
    },
  ]);

  if (action === "browse") {
    return browseAllCommands();
  }

  return "menu";
}

/**
 * Browse all commands by category
 */
export async function browseAllCommands() {
  const categories = {
    steps: {
      name: "📋 Steps (Core Workflow)",
      commands: [
        { cmd: "step-0-environment-setup", desc: "Environment validation" },
        { cmd: "step-1-ideation", desc: "Product ideation (Hormozi)" },
        { cmd: "step-1.5-offer-architecture", desc: "Offer design" },
        { cmd: "step-2-architecture", desc: "System architecture" },
        { cmd: "step-3-ux-design", desc: "UX/UI design" },
        { cmd: "step-4-flow-tree", desc: "Navigation flow" },
        { cmd: "step-5-wireframe-prototypes", desc: "Wireframes" },
        { cmd: "step-5b-prd-to-json", desc: "PRD to JSON (Ralph)" },
        { cmd: "step-6-design-system", desc: "Design system" },
        { cmd: "step-7-interface-states", desc: "State specs" },
        { cmd: "step-8-technical-spec", desc: "Technical spec" },
        { cmd: "step-9-landing-page", desc: "Landing page" },
        { cmd: "step-10-feature-breakdown", desc: "Feature breakdown" },
        { cmd: "step-11-prd-generation", desc: "PRD generation" },
        { cmd: "step-11a-prd-to-json", desc: "Implementation PRD to JSON" },
        { cmd: "step-11b-prd-swarm", desc: "PRD swarm orchestration" },
        { cmd: "step-12-context-engine", desc: "Context engine" },
        { cmd: "step-13-skillpack-generator", desc: "Skillpack generator" },
      ],
    },
    audit: {
      name: "🔍 Audit",
      commands: [
        { cmd: "security-audit", desc: "Security vulnerability scan" },
        { cmd: "accessibility-audit", desc: "WCAG compliance check" },
        { cmd: "performance-check", desc: "Performance analysis" },
        { cmd: "gap-analysis", desc: "PRD coverage verification" },
        { cmd: "holes", desc: "Find implementation gaps" },
        { cmd: "simplify", desc: "Code simplification" },
        { cmd: "code-quality-report", desc: "Code quality metrics" },
        { cmd: "tech-debt-audit", desc: "Technical debt assessment" },
        { cmd: "license-check", desc: "License compliance" },
        { cmd: "seo-audit", desc: "SEO analysis" },
      ],
    },
    ops: {
      name: "⚙️ Ops",
      commands: [
        { cmd: "maid", desc: "Repository maintenance" },
        { cmd: "status", desc: "Project status overview" },
        { cmd: "continue", desc: "Find next task (Ralph)" },
        { cmd: "orchestrate", desc: "Stream orchestration" },
        { cmd: "sprint-plan", desc: "Sprint planning" },
        { cmd: "backlog-groom", desc: "Backlog grooming" },
        { cmd: "daily-standup", desc: "Daily standup" },
        { cmd: "pr-review", desc: "PR review" },
        { cmd: "qa-plan", desc: "QA planning" },
        { cmd: "qa-run", desc: "Run QA tests" },
        { cmd: "release-review", desc: "Release review" },
        { cmd: "onboard", desc: "Team onboarding" },
        { cmd: "dependency-update", desc: "Update dependencies" },
        { cmd: "retrofit-analyze", desc: "Analyze existing project" },
        { cmd: "retrofit-generate", desc: "Generate missing docs" },
        { cmd: "retrofit-enhance", desc: "Enhance existing docs" },
      ],
    },
    dev: {
      name: "💻 Dev",
      commands: [
        { cmd: "implement-prd", desc: "Implement a PRD" },
        { cmd: "plan", desc: "Create implementation plan" },
        { cmd: "compound-engineering", desc: "Compound engineering patterns" },
        { cmd: "db-migrate", desc: "Database migrations" },
      ],
    },
    deploy: {
      name: "🚀 Deploy",
      commands: [
        { cmd: "ship-check", desc: "Pre-deploy verification" },
        { cmd: "ship-stage", desc: "Deploy to staging" },
        { cmd: "ship-prod", desc: "Deploy to production" },
        { cmd: "client-handoff", desc: "Client handoff prep" },
      ],
    },
    generators: {
      name: "🏗️ Generators",
      commands: [
        { cmd: "scaffold", desc: "Scaffold new feature" },
        { cmd: "test-gen", desc: "Generate tests" },
        { cmd: "api-docs-gen", desc: "Generate API docs" },
        { cmd: "new-command", desc: "Create new command" },
        { cmd: "new-feature", desc: "Create new feature" },
        { cmd: "wireframe", desc: "Generate wireframes" },
        { cmd: "estimation-engine", desc: "Estimate effort" },
        { cmd: "contract", desc: "Generate contract" },
        { cmd: "proposal", desc: "Generate proposal" },
        { cmd: "nda", desc: "Generate NDA" },
      ],
    },
    marketing: {
      name: "📣 Marketing",
      commands: [
        { cmd: "01-market-research", desc: "Market research" },
        { cmd: "02-customer-avatar", desc: "Customer avatar" },
        { cmd: "03-brand-voice", desc: "Brand voice" },
        { cmd: "04-offer-architect", desc: "Offer architecture" },
        { cmd: "05-sales-strategy", desc: "Sales strategy" },
        { cmd: "06-email-sequences", desc: "Email sequences" },
        { cmd: "07-landing-page-copy", desc: "Landing page copy" },
        { cmd: "08-ads-strategy", desc: "Ads strategy" },
        { cmd: "09-retargeting-strategy", desc: "Retargeting" },
        { cmd: "10-launch-playbook", desc: "Launch playbook" },
        { cmd: "14-video-script", desc: "Video scripts" },
        { cmd: "16-seo-content", desc: "SEO content" },
      ],
    },
  };

  // Let user choose category
  const { category } = await inquirer.prompt([
    {
      type: "list",
      name: "category",
      message: "Select command category:",
      choices: [
        ...Object.entries(categories).map(([key, val]) => ({
          name: `${val.name} (${val.commands.length} commands)`,
          value: key,
        })),
        new inquirer.Separator(),
        { name: "← Back to main menu", value: "back" },
      ],
      pageSize: 10,
    },
  ]);

  if (category === "back") {
    return "menu";
  }

  // Show commands in selected category
  const cat = categories[category];
  console.log("");
  console.log(chalk.cyan.bold(`\n${cat.name}\n`));
  console.log(chalk.gray("Run these commands in your AI IDE (Claude Code, Cursor, OpenCode):\n"));

  cat.commands.forEach(({ cmd, desc }) => {
    console.log(chalk.yellow(`  @${cmd.padEnd(30)} `) + chalk.white(desc));
  });

  console.log("");

  // Ask what to do next
  const { next } = await inquirer.prompt([
    {
      type: "list",
      name: "next",
      message: "What next?",
      choices: [
        { name: "Browse another category", value: "browse" },
        { name: "Back to main menu", value: "back" },
      ],
    },
  ]);

  if (next === "browse") {
    return browseAllCommands();
  }

  return "menu";
}

/**
 * Open documentation in browser
 */
export async function openDocumentation() {
  const { exec } = await import("child_process");
  const url = "https://github.com/dallionking/sigma-protocol";

  // Create clickable link for terminals that support it
  const docsLink = terminalLink("Sigma Protocol Documentation", url, {
    fallback: (text, url) => `${text}: ${url}`,
  });

  console.log(chalk.cyan(`\nOpening documentation...\n`));
  console.log(`  ${docsLink}\n`);

  // Cross-platform open command
  const platform = process.platform;
  let command;

  if (platform === "darwin") {
    command = `open "${url}"`;
  } else if (platform === "win32") {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }

  exec(command, (error) => {
    if (error) {
      console.log(chalk.yellow("Could not open browser automatically."));
      console.log(chalk.white(`Visit: ${url}\n`));
    }
  });

  return "menu";
}

/**
 * Handle menu selection and dispatch to appropriate handler
 */
export async function handleMenuAction(action, options = {}) {
  switch (action) {
    case "new": {
      // Import and run new project wizard
      const { runNewProjectWizard } = await import("./new-project.js");
      return runNewProjectWizard(options);
    }

    case "retrofit": {
      // Import and run retrofit wizard
      const { runRetrofitWizard } = await import("./retrofit.js");
      return runRetrofitWizard(options);
    }

    case "install":
      // Return to let the main CLI handle install
      return "install";

    case "continue":
      console.log(
        chalk.cyan("\nTo continue development, run in your AI assistant:\n")
      );
      console.log(chalk.white("  @continue\n"));
      console.log(chalk.gray("This will find the next unfinished task.\n"));
      return "menu";

    case "feature":
      console.log(
        chalk.cyan("\nTo add a new feature, run in your AI assistant:\n")
      );
      console.log(chalk.white("  @step-10-feature-breakdown [your feature]\n"));
      console.log(chalk.gray("Then follow up with @step-11-prd-generation\n"));
      return "menu";

    case "update":
      return "update";

    case "orchestrate":
      // Return to let main CLI handle orchestration
      return "orchestrate";

    case "thread": {
      // Import thread wizard
      const { runThreadWizard } = await import("./threads.js");
      await runThreadWizard({ target: process.cwd() });
      return "menu";
    }

    case "commands":
      return showQuickCommands();

    case "doctor": {
      // Import the doctor runner directly
      const { runDoctor } = await import("./doctor.js");
      await runDoctor({ target: process.cwd() });
      // After doctor finishes, ask what to do
      const doctorInquirer = await import("inquirer");
      const { doctorNext } = await doctorInquirer.default.prompt([
        {
          type: "list",
          name: "doctorNext",
          message: "What next?",
          choices: [
            { name: "Back to main menu", value: "menu" },
            { name: "Exit", value: "exit" },
          ],
        },
      ]);
      return doctorNext === "exit" ? "exit" : "menu";
    }

    case "maid": {
      // Import and run maid wizard
      const { runMaidWizard } = await import("./maid.js");
      const maidResult = await runMaidWizard();
      return maidResult === "menu" ? "menu" : "exit";
    }

    case "tutorial": {
      // Import and run tutorial
      const { runTutorial } = await import("./tutorial.js");
      return runTutorial(options);
    }

    case "docs":
      return openDocumentation();

    case "exit":
      console.log(chalk.gray("\nGoodbye! Happy building with Sigma Protocol.\n"));
      return "exit";

    default:
      return "menu";
  }
}

/**
 * Check if this is a first-time user
 */
async function isFirstTimeUser(targetDir) {
  // Check for global marker in home directory
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const globalMarkerPath = path.join(homeDir, ".sigma-cli-seen-tutorial");

  // Also check project manifest
  const manifestPath = path.join(targetDir, ".sigma-manifest.json");
  const hasProjectManifest = await fs.pathExists(manifestPath);

  if (await fs.pathExists(globalMarkerPath)) {
    return false; // Already seen tutorial globally
  }

  if (hasProjectManifest) {
    try {
      const manifest = await fs.readJson(manifestPath);
      if (manifest.tutorialCompleted) {
        return false; // Marked as completed in project
      }
    } catch {
      // Ignore parse errors
    }
  }

  return true;
}

/**
 * Mark tutorial as seen
 */
async function markTutorialSeen() {
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const globalMarkerPath = path.join(homeDir, ".sigma-cli-seen-tutorial");

  try {
    await fs.writeFile(globalMarkerPath, new Date().toISOString());
  } catch {
    // Ignore write errors - not critical
  }
}

/**
 * Main interactive loop
 */
export async function runInteractiveMode(options = {}) {
  let continueLoop = true;
  const targetDir = options.target || process.cwd();

  // Check if first-time user - offer tutorial
  const firstTime = await isFirstTimeUser(targetDir);
  if (firstTime && !options.skipTutorialPrompt) {
    showSigmaBanner();
    console.log("");
    console.log(
      boxen(
        chalk.cyan.bold("Welcome to Sigma Protocol!\n\n") +
        chalk.white("Looks like this is your first time here.\n\n") +
        chalk.gray("The tutorial takes about 5 minutes and covers:\n") +
        chalk.gray("  • The 13-step workflow\n") +
        chalk.gray("  • Key commands and skills\n") +
        chalk.gray("  • How to start your first project"),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "cyan",
        }
      )
    );

    const { takeTutorial } = await inquirer.prompt([
      {
        type: "confirm",
        name: "takeTutorial",
        message: "Would you like to take the 5-minute tutorial?",
        default: true,
      },
    ]);

    if (takeTutorial) {
      const { runTutorial } = await import("./tutorial.js");
      await runTutorial(options);
      await markTutorialSeen();
      console.clear();
    } else {
      await markTutorialSeen(); // Mark as seen even if skipped
    }
  }

  while (continueLoop) {
    const action = await showInteractiveMenu(options);
    const result = await handleMenuAction(action, options);

    switch (result) {
      case "exit":
        continueLoop = false;
        break;
      case "menu":
        // Continue loop
        console.clear();
        break;
      case "install":
      case "orchestrate":
      case "doctor":
      case "update":
        // Return these to let main CLI handle them
        return result;
      default:
        // Continue loop
        console.clear();
    }
  }

  return "exit";
}

