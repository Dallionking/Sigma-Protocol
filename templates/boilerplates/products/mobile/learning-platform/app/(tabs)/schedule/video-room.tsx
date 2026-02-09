import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/tokens";
import { TutorAvatar } from "@/components/TutorAvatar";

export default function VideoRoomScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const handleEndCall = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.replace("/schedule/video-ended");
  }, [router]);

  const toggleMute = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsVideoOff(!isVideoOff);
  }, [isVideoOff]);

  return (
    <View style={styles.container}>
      {/* Remote Video (AI Tutor) - Background/Main view */}
      <View style={styles.remoteVideo}>
        <View style={styles.tutorContainer}>
          <TutorAvatar size={160} />
          <Text style={styles.remoteName}>AI Tutor</Text>
          <View style={styles.remoteBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>
      </View>

      {/* Local Video (You) - Picture in picture */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 400, delay: 500 }}
        style={[styles.localVideo, { top: insets.top + 20 }]}
      >
        <View style={styles.localPreview}>
          {isVideoOff ? (
            <View style={styles.videoOffPlaceholder}>
              <User size={32} color={colors.text.muted} />
            </View>
          ) : (
            <View style={styles.videoOnPlaceholder}>
              <View style={styles.youIndicator}>
                <Text style={styles.youText}>You</Text>
              </View>
            </View>
          )}
        </View>
      </MotiView>

      {/* Controls Overlay */}
      <View style={[styles.controlsOverlay, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.controlsRow}>
          <Pressable
            onPress={toggleMute}
            style={[styles.controlButton, isMuted && styles.controlButtonOff]}
          >
            {isMuted ? (
              <MicOff size={24} color="#FFFFFF" />
            ) : (
              <Mic size={24} color="#FFFFFF" />
            )}
          </Pressable>

          <Pressable
            onPress={toggleVideo}
            style={[styles.controlButton, isVideoOff && styles.controlButtonOff]}
          >
            {isVideoOff ? (
              <VideoOff size={24} color="#FFFFFF" />
            ) : (
              <Video size={24} color="#FFFFFF" />
            )}
          </Pressable>

          <Pressable style={styles.controlButton}>
            <MessageSquare size={24} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={handleEndCall}
            style={[styles.controlButton, styles.endCallButton]}
          >
            <PhoneOff size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  remoteVideo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg[900],
  },
  tutorContainer: {
    alignItems: "center",
    gap: 20,
  },
  remoteName: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: "#FFFFFF",
  },
  remoteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  liveText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  localVideo: {
    position: "absolute",
    right: 20,
    width: 120,
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "#111",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  localPreview: {
    flex: 1,
  },
  videoOffPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  videoOnPlaceholder: {
    flex: 1,
    backgroundColor: "#222",
  },
  youIndicator: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 10,
    color: "#FFFFFF",
  },
  controlsOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  controlButtonOff: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  endCallButton: {
    backgroundColor: colors.error,
    borderColor: colors.error,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});

