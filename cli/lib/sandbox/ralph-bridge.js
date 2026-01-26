#!/usr/bin/env node
/**
 * Sigma Protocol - Ralph-Sandbox Bridge CLI
 *
 * Node.js CLI wrapper that sigma-ralph.sh calls for sandbox operations.
 * This bridge allows the bash script to interact with the Node.js sandbox
 * infrastructure for E2B, Docker, and Daytona providers.
 *
 * Usage from bash:
 *   node ralph-bridge.js --action=validate --provider=docker --workspace=/path/to/project
 *   node ralph-bridge.js --action=run-story --story-id=S001 --provider=e2b --workspace=.
 *   node ralph-bridge.js --action=status --provider=docker
 *   node ralph-bridge.js --action=estimate --stories=10 --provider=e2b
 *   node ralph-bridge.js --action=build-image --workspace=.
 *   node ralph-bridge.js --action=cleanup --provider=docker
 *
 * @version 1.0.0
 */

import { createRunnerFromOptions } from './ralph-integration.js';
import { SIGMA_DOCKER_IMAGE } from './providers/docker.js';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Parse command line arguments
 * @returns {Object}
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    action: 'status',
    provider: 'docker',
    workspace: process.cwd(),
    storyId: null,
    prdFile: null,
    stories: 1,
    minutesPerStory: 15,
    timeout: 120,
    memory: '4g',
    cpus: 2,
    budgetMax: 50,
    budgetWarn: 25,
    dryRun: false,
    verbose: false,
    engine: 'claude',
    outputFormat: 'bash' // bash or json
  };

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      const normalizedKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

      if (value === undefined) {
        // Boolean flag
        options[normalizedKey] = true;
      } else {
        options[normalizedKey] = value;
      }
    }
  }

  // Handle kebab-case to camelCase conversions
  if (options['story-id']) options.storyId = options['story-id'];
  if (options['prd-file']) options.prdFile = options['prd-file'];
  if (options['minutes-per-story']) options.minutesPerStory = options['minutes-per-story'];
  if (options['budget-max']) options.budgetMax = options['budget-max'];
  if (options['budget-warn']) options.budgetWarn = options['budget-warn'];
  if (options['dry-run']) options.dryRun = options['dry-run'];
  if (options['output-format']) options.outputFormat = options['output-format'];
  if (options['sandbox-provider']) options.provider = options['sandbox-provider'];

  return options;
}

/**
 * Output result in specified format
 * @param {Object} result
 * @param {string} format - 'bash' or 'json'
 */
function output(result, format = 'bash') {
  if (format === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    // Bash format: KEY=VALUE pairs
    const lines = [];
    function flatten(obj, prefix = '') {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}_${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, fullKey);
        } else {
          const normalizedKey = fullKey.replace(/([A-Z])/g, '_$1').toUpperCase();
          lines.push(`${normalizedKey}=${value}`);
        }
      }
    }
    flatten(result);
    console.log(lines.join('\n'));
  }
}

/**
 * Handle validate action
 */
async function handleValidate(options) {
  const runner = createRunnerFromOptions(options);
  const result = await runner.validateProvider();

  return {
    success: result.valid,
    provider: options.provider,
    valid: result.valid,
    error: result.error || null,
    warnings: result.warnings || []
  };
}

/**
 * Handle status action
 */
async function handleStatus(options) {
  const runner = createRunnerFromOptions(options);
  return await runner.getStatus();
}

/**
 * Handle estimate action
 */
async function handleEstimate(options) {
  const runner = createRunnerFromOptions(options);
  const estimate = await runner.getCostEstimate(
    parseInt(options.stories, 10),
    parseInt(options.minutesPerStory, 10)
  );

  return {
    success: true,
    ...estimate
  };
}

/**
 * Handle build-image action (Docker only)
 */
async function handleBuildImage(options) {
  if (options.provider !== 'docker') {
    return {
      success: false,
      error: 'build-image only applies to Docker provider'
    };
  }

  const runner = createRunnerFromOptions(options);
  const result = await runner.ensureDockerImage();

  return {
    success: true,
    built: result.built,
    message: result.message,
    image: SIGMA_DOCKER_IMAGE
  };
}

/**
 * Handle run-story action
 */
async function handleRunStory(options) {
  if (!options.storyId) {
    return {
      success: false,
      error: 'story-id is required for run-story action'
    };
  }

  const runner = createRunnerFromOptions(options);

  // Load story data from PRD file if provided
  let storyData = { id: options.storyId, title: options.storyId };

  if (options.prdFile) {
    try {
      const prdPath = path.isAbsolute(options.prdFile)
        ? options.prdFile
        : path.join(options.workspace, options.prdFile);
      const prdContent = await fs.readFile(prdPath, 'utf8');
      const prd = JSON.parse(prdContent);

      const story = prd.stories?.find(s => s.id === options.storyId);
      if (story) {
        storyData = story;
      }
    } catch (error) {
      // Continue with basic story data
      if (options.verbose) {
        console.error(`[Warning] Could not load PRD: ${error.message}`);
      }
    }
  }

  const result = await runner.runStoryInSandbox(
    options.storyId,
    storyData,
    options.prdFile || ''
  );

  return {
    storyId: options.storyId,
    success: result.success,
    output: result.output,
    error: result.error || null,
    dryRun: result.dryRun || false
  };
}

