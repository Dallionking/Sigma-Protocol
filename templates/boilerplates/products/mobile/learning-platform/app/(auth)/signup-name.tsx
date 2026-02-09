import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { TextField } from "@/components/TextField";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { nameSchema, NameFormValues } from "@/lib/schemas/auth";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { useAuthStore, authApi } from "@/stores/authStore";
import { colors } from "@/theme/tokens";

export default function SignupNameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signupEmail, setSignupName, clearSignupData } = useAuthStore();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = useCallback(
    async (data: NameFormValues) => {
      if (!signupEmail) {
        router.replace("/signup-email");
        return;
      }

      Keyboard.dismiss();
      setIsSubmitting(true);

      try {
        // Create account (stubbed API)
        await authApi.createAccount(signupEmail, "password", data.name);

        // Save session state
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.hasSession, "true"],
          [STORAGE_KEYS.onboardingComplete, "true"],
        ]);

        setSignupName(data.name);
        clearSignupData();

        router.push("/signup-success");
      } catch (error) {
        console.error("Failed to create account:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [router, signupEmail, setSignupName, clearSignupData]
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
            <Text style={styles.headline}>What should we call you?</Text>
            <Text style={styles.subheadline}>
              This is how you'll appear in the app
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
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  label="Name"
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.name?.message}
                />
              )}
            />
          </MotiView>

          {/* Button */}
          <MotiView
            from={motionFrom.fadeUpLarge}
            animate={{ opacity: 1, translateY: 0 }}
            transition={getTransition({ type: "timing", duration: 400, delay: 350 })}
            style={styles.buttonSection}
          >
            <PrimaryButton
              label="Continue"
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              loading={isSubmitting}
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
  },
  formSection: {
    marginBottom: 24,
  },
  buttonSection: {
    marginTop: "auto",
  },
});



