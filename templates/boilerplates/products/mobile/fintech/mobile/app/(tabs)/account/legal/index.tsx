import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { Screen, NeonText, Icon, type IconName } from '@/components/primitives';
import { colors, spacing, layout } from '@/lib/theme';
import { ChevronRight } from 'lucide-react-native';

const LEGAL_ITEMS: Array<{ id: string; icon: IconName; title: string; subtitle: string; route: string }> = [
  { id: 'terms', icon: 'document', title: 'Terms of Service', subtitle: 'Usage guidelines', route: '/(tabs)/account/legal/terms' },
  { id: 'privacy', icon: 'shieldCheck', title: 'Privacy Policy', subtitle: 'How we protect your data', route: '/(tabs)/account/legal/privacy' },
  { id: 'risk', icon: 'warning', title: 'Risk Disclosure', subtitle: 'Important trading risks', route: '/(tabs)/account/legal/risk' },
  { id: 'subscription', icon: 'creditCard', title: 'Subscription Terms', subtitle: 'Billing & cancellation', route: '/(tabs)/account/legal/subscription' },
];

export default function LegalHubScreen() {
  const router = useRouter();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleItemPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
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
          <NeonText variant="h2" color="white">Legal</NeonText>
          <View style={styles.titleUnderline} />
          <NeonText variant="body" color="muted" style={styles.subtitle}>
            Terms, policies & disclosures
          </NeonText>
        </MotiView>

        {/* Section Header */}
        <MotiView
          from={{ opacity: 0, translateX: -10 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', delay: 100, duration: 300 }}
          style={styles.sectionHeader}
        >
          <NeonText variant="caption" color="muted" style={styles.sectionLabel}>
            DOCUMENTS
          </NeonText>
        </MotiView>

        {/* Legal Items - Staggered */}
        <View style={styles.listSection}>
          {LEGAL_ITEMS.map((item, index) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', delay: 150 + index * 50, duration: 400 }}
            >
              <Pressable
                style={styles.legalRow}
                onPress={() => handleItemPress(item.route)}
              >
                <View style={styles.rowIcon}>
                  <Icon name={item.icon} size={20} color="primary" />
                </View>
                <View style={styles.rowContent}>
                  <NeonText variant="body" color="white">{item.title}</NeonText>
                  <NeonText variant="caption" color="muted">{item.subtitle}</NeonText>
                </View>
                <ChevronRight size={20} color={colors.neutral[500]} />
              </Pressable>
              {index < LEGAL_ITEMS.length - 1 && <View style={styles.rowDivider} />}
            </MotiView>
          ))}
        </View>

        {/* Footer */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', delay: 400, duration: 400 }}
          style={styles.footer}
        >
          <View style={styles.footerCard}>
            <View style={styles.footerAccent} />
            <NeonText variant="caption" color="muted" style={styles.footerText}>
              Last updated: December 2025
            </NeonText>
            <NeonText variant="caption" color="primary" style={styles.versionText}>
              Version 1.0
            </NeonText>
          </View>
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
  titleUnderline: {
    height: 2,
    width: 40,
    backgroundColor: colors.primary[500],
    borderRadius: 1,
    marginTop: spacing[1],
  },
  subtitle: {
    marginTop: spacing[1],
  },
  sectionHeader: {
    marginTop: spacing[6],
    marginBottom: spacing[2],
  },
  sectionLabel: {
    letterSpacing: 1.5,
    fontSize: 11,
  },
  listSection: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    overflow: 'hidden',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },
  iconEmoji: {
    fontSize: 20,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowArrow: {
    fontSize: 20,
    marginLeft: spacing[2],
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.neutral[200],
    marginLeft: 60,
  },
  footer: {
    marginTop: spacing[6],
    alignItems: 'center',
  },
  footerCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    padding: spacing[3],
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  footerAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary[500],
  },
  footerText: {
    textAlign: 'center',
  },
  versionText: {
    marginTop: spacing[1],
  },
});


