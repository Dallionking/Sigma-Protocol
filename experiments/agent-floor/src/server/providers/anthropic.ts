/**
 * Anthropic API Adapter
 *
 * LLM provider adapter for Anthropic API using the official @anthropic-ai/sdk.
 * Supports Claude Sonnet 4 and Claude Opus 4 models with streaming.
 *
 * @see PRD-013: Anthropic/OpenAI API Adapters
 */

import Anthropic from "@anthropic-ai/sdk";
import type {
  LLMProvider,
  Message,
  CompletionOptions,
  Completion,
} from "@/types/provider";

// =============================================================================
// Constants
// =============================================================================

/** Default timeout for API calls (5 minutes) */
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

/** Maximum retry attempts on failure */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_RETRY_DELAY_MS = 1000;

/** Maximum context window for Claude models */
const MAX_CONTEXT = 200000;

/** Supported Claude models */
export const SUPPORTED_MODELS = {
  "claude-sonnet-4": "claude-sonnet-4-20250514",
  "claude-opus-4": "claude-opus-4-20250514",
  // Aliases for convenience
  "claude-4-sonnet": "claude-sonnet-4-20250514",
  "claude-4-opus": "claude-opus-4-20250514",
} as const;

/** Default model to use if not specified */
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

// =============================================================================
// Types
// =============================================================================

export interface AnthropicAdapterOptions {
  /** Anthropic API key (defaults to ANTHROPIC_API_KEY env var) */
  apiKey?: string;
  /** Custom timeout in ms */
  timeoutMs?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Default model to use */
  defaultModel?: string;
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
  // Add jitter (0-25% of delay)
  const jitter = Math.random() * 0.25 * baseDelay;
  return Math.min(baseDelay + jitter, 30000); // Cap at 30 seconds
}

/**
 * Convert our Message format to Anthropic's format
 */
function convertMessages(
  messages: Message[]
): { systemPrompt: string | undefined; messages: Anthropic.MessageParam[] } {
  let systemPrompt: string | undefined;
  const anthropicMessages: Anthropic.MessageParam[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      // Accumulate system messages
      systemPrompt = systemPrompt
        ? `${systemPrompt}\n\n${msg.content}`
        : msg.content;
    } else if (msg.role === "user" || msg.role === "assistant") {
      anthropicMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  return { systemPrompt, messages: anthropicMessages };
}

/**
 * Resolve model alias to full model ID
 */
function resolveModel(model: string | undefined, defaultModel: string): string {
  if (!model) return defaultModel;

  // Check if it's an alias
  const resolved =
    SUPPORTED_MODELS[model as keyof typeof SUPPORTED_MODELS] || model;
  return resolved;
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Anthropic.APIError) {
    // Retry on rate limits, server errors, and connection issues
    const retryableCodes = [429, 500, 502, 503, 504];
    return retryableCodes.includes(error.status);
  }

  // Retry on network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("econnreset") ||
      message.includes("econnrefused")
    );
  }

  return false;
}

// =============================================================================
// Anthropic Adapter Class
// =============================================================================

/**
 * Anthropic API Adapter
 *
 * Implements LLMProvider interface using the official Anthropic SDK.
 *
 * Features:
 * - Support for Claude Sonnet 4 and Claude Opus 4 models
 * - Streaming support via async generator
 * - Automatic retry with exponential backoff
 * - Proper error handling and classification
 */
export class AnthropicAdapter implements LLMProvider {
  readonly id = "anthropic" as const;
  readonly name = "Anthropic Claude";
  readonly type = "api" as const;
  readonly supportsVision = true;
  readonly supportsTools = true;
  readonly maxContext = MAX_CONTEXT;

  private client: Anthropic;
  private timeoutMs: number;
  private maxRetries: number;
  private defaultModel: string;

  constructor(options?: AnthropicAdapterOptions) {
    const apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.warn(
        "[AnthropicAdapter] No API key provided. Set ANTHROPIC_API_KEY environment variable or pass apiKey option."
      );
    }

    this.client = new Anthropic({
      apiKey: apiKey || "",
      timeout: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });

