/**
 * Sigma Protocol - Daytona Open-Source Sandbox Provider
 * 
 * Daytona provides open-source cloud development environments.
 * Slightly cheaper than E2B, with self-hosted option.
 * 
 * @see https://www.daytona.io/docs
 */

import { SandboxProvider, Sandbox, SandboxState } from '../base.js';
import { getResolvedCredentials } from '../config.js';
import { promises as fs } from 'fs';

/**
 * Default Daytona API URL
 */
export const DEFAULT_DAYTONA_URL = 'https://api.daytona.io';

/**
 * Daytona Sandbox Provider
 * Implements the SandboxProvider interface for Daytona workspaces
 */
export class DaytonaProvider extends SandboxProvider {
  constructor(config = {}) {
    super(config);
    this.client = null;
    this._initialized = false;
    
    const creds = getResolvedCredentials(config);
    this.apiKey = creds.daytona_api_key || process.env.DAYTONA_API_KEY;
    this.apiUrl = creds.daytona_api_url || process.env.DAYTONA_API_URL || DEFAULT_DAYTONA_URL;
  }

  /**
   * Get provider name
   */
  get name() {
    return 'daytona';
  }

  /**
   * Initialize Daytona SDK (lazy loaded)
   * @private
   */
  async _ensureInitialized() {
    if (this._initialized) return;

    try {
      // Dynamic import of Daytona SDK
      const daytona = await import('@daytonaio/sdk');
      this.Daytona = daytona.Daytona;
      
      // Initialize client
      this.client = new this.Daytona({
        apiKey: this.apiKey,
        serverUrl: this.apiUrl
      });
      
      this._initialized = true;
    } catch (error) {
      if (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'MODULE_NOT_FOUND') {
        throw new Error(
          'Daytona SDK not installed. Install it with: npm install @daytonaio/sdk\n' +
          'Then set DAYTONA_API_KEY environment variable.'
        );
      }
      throw error;
    }
  }

