/**
 * Sigma Protocol - Ralph-Sandbox Integration Bridge
 *
 * Connects the sigma-ralph.sh bash script to the existing sandbox infrastructure.
 * Provides the bridge between bash-based Ralph loop and Node.js sandbox providers.
 *
 * @version 1.0.0
 */

import { SandboxManager, ensureProvidersRegistered } from './index.js';
import { loadSandboxConfig, validateProviderConfig } from './config.js';
import { CostEstimator, PROVIDER_PRICING } from './cost-estimator.js';
import { DockerProvider, SIGMA_DOCKER_IMAGE } from './providers/docker.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { promises as fs } from 'fs';

const execAsync = promisify(exec);

/**
 * RalphSandboxRunner - Main class for running Ralph stories in sandboxes
 *
 * This class orchestrates the execution of Ralph stories within isolated
 * sandbox environments (E2B, Docker, or Daytona).
 */
export class RalphSandboxRunner {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.provider = options.provider || 'docker';
    this.timeout = options.timeout || 120;
    this.memory = options.memory || '4g';
    this.cpus = options.cpus || 2;
    this.budgetMax = options.budgetMax || 50;
    this.budgetWarn = options.budgetWarn || 25;
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.engine = options.engine || 'claude';

    this.manager = null;
    this.costEstimator = null;
    this.activeSandboxes = new Map();
    this.costAccumulated = 0;
    this._initialized = false;
  }

  /**
   * Initialize the sandbox runner
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._initialized) return;

    await ensureProvidersRegistered();

    this.manager = new SandboxManager(this.projectRoot);
    await this.manager.initialize();

    const config = await loadSandboxConfig(this.projectRoot);

    // Use configured provider or fallback to specified
    if (config?.provider) {
      this.provider = this.provider || config.provider;
    }

    // Set up the provider
    await this.manager.setProvider(this.provider, {
      projectRoot: this.projectRoot,
      timeout: this.timeout,
      memory: this.memory,
      cpus: this.cpus
    });

    this.costEstimator = new CostEstimator(this.projectRoot, config);
    this._initialized = true;

    if (this.verbose) {
      console.log(`[Ralph-Sandbox] Initialized with provider: ${this.provider}`);
    }
  }

  /**
   * Validate that the sandbox provider is properly configured
   * @returns {Promise<{valid: boolean, error?: string}>}
   */
  async validateProvider() {
    await this.initialize();

    const config = await loadSandboxConfig(this.projectRoot);
    const validation = validateProviderConfig(this.provider, config);

    if (!validation.valid) {
      return {
        valid: false,
        error: validation.errors.join('; ')
      };
    }

    const providerInstance = this.manager.getProviderInstance();
    if (!providerInstance) {
      return {
        valid: false,
        error: `Provider ${this.provider} not available`
      };
    }

    const credentialCheck = await providerInstance.validateCredentials();
    return credentialCheck;
  }

  /**
   * Build Docker image if using Docker provider and image doesn't exist
   * @returns {Promise<{built: boolean, message: string}>}
   */
  async ensureDockerImage() {
    if (this.provider !== 'docker') {
      return { built: false, message: 'Not using Docker provider' };
    }

    const dockerProvider = new DockerProvider({ projectRoot: this.projectRoot });
    const available = await dockerProvider.isAvailable();

    if (!available) {
      return { built: false, message: 'Docker not available' };
    }

    // Check if image exists
    try {
      await execAsync(`docker image inspect ${SIGMA_DOCKER_IMAGE}`);
      return { built: false, message: 'Image already exists' };
    } catch {
      // Image doesn't exist, build it
      if (this.verbose) {
        console.log(`[Ralph-Sandbox] Building ${SIGMA_DOCKER_IMAGE}...`);
      }

      await dockerProvider.buildImage(this.projectRoot);
      return { built: true, message: `Built ${SIGMA_DOCKER_IMAGE}` };
    }
  }

  /**
   * Check budget before running
   * @param {Object} estimate - Cost estimate
   * @returns {{allowed: boolean, reason?: string}}
   */
  checkBudget(estimate) {
    if (estimate.wouldExceedBudget) {
      return {
        allowed: false,
        reason: `Would exceed budget. Estimated: $${estimate.estimatedCostWithBuffer}, Remaining: $${estimate.remainingBudget}`
      };
    }

    if (estimate.wouldTriggerWarning) {
      console.warn(`[Ralph-Sandbox] Warning: This run may exceed warning threshold of $${this.budgetWarn}`);
    }

    return { allowed: true };
  }

  /**
   * Run a single story in a sandbox
   * @param {string} storyId - Story identifier
   * @param {Object} storyData - Story data from prd.json
   * @param {string} prdFile - Path to PRD file
   * @returns {Promise<{success: boolean, output: string, error?: string}>}
   */
  async runStoryInSandbox(storyId, storyData, prdFile) {
    await this.initialize();

    if (this.dryRun) {
      return {
        success: true,
        output: `[DRY RUN] Would run story ${storyId} in ${this.provider} sandbox`,
        dryRun: true
      };
    }

    const sandboxId = `ralph-story-${storyId}-${Date.now()}`;

    try {
      // Create sandbox
      const sandbox = await this.manager.createSandbox(sandboxId, {
        envVars: {
          SIGMA_STORY_ID: storyId,
          SIGMA_PRD_FILE: prdFile,
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || ''
        },
        timeout: this.timeout
      });

      this.activeSandboxes.set(sandboxId, sandbox);

      // Clone the workspace into the sandbox
      const provider = this.manager.getProviderInstance();

      // Get git remote URL
      let repoUrl;
      try {
        const { stdout } = await execAsync('git config --get remote.origin.url', {
          cwd: this.projectRoot
        });
        repoUrl = stdout.trim();
      } catch {
        // If no remote, we'll copy files instead
        repoUrl = null;
      }

      if (repoUrl) {
        await provider.clone(sandboxId, repoUrl, 'HEAD');
      } else {
        // Copy workspace to sandbox
        await this._copyWorkspaceToSandbox(sandboxId);
      }

      // Run the story
      const prompt = this._generateSandboxPrompt(storyData, prdFile);
      const result = await this._executeInSandbox(sandboxId, prompt);

      // Track costs
      if (PROVIDER_PRICING[this.provider]) {
        const runtime = sandbox.getRuntime();
        const cost = (runtime / 60) * PROVIDER_PRICING[this.provider].costPerMinute;
        this.costAccumulated += cost;

        await this.costEstimator.recordCost({
          provider: this.provider,
          sandboxId,
          storyId,
          runtimeMinutes: runtime / 60,
          cost,
          success: result.success
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message
      };
    } finally {
      // Cleanup sandbox
      try {
        await this.manager.destroySandbox(sandboxId);
      } catch {
        // Ignore cleanup errors
      }
      this.activeSandboxes.delete(sandboxId);
    }
  }

  /**
   * Run an entire stream of stories in sandboxes
   * @param {string} streamId - Stream identifier
   * @param {Object[]} stories - Array of stories
   * @param {string} prdFile - Path to PRD file
   * @returns {Promise<{completed: number, failed: number, results: Object[]}>}
   */
  async runStreamInSandbox(streamId, stories, prdFile) {
    await this.initialize();

    if (this.verbose) {
      console.log(`[Ralph-Sandbox] Running stream ${streamId} with ${stories.length} stories`);
    }

    const results = [];
    let completed = 0;
    let failed = 0;

    for (const story of stories) {
      const result = await this.runStoryInSandbox(story.id, story, prdFile);
      results.push({
        storyId: story.id,
        ...result
      });

      if (result.success) {
        completed++;
      } else {
        failed++;
      }
    }

    return { completed, failed, results };
  }

  /**
   * Generate the sandbox command for bash to execute
   * @param {string} action - Action to perform
   * @param {Object} options - Action options
   * @returns {string} - Command string
   */
  getSandboxCommand(action, options = {}) {
    const bridgePath = path.join(import.meta.dirname, 'ralph-bridge.js');
    const args = [
      `--action=${action}`,
      `--provider=${this.provider}`,
      `--workspace=${this.projectRoot}`
    ];

    if (options.storyId) args.push(`--story-id=${options.storyId}`);
    if (options.prdFile) args.push(`--prd-file=${options.prdFile}`);
    if (options.timeout) args.push(`--timeout=${options.timeout}`);
    if (this.dryRun) args.push('--dry-run');
    if (this.verbose) args.push('--verbose');

    return `node "${bridgePath}" ${args.join(' ')}`;
  }

  /**
   * Get cost estimate for running stories
   * @param {number} storyCount - Number of stories
   * @param {number} minutesPerStory - Estimated minutes per story
   * @returns {Promise<Object>}
   */
  async getCostEstimate(storyCount, minutesPerStory = 15) {
    await this.initialize();

    return this.costEstimator.estimate({
      provider: this.provider,
      stories: storyCount,
      forksPerStory: 1, // Ralph runs sequentially
      estimatedMinutesPerStory: minutesPerStory
    });
  }

  /**
   * Get sandbox status for bash script
   * @returns {Promise<Object>}
   */
  async getStatus() {
    await this.initialize();

    const config = await loadSandboxConfig(this.projectRoot);
    const validation = await this.validateProvider();

    return {
      provider: this.provider,
      configured: config !== null,
      valid: validation.valid,
      error: validation.error,
      activeSandboxes: this.activeSandboxes.size,
      costAccumulated: this.costAccumulated,
      budgetRemaining: await this.costEstimator?.getCostSummary() || null
    };
  }

  /**
   * Cleanup all active sandboxes
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (this.manager) {
      await this.manager.destroyAllSandboxes();
    }
    this.activeSandboxes.clear();
  }

  /**
   * Copy workspace to sandbox (for Docker when no git remote)
   * @private
   */
  async _copyWorkspaceToSandbox(sandboxId) {
    const provider = this.manager.getProviderInstance();

    // Create workspace directory in sandbox
    await provider.execute(sandboxId, 'mkdir -p /workspace');

    // For Docker, we can use docker cp
    if (this.provider === 'docker') {
      const sandbox = this.activeSandboxes.get(sandboxId);
      const containerName = sandbox?.metadata?.containerName;

      if (containerName) {
        // Copy essential directories
        const dirs = ['src', 'docs', 'scripts', 'package.json', 'AGENTS.md'];

        for (const dir of dirs) {
          const localPath = path.join(this.projectRoot, dir);
          try {
            await fs.access(localPath);
            await execAsync(`docker cp "${localPath}" ${containerName}:/workspace/`);
          } catch {
            // Skip if doesn't exist
          }
        }
      }
    }
  }

  /**
   * Generate prompt for sandbox execution
   * @private
   */
  _generateSandboxPrompt(storyData, prdFile) {
    return `You are running inside an isolated sandbox environment.

STORY: ${storyData.title} (${storyData.id})
DESCRIPTION: ${storyData.description || 'See PRD'}
PRD: ${prdFile}

INSTRUCTIONS:
1. Read the PRD file at ${prdFile}
2. Implement the story according to specifications
3. Run any verification commands
4. Commit changes with: git commit -m "feat(${storyData.id}): ${storyData.title}"
5. Output RALPH_STORY_COMPLETE: ${storyData.id} when done
6. Output RALPH_STORY_BLOCKED: ${storyData.id} if stuck

Begin by reading the PRD.`;
  }

  /**
   * Execute command in sandbox and capture output
   * @private
   */
  async _executeInSandbox(sandboxId, prompt) {
    const provider = this.manager.getProviderInstance();

    // Write prompt to file
    await provider.execute(sandboxId, `echo '${prompt.replace(/'/g, "\\'")}' > /tmp/ralph-prompt.txt`);

    // Run the AI engine
    let command;
    if (this.engine === 'claude') {
      command = 'claude --dangerously-skip-permissions -p "$(cat /tmp/ralph-prompt.txt)"';
    } else {
      command = 'opencode --mode=plan -p "$(cat /tmp/ralph-prompt.txt)"';
    }

    const result = await provider.execute(sandboxId, command, {
      timeout: this.timeout * 1000
    });

    const output = result.stdout + result.stderr;
    const success = output.includes('RALPH_STORY_COMPLETE');

    return {
      success,
      output,
      exitCode: result.exitCode
    };
  }
}

/**
 * Create a RalphSandboxRunner from command-line options
 * @param {Object} options - CLI options
 * @returns {RalphSandboxRunner}
 */
export function createRunnerFromOptions(options) {
  return new RalphSandboxRunner({
    projectRoot: options.workspace || process.cwd(),
    provider: options.provider || 'docker',
    timeout: parseInt(options.timeout, 10) || 120,
    memory: options.memory || '4g',
    cpus: parseInt(options.cpus, 10) || 2,
    budgetMax: parseInt(options.budgetMax, 10) || 50,
    budgetWarn: parseInt(options.budgetWarn, 10) || 25,
    dryRun: options.dryRun || false,
    verbose: options.verbose || false,
    engine: options.engine || 'claude'
  });
}

/**
 * Format status output for bash consumption
 * @param {Object} status - Status object
 * @returns {string}
 */
export function formatStatusForBash(status) {
  return [
    `PROVIDER=${status.provider}`,
    `CONFIGURED=${status.configured}`,
    `VALID=${status.valid}`,
    `ACTIVE_SANDBOXES=${status.activeSandboxes}`,
    `COST_ACCUMULATED=${status.costAccumulated}`,
    status.error ? `ERROR=${status.error}` : ''
  ].filter(Boolean).join('\n');
}

/**
 * Format cost estimate for bash consumption
 * @param {Object} estimate - Cost estimate
 * @returns {string}
 */
export function formatEstimateForBash(estimate) {
  return [
    `PROVIDER=${estimate.provider}`,
    `ESTIMATED_COST=${estimate.estimatedCostWithBuffer}`,
    `REMAINING_BUDGET=${estimate.remainingBudget}`,
    `WOULD_EXCEED_BUDGET=${estimate.wouldExceedBudget}`,
    `WOULD_TRIGGER_WARNING=${estimate.wouldTriggerWarning}`
  ].join('\n');
}
