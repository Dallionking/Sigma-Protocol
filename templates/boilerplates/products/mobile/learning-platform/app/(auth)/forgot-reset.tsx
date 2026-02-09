import { zodResolver } from "@hookform/resolvers/zod";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthHeader } from "@/components/AuthHeader";
import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { PasswordStrength } from "@/components/PasswordStrength";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { passwordSchema, PasswordFormValues } from "@/lib/schemas/auth";
import { authApi } from "@/stores/authStore";
import { colors } from "@/theme/tokens";

export default function ForgotResetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ token?: string }>();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "" },
  });

  const password = watch("password");

  const onSubmit = useCallback(
    async (data: PasswordFormValues) => {
      Keyboard.dismiss();
      setIsSubmitting(true);
      setResetError(null);

      try {
        const token = params.token || "demo-token";
        const result = await authApi.resetPassword(token, data.password);

        if (result.success) {
          // Navigate to signin with success message
          router.replace("/signin-credentials");
        } else {
          setResetError("Failed to reset password. Please try again.");
        }
      } catch (error) {
        setResetError("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, params.token]
  );

  return (
    <GradientBackground>
      <DevHubButton />
      <AuthHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* Header */}
            <MotiView
              from={motionFrom.fadeUp}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition({ type: "timing", duration: 400, delay: 100 })}
              style={styles.headerSection}
            >
              <Text style={styles.headline}>Set a new password</Text>
              <Text style={styles.subheadline}>
                Create a strong password for your account
              </Text>
            </MotiView>

            {/* Form */}
            <MotiView
              from={motionFrom.fadeUpLarge}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition({ type: "timing", duration: 400, delay: 200 })}
              style={styles.formSection}
            >
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label="New password"
                    placeholder="Enter your new password"
                    isPassword
                    autoCapitalize="none"
                    autoComplete="password-new"
                    textContentType="newPassword"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              <PasswordStrength password={password} />

              {resetError && (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.errorContainer}
                >
                  <Text style={styles.errorText}>{resetError}</Text>
                </MotiView>
              )}
            </MotiView>

            {/* Button */}
            <MotiView
              from={motionFrom.fadeUpLarge}
              animate={{ opacity: 1, translateY: 0 }}
              transition={getTransition({ type: "timing", duration: 400, delay: 350 })}
              style={styles.buttonSection}
            >
              <PrimaryButton
                label="Reset password"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                loading={isSubmitting}
              />
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    marginBottom: 32,
  },
  headline: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  subheadline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 8,
    lineHeight: 22,
  },
  formSection: {
    marginBottom: 24,
  },
  errorContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.error,
    textAlign: "center",
  },
  buttonSection: {
    marginTop: "auto",
  },
});



