/**
 * Integration Configuration
 *
 * Configure external service providers for AI, speech, TTS, and video.
 * Replace placeholder values with your actual API keys and endpoints.
 */

export const integrations = {
  /** AI Chat Provider */
  ai: {
    provider: "openai" as const,
    model: "gpt-4o-mini",
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    systemPrompt: `You are a friendly and encouraging AI tutor.
    Help students learn by explaining concepts clearly,
    providing examples, and giving constructive feedback.
    Keep responses concise and conversational.`,
    maxTokens: 500,
    temperature: 0.7,
  },

  /** Speech-to-Text Provider */
  speech: {
    provider: "whisper" as const,
    apiEndpoint: "https://api.openai.com/v1/audio/transcriptions",
    model: "whisper-1",
    language: "en",
  },

  /** Text-to-Speech Provider */
  tts: {
    provider: "openai" as const,
    apiEndpoint: "https://api.openai.com/v1/audio/speech",
    model: "tts-1",
    voice: "alloy",
    speed: 1.0,
  },

  /** Video Call Provider (for live tutoring) */
  video: {
    provider: "livekit" as const,
    serverUrl: "wss://your-livekit-server.example.com",
    apiEndpoint: "https://your-api.example.com/video/token",
  },

  /** Push Notifications */
  notifications: {
    provider: "expo" as const,
  },

  /** Analytics */
  analytics: {
    provider: "none" as const,
  },
} as const;

export type AIProvider = "openai" | "anthropic" | "custom";
export type SpeechProvider = "whisper" | "deepgram" | "custom";
export type TTSProvider = "openai" | "elevenlabs" | "custom";
export type VideoProvider = "livekit" | "daily" | "agora" | "custom";
