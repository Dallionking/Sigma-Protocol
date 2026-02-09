import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Check, ChevronDown } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { profileApi } from "@/stores/profileStore";
import { colors } from "@/theme/tokens";

const SUBJECTS = [
  "General Question",
  "Bug Report",
  "Feature Request",
  "Account Issue",
  "Billing Question",
  "Other",
];

export default function ContactSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const [subject, setSubject] = useState("");
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const canSubmit = subject.length > 0 && message.trim().length >= 10;

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleSubjectSelect = useCallback((selectedSubject: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSubject(selectedSubject);
    setShowSubjectPicker(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);

    try {
      const result = await profileApi.submitContactForm(subject, message);
      if (result.success) {
        setTicketId(result.ticketId);
        setSuccess(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, subject, message]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {success ? (
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={getTransition()}
              style={styles.successContainer}
            >
              <GlassPanel style={styles.successCard}>
                <Check size={48} color={colors.success} />
                <Text style={styles.successTitle}>Message Sent!</Text>
                <Text style={styles.successText}>
                  We've received your message and will get back to you soon.
                </Text>
                <View style={styles.ticketBadge}>
                  <Text style={styles.ticketLabel}>Ticket ID</Text>
                  <Text style={styles.ticketId}>{ticketId}</Text>
                </View>
              </GlassPanel>
            </MotiView>
          ) : (
            <>
              {/* Form */}
              <MotiView
                from={motionFrom.fadeUp}
                animate={{ opacity: 1, translateY: 0 }}
                transition={getTransition()}
              >
                <GlassPanel style={styles.formCard}>
                  {/* Subject Picker */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Subject</Text>
                    <Pressable
                      onPress={() => setShowSubjectPicker(!showSubjectPicker)}
                      style={styles.pickerButton}
                    >
                      <Text
                        style={[
                          styles.pickerText,
                          !subject && styles.pickerPlaceholder,
                        ]}
                      >
                        {subject || "Select a subject"}
                      </Text>
                      <ChevronDown size={20} color={colors.text.muted} />
                    </Pressable>

                    {showSubjectPicker && (
                      <MotiView
                        from={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        style={styles.pickerDropdown}
                      >
                        {SUBJECTS.map((s) => (
                          <Pressable
                            key={s}
                            onPress={() => handleSubjectSelect(s)}
                            style={styles.pickerOption}
                          >
                            <Text
                              style={[
                                styles.pickerOptionText,
                                subject === s && styles.pickerOptionActive,
                              ]}
                            >
                              {s}
                            </Text>
                            {subject === s && (
                              <Check size={16} color={colors.secondary[400]} />
                            )}
                          </Pressable>
                        ))}
                      </MotiView>
                    )}
                  </View>

                  <View style={styles.divider} />

                  {/* Message */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Message</Text>
                    <TextInput
                      style={styles.messageInput}
                      value={message}
                      onChangeText={setMessage}
                      placeholder="Describe your issue or question..."
                      placeholderTextColor={colors.text.muted}
                      multiline
                      textAlignVertical="top"
                      maxLength={1000}
                    />
                    <Text style={styles.charCount}>{message.length}/1000</Text>
                  </View>
                </GlassPanel>
              </MotiView>

              {/* Submit Button */}
              <MotiView
                from={motionFrom.fadeUp}
                animate={{ opacity: 1, translateY: 0 }}
                transition={getTransition({ delay: 100 })}
                style={styles.submitSection}
              >
                <PrimaryButton
                  label={isSubmitting ? "Sending..." : "Send Message"}
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={!canSubmit}
                />
              </MotiView>

              {/* Response Time */}
              <MotiView
                from={motionFrom.fade}
                animate={{ opacity: 1 }}
                transition={getTransition({ delay: 150 })}
                style={styles.infoSection}
              >
                <Text style={styles.infoText}>
                  We typically respond within 24-48 hours.
                </Text>
              </MotiView>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  formCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  fieldContainer: {
    paddingVertical: 8,
  },
  fieldLabel: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  pickerText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.primary,
  },
  pickerPlaceholder: {
    color: colors.text.muted,
  },
  pickerDropdown: {
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 12,
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  pickerOptionText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
  },
  pickerOptionActive: {
    color: colors.secondary[400],
    fontFamily: "PlusJakartaSans-SemiBold",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 12,
  },
  messageInput: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    minHeight: 140,
    lineHeight: 22,
  },
  charCount: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    textAlign: "right",
    marginTop: 8,
  },
  submitSection: {},
  infoSection: {
    marginTop: 20,
    alignItems: "center",
  },
  infoText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
  },
  successContainer: {
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
    marginBottom: 20,
  },
  ticketBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  ticketLabel: {
    fontFamily: "PlusJakartaSans",
    fontSize: 11,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  ticketId: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 14,
    color: colors.secondary[400],
  },
});

