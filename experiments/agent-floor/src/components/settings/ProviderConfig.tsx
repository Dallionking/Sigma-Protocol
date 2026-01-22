"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronDown,
  Cpu,
  Key,
  Globe,
  Zap,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  useSettingsStore,
  useProviders,
  type StoredProviderConfig,
} from "@/lib/store/settings-store";
import type { ProviderId } from "@/types/provider";

/**
 * Provider metadata with display names, models, and test URLs
 */
interface ProviderMeta {
  id: ProviderId;
  name: string;
  description: string;
  requiresApiKey: boolean;
  defaultBaseUrl?: string;
  models: { id: string; name: string }[];
}

const PROVIDER_METADATA: ProviderMeta[] = [
  {
    id: "claude-code",
    name: "Claude Code CLI",
    description: "Uses your Claude Max subscription via CLI",
    requiresApiKey: false,
    models: [
      { id: "opus", name: "Opus 4" },
      { id: "sonnet", name: "Sonnet 4" },
      { id: "haiku", name: "Haiku 3.5" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude API direct access",
    requiresApiKey: true,
    models: [
      { id: "claude-opus-4-20250514", name: "Claude Opus 4" },
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
      { id: "claude-haiku-3-5-20241022", name: "Claude Haiku 3.5" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4 and other OpenAI models",
    requiresApiKey: true,
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
      { id: "o1-preview", name: "O1 Preview" },
      { id: "o1-mini", name: "O1 Mini" },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Google AI models with 1M context",
    requiresApiKey: true,
    models: [
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Multi-model router with pay-per-use",
    requiresApiKey: true,
    defaultBaseUrl: "https://openrouter.ai/api/v1",
    models: [
      { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4" },
      { id: "openai/gpt-4o", name: "GPT-4o" },
      { id: "meta-llama/llama-3.3-70b", name: "Llama 3.3 70B" },
    ],
  },
  {
    id: "xai",
    name: "xAI",
    description: "Grok models from xAI",
    requiresApiKey: true,
    models: [
      { id: "grok-2", name: "Grok 2" },
      { id: "grok-beta", name: "Grok Beta" },
    ],
  },
  {
    id: "ollama",
    name: "Ollama",
    description: "Local LLM inference",
    requiresApiKey: false,
    defaultBaseUrl: "http://localhost:11434",
    models: [
      { id: "llama3.2", name: "Llama 3.2" },
      { id: "codellama", name: "Code Llama" },
      { id: "mistral", name: "Mistral" },
      { id: "mixtral", name: "Mixtral" },
    ],
  },
];

/**
 * Connection test status
 */
type ConnectionStatus = "idle" | "testing" | "success" | "error";

interface ProviderCardProps {
  provider: StoredProviderConfig;
  meta: ProviderMeta;
  onUpdate: (id: ProviderId, updates: Partial<StoredProviderConfig>) => void;
  onDelete: (id: ProviderId) => void;
  onTest: (id: ProviderId) => Promise<boolean>;
}

/**
 * Individual provider configuration card
 */
function ProviderCard({
  provider,
  meta,
  onUpdate,
  onDelete,
  onTest,
}: ProviderCardProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTestConnection = useCallback(async () => {
    setConnectionStatus("testing");
    setErrorMessage(null);

    try {
      const success = await onTest(provider.id);
      setConnectionStatus(success ? "success" : "error");
      if (!success) {
        setErrorMessage("Connection failed. Check your API key and settings.");
      }
    } catch (err) {
      setConnectionStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Connection test failed"
      );
    }
  }, [provider.id, onTest]);

  const handleModelSelect = useCallback(
    (modelId: string) => {
      onUpdate(provider.id, { defaultModel: modelId });
      setShowModelDropdown(false);
    },
    [provider.id, onUpdate]
  );

  const selectedModel =
    meta.models.find((m) => m.id === provider.defaultModel) || meta.models[0];

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border transition-all",
        provider.enabled
          ? "bg-floor-panel border-floor-highlight/50"
          : "bg-floor-bg border-floor-accent opacity-75"
      )}
      data-testid={`provider-card-${provider.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              provider.enabled ? "bg-floor-highlight/20" : "bg-floor-accent"
            )}
          >
            <Cpu
              className={cn(
                "w-5 h-5",
                provider.enabled ? "text-floor-highlight" : "text-floor-muted"
              )}
            />
          </div>
          <div>
            <h3 className="font-semibold text-floor-text">{meta.name}</h3>
            <p className="text-xs text-floor-muted">{meta.description}</p>
          </div>
        </div>

        {/* Enable/Disable Toggle */}
        <button
          onClick={() => onUpdate(provider.id, { enabled: !provider.enabled })}
          className={cn(
            "relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-2 focus:ring-offset-floor-panel",
            provider.enabled ? "bg-floor-highlight" : "bg-floor-accent"
          )}
          aria-label={`${provider.enabled ? "Disable" : "Enable"} ${meta.name}`}
          role="switch"
          aria-checked={provider.enabled}
        >
          <span
            className={cn(
              "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
              provider.enabled && "translate-x-6"
            )}
          />
        </button>
      </div>

      {/* Configuration Section */}
      {provider.enabled && (
        <div className="space-y-3 pt-3 border-t border-floor-accent">
          {/* [AC3] API Key Input (masked) */}
          {meta.requiresApiKey && (
            <div>
              <label className="block text-xs font-medium text-floor-muted mb-1.5">
                <Key className="w-3 h-3 inline mr-1" />
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={provider.apiKey || ""}
                  onChange={(e) =>
                    onUpdate(provider.id, { apiKey: e.target.value })
                  }
                  placeholder="Enter your API key"
                  className="w-full pr-10 px-3 py-2 bg-floor-bg border border-floor-accent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:border-transparent font-mono"
                  autoComplete="off"
                  data-testid={`api-key-input-${provider.id}`}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-floor-muted hover:text-floor-text transition-colors"
                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Base URL (for providers that support custom endpoints) */}
          {meta.defaultBaseUrl && (
            <div>
              <label className="block text-xs font-medium text-floor-muted mb-1.5">
                <Globe className="w-3 h-3 inline mr-1" />
                Base URL
              </label>
              <input
                type="url"
                value={provider.baseUrl || meta.defaultBaseUrl}
                onChange={(e) =>
                  onUpdate(provider.id, { baseUrl: e.target.value })
                }
                placeholder={meta.defaultBaseUrl}
                className="w-full px-3 py-2 bg-floor-bg border border-floor-accent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:border-transparent font-mono"
                data-testid={`base-url-input-${provider.id}`}
              />
            </div>
          )}

          {/* [AC6] Model Selection */}
          <div className="relative">
            <label className="block text-xs font-medium text-floor-muted mb-1.5">
              <Settings className="w-3 h-3 inline mr-1" />
              Default Model
            </label>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 bg-floor-bg border border-floor-accent rounded-lg hover:border-floor-highlight transition-colors text-sm"
              aria-expanded={showModelDropdown}
              aria-haspopup="listbox"
              data-testid={`model-select-${provider.id}`}
            >
              <span className="font-mono">{selectedModel.name}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-floor-muted transition-transform",
                  showModelDropdown && "rotate-180"
                )}
              />
            </button>

            {showModelDropdown && (
              <div
                className="absolute top-full left-0 right-0 mt-1 z-10 bg-floor-panel border border-floor-accent rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto"
                role="listbox"
              >
                {meta.models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-floor-accent flex items-center justify-between",
                      provider.defaultModel === model.id && "bg-floor-accent"
                    )}
                    role="option"
                    aria-selected={provider.defaultModel === model.id}
                  >
                    <span className="font-mono">{model.name}</span>
                    {provider.defaultModel === model.id && (
                      <CheckCircle className="w-4 h-4 text-floor-highlight" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-2 pt-2">
            {/* [AC4] Test Connection Button */}
            <button
              onClick={handleTestConnection}
              disabled={
                connectionStatus === "testing" ||
                (meta.requiresApiKey && !provider.apiKey)
              }
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                connectionStatus === "testing" &&
                  "bg-floor-accent text-floor-muted cursor-wait",
                connectionStatus === "success" &&
                  "bg-green-500/20 text-green-400",
                connectionStatus === "error" && "bg-red-500/20 text-red-400",
                connectionStatus === "idle" &&
                  "bg-floor-accent text-floor-text hover:bg-floor-highlight hover:text-white"
              )}
              data-testid={`test-connection-${provider.id}`}
            >
              {connectionStatus === "testing" && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              )}
              {connectionStatus === "success" && (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Connected
                </>
              )}
              {connectionStatus === "error" && (
                <>
                  <XCircle className="w-4 h-4" />
                  Failed
                </>
              )}
              {connectionStatus === "idle" && (
                <>
                  <Zap className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </button>

            {/* [AC5] Delete Provider Button */}
            <button
              onClick={() => onDelete(provider.id)}
              className="p-2 text-floor-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              aria-label={`Delete ${meta.name} configuration`}
              data-testid={`delete-provider-${provider.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className="text-xs text-red-400 mt-1">{errorMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Add Provider Form
 */
interface AddProviderFormProps {
  existingProviders: ProviderId[];
  onAdd: (providerId: ProviderId) => void;
  onCancel: () => void;
}

function AddProviderForm({
  existingProviders,
  onAdd,
  onCancel,
}: AddProviderFormProps) {
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | null>(
    null
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const availableProviders = PROVIDER_METADATA.filter(
    (p) => !existingProviders.includes(p.id)
  );

  const handleAdd = useCallback(() => {
    if (selectedProvider) {
      onAdd(selectedProvider);
    }
  }, [selectedProvider, onAdd]);

  if (availableProviders.length === 0) {
    return (
      <div className="p-4 bg-floor-bg border border-floor-accent rounded-lg text-center">
        <p className="text-sm text-floor-muted">
          All providers have been configured.
        </p>
        <button
          onClick={onCancel}
          className="mt-2 text-sm text-floor-highlight hover:underline"
        >
          Close
        </button>
      </div>
    );
  }

  const selected = PROVIDER_METADATA.find((p) => p.id === selectedProvider);

  return (
    <div
      className="p-4 bg-floor-panel border border-floor-highlight/50 rounded-lg space-y-3"
      data-testid="add-provider-form"
    >
      <h3 className="font-semibold text-floor-text">Add Provider</h3>

      {/* Provider Selection */}
      <div className="relative">
        <label className="block text-xs font-medium text-floor-muted mb-1.5">
          Select Provider
        </label>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between px-3 py-2 bg-floor-bg border border-floor-accent rounded-lg hover:border-floor-highlight transition-colors text-sm"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
        >
          <span>{selected?.name || "Choose a provider..."}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-floor-muted transition-transform",
              showDropdown && "rotate-180"
            )}
          />
        </button>

        {showDropdown && (
          <div
            className="absolute top-full left-0 right-0 mt-1 z-10 bg-floor-panel border border-floor-accent rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto"
            role="listbox"
          >
            {availableProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  setSelectedProvider(provider.id);
                  setShowDropdown(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left hover:bg-floor-accent",
                  selectedProvider === provider.id && "bg-floor-accent"
                )}
                role="option"
                aria-selected={selectedProvider === provider.id}
              >
                <div className="font-medium text-sm">{provider.name}</div>
                <div className="text-xs text-floor-muted">
                  {provider.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={handleAdd}
          disabled={!selectedProvider}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            selectedProvider
              ? "bg-floor-highlight text-white hover:bg-opacity-90"
              : "bg-floor-accent text-floor-muted cursor-not-allowed"
          )}
        >
          <Plus className="w-4 h-4" />
          Add Provider
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 text-sm text-floor-muted hover:text-floor-text transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * ProviderConfig Component
 *
 * UI for managing LLM provider settings including:
 * - [AC1] List configured providers
 * - [AC2] Add provider form
 * - [AC3] API key input (masked)
 * - [AC4] Test connection button with result
 * - [AC5] Delete provider button
 * - [AC6] Model selection per provider
 */
export default function ProviderConfig() {
  const providers = useProviders();
  const updateProvider = useSettingsStore((state) => state.updateProvider);
  const [showAddForm, setShowAddForm] = useState(false);

  // Handle provider update
  const handleUpdate = useCallback(
    (id: ProviderId, updates: Partial<StoredProviderConfig>) => {
      updateProvider(id, updates);
    },
    [updateProvider]
  );

  // Handle provider deletion (disable and clear config)
  const handleDelete = useCallback(
    (id: ProviderId) => {
      const meta = PROVIDER_METADATA.find((p) => p.id === id);
      if (!meta) return;

      updateProvider(id, {
        enabled: false,
        apiKey: "",
        defaultModel: meta.models[0]?.id || "",
      });
    },
    [updateProvider]
  );

  // Handle adding a new provider (enable it)
  const handleAdd = useCallback(
    (id: ProviderId) => {
      const meta = PROVIDER_METADATA.find((p) => p.id === id);
      if (!meta) return;

      updateProvider(id, {
        enabled: true,
        defaultModel: meta.models[0]?.id || "",
        baseUrl: meta.defaultBaseUrl,
      });
      setShowAddForm(false);
    },
    [updateProvider]
  );

  // Test connection handler
  const handleTestConnection = useCallback(
    async (id: ProviderId): Promise<boolean> => {
      // Simulate connection test
      // In a real implementation, this would call an API endpoint
      // that tests the provider connection
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const provider = providers.find((p) => p.id === id);
      if (!provider) return false;

      // For providers that require API keys, check if one is set
      const meta = PROVIDER_METADATA.find((p) => p.id === id);
      if (meta?.requiresApiKey && !provider.apiKey) {
        return false;
      }

      // Simulate 80% success rate for demo
      return Math.random() > 0.2;
    },
    [providers]
  );

  // Get enabled providers for listing
  const enabledProviders = providers.filter((p) => p.enabled);
  const disabledProviders = providers.filter((p) => !p.enabled);

  return (
    <div className="space-y-6" data-testid="provider-config">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-floor-text">
            LLM Providers
          </h2>
          <p className="text-sm text-floor-muted mt-1">
            Configure your AI model providers and API keys
          </p>
        </div>

        {/* [AC2] Add Provider Button */}
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-floor-highlight text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
            data-testid="add-provider-button"
          >
            <Plus className="w-4 h-4" />
            Add Provider
          </button>
        )}
      </div>

      {/* [AC2] Add Provider Form */}
      {showAddForm && (
        <AddProviderForm
          existingProviders={enabledProviders.map((p) => p.id)}
          onAdd={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* [AC1] Enabled Providers List */}
      {enabledProviders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-floor-muted uppercase tracking-wide">
            Active Providers ({enabledProviders.length})
          </h3>
          <div className="space-y-3">
            {enabledProviders.map((provider) => {
              const meta = PROVIDER_METADATA.find((p) => p.id === provider.id);
              if (!meta) return null;

              return (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  meta={meta}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onTest={handleTestConnection}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Disabled Providers (Collapsed) */}
      {disabledProviders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-floor-muted uppercase tracking-wide">
            Available Providers ({disabledProviders.length})
          </h3>
          <div className="space-y-3">
            {disabledProviders.map((provider) => {
              const meta = PROVIDER_METADATA.find((p) => p.id === provider.id);
              if (!meta) return null;

              return (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  meta={meta}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onTest={handleTestConnection}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {providers.length === 0 && (
        <div className="text-center py-12 bg-floor-bg rounded-lg border border-floor-accent">
          <Cpu className="w-12 h-12 mx-auto text-floor-muted mb-4" />
          <h3 className="text-lg font-medium text-floor-text mb-2">
            No Providers Configured
          </h3>
          <p className="text-sm text-floor-muted mb-4">
            Add an LLM provider to start using AI agents
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-floor-highlight text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Your First Provider
          </button>
        </div>
      )}
    </div>
  );
}

export { PROVIDER_METADATA };
export type { ProviderMeta, ConnectionStatus };
