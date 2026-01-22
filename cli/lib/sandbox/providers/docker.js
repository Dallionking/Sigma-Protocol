/**
 * Sigma Protocol - Docker Local Sandbox Provider
 * 
 * Docker provides FREE local isolation for AI agents.
 * No API costs, uses local machine resources.
 * 
 * Requires: Docker installed and running
 */

import { SandboxProvider, Sandbox, SandboxState } from '../base.js';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { promises as fs } from 'fs';

const execAsync = promisify(exec);

/**
 * Docker image name for Sigma sandboxes
 */
export const SIGMA_DOCKER_IMAGE = 'sigma-sandbox:latest';

/**
 * Default Dockerfile for building sigma-sandbox image
 */
export const DEFAULT_DOCKERFILE = `# Sigma Protocol Sandbox Image
# Used for isolated agent execution

FROM node:20-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    git \\
    curl \\
    tmux \\
    python3 \\
    python3-pip \\
    && rm -rf /var/lib/apt/lists/*

# Install mprocs for TUI
RUN curl -fsSL https://github.com/pvolok/mprocs/releases/download/v0.6.4/mprocs-0.6.4-linux64.tar.gz \\
    | tar -xz -C /usr/local/bin

# Install Claude Code CLI (if available)
RUN npm install -g @anthropic-ai/claude-code 2>/dev/null || true

# Install Sigma Protocol CLI
RUN npm install -g sigma-protocol 2>/dev/null || true

# Create workspace directory
WORKDIR /workspace

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
    CMD node --version || exit 1

# Default command keeps container running
CMD ["tail", "-f", "/dev/null"]
`;

/**
 * Docker Local Sandbox Provider
 * Implements the SandboxProvider interface for Docker containers
 */
export class DockerProvider extends SandboxProvider {
  constructor(config = {}) {
    super(config);
    this.dockerSocket = config.credentials?.docker_socket || '/var/run/docker.sock';
    this.image = config.docker_image || SIGMA_DOCKER_IMAGE;
    this._dockerAvailable = null;
    this._imageBuilt = null;
  }

  /**
   * Get provider name
   */
  get name() {
    return 'docker';
  }

  /**
   * Check if Docker is available
   * @private
   */
  async _checkDocker() {
    if (this._dockerAvailable !== null) {
      return this._dockerAvailable;
    }

    try {
      await execAsync('docker --version');
      await execAsync('docker info');
      this._dockerAvailable = true;
    } catch {
      this._dockerAvailable = false;
    }

    return this._dockerAvailable;
  }

  /**
   * Check if sigma-sandbox image exists
   * @private
   */
  async _checkImage() {
    if (this._imageBuilt !== null) {
      return this._imageBuilt;
    }

    try {
      await execAsync(`docker image inspect ${this.image}`);
      this._imageBuilt = true;
    } catch {
      this._imageBuilt = false;
    }

    return this._imageBuilt;
  }

  /**
   * Build the sigma-sandbox Docker image
   */
  async buildImage(projectRoot) {
    const dockerfilePath = path.join(projectRoot, 'scripts', 'sandbox', 'Dockerfile');
    
    // Check if custom Dockerfile exists, otherwise use default
    let dockerDir;
    try {
      await fs.access(dockerfilePath);
      dockerDir = path.dirname(dockerfilePath);
    } catch {
      // Create temp directory with default Dockerfile
      const tempDir = path.join(projectRoot, '.sigma', 'tmp', 'docker');
      await fs.mkdir(tempDir, { recursive: true });
      await fs.writeFile(path.join(tempDir, 'Dockerfile'), DEFAULT_DOCKERFILE);
      dockerDir = tempDir;
    }

    return new Promise((resolve, reject) => {
      const build = spawn('docker', ['build', '-t', this.image, '.'], {
        cwd: dockerDir,
        stdio: 'pipe'
      });

      let output = '';
      build.stdout.on('data', (data) => { output += data.toString(); });
      build.stderr.on('data', (data) => { output += data.toString(); });

      build.on('close', (code) => {
        if (code === 0) {
          this._imageBuilt = true;
          resolve({ success: true, output });
        } else {
          reject(new Error(`Docker build failed with code ${code}:\n${output}`));
        }
      });
    });
  }

  /**
   * Check if provider is available/configured
   */
  async isAvailable() {
    return this._checkDocker();
  }

