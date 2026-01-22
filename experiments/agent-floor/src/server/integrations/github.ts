/**
 * GitHub Integration Service
 *
 * Provides GitHub API integration via gh CLI for agents to:
 * - Create branches
 * - Commit code changes
 * - Create pull requests
 * - Check PR status
 *
 * @see PRD-021: GitHub Integration
 */

import { spawn, ChildProcess } from "child_process";

// =============================================================================
// Constants
// =============================================================================

/** Default timeout for gh CLI operations (2 minutes) */
const DEFAULT_TIMEOUT_MS = 2 * 60 * 1000;

/** Maximum retry attempts on failure */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_RETRY_DELAY_MS = 1000;

/** gh CLI executable name */
const GH_CLI = "gh";

// =============================================================================
// Types
// =============================================================================

/** Result of a gh CLI command execution */
export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  success: boolean;
}

/** Branch creation result */
export interface BranchResult {
  success: boolean;
  branchName: string;
  error?: string;
}

/** Commit result */
export interface CommitResult {
  success: boolean;
  sha?: string;
  message: string;
  error?: string;
}

/** PR creation result */
export interface PRResult {
  success: boolean;
  number?: number;
  url?: string;
  title: string;
  error?: string;
}

/** PR status information */
export interface PRStatus {
  number: number;
  state: "open" | "closed" | "merged";
  title: string;
  url: string;
  mergeable?: boolean;
  checksStatus?: "pending" | "passing" | "failing";
  reviewDecision?: "approved" | "changes_requested" | "review_required" | null;
  error?: string;
}

/** GitHub service options */
export interface GitHubServiceOptions {
  /** Working directory for git operations */
  workingDirectory?: string;
  /** Timeout in ms for CLI operations */
  timeoutMs?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay with jitter
 */
function getBackoffDelay(attempt: number): number {
  const baseDelay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * baseDelay;
  return baseDelay + jitter;
}

/**
 * Check if an error is retryable (network issues, rate limits)
 */
function isRetryableError(error: string): boolean {
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /rate limit/i,
    /503/,
    /502/,
    /ETIMEDOUT/,
    /ECONNRESET/,
    /ENOTFOUND/,
  ];
  return retryablePatterns.some((pattern) => pattern.test(error));
}

// =============================================================================
// GitHub Service Class
// =============================================================================

/**
 * GitHub Integration Service
 *
 * Provides methods for agents to interact with GitHub via the gh CLI.
 * All operations are performed in the configured working directory.
 *
 * Features:
 * - Branch creation and checkout
 * - File staging and committing
 * - Pull request creation and management
 * - PR status checking with review and CI status
 * - Automatic retry with exponential backoff
 */
export class GitHubService {
  private workingDirectory: string;
  private timeoutMs: number;
  private maxRetries: number;

