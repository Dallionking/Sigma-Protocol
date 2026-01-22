/**
 * LLM Provider Registry
 *
 * Centralized registry for LLM providers with factory pattern and unified interface.
 * Supports multiple providers: Claude Code CLI, Anthropic, OpenAI, Gemini, OpenRouter, XAI, Ollama.
 *
 * Usage:
 *   import { getProvider, listProviders, registerProvider } from '@/server/providers';
 *
 *   // Get a provider by ID
 *   const provider = getProvider('anthropic');
 *
 *   // List all registered providers
 *   const providers = listProviders();
 *
 *   // Register a custom provider
 *   registerProvider(myCustomProvider);
 */

import type {
  LLMProvider,
  ProviderId,
  Message,
  CompletionOptions,
  Completion,
} from "@/types/provider";

import { ClaudeCodeAdapter, createClaudeCodeAdapter } from "./claude-code";
import { AnthropicAdapter, createAnthropicAdapter } from "./anthropic";

// =============================================================================
// Provider Registry
// =============================================================================

/** Internal registry storage - Map of provider ID to provider instance */
const providerRegistry: Map<ProviderId | string, LLMProvider> = new Map();

/** Registered provider factories for lazy initialization */
const providerFactories: Map<
  ProviderId | string,
  () => LLMProvider | Promise<LLMProvider>
> = new Map();

// =============================================================================
// Registry Functions
// =============================================================================

/**
 * Register an LLM provider instance in the registry
 *
 * @param provider - The LLM provider instance to register
 * @throws Error if provider with same ID is already registered
 *
 * @example
 * ```ts
 * const myProvider: LLMProvider = {
 *   id: 'custom',
 *   name: 'Custom Provider',
 *   // ... rest of implementation
 * };
 * registerProvider(myProvider);
 * ```
 */
export function registerProvider(provider: LLMProvider): void {
  if (providerRegistry.has(provider.id)) {
    console.warn(
      `Provider "${provider.id}" is already registered, overwriting...`
    );
  }

  providerRegistry.set(provider.id, provider);
  console.log(`🔌 Registered LLM provider: ${provider.name} (${provider.id})`);
}

/**
 * Register a provider factory for lazy initialization
 *
 * @param id - The provider ID
 * @param factory - Factory function that creates the provider
 *
 * @example
 * ```ts
 * registerProviderFactory('anthropic', () => new AnthropicProvider(apiKey));
 * ```
 */
export function registerProviderFactory(
  id: ProviderId | string,
  factory: () => LLMProvider | Promise<LLMProvider>
): void {
  providerFactories.set(id, factory);
  console.log(`🏭 Registered LLM provider factory: ${id}`);
}

/**
 * Get an LLM provider by ID
 *
 * @param id - The provider ID to look up
 * @returns The provider instance or undefined if not found
 *
 * @example
 * ```ts
 * const anthropic = getProvider('anthropic');
 * if (anthropic) {
 *   const response = await anthropic.complete(messages);
 * }
 * ```
 */
export function getProvider(id: ProviderId | string): LLMProvider | undefined {
  // First check registry
  const registered = providerRegistry.get(id);
  if (registered) {
    return registered;
  }

  // Check if we have a factory (for lazy init)
  const factory = providerFactories.get(id);
  if (factory) {
    // Synchronous factory support
    const result = factory();
    if (result instanceof Promise) {
      console.warn(
        `Provider factory for "${id}" is async. Use getProviderAsync() instead.`
      );
      return undefined;
    }
    // Cache the result
    providerRegistry.set(id, result);
    return result;
  }

  return undefined;
}

/**
 * Get an LLM provider by ID (async version for lazy factories)
 *
 * @param id - The provider ID to look up
 * @returns Promise resolving to the provider instance or undefined
 */
export async function getProviderAsync(
  id: ProviderId | string
): Promise<LLMProvider | undefined> {
  // First check registry
  const registered = providerRegistry.get(id);
  if (registered) {
    return registered;
  }

  // Check if we have a factory
  const factory = providerFactories.get(id);
  if (factory) {
    const result = await factory();
    // Cache the result
    providerRegistry.set(id, result);
    return result;
  }

  return undefined;
}

/**
 * List all registered providers
 *
 * @returns Array of all registered provider instances
 *
 * @example
 * ```ts
 * const providers = listProviders();
 * providers.forEach(p => console.log(`${p.name}: ${p.id}`));
 * ```
 */
export function listProviders(): LLMProvider[] {
  return Array.from(providerRegistry.values());
}

/**
 * List all registered provider IDs (including factories)
 *
 * @returns Array of all provider IDs
 */
export function listProviderIds(): string[] {
  const registeredIds = Array.from(providerRegistry.keys());
  const factoryIds = Array.from(providerFactories.keys());
  // Combine and deduplicate
  return [...new Set([...registeredIds, ...factoryIds])];
}

/**
 * Check if a provider is registered
 *
 * @param id - The provider ID to check
 * @returns True if provider exists in registry or has a factory
 */
export function hasProvider(id: ProviderId | string): boolean {
  return providerRegistry.has(id) || providerFactories.has(id);
}

/**
 * Remove a provider from the registry
 *
 * @param id - The provider ID to remove
 * @returns True if provider was removed, false if not found
 */
export function unregisterProvider(id: ProviderId | string): boolean {
  const hadProvider = providerRegistry.delete(id);
  const hadFactory = providerFactories.delete(id);
  if (hadProvider || hadFactory) {
    console.log(`🔌 Unregistered LLM provider: ${id}`);
  }
  return hadProvider || hadFactory;
}

