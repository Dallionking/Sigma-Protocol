/**
 * Sandboxed Workspace Service
 *
 * Provides isolated file system access per team with security controls.
 * Each team gets its own isolated directory, and all file operations
 * are sandboxed to prevent access outside the workspace.
 *
 * Security features:
 * - Path traversal prevention
 * - Command allowlist for terminal execution
 * - Isolated directory per team
 * - Symlink resolution validation
 *
 * @see PRD-022: Terminal/File Access
 */

import { spawn, ChildProcess } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";

// =============================================================================
// Constants
// =============================================================================

/** Default base directory for all team workspaces */
const DEFAULT_WORKSPACES_ROOT = ".workspaces";

/** Default timeout for command execution (30 seconds) */
const DEFAULT_COMMAND_TIMEOUT_MS = 30 * 1000;

/** Maximum file size for read/write operations (10MB) */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Maximum directory depth for operations */
const MAX_DIRECTORY_DEPTH = 20;

/**
 * Default command allowlist
 *
 * These commands are considered safe for sandboxed execution.
 * Commands not in this list will be rejected.
 */
const DEFAULT_COMMAND_ALLOWLIST: ReadonlySet<string> = new Set([
  // Node.js / npm / package management
  "node",
  "npm",
  "npx",
  "pnpm",
  "yarn",
  "bun",

  // Version control
  "git",

  // Build tools
  "tsc",
  "esbuild",
  "vite",
  "webpack",

  // Testing
  "vitest",
  "jest",
  "playwright",

  // Linting / formatting
  "eslint",
  "prettier",
  "biome",

  // File operations (read-only safe)
  "ls",
  "cat",
  "head",
  "tail",
  "wc",
  "find",
  "grep",
  "which",
  "pwd",
  "echo",
  "tree",

  // Development utilities
  "curl",
  "jq",
]);

/**
 * Dangerous patterns that should never be allowed
 */
