/**
 * Voice Module
 *
 * Text-to-speech capabilities for agent communication.
 *
 * @see PRD-018: Voice Synthesis (ElevenLabs)
 */

export {
  // Client class
  ElevenLabsClient,
  // Factory function
  createElevenLabsClient,
  // Voice mapping
  ROLE_VOICE_MAPPING,
  getVoiceForRole,
  // Types
  type ElevenLabsOptions,
  type VoiceSettings,
  type TextToSpeechOptions,
  type QueuedAudio,
  type VoiceInfo,
  type AudioQueueCallback,
} from "./elevenlabs";

export { default } from "./elevenlabs";
