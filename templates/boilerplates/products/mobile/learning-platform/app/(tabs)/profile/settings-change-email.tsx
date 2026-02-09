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
import { ChevronLeft, Check } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { useProfileStore, profileApi } from "@/stores/profileStore";
import { MOCK_USER_PROFILE } from "@/lib/profile/mockData";
import { colors } from "@/theme/tokens";

export default function ChangeEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const { profile, updateProfile } = useProfileStore();
  const displayProfile = profile ?? MOCK_USER_PROFILE;

  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);
  const canSubmit = isValidEmail && password.length >= 6;

  const handleBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);
    setError("");

    try {
      const result = await profileApi.updateEmail(newEmail);
      if (result.success) {
        updateProfile({ email: newEmail });
        setSuccess(true);
        setTimeout(() => router.back(), 1500);
      }
    } catch (e) {
      setError("Failed to update email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, newEmail, updateProfile, router]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Change Email</Text>
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
                <Text style={styles.successTitle}>Email Updated!</Text>
                <Text style={styles.successText}>
                  Your email has been changed to {newEmail}
                </Text>
              </GlassPanel>
            </MotiView>
          ) : (
            <>
              {/* Current Email */}
              <MotiView
                from={motionFrom.fadeUp}
                animate={{ opacity: 1, translateY: 0 }}
                transition={getTransition()}
                style={styles.section}
              >
                <Text style={styles.label}>Current Email</Text>
                <Text style={styles.currentValue}>{displayProfile.email}</Text>
              </MotiView>

              {/* Form */}
              <MotiView
                from={motionFrom.fadeUp}
                animate={{ opacity: 1, translateY: 0 }}
                transition={getTransition({ delay: 100 })}
              >
                <GlassPanel style={styles.formCard}>
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>New Email</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newEmail}
                      onChangeText={setNewEmail}
                      placeholder="Enter new email"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Confirm Password</Text>
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.text.muted}
                      secureTextEntry
                    />
                  </View>
                </GlassPanel>
              </MotiView>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              {/* Submit Button */}
              <MotiView
                from={motionFrom.fadeUp}
                animate={{ opacity: 1, translateY: 0 }}
                transition={getTransition({ delay: 200 })}
                style={styles.submitSection}
              >
                <PrimaryButton
                  label={isSubmitting ? "Updating..." : "Update Email"}
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={!canSubmit}
                />
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontFamily: "PlusJakartaSans-SemiBold",
    fontSize: 12,
    color: colors.text.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  currentValue: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
  },
  formCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
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
  textInput: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginVertical: 12,
  },
  errorText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.error,
    textAlign: "center",
    marginBottom: 16,
  },
  submitSection: {
    marginTop: 16,
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
  },
});

