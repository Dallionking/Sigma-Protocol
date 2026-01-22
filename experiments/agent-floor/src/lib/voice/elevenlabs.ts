/**
 * ElevenLabs Voice Integration
 *
 * Text-to-speech for agent messages using ElevenLabs API.
 * Supports audio queue management, voice mapping per agent role, and streaming.
 *
 * @see PRD-018: Voice Synthesis (ElevenLabs)
 */

import type { AgentRole } from "@/types/agent";

// =============================================================================
// Constants
// =============================================================================

/** ElevenLabs API base URL */
const API_BASE_URL = "https://api.elevenlabs.io/v1";

/** Default timeout for API calls (30 seconds) */
const DEFAULT_TIMEOUT_MS = 30 * 1000;

/** Maximum retry attempts on failure */
const MAX_RETRIES = 3;

/** Base delay for exponential backoff (ms) */
const BASE_RETRY_DELAY_MS = 1000;

/** Default model for text-to-speech */
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";

/** Default output format */
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";

// =============================================================================
// Types
// =============================================================================

export interface ElevenLabsOptions {
  /** ElevenLabs API key (defaults to ELEVENLABS_API_KEY env var) */
  apiKey?: string;
  /** Custom timeout in ms */
  timeoutMs?: number;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Default model ID */
  defaultModelId?: string;
  /** Default output format */
  outputFormat?: string;
}

export interface VoiceSettings {
  /** Stability (0-1, higher = more consistent) */
  stability?: number;
  /** Similarity boost (0-1, higher = more similar to original) */
  similarityBoost?: number;
  /** Style (0-1, model-dependent) */
  style?: number;
  /** Use speaker boost for clarity */
  useSpeakerBoost?: boolean;
  /** Speed multiplier (0.5-2.0) */
  speed?: number;
}

export interface TextToSpeechOptions {
  /** Voice ID to use */
  voiceId: string;
  /** Text to convert to speech */
  text: string;
  /** Model ID (defaults to eleven_multilingual_v2) */
  modelId?: string;
  /** Language code (ISO 639-1) */
  languageCode?: string;
  /** Voice settings */
  voiceSettings?: VoiceSettings;
  /** Output format */
  outputFormat?: string;
}

export interface QueuedAudio {
  /** Unique ID for this audio item */
  id: string;
  /** Agent ID that generated this audio */
  agentId: string;
  /** Text content being spoken */
  text: string;
  /** Voice ID used */
  voiceId: string;
  /** Audio data (Uint8Array) */
  audioData: Uint8Array | null;
  /** Status */
  status: "pending" | "generating" | "ready" | "playing" | "completed" | "error";
  /** Error message if failed */
  error?: string;
  /** Timestamp when queued */
  queuedAt: number;
  /** Timestamp when started playing */
  startedAt?: number;
  /** Timestamp when completed */
  completedAt?: number;
}

export interface VoiceInfo {
  /** Voice ID */
  voiceId: string;
  /** Voice name */
  name: string;
  /** Preview URL */
  previewUrl?: string;
  /** Category */
  category?: string;
  /** Labels */
  labels?: Record<string, string>;
}

export type AudioQueueCallback = (item: QueuedAudio) => void;

// =============================================================================
// Voice Mapping by Agent Role
// =============================================================================

/**
 * Default voice IDs for each agent role.
 * These are ElevenLabs voice IDs that best match the personality of each role.
 *
 * Voice selection criteria:
 * - project-manager: Professional, clear, authoritative
 * - architect: Thoughtful, precise, technical
 * - frontend-engineer: Energetic, creative, modern
 * - backend-engineer: Calm, methodical, reliable
 * - qa-engineer: Detail-oriented, precise, analytical
 * - devops-engineer: Efficient, technical, pragmatic
 * - analyst: Sharp, data-focused, insightful
 * - quant: Mathematical, precise, analytical
 * - risk-manager: Cautious, measured, authoritative
 * - trader: Quick, decisive, confident
 * - compliance: Formal, precise, careful
 * - writer: Expressive, articulate, creative
 * - designer: Creative, visual, aesthetic
 * - reviewer: Critical, thoughtful, constructive
 * - editor: Precise, knowledgeable, helpful
 * - producer: Energetic, organized, visionary
 */
