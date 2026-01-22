"use client";

import { useCallback } from "react";
import { Volume2, VolumeX, Mic, MicOff, Speaker } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useSettingsStore } from "@/lib/store/settings-store";

/**
 * Voice & Audio Settings Component
 *
 * Configures:
 * - Voice synthesis enable/disable (ElevenLabs TTS)
 * - Sound effects enable/disable
 * - Master volume control
 */
export default function VoiceSettings() {
  const voiceEnabled = useSettingsStore((state) => state.ui.voiceEnabled);
  const soundEnabled = useSettingsStore((state) => state.ui.soundEnabled);
  const volume = useSettingsStore((state) => state.ui.volume);
  const setVoiceEnabled = useSettingsStore((state) => state.setVoiceEnabled);
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);
  const setVolume = useSettingsStore((state) => state.setVolume);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(parseFloat(e.target.value));
    },
    [setVolume]
  );

  const volumePercent = Math.round(volume * 100);

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
        {/* Voice Synthesis Toggle */}
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
                Voice IDs are assigned per agent in team templates.
              </p>
            </div>
          )}
        </div>

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

        {/* Volume Slider */}
        <div className="p-4 rounded-lg border bg-floor-panel border-floor-accent">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-floor-accent flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-floor-muted" />
              </div>
              <div>
                <h3 className="font-semibold text-floor-text">Master Volume</h3>
                <p className="text-xs text-floor-muted">
                  Control overall audio level
                </p>
              </div>
            </div>
            <span className="text-sm font-mono text-floor-highlight">
              {volumePercent}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-floor-muted flex-shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 h-2 bg-floor-accent rounded-lg appearance-none cursor-pointer accent-floor-highlight"
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
