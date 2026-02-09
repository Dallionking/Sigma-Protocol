import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, Badge, ListRow, type IconName } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

// Menu item configuration with Lucide icon names
const MENU_SECTIONS: Array<{
  id: string;
  items: Array<{ key: string; icon: IconName; title: string; route: string }>;
}> = [
  {
    id: 'main',
    items: [
      { key: 'profile', icon: 'user', title: 'Profile', route: '/(tabs)/account/profile' },
      { key: 'brokers', icon: 'link', title: 'Brokers', route: '/(tabs)/account/brokers' },
      { key: 'security', icon: 'lock', title: 'Security', route: '/(tabs)/account/security' },
      { key: 'notifications', icon: 'bell', title: 'Notifications', route: '/(tabs)/account/notifications' },
      { key: 'support', icon: 'message', title: 'Support', route: '/(tabs)/account/support' },
      { key: 'legal', icon: 'document', title: 'Legal', route: '/(tabs)/account/legal' },
    ],
  },
  {
    id: 'rewards',
    items: [
      { key: 'referral', icon: 'gift', title: 'Referral Program', route: '/(tabs)/account/referral' },
      { key: 'bonuses', icon: 'star', title: 'Bonuses', route: '/(tabs)/account/bonuses' },
    ],
  },
  {
    id: 'info',
    items: [
      { key: 'about', icon: 'info', title: 'About', route: '/(tabs)/account/about' },
    ],
  },
];

export default function AccountHubScreen() {
  const router = useRouter();

  const handleMenuPress = (route: string | null, key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (route) {
      router.push(route as any);
    } else {
      // Placeholder for future flows
      console.log(`Navigate to: ${key}`);
    }
  };

  const handleManagePlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/subscription');
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    // Placeholder for logout
    console.log('Logout');
  };

  return (
    <Screen safeArea style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.header}
        >
          <NeonText variant="h2" color="white">Account</NeonText>
        </MotiView>

        {/* Subscription Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100, duration: 400 }}
        >
          <Card variant="glassmorphism" padding="lg" showBorderBeam style={styles.subscriptionCard}>
            <View style={styles.tierRow}>
              <View style={styles.tierInfo}>
                <NeonText variant="label" color="muted">Current Tier</NeonText>
                <View style={styles.tierBadgeRow}>
                  <NeonText variant="h3" color="primary" glow>Pro</NeonText>
                  <Badge variant="success" size="sm">Most Popular</Badge>
                </View>
              </View>
            </View>
            <NeonButton 
              variant="outline" 
              size="sm" 
              onPress={handleManagePlan}
              style={styles.managePlanButton}
            >
              Manage Plan
            </NeonButton>
          </Card>
        </MotiView>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sectionIndex) => (
          <MotiView
            key={section.id}
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 150 + sectionIndex * 50, duration: 400 }}
            style={styles.menuSection}
          >
            <Card variant="glassmorphism" padding="none">
              {section.items.map((item, itemIndex) => (
                <ListRow
                  key={item.key}
                  icon={item.icon}
                  title={item.title}
                  showArrow
                  divider={itemIndex < section.items.length - 1}
                  onPress={() => handleMenuPress(item.route, item.key)}
                />
              ))}
            </Card>
          </MotiView>
        ))}

        {/* Logout */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 350, duration: 400 }}
          style={styles.logoutSection}
        >
          <Pressable 
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <NeonText variant="body" style={styles.logoutText}>Log Out</NeonText>
          </Pressable>
        </MotiView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: layout.tabBarHeight + spacing[4],
  },
  header: {
    paddingVertical: spacing[3],
  },
  subscriptionCard: {
    marginBottom: spacing[4],
  },
  tierRow: {
    marginBottom: spacing[4],
  },
  tierInfo: {
    gap: spacing[2],
  },
  tierBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  managePlanButton: {
    alignSelf: 'flex-start',
  },
  menuSection: {
    marginBottom: spacing[4],
  },
  logoutSection: {
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  logoutButton: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  logoutText: {
    color: colors.error,
    fontWeight: '600',
  },
});