export const ROLE_VOICE_MAPPING: Record<AgentRole, string> = {
  // Dev Team
  "project-manager": "pNInz6obpgDQGcFmaJgB", // Adam - professional, clear
  architect: "VR6AewLTigWG4xSOukaG", // Arnold - deep, thoughtful
  "frontend-engineer": "EXAVITQu4vr4xnSDxMaL", // Bella - energetic, modern
  "backend-engineer": "ErXwobaYiN019PkySvjV", // Antoni - calm, reliable
  "qa-engineer": "MF3mGyEYCl7XYWbV9V6O", // Elli - precise, analytical
  "devops-engineer": "TxGEqnHWrfWFTfGW9XjX", // Josh - efficient, technical

  // Trading Floor
  analyst: "yoZ06aMxZJJ28mfd3POQ", // Sam - sharp, data-focused
  quant: "jBpfuIE2acCO8z3wKNLl", // Gigi - mathematical, precise
  "risk-manager": "AZnzlk1XvdvUeBnXmlld", // Domi - cautious, measured
  trader: "IKne3meq5aSn9XLyUdCD", // Charlie - quick, confident
  compliance: "onwK4e9ZLuTAKqWW03F9", // Daniel - formal, careful

  // Creative Studio
  writer: "XB0fDUnXU5powFXDhCwa", // Charlotte - expressive, articulate
  designer: "nPczCjzI2devNBz1zQrb", // Brian - creative, aesthetic
  reviewer: "g5CIjZEefAph4nQFvHAz", // Ethan - critical, thoughtful
  editor: "N2lVS1w4EtoT3dr4eOWO", // Callum - precise, helpful
  producer: "t0jbNlBVZ17f02VDIeMI", // Clyde - energetic, visionary
};

/**
 * Get voice ID for an agent role
 */
