#!/usr/bin/env node

/**
 * Sigma Protocol Command Search
 *
 * Search all Sigma Protocol commands by keyword, category, or description.
 */

import chalk from "chalk";
import inquirer from "inquirer";
import boxen from "boxen";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");

// Command catalog with metadata
const COMMAND_CATALOG = {
  steps: {
    category: "Steps",
    description: "Core 13-step workflow commands",
    color: "cyan",
    commands: [
      { name: "step-0-environment-setup", desc: "Validate development environment", tags: ["setup", "environment", "init"] },
      { name: "step-1-ideation", desc: "Product ideation with Hormozi framework", tags: ["ideation", "product", "hormozi", "offer"] },
      { name: "step-1.5-offer-architecture", desc: "Design your offer structure", tags: ["offer", "pricing", "business"] },
      { name: "step-2-architecture", desc: "System architecture design", tags: ["architecture", "system", "design", "technical"] },
      { name: "step-3-ux-design", desc: "UX/UI design and flows", tags: ["ux", "ui", "design", "user experience"] },
      { name: "step-4-flow-tree", desc: "Navigation and user flow mapping", tags: ["navigation", "flow", "sitemap", "routes"] },
      { name: "step-5-wireframe-prototypes", desc: "Wireframes and prototyping", tags: ["wireframe", "prototype", "mockup", "design"] },
      { name: "step-5b-prd-to-json", desc: "Convert prototype PRD to Ralph JSON", tags: ["prd", "json", "ralph", "prototype"] },
      { name: "step-6-design-system", desc: "Design system and components", tags: ["design system", "components", "tokens", "ui kit"] },
      { name: "step-7-interface-states", desc: "Interface state specifications", tags: ["states", "ui states", "loading", "error"] },
      { name: "step-8-technical-spec", desc: "Technical specifications", tags: ["technical", "spec", "requirements", "api"] },
      { name: "step-9-landing-page", desc: "Landing page generation", tags: ["landing", "marketing", "page", "conversion"] },
      { name: "step-10-feature-breakdown", desc: "Feature breakdown and stories", tags: ["features", "breakdown", "stories", "epics"] },
      { name: "step-11-prd-generation", desc: "PRD generation", tags: ["prd", "requirements", "document"] },
      { name: "step-11a-prd-to-json", desc: "Convert implementation PRD to Ralph JSON", tags: ["prd", "json", "ralph", "implementation"] },
      { name: "step-11b-prd-swarm", desc: "PRD swarm orchestration", tags: ["swarm", "parallel", "orchestration", "multiple"] },
      { name: "step-12-context-engine", desc: "Context engine generation", tags: ["context", "engine", "knowledge", "memory"] },
      { name: "step-13-skillpack-generator", desc: "Generate skill packs", tags: ["skills", "skillpack", "export", "pack"] },
    ],
  },
  audit: {
    category: "Audit",
    description: "Code quality and compliance audits",
    color: "yellow",
    commands: [
      { name: "security-audit", desc: "Security vulnerability scan", tags: ["security", "vulnerability", "audit", "owasp"] },
      { name: "accessibility-audit", desc: "WCAG accessibility compliance", tags: ["accessibility", "a11y", "wcag", "aria"] },
      { name: "performance-check", desc: "Performance analysis", tags: ["performance", "speed", "optimization", "metrics"] },
      { name: "gap-analysis", desc: "PRD coverage verification", tags: ["gap", "coverage", "verification", "prd"] },
      { name: "holes", desc: "Find implementation gaps", tags: ["gaps", "missing", "incomplete", "holes"] },
      { name: "simplify", desc: "Code simplification", tags: ["simplify", "refactor", "clean", "code"] },
      { name: "code-quality-report", desc: "Code quality metrics", tags: ["quality", "metrics", "lint", "analysis"] },
      { name: "tech-debt-audit", desc: "Technical debt assessment", tags: ["debt", "technical debt", "refactor", "maintenance"] },
      { name: "license-check", desc: "License compliance check", tags: ["license", "legal", "compliance", "dependencies"] },
      { name: "seo-audit", desc: "SEO analysis", tags: ["seo", "search", "optimization", "meta"] },
    ],
  },
  ops: {
    category: "Ops",
    description: "Operations and workflow management",
    color: "green",
    commands: [
      { name: "maid", desc: "Repository maintenance and cleanup", tags: ["cleanup", "maid", "maintenance", "organize"] },
      { name: "status", desc: "Project status overview", tags: ["status", "overview", "progress", "dashboard"] },
      { name: "continue", desc: "Find next task (Ralph loop)", tags: ["continue", "next", "ralph", "task"] },
      { name: "orchestrate", desc: "Multi-agent orchestration", tags: ["orchestrate", "multi-agent", "parallel", "streams"] },
      { name: "sprint-plan", desc: "Sprint planning", tags: ["sprint", "planning", "agile", "scrum"] },
      { name: "backlog-groom", desc: "Backlog grooming", tags: ["backlog", "grooming", "prioritize", "refine"] },
      { name: "daily-standup", desc: "Generate standup report", tags: ["standup", "daily", "report", "progress"] },
      { name: "pr-review", desc: "Pull request review", tags: ["pr", "review", "code review", "git"] },
      { name: "qa-plan", desc: "QA planning", tags: ["qa", "testing", "plan", "quality"] },
      { name: "qa-run", desc: "Run QA tests", tags: ["qa", "test", "run", "execute"] },
      { name: "release-review", desc: "Release review checklist", tags: ["release", "review", "checklist", "deploy"] },
      { name: "onboard", desc: "Team member onboarding", tags: ["onboard", "team", "new", "setup"] },
      { name: "dependency-update", desc: "Update dependencies", tags: ["dependencies", "update", "npm", "packages"] },
      { name: "retrofit-analyze", desc: "Analyze existing project", tags: ["retrofit", "analyze", "existing", "legacy"] },
      { name: "retrofit-generate", desc: "Generate missing docs", tags: ["retrofit", "generate", "docs", "documentation"] },
      { name: "retrofit-enhance", desc: "Enhance existing docs", tags: ["retrofit", "enhance", "improve", "docs"] },
      { name: "doctor-fix", desc: "Fix issues from health check", tags: ["doctor", "fix", "health", "repair"] },
    ],
  },
  dev: {
    category: "Dev",
    description: "Development and implementation",
    color: "blue",
    commands: [
      { name: "implement-prd", desc: "Implement a PRD", tags: ["implement", "prd", "build", "code"] },
      { name: "plan", desc: "Create implementation plan", tags: ["plan", "implementation", "strategy", "approach"] },
      { name: "compound-engineering", desc: "Compound engineering patterns", tags: ["compound", "engineering", "patterns", "scaling"] },
      { name: "db-migrate", desc: "Database migrations", tags: ["database", "migrate", "schema", "sql"] },
    ],
  },
  deploy: {
    category: "Deploy",
    description: "Deployment and delivery",
    color: "magenta",
    commands: [
      { name: "ship-check", desc: "Pre-deploy verification", tags: ["ship", "deploy", "check", "verify"] },
      { name: "ship-stage", desc: "Deploy to staging", tags: ["staging", "deploy", "test", "environment"] },
      { name: "ship-prod", desc: "Deploy to production", tags: ["production", "deploy", "release", "live"] },
      { name: "client-handoff", desc: "Client handoff preparation", tags: ["client", "handoff", "delivery", "transfer"] },
    ],
  },
  generators: {
    category: "Generators",
    description: "Code and content generation",
    color: "white",
    commands: [
      { name: "scaffold", desc: "Scaffold new feature", tags: ["scaffold", "feature", "new", "create"] },
      { name: "test-gen", desc: "Generate tests", tags: ["test", "generate", "unit", "testing"] },
      { name: "api-docs-gen", desc: "Generate API documentation", tags: ["api", "docs", "openapi", "swagger"] },
      { name: "new-command", desc: "Create new Sigma command", tags: ["command", "new", "create", "sigma"] },
      { name: "new-feature", desc: "Create new feature structure", tags: ["feature", "new", "create", "module"] },
      { name: "wireframe", desc: "Generate wireframes", tags: ["wireframe", "design", "mockup", "layout"] },
      { name: "estimation-engine", desc: "Estimate effort", tags: ["estimate", "effort", "time", "planning"] },
      { name: "contract", desc: "Generate contract document", tags: ["contract", "legal", "document", "agreement"] },
      { name: "proposal", desc: "Generate proposal", tags: ["proposal", "business", "pitch", "document"] },
      { name: "nda", desc: "Generate NDA document", tags: ["nda", "legal", "confidentiality", "document"] },
    ],
  },
  marketing: {
    category: "Marketing",
    description: "Marketing and content commands",
    color: "red",
    commands: [
      { name: "01-market-research", desc: "Market research analysis", tags: ["market", "research", "analysis", "competition"] },
      { name: "02-customer-avatar", desc: "Customer avatar creation", tags: ["customer", "avatar", "persona", "audience"] },
      { name: "03-brand-voice", desc: "Brand voice definition", tags: ["brand", "voice", "tone", "personality"] },
      { name: "04-offer-architect", desc: "Offer architecture design", tags: ["offer", "architecture", "product", "pricing"] },
      { name: "05-sales-strategy", desc: "Sales strategy development", tags: ["sales", "strategy", "funnel", "conversion"] },
      { name: "06-email-sequences", desc: "Email sequence creation", tags: ["email", "sequences", "automation", "drip"] },
      { name: "07-landing-page-copy", desc: "Landing page copywriting", tags: ["landing", "copy", "conversion", "marketing"] },
      { name: "08-ads-strategy", desc: "Advertising strategy", tags: ["ads", "advertising", "paid", "campaigns"] },
      { name: "09-retargeting-strategy", desc: "Retargeting campaigns", tags: ["retargeting", "remarketing", "ads", "conversion"] },
      { name: "10-launch-playbook", desc: "Launch playbook creation", tags: ["launch", "playbook", "go-to-market", "release"] },
      { name: "14-video-script", desc: "Video script writing", tags: ["video", "script", "content", "youtube"] },
      { name: "16-seo-content", desc: "SEO content creation", tags: ["seo", "content", "blog", "organic"] },
    ],
  },
  orchestration: {
    category: "Orchestration",
    description: "Multi-agent orchestration commands",
    color: "cyan",
    commands: [
      { name: "orchestrate/start", desc: "Start orchestration session", tags: ["orchestrate", "start", "tmux", "agents"] },
      { name: "orchestrate/status", desc: "Check orchestration status", tags: ["status", "orchestrate", "check", "agents"] },
      { name: "orchestrate/attach", desc: "Attach to session", tags: ["attach", "tmux", "session", "orchestrate"] },
      { name: "orchestrate/stop", desc: "Stop orchestration", tags: ["stop", "kill", "end", "orchestrate"] },
      { name: "maid/cleanup", desc: "Run cleanup mode", tags: ["cleanup", "maid", "files", "organize"] },
      { name: "maid/simplify", desc: "Run simplify mode", tags: ["simplify", "maid", "code", "refactor"] },
      { name: "maid/full", desc: "Full maintenance", tags: ["full", "maid", "cleanup", "simplify"] },
    ],
  },
};