/**
 * Handle run-stream action
 */
async function handleRunStream(options) {
  if (!options.prdFile) {
    return {
      success: false,
      error: 'prd-file is required for run-stream action'
    };
  }

  const runner = createRunnerFromOptions(options);

  // Load stories from PRD
  const prdPath = path.isAbsolute(options.prdFile)
    ? options.prdFile
    : path.join(options.workspace, options.prdFile);
  const prdContent = await fs.readFile(prdPath, 'utf8');
  const prd = JSON.parse(prdContent);

  // Filter stories by stream if specified
  let stories = prd.stories || [];
  if (options.streamId) {
    stories = stories.filter(s =>
      s.tags?.streamId === options.streamId ||
      s.tags?.streamId === `swarm-${options.streamId}`
    );
  }

  // Only get pending stories
  stories = stories.filter(s => !s.passes);

  const result = await runner.runStreamInSandbox(
    options.streamId || 'default',
    stories,
    options.prdFile
  );

  return {
    streamId: options.streamId || 'default',
    success: result.failed === 0,
    completed: result.completed,
    failed: result.failed,
    totalStories: stories.length,
    results: result.results
  };
}

/**
 * Handle cleanup action
 */
async function handleCleanup(options) {
  const runner = createRunnerFromOptions(options);
  await runner.cleanup();

  return {
    success: true,
    message: 'All sandboxes cleaned up'
  };
}

/**
 * Handle cost-report action
 */
async function handleCostReport(options) {
  const runner = createRunnerFromOptions(options);
  await runner.initialize();

  const summary = await runner.costEstimator.getCostSummary(options.period || 'all');

  return {
    success: true,
    ...summary
  };
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
Ralph-Sandbox Bridge CLI v1.0.0

Usage: node ralph-bridge.js --action=<action> [options]

Actions:
  validate       Validate provider configuration
  status         Get current sandbox status
  estimate       Estimate cost for running stories
  build-image    Build Docker image (Docker only)
  run-story      Run a single story in sandbox
  run-stream     Run a stream of stories in sandbox
  cleanup        Cleanup all active sandboxes
  cost-report    Get cost report for a period

Options:
  --provider=<name>           Sandbox provider: docker, e2b, daytona (default: docker)
  --workspace=<path>          Project workspace path (default: current directory)
  --story-id=<id>             Story ID for run-story action
  --stream-id=<id>            Stream ID for run-stream action
  --prd-file=<path>           Path to prd.json file
  --stories=<n>               Number of stories for estimate (default: 1)
  --minutes-per-story=<n>     Estimated minutes per story (default: 15)
  --timeout=<seconds>         Sandbox creation timeout (default: 120)
  --memory=<size>             Docker memory limit (default: 4g)
  --cpus=<n>                  Docker CPU limit (default: 2)
  --budget-max=<usd>          Maximum budget in USD (default: 50)
  --budget-warn=<usd>         Warning threshold in USD (default: 25)
  --dry-run                   Show what would be done without executing
  --verbose                   Show detailed output
  --output-format=<format>    Output format: bash or json (default: bash)
  --period=<period>           Period for cost-report: day, week, month, all

Examples:
  # Validate Docker setup
  node ralph-bridge.js --action=validate --provider=docker

  # Get cost estimate for 10 stories
  node ralph-bridge.js --action=estimate --provider=e2b --stories=10

  # Run a story in E2B sandbox
  node ralph-bridge.js --action=run-story --story-id=S001 \\
    --provider=e2b --prd-file=docs/ralph/prototype/prd.json

  # Get cost report for the week
  node ralph-bridge.js --action=cost-report --period=week --output-format=json
`);
}

/**
 * Main entry point
 */
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  try {
    let result;

    switch (options.action) {
      case 'validate':
        result = await handleValidate(options);
        break;

      case 'status':
        result = await handleStatus(options);
        break;

      case 'estimate':
        result = await handleEstimate(options);
        break;

      case 'build-image':
        result = await handleBuildImage(options);
        break;

      case 'run-story':
        result = await handleRunStory(options);
        break;

      case 'run-stream':
        result = await handleRunStream(options);
        break;

      case 'cleanup':
        result = await handleCleanup(options);
        break;

      case 'cost-report':
        result = await handleCostReport(options);
        break;

      case 'help':
        showHelp();
        process.exit(0);
        break;

      default:
        result = {
          success: false,
          error: `Unknown action: ${options.action}. Use --help for usage.`
        };
    }

    output(result, options.outputFormat);

    // Exit with appropriate code
    process.exit(result.success === false ? 1 : 0);
  } catch (error) {
    output({
      success: false,
      error: error.message,
      stack: options.verbose ? error.stack : undefined
    }, options.outputFormat);

    process.exit(1);
  }
}

// Run if executed directly
main();
