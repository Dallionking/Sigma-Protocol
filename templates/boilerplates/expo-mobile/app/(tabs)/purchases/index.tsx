import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";

/**
 * Purchases/Premium Tab
 * 
 * RevenueCat subscription plans and premium features.
 * 
 * @module purchases
 */
export default function PurchasesTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Unlock all features and get unlimited access
        </Text>
      </View>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {plans.map((plan, idx) => (
          <Pressable 
            key={idx} 
            style={[styles.planCard, plan.popular && styles.planCardPopular]}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Most Popular</Text>
              </View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.planPriceRow}>
              <Text style={styles.planPrice}>${plan.price}</Text>
              <Text style={styles.planPeriod}>/{plan.period}</Text>
            </View>
            {plan.savings && (
              <Text style={styles.planSavings}>{plan.savings}</Text>
            )}
            <View style={styles.planFeatures}>
              {plan.features.map((feature, fidx) => (
                <View key={fidx} style={styles.featureRow}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            <Pressable 
              style={[styles.planButton, plan.popular && styles.planButtonPopular]}
            >
              <Text 
                style={[styles.planButtonText, plan.popular && styles.planButtonTextPopular]}
              >
                {plan.popular ? "Get Started" : "Choose Plan"}
              </Text>
            </Pressable>
          </Pressable>
        ))}
      </View>

      {/* Restore Purchases */}
      <Pressable style={styles.restoreButton}>
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </Pressable>

      {/* Terms */}
      <Text style={styles.terms}>
        Subscriptions automatically renew unless cancelled at least 24 hours 
        before the end of the current period.
      </Text>
    </ScrollView>
  );
}

const plans = [
  {
    name: "Monthly",
    price: 9.99,
    period: "month",
    popular: false,
    features: ["Unlimited AI credits", "Priority support", "All features"],
  },
  {
    name: "Yearly",
    price: 79.99,
    period: "year",
    savings: "Save 33%",
    popular: true,
    features: ["Unlimited AI credits", "Priority support", "All features", "Early access"],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
    gap: 24,
  },
  header: {
    alignItems: "center",
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  planCardPopular: {
    borderColor: "#6366F1",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: "#6366F1",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  planName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  planPriceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#111827",
  },
  planPeriod: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 4,
  },
  planSavings: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
    marginTop: 4,
  },
  planFeatures: {
    marginTop: 20,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureCheck: {
    fontSize: 16,
    color: "#10B981",
  },
  featureText: {
    fontSize: 14,
    color: "#374151",
  },
  planButton: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  planButtonPopular: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  planButtonTextPopular: {
    color: "white",
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  restoreText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "500",
  },
  terms: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: 16,
  },
});

