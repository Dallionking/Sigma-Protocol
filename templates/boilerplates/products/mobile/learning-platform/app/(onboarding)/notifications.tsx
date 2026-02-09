import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import React, { useEffect } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBackground } from "@/components/GradientBackground";
import { DevHubButton } from "@/components/DevHubButton";
import { OnboardingHeader } from "@/components/OnboardingHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { colors } from "@/theme/tokens";

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setNotifications, setStep } = useOnboardingStore();

  const bellPulse = useSharedValue(1);
  const glowOpacity = useSharedValue(0.2);

  useEffect(() => {
    bellPulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.15, { duration: 1200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, [bellPulse, glowOpacity]);

  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bellPulse.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handleEnable = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Stubbed notification permission for prototype
    // In production, use expo-notifications requestPermissionsAsync()
    if (Platform.OS === "web") {
      // Web doesn't support native notifications in this context
      setNotifications(true);
    } else {
      // Show a simulated prompt for native - in production, use expo-notifications
      Alert.alert(
        "Enable Notifications",
        "AI Tutor would like to send you reminders to keep your streak alive.",
        [
          {
            text: "Don't Allow",
            style: "cancel",
            onPress: () => setNotifications(false),
          },
          {
            text: "Allow",
            onPress: () => setNotifications(true),
          },
        ]
      );
    }

    setStep(5);
    router.push("/complete");
  };

  const handleNotNow = () => {
    setNotifications(false);
    setStep(5);
    router.push("/complete");
  };

  return (
    <GradientBackground>
      <DevHubButton />
      <OnboardingHeader step={4} totalSteps={5} showBack={false} />

      <View
        style={[
          styles.container,
          { paddingBottom: insets.bottom + 32 },
        ]}
      >
        {/* Bell icon with glow */}
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 260, delay: 200 }}
          style={styles.iconSection}
        >
          <Animated.View style={[styles.glowCircle, glowStyle]} />
          <Animated.View style={[styles.iconWrapper, bellStyle]}>
            <Bell size={48} color={colors.primary[400]} />
          </Animated.View>
        </MotiView>

        {/* Text */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 400 }}
          style={styles.textSection}
        >
          <Text style={styles.headline}>Stay on track</Text>
          <Text style={styles.subheadline}>
            Keep your streak alive with friendly reminders from AI Tutor.
          </Text>
        </MotiView>

        {/* Benefits */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 400, delay: 550 }}
          style={styles.benefitsSection}
        >
          <BenefitItem text="Daily practice reminders" delay={600} />
          <BenefitItem text="Streak protection alerts" delay={650} />
          <BenefitItem text="New lesson notifications" delay={700} />
        </MotiView>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* CTAs */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 260, delay: 750 }}
          style={styles.ctaSection}
        >
          <PrimaryButton
            label="Enable Notifications"
            onPress={handleEnable}
          />
          <SecondaryButton
            label="Not now"
            onPress={handleNotNow}
            style={styles.secondaryButton}
          />
        </MotiView>
      </View>
    </GradientBackground>
  );
}

function BenefitItem({ text, delay }: { text: string; delay: number }) {
  return (
    <MotiView
      from={{ opacity: 0, translateX: -10 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 300, delay }}
      style={styles.benefitItem}
    >
      <View style={styles.benefitDot} />
      <Text style={styles.benefitText}>{text}</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 32,
  },
  glowCircle: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[500],
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  textSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  headline: {
    fontFamily: "Satoshi-Bold",
    fontSize: 28,
    color: colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subheadline: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  benefitsSection: {
    paddingHorizontal: 12,
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary[400],
    marginRight: 12,
  },
  benefitText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 15,
    color: colors.text.primary,
  },
  spacer: {
    flex: 1,
  },
  ctaSection: {
    gap: 8,
  },
  secondaryButton: {
    marginTop: 4,
  },
});



