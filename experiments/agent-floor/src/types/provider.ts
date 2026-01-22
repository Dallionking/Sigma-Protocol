export type ProviderType = "api" | "cli";

export type ProviderId =
  | "anthropic"
  | "openai"
  | "gemini"
  | "openrouter"
  | "xai"
  | "ollama"
  | "claude-code";

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  type: ProviderType;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  models: ModelConfig[];
  defaultModel: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  contextWindow: number;
  supportsVision: boolean;
  supportsTools: boolean;
  costPerMToken?: number;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  name?: string;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  tools?: Tool[];
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface Completion {
  id: string;
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  finishReason: "stop" | "length" | "tool_use";
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface LLMProvider {
  id: ProviderId;
  name: string;
  type: ProviderType;

  // Core methods
  complete(messages: Message[], options?: CompletionOptions): Promise<Completion>;
  stream?(
    messages: Message[],
    options?: CompletionOptions
  ): AsyncGenerator<string, void, unknown>;

  // Capabilities
  supportsVision: boolean;
  supportsTools: boolean;
  maxContext: number;

  // Health check
  isAvailable(): Promise<boolean>;
}