  constructor(options?: GitHubServiceOptions) {
    this.workingDirectory = options?.workingDirectory ?? process.cwd();
    this.timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options?.maxRetries ?? MAX_RETRIES;
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Create a new branch and check it out
   *
   * Creates a new branch from the current HEAD and switches to it.
   * If the branch already exists, it will switch to it instead.
   *
   * @param name - Branch name to create
   * @returns Branch creation result
   */
  async createBranch(name: string): Promise<BranchResult> {
    // Validate branch name
    const sanitizedName = this.sanitizeBranchName(name);
    if (!sanitizedName) {
      return {
        success: false,
        branchName: name,
        error: "Invalid branch name",
      };
    }

    try {
      // First, try to create the branch
      const createResult = await this.runGitCommand([
        "checkout",
        "-b",
        sanitizedName,
      ]);

      if (createResult.success) {
        return {
          success: true,
          branchName: sanitizedName,
        };
      }

      // If branch exists, try to switch to it
      if (
        createResult.stderr.includes("already exists") ||
        createResult.stderr.includes("fatal: A branch named")
      ) {
        const switchResult = await this.runGitCommand([
          "checkout",
          sanitizedName,
        ]);

        if (switchResult.success) {
          return {
            success: true,
            branchName: sanitizedName,
          };
        }
      }

      return {
        success: false,
        branchName: sanitizedName,
        error: createResult.stderr || "Failed to create branch",
      };
    } catch (error) {
      return {
        success: false,
        branchName: sanitizedName,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Stage files and create a commit
   *
   * Stages the specified files (or all changes if empty array)
   * and creates a commit with the given message.
   *
   * @param files - Array of file paths to stage (empty for all)
   * @param message - Commit message
   * @returns Commit result with SHA
   */
  async commit(files: string[], message: string): Promise<CommitResult> {
    if (!message.trim()) {
      return {
        success: false,
        message: "",
        error: "Commit message cannot be empty",
      };
    }

    try {
      // Stage files
      const filesToStage = files.length > 0 ? files : ["-A"];
      const addResult = await this.runGitCommand(["add", ...filesToStage]);

      if (!addResult.success) {
        return {
          success: false,
          message,
          error: addResult.stderr || "Failed to stage files",
        };
      }

      // Check if there are changes to commit
      const statusResult = await this.runGitCommand([
        "status",
        "--porcelain",
      ]);

      if (statusResult.success && !statusResult.stdout.trim()) {
        return {
          success: false,
          message,
          error: "No changes to commit",
        };
      }

      // Create commit
      const commitResult = await this.runGitCommand([
        "commit",
        "-m",
        message,
      ]);

      if (!commitResult.success) {
        return {
          success: false,
          message,
          error: commitResult.stderr || "Failed to create commit",
        };
      }

      // Get the commit SHA
      const shaResult = await this.runGitCommand([
        "rev-parse",
        "HEAD",
      ]);

      return {
        success: true,
        sha: shaResult.stdout.trim(),
        message,
      };
    } catch (error) {
      return {
        success: false,
        message,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Create a pull request
   *
   * Creates a PR from the current branch to the default branch.
   * Pushes the current branch to the remote if needed.
   *
   * @param title - PR title
   * @param body - PR description body
   * @returns PR creation result with URL
   */
  async createPR(title: string, body: string): Promise<PRResult> {
    if (!title.trim()) {
      return {
        success: false,
        title: "",
        error: "PR title cannot be empty",
      };
    }

    try {
      // Get current branch name
      const branchResult = await this.runGitCommand([
        "rev-parse",
        "--abbrev-ref",
        "HEAD",
      ]);

      if (!branchResult.success) {
        return {
          success: false,
          title,
          error: "Failed to get current branch name",
        };
      }

      const currentBranch = branchResult.stdout.trim();

      // Push the branch to remote with tracking
      const pushResult = await this.runGitCommand([
        "push",
        "-u",
        "origin",
        currentBranch,
      ]);

      if (!pushResult.success && !pushResult.stderr.includes("up-to-date")) {
        return {
          success: false,
          title,
          error: pushResult.stderr || "Failed to push branch to remote",
        };
      }

      // Create the PR using gh CLI
      const prResult = await this.runGhCommand([
        "pr",
        "create",
        "--title",
        title,
        "--body",
        body,
      ]);

      if (!prResult.success) {
        // Check if PR already exists
        if (prResult.stderr.includes("already exists")) {
          // Get existing PR URL
          const viewResult = await this.runGhCommand([
            "pr",
            "view",
            "--json",
            "number,url",
          ]);

          if (viewResult.success) {
            try {
              const prData = JSON.parse(viewResult.stdout);
              return {
                success: true,
                number: prData.number,
                url: prData.url,
                title,
              };
            } catch {
              // Continue with error
            }
          }
        }

        return {
          success: false,
          title,
          error: prResult.stderr || "Failed to create PR",
        };
      }

      // Parse PR URL from output
      const prUrl = prResult.stdout.trim();
      const prNumber = this.extractPRNumber(prUrl);

      return {
        success: true,
        number: prNumber,
        url: prUrl,
        title,
      };
    } catch (error) {
      return {
        success: false,
        title,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get the status of a pull request
   *
   * Retrieves comprehensive PR status including:
   * - State (open/closed/merged)
   * - Mergeability
   * - CI check status
   * - Review decision
   *
   * @param number - PR number
   * @returns PR status information
   */
  async getPRStatus(number: number): Promise<PRStatus> {
    try {
      const result = await this.runGhCommand([
        "pr",
        "view",
        String(number),
        "--json",
        "number,state,title,url,mergeable,statusCheckRollup,reviewDecision",
      ]);

      if (!result.success) {
        return {
          number,
          state: "open",
          title: "",
          url: "",
          error: result.stderr || "Failed to get PR status",
        };
      }

      const data = JSON.parse(result.stdout);

      // Determine CI check status from statusCheckRollup
      let checksStatus: PRStatus["checksStatus"] = undefined;
      if (data.statusCheckRollup && Array.isArray(data.statusCheckRollup)) {
        const checks = data.statusCheckRollup;
        if (checks.length === 0) {
          checksStatus = undefined;
        } else if (checks.every((c: { conclusion?: string }) => c.conclusion === "SUCCESS")) {
          checksStatus = "passing";
        } else if (checks.some((c: { conclusion?: string }) => c.conclusion === "FAILURE")) {
          checksStatus = "failing";
        } else {
          checksStatus = "pending";
        }
      }

      // Map state to our enum
      let state: PRStatus["state"] = "open";
      if (data.state === "CLOSED") {
        state = "closed";
      } else if (data.state === "MERGED") {
        state = "merged";
      }

      // Map review decision
      let reviewDecision: PRStatus["reviewDecision"] = null;
      if (data.reviewDecision === "APPROVED") {
        reviewDecision = "approved";
      } else if (data.reviewDecision === "CHANGES_REQUESTED") {
        reviewDecision = "changes_requested";
      } else if (data.reviewDecision === "REVIEW_REQUIRED") {
        reviewDecision = "review_required";
      }

      return {
        number: data.number,
        state,
        title: data.title,
        url: data.url,
        mergeable: data.mergeable === "MERGEABLE",
        checksStatus,
        reviewDecision,
      };
    } catch (error) {
      return {
        number,
        state: "open",
        title: "",
        url: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check if gh CLI is available and authenticated
   *
   * @returns True if gh CLI is installed and authenticated
   */
  async isAvailable(): Promise<boolean> {
    try {
      const result = await this.runGhCommand(["auth", "status"]);
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Get the current repository info
   *
   * @returns Repository info (owner/repo) or null if not in a repo
   */
  async getRepoInfo(): Promise<{ owner: string; repo: string } | null> {
    try {
      const result = await this.runGhCommand([
        "repo",
        "view",
        "--json",
        "owner,name",
      ]);

      if (result.success) {
        const data = JSON.parse(result.stdout);
        return {
          owner: data.owner.login,
          repo: data.name,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  /**
   * Run a git command with retry logic
   */
  private async runGitCommand(args: string[]): Promise<CommandResult> {
    return this.runCommandWithRetry("git", args);
  }

  /**
   * Run a gh CLI command with retry logic
   */
  private async runGhCommand(args: string[]): Promise<CommandResult> {
    return this.runCommandWithRetry(GH_CLI, args);
  }

  /**
   * Run a command with automatic retry on retryable errors
   */
  private async runCommandWithRetry(
    command: string,
    args: string[]
  ): Promise<CommandResult> {
    let lastResult: CommandResult | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await this.runCommand(command, args);
        lastResult = result;

        // Success or non-retryable error
        if (result.success || !isRetryableError(result.stderr)) {
          return result;
        }

        // Wait before retrying
        if (attempt < this.maxRetries - 1) {
          const delay = getBackoffDelay(attempt);
          console.log(
            `[GitHubService] Retrying ${command} in ${Math.round(delay)}ms...`
          );
          await sleep(delay);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        lastResult = {
          stdout: "",
          stderr: errorMessage,
          exitCode: 1,
          success: false,
        };

        if (!isRetryableError(errorMessage)) {
          return lastResult;
        }

        // Wait before retrying
        if (attempt < this.maxRetries - 1) {
          const delay = getBackoffDelay(attempt);
          console.log(
            `[GitHubService] Retrying ${command} in ${Math.round(delay)}ms...`
          );
          await sleep(delay);
        }
      }
    }

    return (
      lastResult ?? {
        stdout: "",
        stderr: "Max retries exceeded",
        exitCode: 1,
        success: false,
      }
    );
  }

  /**
   * Execute a CLI command and capture output
   */
  private runCommand(command: string, args: string[]): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
      const child: ChildProcess = spawn(command, args, {
        cwd: this.workingDirectory,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env },
      });

      let stdout = "";
      let stderr = "";

      // Set up timeout
      const timeout = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error(`Command timeout after ${this.timeoutMs}ms`));
      }, this.timeoutMs);

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (exitCode) => {
        clearTimeout(timeout);
        resolve({
          stdout,
          stderr,
          exitCode,
          success: exitCode === 0,
        });
      });

      child.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }

  /**
   * Sanitize a branch name to be git-compatible
   */
  private sanitizeBranchName(name: string): string {
    // Remove or replace invalid characters
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-") // spaces to dashes
      .replace(/[^a-z0-9\-_\/]/g, "") // remove invalid chars
      .replace(/^-+|-+$/g, "") // trim leading/trailing dashes
      .replace(/-{2,}/g, "-"); // collapse multiple dashes
  }

  /**
   * Extract PR number from URL
   */
  private extractPRNumber(url: string): number | undefined {
    const match = url.match(/\/pull\/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new GitHub service instance
 *
 * @param options - Service options
 * @returns New GitHub service instance
 */
export function createGitHubService(
  options?: GitHubServiceOptions
): GitHubService {
  return new GitHubService(options);
}

// =============================================================================
// Default Export
// =============================================================================

export default GitHubService;
