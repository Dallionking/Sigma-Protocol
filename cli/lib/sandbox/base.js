/**
 * Sigma Protocol - Sandbox Base Classes
 * 
 * Base classes for sandbox providers to avoid circular dependencies
 */

/**
 * Sandbox state machine states
 */
export const SandboxState = {
  PENDING: 'pending',
  CREATING: 'creating',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DESTROYED: 'destroyed'
};

/**
 * Valid state transitions
 * Note: DESTROYED is allowed from any state for cleanup purposes
 */
export const StateTransitions = {
  [SandboxState.PENDING]: [SandboxState.CREATING, SandboxState.DESTROYED],
  [SandboxState.CREATING]: [SandboxState.RUNNING, SandboxState.FAILED, SandboxState.DESTROYED],
  [SandboxState.RUNNING]: [SandboxState.COMPLETED, SandboxState.FAILED, SandboxState.DESTROYED],
  [SandboxState.COMPLETED]: [SandboxState.DESTROYED],
  [SandboxState.FAILED]: [SandboxState.DESTROYED],
  [SandboxState.DESTROYED]: []
};

/**
 * Validate state transition
 * @param {string} from - Current state
 * @param {string} to - Target state
 * @returns {boolean}
 */
export function isValidTransition(from, to) {
  return StateTransitions[from]?.includes(to) ?? false;
}

/**
 * Abstract base class for sandbox providers
 * All providers must implement these methods
 */
export class SandboxProvider {
  constructor(config = {}) {
    this.config = config;
    this.sandboxes = new Map();
  }

  /**
   * Get provider name
   * @returns {string}
   */
  get name() {
    throw new Error('Provider must implement name getter');
  }

  /**
   * Check if provider is available/configured
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    throw new Error('Provider must implement isAvailable()');
  }

  /**
   * Validate provider credentials
   * @returns {Promise<{valid: boolean, error?: string}>}
   */
  async validateCredentials() {
    throw new Error('Provider must implement validateCredentials()');
  }

  /**
   * Create a new sandbox
   * @param {Object} options - Sandbox creation options
   * @param {string} options.id - Unique sandbox identifier
   * @param {Object} options.envVars - Environment variables to inject
   * @param {number} options.timeout - Timeout in seconds
   * @returns {Promise<Sandbox>}
   */
  async create(options) {
    throw new Error('Provider must implement create()');
  }

  /**
   * Execute a command in the sandbox
   * @param {string} sandboxId - Sandbox identifier
   * @param {string} command - Command to execute
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
   */
  async execute(sandboxId, command) {
    throw new Error('Provider must implement execute()');
  }

  /**
   * Clone a repository into the sandbox
   * @param {string} sandboxId - Sandbox identifier
   * @param {string} repoUrl - Repository URL
   * @param {string} branch - Branch to clone (optional)
   * @returns {Promise<void>}
   */
  async clone(sandboxId, repoUrl, branch = 'main') {
    throw new Error('Provider must implement clone()');
  }

  /**
   * Get sandbox logs
   * @param {string} sandboxId - Sandbox identifier
   * @returns {Promise<string>}
   */
  async getLogs(sandboxId) {
    throw new Error('Provider must implement getLogs()');
  }

  /**
   * Get public URL for sandbox (if applicable)
   * @param {string} sandboxId - Sandbox identifier
   * @returns {Promise<string|null>}
   */
  async getPublicUrl(sandboxId) {
    return null; // Not all providers support this
  }

  /**
   * Get sandbox status
   * @param {string} sandboxId - Sandbox identifier
   * @returns {Promise<'pending'|'creating'|'running'|'completed'|'failed'|'destroyed'>}
   */
  async getStatus(sandboxId) {
    throw new Error('Provider must implement getStatus()');
  }

  /**
   * Destroy a sandbox
   * @param {string} sandboxId - Sandbox identifier
   * @returns {Promise<void>}
   */
  async destroy(sandboxId) {
    throw new Error('Provider must implement destroy()');
  }

  /**
   * Destroy all sandboxes
   * @returns {Promise<void>}
   */
  async destroyAll() {
    const promises = Array.from(this.sandboxes.keys()).map(id => this.destroy(id));
    await Promise.all(promises);
  }

  /**
   * Get all active sandboxes
   * @returns {Map<string, Object>}
   */
  getActiveSandboxes() {
    return this.sandboxes;
  }

  /**
   * Get provider-specific cost per minute
   * @returns {number} Cost in USD per minute
   */
  getCostPerMinute() {
    return 0; // Free by default, override in paid providers
  }
}

/**
 * Sandbox instance wrapper
 */
export class Sandbox {
  constructor(id, provider, metadata = {}) {
    this.id = id;
    this.provider = provider;
    this.state = SandboxState.PENDING;
    this.createdAt = new Date();
    this.metadata = metadata;
    this.logs = [];
    this.result = null;
  }

  /**
   * Transition to a new state
   * @param {string} newState
   */
  transitionTo(newState) {
    if (!isValidTransition(this.state, newState)) {
      throw new Error(`Invalid state transition: ${this.state} → ${newState}`);
    }
    this.state = newState;
    if (newState === SandboxState.COMPLETED || newState === SandboxState.FAILED) {
      this.completedAt = new Date();
    }
  }

  /**
   * Get runtime in seconds
   * @returns {number}
   */
  getRuntime() {
    const end = this.completedAt || new Date();
    return Math.floor((end - this.createdAt) / 1000);
  }

  /**
   * Serialize sandbox to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      provider: this.provider,
      state: this.state,
      createdAt: this.createdAt.toISOString(),
      completedAt: this.completedAt?.toISOString(),
      metadata: this.metadata,
      runtime: this.getRuntime(),
      result: this.result
    };
  }
}

