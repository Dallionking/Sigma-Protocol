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
import { ChevronLeft, Check, Eye, EyeOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { GlassPanel } from "@/components/GlassPanel";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { profileApi } from "@/stores/profileStore";
import { colors } from "@/theme/tokens";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const passwordsMatch = newPassword === confirmPassword;
  const isValidPassword = newPassword.length >= 8;
  const canSubmit = currentPassword.length >= 6 && isValidPassword && passwordsMatch;

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
      const result = await profileApi.updatePassword(currentPassword, newPassword);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.back(), 1500);
      }
    } catch (e) {
      setError("Failed to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, currentPassword, newPassword, router]);

  return (
    <GradientBackground>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Change Password</Text>
        <Pressable
          onPress={() => setShowPasswords(!showPasswords)}
          style={styles.backButton}
        >
          {showPasswords ? (
            <EyeOff size={20} color={colors.text.muted} />
          ) : (
            <Eye size={20} color={colors.text.muted} />
          )}
        </Pressable>
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
                <Text style={styles.successTitle}>Password Updated!</Text>
                <Text style={styles.successText}>
                  Your password has been changed successfully.
                </Text>
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
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Current Password</Text>
                    <TextInput
                      style={styles.textInput}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Enter current password"
                      placeholderTextColor={colors.text.muted}
                      secureTextEntry={!showPasswords}
                    />
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>New Password</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Enter new password"
                      placeholderTextColor={colors.text.muted}
                      secureTextEntry={!showPasswords}
                    />
                    {newPassword.length > 0 && !isValidPassword && (
                      <Text style={styles.fieldHint}>
                        Password must be at least 8 characters
                      </Text>
                    )}
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Confirm New Password</Text>
                    <TextInput
                      style={styles.textInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm new password"
                      placeholderTextColor={colors.text.muted}
                      secureTextEntry={!showPasswords}
                    />
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <Text style={styles.fieldError}>Passwords do not match</Text>
                    )}
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
                transition={getTransition({ delay: 100 })}
                style={styles.submitSection}
              >
                <PrimaryButton
                  label={isSubmitting ? "Updating..." : "Update Password"}
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
  fieldHint: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 6,
  },
  fieldError: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
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

