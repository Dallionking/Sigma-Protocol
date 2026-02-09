import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, Card } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';

const PRIVACY_SECTIONS = [
  {
    icon: '📊',
    title: 'Information We Collect',
    items: [
      'Email address and name for account creation',
      'Broker connection credentials (encrypted)',
      'Trading activity and preferences',
      'Device and usage analytics',
    ],
  },
  {
    icon: '⚙️',
    title: 'How We Use Your Data',
    items: [
      'Provide and improve our AI trading services',
      'Process transactions and manage your account',
      'Send important notifications and updates',
      'Comply with legal obligations',
    ],
  },
  {
    icon: '🔒',
    title: 'Data Security',
    items: [
      'Industry-standard encryption (AES-256)',
      'Secure credential storage',
      'Regular security audits',
      'No third-party data sharing',
    ],
  },
  {
    icon: '✋',
    title: 'Your Rights',
    items: [
      'Access your personal data anytime',
      'Request data correction or deletion',
      'Export your data in portable format',
      'Restrict data processing',
    ],
  },
];

export default function PrivacyScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
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
          <NeonText variant="h2" color="white">Privacy Policy</NeonText>
          <View style={styles.titleUnderline} />
        </MotiView>

        {/* Shield Badge */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 100 }}
          style={styles.shieldSection}
        >
          <View style={styles.shieldContainer}>
            <MotiView
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ type: 'timing', duration: 2000, loop: true }}
            >
              <NeonText style={styles.shieldIcon}>🛡️</NeonText>
            </MotiView>
            <NeonText variant="caption" color="muted" style={styles.shieldText}>
              Your data is protected
            </NeonText>
          </View>
        </MotiView>

        {/* Privacy Sections - Staggered */}
        {PRIVACY_SECTIONS.map((section, index) => (
          <MotiView
            key={section.title}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', delay: 150 + index * 60, duration: 400 }}
          >
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <NeonText style={styles.sectionIcon}>{section.icon}</NeonText>
                </View>
                <NeonText variant="h4" color="white">{section.title}</NeonText>
              </View>
              
              <View style={styles.itemsList}>
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.itemRow}>
                    <View style={styles.itemBullet} />
                    <NeonText variant="body" color="muted" style={styles.itemText}>
                      {item}
                    </NeonText>
                  </View>
                ))}
              </View>
            </View>
          </MotiView>
        ))}

        {/* Contact Section */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', delay: 500, duration: 400 }}
          style={styles.contactSection}
        >
          <Card variant="default" padding="md" style={styles.contactCard}>
            <View style={styles.contactAccent} />
            <NeonText variant="h4" color="white" style={styles.contactTitle}>
              Contact Us
            </NeonText>
            <NeonText variant="body" color="muted" style={styles.contactText}>
              For privacy-related inquiries
            </NeonText>
            <NeonText variant="body" color="primary">
              privacy@example.com
            </NeonText>
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
    gap: spacing[2],
  },
  backButton: {
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  titleUnderline: {
    height: 2,
    width: 70,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
  },
  shieldSection: {
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  shieldContainer: {
    alignItems: 'center',
    gap: spacing[2],
  },
  shieldIcon: {
    fontSize: 48,
  },
  shieldText: {
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionIcon: {
    fontSize: 20,
  },
  itemsList: {
    gap: spacing[2],
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[500],
    marginTop: 8,
  },
  itemText: {
    flex: 1,
    lineHeight: 22,
  },
  contactSection: {
    marginTop: spacing[2],
    marginBottom: spacing[4],
  },
  contactCard: {
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
  },
  contactAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary[500],
  },
  contactTitle: {
    marginBottom: spacing[1],
  },
  contactText: {
    marginBottom: spacing[2],
  },
});


