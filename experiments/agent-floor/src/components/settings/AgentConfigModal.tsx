"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  User,
  Cpu,
  MessageSquare,
  ChevronDown,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Agent } from "@/types/agent";
import type { ProviderId } from "@/types/provider";

interface AgentConfigModalProps {
  agent: Agent;
  onClose: () => void;
  onSave: (agentId: string, updates: AgentConfigUpdates) => void;
}

export interface AgentConfigUpdates {
  name?: string;
  provider?: string;
  model?: string;
  systemPrompt?: string;
}

type ProviderOption = {
  id: ProviderId;
  name: string;
  models: string[];
};

const providerOptions: ProviderOption[] = [
  {
    id: "claude-code",
    name: "Claude Code CLI",
    models: ["opus", "sonnet", "haiku"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: ["claude-opus-4-20250514", "claude-sonnet-4-20250514", "claude-haiku-3-5-20241022"],
  },
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1-preview", "o1-mini"],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    models: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    models: ["anthropic/claude-sonnet-4", "openai/gpt-4o", "meta-llama/llama-3.3-70b"],
  },
  {
    id: "xai",
    name: "xAI",
    models: ["grok-2", "grok-beta"],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    models: ["llama3.2", "codellama", "mistral", "mixtral"],
  },
];

export default function AgentConfigModal({
  agent,
  onClose,
  onSave,
}: AgentConfigModalProps) {
  const [name, setName] = useState(agent.name);
  const [provider, setProvider] = useState(agent.provider);
  const [model, setModel] = useState(agent.model);
  const [systemPrompt, setSystemPrompt] = useState(agent.systemPrompt);

  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Get current provider config
  const currentProvider = providerOptions.find((p) => p.id === provider) || providerOptions[0];

  // Track changes
  useEffect(() => {
    const changed =
      name !== agent.name ||
      provider !== agent.provider ||
      model !== agent.model ||
      systemPrompt !== agent.systemPrompt;
    setHasChanges(changed);
  }, [name, provider, model, systemPrompt, agent]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (showProviderDropdown || showModelDropdown) {
          setShowProviderDropdown(false);
          setShowModelDropdown(false);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showProviderDropdown, showModelDropdown, onClose]);

  // Focus name input on mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // Handle provider change - reset model to first available
  const handleProviderChange = useCallback((newProviderId: string) => {
    setProvider(newProviderId);
    const newProvider = providerOptions.find((p) => p.id === newProviderId);
    if (newProvider && newProvider.models.length > 0) {
      setModel(newProvider.models[0]);
    }
    setShowProviderDropdown(false);
  }, []);

  const handleModelChange = useCallback((newModel: string) => {
    setModel(newModel);
    setShowModelDropdown(false);
  }, []);

  const handleSave = useCallback(() => {
    const updates: AgentConfigUpdates = {};

    if (name !== agent.name) updates.name = name;
    if (provider !== agent.provider) updates.provider = provider;
    if (model !== agent.model) updates.model = model;
    if (systemPrompt !== agent.systemPrompt) updates.systemPrompt = systemPrompt;

    if (Object.keys(updates).length > 0) {
      onSave(agent.id, updates);
    }
    onClose();
  }, [name, provider, model, systemPrompt, agent, onSave, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden bg-floor-panel border border-floor-accent rounded-xl shadow-2xl"
        role="dialog"
        aria-labelledby="agent-config-modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-floor-accent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-floor-accent flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 id="agent-config-modal-title" className="text-lg font-semibold">
                Configure Agent
              </h2>
              <p className="text-xs text-floor-muted capitalize">
                {agent.role.replace("-", " ")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-floor-muted hover:text-floor-text hover:bg-floor-accent rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Agent Name */}
          <div>
            <label
              htmlFor="agent-name"
              className="block text-sm font-medium text-floor-muted mb-1.5"
            >
              <User className="w-3.5 h-3.5 inline mr-1.5" />
              Agent Name
            </label>
            <input
              ref={nameInputRef}
              id="agent-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-floor-bg border border-floor-accent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:border-transparent"
              placeholder="Enter agent name"
              aria-label="Edit agent name"
            />
          </div>

          {/* Provider Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-floor-muted mb-1.5">
              <Cpu className="w-3.5 h-3.5 inline mr-1.5" />
              Provider
            </label>
            <button
              onClick={() => {
                setShowProviderDropdown(!showProviderDropdown);
                setShowModelDropdown(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-floor-bg border border-floor-accent rounded-lg hover:border-floor-highlight transition-colors text-sm"
              aria-label="Select provider"
              aria-expanded={showProviderDropdown}
              aria-haspopup="listbox"
            >
              <span>{currentProvider.name}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-floor-muted transition-transform",
                  showProviderDropdown && "rotate-180"
                )}
              />
            </button>

            {showProviderDropdown && (
              <div
                className="absolute top-full left-0 right-0 mt-1 z-10 bg-floor-panel border border-floor-accent rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto"
                role="listbox"
                aria-label="Provider options"
              >
                {providerOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleProviderChange(option.id)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-floor-accent flex items-center justify-between",
                      provider === option.id && "bg-floor-accent"
                    )}
                    role="option"
                    aria-selected={provider === option.id}
                  >
                    <span>{option.name}</span>
                    {provider === option.id && (
                      <span className="text-floor-highlight">Selected</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Model Dropdown */}
          <div className="relative">
            <label className="block text-sm font-medium text-floor-muted mb-1.5">
              <Cpu className="w-3.5 h-3.5 inline mr-1.5" />
              Model
            </label>
            <button
              onClick={() => {
                setShowModelDropdown(!showModelDropdown);
                setShowProviderDropdown(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 bg-floor-bg border border-floor-accent rounded-lg hover:border-floor-highlight transition-colors text-sm"
              aria-label="Select model"
              aria-expanded={showModelDropdown}
              aria-haspopup="listbox"
            >
              <span className="font-mono">{model}</span>
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
                aria-label="Model options"
              >
                {currentProvider.models.map((modelOption) => (
                  <button
                    key={modelOption}
                    onClick={() => handleModelChange(modelOption)}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-floor-accent flex items-center justify-between font-mono",
                      model === modelOption && "bg-floor-accent"
                    )}
                    role="option"
                    aria-selected={model === modelOption}
                  >
                    <span>{modelOption}</span>
                    {model === modelOption && (
                      <span className="text-floor-highlight font-sans">Selected</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* System Prompt */}
          <div>
            <label
              htmlFor="system-prompt"
              className="block text-sm font-medium text-floor-muted mb-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
              System Prompt
            </label>
            <textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={6}
              className="w-full bg-floor-bg border border-floor-accent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:border-transparent resize-none font-mono"
              placeholder="Enter the system prompt for this agent..."
              aria-label="Edit system prompt"
            />
            <p className="mt-1 text-xs text-floor-muted">
              Define the agent&apos;s personality, expertise, and behavior.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-floor-accent bg-floor-bg">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-floor-muted hover:text-floor-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              hasChanges
                ? "bg-floor-highlight text-white hover:bg-opacity-90"
                : "bg-floor-accent text-floor-muted cursor-not-allowed"
            )}
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export type { AgentConfigModalProps };
