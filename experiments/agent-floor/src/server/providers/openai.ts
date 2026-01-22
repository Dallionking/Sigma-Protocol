/**
 * OpenAI API Adapter
 *
 * LLM provider adapter for OpenAI API using the official openai SDK.
 * Supports GPT-4o and GPT-4o-mini models with streaming.
 *
 * @see PRD-013: Anthropic/OpenAI API Adapters
 */

import OpenAI from "openai";
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

/** Maximum context window for GPT-4o models */
const MAX_CONTEXT = 128000;

/** Supported OpenAI models */
export const SUPPORTED_MODELS = {
  "gpt-4o": "gpt-4o",
  "gpt-4o-mini": "gpt-4o-mini",
  // Aliases for convenience
  "gpt4o": "gpt-4o",
  "gpt4o-mini": "gpt-4o-mini",
  "4o": "gpt-4o",
  "4o-mini": "gpt-4o-mini",
} as const;

/** Default model to use if not specified */
const DEFAULT_MODEL = "gpt-4o";

// =============================================================================
// Types
// =============================================================================

export interface OpenAIAdapterOptions {
  /** OpenAI API key (defaults to OPENAI_API_KEY env var) */
  apiKey?: string;
  /** Custom base URL (for API proxies) */
  baseURL?: string;
  /** Custom timeout in ms */
  timeoutMs?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Default model to use */
  defaultModel?: string;
  /** Organization ID */
  organization?: string;
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
 * Convert our Message format to OpenAI's format
 */
function convertMessages(
  messages: Message[]
): OpenAI.ChatCompletionMessageParam[] {
  return messages.map((msg) => {
    if (msg.role === "system") {
      return {
        role: "system" as const,
        content: msg.content,
      };
    } else if (msg.role === "user") {
      return {
        role: "user" as const,
        content: msg.content,
        name: msg.name,
      };
    } else {
      return {
        role: "assistant" as const,
        content: msg.content,
        name: msg.name,
      };
    }
  });
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
  if (error instanceof OpenAI.APIError) {
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
// OpenAI Adapter Class
// =============================================================================

/**
 * OpenAI API Adapter
 *
 * Implements LLMProvider interface using the official OpenAI SDK.
 *
 * Features:
 * - Support for GPT-4o and GPT-4o-mini models
 * - Streaming support via async generator
 * - Automatic retry with exponential backoff
 * - Proper error handling and classification
 */
export class OpenAIAdapter implements LLMProvider {
  readonly id = "openai" as const;
  readonly name = "OpenAI";
  readonly type = "api" as const;
  readonly supportsVision = true;
  readonly supportsTools = true;
  readonly maxContext = MAX_CONTEXT;

  private client: OpenAI;
  private timeoutMs: number;
  private maxRetries: number;
  private defaultModel: string;

  constructor(options?: OpenAIAdapterOptions) {
    const apiKey = options?.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn(
        "[OpenAIAdapter] No API key provided. Set OPENAI_API_KEY environment variable or pass apiKey option."
      );
    }

    this.client = new OpenAI({
      apiKey: apiKey || "",
      baseURL: options?.baseURL,
      organization: options?.organization,
      timeout: options?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });

    this.timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options?.maxRetries ?? MAX_RETRIES;
    this.defaultModel = options?.defaultModel ?? DEFAULT_MODEL;
  }

  /**
   * Execute a completion request via OpenAI API
   *
   * @param messages - Conversation messages
   * @param options - Completion options
   * @returns Completion result
   */
  async complete(
    messages: Message[],
    options?: CompletionOptions
  ): Promise<Completion> {
    const openaiMessages = convertMessages(messages);
    const model = resolveModel(options?.model, this.defaultModel);
    let lastError: Error | null = null;

    // Ensure we have at least one message
    if (openaiMessages.length === 0) {
      throw new Error(
        "[OpenAIAdapter] At least one message is required"
      );
    }

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model,
          messages: openaiMessages,
          max_tokens: options?.maxTokens ?? 4096,
          temperature: options?.temperature,
          stop: options?.stopSequences,
        });

        // Extract the response content
        const choice = response.choices[0];
        const content = choice?.message?.content || "";

        // Map finish reason
        let finishReason: "stop" | "length" | "tool_use" = "stop";
        if (choice?.finish_reason === "length") {
          finishReason = "length";
        } else if (choice?.finish_reason === "tool_calls") {
          finishReason = "tool_use";
        }

        return {
          id: response.id,
          content,
          model: response.model,
          usage: {
            inputTokens: response.usage?.prompt_tokens ?? 0,
            outputTokens: response.usage?.completion_tokens ?? 0,
          },
          finishReason,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Log the error
        console.warn(
          `[OpenAIAdapter] Attempt ${attempt + 1}/${this.maxRetries} failed:`,
          lastError.message
        );

        // Check if we should retry
        if (!isRetryableError(error) || attempt >= this.maxRetries - 1) {
          break;
        }

        // Wait before retrying
        const delay = getBackoffDelay(attempt);
        console.log(`[OpenAIAdapter] Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }

    // All retries exhausted or non-retryable error
    throw new Error(
      `[OpenAIAdapter] Request failed after ${this.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Stream completion response from OpenAI API
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
    const openaiMessages = convertMessages(messages);
    const model = resolveModel(options?.model, this.defaultModel);

    // Ensure we have at least one message
    if (openaiMessages.length === 0) {
      throw new Error(
        "[OpenAIAdapter] At least one message is required"
      );
    }

    let lastError: Error | null = null;

    // Retry loop for streaming
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const stream = await this.client.chat.completions.create({
          model,
          messages: openaiMessages,
          max_tokens: options?.maxTokens ?? 4096,
          temperature: options?.temperature,
          stop: options?.stopSequences,
          stream: true,
        });

        // Yield text deltas as they arrive
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            yield delta;
          }
        }

        // Successfully completed streaming
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        console.warn(
          `[OpenAIAdapter] Stream attempt ${attempt + 1}/${this.maxRetries} failed:`,
          lastError.message
        );

        // Check if we should retry
        if (!isRetryableError(error) || attempt >= this.maxRetries - 1) {
          break;
        }

        // Wait before retrying
        const delay = getBackoffDelay(attempt);
        console.log(`[OpenAIAdapter] Retrying stream in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }

    // All retries exhausted
    throw new Error(
      `[OpenAIAdapter] Stream failed after ${this.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Check if the OpenAI API is available
   *
   * Performs a minimal API call to verify connectivity and authentication.
   *
   * @returns True if API is accessible and authenticated
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Perform a minimal request to check API availability
      await this.client.chat.completions.create({
        model: this.defaultModel,
        max_tokens: 1,
        messages: [{ role: "user", content: "Hi" }],
      });
      return true;
    } catch (error) {
      if (error instanceof OpenAI.AuthenticationError) {
        console.error(
          "[OpenAIAdapter] Authentication failed. Check your API key."
        );
      } else if (error instanceof OpenAI.APIError) {
        console.error(
          `[OpenAIAdapter] API error: ${error.status} ${error.message}`
        );
      } else {
        console.error("[OpenAIAdapter] Connection failed:", error);
      }
      return false;
    }
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new OpenAI API adapter instance
 *
 * @param options - Adapter options
 * @returns New adapter instance
 */
export function createOpenAIAdapter(
  options?: OpenAIAdapterOptions
): OpenAIAdapter {
  return new OpenAIAdapter(options);
}

// =============================================================================
// Default Export
// =============================================================================

export default OpenAIAdapter;
