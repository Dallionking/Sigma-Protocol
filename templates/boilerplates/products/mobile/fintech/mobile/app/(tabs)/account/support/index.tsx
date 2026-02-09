import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, NeonButton, Card, ListRow, Icon, type IconName } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const HELP_TOPICS: Array<{ id: string; icon: IconName; title: string; description: string }> = [
  { id: 'deposits', icon: 'wallet', title: 'Deposits & Withdrawals', description: 'How to fund and withdraw' },
  { id: 'subscriptions', icon: 'star', title: 'Subscriptions', description: 'Plans, billing, and upgrades' },
  { id: 'brokers', icon: 'link', title: 'Broker Connection', description: 'Connecting and managing brokers' },
  { id: 'ai', icon: 'ai', title: 'AI Trading', description: 'How the AI works' },
  { id: 'security', icon: 'lock', title: 'Security', description: 'Account protection' },
];

const QUICK_ACTIONS: Array<{ id: string; icon: IconName; title: string; subtitle: string }> = [
  { id: 'email', icon: 'mail', title: 'Email Us', subtitle: 'support@example.com' },
  { id: 'chat', icon: 'message', title: 'Live Chat', subtitle: 'Available 9am-5pm EST' },
];

export default function SupportCenterScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleTopicPress = (topicId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/account/support/article',
      params: { id: topicId },
    });
  };

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/account/support/contact');
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
          <Pressable onPress={handleBack} style={styles.backButton}>
            <NeonText variant="body" color="muted">‹ Back</NeonText>
          </Pressable>
          <NeonText variant="h2" color="white">Help Center</NeonText>
          <NeonText variant="caption" color="muted" style={styles.subtitle}>
            Find answers or contact our support team
          </NeonText>
        </MotiView>

        {/* Search Placeholder */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 100, duration: 400 }}
        >
          <Pressable style={styles.searchBar}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="search" size={16} color="muted" />
              <NeonText variant="body" color="muted">Search help articles...</NeonText>
            </View>
          </Pressable>
        </MotiView>

        {/* Popular Topics */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 150, duration: 400 }}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <NeonText variant="label" color="muted" style={styles.sectionTitle}>
              Popular Topics
            </NeonText>
            <View style={styles.sectionUnderline} />
          </View>
          <Card variant="default" padding="none">
            {HELP_TOPICS.map((topic, index) => (
              <ListRow
                key={topic.id}
                icon={topic.icon}
                title={topic.title}
                subtitle={topic.description}
                showArrow
                divider={index < HELP_TOPICS.length - 1}
                onPress={() => handleTopicPress(topic.id)}
              />
            ))}
          </Card>
        </MotiView>

        {/* Quick Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 200, duration: 400 }}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <NeonText variant="label" color="muted" style={styles.sectionTitle}>
              Quick Actions
            </NeonText>
            <View style={styles.sectionUnderline} />
          </View>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action, index) => (
              <MotiView
                key={action.id}
                from={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 250 + index * 50 }}
              >
                <Card variant="default" padding="md" style={styles.quickActionCard}>
                  <View style={styles.quickActionIcon}>
                    <Icon name={action.icon} size={24} color="primary" />
                  </View>
                  <NeonText variant="body" color="white" style={styles.quickActionTitle}>
                    {action.title}
                  </NeonText>
                  <NeonText variant="caption" color="muted">
                    {action.subtitle}
                  </NeonText>
                </Card>
              </MotiView>
            ))}
          </View>
        </MotiView>

        {/* Contact Support CTA */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 300, duration: 400 }}
          style={styles.contactSection}
        >
          <Card variant="glassmorphism" padding="lg" showBorderBeam style={styles.contactCard}>
            <View style={styles.contactIconContainer}>
              <MotiView
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ type: 'timing', duration: 2000, loop: true }}
              >
                <Icon name="message" size={48} color="primary" />
              </MotiView>
            </View>
            <NeonText variant="h4" color="white" align="center" style={styles.contactTitle}>
              Need more help?
            </NeonText>
            <NeonText variant="body" color="muted" align="center" style={styles.contactText}>
              Our support team typically responds within 24 hours.
            </NeonText>
            <NeonButton onPress={handleContactSupport}>
              Contact Support
            </NeonButton>
          </Card>
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
    paddingVertical: spacing[2],
    gap: spacing[1],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  subtitle: {
    marginTop: spacing[1],
  },
  searchBar: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginTop: spacing[4],
  },
  section: {
    marginTop: spacing[5],
  },
  sectionHeader: {
    marginBottom: spacing[3],
  },
  sectionTitle: {
    marginLeft: spacing[1],
    marginBottom: spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  sectionUnderline: {
    height: 2,
    backgroundColor: colors.primary[500],
    width: 40,
    marginLeft: spacing[1],
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  quickActionTitle: {
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  contactSection: {
    marginTop: spacing[6],
    marginBottom: spacing[2],
  },
  contactCard: {
    alignItems: 'center',
  },
  contactIconContainer: {
    marginBottom: spacing[3],
  },
  contactIcon: {
    fontSize: 48,
  },
  contactTitle: {
    marginBottom: spacing[2],
  },
  contactText: {
    marginBottom: spacing[4],
    maxWidth: 280,
  },
});


