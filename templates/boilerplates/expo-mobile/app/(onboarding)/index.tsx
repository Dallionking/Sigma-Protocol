import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

/**
 * Onboarding Welcome Screen
 * 
 * Initial welcome screen with app logo and get started CTA.
 * 
 * @module mobileOnboarding
 */
export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#8B5CF6", "#6366F1", "#3B82F6"]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo} />
        </View>

        {/* Title */}
        <Text style={styles.title}>SSS Mobile</Text>
        <Text style={styles.subtitle}>
          Your production-ready mobile app starter
        </Text>

        {/* Features */}
        <View style={styles.features}>
          {features.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <Pressable
          style={styles.button}
          onPress={() => router.push("/(onboarding)/value-props")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>

        <Pressable
          style={styles.linkButton}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const features = [
  "Supabase Authentication",
  "RevenueCat In-App Purchases",
  "Expo Router Navigation",
  "Dark Mode Support",
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 48,
  },
  features: {
    gap: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    fontSize: 18,
    color: "#10B981",
  },
  featureText: {
    fontSize: 16,
    color: "white",
  },
  ctaContainer: {
    padding: 32,
    gap: 16,
  },
  button: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6366F1",
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
});

