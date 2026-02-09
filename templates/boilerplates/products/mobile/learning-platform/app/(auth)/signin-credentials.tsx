import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { SecondaryLink } from "@/components/SecondaryLink";
import { SocialAuthButton } from "@/components/SocialAuthButton";
import { TextField } from "@/components/TextField";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { signinSchema, SigninFormValues } from "@/lib/schemas/auth";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { authApi, useAuthStore } from "@/stores/authStore";
import { colors } from "@/theme/tokens";

export default function SigninCredentialsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSignupEmail } = useAuthStore();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = useCallback(
    async (data: SigninFormValues) => {
      Keyboard.dismiss();
      setIsSubmitting(true);
      setLoginError(null);

      try {
        const result = await authApi.signIn(data.email, data.password);

        if (result.success) {
          if (result.requires2FA) {
            setSignupEmail(data.email);
            router.push("/signin-2fa");
          } else {
            // Save session state
            await AsyncStorage.multiSet([
              [STORAGE_KEYS.hasSession, "true"],
              [STORAGE_KEYS.onboardingComplete, "true"],
            ]);
            router.push("/signin-success");
          }
        } else {
          setLoginError("Invalid email or password");
        }
      } catch (error) {
        setLoginError("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, setSignupEmail]
  );

  return (
    <GradientBackground>
      <DevHubButton />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
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
              <Text style={styles.headline}>Welcome back</Text>
              <Text style={styles.subheadline}>
                Sign in to continue your journey
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

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextField
                    label="Password"
                    placeholder="Enter your password"
                    isPassword
                    autoCapitalize="none"
                    autoComplete="password"
                    textContentType="password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              {loginError && (
                <MotiView
                  from={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.errorContainer}
                >
                  <Text style={styles.errorText}>{loginError}</Text>
                </MotiView>
              )}

              <PrimaryButton
                label="Continue"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                loading={isSubmitting}
              />

              <View style={styles.forgotContainer}>
                <SecondaryButton
                  label="Forgot password?"
                  onPress={() => router.push("/forgot-email")}
                  variant="ghost"
                />
              </View>
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
                <Text style={styles.dividerText}>Or</Text>
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
              <Text style={styles.footerText}>New here?</Text>
              <SecondaryLink
                label="Create account"
                onPress={() => router.push("/signup-email")}
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
    fontSize: 32,
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subheadline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 8,
  },
  formSection: {
    gap: 4,
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
  forgotContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  socialSection: {
    marginTop: 28,
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
    paddingTop: 24,
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