export function getVoiceForRole(role: AgentRole): string {
  return ROLE_VOICE_MAPPING[role] || ROLE_VOICE_MAPPING["project-manager"];
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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
  const jitter = Math.random() * 0.25 * baseDelay;
  return Math.min(baseDelay + jitter, 30000);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(status: number): boolean {
  return status === 429 || (status >= 500 && status < 600);
}

// =============================================================================
// ElevenLabs Client Class
// =============================================================================

/**
 * ElevenLabs API Client
 *
 * Handles text-to-speech conversion using the ElevenLabs API.
 * Features:
 * - Text-to-speech conversion (streaming and non-streaming)
 * - Audio queue management for sequential playback
 * - Voice mapping per agent role
 * - Automatic retry with exponential backoff
 * - Error handling and logging
 */
export class ElevenLabsClient {
  private apiKey: string;
  private timeoutMs: number;
  private maxRetries: number;
  private defaultModelId: string;
  private outputFormat: string;

  // Audio queue management
  private audioQueue: QueuedAudio[] = [];
  private isProcessingQueue: boolean = false;
  private onAudioQueued?: AudioQueueCallback;
  private onAudioStarted?: AudioQueueCallback;
  private onAudioCompleted?: AudioQueueCallback;
  private onAudioError?: AudioQueueCallback;

  constructor(options?: ElevenLabsOptions) {
    this.apiKey = options?.apiKey || process.env.ELEVENLABS_API_KEY || "";
    this.timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options?.maxRetries ?? MAX_RETRIES;
    this.defaultModelId = options?.defaultModelId ?? DEFAULT_MODEL_ID;
    this.outputFormat = options?.outputFormat ?? DEFAULT_OUTPUT_FORMAT;

    if (!this.apiKey) {
      console.warn(
        "[ElevenLabsClient] No API key provided. Set ELEVENLABS_API_KEY environment variable or pass apiKey option."
      );
    }
  }

  // ===========================================================================
  // Core Text-to-Speech Methods
  // ===========================================================================

  /**
   * Convert text to speech (non-streaming)
   *
   * @param text - Text to convert to speech
   * @param voiceId - Voice ID to use
   * @param options - Additional options
   * @returns Audio data as Uint8Array
   */
  async textToSpeech(
    text: string,
    voiceId: string,
    options?: Partial<Omit<TextToSpeechOptions, "text" | "voiceId">>
  ): Promise<Uint8Array> {
    if (!this.apiKey) {
      throw new Error("[ElevenLabsClient] API key is required for text-to-speech");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("[ElevenLabsClient] Text is required for text-to-speech");
    }

    if (!voiceId) {
      throw new Error("[ElevenLabsClient] Voice ID is required for text-to-speech");
    }

    const url = `${API_BASE_URL}/text-to-speech/${voiceId}`;
    const body: Record<string, unknown> = {
      text: text.trim(),
      model_id: options?.modelId ?? this.defaultModelId,
      output_format: options?.outputFormat ?? this.outputFormat,
    };

    // Add voice settings if provided
    if (options?.voiceSettings) {
      body.voice_settings = {
        stability: options.voiceSettings.stability ?? 0.5,
        similarity_boost: options.voiceSettings.similarityBoost ?? 0.75,
        style: options.voiceSettings.style ?? 0,
        use_speaker_boost: options.voiceSettings.useSpeakerBoost ?? true,
        speed: options.voiceSettings.speed ?? 1.0,
      };
    }

    // Add language code if provided
    if (options?.languageCode) {
      body.language_code = options.languageCode;
    }

    let lastError: Error | null = null;

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": this.apiKey,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          const error = new Error(
            `[ElevenLabsClient] API error ${response.status}: ${errorText}`
          );

          // Check if we should retry
          if (!isRetryableError(response.status) || attempt >= this.maxRetries - 1) {
            throw error;
          }

          console.warn(
            `[ElevenLabsClient] Attempt ${attempt + 1}/${this.maxRetries} failed:`,
            error.message
          );

          lastError = error;
          const delay = getBackoffDelay(attempt);
          console.log(`[ElevenLabsClient] Retrying in ${Math.round(delay)}ms...`);
          await sleep(delay);
          continue;
        }

        // Success - return audio data
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          lastError = new Error("[ElevenLabsClient] Request timed out");
        } else {
          lastError = error instanceof Error ? error : new Error(String(error));
        }

        if (attempt >= this.maxRetries - 1) {
          break;
        }

        // Network errors are retryable
        const delay = getBackoffDelay(attempt);
        console.warn(
          `[ElevenLabsClient] Attempt ${attempt + 1}/${this.maxRetries} failed:`,
          lastError.message
        );
        console.log(`[ElevenLabsClient] Retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }

    throw new Error(
      `[ElevenLabsClient] Request failed after ${this.maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Stream text-to-speech audio
   *
   * @param text - Text to convert to speech
   * @param voiceId - Voice ID to use
   * @param options - Additional options
   * @returns ReadableStream of audio chunks
   */
  async *streamTextToSpeech(
    text: string,
    voiceId: string,
    options?: Partial<Omit<TextToSpeechOptions, "text" | "voiceId">>
  ): AsyncGenerator<Uint8Array, void, unknown> {
    if (!this.apiKey) {
      throw new Error("[ElevenLabsClient] API key is required for streaming");
    }

    if (!text || text.trim().length === 0) {
      throw new Error("[ElevenLabsClient] Text is required for streaming");
    }

    const url = `${API_BASE_URL}/text-to-speech/${voiceId}/stream`;
    const body: Record<string, unknown> = {
      text: text.trim(),
      model_id: options?.modelId ?? this.defaultModelId,
      output_format: options?.outputFormat ?? this.outputFormat,
    };

    if (options?.voiceSettings) {
      body.voice_settings = {
        stability: options.voiceSettings.stability ?? 0.5,
        similarity_boost: options.voiceSettings.similarityBoost ?? 0.75,
        style: options.voiceSettings.style ?? 0,
        use_speaker_boost: options.voiceSettings.useSpeakerBoost ?? true,
        speed: options.voiceSettings.speed ?? 1.0,
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `[ElevenLabsClient] Streaming API error ${response.status}: ${errorText}`
        );
      }

      if (!response.body) {
        throw new Error("[ElevenLabsClient] No response body for streaming");
      }

      const reader = response.body.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          yield value;
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("[ElevenLabsClient] Streaming request timed out");
      }
      throw error;
    }
  }

  // ===========================================================================
  // Audio Queue Management
  // ===========================================================================

  /**
   * Set callback for when audio is queued
   */
  setOnAudioQueued(callback: AudioQueueCallback): void {
    this.onAudioQueued = callback;
  }

  /**
   * Set callback for when audio starts playing
   */
  setOnAudioStarted(callback: AudioQueueCallback): void {
    this.onAudioStarted = callback;
  }

  /**
   * Set callback for when audio completes
   */
  setOnAudioCompleted(callback: AudioQueueCallback): void {
    this.onAudioCompleted = callback;
  }

  /**
   * Set callback for audio errors
   */
  setOnAudioError(callback: AudioQueueCallback): void {
    this.onAudioError = callback;
  }

  /**
   * Add audio to the queue
   *
   * @param agentId - ID of the agent generating the audio
   * @param text - Text to convert to speech
   * @param voiceId - Voice ID to use
   * @returns Queued audio item
   */
  async enqueueAudio(
    agentId: string,
    text: string,
    voiceId: string
  ): Promise<QueuedAudio> {
    const item: QueuedAudio = {
      id: generateId(),
      agentId,
      text,
      voiceId,
      audioData: null,
      status: "pending",
      queuedAt: Date.now(),
    };

    this.audioQueue.push(item);
    this.onAudioQueued?.(item);

    // Start processing if not already running
    this.processQueue();

    return item;
  }

  /**
   * Get the current audio queue
   */
  getQueue(): QueuedAudio[] {
    return [...this.audioQueue];
  }

  /**
   * Get a specific queued audio item
   */
  getQueueItem(id: string): QueuedAudio | undefined {
    return this.audioQueue.find((item) => item.id === id);
  }

  /**
   * Clear completed items from the queue
   */
  clearCompleted(): void {
    this.audioQueue = this.audioQueue.filter(
      (item) => item.status !== "completed" && item.status !== "error"
    );
  }

  /**
   * Clear all items from the queue
   */
  clearQueue(): void {
    this.audioQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Remove a specific item from the queue
   */
  removeFromQueue(id: string): boolean {
    const index = this.audioQueue.findIndex((item) => item.id === id);
    if (index === -1) return false;

    // Don't remove items that are currently playing
    if (this.audioQueue[index].status === "playing") {
      return false;
    }

    this.audioQueue.splice(index, 1);
    return true;
  }

  /**
   * Process the audio queue
   * Generates audio for pending items and manages playback state
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    try {
      while (this.audioQueue.length > 0) {
        // Find next pending item
        const pendingIndex = this.audioQueue.findIndex(
          (item) => item.status === "pending"
        );

        if (pendingIndex === -1) {
          break;
        }

        const item = this.audioQueue[pendingIndex];
        item.status = "generating";

        try {
          // Generate audio
          const audioData = await this.textToSpeech(item.text, item.voiceId);
          item.audioData = audioData;
          item.status = "ready";

          // Mark as playing (client will handle actual playback)
          item.status = "playing";
          item.startedAt = Date.now();
          this.onAudioStarted?.(item);

          // Mark as completed immediately (playback is handled by client)
          item.status = "completed";
          item.completedAt = Date.now();
          this.onAudioCompleted?.(item);
        } catch (error) {
          item.status = "error";
          item.error =
            error instanceof Error ? error.message : "Unknown error occurred";
          item.completedAt = Date.now();
          this.onAudioError?.(item);
          console.error(
            `[ElevenLabsClient] Failed to generate audio for ${item.id}:`,
            item.error
          );
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // ===========================================================================
  // Voice Management
  // ===========================================================================

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<VoiceInfo[]> {
    if (!this.apiKey) {
      throw new Error("[ElevenLabsClient] API key is required to get voices");
    }

    const url = `${API_BASE_URL}/voices`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "xi-api-key": this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `[ElevenLabsClient] Failed to get voices: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    return (data.voices || []).map(
      (voice: {
        voice_id: string;
        name: string;
        preview_url?: string;
        category?: string;
        labels?: Record<string, string>;
      }) => ({
        voiceId: voice.voice_id,
        name: voice.name,
        previewUrl: voice.preview_url,
        category: voice.category,
        labels: voice.labels,
      })
    );
  }

  /**
   * Get information about a specific voice
   */
  async getVoice(voiceId: string): Promise<VoiceInfo> {
    if (!this.apiKey) {
      throw new Error("[ElevenLabsClient] API key is required to get voice info");
    }

    const url = `${API_BASE_URL}/voices/${voiceId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "xi-api-key": this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `[ElevenLabsClient] Failed to get voice ${voiceId}: ${response.status} ${errorText}`
      );
    }

    const voice = await response.json();
    return {
      voiceId: voice.voice_id,
      name: voice.name,
      previewUrl: voice.preview_url,
      category: voice.category,
      labels: voice.labels,
    };
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Check if the ElevenLabs API is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }

    try {
      const url = `${API_BASE_URL}/user`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "xi-api-key": this.apiKey,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get current API key status
   */
  hasApiKey(): boolean {
    return Boolean(this.apiKey);
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new ElevenLabs client instance
 *
 * @param options - Client options
 * @returns New client instance
 */
export function createElevenLabsClient(
  options?: ElevenLabsOptions
): ElevenLabsClient {
  return new ElevenLabsClient(options);
}

// =============================================================================
// Default Export
// =============================================================================

export default ElevenLabsClient;
