/**
 * Claude Code CLI Adapter
 *
 * LLM provider adapter that spawns the Claude Code CLI for completions.
 * Uses your Max subscription for API calls.
 *
 * @see PRD-012: Claude Code CLI Adapter
 */

import { spawn, ChildProcess } from "child_process";
import type {
  LLMProvider,
  Message,
  CompletionOptions,
  Completion,
} from "@/types/provider";

// =============================================================================
// Constants
// =============================================================================

/** Default timeout for CLI operations (5 minutes) */
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

/** Maximum retry attempts on failure */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_RETRY_DELAY_MS = 1000;

/** CLI executable name */
const CLAUDE_CLI = "claude";

// =============================================================================
// Types
// =============================================================================

interface CLIResponse {
  content: string;
  model?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  error?: string;
}

interface SpawnResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format messages array into a prompt string for the Claude CLI
 *
 * Converts the message array into a format suitable for CLI input:
 * - System messages become initial context
 * - User/assistant messages are formatted as a conversation
 *
 * @param messages - Array of conversation messages
 * @returns Formatted prompt string
 */
export function formatPrompt(messages: Message[]): string {
  if (messages.length === 0) {
    return "";
  }

  const parts: string[] = [];
  let systemPrompt = "";

  for (const msg of messages) {
    switch (msg.role) {
      case "system":
        // Accumulate system messages as context
        systemPrompt += (systemPrompt ? "\n\n" : "") + msg.content;
        break;
      case "user":
        parts.push(`Human: ${msg.content}`);
        break;
      case "assistant":
        parts.push(`Assistant: ${msg.content}`);
        break;
    }
  }

  // Build final prompt
  let prompt = "";

  // Add system context at the start if present
  if (systemPrompt) {
    prompt = `<system>\n${systemPrompt}\n</system>\n\n`;
  }

  // Add conversation history
  prompt += parts.join("\n\n");

  return prompt;
}

/**
 * Parse CLI output to extract response content
 *
 * Attempts to parse as JSON first, falls back to plain text.
 * Handles various output formats from the Claude CLI.
 *
 * @param output - Raw CLI stdout
 * @returns Parsed response object
 */
export function parseOutput(output: string): CLIResponse {
  const trimmed = output.trim();

  // Try JSON parse first
  try {
    const parsed = JSON.parse(trimmed);

    // Handle structured response format
    if (typeof parsed === "object" && parsed !== null) {
      return {
        content: parsed.content || parsed.result || parsed.response || trimmed,
        model: parsed.model,
        usage: parsed.usage,
      };
    }

    // JSON primitive (string)
    return { content: String(parsed) };
  } catch {
    // Not JSON, return as plain text
  }

  // Handle text output - the CLI may output directly
  return { content: trimmed };
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number): number {
  return BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
}

// =============================================================================
// Claude Code Adapter Class
// =============================================================================

/**
 * Claude Code CLI Adapter
 *
 * Implements LLMProvider interface by spawning the Claude Code CLI.
 * Uses --dangerously-skip-permissions flag for non-interactive operation.
 *
 * Features:
 * - 5-minute timeout per request
 * - Automatic retry with exponential backoff
 * - JSON/text output parsing
 * - Streaming support via CLI stdout
 */
export class ClaudeCodeAdapter implements LLMProvider {
  readonly id = "claude-code" as const;
  readonly name = "Claude Code CLI";
  readonly type = "cli" as const;
  readonly supportsVision = true;
  readonly supportsTools = true;
  readonly maxContext = 200000;

  /** Custom timeout in ms (default: 5 minutes) */
  private timeoutMs: number;

  /** Maximum retry attempts */
  private maxRetries: number;

  constructor(options?: { timeoutMs?: number; maxRetries?: number }) {
    this.timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options?.maxRetries ?? MAX_RETRIES;
  }

