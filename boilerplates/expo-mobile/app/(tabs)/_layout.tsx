import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";

/**
 * Tabs Layout
 * 
 * Bottom tab navigator for main app sections.
 * 
 * @module dashboard
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="purchases"
        options={{
          title: "Premium",
          tabBarIcon: ({ color }) => <TabIcon name="star" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}

// Simple icon placeholder - replace with actual icons
function TabIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, string> = {
    home: "🏠",
    star: "⭐",
    settings: "⚙️",
  };

  return (
    <View style={[styles.iconContainer, { borderColor: color }]}>
      <View style={styles.icon}>
        {/* Replace with actual icon library */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 84,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
});

