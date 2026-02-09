/**
 * LiveKit Video Call Type Stubs
 *
 * Type definitions for video call integration.
 * Install @livekit/react-native to implement.
 *
 * @see https://docs.livekit.io/realtime/quickstarts/react-native/
 */

export interface VideoRoomConfig {
  serverUrl: string;
  token: string;
  roomName: string;
}

export interface VideoParticipant {
  sid: string;
  identity: string;
  name: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isLocal: boolean;
}

export interface VideoRoomState {
  isConnected: boolean;
  isConnecting: boolean;
  participants: VideoParticipant[];
  localParticipant: VideoParticipant | null;
  error: string | null;
}

export interface VideoRoomActions {
  connect: (config: VideoRoomConfig) => Promise<void>;
  disconnect: () => Promise<void>;
  toggleMicrophone: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => void;
}

export type VideoQuality = "low" | "medium" | "high";

export interface VideoSettings {
  quality: VideoQuality;
  mirrorLocalVideo: boolean;
  noiseCancellation: boolean;
}
