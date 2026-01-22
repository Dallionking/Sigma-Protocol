/**
 * Sigma Protocol - Sandbox Provider Abstraction Layer
 * 
 * Provides a unified interface for managing sandboxes across different providers:
 * - E2B (cloud)
 * - Docker (local)
 * - Daytona (open-source cloud)
 */

import { loadSandboxConfig, saveSandboxConfig } from './config.js';
import { CostEstimator } from './cost-estimator.js';
import { 
  SandboxProvider, 
  Sandbox, 
  SandboxState, 
  StateTransitions, 
  isValidTransition 
} from './base.js';

// Re-export base classes
export { 
  SandboxProvider, 
  Sandbox, 
  SandboxState, 
  StateTransitions, 
  isValidTransition 
};

/**
 * Provider factory - creates provider instances based on name
 */
const providerRegistry = new Map();

/**
 * Register a provider class
 * @param {string} name - Provider name
 * @param {typeof SandboxProvider} ProviderClass - Provider class
 */
export function registerProvider(name, ProviderClass) {
  providerRegistry.set(name.toLowerCase(), ProviderClass);
}

/**
 * Get a provider instance
 * @param {string} name - Provider name
 * @param {Object} config - Provider configuration
 * @returns {SandboxProvider}
 */
export function getProvider(name, config = {}) {
  const ProviderClass = providerRegistry.get(name.toLowerCase());
  if (!ProviderClass) {
    const available = Array.from(providerRegistry.keys()).join(', ');
    throw new Error(`Unknown provider: ${name}. Available providers: ${available}`);
  }
  return new ProviderClass(config);
}

/**
 * Get all registered provider names
 * @returns {string[]}
 */
export function getAvailableProviders() {
  return Array.from(providerRegistry.keys());
}

/**
 * Sandbox Manager - High-level orchestration
 */