  /**
   * Validate provider credentials (Docker doesn't need credentials)
   */
  async validateCredentials() {
    const dockerAvailable = await this._checkDocker();
    
    if (!dockerAvailable) {
      return {
        valid: false,
        error: 'Docker is not installed or not running. Install Docker from https://docker.com'
      };
    }

    const imageExists = await this._checkImage();
    
    return {
      valid: true,
      warnings: imageExists ? [] : [
        `Sigma sandbox image (${this.image}) not found. It will be built on first use.`
      ]
    };
  }

  /**
   * Create a new Docker container sandbox
   */
  async create(options) {
    const { id, envVars = {}, timeout = 1800 } = options;
    
    if (!await this._checkDocker()) {
      throw new Error('Docker is not available');
    }

    // Build image if needed
    if (!await this._checkImage()) {
      console.log('Building sigma-sandbox Docker image (first time only)...');
      await this.buildImage(this.config.projectRoot || process.cwd());
    }

    // Build environment variable arguments
    const envArgs = [];
    for (const [key, value] of Object.entries(envVars)) {
      envArgs.push('-e', `${key}=${value}`);
    }
    
    // Add standard environment variables
    if (process.env.ANTHROPIC_API_KEY) {
      envArgs.push('-e', `ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY}`);
    }
    envArgs.push('-e', `SIGMA_SANDBOX_ID=${id}`);

    // Create container name from sandbox id
    const containerName = `sigma-sandbox-${id.replace(/[^a-zA-Z0-9-]/g, '-')}`;

    try {
      // Create and start container
      const createCmd = [
        'docker', 'run', '-d',
        '--name', containerName,
        ...envArgs,
        '--memory', '2g',
        '--cpus', '2',
        '--stop-timeout', String(timeout),
        this.image
      ];

      const { stdout } = await execAsync(createCmd.join(' '));
      const containerId = stdout.trim();

      // Store sandbox reference
      const sandbox = new Sandbox(id, this.name, {
        containerId,
        containerName,
        timeout
      });
      
      sandbox.transitionTo(SandboxState.CREATING);
      sandbox.transitionTo(SandboxState.RUNNING);
      this.sandboxes.set(id, sandbox);

      return sandbox;
    } catch (error) {
      throw new Error(`Failed to create Docker container: ${error.message}`);
    }
  }

