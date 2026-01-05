import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";

/**
 * Home Tab
 * 
 * Main dashboard/home screen.
 * 
 * @module dashboard
 */
export default function HomeTab() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Good morning! 👋</Text>
        <Text style={styles.welcomeText}>What would you like to do today?</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        {stats.map((stat, idx) => (
          <View key={idx} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {actions.map((action, idx) => (
            <Pressable key={idx} style={styles.actionCard}>
              <View style={styles.actionIcon} />
              <Text style={styles.actionText}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Getting Started */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Getting Started</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🚀</Text>
          <Text style={styles.emptyTitle}>Welcome to SSS Mobile!</Text>
          <Text style={styles.emptyText}>
            This is your home screen shell. Customize it with your app's 
            specific content and functionality.
          </Text>
          <Pressable style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>View Documentation</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const stats = [
  { label: "Credits", value: "100" },
  { label: "Projects", value: "3" },
  { label: "Days Active", value: "12" },
];

const actions = [
  { label: "New Project" },
  { label: "View Stats" },
  { label: "Settings" },
  { label: "Help" },
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
  welcomeSection: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  welcomeText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6366F1",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "47%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  emptyState: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
});

