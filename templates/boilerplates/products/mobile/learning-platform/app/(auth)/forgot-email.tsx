import { zodResolver } from "@hookform/resolvers/zod";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthHeader } from "@/components/AuthHeader";
import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryLink } from "@/components/SecondaryLink";
import { SocialAuthButton } from "@/components/SocialAuthButton";
import { TextField } from "@/components/TextField";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { emailSchema, EmailFormValues } from "@/lib/schemas/auth";
import { useAuthStore, authApi } from "@/stores/authStore";
import { colors } from "@/theme/tokens";

export default function ForgotEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSignupEmail } = useAuthStore();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = useCallback(
    async (data: EmailFormValues) => {
      Keyboard.dismiss();
      setIsSubmitting(true);

      try {
        await authApi.sendResetEmail(data.email);
        setSignupEmail(data.email);
        router.push("/forgot-check-email");
      } catch (error) {
        console.error("Failed to send reset email:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, setSignupEmail]
  );

  return (
    <GradientBackground>
      <DevHubButton />
      <AuthHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View
          style={[
            styles.container,
            { paddingBottom: insets.bottom + 24 },
          ]}
        >
          {/* Header */}
          <MotiView
            from={motionFrom.fadeUp}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ type: "timing", duration: 400, delay: 100 })}
            style={styles.headerSection}
          >
            <Text style={styles.headline}>Reset your password</Text>
            <Text style={styles.subheadline}>
              Enter your email and we'll send you a link to reset your password
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
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Email"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <PrimaryButton
              label="Send reset link"
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </MotiView>

          {/* Social auth */}
          <MotiView
            from={motionFrom.fade}
            animate={{ opacity: 1 }}
            transition={getTransition({ type: "timing", duration: 400, delay: 400 })}
            style={styles.socialSection}
          >
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <SocialAuthButton provider="apple" />
              <SocialAuthButton provider="google" />
            </View>
          </MotiView>

          {/* Footer */}
          <MotiView
            from={motionFrom.fade}
            animate={{ opacity: 1 }}
            transition={getTransition({ type: "timing", duration: 400, delay: 500 })}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Already have an account?</Text>
            <SecondaryLink
              label="Sign in"
              onPress={() => router.push("/signin-credentials")}
            />
          </MotiView>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
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
    gap: 8,
  },
  socialSection: {
    marginTop: 32,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  dividerText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 13,
    color: colors.text.muted,
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
  },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  footerText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.secondary,
  },
});