  /**
   * Execute a command in the container with optional streaming callbacks
   * @param {string} sandboxId - Sandbox identifier
   * @param {string} command - Command to execute
   * @param {Object} [options] - Execution options
   * @param {Function} [options.onStdout] - Callback for stdout data
   * @param {Function} [options.onStderr] - Callback for stderr data
   * @param {number} [options.timeout] - Command timeout in ms
   * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
   */
  async execute(sandboxId, command, options = {}) {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const containerName = sandbox.metadata.containerName;
    const { onStdout, onStderr, timeout } = options;

    // Use streaming approach if callbacks provided
    if (onStdout || onStderr) {
      return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        let timedOut = false;

        const proc = spawn('docker', [
          'exec', containerName, 'sh', '-c', command
        ], { stdio: 'pipe' });

        // Set timeout if specified
        let timeoutId;
        if (timeout) {
          timeoutId = setTimeout(() => {
            timedOut = true;
            proc.kill('SIGTERM');
          }, timeout);
        }

        proc.stdout.on('data', (data) => {
          const text = data.toString();
          stdout += text;
          if (onStdout) onStdout(text);
        });

        proc.stderr.on('data', (data) => {
          const text = data.toString();
          stderr += text;
          if (onStderr) onStderr(text);
        });

        proc.on('close', (exitCode) => {
          if (timeoutId) clearTimeout(timeoutId);

          sandbox.logs.push({
            timestamp: new Date().toISOString(),
            command,
            stdout,
            stderr,
            exitCode: timedOut ? 124 : exitCode
          });

          resolve({
            stdout,
            stderr,
            exitCode: timedOut ? 124 : exitCode
          });
        });

        proc.on('error', (error) => {
          if (timeoutId) clearTimeout(timeoutId);
          reject(new Error(`Docker exec failed: ${error.message}`));
        });
      });
    }

    // Non-streaming fallback
    try {
      const execOptions = { maxBuffer: 10 * 1024 * 1024 }; // 10MB buffer
      if (timeout) execOptions.timeout = timeout;

      const { stdout, stderr } = await execAsync(
        `docker exec ${containerName} sh -c "${command.replace(/"/g, '\\"')}"`,
        execOptions
      );

      sandbox.logs.push({
        timestamp: new Date().toISOString(),
        command,
        stdout,
        stderr
      });

      if (onStdout && stdout) onStdout(stdout);
      if (onStderr && stderr) onStderr(stderr);

      return { stdout, stderr, exitCode: 0 };
    } catch (error) {
      const result = {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1
      };

      sandbox.logs.push({
        timestamp: new Date().toISOString(),
        command,
        ...result
      });

      if (onStdout && result.stdout) onStdout(result.stdout);
      if (onStderr && result.stderr) onStderr(result.stderr);

      return result;
    }
  }

  /**
   * Clone a repository into the container
   */
  async clone(sandboxId, repoUrl, branch = 'main') {
    const command = `git clone --branch ${branch} --single-branch ${repoUrl} /workspace/repo`;
    return this.execute(sandboxId, command);
  }

  /**
   * Get container logs
   */
  async getLogs(sandboxId) {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const containerName = sandbox.metadata.containerName;

    try {
      const { stdout } = await execAsync(`docker logs ${containerName}`);
      return stdout;
    } catch (_error) {
      // Return stored logs if docker logs fails
      return sandbox.logs.map(log => 
        `[${log.timestamp}] ${log.command}\n${log.stdout}${log.stderr}`
      ).join('\n');
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

    const containerName = sandbox.metadata.containerName;

    try {
      const { stdout } = await execAsync(
        `docker inspect --format='{{.State.Status}}' ${containerName}`
      );
      
      const status = stdout.trim();
      
      switch (status) {
        case 'running':
          return SandboxState.RUNNING;
        case 'exited':
          return sandbox.state === SandboxState.COMPLETED 
            ? SandboxState.COMPLETED 
            : SandboxState.FAILED;
        case 'created':
          return SandboxState.CREATING;
        default:
          return SandboxState.FAILED;
      }
    } catch {
      return SandboxState.DESTROYED;
    }
  }

  /**
   * Destroy a container
   */
  async destroy(sandboxId) {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      return; // Already destroyed
    }

    const containerName = sandbox.metadata.containerName;

    try {
      // Stop and remove container
      await execAsync(`docker stop ${containerName} 2>/dev/null || true`);
      await execAsync(`docker rm -f ${containerName} 2>/dev/null || true`);
    } catch (error) {
      console.warn(`Warning: Failed to destroy Docker container ${containerName}:`, error.message);
    }

    sandbox.transitionTo(SandboxState.DESTROYED);
    this.sandboxes.delete(sandboxId);
  }

  /**
   * Get cost per minute (Docker is free)
   */
  getCostPerMinute() {
    return 0;
  }

  /**
   * Copy a file into the container
   * @param {string} sandboxId
   * @param {string} localPath
   * @param {string} remotePath
   */
  async uploadFile(sandboxId, localPath, remotePath) {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const containerName = sandbox.metadata.containerName;
    await execAsync(`docker cp "${localPath}" ${containerName}:${remotePath}`);
  }

  /**
   * Copy a file from the container
   * @param {string} sandboxId
   * @param {string} remotePath
   * @param {string} localPath
   */
  async downloadFile(sandboxId, remotePath, localPath) {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const containerName = sandbox.metadata.containerName;
    await execAsync(`docker cp ${containerName}:${remotePath} "${localPath}"`);
  }

  /**
   * List files in a directory
   * @param {string} sandboxId
   * @param {string} dirPath
   * @returns {Promise<string[]>}
   */
  async listFiles(sandboxId, dirPath = '/workspace') {
    const result = await this.execute(sandboxId, `ls -1 ${dirPath}`);
    if (result.exitCode !== 0) {
      throw new Error(`Failed to list files: ${result.stderr}`);
    }
    return result.stdout.split('\n').filter(Boolean);
  }

  /**
   * Get container resource usage
   * @param {string} sandboxId
   * @returns {Promise<Object>}
   */
  async getResourceUsage(sandboxId) {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox not found: ${sandboxId}`);
    }

    const containerName = sandbox.metadata.containerName;

    try {
      const { stdout } = await execAsync(
        `docker stats ${containerName} --no-stream --format "{{json .}}"`
      );
      
      return JSON.parse(stdout);
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get public URL (Docker doesn't provide public URLs by default)
   * @param {string} _sandboxId - Sandbox ID (unused - Docker doesn't provide public URLs)
   */
  async getPublicUrl(_sandboxId) {
    // Could implement port forwarding in the future
    return null;
  }
}
