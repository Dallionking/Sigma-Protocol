#!/usr/bin/env node

/**
 * Sigma Protocol Thread-Based Engineering CLI
 *
 * Commands for managing and monitoring threads of agent work.
 * Based on IndyDevDan's Thread-Based Engineering framework.
 */

import chalk from "chalk";
import inquirer from "inquirer";
import boxen from "boxen";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// THREAD TYPES
// ============================================================================

const THREAD_TYPES = {
  base: {
    name: "Base Thread",
    symbol: "B",
    description: "Single linear workflow: Prompt → Work → Review",
    color: chalk.blue,
  },
  parallel: {
    name: "P-Thread (Parallel)",
    symbol: "P",
    description: "Multiple agents running simultaneously",
    color: chalk.green,
  },
  chained: {
    name: "C-Thread (Chained)",
    symbol: "C",
    description: "Phases with human checkpoints",
    color: chalk.yellow,
  },
  fusion: {
    name: "F-Thread (Fusion)",
    symbol: "F",
    description: "Same prompt to multiple agents, aggregate results",
    color: chalk.magenta,
  },
  big: {
    name: "B-Thread (Big/Meta)",
    symbol: "B+",
    description: "Agents prompting other agents (orchestration)",
    color: chalk.cyan,
  },
  long: {
    name: "L-Thread (Long)",
    symbol: "L",
    description: "Extended autonomy, hundreds of tool calls",
    color: chalk.red,
  },
  zero: {
    name: "Z-Thread (Zero Touch)",
    symbol: "Z",
    description: "Fully autonomous, no human review (goal)",
    color: chalk.white,
  },
};

// ============================================================================
// THREAD STATUS
// ============================================================================

/**
 * Display thread status and metrics
 */