    this.timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options?.maxRetries ?? MAX_RETRIES;
    this.defaultModel = options?.defaultModel ?? DEFAULT_MODEL;
  }

  /**
   * Execute a completion request via Anthropic API
   *
   * @param messages - Conversation messages
   * @param options - Completion options
   * @returns Completion result
   */
  async complete(
    messages: Message[],
    options?: CompletionOptions
  ): Promise<Completion> {
    const { systemPrompt, messages: anthropicMessages } =
      convertMessages(messages);
    const model = resolveModel(options?.model, this.defaultModel);
    let lastError: Error | null = null;

    // Ensure we have at least one message
    if (anthropicMessages.length === 0) {
      throw new Error(
        "[AnthropicAdapter] At least one user or assistant message is required"
      );
    }

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.client.messages.create({
          model,
          max_tokens: options?.maxTokens ?? 4096,
          system: systemPrompt,
          messages: anthropicMessages,
          temperature: options?.temperature,
          stop_sequences: options?.stopSequences,
        });

        // Extract text content from response
        const textContent = response.content
          .filter((block): block is Anthropic.TextBlock => block.type === "text")
          .map((block) => block.text)
          .join("");

        // Map finish reason
        let finishReason: "stop" | "length" | "tool_use" = "stop";
        if (response.stop_reason === "max_tokens") {
          finishReason = "length";
        } else if (response.stop_reason === "tool_use") {
          finishReason = "tool_use";
        }

        return {
          id: response.id,
          content: textContent,
          model: response.model,
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          },
          finishReason,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Log the error
        console.warn(
          `[AnthropicAdapter] Attempt ${attempt + 1}/${this.maxRetries} failed:`,
          lastError.message
        );

        // Check if we should retry
        if (!isRetryableError(error) || attempt >= this.maxRetries - 1) {
          break;
        }

        // Wait before retrying
        const delay = getBackoffDelay(attempt);
        console.log(`[AnthropicAdapter] Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }

    // All retries exhausted or non-retryable error
    throw new Error(
      `[AnthropicAdapter] Request failed after ${this.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Stream completion response from Anthropic API
   *
   * Yields text chunks as they are received from the API.
   *
   * @param messages - Conversation messages
   * @param options - Completion options
   */
  async *stream(
    messages: Message[],
    options?: CompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    const { systemPrompt, messages: anthropicMessages } =
      convertMessages(messages);
    const model = resolveModel(options?.model, this.defaultModel);

    // Ensure we have at least one message
    if (anthropicMessages.length === 0) {
      throw new Error(
        "[AnthropicAdapter] At least one user or assistant message is required"
      );
    }

    let lastError: Error | null = null;

    // Retry loop for streaming
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const stream = this.client.messages.stream({
          model,
          max_tokens: options?.maxTokens ?? 4096,
          system: systemPrompt,
          messages: anthropicMessages,
          temperature: options?.temperature,
          stop_sequences: options?.stopSequences,
        });

        // Yield text deltas as they arrive
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            yield event.delta.text;
          }
        }

        // Successfully completed streaming
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        console.warn(
          `[AnthropicAdapter] Stream attempt ${attempt + 1}/${this.maxRetries} failed:`,
          lastError.message
        );

        // Check if we should retry
        if (!isRetryableError(error) || attempt >= this.maxRetries - 1) {
          break;
        }

        // Wait before retrying
        const delay = getBackoffDelay(attempt);
        console.log(`[AnthropicAdapter] Retrying stream in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }

    // All retries exhausted
    throw new Error(
      `[AnthropicAdapter] Stream failed after ${this.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Check if the Anthropic API is available
   *
   * Performs a minimal API call to verify connectivity and authentication.
   *
   * @returns True if API is accessible and authenticated
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Perform a minimal request to check API availability
      await this.client.messages.create({
        model: this.defaultModel,
        max_tokens: 1,
        messages: [{ role: "user", content: "Hi" }],
      });
      return true;
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) {
        console.error(
          "[AnthropicAdapter] Authentication failed. Check your API key."
        );
      } else if (error instanceof Anthropic.APIError) {
        console.error(
          `[AnthropicAdapter] API error: ${error.status} ${error.message}`
        );
      } else {
        console.error("[AnthropicAdapter] Connection failed:", error);
      }
      return false;
    }
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new Anthropic API adapter instance
 *
 * @param options - Adapter options
 * @returns New adapter instance
 */
export function createAnthropicAdapter(
  options?: AnthropicAdapterOptions
): AnthropicAdapter {
  return new AnthropicAdapter(options);
}

// =============================================================================
// Default Export
// =============================================================================

export default AnthropicAdapter;
