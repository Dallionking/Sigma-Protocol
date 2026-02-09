import { zodResolver } from "@hookform/resolvers/zod";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthHeader } from "@/components/AuthHeader";
import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { OTPInput } from "@/components/OTPInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryLink } from "@/components/SecondaryLink";
import { useMotionTransition, useMotionFrom } from "@/hooks/useMotionTransition";
import { otpSchema, OTPFormValues } from "@/lib/schemas/auth";
import { useAuthStore, authApi } from "@/stores/authStore";
import { colors } from "@/theme/tokens";

const RESEND_COOLDOWN = 45;

export default function SignupVerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signupEmail } = useAuthStore();
  const { reduceMotion, getTransition } = useMotionTransition();
  const motionFrom = useMotionFrom(reduceMotion);

  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const onSubmit = useCallback(
    async (data: OTPFormValues) => {
      if (!signupEmail) {
        router.replace("/signup-email");
        return;
      }

      setIsVerifying(true);

      try {
        const result = await authApi.verifyCode(signupEmail, data.code);

        if (result.success) {
          router.push("/signup-password");
        } else {
          setError("code", { message: "Invalid code. Please try again." });
        }
      } catch (error) {
        setError("code", { message: "Verification failed. Please try again." });
      } finally {
        setIsVerifying(false);
      }
    },
    [router, signupEmail, setError]
  );

  const handleResend = useCallback(async () => {
    if (!signupEmail || resendTimer > 0) return;

    try {
      await authApi.sendVerificationCode(signupEmail);
      setResendTimer(RESEND_COOLDOWN);
    } catch (error) {
      console.error("Failed to resend code:", error);
    }
  }, [signupEmail, resendTimer]);

  const handleChangeEmail = useCallback(() => {
    router.back();
  }, [router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <GradientBackground>
      <DevHubButton />
      <AuthHeader />

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
          <Text style={styles.headline}>Check your email</Text>
          <Text style={styles.subheadline}>
            Enter the code sent to{"\n"}
            <Text style={styles.emailHighlight}>{signupEmail || "your email"}</Text>
          </Text>
        </MotiView>

        {/* OTP Input */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 200 })}
          style={styles.otpSection}
        >
          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, value } }) => (
              <OTPInput
                value={value}
                onChange={onChange}
                error={errors.code?.message}
                autoFocus
              />
            )}
          />
        </MotiView>

        {/* Verify Button */}
        <MotiView
          from={motionFrom.fadeUpLarge}
          animate={{ opacity: 1, translateY: 0 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 300 })}
          style={styles.buttonSection}
        >
          <PrimaryButton
            label="Verify"
            onPress={handleSubmit(onSubmit)}
            disabled={isVerifying}
            loading={isVerifying}
          />
        </MotiView>

        {/* Actions */}
        <MotiView
          from={motionFrom.fade}
          animate={{ opacity: 1 }}
          transition={getTransition({ type: "timing", duration: 400, delay: 400 })}
          style={styles.actionsSection}
        >
          {resendTimer > 0 ? (
            <Text style={styles.timerText}>
              Resend in {formatTime(resendTimer)}
            </Text>
          ) : (
            <SecondaryLink label="Resend code" onPress={handleResend} />
          )}

          <SecondaryLink label="Change email" onPress={handleChangeEmail} />
        </MotiView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  headline: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  subheadline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 22,
  },
  emailHighlight: {
    color: colors.primary[400],
    fontFamily: "PlusJakartaSans-SemiBold",
  },
  otpSection: {
    alignItems: "center",
  },
  buttonSection: {
    marginTop: 32,
  },
  actionsSection: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  timerText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: colors.text.muted,
  },
});