export async function threadStatus(options = {}) {
  const targetDir = options.target || process.cwd();
  
  console.log(
    boxen(
      chalk.cyan.bold("Thread Status\n\n") +
        chalk.gray("Current thread activity and metrics"),
      {
        padding: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );

  // Check for active orchestration
  const orchestrationDir = path.join(targetDir, ".sigma/orchestration");
  const streamsFile = path.join(orchestrationDir, "streams.json");
  
  if (await fs.pathExists(streamsFile)) {
    const streams = await fs.readJson(streamsFile);
    
    console.log(chalk.white.bold("\nActive Orchestration:"));
    console.log(chalk.gray(`  Mode: ${streams.mode || "tmux"}`));
    console.log(chalk.gray(`  Agent: ${streams.agent || "claude"}`));
    console.log(chalk.gray(`  Streams: ${streams.streams?.length || 0}`));
    console.log(chalk.gray(`  Created: ${streams.created || "unknown"}`));
    
    if (streams.streams) {
      console.log(chalk.white.bold("\nStream Status:"));
      for (const stream of streams.streams) {
        const status = stream.status || "unknown";
        const statusColor = status === "ready" ? chalk.green :
                           status === "working" ? chalk.yellow :
                           status === "done" ? chalk.blue :
                           chalk.gray;
        console.log(`  ${chalk.cyan(stream.name)}: ${statusColor(status)}`);
      }
    }
  } else {
    console.log(chalk.yellow("\nNo active orchestration session."));
    console.log(chalk.gray("  Start one with: sigma orchestrate"));
  }

  // Thread type recommendations
  console.log(chalk.white.bold("\n\nThread Type Guide:"));
  for (const [key, thread] of Object.entries(THREAD_TYPES)) {
    if (key === "zero") continue; // Skip Z-thread in status
    console.log(`  ${thread.color(thread.symbol.padEnd(3))} ${thread.name}`);
    console.log(`      ${chalk.gray(thread.description)}`);
  }

  console.log(chalk.white.bold("\n\nQuick Commands:"));
  console.log(chalk.gray("  sigma orchestrate          # P-Thread (parallel)"));
  console.log(chalk.gray("  sigma f-thread             # F-Thread (fusion)"));
  console.log(chalk.gray("  sigma thread metrics       # View metrics"));
}

// ============================================================================
// THREAD METRICS
// ============================================================================

/**
 * Display thread metrics and improvement tracking
 */
export async function threadMetrics(options = {}) {
  const targetDir = options.target || process.cwd();
  
  console.log(
    boxen(
      chalk.cyan.bold("Thread Metrics\n\n") +
        chalk.gray("Track your improvement across the 4 dimensions"),
      {
        padding: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );

  // Load metrics file if exists
  const metricsFile = path.join(targetDir, ".sigma/thread-metrics.json");
  let metrics = {
    sessions: [],
    totalToolCalls: 0,
    avgSessionLength: 0,
    maxParallelStreams: 0,
    longestSession: 0,
  };

  if (await fs.pathExists(metricsFile)) {
    metrics = await fs.readJson(metricsFile);
  }

  console.log(chalk.white.bold("\n4 Dimensions of Improvement:\n"));
  
  // 1. More Threads
  console.log(chalk.yellow("1. More Threads (Parallelism)"));
  console.log(`   Max parallel streams: ${chalk.cyan(metrics.maxParallelStreams || "N/A")}`);
  console.log(chalk.gray("   Goal: 5-10+ simultaneous agents"));
  console.log("");
  
  // 2. Longer Threads
  console.log(chalk.yellow("2. Longer Threads (Duration)"));
  console.log(`   Longest session: ${chalk.cyan(metrics.longestSession ? formatDuration(metrics.longestSession) : "N/A")}`);
  console.log(chalk.gray("   Goal: Hours or days of continuous work"));
  console.log("");
  
  // 3. Thicker Threads
  console.log(chalk.yellow("3. Thicker Threads (Nesting)"));
  console.log(`   Using orchestration: ${chalk.cyan(metrics.usesOrchestration ? "Yes" : "No")}`);
  console.log(chalk.gray("   Goal: Agents prompting agents (B-Thread)"));
  console.log("");
  
  // 4. Fewer Checkpoints
  console.log(chalk.yellow("4. Fewer Checkpoints (Trust)"));
  console.log(`   Avg checkpoints/session: ${chalk.cyan(metrics.avgCheckpoints || "N/A")}`);
  console.log(chalk.gray("   Goal: Only milestone reviews"));
  console.log("");

  // Total metrics
  console.log(chalk.white.bold("Overall Stats:"));
  console.log(`   Total tool calls: ${chalk.cyan(metrics.totalToolCalls || 0)}`);
  console.log(`   Total sessions: ${chalk.cyan(metrics.sessions?.length || 0)}`);
  
  console.log(chalk.gray("\n\nMetrics are tracked automatically during orchestration."));
  console.log(chalk.gray("See docs/THREAD-BASED-ENGINEERING.md for details."));
}

/**
 * Format duration in human readable format
 */
function formatDuration(ms) {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${Math.round(ms / 3600000)}h`;
}

// ============================================================================
// F-THREAD (FUSION)
// ============================================================================

/**
 * Run a fusion thread - same prompt to multiple agents/models
 */
export async function runFusionThread(options = {}) {
  const targetDir = options.target || process.cwd();
  
  console.log(
    boxen(
      chalk.magenta.bold("F-Thread (Fusion)\n\n") +
        chalk.gray("Run the same prompt across multiple agents\n") +
        chalk.gray("Aggregate the best results"),
      {
        padding: 1,
        borderStyle: "round",
        borderColor: "magenta",
      }
    )
  );

  // Get prompt
  let prompt = options.prompt;
  if (!prompt) {
    const { inputPrompt } = await inquirer.prompt([{
      type: "input",
      name: "inputPrompt",
      message: "Enter the prompt to run across agents:",
      validate: (input) => input.length > 0 || "Prompt required",
    }]);
    prompt = inputPrompt;
  }

  // Get number of agents
  let numAgents = options.count || 3;
  if (!options.count) {
    const { count } = await inquirer.prompt([{
      type: "list",
      name: "count",
      message: "How many agents to run?",
      choices: [
        { name: "3 agents (quick)", value: 3 },
        { name: "5 agents (balanced)", value: 5 },
        { name: "7 agents (thorough)", value: 7 },
      ],
      default: 3,
    }]);
    numAgents = count;
  }

  // Get aggregation strategy
  let strategy = options.aggregate || "best";
  if (!options.aggregate) {
    const { aggStrategy } = await inquirer.prompt([{
      type: "list",
      name: "aggStrategy",
      message: "How to aggregate results?",
      choices: [
        { name: "Best of N - Pick the best result", value: "best" },
        { name: "Consensus - Find common patterns", value: "consensus" },
        { name: "Merge - Combine unique insights", value: "merge" },
        { name: "Vote - Majority wins", value: "vote" },
      ],
      default: "best",
    }]);
    strategy = aggStrategy;
  }

  // Check for mprocs
  const { execSync } = await import("child_process");
  let hasMprocs = false;
  try {
    execSync("which mprocs", { stdio: "pipe" });
    hasMprocs = true;
  } catch {
    // mprocs not installed
  }

  console.log(chalk.cyan("\n\n🔀 F-Thread Configuration:"));
  console.log(chalk.gray(`  Prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}"`));
  console.log(chalk.gray(`  Agents: ${numAgents}`));
  console.log(chalk.gray(`  Strategy: ${strategy}`));
  console.log(chalk.gray(`  TUI: ${hasMprocs ? "mprocs" : "tmux"}`));

  // Create fusion config
  const fusionDir = path.join(targetDir, ".sigma/fusion");
  await fs.ensureDir(fusionDir);

  const fusionConfig = {
    id: `fusion-${Date.now()}`,
    prompt,
    numAgents,
    strategy,
    created: new Date().toISOString(),
    status: "pending",
    results: [],
  };

  await fs.writeJson(path.join(fusionDir, `${fusionConfig.id}.json`), fusionConfig, { spaces: 2 });

  console.log(chalk.green("\n✓ Fusion config created"));
  console.log(chalk.gray(`  Config: .sigma/fusion/${fusionConfig.id}.json`));

  // Provide instructions
  console.log(chalk.white.bold("\n\nNext Steps:"));
  if (hasMprocs) {
    console.log(chalk.gray("  1. Run the fusion thread:"));
    console.log(chalk.cyan(`     sigma orchestrate --streams=${numAgents} --tui mprocs`));
    console.log(chalk.gray("  2. Each agent will receive the same prompt"));
    console.log(chalk.gray("  3. Review and aggregate results using:"));
    console.log(chalk.cyan(`     sigma f-thread aggregate --id=${fusionConfig.id}`));
  } else {
    console.log(chalk.yellow("  mprocs recommended for fusion threads:"));
    console.log(chalk.cyan("     brew install mprocs"));
    console.log(chalk.gray("\n  Or use tmux:"));
    console.log(chalk.cyan(`     sigma orchestrate --streams=${numAgents}`));
  }

  return fusionConfig;
}

// ============================================================================
// THREAD WIZARD
// ============================================================================

/**
 * Interactive thread type selector
 */
export async function runThreadWizard(options = {}) {
  console.log(
    boxen(
      chalk.cyan.bold("Thread Wizard\n\n") +
        chalk.gray("Choose the right thread type for your task"),
      {
        padding: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );

  const { taskType } = await inquirer.prompt([{
    type: "list",
    name: "taskType",
    message: "What kind of work are you doing?",
    choices: [
      { name: "Single task, quick completion", value: "base" },
      { name: "Multiple independent tasks", value: "parallel" },
      { name: "Complex task needing phases", value: "chained" },
      { name: "Need multiple perspectives/prototypes", value: "fusion" },
      { name: "Full project orchestration", value: "big" },
      { name: "Extended autonomous work", value: "long" },
      new inquirer.Separator(),
      { name: "← Back to main menu", value: "back" },
    ],
  }]);

  // Handle back navigation
  if (taskType === "back") {
    return "menu";
  }

  const thread = THREAD_TYPES[taskType];
  
  console.log(chalk.white.bold(`\n\nRecommended: ${thread.color(thread.name)}`));
  console.log(chalk.gray(thread.description));

  // Provide specific command
  console.log(chalk.white.bold("\nCommand:"));
  switch (taskType) {
    case "base":
      console.log(chalk.cyan("  @your-command \"your prompt\""));
      console.log(chalk.gray("  Just run your command directly"));
      break;
    case "parallel":
      console.log(chalk.cyan("  sigma orchestrate --streams=4 --tui mprocs"));
      console.log(chalk.gray("  Spawns multiple agents for parallel work"));
      break;
    case "chained":
      console.log(chalk.cyan("  # Follow the 13-step workflow"));
      console.log(chalk.cyan("  @step-1 → review → @step-2 → review → ..."));
      console.log(chalk.gray("  Or use @continue to chain steps"));
      break;
    case "fusion":
      console.log(chalk.cyan("  sigma f-thread --prompt=\"your prompt\" --count=5"));
      console.log(chalk.gray("  Same prompt to multiple agents, pick the best"));
      break;
    case "big":
      console.log(chalk.cyan("  sigma orchestrate --mode=full-auto"));
      console.log(chalk.gray("  Orchestrator manages sub-agents"));
      break;
    case "long":
      console.log(chalk.cyan("  # Configure for long duration"));
      console.log(chalk.cyan("  sigma orchestrate --duration=long"));
      console.log(chalk.gray("  Set up stop hooks for validation"));
      break;
  }

  // Ask what to do next
  console.log("");
  const { next } = await inquirer.prompt([{
    type: "list",
    name: "next",
    message: "What next?",
    choices: [
      { name: "Run the recommended command", value: "run" },
      { name: "View thread metrics", value: "metrics" },
      { name: "← Back to main menu", value: "menu" },
    ],
  }]);

  if (next === "metrics") {
    await threadMetrics(options);
    return "menu";
  }

  if (next === "menu") {
    return "menu";
  }

  // If user wants to run, return the task type to let main CLI handle
  return taskType;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  threadStatus,
  threadMetrics,
  runFusionThread,
  runThreadWizard,
  THREAD_TYPES,
};

