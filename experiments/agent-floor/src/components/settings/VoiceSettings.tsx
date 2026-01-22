"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Speaker,
  Play,
  Loader2,
  ChevronDown,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSettingsStore } from "@/lib/store/settings-store";
import {
  ROLE_VOICE_MAPPING,
  getVoiceForRole,
  type VoiceInfo,
} from "@/lib/voice/elevenlabs";
import type { AgentRole } from "@/types/agent";

/**
 * Voice metadata for display in the UI
 */
interface VoiceOption {
  id: string;
  name: string;
  description: string;
}

/**
 * Default ElevenLabs voices with display names
 * These map to the voice IDs used in ROLE_VOICE_MAPPING
 */
const VOICE_OPTIONS: VoiceOption[] = [
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", description: "Professional, clear" },
  { id: "VR6AewLTigWG4xSOukaG", name: "Arnold", description: "Deep, thoughtful" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", description: "Energetic, modern" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", description: "Calm, reliable" },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", description: "Precise, analytical" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", description: "Efficient, technical" },
  { id: "yoZ06aMxZJJ28mfd3POQ", name: "Sam", description: "Sharp, data-focused" },
  { id: "jBpfuIE2acCO8z3wKNLl", name: "Gigi", description: "Mathematical, precise" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", description: "Cautious, measured" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Quick, confident" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", description: "Formal, careful" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte", description: "Expressive, articulate" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", description: "Creative, aesthetic" },
  { id: "g5CIjZEefAph4nQFvHAz", name: "Ethan", description: "Critical, thoughtful" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", description: "Precise, helpful" },
  { id: "t0jbNlBVZ17f02VDIeMI", name: "Clyde", description: "Energetic, visionary" },
];

/**
 * Agent role display names
 */
const ROLE_DISPLAY_NAMES: Record<AgentRole, string> = {
  "project-manager": "Project Manager",
  architect: "Architect",
  "frontend-engineer": "Frontend Engineer",
  "backend-engineer": "Backend Engineer",
  "qa-engineer": "QA Engineer",
  "devops-engineer": "DevOps Engineer",
  analyst: "Analyst",
  quant: "Quant",
  "risk-manager": "Risk Manager",
  trader: "Trader",
  compliance: "Compliance",
  writer: "Writer",
  designer: "Designer",
  reviewer: "Reviewer",
  editor: "Editor",
  producer: "Producer",
};

/**
 * Preview status type
 */
type PreviewStatus = "idle" | "loading" | "playing";

/**
 * Agent voice configuration stored in settings
 */
interface AgentVoiceConfig {
  role: AgentRole;
  voiceId: string;
}

/**
 * Extended settings store interface for voice settings
 */
interface VoiceSettingsExtension {
  agentVoices: AgentVoiceConfig[];
  setAgentVoice: (role: AgentRole, voiceId: string) => void;
}

/**
 * Hook to get and set agent voice configurations
 * Uses localStorage directly for now since the main store doesn't have this yet
 */
function useAgentVoices() {
  const [agentVoices, setAgentVoices] = useState<Record<AgentRole, string>>(() => {
    // Initialize with defaults from ROLE_VOICE_MAPPING
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("agent-floor-voice-settings");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Fall through to default
        }
      }
    }
    return { ...ROLE_VOICE_MAPPING };
  });

  const setAgentVoice = useCallback((role: AgentRole, voiceId: string) => {
    setAgentVoices((prev) => {
      const next = { ...prev, [role]: voiceId };
      if (typeof window !== "undefined") {
        localStorage.setItem("agent-floor-voice-settings", JSON.stringify(next));
      }
      return next;
    });
  }, []);

  return { agentVoices, setAgentVoice };
}

/**
 * Voice selector component for a single agent role
 */
interface AgentVoiceSelectorProps {
  role: AgentRole;
  voiceId: string;
  onVoiceChange: (voiceId: string) => void;
  onPreview: (voiceId: string) => void;
  previewStatus: PreviewStatus;
  previewingVoice: string | null;
  disabled?: boolean;
}

