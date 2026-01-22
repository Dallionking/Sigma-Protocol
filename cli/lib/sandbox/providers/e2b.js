/**
 * Sigma Protocol - E2B Cloud Sandbox Provider
 * 
 * E2B (e2b.dev) provides isolated cloud sandboxes for AI agents.
 * Used by Perplexity, Manus, Groq for production workloads.
 * 
 * @see https://e2b.dev/docs
 */

import { SandboxProvider, Sandbox, SandboxState } from '../base.js';
import { getResolvedCredentials } from '../config.js';
import { promises as fs } from 'fs';

/**
 * E2B Cloud Sandbox Provider
 * Implements the SandboxProvider interface for E2B cloud sandboxes
 */
export class E2BProvider extends SandboxProvider {
  constructor(config = {}) {
    super(config);
    this.client = null;
    this.template = config.e2b_template || 'base';
    this._initialized = false;
  }

  /**
   * Get provider name
   */
  get name() {
    return 'e2b';
  }

  /**
   * Initialize E2B SDK (lazy loaded)
   * @private
   */
  async _ensureInitialized() {
    if (this._initialized) return;

    try {
      // Dynamic import of E2B SDK
      const e2b = await import('e2b');
      this.Sandbox = e2b.Sandbox;
      this._initialized = true;
    } catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'MODULE_NOT_FOUND') {
        throw new Error(
          'E2B SDK not installed. Install it with: npm install e2b\n' +
          'Then set E2B_API_KEY environment variable.'
        );
      }
      throw error;
    }
  }

  /**
   * Get API key from environment
   * @private
   */
  _getApiKey() {
    const creds = getResolvedCredentials(this.config);
    return creds.e2b_api_key || process.env.E2B_API_KEY;
  }

  /**
   * Check if provider is available/configured
   */
  async isAvailable() {
    const apiKey = this._getApiKey();
    if (!apiKey) return false;

    try {
      await this._ensureInitialized();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate provider credentials
   */
  async validateCredentials() {
    const apiKey = this._getApiKey();
    
    if (!apiKey) {
      return {
        valid: false,
        error: 'E2B_API_KEY environment variable is not set'
      };
    }

    try {
      await this._ensureInitialized();
      
      // Create a quick sandbox to test the API key
      const sandbox = await this.Sandbox.create({
        apiKey,
        template: 'base',
        timeoutMs: 30000 // 30 second timeout for validation
      });
      
      // Immediately destroy it
      await sandbox.kill();
      
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `E2B API validation failed: ${error.message}`
      };
    }
  }

  /**
   * Create a new E2B sandbox
   */
  async create(options) {
    const { id, envVars = {}, timeout = 1800 } = options;
    
    await this._ensureInitialized();
    const apiKey = this._getApiKey();

    if (!apiKey) {
      throw new Error('E2B_API_KEY not configured');
    }

    try {
      // Create E2B sandbox
      const sandbox = await this.Sandbox.create({
        apiKey,
        template: this.template,
        timeoutMs: timeout * 1000,
        envVars: {
          ...envVars,
          // Never expose API key in logs
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
          SIGMA_SANDBOX_ID: id
        },
        // Enable lifecycle events for monitoring
        onStdout: (data) => this._handleOutput(id, 'stdout', data),
        onStderr: (data) => this._handleOutput(id, 'stderr', data),
        onExit: (code) => this._handleExit(id, code)
      });

      // Store sandbox reference
      const sandboxWrapper = new Sandbox(id, this.name, {
        e2bId: sandbox.id,
        template: this.template,
        timeout
      });
      
      sandboxWrapper._e2bSandbox = sandbox;
      this.sandboxes.set(id, sandboxWrapper);

      return sandboxWrapper;
    } catch (error) {
      throw new Error(`Failed to create E2B sandbox: ${error.message}`);
    }
  }

  /**
   * Handle stdout/stderr output
   * @private
   */
  _handleOutput(sandboxId, stream, data) {
    const sandbox = this.sandboxes.get(sandboxId);
    if (sandbox) {
      sandbox.logs.push({
        timestamp: new Date().toISOString(),
        stream,
        data: data.toString()
      });
    }
  }

  /**
   * Handle sandbox exit
   * @private
   */
  _handleExit(sandboxId, code) {
    const sandbox = this.sandboxes.get(sandboxId);
    if (sandbox && sandbox.state === SandboxState.RUNNING) {
      if (code === 0) {
        sandbox.transitionTo(SandboxState.COMPLETED);
      } else {
        sandbox.transitionTo(SandboxState.FAILED);
        sandbox.result = { exitCode: code };
      }
    }
  }

  /**
   * Execute a command in the sandbox with optional streaming callbacks
   * @param {string} sandboxId - Sandbox identifier
   * @param {string} command - Command to execute
   * @param {Object} [options] - Execution options
   * @param {Function} [options.onStdout] - Callback for stdout data
   * @param {Function} [options.onStderr] - Callback for stderr data
   * @param {number} [options.timeout] - Command timeout in ms
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
   */
  async execute(sandboxId, command, options = {}) {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const sandbox = sandboxWrapper._e2bSandbox;
    if (!sandbox) {
      throw new Error(`E2B sandbox instance not available for: ${sandboxId}`);
    }

    const { onStdout, onStderr, timeout } = options;
    let stdout = '';
    let stderr = '';

    try {
      // E2B SDK v1.x uses sandbox.commands.run() for simple commands
      // For streaming, we can use process.start() if available
      
      // Try streaming approach first (if callbacks provided)
      if (onStdout || onStderr) {
        try {
          // Use process.start for streaming if available
          if (sandbox.process && typeof sandbox.process.start === 'function') {
            const proc = await sandbox.process.start({
              cmd: command,
              onStdout: (data) => {
                const text = typeof data === 'string' ? data : data.toString();
                stdout += text;
                this._handleOutput(sandboxId, 'stdout', text);
                if (onStdout) onStdout(text);
              },
              onStderr: (data) => {
                const text = typeof data === 'string' ? data : data.toString();
                stderr += text;
                this._handleOutput(sandboxId, 'stderr', text);
                if (onStderr) onStderr(text);
              }
            });

            // Wait for process to complete
            const result = await proc.wait();

            return {
              stdout,
              stderr,
              exitCode: result.exitCode || 0
            };
          }
        } catch (_streamError) {
          // Streaming not available, fall back to non-streaming
          console.warn('Streaming not available, falling back to batch execution');
        }
      }

      // Fall back to non-streaming execution
      const runOptions = {};
      if (timeout) runOptions.timeout = timeout;
      
      const result = await sandbox.commands.run(command, runOptions);

      // Log output
      if (result.stdout) {
        this._handleOutput(sandboxId, 'stdout', result.stdout);
        if (onStdout) onStdout(result.stdout);
      }
      if (result.stderr) {
        this._handleOutput(sandboxId, 'stderr', result.stderr);
        if (onStderr) onStderr(result.stderr);
      }

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: result.exitCode || 0
      };
    } catch (error) {
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }

  /**
   * Clone a repository into the sandbox
   */
  async clone(sandboxId, repoUrl, branch = 'main') {
    const cloneCmd = `git clone --branch ${branch} --single-branch ${repoUrl} /workspace`;
    return this.execute(sandboxId, cloneCmd);
  }

  /**
   * Get sandbox logs
   */
  async getLogs(sandboxId) {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    return sandbox.logs.map(log => 
      `[${log.timestamp}] [${log.stream}] ${log.data}`
    ).join('\n');
  }

  /**
   * Get public URL for sandbox preview
   */
  async getPublicUrl(sandboxId) {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const sandbox = sandboxWrapper._e2bSandbox;
    if (!sandbox) return null;

    try {
      // E2B provides getHostname for exposing ports
      const hostname = sandbox.getHostname(3000); // Default Next.js/React port
      return `https://${hostname}`;
    } catch {
      return null;
    }
  }

  /**
   * Get sandbox status
   */
  async getStatus(sandboxId) {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      return SandboxState.DESTROYED;
    }
    return sandbox.state;
  }

  /**
   * Destroy a sandbox
   */
  async destroy(sandboxId) {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper) {
      return; // Already destroyed
    }

    const sandbox = sandboxWrapper._e2bSandbox;
    if (sandbox) {
      try {
        await sandbox.kill();
      } catch (error) {
        console.warn(`Warning: Failed to kill E2B sandbox ${sandboxId}:`, error.message);
      }
    }

    sandboxWrapper.transitionTo(SandboxState.DESTROYED);
    this.sandboxes.delete(sandboxId);
  }

  /**
   * Get cost per minute for E2B
   */
  getCostPerMinute() {
    return 0.10; // ~$6/hour for standard sandbox
  }

  /**
   * Upload a file to the sandbox
   * @param {string} sandboxId
   * @param {string} localPath
   * @param {string} remotePath
   */
  async uploadFile(sandboxId, localPath, remotePath) {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper?._e2bSandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const sandbox = sandboxWrapper._e2bSandbox;
    const content = await fs.readFile(localPath);
    
    await sandbox.filesystem.write(remotePath, content);
  }

  /**
   * Download a file from the sandbox
   * @param {string} sandboxId
   * @param {string} remotePath
   * @param {string} localPath
   */
  async downloadFile(sandboxId, remotePath, localPath) {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper?._e2bSandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const sandbox = sandboxWrapper._e2bSandbox;
    const content = await sandbox.filesystem.read(remotePath);
    
    await fs.writeFile(localPath, content);
  }

  /**
   * List files in a directory
   * @param {string} sandboxId
   * @param {string} path
   * @returns {Promise<string[]>}
   */
  async listFiles(sandboxId, path = '/workspace') {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper?._e2bSandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const sandbox = sandboxWrapper._e2bSandbox;
    const files = await sandbox.filesystem.list(path);
    return files.map(f => f.name);
  }
}