/**
 * Search commands by query
 */
export function searchCommands(query, options = {}) {
  const results = [];
  const searchTerms = query.toLowerCase().split(/\s+/);
  const categoryFilter = options.category?.toLowerCase();

  for (const [categoryKey, categoryData] of Object.entries(COMMAND_CATALOG)) {
    // Filter by category if specified
    if (categoryFilter && categoryKey !== categoryFilter) {
      continue;
    }

    for (const cmd of categoryData.commands) {
      // Calculate relevance score
      let score = 0;
      const searchableText = [
        cmd.name,
        cmd.desc,
        ...cmd.tags,
      ].join(" ").toLowerCase();

      for (const term of searchTerms) {
        // Exact name match (highest priority)
        if (cmd.name.toLowerCase().includes(term)) {
          score += 10;
        }
        // Tag match (high priority)
        if (cmd.tags.some((tag) => tag.includes(term))) {
          score += 5;
        }
        // Description match
        if (cmd.desc.toLowerCase().includes(term)) {
          score += 3;
        }
        // Any match in searchable text
        if (searchableText.includes(term)) {
          score += 1;
        }
      }

      if (score > 0) {
        results.push({
          ...cmd,
          category: categoryData.category,
          categoryKey,
          color: categoryData.color,
          score,
        });
      }
    }
  }

  // Sort by score (descending)
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Display search results
 */
export function displaySearchResults(results, query) {
  if (results.length === 0) {
    console.log(chalk.yellow(`\nNo commands found for "${query}"\n`));
    console.log(chalk.gray("Try searching for:"));
    console.log(chalk.gray("  - A category: audit, deploy, steps, marketing"));
    console.log(chalk.gray("  - A feature: prd, test, security, performance"));
    console.log(chalk.gray("  - An action: generate, analyze, check, run\n"));
    return;
  }

  console.log(chalk.cyan(`\nFound ${results.length} command(s) for "${query}":\n`));

  // Group by category for cleaner display
  const grouped = {};
  for (const result of results) {
    if (!grouped[result.categoryKey]) {
      grouped[result.categoryKey] = {
        category: result.category,
        color: result.color,
        commands: [],
      };
    }
    grouped[result.categoryKey].commands.push(result);
  }

  for (const [_key, data] of Object.entries(grouped)) {
    console.log(chalk[data.color || "white"].bold(`${data.category}:`));
    for (const cmd of data.commands) {
      console.log(
        `  ${chalk.yellow(`@${cmd.name.padEnd(30)}`)} ${chalk.white(cmd.desc)}`
      );
    }
    console.log("");
  }
}

/**
 * List all categories
 */
export function listCategories() {
  console.log(chalk.cyan("\nCommand Categories:\n"));

  for (const [key, data] of Object.entries(COMMAND_CATALOG)) {
    const count = data.commands.length;
    console.log(
      chalk[data.color || "white"](`  ${data.category.padEnd(15)}`) +
      chalk.gray(` (${count} commands)`) +
      chalk.white(` - ${data.description}`)
    );
  }

  console.log("");
  console.log(chalk.gray("Use: sigma search --category=<name> to filter"));
  console.log(chalk.gray("Use: sigma search <query> to search all commands\n"));
}

/**
 * Run interactive search
 */
export async function runInteractiveSearch(options = {}) {
  if (options.categories) {
    listCategories();
    return;
  }

  if (options.query) {
    const results = searchCommands(options.query, {
      category: options.category,
    });
    displaySearchResults(results, options.query);
    return;
  }

  // Interactive mode
  console.log("");
  console.log(
    boxen(
      chalk.cyan.bold("Sigma Protocol Command Search\n\n") +
      chalk.white("Search all 100+ commands by keyword, category, or description.\n\n") +
      chalk.gray("Examples:\n") +
      chalk.yellow("  sigma search prd") + chalk.gray("          # Find PRD-related commands\n") +
      chalk.yellow("  sigma search security") + chalk.gray("     # Find security commands\n") +
      chalk.yellow("  sigma search --category audit") + chalk.gray("  # All audit commands"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );

  const { searchQuery } = await inquirer.prompt([
    {
      type: "input",
      name: "searchQuery",
      message: "Search commands:",
      validate: (input) => input.length > 0 || "Please enter a search query",
    },
  ]);

  const results = searchCommands(searchQuery, {
    category: options.category,
  });
  displaySearchResults(results, searchQuery);

  // Offer to search again
  const { searchAgain } = await inquirer.prompt([
    {
      type: "confirm",
      name: "searchAgain",
      message: "Search again?",
      default: false,
    },
  ]);

  if (searchAgain) {
    return runInteractiveSearch(options);
  }
}

export default {
  searchCommands,
  displaySearchResults,
  listCategories,
  runInteractiveSearch,
  COMMAND_CATALOG,
};