function AgentVoiceSelector({
  role,
  voiceId,
  onVoiceChange,
  onPreview,
  previewStatus,
  previewingVoice,
  disabled,
}: AgentVoiceSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedVoice = VOICE_OPTIONS.find((v) => v.id === voiceId) || VOICE_OPTIONS[0];
  const isPreviewingThis = previewingVoice === voiceId && previewStatus !== "idle";

  return (
    <div
      className="flex items-center justify-between gap-3 p-3 bg-floor-bg rounded-lg"
      data-testid={`agent-voice-${role}`}
    >
      {/* Agent Info */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-8 h-8 rounded-full bg-floor-accent flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-floor-muted" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-floor-text truncate">
            {ROLE_DISPLAY_NAMES[role]}
          </p>
        </div>
      </div>

      {/* Voice Selection & Preview */}
      <div className="flex items-center gap-2">
        {/* Voice Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => !disabled && setShowDropdown(!showDropdown)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-colors min-w-[140px]",
              disabled
                ? "bg-floor-bg border-floor-accent text-floor-muted cursor-not-allowed"
                : "bg-floor-panel border-floor-accent hover:border-floor-highlight"
            )}
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
          >
            <span className="truncate">{selectedVoice.name}</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-floor-muted flex-shrink-0 transition-transform",
                showDropdown && "rotate-180"
              )}
            />
          </button>

          {showDropdown && (
            <div
              className="absolute top-full right-0 mt-1 z-20 w-56 bg-floor-panel border border-floor-accent rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto"
              role="listbox"
            >
              {VOICE_OPTIONS.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => {
                    onVoiceChange(voice.id);
                    setShowDropdown(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-floor-accent flex flex-col",
                    voiceId === voice.id && "bg-floor-accent"
                  )}
                  role="option"
                  aria-selected={voiceId === voice.id}
                >
                  <span className="font-medium">{voice.name}</span>
                  <span className="text-xs text-floor-muted">{voice.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* [AC2] Preview Voice Button */}
        <button
          onClick={() => onPreview(voiceId)}
          disabled={disabled || isPreviewingThis}
          className={cn(
            "p-2 rounded-lg transition-colors",
            disabled
              ? "text-floor-muted cursor-not-allowed"
              : isPreviewingThis
              ? "bg-floor-highlight/20 text-floor-highlight"
              : "bg-floor-accent text-floor-text hover:bg-floor-highlight hover:text-white"
          )}
          aria-label={`Preview ${selectedVoice.name} voice`}
          data-testid={`preview-voice-${role}`}
        >
          {isPreviewingThis && previewStatus === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * VoiceSettings Component
 *
 * UI for configuring voice settings per agent:
 * - [AC1] Voice selection per agent
 * - [AC2] Preview voice button
 * - [AC3] Volume slider
 * - [AC4] Mute toggle
 * - [AC5] Enable/disable voice globally
 *
 * @see PRD-018: Voice Synthesis (ElevenLabs)
 */
export default function VoiceSettings() {
  const voiceEnabled = useSettingsStore((state) => state.ui.voiceEnabled);
  const soundEnabled = useSettingsStore((state) => state.ui.soundEnabled);
  const volume = useSettingsStore((state) => state.ui.volume);
  const setVoiceEnabled = useSettingsStore((state) => state.setVoiceEnabled);
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);
  const setVolume = useSettingsStore((state) => state.setVolume);

  // Agent voice configurations
  const { agentVoices, setAgentVoice } = useAgentVoices();

  // Preview state
  const [previewStatus, setPreviewStatus] = useState<PreviewStatus>("idle");
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mute state (separate from volume to allow quick toggle)
  const [isMuted, setIsMuted] = useState(false);

  // Effective volume (0 when muted)
  const effectiveVolume = isMuted ? 0 : volume;
  const volumePercent = Math.round(volume * 100);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      // Unmute when adjusting volume
      if (isMuted && newVolume > 0) {
        setIsMuted(false);
      }
    },
    [setVolume, isMuted]
  );

  // [AC4] Mute toggle handler
  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // [AC2] Preview voice handler
  const handlePreviewVoice = useCallback(
    async (voiceId: string) => {
      // Stop any current preview
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setPreviewingVoice(voiceId);
      setPreviewStatus("loading");

      try {
        // Use ElevenLabs preview URL pattern
        // In production, this would call the ElevenLabs API
        // For now, simulate with a sample text
        const voice = VOICE_OPTIONS.find((v) => v.id === voiceId);
        const sampleText = `Hello, I'm ${voice?.name || "your AI assistant"}. This is a preview of my voice.`;

        // Check if we have an API key configured
        const apiKey = localStorage.getItem("elevenlabs-api-key");

        if (apiKey) {
          // Real API call
          const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xi-api-key": apiKey,
              },
              body: JSON.stringify({
                text: sampleText,
                model_id: "eleven_multilingual_v2",
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to generate preview");
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);

          const audio = new Audio(audioUrl);
          audio.volume = effectiveVolume;
          audioRef.current = audio;

          audio.onended = () => {
            setPreviewStatus("idle");
            setPreviewingVoice(null);
            URL.revokeObjectURL(audioUrl);
          };

          audio.onerror = () => {
            setPreviewStatus("idle");
            setPreviewingVoice(null);
            URL.revokeObjectURL(audioUrl);
          };

          setPreviewStatus("playing");
          await audio.play();
        } else {
          // Simulate preview without API key (for demo purposes)
          // Shows a loading state briefly then completes
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setPreviewStatus("playing");
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setPreviewStatus("idle");
          setPreviewingVoice(null);
        }
      } catch (error) {
        console.error("[VoiceSettings] Preview failed:", error);
        setPreviewStatus("idle");
        setPreviewingVoice(null);
      }
    },
    [effectiveVolume]
  );

  // Update audio volume when volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Get roles to display (only common team roles)
  const displayRoles: AgentRole[] = [
    "project-manager",
    "architect",
    "frontend-engineer",
    "backend-engineer",
    "qa-engineer",
  ];

  return (
    <div className="space-y-6" data-testid="voice-settings">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-floor-text flex items-center gap-2">
          <Speaker className="w-5 h-5 text-floor-highlight" />
          Voice & Audio
        </h2>
        <p className="text-sm text-floor-muted mt-1">
          Configure voice synthesis and audio feedback
        </p>
      </div>

      {/* Settings Cards */}
      <div className="space-y-4">
        {/* [AC5] Voice Synthesis Toggle - Enable/disable voice globally */}
        <div
          className={cn(
            "p-4 rounded-lg border transition-all",
            voiceEnabled
              ? "bg-floor-panel border-floor-highlight/50"
              : "bg-floor-bg border-floor-accent"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  voiceEnabled ? "bg-floor-highlight/20" : "bg-floor-accent"
                )}
              >
                {voiceEnabled ? (
                  <Mic className="w-5 h-5 text-floor-highlight" />
                ) : (
                  <MicOff className="w-5 h-5 text-floor-muted" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-floor-text">Voice Synthesis</h3>
                <p className="text-xs text-floor-muted">
                  Agents speak messages aloud using ElevenLabs
                </p>
              </div>
            </div>

            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-2 focus:ring-offset-floor-panel",
                voiceEnabled ? "bg-floor-highlight" : "bg-floor-accent"
              )}
              role="switch"
              aria-checked={voiceEnabled}
              aria-label="Enable voice synthesis"
              data-testid="voice-toggle"
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                  voiceEnabled && "translate-x-6"
                )}
              />
            </button>
          </div>

          {voiceEnabled && (
            <div className="mt-4 pt-4 border-t border-floor-accent">
              <p className="text-xs text-floor-muted">
                Requires ElevenLabs API key in Provider settings.
                Voice IDs are assigned per agent below.
              </p>
            </div>
          )}
        </div>

        {/* [AC1] Voice Selection Per Agent */}
        {voiceEnabled && (
          <div className="p-4 rounded-lg border bg-floor-panel border-floor-accent">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-floor-muted" />
              <h3 className="font-semibold text-floor-text">Agent Voices</h3>
            </div>
            <p className="text-xs text-floor-muted mb-4">
              Select a unique voice for each agent role. Click preview to hear samples.
            </p>

            <div className="space-y-2">
              {displayRoles.map((role) => (
                <AgentVoiceSelector
                  key={role}
                  role={role}
                  voiceId={agentVoices[role] || getVoiceForRole(role)}
                  onVoiceChange={(voiceId) => setAgentVoice(role, voiceId)}
                  onPreview={handlePreviewVoice}
                  previewStatus={previewStatus}
                  previewingVoice={previewingVoice}
                  disabled={!voiceEnabled}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sound Effects Toggle */}
        <div
          className={cn(
            "p-4 rounded-lg border transition-all",
            soundEnabled
              ? "bg-floor-panel border-floor-highlight/50"
              : "bg-floor-bg border-floor-accent"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  soundEnabled ? "bg-floor-highlight/20" : "bg-floor-accent"
                )}
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-floor-highlight" />
                ) : (
                  <VolumeX className="w-5 h-5 text-floor-muted" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-floor-text">Sound Effects</h3>
                <p className="text-xs text-floor-muted">
                  Play sounds for notifications and interactions
                </p>
              </div>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-2 focus:ring-offset-floor-panel",
                soundEnabled ? "bg-floor-highlight" : "bg-floor-accent"
              )}
              role="switch"
              aria-checked={soundEnabled}
              aria-label="Enable sound effects"
              data-testid="sound-toggle"
            >
              <span
                className={cn(
                  "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                  soundEnabled && "translate-x-6"
                )}
              />
            </button>
          </div>
        </div>

        {/* [AC3] Volume Slider & [AC4] Mute Toggle */}
        <div className="p-4 rounded-lg border bg-floor-panel border-floor-accent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-floor-accent flex items-center justify-center">
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-floor-muted" />
                ) : (
                  <Volume2 className="w-5 h-5 text-floor-muted" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-floor-text">Master Volume</h3>
                <p className="text-xs text-floor-muted">
                  Control overall audio level
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-mono",
                  isMuted ? "text-floor-muted" : "text-floor-highlight"
                )}
              >
                {isMuted ? "Muted" : `${volumePercent}%`}
              </span>
              {/* [AC4] Mute Toggle Button */}
              <button
                onClick={handleMuteToggle}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  isMuted
                    ? "bg-red-500/20 text-red-400"
                    : "bg-floor-accent text-floor-muted hover:text-floor-text"
                )}
                aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                data-testid="mute-toggle"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* [AC3] Volume Slider */}
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-floor-muted flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              disabled={isMuted}
              className={cn(
                "flex-1 h-2 rounded-lg appearance-none cursor-pointer",
                isMuted
                  ? "bg-floor-accent/50 cursor-not-allowed"
                  : "bg-floor-accent accent-floor-highlight"
              )}
              aria-label="Volume level"
              data-testid="volume-slider"
            />
            <Volume2 className="w-4 h-4 text-floor-muted flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