export class SandboxManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.config = null;
    this.provider = null;
    this.costEstimator = null;
    this.activeSandboxes = new Map();
    this.sessionState = null;
  }

  /**
   * Initialize the sandbox manager
   * @returns {Promise<void>}
   */
  async initialize() {
    // Ensure providers are registered
    await ensureProvidersRegistered();
    
    this.config = await loadSandboxConfig(this.projectRoot);
    
    if (this.config?.provider) {
      this.provider = getProvider(this.config.provider, this.config);
    }
    
    this.costEstimator = new CostEstimator(this.projectRoot, this.config);
  }

  /**
   * Check if sandbox is configured
   * @returns {boolean}
   */
  isConfigured() {
    return this.config !== null && this.config.provider !== undefined;
  }

  /**
   * Get current provider
   * @returns {SandboxProvider|null}
   */
  getProvider() {
    return this.provider;
  }

  /**
   * Set provider
   * @param {string} providerName
   * @param {Object} providerConfig
   */
  async setProvider(providerName, providerConfig = {}) {
    await ensureProvidersRegistered();
    this.provider = getProvider(providerName, { ...this.config, ...providerConfig });
    this.config = { ...this.config, provider: providerName, ...providerConfig };
    await saveSandboxConfig(this.projectRoot, this.config);
  }

  /**
   * Create multiple sandboxes for Best of N pattern
   * @param {Object} options
   * @param {string} options.storyId - Story identifier
   * @param {number} options.forks - Number of forks (N)
   * @param {Object} options.envVars - Environment variables
   * @returns {Promise<Sandbox[]>}
   */
  async createBestOfNSandboxes(options) {
    const { storyId, forks = 3, envVars = {} } = options;
    
    if (!this.provider) {
      throw new Error('No provider configured. Run `sigma sandbox setup` first.');
    }

    // Check concurrent limits
    const limits = this.config?.limits?.max_concurrent?.[this.config.provider] ?? 10;
    const currentActive = this.activeSandboxes.size;
    
    if (currentActive + forks > limits) {
      throw new Error(
        `Would exceed concurrent sandbox limit (${limits}). ` +
        `Currently active: ${currentActive}, requested: ${forks}`
      );
    }

    const sandboxes = [];
    
    for (let i = 0; i < forks; i++) {
      const sandboxId = `${storyId}-fork-${i}`;
      const sandbox = new Sandbox(sandboxId, this.config.provider, {
        storyId,
        forkIndex: i,
        totalForks: forks
      });
      
      sandbox.transitionTo(SandboxState.CREATING);
      
      try {
        await this.provider.create({
          id: sandboxId,
          envVars: {
            ...envVars,
            SIGMA_STORY_ID: storyId,
            SIGMA_FORK_INDEX: String(i),
            SIGMA_TOTAL_FORKS: String(forks)
          },
          timeout: this.config?.limits?.timeout_seconds?.execution ?? 1800
        });
        
        sandbox.transitionTo(SandboxState.RUNNING);
        this.activeSandboxes.set(sandboxId, sandbox);
        sandboxes.push(sandbox);
      } catch (error) {
        sandbox.transitionTo(SandboxState.FAILED);
        sandbox.result = { error: error.message };
        sandboxes.push(sandbox);
      }
    }

    return sandboxes;
  }

  /**
   * Get cost estimate for orchestration
   * @param {Object} options
   * @param {number} options.stories - Number of stories
   * @param {number} options.forksPerStory - Forks per story
   * @param {number} options.estimatedMinutesPerStory - Minutes per story
   * @returns {Object}
   */
  async getCostEstimate(options) {
    if (!this.costEstimator) {
      throw new Error('Cost estimator not initialized');
    }
    return this.costEstimator.estimate(options);
  }

  /**
   * Get all active sandboxes
   * @returns {Sandbox[]}
   */
  getActiveSandboxes() {
    return Array.from(this.activeSandboxes.values());
  }

  /**
   * Destroy a sandbox
   * @param {string} sandboxId
   */
  async destroySandbox(sandboxId) {
    const sandbox = this.activeSandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    await this.provider.destroy(sandboxId);
    sandbox.transitionTo(SandboxState.DESTROYED);
    this.activeSandboxes.delete(sandboxId);
  }

  /**
   * Destroy all sandboxes
   */
  async destroyAllSandboxes() {
    const promises = Array.from(this.activeSandboxes.keys()).map(id => 
      this.destroySandbox(id).catch(err => console.error(`Failed to destroy ${id}:`, err))
    );
    await Promise.all(promises);
  }

  // Alias for compatibility
  async destroyAll() {
    return this.destroyAllSandboxes();
  }

  /**
   * Create a single sandbox
   * @param {string} sandboxId - Unique sandbox identifier
   * @param {Object} options - Sandbox options
   * @param {Object} options.envVars - Environment variables
   * @param {number} options.timeout - Timeout in seconds
   * @returns {Promise<Sandbox>}
   */
  async createSandbox(sandboxId, options = {}) {
    const { envVars = {}, timeout = 1800 } = options;
    
    if (!this.provider) {
      throw new Error('No provider configured. Run `sigma sandbox setup` first.');
    }

    // Check concurrent limits
    const limits = this.config?.limits?.max_concurrent?.[this.config.provider] ?? 10;
    const currentActive = this.activeSandboxes.size;
    
    if (currentActive >= limits) {
      throw new Error(
        `Would exceed concurrent sandbox limit (${limits}). ` +
        `Currently active: ${currentActive}`
      );
    }

    const sandbox = new Sandbox(sandboxId, this.config.provider, {
      createdAt: new Date().toISOString()
    });
    
    sandbox.transitionTo(SandboxState.CREATING);
    
    try {
      await this.provider.create({
        id: sandboxId,
        envVars,
        timeout
      });
      
      sandbox.transitionTo(SandboxState.RUNNING);
      this.activeSandboxes.set(sandboxId, sandbox);
      return sandbox;
    } catch (error) {
      sandbox.transitionTo(SandboxState.FAILED);
      sandbox.result = { error: error.message };
      throw error;
    }
  }

  /**
   * Get provider instance for direct operations
   * @returns {SandboxProvider|null}
   */
  getProviderInstance() {
    return this.provider;
  }
}

// Register built-in providers (lazy load to avoid circular deps)
let providersRegistered = false;

export async function ensureProvidersRegistered() {
  if (providersRegistered) return;
  
  const { E2BProvider } = await import('./providers/e2b.js');
  const { DockerProvider } = await import('./providers/docker.js');
  const { DaytonaProvider } = await import('./providers/daytona.js');
  
  registerProvider('e2b', E2BProvider);
  registerProvider('docker', DockerProvider);
  registerProvider('daytona', DaytonaProvider);
  
  providersRegistered = true;
}

// Re-export providers
export { E2BProvider } from './providers/e2b.js';
export { DockerProvider } from './providers/docker.js';
export { DaytonaProvider } from './providers/daytona.js';
export { PROVIDERS } from './providers/index.js';