/**
 * Clear all registered providers
 * Useful for testing or re-initialization
 */
export function clearProviders(): void {
  providerRegistry.clear();
  providerFactories.clear();
  console.log("🧹 Cleared all LLM providers from registry");
}

// =============================================================================
// Default Stub Providers
// =============================================================================

/**
 * Create a stub provider for development/testing
 * Returns mock responses without calling any API
 */
function createStubProvider(
  id: ProviderId,
  name: string,
  options: {
    supportsVision?: boolean;
    supportsTools?: boolean;
    maxContext?: number;
  } = {}
): LLMProvider {
  const { supportsVision = false, supportsTools = false, maxContext = 8192 } = options;

  return {
    id,
    name,
    type: "api",
    supportsVision,
    supportsTools,
    maxContext,

    async complete(
      messages: Message[],
      opts?: CompletionOptions
    ): Promise<Completion> {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      const lastMessage = messages[messages.length - 1];
      const prompt = lastMessage?.content || "";

      return {
        id: `stub-${Date.now()}`,
        content: `[${name} Stub] This is a placeholder response. In production, this would call the ${name} API.\n\nYour message was: "${prompt.slice(0, 100)}${prompt.length > 100 ? "..." : ""}"`,
        model: opts?.model || `${id}-stub`,
        usage: {
          inputTokens: Math.ceil(prompt.length / 4),
          outputTokens: 50,
        },
        finishReason: "stop",
      };
    },

    async *stream(
      messages: Message[],
      opts?: CompletionOptions
    ): AsyncGenerator<string, void, unknown> {
      // Simulate streaming
      const response = `[${name} Stub] Streaming response...`;
      for (const char of response) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        yield char;
      }
    },

    async isAvailable(): Promise<boolean> {
      // Stub providers are always "available" for development
      return true;
    },
  };
}

/**
 * Create a CLI-based stub provider (for Claude Code CLI)
 */
function createCLIStubProvider(): LLMProvider {
  return {
    id: "claude-code",
    name: "Claude Code CLI",
    type: "cli",
    supportsVision: true,
    supportsTools: true,
    maxContext: 200000,

    async complete(
      messages: Message[],
      opts?: CompletionOptions
    ): Promise<Completion> {
      // In production, this would spawn the Claude CLI
      await new Promise((resolve) => setTimeout(resolve, 100));

      const lastMessage = messages[messages.length - 1];
      const prompt = lastMessage?.content || "";

      return {
        id: `claude-cli-${Date.now()}`,
        content: `[Claude Code CLI Stub] This provider spawns the Claude Code CLI with --dangerously-skip-permissions.\n\nIn production, this would execute real Claude completions using your Max subscription.\n\nPrompt preview: "${prompt.slice(0, 100)}${prompt.length > 100 ? "..." : ""}"`,
        model: opts?.model || "claude-code-cli",
        usage: {
          inputTokens: Math.ceil(prompt.length / 4),
          outputTokens: 75,
        },
        finishReason: "stop",
      };
    },

    async *stream(
      messages: Message[],
      _opts?: CompletionOptions
    ): AsyncGenerator<string, void, unknown> {
      const response = "[Claude Code CLI Stub] Streaming from CLI...";
      for (const char of response) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        yield char;
      }
    },

    async isAvailable(): Promise<boolean> {
      // In production, check if claude CLI is installed
      // For stub, always return true
      return true;
    },
  };
}

// =============================================================================
// Default Provider Registration
// =============================================================================

/**
 * Initialize the registry with default providers
 * Call this on server startup
 */
export function initializeDefaultProviders(): void {
  // Claude Code CLI (uses Max subscription) - Real adapter
  registerProvider(createClaudeCodeAdapter());

  // Anthropic (Claude API) - Real adapter using @anthropic-ai/sdk
  registerProvider(createAnthropicAdapter());

  // OpenAI
  registerProvider(
    createStubProvider("openai", "OpenAI", {
      supportsVision: true,
      supportsTools: true,
      maxContext: 128000,
    })
  );

  // Google Gemini
  registerProvider(
    createStubProvider("gemini", "Google Gemini", {
      supportsVision: true,
      supportsTools: true,
      maxContext: 1000000,
    })
  );

  // OpenRouter
  registerProvider(
    createStubProvider("openrouter", "OpenRouter", {
      supportsVision: true,
      supportsTools: true,
      maxContext: 128000,
    })
  );

  // XAI (Grok)
  registerProvider(
    createStubProvider("xai", "XAI Grok", {
      supportsVision: false,
      supportsTools: true,
      maxContext: 131072,
    })
  );

  // Ollama (local)
  registerProvider(
    createStubProvider("ollama", "Ollama (Local)", {
      supportsVision: false,
      supportsTools: false,
      maxContext: 32768,
    })
  );

  console.log(
    `✅ Initialized ${providerRegistry.size} default LLM providers`
  );
}

// =============================================================================
// Auto-initialize on import
// =============================================================================

// Register default providers when this module is imported
initializeDefaultProviders();

// =============================================================================
// Type Exports
// =============================================================================

export type { LLMProvider, ProviderId, Message, CompletionOptions, Completion };

// Export Claude Code adapter for direct use
export { ClaudeCodeAdapter, createClaudeCodeAdapter } from "./claude-code";
export { formatPrompt, parseOutput } from "./claude-code";

// Export Anthropic adapter for direct use
export { AnthropicAdapter, createAnthropicAdapter, SUPPORTED_MODELS as ANTHROPIC_MODELS } from "./anthropic";
