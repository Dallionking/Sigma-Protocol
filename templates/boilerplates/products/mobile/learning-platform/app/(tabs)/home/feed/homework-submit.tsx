import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, TextInput } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Clock, CheckCircle, Mic, Send } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format, isPast } from "date-fns";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { VoiceWaveform } from "@/components/ai/VoiceWaveform";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useFeedStore } from "@/stores/feedStore";
import { colors } from "@/theme/tokens";

export default function HomeworkSubmitScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { homework, submitHomework } = useFeedStore();
  const hw = homework.find((h) => h.id === params.id);

  const [textResponse, setTextResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleRecordToggle = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(!isRecording);
  }, [isRecording]);

  const handleSubmit = useCallback(async () => {
    if (!hw || (!textResponse.trim() && !isRecording)) return;
    
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1500));
    
    submitHomework(hw.id, {
      text: textResponse.trim() || undefined,
      audioUrl: isRecording ? "mock://audio-recording.mp3" : undefined,
    });
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Navigate back after showing success
    setTimeout(() => {
      router.back();
    }, 1500);
  }, [hw, textResponse, isRecording, submitHomework, router]);

  if (!hw) {
    return (
      <GradientBackground>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Assignment not found</Text>
        </View>
      </GradientBackground>
    );
  }

  const dueDate = new Date(hw.dueDate);
  const isOverdue = isPast(dueDate) && !hw.isCompleted;

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {hw.isCompleted ? "Submission" : "Submit Homework"}
        </Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Assignment Details */}
        <MotiView
          from={motionFrom.fadeUp}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition()}
          style={styles.detailsSection}
        >
          <GlassPanel style={styles.detailsCard}>
            <View style={styles.statusRow}>
              {hw.isCompleted ? (
                <View style={styles.statusBadgeCompleted}>
                  <CheckCircle size={14} color={colors.success} />
                  <Text style={styles.statusTextCompleted}>Completed</Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isOverdue ? "rgba(239, 68, 68, 0.12)" : "rgba(250, 204, 21, 0.12)" },
                  ]}
                >
                  <Clock
                    size={14}
                    color={isOverdue ? colors.error : colors.accent[400]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: isOverdue ? colors.error : colors.accent[400] },
                    ]}
                  >
                    Due {format(dueDate, "MMM d, h:mm a")}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.assignmentTitle}>{hw.title}</Text>
            <Text style={styles.assignmentDescription}>{hw.description}</Text>
          </GlassPanel>
        </MotiView>

        {/* Submission Section */}
        {!hw.isCompleted && !submitted && (
          <>
            {/* Text Response */}
            <MotiView
              from={motionFrom.fadeUp}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition({ delay: 100 })}
              style={styles.inputSection}
            >
              <Text style={styles.sectionLabel}>Written Response</Text>
              <GlassPanel style={styles.inputCard}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type your response here..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                  value={textResponse}
                  onChangeText={setTextResponse}
                  textAlignVertical="top"
                />
              </GlassPanel>
            </MotiView>

            {/* Voice Recording */}
            <MotiView
              from={motionFrom.fadeUp}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition({ delay: 200 })}
              style={styles.voiceSection}
            >
              <Text style={styles.sectionLabel}>Or Record Audio</Text>
              <GlassPanel style={styles.voiceCard}>
                {isRecording && (
                  <View style={styles.waveformContainer}>
                    <VoiceWaveform isActive={isRecording} />
                  </View>
                )}
                <Pressable
                  onPress={handleRecordToggle}
                  style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                >
                  <Mic
                    size={28}
                    color={isRecording ? "#FFFFFF" : colors.secondary[400]}
                  />
                </Pressable>
                <Text style={styles.recordHint}>
                  {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
                </Text>
              </GlassPanel>
            </MotiView>

            {/* Submit Button */}
            <MotiView
              from={motionFrom.fade}
              animate={{ opacity: 1 }}
              transition={getTransition({ delay: 300 })}
              style={styles.submitSection}
            >
              <PrimaryButton
                label={isSubmitting ? "Submitting..." : "Submit Homework"}
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={!textResponse.trim() && !isRecording}
              />
            </MotiView>
          </>
        )}

        {/* Success State */}
        {submitted && (
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={getTransition()}
            style={styles.successSection}
          >
            <GlassPanel style={styles.successCard}>
              <CheckCircle size={48} color={colors.success} />
              <Text style={styles.successTitle}>Submitted!</Text>
              <Text style={styles.successText}>
                Your homework has been submitted successfully.
              </Text>
            </GlassPanel>
          </MotiView>
        )}

        {/* View Previous Submission */}
        {hw.isCompleted && hw.submission && (
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ delay: 100 })}
            style={styles.submissionSection}
          >
            <Text style={styles.sectionLabel}>Your Submission</Text>
            <GlassPanel style={styles.submissionCard}>
              {hw.submission.text && (
                <Text style={styles.submissionText}>{hw.submission.text}</Text>
              )}
              {hw.submission.audioUrl && (
                <View style={styles.audioIndicator}>
                  <Mic size={18} color={colors.secondary[400]} />
                  <Text style={styles.audioText}>Audio recording attached</Text>
                </View>
              )}
              <Text style={styles.submittedAt}>
                Submitted {format(new Date(hw.submission.submittedAt), "MMM d, h:mm a")}
              </Text>
            </GlassPanel>
          </MotiView>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsCard: {
    padding: 20,
    borderRadius: 20,
  },
  statusRow: {
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
  },
  statusBadgeCompleted: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusTextCompleted: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.success,
  },
  assignmentTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: 8,
  },
  assignmentDescription: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  sectionLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 12,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputCard: {
    padding: 16,
    borderRadius: 16,
  },
  textInput: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.primary,
    minHeight: 120,
    lineHeight: 22,
  },
  voiceSection: {
    marginBottom: 24,
  },
  voiceCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
  },
  waveformContainer: {
    width: "100%",
    height: 60,
    marginBottom: 16,
  },
  recordButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.secondary[400],
    marginBottom: 12,
  },
  recordButtonActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  recordHint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
  submitSection: {
    marginTop: 8,
  },
  successSection: {
    marginTop: 40,
  },
  successCard: {
    padding: 40,
    borderRadius: 24,
    alignItems: "center",
  },
  successTitle: {
    fontFamily: "Satoshi-Bold",
    fontSize: 24,
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
  },
  submissionSection: {
    marginTop: 8,
  },
  submissionCard: {
    padding: 20,
    borderRadius: 20,
  },
  submissionText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  audioIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  audioText: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.secondary[400],
  },
  submittedAt: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.muted,
  },
});