  /**
   * Check if provider is available/configured
   */
  async isAvailable() {
    if (!this.apiKey) return false;

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
    if (!this.apiKey) {
      return {
        valid: false,
        error: 'DAYTONA_API_KEY environment variable is not set'
      };
    }

    try {
      await this._ensureInitialized();
      
      // Try to list workspaces to verify credentials
      // This is a lightweight operation
      await this.client.list();
      
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Daytona API validation failed: ${error.message}`
      };
    }
  }

  /**
   * Create a new Daytona workspace
   */
  async create(options) {
    const { id, envVars = {}, timeout = 1800 } = options;
    
    await this._ensureInitialized();

    if (!this.apiKey) {
      throw new Error('DAYTONA_API_KEY not configured');
    }

    try {
      // Create workspace configuration
      const workspaceConfig = {
        language: 'javascript',
        image: 'sigma-sandbox',
        envVars: {
          ...envVars,
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
          SIGMA_SANDBOX_ID: id
        }
      };

      // Create the workspace
      const workspace = await this.client.create(workspaceConfig, {
        timeout: timeout * 1000
      });

      // Store sandbox reference
      const sandbox = new Sandbox(id, this.name, {
        workspaceId: workspace.id,
        workspaceUrl: workspace.ideUrl,
        timeout
      });
      
      sandbox._daytonaWorkspace = workspace;
      sandbox.transitionTo(SandboxState.CREATING);
      sandbox.transitionTo(SandboxState.RUNNING);
      this.sandboxes.set(id, sandbox);

      return sandbox;
    } catch (error) {
      throw new Error(`Failed to create Daytona workspace: ${error.message}`);
    }
  }

  /**
   * Execute a command in the workspace with optional streaming callbacks
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

    const workspace = sandboxWrapper._daytonaWorkspace;
    if (!workspace) {
      throw new Error(`Daytona workspace instance not available for: ${sandboxId}`);
    }

    const { onStdout, onStderr, timeout } = options;

    try {
      let stdout = '';
      let stderr = '';

      // Try streaming execution if Daytona SDK supports it
      if ((onStdout || onStderr) && workspace.process?.startStreaming) {
        // Daytona SDK may support streaming in future versions
        const stream = await workspace.process.startStreaming({
          cmd: command,
          timeout,
          onStdout: (chunk) => {
            const text = typeof chunk === 'string' ? chunk : chunk.toString();
            stdout += text;
            if (onStdout) onStdout(text);
          },
          onStderr: (chunk) => {
            const text = typeof chunk === 'string' ? chunk : chunk.toString();
            stderr += text;
            if (onStderr) onStderr(text);
          }
        });

        const result = await stream.wait();

        sandboxWrapper.logs.push({
          timestamp: new Date().toISOString(),
          command,
          stdout,
          stderr,
          exitCode: result.exitCode || 0
        });

        return {
          stdout,
          stderr,
          exitCode: result.exitCode || 0
        };
      }

      // Standard execution (non-streaming)
      const execOptions = timeout ? { timeout } : {};
      const result = await workspace.process.codeRun(command, execOptions);

      stdout = result.result || '';
      
      // Call callbacks with full output
      if (onStdout && stdout) onStdout(stdout);
      if (onStderr && result.stderr) onStderr(result.stderr);

      sandboxWrapper.logs.push({
        timestamp: new Date().toISOString(),
        command,
        stdout,
        stderr: result.stderr || '',
        exitCode: result.exitCode || 0
      });

      return {
        stdout,
        stderr: result.stderr || '',
        exitCode: result.exitCode || 0
      };
    } catch (error) {
      const errMsg = error.message;
      if (onStderr) onStderr(errMsg);

      sandboxWrapper.logs.push({
        timestamp: new Date().toISOString(),
        command,
        stderr: errMsg,
        exitCode: 1
      });

      return {
        stdout: '',
        stderr: errMsg,
        exitCode: 1
      };
    }
  }

  /**
   * Clone a repository into the workspace
   */
  async clone(sandboxId, repoUrl, branch = 'main') {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const workspace = sandboxWrapper._daytonaWorkspace;
    if (!workspace) {
      throw new Error(`Daytona workspace instance not available for: ${sandboxId}`);
    }

    try {
      // Daytona has a built-in git method
      await workspace.git.clone(repoUrl, branch);
      
      return { stdout: 'Repository cloned successfully', stderr: '', exitCode: 0 };
    } catch (_error) {
      // Fallback to command execution
      const cloneCmd = `git clone --branch ${branch} --single-branch ${repoUrl} /workspace`;
      return this.execute(sandboxId, cloneCmd);
    }
  }

  /**
   * Get workspace logs
   */
  async getLogs(sandboxId) {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    return sandbox.logs.map(log => 
      `[${log.timestamp}] ${log.command}\n${log.stdout}${log.stderr || ''}`
    ).join('\n');
  }

  /**
   * Get public URL for workspace IDE
   */
  async getPublicUrl(sandboxId) {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    return sandboxWrapper.metadata.workspaceUrl || null;
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
   * Destroy a workspace
   */
  async destroy(sandboxId) {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper) {
      return; // Already destroyed
    }

    const workspace = sandboxWrapper._daytonaWorkspace;
    if (workspace) {
      try {
        await this.client.remove(workspace);
      } catch (error) {
        console.warn(`Warning: Failed to destroy Daytona workspace ${sandboxId}:`, error.message);
      }
    }

    sandboxWrapper.transitionTo(SandboxState.DESTROYED);
    this.sandboxes.delete(sandboxId);
  }

  /**
   * Get cost per minute for Daytona
   */
  getCostPerMinute() {
    return 0.08; // Slightly cheaper than E2B
  }

  /**
   * Upload a file to the workspace
   * @param {string} sandboxId
   * @param {string} localPath
   * @param {string} remotePath
   */
  async uploadFile(sandboxId, localPath, remotePath) {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper?._daytonaWorkspace) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const workspace = sandboxWrapper._daytonaWorkspace;
    const content = await fs.readFile(localPath, 'utf8');
    
    await workspace.fs.uploadFile(content, remotePath);
  }

  /**
   * Download a file from the workspace
   * @param {string} sandboxId
   * @param {string} remotePath
   * @param {string} localPath
   */
  async downloadFile(sandboxId, remotePath, localPath) {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper?._daytonaWorkspace) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const workspace = sandboxWrapper._daytonaWorkspace;
    const content = await workspace.fs.downloadFile(remotePath);
    
    await fs.writeFile(localPath, content);
  }

  /**
   * List files in a directory
   * @param {string} sandboxId
   * @param {string} dirPath
   * @returns {Promise<string[]>}
   */
  async listFiles(sandboxId, dirPath = '/workspace') {
    const sandboxWrapper = this.sandboxes.get(sandboxId);
    if (!sandboxWrapper?._daytonaWorkspace) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const workspace = sandboxWrapper._daytonaWorkspace;
    
    try {
      const files = await workspace.fs.listDir(dirPath);
      return files.map(f => f.name);
    } catch {
      // Fallback to command execution
      const result = await this.execute(sandboxId, `ls -1 ${dirPath}`);
      return result.stdout.split('\n').filter(Boolean);
    }
  }

  /**
   * List all workspaces
   * @returns {Promise<Object[]>}
   */
  async listWorkspaces() {
    await this._ensureInitialized();
    return this.client.list();
  }
}