  /**
   * Execute a completion request via Claude CLI
   *
   * @param messages - Conversation messages
   * @param options - Completion options
   * @returns Completion result
   */
  async complete(
    messages: Message[],
    options?: CompletionOptions
  ): Promise<Completion> {
    const prompt = formatPrompt(messages);
    let lastError: Error | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await this.spawnCLI(prompt, options);
        const parsed = parseOutput(result.stdout);

        if (parsed.error) {
          throw new Error(parsed.error);
        }

        // Estimate tokens if not provided by CLI
        const inputTokens =
          parsed.usage?.inputTokens ?? Math.ceil(prompt.length / 4);
        const outputTokens =
          parsed.usage?.outputTokens ?? Math.ceil(parsed.content.length / 4);

        return {
          id: `claude-cli-${Date.now()}`,
          content: parsed.content,
          model: parsed.model ?? options?.model ?? "claude-code-cli",
          usage: {
            inputTokens,
            outputTokens,
          },
          finishReason: "stop",
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(
          `[ClaudeCodeAdapter] Attempt ${attempt + 1}/${this.maxRetries} failed:`,
          lastError.message
        );

        // Don't wait after the last attempt
        if (attempt < this.maxRetries - 1) {
          const delay = getBackoffDelay(attempt);
          console.log(`[ClaudeCodeAdapter] Retrying in ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    // All retries exhausted
    throw new Error(
      `[ClaudeCodeAdapter] All ${this.maxRetries} attempts failed. Last error: ${lastError?.message}`
    );
  }

  /**
   * Stream completion response from Claude CLI
   *
   * Yields characters as they are output by the CLI.
   *
   * @param messages - Conversation messages
   * @param options - Completion options
   */
  async *stream(
    messages: Message[],
    options?: CompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    const prompt = formatPrompt(messages);
    const args = this.buildCLIArgs(prompt, options);

    const child = spawn(CLAUDE_CLI, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env },
    });

    // Buffer for accumulating output
    let buffer = "";

    // Create a promise that resolves when the process exits
    const exitPromise = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error(`CLI timeout after ${this.timeoutMs}ms`));
      }, this.timeoutMs);

      child.on("close", (code) => {
        clearTimeout(timeout);
        if (code !== 0) {
          reject(new Error(`CLI exited with code ${code}`));
        } else {
          resolve();
        }
      });

      child.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // Stream stdout chunks
    for await (const chunk of child.stdout) {
      const text = chunk.toString();
      buffer += text;

      // Yield each character for smooth streaming
      for (const char of text) {
        yield char;
      }
    }

    // Wait for process to complete
    await exitPromise;
  }

  /**
   * Check if Claude CLI is available
   *
   * @returns True if CLI is installed and accessible
   */
  async isAvailable(): Promise<boolean> {
    try {
      const result = await this.runCommand("--version");
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Spawn the Claude CLI with the given prompt
   *
   * @param prompt - Formatted prompt string
   * @param options - Completion options
   * @returns CLI output result
   */
  private async spawnCLI(
    prompt: string,
    options?: CompletionOptions
  ): Promise<SpawnResult> {
    const args = this.buildCLIArgs(prompt, options);

    return this.runCommand(...args);
  }

  /**
   * Build CLI arguments array
   *
   * @param prompt - The prompt to send
   * @param options - Completion options
   * @returns Arguments array for spawn
   */
  private buildCLIArgs(prompt: string, options?: CompletionOptions): string[] {
    const args: string[] = [
      // Skip interactive permission prompts for non-interactive use
      "--dangerously-skip-permissions",
      // Print output only, no interactive UI
      "--print",
    ];

    // Add model if specified
    if (options?.model) {
      args.push("--model", options.model);
    }

    // Add max tokens if specified
    if (options?.maxTokens) {
      args.push("--max-tokens", String(options.maxTokens));
    }

    // Add the prompt as the final argument
    args.push(prompt);

    return args;
  }

  /**
   * Run a CLI command and capture output
   *
   * @param args - Command arguments
   * @returns Command output
   */
  private runCommand(...args: string[]): Promise<SpawnResult> {
    return new Promise((resolve, reject) => {
      const child: ChildProcess = spawn(CLAUDE_CLI, args, {
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env },
      });

      let stdout = "";
      let stderr = "";

      // Set up timeout
      const timeout = setTimeout(() => {
        child.kill("SIGTERM");
        reject(new Error(`CLI timeout after ${this.timeoutMs}ms`));
      }, this.timeoutMs);

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (exitCode) => {
        clearTimeout(timeout);
        resolve({ stdout, stderr, exitCode });
      });

      child.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new Claude Code CLI adapter instance
 *
 * @param options - Adapter options
 * @returns New adapter instance
 */
export function createClaudeCodeAdapter(options?: {
  timeoutMs?: number;
  maxRetries?: number;
}): ClaudeCodeAdapter {
  return new ClaudeCodeAdapter(options);
}

// =============================================================================
// Default Export
// =============================================================================

export default ClaudeCodeAdapter;