const DANGEROUS_PATTERNS: RegExp[] = [
  /\brm\s+-rf?\s+[\/~]/i, // rm -rf /
  /\bsudo\b/i, // sudo anything
  /\bchmod\s+777\b/i, // chmod 777
  /\b(>|>>)\s*\/dev\//i, // writing to /dev/
  /\|\s*sh\b/i, // piping to shell
  /\|\s*bash\b/i, // piping to bash
  /`[^`]*`/, // command substitution
  /\$\([^)]+\)/, // command substitution
  /;\s*(rm|dd|mkfs|fdisk)/i, // dangerous chained commands
];

// =============================================================================
// Types
// =============================================================================

/** Result of a file operation */
export interface FileResult {
  success: boolean;
  path: string;
  error?: string;
}

/** Result of a read operation */
export interface ReadResult extends FileResult {
  content?: string;
  size?: number;
}

/** Result of a write operation */
export interface WriteResult extends FileResult {
  bytesWritten?: number;
}

/** Result of a command execution */
export interface CommandResult {
  success: boolean;
  command: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  durationMs: number;
  error?: string;
}

/** File system entry info */
export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modifiedAt: Date;
}

/** Workspace service options */
export interface SandboxedWorkspaceOptions {
  /** Base directory for all workspaces */
  workspacesRoot?: string;
  /** Command timeout in milliseconds */
  commandTimeoutMs?: number;
  /** Additional commands to allow */
  additionalCommands?: string[];
  /** Commands to explicitly deny (overrides allowlist) */
  deniedCommands?: string[];
  /** Maximum file size in bytes */
  maxFileSizeBytes?: number;
}

/** Workspace info */
export interface WorkspaceInfo {
  teamId: string;
  rootPath: string;
  exists: boolean;
  createdAt?: Date;
}

// =============================================================================
// Security Helper Functions
// =============================================================================

/**
 * Normalize and validate a path to prevent traversal attacks
 *
 * @param basePath - The workspace root path
 * @param requestedPath - The path requested by the user
 * @returns The normalized safe path or null if invalid
 */
function normalizeSafePath(
  basePath: string,
  requestedPath: string
): string | null {
  // Resolve the base path to an absolute path
  const absoluteBase = path.resolve(basePath);

  // Join and resolve the requested path relative to base
  const targetPath = path.resolve(absoluteBase, requestedPath);

  // Check if the target is within the base directory
  if (!targetPath.startsWith(absoluteBase + path.sep) && targetPath !== absoluteBase) {
    return null;
  }

  // Check for excessive depth
  const relativePath = path.relative(absoluteBase, targetPath);
  const depth = relativePath.split(path.sep).length;
  if (depth > MAX_DIRECTORY_DEPTH) {
    return null;
  }

  return targetPath;
}

/**
 * Check if a path contains dangerous patterns
 */
function containsDangerousPatterns(inputPath: string): boolean {
  // Check for null bytes
  if (inputPath.includes("\0")) {
    return true;
  }

  // Check for double-encoded sequences
  if (inputPath.includes("%2e") || inputPath.includes("%2E")) {
    return true;
  }

  // Check for backslash traversal (Windows-style)
  if (inputPath.includes("..\\") || inputPath.includes("\\..")) {
    return true;
  }

  return false;
}

/**
 * Validate and sanitize a command for execution
 *
 * @param command - The command string to validate
 * @param allowlist - Set of allowed commands
 * @param denylist - Set of explicitly denied commands
 * @returns The validated command parts or null if invalid
 */
function validateCommand(
  command: string,
  allowlist: ReadonlySet<string>,
  denylist: Set<string>
): { program: string; args: string[] } | null {
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) {
      return null;
    }
  }

  // Parse the command
  const parts = parseCommand(command);
  if (parts.length === 0) {
    return null;
  }

  const program = parts[0];
  const args = parts.slice(1);

  // Check denylist first (takes precedence)
  if (denylist.has(program)) {
    return null;
  }

  // Check allowlist
  if (!allowlist.has(program)) {
    return null;
  }

  return { program, args };
}

/**
 * Simple command parser that handles quoted strings
 */
function parseCommand(command: string): string[] {
  const parts: string[] = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    if (inQuote) {
      if (char === quoteChar) {
        inQuote = false;
        quoteChar = "";
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      inQuote = true;
      quoteChar = char;
    } else if (char === " " || char === "\t") {
      if (current) {
        parts.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

// =============================================================================
// SandboxedWorkspace Class
// =============================================================================

/**
 * Sandboxed Workspace Service
 *
 * Provides isolated file system access for a specific team.
 * All operations are sandboxed to the team's workspace directory.
 *
 * Features:
 * - Isolated directory per team
 * - Path traversal prevention
 * - Command allowlist for terminal execution
 * - File size limits
 * - Symlink validation
 */
export class SandboxedWorkspace {
  private readonly teamId: string;
  private readonly workspacesRoot: string;
  private readonly workspacePath: string;
  private readonly commandTimeoutMs: number;
  private readonly maxFileSizeBytes: number;
  private readonly commandAllowlist: ReadonlySet<string>;
  private readonly commandDenylist: Set<string>;
  private initialized: boolean = false;

  constructor(teamId: string, options?: SandboxedWorkspaceOptions) {
    if (!teamId || typeof teamId !== "string") {
      throw new Error("Team ID is required and must be a string");
    }

    // Sanitize team ID to prevent directory traversal via team name
    this.teamId = this.sanitizeTeamId(teamId);
    this.workspacesRoot = options?.workspacesRoot ?? DEFAULT_WORKSPACES_ROOT;
    this.workspacePath = path.join(this.workspacesRoot, this.teamId);
    this.commandTimeoutMs = options?.commandTimeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS;
    this.maxFileSizeBytes = options?.maxFileSizeBytes ?? MAX_FILE_SIZE_BYTES;

    // Build command allowlist
    const additionalCommands = new Set(options?.additionalCommands ?? []);
    this.commandAllowlist = new Set([
      ...DEFAULT_COMMAND_ALLOWLIST,
      ...additionalCommands,
    ]);

    // Build command denylist
    this.commandDenylist = new Set(options?.deniedCommands ?? []);
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Initialize the workspace directory
   *
   * Creates the isolated directory for this team if it doesn't exist.
   *
   * @returns Workspace info
   */
  async initialize(): Promise<WorkspaceInfo> {
    try {
      // Ensure workspaces root exists
      await fs.mkdir(this.workspacesRoot, { recursive: true });

      // Create team workspace directory
      await fs.mkdir(this.workspacePath, { recursive: true });

      // Get directory stats
      const stats = await fs.stat(this.workspacePath);

      this.initialized = true;

      return {
        teamId: this.teamId,
        rootPath: path.resolve(this.workspacePath),
        exists: true,
        createdAt: stats.birthtime,
      };
    } catch (error) {
      throw new Error(
        `Failed to initialize workspace: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get workspace info
   *
   * @returns Workspace information
   */
  async getInfo(): Promise<WorkspaceInfo> {
    try {
      const stats = await fs.stat(this.workspacePath);
      return {
        teamId: this.teamId,
        rootPath: path.resolve(this.workspacePath),
        exists: true,
        createdAt: stats.birthtime,
      };
    } catch {
      return {
        teamId: this.teamId,
        rootPath: path.resolve(this.workspacePath),
        exists: false,
      };
    }
  }

  /**
   * Read a file from the workspace
   *
   * Reads file content with security checks:
   * - Path traversal prevention
   * - Symlink validation
   * - File size limits
   *
   * @param filePath - Path relative to workspace root
   * @returns Read result with content
   */
  async readFile(filePath: string): Promise<ReadResult> {
    // Validate path
    if (containsDangerousPatterns(filePath)) {
      return {
        success: false,
        path: filePath,
        error: "Invalid path: contains dangerous patterns",
      };
    }

    const safePath = normalizeSafePath(this.workspacePath, filePath);
    if (!safePath) {
      return {
        success: false,
        path: filePath,
        error: "Invalid path: path traversal detected",
      };
    }

    try {
      // Validate symlinks - resolve and check if still within workspace
      const realPath = await fs.realpath(safePath);
      const workspaceRealPath = await this.getWorkspaceRealPath();

      if (!realPath.startsWith(workspaceRealPath + path.sep) && realPath !== workspaceRealPath) {
        return {
          success: false,
          path: filePath,
          error: "Invalid path: symlink points outside workspace",
        };
      }

      // Check file size
      const stats = await fs.stat(safePath);
      if (stats.size > this.maxFileSizeBytes) {
        return {
          success: false,
          path: filePath,
          error: `File too large: ${stats.size} bytes exceeds limit of ${this.maxFileSizeBytes} bytes`,
        };
      }

      // Read file
      const content = await fs.readFile(safePath, "utf-8");

      return {
        success: true,
        path: filePath,
        content,
        size: stats.size,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return {
          success: false,
          path: filePath,
          error: "File not found",
        };
      }
      return {
        success: false,
        path: filePath,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Write content to a file in the workspace
   *
   * Writes file content with security checks:
   * - Path traversal prevention
   * - Directory creation
   * - File size limits
   *
   * @param filePath - Path relative to workspace root
   * @param content - Content to write
   * @returns Write result
   */
  async writeFile(filePath: string, content: string): Promise<WriteResult> {
    // Validate path
    if (containsDangerousPatterns(filePath)) {
      return {
        success: false,
        path: filePath,
        error: "Invalid path: contains dangerous patterns",
      };
    }

    const safePath = normalizeSafePath(this.workspacePath, filePath);
    if (!safePath) {
      return {
        success: false,
        path: filePath,
        error: "Invalid path: path traversal detected",
      };
    }

    // Check content size
    const contentSize = Buffer.byteLength(content, "utf-8");
    if (contentSize > this.maxFileSizeBytes) {
      return {
        success: false,
        path: filePath,
        error: `Content too large: ${contentSize} bytes exceeds limit of ${this.maxFileSizeBytes} bytes`,
      };
    }

    try {
      // Ensure parent directory exists
      const parentDir = path.dirname(safePath);

      // Validate parent directory is within workspace
      const safeParent = normalizeSafePath(this.workspacePath, path.relative(this.workspacePath, parentDir));
      if (!safeParent) {
        return {
          success: false,
          path: filePath,
          error: "Invalid path: parent directory outside workspace",
        };
      }

      await fs.mkdir(parentDir, { recursive: true });

      // Write file
      await fs.writeFile(safePath, content, "utf-8");

      return {
        success: true,
        path: filePath,
        bytesWritten: contentSize,
      };
    } catch (error) {
      return {
        success: false,
        path: filePath,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Delete a file from the workspace
   *
   * @param filePath - Path relative to workspace root
   * @returns File result
   */
  async deleteFile(filePath: string): Promise<FileResult> {
    // Validate path
    if (containsDangerousPatterns(filePath)) {
      return {
        success: false,
        path: filePath,
        error: "Invalid path: contains dangerous patterns",
      };
    }

    const safePath = normalizeSafePath(this.workspacePath, filePath);
    if (!safePath) {
      return {
        success: false,
        path: filePath,
        error: "Invalid path: path traversal detected",
      };
    }

    try {
      await fs.unlink(safePath);
      return {
        success: true,
        path: filePath,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return {
          success: false,
          path: filePath,
          error: "File not found",
        };
      }
      return {
        success: false,
        path: filePath,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * List files in a directory
   *
   * @param dirPath - Path relative to workspace root (default: root)
   * @returns Array of file entries
   */
  async listFiles(dirPath: string = "."): Promise<FileEntry[]> {
    // Validate path
    if (containsDangerousPatterns(dirPath)) {
      return [];
    }

    const safePath = normalizeSafePath(this.workspacePath, dirPath);
    if (!safePath) {
      return [];
    }

    try {
      const entries = await fs.readdir(safePath, { withFileTypes: true });
      const results: FileEntry[] = [];

      for (const entry of entries) {
        const entryPath = path.join(safePath, entry.name);
        try {
          const stats = await fs.stat(entryPath);
          results.push({
            name: entry.name,
            path: path.relative(this.workspacePath, entryPath),
            isDirectory: entry.isDirectory(),
            isFile: entry.isFile(),
            size: stats.size,
            modifiedAt: stats.mtime,
          });
        } catch {
          // Skip entries we can't stat
        }
      }

      return results;
    } catch {
      return [];
    }
  }

  /**
   * Check if a path exists in the workspace
   *
   * @param filePath - Path relative to workspace root
   * @returns True if path exists
   */
  async exists(filePath: string): Promise<boolean> {
    if (containsDangerousPatterns(filePath)) {
      return false;
    }

    const safePath = normalizeSafePath(this.workspacePath, filePath);
    if (!safePath) {
      return false;
    }

    try {
      await fs.access(safePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Run a command in the workspace
   *
   * Executes a command with security controls:
   * - Command allowlist validation
   * - Dangerous pattern detection
   * - Timeout enforcement
   * - Working directory sandboxing
   *
   * @param command - Command to execute
   * @returns Command result
   */
  async runCommand(command: string): Promise<CommandResult> {
    const startTime = Date.now();

    // Validate command against allowlist
    const validated = validateCommand(
      command,
      this.commandAllowlist,
      this.commandDenylist
    );

    if (!validated) {
      return {
        success: false,
        command,
        stdout: "",
        stderr: "",
        exitCode: null,
        durationMs: Date.now() - startTime,
        error: "Command not allowed: not in allowlist or contains dangerous patterns",
      };
    }

    try {
      const result = await this.executeCommand(
        validated.program,
        validated.args
      );

      return {
        ...result,
        command,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        command,
        stdout: "",
        stderr: "",
        exitCode: null,
        durationMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get the command allowlist
   *
   * @returns Set of allowed commands
   */
  getAllowedCommands(): string[] {
    return Array.from(this.commandAllowlist);
  }

  /**
   * Check if a command is allowed
   *
   * @param command - Command to check
   * @returns True if command is allowed
   */
  isCommandAllowed(command: string): boolean {
    const validated = validateCommand(
      command,
      this.commandAllowlist,
      this.commandDenylist
    );
    return validated !== null;
  }

  /**
   * Get the workspace root path
   *
   * @returns Absolute path to workspace
   */
  getWorkspacePath(): string {
    return path.resolve(this.workspacePath);
  }

  /**
   * Get team ID
   *
   * @returns The team ID for this workspace
   */
  getTeamId(): string {
    return this.teamId;
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Sanitize team ID to prevent directory traversal
   */
  private sanitizeTeamId(teamId: string): string {
    // Remove any path separators and dangerous characters
    return teamId
      .replace(/[\/\\]/g, "-")
      .replace(/\.\./g, "")
      .replace(/[^a-zA-Z0-9\-_]/g, "")
      .substring(0, 64);
  }

  /**
   * Get the real path of the workspace (resolving symlinks)
   */
  private async getWorkspaceRealPath(): Promise<string> {
    try {
      return await fs.realpath(this.workspacePath);
    } catch {
      return path.resolve(this.workspacePath);
    }
  }

  /**
   * Execute a command in the workspace directory
   */
  private executeCommand(
    program: string,
    args: string[]
  ): Promise<Omit<CommandResult, "command" | "durationMs">> {
    return new Promise((resolve) => {
      const child: ChildProcess = spawn(program, args, {
        cwd: this.workspacePath,
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          // Restrict environment to prevent escapes
          HOME: this.workspacePath,
          TMPDIR: path.join(this.workspacePath, ".tmp"),
        },
        // Don't inherit shell
        shell: false,
      });

      let stdout = "";
      let stderr = "";
      let killed = false;

      // Set up timeout
      const timeout = setTimeout(() => {
        killed = true;
        child.kill("SIGTERM");

        // Force kill after 5 seconds if still running
        setTimeout(() => {
          if (!child.killed) {
            child.kill("SIGKILL");
          }
        }, 5000);
      }, this.commandTimeoutMs);

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (exitCode) => {
        clearTimeout(timeout);

        if (killed) {
          resolve({
            success: false,
            stdout,
            stderr,
            exitCode: null,
            error: `Command timed out after ${this.commandTimeoutMs}ms`,
          });
        } else {
          resolve({
            success: exitCode === 0,
            stdout,
            stderr,
            exitCode,
          });
        }
      });

      child.on("error", (err) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          stdout,
          stderr,
          exitCode: null,
          error: err.message,
        });
      });
    });
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new sandboxed workspace for a team
 *
 * @param teamId - Team identifier
 * @param options - Workspace options
 * @returns New SandboxedWorkspace instance
 */
export function createSandboxedWorkspace(
  teamId: string,
  options?: SandboxedWorkspaceOptions
): SandboxedWorkspace {
  return new SandboxedWorkspace(teamId, options);
}

// =============================================================================
// Default Export
// =============================================================================

export default SandboxedWorkspace;
